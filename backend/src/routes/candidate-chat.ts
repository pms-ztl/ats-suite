import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, getTenantId } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { chatWithCandidate } from '../agents/candidate-experience-agent';

const router = Router();

// All candidate-chat routes require authentication (CANDIDATE role accepted)
router.use(requireAuth);

// ── Input validation ────────────────────────────────────────────────────

const SendMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .max(50, 'Conversation history too long')
    .default([]),
});

// ── POST /api/candidate-chat/message ────────────────────────────────────
// Send a message to the candidate assistant
router.post('/message', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
    }

    const tenantId = getTenantId(req);

    // Parse and validate the request body
    const body = SendMessageSchema.parse(req.body);

    // Look up the candidate record linked to this user
    const candidate = await (await import('../utils/prisma')).prisma.candidate.findFirst({
      where: { email: user.email, tenantId },
    });

    if (!candidate) {
      throw new AppError('NOT_FOUND', 'No candidate record found for this user', 404);
    }

    // Call the agent
    const result = await chatWithCandidate({
      candidateId: candidate.id,
      message: body.message,
      conversationHistory: body.conversationHistory,
      tenantId,
    });

    return res.status(200).json({
      data: {
        response: result.response,
        suggestedActions: result.suggestedActions ?? [],
        shouldEscalate: result.shouldEscalate,
        escalationReason: result.escalationReason,
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
