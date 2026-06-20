/**
 * WF6 / Slice F1 — per-user + tenant-default dashboard layouts and per-user UI
 * preferences. Mounted additively under /internal/users (so the gateway proxies
 * /api/me/dashboards/* and /api/tenant/dashboards/* here). Every route is REAL
 * data or an honest 404 (no row) — there is no fabricated default here; the
 * client falls back to its WF5 seeded system default when GET returns 404.
 *
 * RLS: these are pure per-tenant, per-user reads/writes, so they use the OPT-IN
 * prismaRls client (login/saga/super-admin/invite stay on the admin client in
 * users.ts). DashboardLayout + UserUiPrefs are in the identity apply-rls
 * TENANT_TABLES set, so the tenant_isolation policy gives a DB-level backstop.
 *
 * COPY-ON-WRITE: PUT /me/dashboards upserts the CALLER's OWN DashboardLayout row
 * (scope='user', keyed [tenantId,userId,dashboardKey]); it never mutates the
 * tenant-default row. DELETE removes only the user row, reverting to the tenant
 * or system default on the next read.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, Errors, getTenantId, getUserId } from "@cdc-ats/common";
import { DashboardDocumentSchema } from "@cdc-ats/contracts";
// prismaRls = RLS-scoped (tenant context bound by the app's tenantContext mw).
import { prismaRls } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/index.js";

// Validated documents/prefs are structurally typed (open Record index sig),
// which Prisma's InputJsonValue does not accept directly. Casting at the write
// boundary is the standard Prisma-Json reconciliation; values are already
// Zod-validated so the cast is sound.
const asJson = (v: unknown): Prisma.InputJsonValue => v as Prisma.InputJsonValue;

const router = Router();

// A dashboardKey is a short surface identifier (e.g. "home", "screening").
// Constrained so it cannot smuggle anything odd into the unique constraint.
const DashboardKeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_:-]+$/, "dashboardKey must be alphanumeric / _ : -");

// PUT body: the full document to persist plus the human-readable board name.
// The document is validated against the SAME canonical contract the client and
// gateway use, so a malformed grid is rejected at write time (never on read).
const PutMeDashboardSchema = z.object({
  name: z.string().min(1).max(120).default("My dashboard"),
  document: DashboardDocumentSchema,
});

// Admin tenant-default body. isDefault/scope describe how the row is inherited
// by users with no personal override; default to the tenant-default shape.
const PutTenantDashboardSchema = z.object({
  name: z.string().min(1).max(120).default("Team default"),
  document: DashboardDocumentSchema,
  scope: z.string().min(1).max(60).default("tenant_default"),
  isDefault: z.boolean().default(true),
});

// UserUiPrefs — PUT is a full replace of the known fields; PATCH is an RFC7386
// merge (null deletes a key inside the open `prefs` bag; top-level scalars are
// replaced when present, left untouched when absent).
const UiPrefsBodySchema = z.object({
  colorMode: z.enum(["system", "light", "dark"]).optional(),
  density: z.enum(["comfortable", "compact"]).optional(),
  locale: z.string().max(35).nullable().optional(),
  timezone: z.string().max(64).nullable().optional(),
  accentOverride: z.string().max(32).nullable().optional(),
  prefs: z.record(z.string(), z.unknown()).optional(),
});

// Shape a DashboardLayout row for the client. Mirrors what the WF5 read hook
// expects: the document is what useDashboardLayout() runs through migrateDashboard.
function shapeLayout(row: {
  id: string;
  scope: string;
  dashboardKey: string;
  name: string;
  document: unknown;
  schemaVersion: number;
  isDefault: boolean;
  userId: string | null;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    scope: row.scope,
    dashboardKey: row.dashboardKey,
    name: row.name,
    document: row.document,
    schemaVersion: row.schemaVersion,
    isDefault: row.isDefault,
    // Which tier this row represents, so the client can label "Your layout" vs
    // "Team default" without a second call.
    source: row.userId ? "user" : "tenant",
    updatedAt: row.updatedAt.toISOString(),
  };
}

function shapePrefs(row: {
  colorMode: string;
  density: string;
  locale: string | null;
  timezone: string | null;
  accentOverride: string | null;
  prefs: unknown;
  updatedAt: Date;
}) {
  return {
    colorMode: row.colorMode,
    density: row.density,
    locale: row.locale,
    timezone: row.timezone,
    accentOverride: row.accentOverride,
    prefs: (row.prefs ?? {}) as Record<string, unknown>,
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ─── GET /internal/users/me/dashboards/:dashboardKey ──────────────────────
// Resolve the caller's active layout for a surface, precedence:
//   1. the caller's OWN row (userId = caller)         → source:"user"
//   2. the tenant-default row (userId = NULL)         → source:"tenant"
//   3. neither exists                                 → 404 (client uses its
//      WF5 seeded system default; the 404 is the graceful signal, not an error)
router.get(
  "/me/dashboards/:dashboardKey",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const dashboardKey = DashboardKeySchema.parse(req.params["dashboardKey"]);

      const userRow = await prismaRls.dashboardLayout.findUnique({
        where: { tenantId_userId_dashboardKey: { tenantId, userId, dashboardKey } },
      });
      if (userRow) return ok(res, shapeLayout(userRow));

      // Tenant-default row has userId = NULL. The [tenantId,userId,dashboardKey]
      // unique can't be queried with a NULL userId via findUnique cleanly, so
      // use findFirst on the same key components.
      const tenantRow = await prismaRls.dashboardLayout.findFirst({
        where: { tenantId, userId: null, dashboardKey },
        orderBy: { updatedAt: "desc" },
      });
      if (tenantRow) return ok(res, shapeLayout(tenantRow));

      // No persisted layout. 404 is the contract: the client falls back to its
      // seeded default, so an untouched tenant is byte-identical to pre-WF6.
      throw Errors.notFound("Dashboard layout");
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /internal/users/me/dashboards/:dashboardKey ──────────────────────
// COPY-ON-WRITE the caller's personal layout (full-replace the document).
// Upsert on the [tenantId,userId,dashboardKey] unique; scope is always 'user'
// and the tenant-default row is never touched.
router.put(
  "/me/dashboards/:dashboardKey",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const dashboardKey = DashboardKeySchema.parse(req.params["dashboardKey"]);
      const body = PutMeDashboardSchema.parse(req.body);

      const row = await prismaRls.dashboardLayout.upsert({
        where: { tenantId_userId_dashboardKey: { tenantId, userId, dashboardKey } },
        create: {
          tenantId,
          userId,
          scope: "user",
          dashboardKey,
          name: body.name,
          document: asJson(body.document),
          schemaVersion: body.document.schemaVersion,
          isDefault: false,
          updatedBy: userId,
        },
        update: {
          name: body.name,
          document: asJson(body.document),
          schemaVersion: body.document.schemaVersion,
          updatedBy: userId,
        },
      });
      ok(res, shapeLayout(row));
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /internal/users/me/dashboards/:dashboardKey ───────────────────
// Remove the caller's personal override so the next read reverts to the tenant
// or system default. Idempotent — deleting a non-existent override is a no-op.
router.delete(
  "/me/dashboards/:dashboardKey",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const dashboardKey = DashboardKeySchema.parse(req.params["dashboardKey"]);

      await prismaRls.dashboardLayout
        .delete({
          where: { tenantId_userId_dashboardKey: { tenantId, userId, dashboardKey } },
        })
        .catch(() => {
          /* already absent — revert-to-default is the same outcome */
        });
      ok(res, { reverted: true, dashboardKey });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /internal/users/me/preferences ───────────────────────────────────
