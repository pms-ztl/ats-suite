import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors, getTenantId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /internal/screening?requisitionId=&status=
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.query["requisitionId"] as string | undefined;
    const candidateId = req.query["candidateId"] as string | undefined;
    const status = req.query["status"] as string | undefined;
    const where: any = { tenantId };
    if (requisitionId) where.requisitionId = requisitionId;
    if (candidateId) where.candidateId = candidateId;
    if (status) where.status = status;
    const rows = await prisma.screening.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
    ok(res, rows);
  } catch (err) { next(err); }
});

// GET /internal/screening/audit/:requisitionId
// Phase 5 — compliance / adverse-impact audit for a requisition's screenings.
// Deterministic (no LLM): score distribution + result breakdown + per-candidate
// decisions with evidence, for NYC LL144 / EU AI Act record-keeping. Protected-
// class attributes are intentionally not stored, so this surfaces the decision
// distribution + explainability rather than protected-class impact ratios.
// Declared BEFORE /:id so "audit" isn't captured as a screening id.
router.get("/audit/:requisitionId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.params["requisitionId"] as string;
    const rows = await prisma.screening.findMany({
      where: { tenantId, requisitionId, status: "COMPLETED" },
      select: { candidateId: true, score: true, result: true, reasoning: true, signals: true, completedAt: true },
      orderBy: { score: "desc" },
    });
    const scores = rows
      .map((r) => r.score)
      .filter((s): s is number => typeof s === "number")
      .sort((a, b) => a - b);
    const byResult: Record<string, number> = { PASS: 0, REVIEW: 0, FAIL: 0 };
    for (const r of rows) if (r.result) byResult[r.result] = (byResult[r.result] ?? 0) + 1;
    const n = scores.length;
    const avg = n ? Math.round(scores.reduce((a, b) => a + b, 0) / n) : null;
    const median = n ? (n % 2 ? scores[(n - 1) / 2]! : Math.round((scores[n / 2 - 1]! + scores[n / 2]!) / 2)) : null;
    const passRate = rows.length ? Number((byResult["PASS"]! / rows.length).toFixed(2)) : 0;
    ok(res, {
      requisitionId,
      total: rows.length,
      byResult,
      passRate,
      score: { min: n ? scores[0] : null, max: n ? scores[n - 1] : null, avg, median },
      adverseImpactNote:
        "Protected-class attributes are intentionally not collected, so four-fifths / adverse-impact ratios cannot be computed here. This report provides the auditable decision distribution and per-candidate explainability required for NYC Local Law 144 / EU AI Act record-keeping; run a separate demographic bias audit on aggregated, voluntary self-ID data if available.",
      decisions: rows.map((r) => ({
        candidateId: r.candidateId,
        score: r.score,
        result: r.result,
        reasoning: r.reasoning,
        signals: r.signals,
        decidedAt: r.completedAt,
      })),
    });
  } catch (err) { next(err); }
});

// GET /internal/screening/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const row = await prisma.screening.findFirst({ where: { id, tenantId } });
    if (!row) throw Errors.notFound("Screening");
    ok(res, row);
  } catch (err) { next(err); }
});

export default router;
