import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { ok, paginated, created } from '../lib/response';
import { AppError } from '../middleware/errorHandler';
import rateLimit from 'express-rate-limit';
import logger from '../lib/logger';
import { extractText } from '../lib/document-extractor';

const router = Router();

// Public API rate limiting: stricter than authenticated API
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
});
router.use(publicLimiter);

// ---------------------------------------------------------------------------
// GET /api/public/jobs — list published job postings (no auth required)
// ---------------------------------------------------------------------------
router.get('/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
    const search = req.query.search as string | undefined;
    const department = req.query.department as string | undefined;
    const location = req.query.location as string | undefined;
    const tenantSlug = req.query.tenant as string | undefined;

    const where: any = {
      isPublished: true,
      ...(tenantSlug ? { requisition: { tenant: { slug: tenantSlug } } } : {}),
      ...(department ? { requisition: { department: { contains: department, mode: 'insensitive' as const } } } : {}),
      ...(location ? { requisition: { location: { contains: location, mode: 'insensitive' as const } } } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { requisition: { department: { contains: search, mode: 'insensitive' as const } } },
        ],
      } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          requirements: true,
          publishedAt: true,
          expiresAt: true,
          requisition: {
            select: {
              department: true,
              location: true,
              salaryMin: true,
              salaryMax: true,
              salaryCurrency: true,
              tenant: { select: { name: true, slug: true } },
            },
          },
        },
      }),
      prisma.jobPosting.count({ where }),
    ]);

    // Increment view count (fire-and-forget)
    for (const posting of data) {
      prisma.jobPosting.update({ where: { id: posting.id }, data: { views: { increment: 1 } } }).catch(err => logger.warn({ err, postingId: posting.id }, 'Failed to increment view count'));
    }

    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

// ---------------------------------------------------------------------------
// GET /api/public/jobs/:slug — single job posting by slug
// ---------------------------------------------------------------------------
router.get('/jobs/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posting = await prisma.jobPosting.findFirst({
      where: { slug: req.params.slug as string, isPublished: true },
      include: {
        requisition: {
          select: {
            id: true, title: true, department: true, location: true,
            description: true, salaryMin: true, salaryMax: true,
            salaryCurrency: true, requirements: true,
            tenant: { select: { name: true, slug: true } },
          },
        },
      },
    });

    if (!posting) throw new AppError('NOT_FOUND', 'Job posting not found', 404);

    // Increment views
    prisma.jobPosting.update({ where: { id: posting.id }, data: { views: { increment: 1 } } }).catch(err => logger.warn({ err, postingId: posting.id }, 'Failed to increment view count'));

    return ok(res, posting);
  } catch (err) { return next(err); }
});

// ---------------------------------------------------------------------------
// POST /api/public/apply — submit application (no auth)
// ---------------------------------------------------------------------------
const PublicApplySchema = z.object({
  jobPostingId: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  linkedinUrl: z.string().url().optional(),
  coverLetter: z.string().max(5000).optional(),
  source: z.string().default('CAREER_PAGE'),
});

router.post('/apply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = PublicApplySchema.parse(req.body);

    // Fetch the job posting to get tenant + requisition
    const posting = await prisma.jobPosting.findFirst({
      where: { id: body.jobPostingId, isPublished: true },
      include: { requisition: { select: { id: true, tenantId: true } } },
    });

    if (!posting) throw new AppError('NOT_FOUND', 'Job posting not found or no longer accepting applications', 404);

    const tenantId = posting.requisition.tenantId;
    const requisitionId = posting.requisition.id;

    // Check for existing candidate by email within this tenant
    let candidate = await prisma.candidate.findFirst({
      where: { tenantId, email: body.email.toLowerCase() },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          tenantId,
          email: body.email.toLowerCase(),
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          linkedinUrl: body.linkedinUrl,
          source: body.source,
        },
      });
    }

    // Check for duplicate application
    const existingApp = await prisma.application.findFirst({
      where: { candidateId: candidate.id, requisitionId, tenantId },
    });

    if (existingApp) {
      return ok(res, {
        message: 'You have already applied for this position.',
        applicationId: existingApp.id,
        candidateId: candidate.id,
        alreadyApplied: true,
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        tenantId,
        candidateId: candidate.id,
        requisitionId,
        stage: 'APPLIED',
        status: 'ACTIVE',
        notes: body.coverLetter,
      },
    });

    // Increment application count on posting
    prisma.jobPosting.update({
      where: { id: posting.id },
      data: { applicationCount: { increment: 1 } },
    }).catch(() => {});

    // Audit trail
    prisma.auditTrailEntry.create({
      data: {
        tenantId,
        action: 'PUBLIC_APPLICATION',
        resourceType: 'Application',
        resourceId: application.id,
        actorId: null,
        actorType: 'CANDIDATE',
        after: { candidateEmail: body.email, requisitionId, source: body.source },
      },
    }).catch(() => {});

    logger.info({ candidateId: candidate.id, requisitionId, tenantId }, 'Public application submitted');

    return created(res, {
      applicationId: application.id,
      candidateId: candidate.id,
      status: 'APPLIED',
      message: 'Application submitted successfully. You will receive updates via email.',
    });
  } catch (err) { return next(err); }
});