// The caller's UserUiPrefs row, or a 404 when they have none (client falls back
// to its seeded defaults — colorMode 'system', density 'comfortable').
router.get(
  "/me/preferences",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const row = await prismaRls.userUiPrefs.findUnique({ where: { userId } });
      if (!row || row.tenantId !== tenantId) throw Errors.notFound("UI preferences");
      ok(res, shapePrefs(row));
    } catch (err) {
      next(err);
    }
  }
);

// ─── PATCH /internal/users/me/preferences ─────────────────────────────────
// RFC7386 JSON Merge Patch on the caller's UserUiPrefs (upsert). Top-level
// scalar fields are replaced when present in the body; absent fields are left
// as-is. Inside the open `prefs` bag, a null value DELETES that key (per 7386).
router.patch(
  "/me/preferences",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const patch = UiPrefsBodySchema.parse(req.body ?? {});

      const existing = await prismaRls.userUiPrefs.findUnique({ where: { userId } });

      // Merge the open prefs bag per RFC7386: null deletes, otherwise replace.
      const basePrefs =
        existing && existing.tenantId === tenantId
          ? ((existing.prefs ?? {}) as Record<string, unknown>)
          : {};
      const mergedPrefs = mergePatch(basePrefs, patch.prefs);

      // Build the scalar update from only the keys present in the patch, so an
      // absent field never overwrites a stored value with a default.
      const scalarUpdate: Record<string, unknown> = {};
      if ("colorMode" in patch && patch.colorMode !== undefined) scalarUpdate["colorMode"] = patch.colorMode;
      if ("density" in patch && patch.density !== undefined) scalarUpdate["density"] = patch.density;
      if ("locale" in patch) scalarUpdate["locale"] = patch.locale ?? null;
      if ("timezone" in patch) scalarUpdate["timezone"] = patch.timezone ?? null;
      if ("accentOverride" in patch) scalarUpdate["accentOverride"] = patch.accentOverride ?? null;

      const row = await prismaRls.userUiPrefs.upsert({
        where: { userId },
        create: {
          tenantId,
          userId,
          colorMode: patch.colorMode ?? "system",
          density: patch.density ?? "comfortable",
          locale: patch.locale ?? null,
          timezone: patch.timezone ?? null,
          accentOverride: patch.accentOverride ?? null,
          prefs: asJson(mergedPrefs),
        },
        update: {
          ...scalarUpdate,
          prefs: asJson(mergedPrefs),
        },
      });
      ok(res, shapePrefs(row));
    } catch (err) {
      next(err);
    }
  }
);

