/**
 * Candidate + application + attachment routes — gateway forwards user headers.
 *
 *   GET    /internal/candidates                    — list (tenant-scoped)
 *   POST   /internal/candidates                    — create candidate
 *   GET    /internal/candidates/:id                — single
 *   PATCH  /internal/candidates/:id                — update
 *   GET    /internal/candidates/:id/applications   — candidate's apps
 *   GET    /internal/candidates/:id/attachments    — application attachments
 *   POST   /internal/candidates/upsert-from-application — used by public apply
 *
 *   GET    /internal/applications                  — list (filter by req/stage)
 *   POST   /internal/applications                  — create
 *   PATCH  /internal/applications/:id              — update stage/status
 *
 *   POST   /internal/attachments                   — record file metadata
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId, requireRole, filterVisibleFields } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: candidate operations need ADMIN/RECRUITER/HIRING_MANAGER.
// upsert-from-application is INTERNAL (called by job-service public apply flow),
// so it's NOT gated here — see comment on that route.
const requireRecruiterOrAdmin = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
import { prisma } from "../lib/prisma.js";

const router = Router();

/**
 * SERVER-SIDE field filter (RBAC HELPER contract). Strips candidate fields the
 * caller's role may not see (recruiter notes, alignment/screening scores,
 * expected/current salary) BEFORE the entity is serialized, so a restricted role
 * (e.g. INTERVIEWER) cannot read them via the raw API even though the frontend
 * also hides them. Non-sensitive fields (name, email, stage, tags, ...) pass
 * through untouched, so the recruiter/admin full view is unchanged — this is
 * purely additive. An unknown/absent role gets the most restrictive view.
 *
 * The caller's role comes from the gateway-verified X-User-Role header
 * (req.user.role, set by readAuthHeaders). Nested applications are left as-is
 * here (they are governed by the same candidate matrix and carry no sensitive
 * candidate fields themselves).
 */
function callerRole(req: Request): string {
  return req.user?.role ?? (req.headers["x-user-role"] as string | undefined) ?? "";
}
function serializeCandidate<T>(entity: T, req: Request): Partial<T> {
  return filterVisibleFields(entity, callerRole(req), "candidate");
}

/**
 * Bucket a set of dates into `weeks` consecutive 7-day windows ending now, and
 * return a per-window count series for a sparkline. Each `n` is a real measured
 * count (a 0 here is genuine — the window exists in the observed range). Weeks
 * run oldest -> newest so the latest point is last.
 */
function buildWeeklyInflow(dates: Array<Date | null | undefined>, weeks: number): { label: string; n: number }[] {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const out: { label: string; n: number; from: number; to: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const to = now - i * weekMs;
    const from = to - weekMs;
    const d = new Date(from);
    out.push({
      label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
      n: 0,
      from,
      to,
    });
  }
  for (const dt of dates) {
    if (!dt) continue;
    const t = dt.getTime();
    if (!isFinite(t)) continue;
    const b = out.find((w) => t >= w.from && t < w.to);
    if (b) b.n++;
  }
  return out.map(({ label, n }) => ({ label, n }));
}

const CreateCandidateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /internal/candidates
//
// Embeds each candidate's applications (most-recently-updated first) so callers
// can read the candidate's CURRENT pipeline stage without a second round-trip.
// The frontend's toCandidate() already expects this shape (it reads
// c.applications?.[0]?.stage) — this was the missing half: without the include
// every candidate here came back with no stage at all and fell back to the
// hardcoded "APPLIED" default, so every list/funnel/board built on this endpoint
// showed 100% Applied regardless of real progress.
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const candidates = await prisma.candidate.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { applications: { orderBy: { updatedAt: "desc" } } },
    });
    // Strip role-restricted candidate fields server-side before responding.
    ok(res, candidates.map((c) => serializeCandidate(c, req)));
  } catch (err) { next(err); }
});

/**
 * Lightweight tenant overview — total candidates + active applications.
 * Used by gateway's /api/platform/unified-overview aggregator.
 */
