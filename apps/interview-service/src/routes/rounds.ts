import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: round config is admin/recruiter — not interviewers.
const requireRoundEditor = requireRole("ADMIN", "RECRUITER");
import { InterviewTypeSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";

const router = Router();

const CreateRoundSchema = z.object({
  requisitionId: z.string().uuid().nullable(),
  name: z.string().min(1).max(120),
  interviewType: InterviewTypeSchema,
  durationMinutes: z.number().int().min(15).max(480).default(60),
  instructions: z.string().optional(),
  autoAdvanceOnPass: z.boolean().default(false),
  defaultPanelistRole: z.string().optional(),
});

// GET /internal/rounds?requisitionId=
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.query["requisitionId"] as string | undefined;
    const where: any = { tenantId };
    if (requisitionId) where.requisitionId = requisitionId;
    const rows = await prisma.interviewRound.findMany({ where, orderBy: { order: "asc" } });
    ok(res, rows);
  } catch (err) { next(err); }
});

// PUT /internal/rounds?requisitionId=  — reconcile the FULL ordered loop for a
// requisition in one transaction: items with a known id are updated (preserving
// their scheduled interviews), new items are created, omitted existing rounds are
// deleted (their interviews are unlinked), and order is set by array position.
const ReconcileItemSchema = CreateRoundSchema.omit({ requisitionId: true }).extend({
  id: z.string().uuid().optional(),
});
const ReconcileSchema = z.object({ rounds: z.array(ReconcileItemSchema).max(50) });

router.put("/", requireRoundEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = (req.query["requisitionId"] as string | undefined) ?? null;
    const { rounds } = ReconcileSchema.parse(req.body);

    const existing = await prisma.interviewRound.findMany({ where: { tenantId, requisitionId }, select: { id: true } });
    const existingIds = new Set(existing.map((e) => e.id));
    const keepIds = new Set(rounds.filter((r) => r.id && existingIds.has(r.id)).map((r) => r.id as string));
    const toDelete = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id);

    await prisma.$transaction(async (tx) => {
      if (toDelete.length) {
        await tx.interview.updateMany({ where: { roundId: { in: toDelete }, tenantId }, data: { roundId: null } });
        await tx.interviewRound.deleteMany({ where: { id: { in: toDelete }, tenantId } });
      }
      let order = 1;
      for (const r of rounds) {
        const data = {
          name: r.name,
          interviewType: r.interviewType,
          durationMinutes: r.durationMinutes,
          instructions: r.instructions ?? null,
          autoAdvanceOnPass: r.autoAdvanceOnPass,
          defaultPanelistRole: r.defaultPanelistRole ?? null,
          order,
        };
        if (r.id && existingIds.has(r.id)) {
          await tx.interviewRound.updateMany({ where: { id: r.id, tenantId }, data });
        } else {
          await tx.interviewRound.create({ data: { tenantId, requisitionId, ...data } });
        }
        order++;
      }
    });

    const fresh = await prisma.interviewRound.findMany({ where: { tenantId, requisitionId }, orderBy: { order: "asc" } });
    ok(res, fresh);
  } catch (err) { next(err); }
});

router.post("/", requireRoundEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateRoundSchema.parse(req.body);
    const lastOrder = await prisma.interviewRound.findFirst({
      where: { tenantId, requisitionId: body.requisitionId },
      orderBy: { order: "desc" }, select: { order: true },
    });
    const order = (lastOrder?.order ?? 0) + 1;
    const round = await prisma.interviewRound.create({
      data: { tenantId, ...body, order, instructions: body.instructions ?? null, defaultPanelistRole: body.defaultPanelistRole ?? null },
    });
    created(res, round);
  } catch (err) { next(err); }
});

// Phase 27 F-027-micro-d: gate + scope mutation by tenantId.
router.patch("/:id", requireRoundEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = CreateRoundSchema.partial().parse(req.body);
    const existing = await prisma.interviewRound.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Round");
    const { count } = await prisma.interviewRound.updateMany({ where: { id, tenantId }, data: body as any });
    if (count === 0) throw Errors.notFound("Round");
    const updated = await prisma.interviewRound.findUnique({ where: { id } });
    ok(res, updated);
  } catch (err) { next(err); }
});

router.delete("/:id", requireRoundEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const existing = await prisma.interviewRound.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Round");
    // Phase 27 F-027-micro-d: deleteMany with tenantId scope on the round
    // itself. The interview.updateMany already scopes by roundId which is
    // tenant-derived, so it's safe.
    await prisma.$transaction([
      prisma.interview.updateMany({ where: { roundId: id, tenantId }, data: { roundId: null } }),
      prisma.interviewRound.deleteMany({ where: { id, tenantId } }),
    ]);
    ok(res, { deleted: true });
  } catch (err) { next(err); }
});

export default router;
