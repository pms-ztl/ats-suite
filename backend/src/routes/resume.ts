import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { requireAuth, getTenantId } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../utils/prisma';
import { ok, created } from '../lib/response';
import { extractText } from '../lib/document-extractor';
import { generateEmbedding, storeEmbedding } from '../lib/embeddings';
import { parseResume } from '../agents/resume-parser';
import logger from '../lib/logger';

const router = Router();
router.use(requireAuth);

// Configure multer for file upload (in-memory, 10MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// POST /api/resume/upload — upload and process a resume
router.post(
  '/upload',
  upload.single('resume'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const candidateId = req.body.candidateId;

      if (!candidateId)
        throw new AppError('VALIDATION_ERROR', 'candidateId is required', 400);
      if (!req.file)
        throw new AppError('VALIDATION_ERROR', 'Resume file is required', 400);

      // 1. Extract text from file
      const extractedText = await extractText(req.file.buffer, req.file.mimetype);

      if (!extractedText || extractedText.length < 50) {
        throw new AppError(
          'EXTRACTION_FAILED',
          'Could not extract sufficient text from resume',
          400,
        );
      }

      // 2. Store the resume record
      const resume = await prisma.resume.upsert({
        where: { candidateId },
        update: {
          originalFilename: req.file.originalname,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          extractedText,
          parseStatus: 'EXTRACTED',
          updatedAt: new Date(),
        },
        create: {
          candidateId,
          tenantId,
          originalFilename: req.file.originalname,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          extractedText,
          parseStatus: 'EXTRACTED',
        },
      });

      // 3. Generate embedding (fire-and-forget -- don't block response)
      generateEmbedding(extractedText)
        .then(async (embedding) => {
          if (embedding) {
            await storeEmbedding({
              tenantId,
              entityType: 'candidate_resume',
              entityId: candidateId,
              chunkIndex: 0,
              chunkText: extractedText.slice(0, 2000),
              embedding,
            });

            await prisma.resume.update({
              where: { id: resume.id },
              data: { parseStatus: 'EMBEDDED' },
            });

            logger.info(
              { candidateId, resumeId: resume.id },
              'Resume embedded successfully',
            );
          }
        })
        .catch((err) =>
          logger.error({ err, candidateId }, 'Resume embedding failed'),
        );

      // 4. Update candidate's resumeUrl field
      await prisma.candidate
        .update({
          where: { id: candidateId },
          data: { resumeUrl: `internal://resume/${resume.id}` },
        })
        .catch(() => {});

      // 5. Trigger auto-parse pipeline (upload -> parse -> screen)
      // Preferred path: enqueue via BullMQ when Redis is configured (production).
      // Fallback path: inline parse via setImmediate when no Redis (dev / single-instance).
      // Either way, the response returns immediately — parsing happens async.
      const userId = (req as any).user?.id || 'system';
      let parseMode: 'queued' | 'inline' | 'skipped' = 'skipped';

      if (process.env.REDIS_URL) {
        parseMode = 'queued';
        import('../lib/queue').then(({ enqueueResumeParse }) =>
          enqueueResumeParse({ candidateId, tenantId, userId, resumeId: resume.id })
        ).catch(err => logger.error({ err, candidateId }, 'Failed to enqueue resume parse'));
      } else if (process.env.ANTHROPIC_API_KEY) {
        // No Redis but LLM is configured — fall back to inline async parse.
        // Return response first, then process in background via setImmediate.
        parseMode = 'inline';
        setImmediate(async () => {
          try {
            const { parseResume } = await import('../agents/resume-parser');
            const result = await parseResume({
              candidateId,
              tenantId,
              userId,
              resumeText: extractedText,
            });
            logger.info({ candidateId, runId: result.runId, mode: 'inline' }, 'Inline resume parse completed');

            // Auto-trigger screening for active applications (mirrors worker behavior)
            const { prisma: p } = await import('../utils/prisma');
            const apps = await p.application.findMany({
              where: { candidateId, tenantId, status: 'ACTIVE' },
              select: { requisitionId: true },
            }).catch(() => []);
            for (const app of apps) {
              try {
                const { screenCandidate } = await import('../agents/screening-agent');
                const updatedResume = await p.resume.findFirst({ where: { id: resume.id } });
                if (updatedResume?.extractedText) {
                  await screenCandidate({
                    candidateId,
                    requisitionId: app.requisitionId,
                    tenantId,
                    userId,
                    resumeText: updatedResume.extractedText,
                  });
                }
              } catch (err) {
                logger.error({ err, candidateId, requisitionId: app.requisitionId }, 'Inline screening failed');
              }
            }
          } catch (err) {
            logger.error({ err, candidateId, resumeId: resume.id }, 'Inline resume parse failed');
          }
        });
      } else {
        logger.warn({ candidateId, resumeId: resume.id },
          'Resume parse skipped: neither REDIS_URL (queue mode) nor ANTHROPIC_API_KEY (inline mode) is configured');
      }

      return created(res, {
        resumeId: resume.id,
        candidateId,
        filename: req.file.originalname,
        extractedTextLength: extractedText.length,
        parseStatus: 'EXTRACTED',
        parseMode,
        embeddingStatus: process.env.OPENAI_API_KEY ? 'PROCESSING' : 'SKIPPED',
      });
    } catch (err) {
      return next(err);
    }
  },
);

// POST /api/resume/parse — trigger AI parsing of an uploaded resume
router.post('/parse', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = (req as any).user?.id || 'system';
    const { candidateId } = req.body;

    if (!candidateId) throw new AppError('VALIDATION_ERROR', 'candidateId is required', 400);

    // Fetch the resume text
    const resume = await prisma.resume.findFirst({
      where: { candidateId, tenantId },
    });

    if (!resume) throw new AppError('NOT_FOUND', 'Resume not found — upload first', 404);
    if (!resume.extractedText) throw new AppError('PRECONDITION_FAILED', 'Resume text not yet extracted', 412);

    // Run the AI parser
    const result = await parseResume({
      candidateId,
      tenantId,
      userId,
      resumeText: resume.extractedText,
    });

    return ok(res, {
      parsed: result.parsed,
      runId: result.runId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
      piiRedactions: result.piiRedactions,
    });
  } catch (err) { return next(err); }
});

// GET /api/resume/:candidateId — get resume for a candidate
router.get(
  '/:candidateId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const candidateId = req.params.candidateId as string;
      const resume = await prisma.resume.findFirst({
        where: { candidateId, tenantId },
      });
      if (!resume) throw new AppError('NOT_FOUND', 'Resume not found', 404);
      return ok(res, resume);
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
