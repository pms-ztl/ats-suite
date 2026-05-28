/**
 * HITL (Human-In-The-Loop) checkpoint queue.
 *
 *   GET    /internal/hitl                  — list pending + recent for tenant
 *   GET    /internal/hitl/:id              — single
 *   POST   /internal/hitl                  — create (agents post here)
 *   POST   /internal/hitl/:id/decision     — approve / reject
 *   POST   /internal/hitl/:id/assign       — assign to a user
 *
 * Mounted twice via the gateway:
 *   GET /api/agents/hitl            — list (frontend /hitl page uses this)
 *   POST /api/agents/hitl           — create
 *   etc.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { emitNotification } from "../lib/emit.js";

const router = Router();

// ── GET /internal/hitl ────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const status = req.query["status"] as string | undefined;
    const where: any = { tenantId };
    if (status) where.status = status;
    const items = await prisma.hitlCheckpoint.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
    });
    ok(res, items);
  } catch (err) {
    next(err);
  }
});

// ── GET /internal/hitl/:id ────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const item = await prisma.hitlCheckpoint.findFirst({ where: { id, tenantId } });
    if (!item) throw Errors.notFound("HITL checkpoint");
    ok(res, item);
  } catch (err) {
    next(err);
  }
});

// ── POST /internal/hitl ────────────────────────────────────────────────────
// Called by agents (low-confidence outputs) OR by the gateway when an
// agent run trips an automatic guardrail.
const CreateSchema = z.object({
  agentRunId: z.string(),
  agentType: z.string(),
  type: z.enum(["low_confidence", "bias_flag", "sensitive_decision", "policy_review", "manual"]),
  action: z.string().min(3).max(200),
  payload: z.record(z.string(), z.unknown()).optional(),
  slaMinutes: z.number().int().min(15).max(7 * 24 * 60).optional(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  tenantId: z.string().uuid().optional(),    // override (agent calls may not have user context)
});

// Phase 27 F-028-micro-P0: HITL checkpoints are admin-decision affairs.
router.post("/", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Allow tenantId override in body for system-initiated HITL (agents)
    const tenantId = (req.body?.tenantId as string | undefined) ?? getTenantId(req);
    const body = CreateSchema.parse(req.body);

    const checkpoint = await prisma.hitlCheckpoint.create({
      data: {
        tenantId,
        agentRunId: body.agentRunId,
        agentType: body.agentType,
        type: body.type,
        action: body.action,
        payload: (body.payload ?? {}) as any,
        slaMinutes: body.slaMinutes ?? 240,
        assignedTo: body.assignedTo ?? null,
        assignedToName: body.assignedToName ?? null,
      },
    });

    // Fire-and-forget notification to tenant admins
    emitNotification({
      tenantId,
      userId: null,
      type: "SYSTEM",
      title: `Review needed: ${body.action}`,
      body: `${body.agentType} flagged a ${body.type.replace(/_/g, " ")} for human review.`,
      link: `/hitl?id=${checkpoint.id}`,
      metadata: { hitlId: checkpoint.id, agentRunId: body.agentRunId, agentType: body.agentType },
      channels: ["in_app", "slack"],
    }).catch(() => { /* non-fatal */ });

    created(res, checkpoint);
  } catch (err) {
    next(err);
  }
});

// ── POST /internal/hitl/:id/decision ───────────────────────────────────────
const DecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().max(2000).optional(),
});

router.post("/:id/decision", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const id = req.params["id"] as string;
    const body = DecisionSchema.parse(req.body);

    const existing = await prisma.hitlCheckpoint.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("HITL checkpoint");
    if (existing.status !== "PENDING") {
      throw Errors.validation(`Cannot resolve — already ${existing.status}`);
    }

    const updated = await prisma.hitlCheckpoint.update({
      where: { id },
      data: {
        status: body.decision,
        resolvedBy: userId ?? "system",
        resolvedAt: new Date(),
        resolution: { decision: body.decision, comment: body.comment ?? null } as any,
      },
    });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
});

// ── POST /internal/hitl/:id/assign ─────────────────────────────────────────
const AssignSchema = z.object({
  assignedTo: z.string().uuid(),
  assignedToName: z.string().optional(),
});
router.post("/:id/assign", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = AssignSchema.parse(req.body);
    const existing = await prisma.hitlCheckpoint.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("HITL checkpoint");
    const updated = await prisma.hitlCheckpoint.update({
      where: { id },
      data: { assignedTo: body.assignedTo, assignedToName: body.assignedToName ?? null },
    });
    ok(res, updated);
  } catch (err) {
    next(err);
  }
});

export default router;