// ─── Admin tenant-default routes ──────────────────────────────────────────
// Set/read the tenant-wide default layout a user inherits when they have no
// personal override. Tenant-admin only (ADMIN or SUPER_ADMIN); the per-service
// requireTenantAdmin excludes SUPER_ADMIN, so guard inline here.
function requireTenantAdminOrSuper(req: Request, _res: Response, next: NextFunction) {
  const role = req.user?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return next(Errors.forbidden("Tenant admin role required"));
  }
  next();
}

// GET /internal/users/tenant/dashboards/:dashboardKey — the tenant-default row,
// or 404 when none is configured (the client then uses the system default).
router.get(
  "/tenant/dashboards/:dashboardKey",
  requireTenantAdminOrSuper,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const dashboardKey = DashboardKeySchema.parse(req.params["dashboardKey"]);
      const row = await prismaRls.dashboardLayout.findFirst({
        where: { tenantId, userId: null, dashboardKey },
        orderBy: { updatedAt: "desc" },
      });
      if (!row) throw Errors.notFound("Tenant dashboard layout");
      ok(res, shapeLayout(row));
    } catch (err) {
      next(err);
    }
  }
);

// PUT /internal/users/tenant/dashboards/:dashboardKey — upsert the tenant-default
// row (userId = NULL). Upsert via the [tenantId,userId,dashboardKey] unique; a
// NULL userId is a valid member of that composite, so use the named compound key.
router.put(
  "/tenant/dashboards/:dashboardKey",
  requireTenantAdminOrSuper,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const actorId = getUserId(req);
      const dashboardKey = DashboardKeySchema.parse(req.params["dashboardKey"]);
      const body = PutTenantDashboardSchema.parse(req.body);

      // Look up the existing tenant-default (userId = NULL) explicitly; Prisma's
      // findUnique on a composite with a nullable member is awkward, so we do a
      // findFirst + create/update rather than upsert-on-null-key.
      const existing = await prismaRls.dashboardLayout.findFirst({
        where: { tenantId, userId: null, dashboardKey },
      });

      const row = existing
        ? await prismaRls.dashboardLayout.update({
            where: { id: existing.id },
            data: {
              name: body.name,
              document: asJson(body.document),
              schemaVersion: body.document.schemaVersion,
              scope: body.scope,
              isDefault: body.isDefault,
              updatedBy: actorId,
            },
          })
        : await prismaRls.dashboardLayout.create({
            data: {
              tenantId,
              userId: null,
              scope: body.scope,
              dashboardKey,
              name: body.name,
              document: asJson(body.document),
              schemaVersion: body.document.schemaVersion,
              isDefault: body.isDefault,
              updatedBy: actorId,
            },
          });
      ok(res, shapeLayout(row));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * RFC7386 JSON Merge Patch for the open `prefs` object only.
 * - patch undefined → no change (return the base).
 * - patch member null → delete that key from the result.
 * - patch member object → recurse.
 * - otherwise → replace the value.
 */
function mergePatch(
  base: Record<string, unknown>,
  patch: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (patch === undefined) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) {
      delete out[k];
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      const child = out[k];
      out[k] = mergePatch(
        child && typeof child === "object" && !Array.isArray(child)
          ? (child as Record<string, unknown>)
          : {},
        v as Record<string, unknown>
      );
    } else {
      out[k] = v;
    }
  }
  return out;
}

export default router;