router.get("/overview", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const [
      totalCandidates,
      activeApplications,
      hiredApplications,
      applicationsByStage,
      hiredApps,
      inflowApps,
      offersByStatus,
    ] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.application.count({ where: { tenantId, status: "ACTIVE" } }),
      prisma.application.count({ where: { tenantId, status: "HIRED" } }),
      prisma.application.groupBy({
        by: ["stage"],
        where: { tenantId },
        _count: { _all: true },
      }),
      // For avgTimeToHire: HIRED apps carry their hire moment in stageUpdatedAt
      // (when status flipped to HIRED). There's no dedicated hiredAt column, so
      // stageUpdatedAt is the truthful proxy for the hire date.
      prisma.application.findMany({
        where: { tenantId, status: "HIRED" },
        select: { appliedAt: true, stageUpdatedAt: true },
      }),
      // For the weeklyInflow sparkline: appliedAt over the last ~8 ISO weeks.
      prisma.application.findMany({
        where: {
          tenantId,
          appliedAt: { gte: new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000) },
        },
        select: { appliedAt: true },
      }),
      // For offerAcceptRate: real Offer lifecycle counts.
      prisma.offer.groupBy({
        by: ["status"],
        where: { tenantId },
        _count: { _all: true },
      }),
    ]);
    const byStage: Record<string, number> = {};
    for (const row of applicationsByStage) byStage[row.stage] = row._count._all;

    // --- avgTimeToHire (days) — mean of (stageUpdatedAt - appliedAt) over HIRED
    // apps that have both timestamps. null when there are no completed hires so
    // the frontend renders an honest empty state rather than a fake 0.
    let avgTimeToHire: number | null = null;
    {
      const durations: number[] = [];
      for (const a of hiredApps) {
        if (!a.appliedAt || !a.stageUpdatedAt) continue;
        const ms = a.stageUpdatedAt.getTime() - a.appliedAt.getTime();
        if (ms >= 0 && isFinite(ms)) durations.push(ms / (24 * 60 * 60 * 1000));
      }
      if (durations.length > 0) {
        const mean = durations.reduce((s, d) => s + d, 0) / durations.length;
        avgTimeToHire = Number(mean.toFixed(1));
      }
    }

    // --- weeklyInflow sparkline — applications per ISO week for the last 8 weeks.
    // Each entry is a real measured count (0 is a genuine measured 0 here, since
    // the window itself exists). The array is empty only when no inflow at all.
    const weeklyInflow = buildWeeklyInflow(inflowApps.map((a) => a.appliedAt), 8);

    // --- offerAcceptRate — accepted / extended. "Extended" = offers that reached
    // a candidate (SENT, ACCEPTED, DECLINED, EXPIRED). DRAFT/PENDING_APPROVAL/
    // APPROVED are not yet in front of the candidate so they don't count.
    const offerCounts: Record<string, number> = {};
    for (const row of offersByStatus) offerCounts[row.status] = row._count._all;
    const offersAccepted = offerCounts["ACCEPTED"] ?? 0;
    const offersExtended =
      (offerCounts["SENT"] ?? 0) +
      (offerCounts["ACCEPTED"] ?? 0) +
      (offerCounts["DECLINED"] ?? 0) +
      (offerCounts["EXPIRED"] ?? 0);
    const offerAcceptRate =
      offersExtended > 0 ? Number(((offersAccepted / offersExtended) * 100).toFixed(1)) : null;

    ok(res, {
      totalCandidates,
      activeCandidates: activeApplications, // alias for dashboard
      activeApplications,
      hiredApplications,
      applicationsByStage: byStage,
      // --- additive real KPIs (null/empty = honest "no data", never a fake 0) ---
      avgTimeToHire,        // number (days) | null
      weeklyInflow,         // [{ label, n }] real per-ISO-week applied counts (last 8)
      offerAcceptRate,      // number (percent) | null
      offersAccepted,       // raw count
      offersExtended,       // raw count (denominator)
    });
  } catch (err) { next(err); }
});

