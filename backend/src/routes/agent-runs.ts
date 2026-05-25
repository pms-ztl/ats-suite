import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole, getTenantId } from '../middleware/auth';
import { ok, paginated } from '../lib/response';
import { prisma } from '../utils/prisma';
import { resolveHITLCheckpoint, getPendingCheckpoints } from '../agents/hitl';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(requireAuth);

// GET /api/agents/runs — list agent runs for tenant
router.get('/runs', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
    const agentType = req.query.agentType as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {
      tenantId,
      ...(agentType ? { agentType } : {}),
      ...(status ? { status } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.agentRun.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.agentRun.count({ where }),
    ]);

    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

// GET /api/agents/runs/:id — get single run with traces
router.get('/runs/:id', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const run = await prisma.agentRun.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { traces: { orderBy: { stepIndex: 'asc' } } },
    });
    if (!run) throw new AppError('NOT_FOUND', 'Agent run not found', 404);
    return ok(res, run);
  } catch (err) { return next(err); }
});

// GET /api/agents/hitl — list pending HITL checkpoints
router.get('/hitl', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = req.user?.id;
    const assignedToMe = req.query.mine === 'true';
    const checkpoints = await getPendingCheckpoints(tenantId, assignedToMe ? userId : undefined);
    return ok(res, checkpoints);
  } catch (err) { return next(err); }
});

// POST /api/agents/hitl/:id/resolve — resolve a HITL checkpoint
const ResolveCheckpointSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  resolution: z.record(z.string(), z.unknown()).optional(),
  comments: z.string().max(2000).optional(),
});

router.post('/hitl/:id/resolve', requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { status, resolution } = ResolveCheckpointSchema.parse(req.body);

    if (!userId) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    await resolveHITLCheckpoint({
      checkpointId: req.params.id as string,
      resolvedBy: userId,
      status,
      resolution,
    });

    return ok(res, { resolved: true, checkpointId: req.params.id, status });
  } catch (err) { return next(err); }
});

export default router;
