import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, getTenantId } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { chatWithCopilot } from '../agents/copilot-agent';

const router = Router();

// All copilot routes require authentication (recruiter role)
router.use(requireAuth);

// ── Input validation ────────────────────────────────────────────────────

const CopilotMessageSchema = z.object({
  query: z.string().min(1, 'Query is required').max(2000, 'Query too long'),
  context: z
    .object({
      activeRequisitionIds: z.array(z.string()).max(20).optional(),
      timeRange: z
        .object({
          start: z.string(),
          end: z.string(),
        })
        .optional(),
    })
    .optional(),
});

// ── POST /api/agents/copilot/message ────────────────────────────────────
// Send a message to the hiring copilot
router.post('/message', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    const tenantId = getTenantId(req);

    // Parse and validate the request body
    const body = CopilotMessageSchema.parse(req.body);

    // Call the agent
    const result = await chatWithCopilot({
      query: body.query,
      tenantId,
      userId: user.id,
      context: body.context,
    });

    return res.status(200).json({
      data: {
        answer: result.response.answer,
        sources: result.response.sources,
        suggestedActions: result.response.suggestedActions ?? [],
        confidence: result.response.confidence,
        followUpQuestions: result.response.followUpQuestions ?? [],
      },
      meta: {
        runId: result.runId,
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
      },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