// GET /internal/candidates/platform-stats — SUPER_ADMIN cross-tenant counts.
// Returns { total, byTenant } for the super-admin dashboard. Declared before
// /:id so the literal path isn't captured as a candidate id.
router.get("/platform-stats", requireRole("SUPER_ADMIN"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const grouped = await prisma.candidate.groupBy({ by: ["tenantId"], _count: { _all: true } });
    const byTenant: Record<string, number> = {};
    let total = 0;
    for (const r of grouped) {
      byTenant[r.tenantId] = r._count._all;
      total += r._count._all;
    }
    ok(res, { total, byTenant });
  } catch (err) { next(err); }
});

// POST /internal/candidates
router.post("/", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateCandidateSchema.parse(req.body);
    const existing = await prisma.candidate.findFirst({
      where: { tenantId, email: body.email.toLowerCase() },
    });
    if (existing) throw Errors.conflict("Candidate with this email already exists");
    const candidate = await prisma.candidate.create({
      data: { tenantId, ...body, email: body.email.toLowerCase() },
    });
    created(res, candidate);
  } catch (err) { next(err); }
});

// POST /internal/candidates/upsert-from-application — used by job-service when
// a public apply comes in. Idempotent on (tenantId, email).
// NOT requireRole-guarded: called from job-service's public apply handler
// where the original requester is an anonymous candidate (no JWT). The
// X-User-Role header in this case is the synthetic "system" role set by
// job-service. Trusted via inter-service network policy.
router.post("/upsert-from-application", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateCandidateSchema.parse(req.body);
    const candidate = await prisma.candidate.upsert({
      where: { tenantId_email: { tenantId, email: body.email.toLowerCase() } },
      create: { tenantId, ...body, email: body.email.toLowerCase(), source: body.source ?? "PUBLIC_APPLY" },
      update: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone ?? undefined,
        linkedinUrl: body.linkedinUrl ?? undefined,
      },
    });
    ok(res, candidate);
  } catch (err) { next(err); }
});

// POST /internal/candidates/check-existing — resume-service's bulk archive
// review screen uses this to flag detected emails that already belong to a
// candidate in this tenant (duplicate detection for the ZIP import pipeline).
// NOT requireRole-guarded: same reasoning as upsert-from-application above —
// internal service-to-service call (resume-service -> candidate-service),
// trusted via inter-service network policy, not user-facing.
const CheckExistingSchema = z.object({ emails: z.array(z.string()) });
router.post("/check-existing", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { emails } = CheckExistingSchema.parse(req.body);
    const lowered = emails.map((e) => e.toLowerCase());
    const existing = await prisma.candidate.findMany({
      where: { tenantId, email: { in: lowered } },
      select: { id: true, email: true },
    });
    ok(res, { existing: existing.map((c) => ({ email: c.email.toLowerCase(), candidateId: c.id })) });
  } catch (err) { next(err); }
});

// GET /internal/candidates/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const candidate = await prisma.candidate.findFirst({
      where: { id, tenantId },
      include: { applications: true },
    });
    if (!candidate) throw Errors.notFound("Candidate");
    // Strip role-restricted candidate fields server-side before responding.
    ok(res, serializeCandidate(candidate, req));
  } catch (err) { next(err); }
});

// GET /internal/candidates/:id/applications
router.get("/:id/applications", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const apps = await prisma.application.findMany({
      where: { candidateId: id, tenantId },
      orderBy: { createdAt: "desc" },
    });
    ok(res, apps);
  } catch (err) { next(err); }
});

// GET /internal/candidates/:id/attachments
router.get("/:id/attachments", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const apps = await prisma.application.findMany({
      where: { candidateId: id, tenantId }, select: { id: true, requisitionId: true },
    });
    const appIds = apps.map((a) => a.id);
    const attachments = appIds.length === 0 ? [] : await prisma.applicationAttachment.findMany({
      where: { applicationId: { in: appIds }, tenantId },
      orderBy: { createdAt: "desc" },
    });
    const appMap = new Map(apps.map((a) => [a.id, a]));
    ok(res, attachments.map((a) => ({
      ...a,
      requisitionId: appMap.get(a.applicationId)?.requisitionId ?? null,
    })));
  } catch (err) { next(err); }
});

