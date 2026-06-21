/**
 * Job distribution control route (job-service) - WF-G / SLICE G7.
 *
 * Mounted at /internal/job-distribution. The WF-E / E6 gateway proxy forwards
 *   /api/job-distribution/*  ->  job-service /internal/job-distribution/*
 * behind gatewayAuth + requireModule("job-distribution") (PROFESSIONAL+,
 * defaultEnabled:false, failMode:"closed"), stamping the verified JWT claims so the
 * job-service RLS client scopes every read/write to the caller's tenant. A tenant
 * without the module never reaches here (the gateway answers 402/404).
 *
 *   POST   /:jobPostingId  { boards: string[] }
 *       For each requested board, upsert a JobBoardDistribution row at status
 *       PENDING (real-data-or-null: externalPostingId/externalUrl stay null until a
 *       real adapter response) and enqueue a board-post job. Returns 202 + the
 *       per-board rows so the caller can poll GET for the eventual real status.
 *
 *   GET    /:jobPostingId
 *       The REAL per-board distribution rows for this posting:
 *       { board, status, externalUrl, lastSyncedAt, lastError }. No fabrication; a
 *       posting with no distributions returns an empty array.
 *
 *   DELETE /:jobPostingId/:board
 *       Enqueue a board close + mark the row CLOSED. Idempotent (a missing row is a
 *       no-op 404; a re-close coalesces on the queue jobId).
 *
 * == HARD RULES ==============================================================
 *  - REAL data or null: this route only QUEUES intent + records PENDING/CLOSED; the
 *    worker writes the board's real externalPostingId/externalUrl/status. The route
 *    NEVER synthesizes an ACTIVE status or a board id.
 *  - Tenant-scoped via the RLS prisma client (the gateway stamps X-Tenant-Id).
 *  - No auto-reject: this is posting lifecycle only; candidate decisions stay in the
 *    HITL flow downstream.
 *  - No em / en dashes in emitted text.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, Errors, getTenantId, getUserId, requireRole } from "@cdc-ats/common";
// Authenticated, tenant-scoped request path -> the RLS client (the gateway stamps
// the verified tenant; the extension binds app.current_tenant_id per request).
import { prisma } from "../lib/prisma.js";
import { enqueueBoardPost, enqueueBoardClose } from "../lib/board-queue.js";
import { isProviderKey, PROVIDER_KEYS } from "../providers/hiringplatform/index.js";

const router = Router();

// Distribution control is a write surface: admin/recruiter only (GET reads below
// are open to any authenticated tenant user).
const requireDistributor = requireRole("ADMIN", "RECRUITER");

const DistributeSchema = z.object({
  // At least one board; deduped + validated against the registered adapters below.
  boards: z.array(z.string().min(1)).min(1).max(PROVIDER_KEYS.length || 32),
});

/** The honest per-board projection returned to the caller (real columns only). */
function toRowView(row: {
  board: string;
  status: string;
  externalUrl: string | null;
  lastSyncedAt: Date | null;
  lastError: string | null;
}) {
  return {
    board: row.board,
    status: row.status,
    externalUrl: row.externalUrl,
    lastSyncedAt: row.lastSyncedAt,
    lastError: row.lastError,
  };
}

// POST /internal/job-distribution/:jobPostingId  { boards: string[] }
router.post("/:jobPostingId", requireDistributor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const jobPostingId = req.params["jobPostingId"] as string;
    const { boards } = DistributeSchema.parse(req.body);

    // The posting must exist in the caller's tenant (RLS already scopes the read).
    const posting = await prisma.jobPosting.findFirst({
      where: { id: jobPostingId, tenantId },
      select: { id: true },
    });
    if (!posting) throw Errors.notFound("Job posting");

    // Only registered board adapters can be targeted; an unknown key is rejected
    // (never a fabricated distribution row for a board we cannot post to).
    const requested = Array.from(new Set(boards.map((b) => b.trim().toLowerCase()))).filter(Boolean);
    const unknown = requested.filter((b) => !isProviderKey(b));
    if (unknown.length > 0) {
      throw Errors.validation(
        `Unknown job board(s): ${unknown.join(", ")}. Known: ${PROVIDER_KEYS.join(", ") || "(none registered)"}`,
      );
    }

    // Upsert one PENDING row per board + enqueue the board-post job. A re-distribute
    // to a board that already has a row resets it to PENDING for a fresh post and
    // clears the prior error (the worker writes the real status); externalPostingId /
    // externalUrl are LEFT as-is (real-data-or-null - never cleared to a fake, never
    // synthesized here).
    const rows: ReturnType<typeof toRowView>[] = [];
    for (const board of requested) {
      const row = await prisma.jobBoardDistribution.upsert({
        where: { tenantId_jobPostingId_board: { tenantId, jobPostingId, board } },
        create: { tenantId, jobPostingId, board, status: "PENDING" },
        update: { status: "PENDING", lastError: null },
        select: { board: true, status: true, externalUrl: true, lastSyncedAt: true, lastError: true },
      });
      await enqueueBoardPost({ tenantId, jobPostingId, board, userId });
      rows.push(toRowView(row));
    }

    // 202 Accepted: the post is queued; the real per-board status arrives async (poll GET).
    ok(res, { jobPostingId, distributions: rows }, 202);
  } catch (err) { next(err); }
});

// GET /internal/job-distribution/:jobPostingId
router.get("/:jobPostingId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const jobPostingId = req.params["jobPostingId"] as string;

    const posting = await prisma.jobPosting.findFirst({
      where: { id: jobPostingId, tenantId },
      select: { id: true },
    });
    if (!posting) throw Errors.notFound("Job posting");

    // The REAL per-board rows for this posting (RLS-scoped). A posting with no
    // distributions returns an empty array, never a fabricated/sample board.
    const rows = await prisma.jobBoardDistribution.findMany({
      where: { tenantId, jobPostingId },
      orderBy: { board: "asc" },
      select: { board: true, status: true, externalUrl: true, lastSyncedAt: true, lastError: true },
    });
    ok(res, { jobPostingId, distributions: rows.map(toRowView) });
  } catch (err) { next(err); }
});

// DELETE /internal/job-distribution/:jobPostingId/:board
router.delete("/:jobPostingId/:board", requireDistributor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const jobPostingId = req.params["jobPostingId"] as string;
    const board = (req.params["board"] as string).trim().toLowerCase();

    const existing = await prisma.jobBoardDistribution.findFirst({
      where: { tenantId, jobPostingId, board },
      select: { id: true, externalPostingId: true },
    });
    // Idempotent: a missing distribution is an honest 404 (nothing to close).
    if (!existing) throw Errors.notFound("Job board distribution");

    // Enqueue the close so the board-close worker takes the listing down on the
    // board by its real externalPostingId (when one exists); a row that never
    // reached the board (no externalPostingId) still flips to CLOSED locally and the
    // worker no-ops there (nothing to take down).
    await enqueueBoardClose({ tenantId, jobPostingId, board, userId });

    // Mark CLOSED immediately so the UI reflects the intent; the worker confirms the
    // board takedown and updates lastSyncedAt/lastError. externalPostingId/url are
    // LEFT intact (real history of where it lived), never wiped to a fake.
    const updated = await prisma.jobBoardDistribution.update({
      where: { id: existing.id },
      data: { status: "CLOSED" },
      select: { board: true, status: true, externalUrl: true, lastSyncedAt: true, lastError: true },
    });
    ok(res, { jobPostingId, distribution: toRowView(updated) });
  } catch (err) { next(err); }
});

export default router;
