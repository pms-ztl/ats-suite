/**
 * WF-C (C3) - tenant developer-customizable UI config.
 *
 * Persists and serves the per-tenant `UiConfig` document (the UI sibling of the
 * dashboard document + module manifest): brand theme tokens, navigation
 * order/visibility, route enablement, copy overrides, surface slot bindings, and
 * coarse feature toggles. The document is the single source of truth the gateway
 * (/api/me/ui-config), the cd-shell chrome, and the embed shell all read so they
 * agree on one shape, validated by the shared Zod contract.
 *
 * STORAGE: the document is stored in the EXISTING Tenant.dashboardThemeTokens
 * (Json) column - no migration (the column already exists; the prior tenant-wide
 * flat-token map in branding.ts and this richer UiConfig document share the same
 * column, and migrateUiConfig() tolerates an empty/legacy value by resolving to
 * the neutral, all-enabled fallback). The tenant-wide rendering defaults
 * defaultColorMode + defaultDashboardByRole live in their own existing columns;
 * we mirror the document's theme.colorMode into defaultColorMode on write so the
 * pre-auth/new-user default and the document stay consistent.
 *
 * SAFETY: every write is validated with UiConfigSchema (.parse) before it is
 * persisted, so every value that can later reach an inline <style> (hex colors,
 * font names, URLs) has already passed the schema's injection-defense regexes by
 * the time it is stored. Reads run migrateUiConfig() so every render path sees a
 * document at the current schema version.
 *
 * FAIL-SOFT: a tenant that never authored a UiConfig (empty {} column) GETs the
 * neutral default document, which renders the chrome byte-identically to the
 * un-customized product. The route never fabricates data.
 *
 * AUTH: reuses the same model as branding/onboarding - readAuthHeaders +
 * tenantContext are mounted on /internal in app.ts (so the RLS client scopes to
 * the caller's own Tenant row), and the PUT is gated by requireTenantAdmin
 * (tenant admins only - not recruiters/interviewers).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, Errors, requireTenantAdmin, createLogger } from "@cdc-ats/common";
import {
  migrateUiConfig,
  CURRENT_UI_CONFIG_SCHEMA_VERSION,
  type UiConfig,
} from "@cdc-ats/contracts";
// Per-tenant self-service (reads/updates the caller's own Tenant row) → RLS,
// exactly like the branding + onboarding routers.
import { prismaRls as prisma } from "../lib/prisma.js";

const router = Router();

// Structured audit trail. tenant-service has no AuditLog table (WF must not add a
// table), so config changes are recorded as structured log lines (event:"audit")
// that ship to the central log sink - identical to branding.ts.
const auditLogger = createLogger({ serviceName: "tenant-service" });

// ─── helpers ────────────────────────────────────────────────────────────────
function requireTenantId(req: Request): string {
  const id = req.headers["x-tenant-id"];
  if (typeof id !== "string" || !id) throw Errors.unauthorized("Missing tenant context");
  return id;
}

// The neutral, all-enabled fallback document. `migrateUiConfig({})` runs every
// schema default, so an empty/absent column resolves to a document that renders
// the chrome byte-identically to the un-customized product (fail-soft).
function defaultUiConfig(): UiConfig {
  return migrateUiConfig({ schemaVersion: CURRENT_UI_CONFIG_SCHEMA_VERSION });
}

// Read the caller tenant's stored document, tolerating an empty/legacy value.
// migrateUiConfig walks the version ladder and applies every default; if the
// stored value is structurally unrecoverable (it should never be - we only ever
// write a validated document) we fail soft to the neutral default rather than
// returning broken chrome.
function readUiConfig(stored: unknown): UiConfig {
  if (stored === null || stored === undefined) return defaultUiConfig();
  // An empty object means "no override yet" → neutral default.
  if (typeof stored === "object" && !Array.isArray(stored) && Object.keys(stored as object).length === 0) {
    return defaultUiConfig();
  }
  try {
    return migrateUiConfig(stored);
  } catch {
    return defaultUiConfig();
  }
}

// ─── GET /internal/ui-config ──────────────────────────────────────────────────
// Returns the caller tenant's UiConfig, migrated to the current schema version.
// Any authenticated tenant user may READ it (the chrome needs it to render);
// only admins may WRITE (PUT below). No data is fabricated - an un-customized
// tenant gets the neutral default document.
router.get("/ui-config", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const t = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        dashboardThemeTokens: true,
        defaultColorMode: true,
        defaultDashboardByRole: true,
      },
    });
    if (!t) throw Errors.notFound("Tenant");

    const config = readUiConfig(t.dashboardThemeTokens);
    ok(res, {
      config,
      // Surface the sibling tenant-wide rendering defaults alongside the document
      // so the caller (gateway /api/me/ui-config → provider) has the full picture
      // in one round-trip without a second branding fetch.
      defaultColorMode: t.defaultColorMode ?? null,
      defaultDashboardByRole: (t.defaultDashboardByRole ?? {}) as Record<string, string>,
    });
  } catch (err) {
    next(err);
  }
});

// PUT body: the full UiConfig document (validated by UiConfigSchema after a
// migrate pass so an older-shaped document is accepted + upgraded), plus the
// optional sibling tenant-wide rendering default `defaultDashboardByRole` (a
// role → dashboardKey map persisted into its own existing column). We do NOT
// take defaultColorMode separately - it is mirrored from the document's
// theme.colorMode so the two never drift.
//
// defaultDashboardByRole keys are constrained to the known role tokens and
// values are short, slug-like dashboard keys so the column can't be abused as
// arbitrary blob storage and the renderer only ever sees values it understands.
const RoleKey = z.enum([
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
  "INTERVIEWER",
  "SUPER_ADMIN",
]);
const DashboardKey = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, "Dashboard keys may only contain letters, numbers, hyphen, underscore");
const DefaultDashboardByRole = z
  .record(RoleKey, DashboardKey)
  .refine((m) => Object.keys(m).length <= 20, "At most 20 role→dashboard mappings are allowed");

const UiConfigPutSchema = z.object({
  // The document is validated by the shared contract; .passthrough() is NOT used
  // - unknown top-level keys are stripped by the schema so nothing unvalidated is
  // persisted. We run migrate on the way in too, so a client may PUT an older
  // schemaVersion and we upgrade + persist the current one.
  config: z.unknown(),
  defaultDashboardByRole: DefaultDashboardByRole.optional(),
});

// ─── PUT /internal/ui-config ──────────────────────────────────────────────────
// Tenant-admin only (same guard as PUT /branding). Validates + migrates the
// document, persists it into the EXISTING dashboardThemeTokens column, mirrors
// the document's color mode into defaultColorMode, optionally updates
// defaultDashboardByRole, and emits an audit log line. No new table, no
// migration. Returns the canonical (re-migrated) document so the caller renders
// exactly what was stored.
router.put("/ui-config", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const body = UiConfigPutSchema.parse(req.body);

    // Validate + migrate the document. migrateUiConfig throws (via Zod) if the
    // document is not a recoverable shape; that surfaces as a 400 to the caller
    // rather than persisting garbage. Every hex/font/url has now passed the
    // contract's injection-defense regexes.
    const config = migrateUiConfig(body.config);

    // Capture priors only for the fields whose change we audit, in one query.
    const prior = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        dashboardThemeTokens: true,
        defaultColorMode: true,
        defaultDashboardByRole: true,
      },
    });
    if (!prior) throw Errors.notFound("Tenant");

    // Mirror the document's color mode into the tenant-wide default so the
    // pre-auth / new-user default and the document never drift.
    const nextColorMode = config.theme.colorMode;

    const data: Record<string, unknown> = {
      // Stored as the persisted document; Prisma serializes the plain object into
      // the Json column. It is the exact shape the schema produced (.parse output).
      dashboardThemeTokens: config as unknown as object,
      defaultColorMode: nextColorMode,
    };
    if (body.defaultDashboardByRole !== undefined) {
      data["defaultDashboardByRole"] = body.defaultDashboardByRole;
    }

    const t = await prisma.tenant.update({
      where: { id: tenantId },
      data,
      select: {
        dashboardThemeTokens: true,
        defaultColorMode: true,
        defaultDashboardByRole: true,
      },
    });

    // ── audit ──────────────────────────────────────────────────────────────
    // The document is large, so we log a structural summary (schema version,
    // brand name, counts) rather than the full blob. defaultColorMode is a small
    // enum, logged before/after. defaultDashboardByRole is logged as its key set.
    const beforeDoc = readUiConfig(prior.dashboardThemeTokens);
    const afterDoc = readUiConfig(t.dashboardThemeTokens);
    auditLogger.info(
      {
        event: "audit",
        action: "ui-config.update",
        tenantId,
        actorUserId: req.headers["x-user-id"] ?? null,
        actorRole: req.headers["x-user-role"] ?? null,
        requestId: req.headers["x-request-id"] ?? null,
        schemaVersion: afterDoc.schemaVersion,
        brandName: afterDoc.brandName ?? null,
        beforeColorMode: prior.defaultColorMode ?? null,
        afterColorMode: t.defaultColorMode ?? null,
        navHiddenCount: afterDoc.nav.hidden.length,
        navOrderCount: afterDoc.nav.order.length,
        routeOverrideCount: Object.keys(afterDoc.routes).length,
        copyOverrideCount: Object.keys(afterDoc.copy).length,
        surfaceCount: Object.keys(afterDoc.surfaces).length,
        featureToggleCount: Object.keys(afterDoc.featureToggles).length,
        // Cheap "did the document actually change" signal for log triage.
        changed: JSON.stringify(beforeDoc) !== JSON.stringify(afterDoc),
        defaultDashboardByRoleKeys:
          body.defaultDashboardByRole !== undefined
            ? Object.keys(body.defaultDashboardByRole)
            : null,
      },
      "tenant ui-config updated",
    );

    ok(res, {
      config: afterDoc,
      defaultColorMode: t.defaultColorMode ?? null,
      defaultDashboardByRole: (t.defaultDashboardByRole ?? {}) as Record<string, string>,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