// PATCH /internal/candidates/:id
const UpdateCandidateSchema = CreateCandidateSchema.partial().extend({
  resumeUrl: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
// Phase 27 F-027-micro-b + F-028-micro-P1: gate + scope mutation by tenantId.
router.patch("/:id", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = UpdateCandidateSchema.parse(req.body);
    const existing = await prisma.candidate.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Candidate");
    const { count } = await prisma.candidate.updateMany({ where: { id, tenantId }, data: body });
    if (count === 0) throw Errors.notFound("Candidate");
    const updated = await prisma.candidate.findUnique({ where: { id } });
    ok(res, serializeCandidate(updated, req));
  } catch (err) { next(err); }
});

// Notes on a candidate — team-only annotations, not visible to the candidate
// themselves. The CandidateNote table has existed since the schema was authored;
// this is the first route that actually reads/writes it (the profile page's note
// composer previously only held typed notes in local React state, discarding them
// on refresh — this makes them real).
const requireNoteAccess = requireRole("ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER");
const CreateNoteSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  isPrivate: z.boolean().optional(),
});

function serializeNote(n: { id: string; authorUserId: string; content: string; isPrivate: boolean; createdAt: Date }, req: Request) {
  // No cross-service user directory lookup here (candidate-service does not own
  // identity data) — only the author's own request carries their email, so a
  // note authored by anyone else surfaces no fabricated name, just the fact that
  // it is a teammate's note. The frontend renders authorUserId === current user
  // as "You"; everyone else reads as "Teammate".
  const mine = n.authorUserId === getUserId(req);
  return {
    id: n.id, content: n.content, isPrivate: n.isPrivate, createdAt: n.createdAt,
    authorUserId: n.authorUserId,
    authorEmail: mine ? (req.user?.email ?? null) : null,
    mine,
  };
}

// GET /internal/candidates/:id/notes
router.get("/:id/notes", requireNoteAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const exists = await prisma.candidate.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!exists) throw Errors.notFound("Candidate");
    const notes = await prisma.candidateNote.findMany({
      where: { candidateId: id, tenantId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    ok(res, notes.map((n) => serializeNote(n, req)));
  } catch (err) { next(err); }
});

// POST /internal/candidates/:id/notes
router.post("/:id/notes", requireNoteAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = CreateNoteSchema.parse(req.body);
    const exists = await prisma.candidate.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!exists) throw Errors.notFound("Candidate");
    const note = await prisma.candidateNote.create({
      data: {
        tenantId, candidateId: id,
        authorUserId: getUserId(req),
        content: body.content,
        isPrivate: body.isPrivate ?? true,
      },
    });
    created(res, serializeNote(note, req));
  } catch (err) { next(err); }
});

// DELETE /internal/candidates/:id/notes/:noteId
// Own-note delete (the everyday "undo what I just wrote" case) OR an ADMIN
// override — nobody else can remove a teammate's note. requireNoteAccess only
// gates WHO may touch notes at all; the ownership check below is what decides
// WHICH notes a given caller may delete.
router.delete("/:id/notes/:noteId", requireNoteAccess, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const noteId = req.params["noteId"] as string;
    const note = await prisma.candidateNote.findFirst({ where: { id: noteId, candidateId: id, tenantId } });
    if (!note) throw Errors.notFound("Note");
    const isOwner = note.authorUserId === getUserId(req);
    const isAdmin = req.user?.role === "ADMIN";
    if (!isOwner && !isAdmin) throw Errors.forbidden("You can only delete your own notes");
    await prisma.candidateNote.delete({ where: { id: noteId } });
    ok(res, { deleted: true, id: noteId });
  } catch (err) { next(err); }
});

export default router;