// ---------------------------------------------------------------------------
// POST /api/public/applications/:applicationId/resume
// ---------------------------------------------------------------------------
// Anonymous resume upload tied to a freshly-created application. Used by the
// candidate-portal apply page right after POST /public/apply succeeds.
// Validates the application id + applicant email so an attacker can't attach
// a resume to someone else's application.

const publicResumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

router.post(
  '/applications/:applicationId/resume',
  publicResumeUpload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const applicationId = req.params.applicationId as string;
      const email = (req.body.email as string | undefined)?.toLowerCase();
      if (!req.file) throw new AppError('VALIDATION_ERROR', 'Resume file is required', 400);
      if (!email) throw new AppError('VALIDATION_ERROR', 'email is required to authorize upload', 400);

      // Look up application + candidate; require email match (acts as a weak
      // but sufficient anonymous proof — the email was just used to apply).
      const application = await prisma.application.findFirst({
        where: { id: applicationId },
        include: { candidate: { select: { id: true, email: true, tenantId: true } } },
      });
      if (!application || !application.candidate) {
        throw new AppError('NOT_FOUND', 'Application not found', 404);
      }
      if (application.candidate.email !== email) {
        throw new AppError('FORBIDDEN', 'Email does not match this application', 403);
      }

      const candidateId = application.candidate.id;
      const tenantId = application.candidate.tenantId;

      const extractedText = await extractText(req.file.buffer, req.file.mimetype);
      if (!extractedText || extractedText.length < 20) {
        throw new AppError('EXTRACTION_FAILED', 'Could not extract text from resume', 400);
      }

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

      // Mark candidate.resumeUrl so the recruiter UI surfaces it.
      await prisma.candidate
        .update({ where: { id: candidateId }, data: { resumeUrl: `internal://resume/${resume.id}` } })
        .catch(() => {});

      logger.info({ candidateId, applicationId, resumeId: resume.id }, 'Public resume upload');

      return created(res, {
        resumeId: resume.id,
        candidateId,
        applicationId,
        filename: req.file.originalname,
        extractedTextLength: extractedText.length,
      });
    } catch (err) { return next(err); }
  },
);

// ---------------------------------------------------------------------------
// GET /api/public/status — check application status by email (no auth)
// ---------------------------------------------------------------------------
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.query.email as string;
    if (!email) throw new AppError('VALIDATION_ERROR', 'Email is required', 400);

    // Find all applications for this email across all tenants
    const candidates = await prisma.candidate.findMany({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        newApplications: {
          select: {
            id: true,
            stage: true,
            status: true,
            appliedAt: true,
            requisition: { select: { title: true, department: true, tenant: { select: { name: true } } } },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });

    const applications = candidates.flatMap(c =>
      c.newApplications.map(a => ({
        applicationId: a.id,
        candidateName: `${c.firstName} ${c.lastName}`,
        role: a.requisition.title,
        department: a.requisition.department,
        company: a.requisition.tenant.name,
        stage: a.stage,
        status: a.status,
        appliedAt: a.appliedAt,
      }))
    );

    return ok(res, { email, applications, totalApplications: applications.length });
  } catch (err) { return next(err); }
});

export default router;
