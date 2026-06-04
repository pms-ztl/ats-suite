/**
 * Phase 29 — first-run onboarding wizard state.
 *
 * The frontend shows a 5-step wizard the first time a tenant admin lands on
 * the dashboard. State is per-tenant (not per-user) — once one admin has
 * gone through it, other admins on the same tenant don't see it again.
 *
 * Steps (frontend-defined ids):
 *   1. branding     — set primary color + (optional) logo
 *   2. team         — invite at least one teammate
 *   3. requisition  — create the first req
 *   4. rounds       — configure interview rounds on that req
 *   5. share        — copy the public job link
 *
 * Each step write is idempotent — re-marking a step already completed just
 * keeps the original timestamp so we don't lose the original "first done at"
 * audit trail.
 *
 * Dismissal is sticky: once dismissed, the wizard never auto-pops again
 * (admin can still re-open it manually via Settings → Reset onboarding).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, Errors, requireTenantAdmin } from "@cdc-ats/common";
// Per-tenant self-service (reads/updates the caller's own Tenant row) → RLS.
import { prismaRls as prisma } from "../lib/prisma.js";

const router = Router();

// All known step ids — keep in sync with the frontend wizard. We don't enforce
// completion order on the backend (user could complete in any order, e.g. via
// deep links into other pages), but the frontend walks them in this order.
const STEP_IDS = ["branding", "team", "requisition", "rounds", "share"] as const;
type StepId = (typeof STEP_IDS)[number];

const StepIdSchema = z.enum(STEP_IDS);

function requireTenantId(req: Request): string {
  const id = req.headers["x-tenant-id"];
  if (typeof id !== "string" || !id) throw Errors.unauthorized("Missing tenant context");
  return id;
}

// Normalize the JSON column into a typed map so the frontend always gets the
// full shape (missing keys = false).
function normalizeSteps(raw: unknown): Record<StepId, string | null> {
  const obj = (raw && typeof raw === "object") ? (raw as Record<string, unknown>) : {};
  const out: Record<StepId, string | null> = {
    branding: null, team: null, requisition: null, rounds: null, share: null,
  };
  for (const id of STEP_IDS) {
    const v = obj[id];
    out[id] = typeof v === "string" ? v : null;
  }
  return out;
}

// ─── GET /internal/onboarding ─────────────────────────────────────────────
// Returns the current onboarding state for the caller's tenant. Frontend
// dashboards hit this on mount to decide whether to pop the wizard.
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const t = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        onboardingSteps: true,
        onboardingDismissedAt: true,
        onboardingCompletedAt: true,
        createdAt: true,
      },
    });
    if (!t) throw Errors.notFound("Tenant");

    const steps = normalizeSteps(t.onboardingSteps);
    const completedCount = STEP_IDS.filter((id) => steps[id]).length;
    const nextStep: StepId | null =
      STEP_IDS.find((id) => !steps[id]) ?? null;

    // Wizard should auto-pop when:
    //   - not dismissed AND
    //   - not completed AND
    //   - at least one step still pending
    // Dashboard always renders the "Resume onboarding" chip if shouldShow is
    // false but the user hasn't done all 5 steps yet — they can click to
    // re-open the wizard.
    const shouldShow =
      !t.onboardingDismissedAt && !t.onboardingCompletedAt && nextStep !== null;

    ok(res, {
      steps,
      stepIds: STEP_IDS,
      completedCount,
      totalSteps: STEP_IDS.length,
      nextStep,
      dismissedAt: t.onboardingDismissedAt?.toISOString() ?? null,
      completedAt: t.onboardingCompletedAt?.toISOString() ?? null,
      tenantCreatedAt: t.createdAt.toISOString(),
      shouldShow,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /internal/onboarding/steps/:id/complete ─────────────────────────
// Marks one step as done. If this was the last step, also stamps
// onboardingCompletedAt so the wizard never re-opens. Tenant-admin only:
// non-admins shouldn't be flipping state for the whole tenant.
router.post(
  "/steps/:id/complete",
  requireTenantAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = requireTenantId(req);
      const stepId = StepIdSchema.parse(req.params["id"]);

      const t = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { onboardingSteps: true, onboardingCompletedAt: true },
      });
      if (!t) throw Errors.notFound("Tenant");

      const steps = normalizeSteps(t.onboardingSteps);
      // Idempotent — preserve the original completion timestamp.
      if (!steps[stepId]) {
        steps[stepId] = new Date().toISOString();
      }

      const allDone = STEP_IDS.every((id) => steps[id]);
      const completedAt =
        allDone && !t.onboardingCompletedAt ? new Date() : t.onboardingCompletedAt;

      // F-027-micro: scope mutation to tenantId. tenant.id IS the tenantId, so
      // it's intrinsically scoped, but stick to updateMany for the audit pattern.
      const { count } = await prisma.tenant.updateMany({
        where: { id: tenantId },
        data: {
          onboardingSteps: steps as any,
          ...(completedAt ? { onboardingCompletedAt: completedAt } : {}),
        },
      });
      if (count === 0) throw Errors.notFound("Tenant");

      ok(res, {
        steps,
        completedCount: STEP_IDS.filter((id) => steps[id]).length,
        totalSteps: STEP_IDS.length,
        completedAt: completedAt?.toISOString() ?? null,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /internal/onboarding/dismiss ────────────────────────────────────
// "Maybe later" / "Skip" — stops the auto-popup. Frontend can still let the
// user re-open the wizard via Settings.
router.post(
  "/dismiss",
  requireTenantAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = requireTenantId(req);
      const { count } = await prisma.tenant.updateMany({
        where: { id: tenantId },
        data: { onboardingDismissedAt: new Date() },
      });
      if (count === 0) throw Errors.notFound("Tenant");
      ok(res, { dismissedAt: new Date().toISOString() });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /internal/onboarding/reset ──────────────────────────────────────
// Clears dismissedAt + completedAt so the wizard auto-pops again. Doesn't
// clear step timestamps — the user is opting back in to finish, not redo.
// Use case: tenant admin onboarded once, now wants to walk a new colleague
// through the flow.
router.post(
  "/reset",
  requireTenantAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = requireTenantId(req);
      const { count } = await prisma.tenant.updateMany({
        where: { id: tenantId },
        data: { onboardingDismissedAt: null, onboardingCompletedAt: null },
      });
      if (count === 0) throw Errors.notFound("Tenant");
      ok(res, { reset: true });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
