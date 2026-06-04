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
import { z } from "zod";
import { ok, Errors, requireTenantAdmin } from "@cdc-ats/common";
// Per-tenant self-service (reads/updates the caller's own Tenant row) → RLS.
import { prismaRls as prisma } from "../lib/prisma.js";

const router = Router();

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
});

// Phase 27 F-028-micro-P0: only tenant admins can change branding —
// not recruiters or interviewers, even if logged in.
router.put("/branding", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const body = BrandingUpdateSchema.parse(req.body);

    // Normalize empty strings → null so the DB doesn't store "" as a value
    // (frontend treats null + "" identically; storage shouldn't pretend
    // they're different).
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
      },
    });
    ok(res, t);
  } catch (err) {
    next(err);
  }
});

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
