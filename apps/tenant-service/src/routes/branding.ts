/**
 * Phase 20 — tenant self-service branding + retention.
 *
 * Two distinct endpoint groups, kept in one file because they're both
 * tenant-self-serve and share the same auth model (X-Tenant-Id):
 *
 *   /internal/branding/...   colors + logo + tagline + career portal copy
 *   /internal/retention/...  data retention days (with plan-driven floor)
 *
 * Public counterpart (no auth) lives at /internal/public-branding/:slug —
 * candidate-portal hits it via the gateway to whitelabel the public site
 * without exposing tenant ids.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { z } from "zod";
import { ok, Errors, requireTenantAdmin, createLogger, tenantContext } from "@cdc-ats/common";
// Per-tenant self-service (reads/updates the caller's own Tenant row) → RLS.
import { prismaRls as prisma } from "../lib/prisma.js";

const router = Router();

// Structured audit trail for self-service config changes. tenant-service has no
// AuditLog table (the audit store lives in identity/compliance/billing, and
// WF2 must not add a table — WF3 owns db-push), so security-relevant branding
// changes are recorded as structured log lines (event:"audit") that ship to
// the central log sink alongside every other service's audit stream.
const auditLogger = createLogger({ serviceName: "tenant-service" });

// ─── helpers ────────────────────────────────────────────────────────────────
function requireTenantId(req: Request): string {
  const id = req.headers["x-tenant-id"];
  if (typeof id !== "string" || !id) throw Errors.unauthorized("Missing tenant context");
  return id;
}

// Hex color validator — accepts #RGB, #RRGGBB, #RRGGBBAA. Lowercases for
// consistent storage so the frontend color picker doesn't show two values
// that look different but render identical.
const HexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Must be a valid hex color like #1A8FFF")
  .transform((s) => s.toLowerCase());

// URL validator that allows any http(s) URL, including localhost (for dev
// logo uploads served from the file system) and CDN URLs. We don't try
// to fetch the URL — that would block the request and add a failure mode
// the tenant can't fix from here.
const SafeUrl = z.string().url().max(2048);

// Embed origin validator — WF2 groundwork for the embeddable widget. Each
// entry MUST be a bare https ORIGIN ("https://host" or "https://host:port"),
// never a path/query/fragment and never a wildcard. We parse with the URL
// constructor (not a regex) so only genuinely well-formed origins pass, then
// re-serialize via `.origin` so what we persist is canonical (lowercased host,
// default ports dropped) and contains nothing but scheme+host+port. This is
// what later becomes the frame-ancestors / CORS allowlist; storing anything
// looser than a clean origin would widen the trust boundary, so we reject it
// here. Fail-closed at the row level is enforced by the @default([]) — an empty
// list authorizes no one.
const EmbedOrigin = z
  .string()
  .trim()
  .max(2048)
  .transform((raw, ctx) => {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Not a valid URL: ${raw}` });
      return z.NEVER;
    }
    if (parsed.protocol !== "https:") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Embed origin must be https: ${raw}` });
      return z.NEVER;
    }
    // Reject anything beyond scheme+host+port. URL parsing of a bare origin
    // yields pathname "/" with empty search/hash/credentials; anything else
    // means the caller sent a full URL or a wildcard, which is not an origin.
    if (
      (parsed.pathname && parsed.pathname !== "/") ||
      parsed.search ||
      parsed.hash ||
      parsed.username ||
      parsed.password
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Must be a bare origin (no path/query/credentials): ${raw}` });
      return z.NEVER;
    }
    if (!parsed.hostname || parsed.hostname.includes("*")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Wildcard/empty hosts are not allowed: ${raw}` });
      return z.NEVER;
    }
    // `.origin` is the canonical scheme://host[:port] with default ports
    // dropped and host lowercased — exactly what we want to store + compare.
    return parsed.origin;
  });

// The full allowlist: up to 50 unique https origins. Dedupe after
// normalization so "https://A.com" and "https://a.com/" collapse to one row.
const EmbedAllowedOrigins = z
  .array(EmbedOrigin)
  .max(50, "At most 50 embed origins are allowed")
  .transform((origins) => Array.from(new Set(origins)));

// WF3 — tenant default color mode for new users. Constrained to the same three
// values the renderer understands so a tenant can't persist garbage that the UI
// would fall back on silently. "system" follows the user's OS preference.
const ColorMode = z.enum(["system", "light", "dark"]);

// WF3 — tenant-wide dashboard theme tokens. Stored as a flat map of design-token
// name -> string value (CSS custom properties / palette). We validate the SHAPE
// (a plain object whose values are all strings) rather than an exhaustive token
// allowlist so the design system can add tokens without a schema change, while
// still rejecting nested objects/arrays/non-string values that the renderer
// can't apply. {} clears all overrides (back to platform defaults). Bounded to
// 200 keys with reasonable key/value lengths so the column can't be abused as
// arbitrary blob storage.
const ThemeTokenKey = z.string().trim().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/, "Token names may only contain letters, numbers, hyphen, underscore");
const ThemeTokenValue = z.string().max(256);
const DashboardThemeTokens = z
  .record(ThemeTokenKey, ThemeTokenValue)
  .refine((m) => Object.keys(m).length <= 200, "At most 200 theme tokens are allowed");

// WF6-F4 — logo upload. The logo is served to anonymous candidates via the
// public branding endpoint, so it must live at a publicly readable URL. To stay
// dependency-light (tenant-service has no S3 client) and additive (no new infra,
// no new table), we accept a small image in memory and persist it as a data: URL
// in the existing logoUrl column. A data URL renders identically in the dashboard
// chrome and the public portal, survives RLS (it is just a string), and needs no
// static file server. We cap the file hard at 512KB so the column stays small —
// a logo well above a favicon but nowhere near a blob store. Tenants who already
// host their logo on a CDN keep using the URL field on the PUT /branding form;
// this route is only for the in-form file picker.
const LOGO_MAX_BYTES = 512 * 1024;
const LOGO_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LOGO_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    cb(null, LOGO_MIME.has(file.mimetype));
  },
});

// Plan-driven retention floor. GDPR / OFCCP / SHRM all roughly converge
// on "candidate data may be retained 1 year minimum for legal-defense
// purposes after the candidate was rejected." We enforce 180 days as a
// platform floor — below that, the tenant is asked to upgrade.
function retentionFloorDays(plan: string): number {
  switch (plan) {
    case "ENTERPRISE":
      return 30; // they manage their own compliance, we just provide tooling
    case "PROFESSIONAL":
      return 90;
    case "STARTER":
      return 180;
    default:
      return 365;
  }
}
const RETENTION_CEILING_DAYS = 365 * 7; // 7 years — beyond this is fishy

// ─── GET /internal/branding ─────────────────────────────────────────────────
router.get("/branding", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const t = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        website: true,
        brandPrimaryColor: true,
        brandSecondaryColor: true,
        brandAccentColor: true,
        brandTagline: true,
        careerPortalWelcomeMessage: true,
        careerPortalAboutHtml: true,
        careerPortalHeroImageUrl: true,
        embedAllowedOrigins: true,
        defaultColorMode: true,
        dashboardThemeTokens: true,
      },
    });
    if (!t) throw Errors.notFound("Tenant");
    ok(res, t);
  } catch (err) {
    next(err);
  }
});

// ─── PUT /internal/branding ─────────────────────────────────────────────────
// Single endpoint for the whole branding payload. Frontend sends the full
// shape every time so partial states are impossible — if a tenant clears
// their tagline, we get an explicit empty string and persist null.
const BrandingUpdateSchema = z.object({
  logoUrl: z.union([SafeUrl, z.literal(""), z.null()]).optional(),
  website: z.union([SafeUrl, z.literal(""), z.null()]).optional(),
  brandPrimaryColor: z.union([HexColor, z.literal(""), z.null()]).optional(),
  brandSecondaryColor: z.union([HexColor, z.literal(""), z.null()]).optional(),
  brandAccentColor: z.union([HexColor, z.literal(""), z.null()]).optional(),
  brandTagline: z.string().max(160).nullable().optional(),
  careerPortalWelcomeMessage: z.string().max(2000).nullable().optional(),
  careerPortalAboutHtml: z.string().max(10000).nullable().optional(),
  careerPortalHeroImageUrl: z.union([SafeUrl, z.literal(""), z.null()]).optional(),
  // WF2 — the embed allowlist. Optional (only changed when present in the body);
  // when present each entry is URL-parsed + normalized to a clean https origin
  // and the array is deduped. Omitting it leaves the stored list untouched;
  // sending [] explicitly clears it (back to fail-closed: no framing).
  embedAllowedOrigins: EmbedAllowedOrigins.optional(),
  // WF3 — dashboard/theme defaults. Both optional + additive, persisted only
  // when present in the body (omitting leaves the stored value untouched), like
  // every other field here. defaultColorMode is constrained to the renderer's
  // three known values; dashboardThemeTokens is a validated flat string map
  // ({} clears all overrides back to the platform defaults).
  defaultColorMode: ColorMode.optional(),
  dashboardThemeTokens: DashboardThemeTokens.optional(),
});

// Phase 27 F-028-micro-P0: only tenant admins can change branding —
// not recruiters or interviewers, even if logged in.
router.put("/branding", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const body = BrandingUpdateSchema.parse(req.body);

    // The embed allowlist is security-relevant (it widens who may frame the
    // tenant), so capture the prior value to (a) detect a real change for the
    // audit row and (b) avoid a noisy audit entry when the array is unchanged.
    // WF6-F4 — defaultColorMode + dashboardThemeTokens are tenant-wide theming
    // defaults (they change every user's chrome who hasn't set a per-user
    // preference), so they get the same audit treatment: capture the prior value
    // only when the field is present in the body, and emit an audit row only on a
    // genuine change. We fetch all three priors in one query when any is changing.
    const embedChanging = body.embedAllowedOrigins !== undefined;
    const colorModeChanging = body.defaultColorMode !== undefined;
    const themeTokensChanging = body.dashboardThemeTokens !== undefined;
    const needPrior = embedChanging || colorModeChanging || themeTokensChanging;
    const prior = needPrior
      ? await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: {
            embedAllowedOrigins: true,
            defaultColorMode: true,
            dashboardThemeTokens: true,
          },
        })
      : null;

    // Normalize empty strings → null so the DB doesn't store "" as a value
    // (frontend treats null + "" identically; storage shouldn't pretend
    // they're different). Arrays (embedAllowedOrigins) pass through untouched.
    const data: Record<string, any> = {};
    for (const [k, v] of Object.entries(body)) {
      if (v === undefined) continue;
      data[k] = v === "" ? null : v;
    }

    const t = await prisma.tenant.update({
      where: { id: tenantId },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        website: true,
        brandPrimaryColor: true,
        brandSecondaryColor: true,
        brandAccentColor: true,
        brandTagline: true,
        careerPortalWelcomeMessage: true,
        careerPortalAboutHtml: true,
        careerPortalHeroImageUrl: true,
        embedAllowedOrigins: true,
        defaultColorMode: true,
        dashboardThemeTokens: true,
      },
    });

    // Audit row per change — mirrors how every other security-relevant config
    // mutation is recorded. Only emit when the allowlist actually changed.
    if (embedChanging) {
      const before = (prior?.embedAllowedOrigins ?? []).slice().sort();
      const after = (t.embedAllowedOrigins ?? []).slice().sort();
      const changed = before.length !== after.length || before.some((o, i) => o !== after[i]);
      if (changed) {
        auditLogger.info(
          {
            event: "audit",
            action: "branding.embedAllowedOrigins.update",
            tenantId,
            actorUserId: req.headers["x-user-id"] ?? null,
            actorRole: req.headers["x-user-role"] ?? null,
            requestId: req.headers["x-request-id"] ?? null,
            before,
            after,
          },
          "tenant embed allowlist updated",
        );
      }
    }

    // WF6-F4 — audit the tenant-wide theme defaults. defaultColorMode is a small
    // enum so we log before/after directly; dashboardThemeTokens is a map, so we
    // log only the count + the changed key names (not the full map, which could be
    // large) and a boolean cleared flag when the override is reset to {}.
    if (colorModeChanging) {
      const before = prior?.defaultColorMode ?? null;
      const after = t.defaultColorMode ?? null;
      if (before !== after) {
        auditLogger.info(
          {
            event: "audit",
            action: "branding.defaultColorMode.update",
            tenantId,
            actorUserId: req.headers["x-user-id"] ?? null,
            actorRole: req.headers["x-user-role"] ?? null,
            requestId: req.headers["x-request-id"] ?? null,
            before,
            after,
          },
          "tenant default color mode updated",
        );
      }
    }

    if (themeTokensChanging) {
      const beforeMap = (prior?.dashboardThemeTokens ?? {}) as Record<string, unknown>;
      const afterMap = (t.dashboardThemeTokens ?? {}) as Record<string, unknown>;
      const beforeKeys = Object.keys(beforeMap).sort();
      const afterKeys = Object.keys(afterMap).sort();
      // A change is any added/removed key OR any value that differs for a shared key.
      const allKeys = Array.from(new Set([...beforeKeys, ...afterKeys]));
      const changedKeys = allKeys.filter((k) => beforeMap[k] !== afterMap[k]);
      if (changedKeys.length > 0) {
        auditLogger.info(
          {
            event: "audit",
            action: "branding.dashboardThemeTokens.update",
            tenantId,
            actorUserId: req.headers["x-user-id"] ?? null,
            actorRole: req.headers["x-user-role"] ?? null,
            requestId: req.headers["x-request-id"] ?? null,
            beforeTokenCount: beforeKeys.length,
            afterTokenCount: afterKeys.length,
            changedTokenKeys: changedKeys,
            cleared: afterKeys.length === 0,
          },
          "tenant dashboard theme tokens updated",
        );
      }
    }

    ok(res, t);
  } catch (err) {
    next(err);
  }
});

// ─── POST /internal/branding/logo ────────────────────────────────────────────
// Multipart logo upload (field name "logo"). Persists the image as a data: URL in
// logoUrl and returns the updated logoUrl so the form can show it immediately.
// requireTenantAdmin gates it (same as PUT /branding). CRITICAL: multer consumes
// the multipart stream, which DROPS the async-local tenant context the RLS client
// reads, so tenantContext is re-applied AFTER multer — without this the RLS WITH
// CHECK would reject the update (see the resume-service multer/RLS gotcha).
router.post(
  "/branding/logo",
  requireTenantAdmin,
  logoUpload.single("logo"),
  tenantContext, // re-bind tenant after multer drops the async-local context
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = requireTenantId(req);
      if (!req.file) throw Errors.validation("Logo file is required (field name 'logo')");
      // multer's limits already reject > LOGO_MAX_BYTES and the fileFilter rejects
      // non-image mimetypes; this is belt-and-braces in case limits are bypassed.
      if (req.file.size > LOGO_MAX_BYTES) {
        throw Errors.validation(`Logo must be at most ${Math.round(LOGO_MAX_BYTES / 1024)}KB`);
      }
      if (!LOGO_MIME.has(req.file.mimetype)) {
        throw Errors.validation("Logo must be a PNG, JPEG, WEBP, GIF, or SVG image");
      }
      const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      const t = await prisma.tenant.update({
        where: { id: tenantId },
        data: { logoUrl: dataUrl },
        select: { id: true, logoUrl: true },
      });

      auditLogger.info(
        {
          event: "audit",
          action: "branding.logo.upload",
          tenantId,
          actorUserId: req.headers["x-user-id"] ?? null,
          actorRole: req.headers["x-user-role"] ?? null,
          requestId: req.headers["x-request-id"] ?? null,
          mimeType: req.file.mimetype,
          bytes: req.file.size,
        },
        "tenant logo uploaded",
      );

      ok(res, t);
    } catch (err) {
      next(err);
    }
  },
);

// ─── GET /internal/retention ────────────────────────────────────────────────
router.get("/retention", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const t = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { dataRetentionDays: true, plan: true },
    });
    if (!t) throw Errors.notFound("Tenant");

    const floor = retentionFloorDays(t.plan);
    const nextPurgeAt = new Date(Date.now() + t.dataRetentionDays * 24 * 60 * 60 * 1000);
    ok(res, {
      dataRetentionDays: t.dataRetentionDays,
      plan: t.plan,
      floorDays: floor,
      ceilingDays: RETENTION_CEILING_DAYS,
      nextEligibleForPurgeAt: nextPurgeAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /internal/retention ────────────────────────────────────────────────
// Phase 27 F-028-micro-P0: retention policy is compliance-critical, admin-only.
router.put("/retention", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const body = z.object({ dataRetentionDays: z.number().int().min(1).max(RETENTION_CEILING_DAYS) }).parse(req.body);

    const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true } });
    if (!t) throw Errors.notFound("Tenant");

    const floor = retentionFloorDays(t.plan);
    if (body.dataRetentionDays < floor) {
      throw Errors.validation(
        `Retention must be at least ${floor} days on the ${t.plan} plan. Upgrade for shorter retention.`,
      );
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { dataRetentionDays: body.dataRetentionDays },
      select: { dataRetentionDays: true },
    });
    ok(res, { ...updated, floorDays: floor });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/public-branding/:slug ────────────────────────────────────
// No tenant header required — used by the public candidate portal to
// whitelabel /jobs and /jobs/:id/apply. Only safe fields are exposed
// (no plan, no internal ids, no settings).
router.get("/public-branding/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params["slug"] as string;
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) throw Errors.validation("Invalid slug");

    const t = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        logoUrl: true,
        website: true,
        brandPrimaryColor: true,
        brandSecondaryColor: true,
        brandAccentColor: true,
        brandTagline: true,
        careerPortalWelcomeMessage: true,
        careerPortalAboutHtml: true,
        careerPortalHeroImageUrl: true,
      },
    });
    if (!t) throw Errors.notFound("Tenant");
    ok(res, t);
  } catch (err) {
    next(err);
  }
});

export default router;
