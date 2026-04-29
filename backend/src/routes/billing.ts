import { Router } from 'express';
import { z, ZodError } from 'zod';
import { requireAuth, getTenantId } from '../middleware/auth';
import { ok } from '../lib/response';
import { getTenantCostSummary, checkTenantBudget, isAgentEnabled, setAgentEnabled } from '../lib/billing';
import { AppError } from '../middleware/errorHandler';

const ToggleAgentSchema = z.object({
  enabled: z.boolean(),
});

const router = Router();
router.use(requireAuth);

// GET /api/billing/usage -- get cost summary
router.get('/usage', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const days = parseInt(req.query.days as string) || 1;
    const summary = await getTenantCostSummary(tenantId, Math.min(days, 90));
    return ok(res, summary);
  } catch (err) { return next(err); }
});

// GET /api/billing/budget -- check current budget status
router.get('/budget', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const budget = await checkTenantBudget(tenantId);
    return ok(res, budget);
  } catch (err) { return next(err); }
});

// GET /api/billing/agents -- list agent enable/disable status
router.get('/agents', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const agents = ['resume-parser', 'candidate-screener', 'jd-author', 'interview-scheduler', 'candidate-assistant'];
    const status = await Promise.all(agents.map(async (a) => ({
      agentType: a,
      enabled: await isAgentEnabled(tenantId, a),
    })));
    return ok(res, status);
  } catch (err) { return next(err); }
});

// POST /api/billing/agents/:type/toggle -- enable/disable agent (kill switch)
router.post('/agents/:type/toggle', async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const agentType = req.params.type as string;
    const parsed = ToggleAgentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.issues.map(e => e.message).join(', ') } });
      return;
    }
    const { enabled } = parsed.data;
    await setAgentEnabled(tenantId, agentType, enabled);
    return ok(res, { agentType, enabled });
  } catch (err) { return next(err); }
});

export default router;
