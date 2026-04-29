import { Router } from "express";
import { z } from "zod";
import { requireAuth, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, paginated, created, noContent } from "../lib/response";
import { generateOffer } from "../agents/offer-agent";

const router = Router();
router.use(requireAuth);

// GET /requisition/:reqId — decisions for a requisition (must be before /:id)
router.get("/requisition/:reqId", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const decisions = await prisma.hiringDecision.findMany({
      where: { tenantId, requisitionId: req.params.reqId },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, decisions);
  } catch (err) { return next(err); }
});

// GET / — list hiring decisions
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const status = req.query.status as string | undefined;
    const requisitionId = req.query.requisitionId as string | undefined;
    const candidateId = req.query.candidateId as string | undefined;

    const where: any = {
      tenantId,
      ...(status ? { status } : {}),
      ...(requisitionId ? { requisitionId } : {}),
      ...(candidateId ? { candidateId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.hiringDecision.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.hiringDecision.count({ where }),
    ]);

    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

// GET /:id — get single decision
router.get("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const decision = await prisma.hiringDecision.findFirst({ where: { id: req.params.id, tenantId } });
    if (!decision) throw new AppError("NOT_FOUND", "Decision not found", 404);
    return ok(res, decision);
  } catch (err) { return next(err); }
});

// POST / — create hiring decision
const CreateDecisionSchema = z.object({
  requisitionId: z.string().min(1),
  candidateId: z.string().min(1),
  decisionType: z.string().min(1),
  recommendation: z.string().min(1),
  confidence: z.number().min(0).max(1).optional(),
  rationale: z.record(z.string(), z.unknown()).optional(),
  panelConsensus: z.record(z.string(), z.unknown()).optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateDecisionSchema.parse(req.body);
    const decision = await prisma.hiringDecision.create({
      data: {
        tenantId,
        requisitionId: body.requisitionId,
        candidateId: body.candidateId,
        decisionType: body.decisionType,
        recommendation: body.recommendation,
        confidence: body.confidence,
        rationale: (body.rationale ?? {}) as any,
        panelConsensus: (body.panelConsensus ?? {}) as any,
      },
    });
    return created(res, decision);
  } catch (err) { return next(err); }
});

// PATCH /:id — update hiring decision
const UpdateDecisionSchema = z.object({
  recommendation: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  rationale: z.record(z.string(), z.unknown()).optional(),
  panelConsensus: z.record(z.string(), z.unknown()).optional(),
  status: z.string().optional(),
  decidedBy: z.string().optional(),
  decidedAt: z.string().datetime().optional(),
});

router.patch("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.hiringDecision.findFirst({ where: { id: req.params.id, tenantId } });
    if (!existing) throw new AppError("NOT_FOUND", "Decision not found", 404);
    const body = UpdateDecisionSchema.parse(req.body);

    const updateData: any = {};
    if (body.recommendation !== undefined) updateData.recommendation = body.recommendation;
    if (body.confidence !== undefined) updateData.confidence = body.confidence;
    if (body.rationale !== undefined) updateData.rationale = body.rationale;
    if (body.panelConsensus !== undefined) updateData.panelConsensus = body.panelConsensus;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "DECIDED" && !body.decidedAt) updateData.decidedAt = new Date();
    }
    if (body.decidedBy !== undefined) updateData.decidedBy = body.decidedBy;
    if (body.decidedAt !== undefined) updateData.decidedAt = new Date(body.decidedAt);

    const decision = await prisma.hiringDecision.update({ where: { id: req.params.id }, data: updateData });
    return ok(res, decision);
  } catch (err) { return next(err); }
});

// POST /ai-offer — generate AI-drafted compensation offer
const GenerateOfferSchema = z.object({
  candidateId: z.string().min(1),
  requisitionId: z.string().min(1),
  applicationId: z.string().min(1),
  candidateExpectation: z.number().min(0).optional(),
  hiringManagerNotes: z.string().optional(),
});

router.post("/ai-offer", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = (req as any).user?.id || (req as any).userId;
    if (!userId) throw new AppError("UNAUTHORIZED", "User ID required", 401);

    const body = GenerateOfferSchema.parse(req.body);

    const result = await generateOffer({
      candidateId: body.candidateId,
      requisitionId: body.requisitionId,
      applicationId: body.applicationId,
      candidateExpectation: body.candidateExpectation,
      hiringManagerNotes: body.hiringManagerNotes,
      tenantId,
      userId,
    });

    return created(res, {
      offer: result.offer,
      runId: result.runId,
      hitlCheckpointId: result.hitlCheckpointId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    });
  } catch (err) { return next(err); }
});

export default router;
