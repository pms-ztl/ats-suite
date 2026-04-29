import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole, getTenantId } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { ok, created, paginated } from '../lib/response';
import { AppError } from '../middleware/errorHandler';
import logger from '../lib/logger';
import { sendForESign } from '../lib/esign';

const router = Router();
router.use(requireAuth);

// GET /api/offers — list offers for tenant
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize as string) || 20);
    const status = req.query.status as string | undefined;

    const where: any = { tenantId, ...(status ? { status } : {}) };
    const [data, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          application: {
            include: {
              candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
              requisition: { select: { id: true, title: true, department: true } },
            },
          },
          approvals: { orderBy: { orderIndex: 'asc' } },
        },
      }),
      prisma.offer.count({ where }),
    ]);
    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

// GET /api/offers/:id — single offer with approvals
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: {
        application: {
          include: {
            candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
            requisition: { select: { id: true, title: true, department: true } },
          },
        },
        approvals: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!offer) throw new AppError('NOT_FOUND', 'Offer not found', 404);
    return ok(res, offer);
  } catch (err) { return next(err); }
});

// POST /api/offers — create offer manually (not via AI agent)
const CreateOfferSchema = z.object({
  requisitionId: z.string(),
  candidateId: z.string(),
  applicationId: z.string().optional(),
  salaryAmount: z.number().min(0),
  salaryCurrency: z.string().optional().default('USD'),
  equity: z.any().optional(),
  benefits: z.any().optional(),
  startDate: z.string().optional(),
  expiresAt: z.string().optional(),
});

router.post('/', requireRole('ADMIN', 'RECRUITER', 'HIRING_MANAGER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateOfferSchema.parse(req.body);

    // Verify requisition exists and belongs to tenant
    const requisition = await prisma.requisition.findFirst({
      where: { id: body.requisitionId, tenantId },
    });
    if (!requisition) throw new AppError('NOT_FOUND', 'Requisition not found', 404);

    const offer = await prisma.offer.create({
      data: {
        tenantId,
        requisitionId: body.requisitionId,
        candidateId: body.candidateId,
        applicationId: body.applicationId,
        status: 'DRAFT',
        salaryAmount: body.salaryAmount,
        salaryCurrency: body.salaryCurrency,
        equity: body.equity,
        benefits: body.benefits,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
    });

    // Create audit trail
    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        action: 'OFFER_CREATED',
        resourceType: 'Offer',
        resourceId: offer.id,
        actorId: req.user?.id || null,
        actorType: 'USER',
        after: { status: 'DRAFT', salaryAmount: body.salaryAmount },
      },
    }).catch(() => {});

    return created(res, offer);
  } catch (err) { return next(err); }
});

// PATCH /api/offers/:id — update offer (status transitions, salary changes, etc.)
const UpdateOfferSchema = z.object({
  status: z.enum([
    'PENDING_APPROVAL', 'APPROVED', 'EXTENDED', 'SENT',
    'ACCEPTED', 'DECLINED', 'RETRACTED', 'RESCINDED',
  ]).optional(),
  salaryAmount: z.number().optional(),
  salaryCurrency: z.string().optional(),
  equity: z.any().optional(),
  benefits: z.any().optional(),
});

router.patch('/:id', requireRole('ADMIN', 'RECRUITER', 'HIRING_MANAGER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.offer.findFirst({ where: { id: req.params.id as string, tenantId } });
    if (!existing) throw new AppError('NOT_FOUND', 'Offer not found', 404);

    const body = UpdateOfferSchema.parse(req.body);

    const offer = await prisma.offer.update({
      where: { id: req.params.id as string },
      data: {
        ...body,
        ...(body.status === 'ACCEPTED' ? { respondedAt: new Date() } : {}),
        ...(body.status === 'SENT' ? { sentAt: new Date() } : {}),
      },
    });

    // If SENT, trigger e-sign (fire-and-forget)
    if (body.status === 'SENT' && existing.applicationId) {
      const application = await prisma.application.findFirst({
        where: { id: existing.applicationId },
        include: {
          candidate: { select: { email: true, firstName: true, lastName: true } },
          requisition: { select: { title: true } },
        },
      });
      if (application?.candidate) {
        sendForESign({
          recipientEmail: application.candidate.email,
          recipientName: `${application.candidate.firstName} ${application.candidate.lastName}`,
          documentTitle: `Offer Letter - ${application.requisition?.title || 'Position'}`,
          documentContent: `Offer details: Salary $${existing.salaryAmount}`,
          callbackUrl: `${process.env.APP_URL || 'http://localhost:4000'}/api/offers/${offer.id}/esign-callback`,
        }).catch(err => logger.error({ err }, 'E-sign send failed'));
      }
    }

    // If accepted, advance application to HIRED
    if (body.status === 'ACCEPTED' && existing.applicationId) {
      await prisma.application.update({
        where: { id: existing.applicationId },
        data: { stage: 'HIRED', status: 'HIRED', stageUpdatedAt: new Date() },
      }).catch(() => {});
    }

    // Audit trail
    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        action: 'OFFER_UPDATED',
        resourceType: 'Offer',
        resourceId: offer.id,
        actorId: req.user?.id || null,
        actorType: 'USER',
        before: { status: existing.status },
        after: { status: offer.status },
      },
    }).catch(() => {});

    return ok(res, offer);
  } catch (err) { return next(err); }
});

// POST /api/offers/:id/approve — add approval to the chain
const ApproveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional(),
});

router.post('/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = req.user?.id;
    const offer = await prisma.offer.findFirst({ where: { id: req.params.id as string, tenantId } });
    if (!offer) throw new AppError('NOT_FOUND', 'Offer not found', 404);

    const body = ApproveSchema.parse(req.body);

    // Count existing approvals to determine order
    const existingCount = await prisma.offerApproval.count({ where: { offerId: offer.id } });

    const approval = await prisma.offerApproval.create({
      data: {
        tenantId,
        offerId: offer.id,
        approverId: userId!,
        status: body.status,
        comments: body.comments,
        orderIndex: existingCount + 1,
        decidedAt: new Date(),
      },
    });

    // Update offer status based on approval decision
    if (body.status === 'APPROVED') {
      await prisma.offer.update({
        where: { id: offer.id },
        data: { status: 'APPROVED' },
      });
    } else if (body.status === 'REJECTED') {
      await prisma.offer.update({
        where: { id: offer.id },
        data: { status: 'DRAFT' }, // Back to draft for revision
      });
    }

    return ok(res, approval);
  } catch (err) { return next(err); }
});

export default router;
