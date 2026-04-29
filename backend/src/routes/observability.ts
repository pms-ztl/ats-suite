import { Router } from 'express';
import { ok } from '../lib/response';
import { getSLOStatus } from '../lib/slo';
import { ALERT_CATALOG } from '../lib/alerts';
import { getAIStatus } from '../lib/ai-availability';
import { prisma } from '../utils/prisma';
import { requireAuth, getTenantId } from '../middleware/auth';

const router = Router();

// GET /api/observability/ai-status -- PUBLIC (frontend needs this before login)
router.get('/ai-status', (_req, res) => {
  return ok(res, getAIStatus());
});

// GET /api/observability/slos -- requires auth (exposes internal SLO targets)
router.get('/slos', requireAuth, (_req, res) => {
  return ok(res, getSLOStatus());
});

// GET /api/observability/alerts -- requires auth (exposes alert rules)
router.get('/alerts', requireAuth, (_req, res) => {
  return ok(res, ALERT_CATALOG);
});

// GET /api/observability/agent-costs -- per-tenant per-agent cost summary
router.get('/agent-costs', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    // Aggregate cost data from AgentRun table for the current tenant
    const costSummary = await prisma.agentRun.groupBy({
      by: ['agentType'],
      where: {
        tenantId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // today
        },
      },
      _sum: {
        tokensIn: true,
        tokensOut: true,
        costUsd: true,
      },
      _count: {
        id: true,
      },
    });

    const result = costSummary.map((row) => ({
      agentType: row.agentType,
      totalRuns: row._count.id,
      totalTokensIn: row._sum.tokensIn ?? 0,
      totalTokensOut: row._sum.tokensOut ?? 0,
      totalCostUsd: row._sum.costUsd ? Number(row._sum.costUsd) : 0,
    }));

    return ok(res, { tenantId, date: new Date().toISOString().slice(0, 10), agents: result });
  } catch (err) {
    return next(err);
  }
});

export default router;
