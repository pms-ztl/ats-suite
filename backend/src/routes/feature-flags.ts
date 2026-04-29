import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole, getTenantId } from '../middleware/auth';
import { ok } from '../lib/response';
import { getAllFeatureFlags, setFeatureFlag } from '../lib/feature-flags';
import { AppError } from '../middleware/errorHandler';

const router = Router();
router.use(requireAuth);

// GET /api/features — list all feature flags for tenant
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const flags = await getAllFeatureFlags(tenantId);
    return ok(res, flags);
  } catch (err) { return next(err); }
});

// PATCH /api/features/:name — toggle a feature flag (ADMIN only)
router.patch('/:name', requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') throw new AppError('VALIDATION_ERROR', 'enabled must be boolean', 400);
    await setFeatureFlag(tenantId, req.params.name as string, enabled);
    return ok(res, { name: req.params.name, enabled });
  } catch (err) { return next(err); }
});

export default router;
