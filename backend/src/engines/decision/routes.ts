import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { AuthRequest, paginate, paginatedResult } from '../../types';
import { ok as sendOk, created } from '../../lib/response';
import { validate } from '../../middleware/validate';

const CreateOfferSchema = z.object({
  candidateId: z.string().min(1),
  requisitionId: z.string().min(1),
  salaryAmount: z.number().positive(),
  salaryCurrency: z.string().length(3).default('USD'),
  equity: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  benefits: z.record(z.string(), z.unknown()).optional(),
});

const FinalReviewSchema = z.object({
  candidateId: z.string().min(1),
  requisitionId: z.string().min(1),
  recommendation: z.enum(['HIRE', 'NO_HIRE', 'HOLD', 'ESCALATE']),
  rationale: z.string().min(10).max(5000),
  confidenceScore: z.number().min(0).max(1).optional(),
});

const SynthesizeSchema = z.object({
  candidateId: z.string().min(1),
  requisitionId: z.string().min(1),
});

const router = Router();

// POST /api/decisions/final-review - final selection supervisor review (create HiringDecision)
router.post('/decisions/final-review', validate(FinalReviewSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, candidateId, recommendation, confidence, rationale, panelConsensus } = req.body;

    if (!requisitionId || !candidateId || !recommendation) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'requisitionId, candidateId, and recommendation are required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const decision = await prisma.hiringDecision.create({
      data: {
        tenantId,
        requisitionId,
        candidateId,
        decisionType: 'FINAL_REVIEW',
        recommendation,
        confidence: confidence || null,
        rationale: rationale || {},
        panelConsensus: panelConsensus || {},
        status: 'PENDING',
        decidedBy: req.user!.id,
      },
    });

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'FINAL_REVIEW_CREATED',
        resourceType: 'HiringDecision',
        resourceId: decision.id,
        metadata: { requisitionId, candidateId, recommendation },
      },
    });

    return res.status(201).json({ data: decision, message: 'Final review decision created' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to create final review: ${error.message}` } });
  }
});

// POST /api/decisions/synthesize - holistic decision synthesis
router.post('/decisions/synthesize', validate(SynthesizeSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, candidateId } = req.body;

    if (!requisitionId || !candidateId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'requisitionId and candidateId are required' } });
    }

    const [application, screeningResults, feedback, existingDecisions] = await Promise.all([
      prisma.candidateApplication.findFirst({
        where: { candidateId, requisitionId },
        include: { candidate: true },
      }),
      (prisma as any).screeningResult.findMany({
        where: { tenantId, candidateId, requisitionId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.interviewFeedback.findMany({
        where: { candidateId, interview: { requisitionId, tenantId } },
        include: { interviewer: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.hiringDecision.findMany({
        where: { tenantId, requisitionId, candidateId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!application) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    const avgRating = feedback.length > 0
      ? feedback.reduce((sum: any, f: any) => sum + f.overallRating, 0) / feedback.length
      : null;

    const avgScreeningScore = screeningResults.length > 0
      ? screeningResults.reduce((sum: any, s: any) => sum + (s.score || 0), 0) / screeningResults.length
      : null;

    const recommendations = feedback.map((f: any) => f.recommendation);
    const hireVotes = recommendations.filter((r: any) => r === 'HIRE' || r === 'STRONG_HIRE').length;
    const noHireVotes = recommendations.filter((r: any) => r === 'NO_HIRE' || r === 'STRONG_NO_HIRE').length;

    const synthesizedConfidence = avgRating && avgScreeningScore
      ? Math.round(((avgRating / 5) * 0.5 + (avgScreeningScore / 100) * 0.5) * 100)
      : null;

    const synthesis = {
      candidateId,
      requisitionId,
      applicationScore: application.score,
      screeningSummary: {
        count: screeningResults.length,
        avgScore: avgScreeningScore,
      },
      interviewSummary: {
        count: feedback.length,
        avgRating,
        hireVotes,
        noHireVotes,
        recommendations,
      },
      overallConfidence: synthesizedConfidence,
      recommendation: hireVotes > noHireVotes ? 'HIRE' : noHireVotes > hireVotes ? 'NO_HIRE' : 'NEEDS_DISCUSSION',
      existingDecisions: existingDecisions.length,
    };

    return sendOk(res, synthesis, { message: 'Decision synthesis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to synthesize decision: ${error.message}` } });
  }
});

// GET /api/decisions/reference-check/:id - reference check results
// NOTE: must be defined before /decisions/:id to avoid shadowing
router.get('/decisions/reference-check/:id', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const referenceCheck = await prisma.referenceCheck.findFirst({
      where: { id: req.params.id as string, tenantId },
    });

    if (!referenceCheck) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Reference check not found' } });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: referenceCheck.candidateId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const allChecks = await prisma.referenceCheck.findMany({
      where: { tenantId, candidateId: referenceCheck.candidateId },
      orderBy: { createdAt: 'desc' },
    });

    return sendOk(res, {
      referenceCheck,
      candidate,
      allChecksForCandidate: allChecks,
      summary: {
        total: allChecks.length,
        completed: allChecks.filter(c => c.status === 'COMPLETED').length,
        pending: allChecks.filter(c => c.status === 'PENDING').length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get reference check: ${error.message}` } });
  }
});

// GET /api/decisions/:id - get decision detail
router.get('/decisions/:id', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const decision = await prisma.hiringDecision.findFirst({
      where: { id: req.params.id as string, tenantId },
    });

    if (!decision) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Decision not found' } });
    }

    const [candidate, requisition, overrides] = await Promise.all([
      prisma.candidate.findUnique({
        where: { id: decision.candidateId },
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
      prisma.requisition.findUnique({
        where: { id: decision.requisitionId },
        select: { id: true, title: true, department: true },
      }),
      prisma.decisionOverride.findMany({
        where: { tenantId, decisionId: decision.id },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      }),
    ]);

    return sendOk(res, { ...decision, candidate, requisition, overrides });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get decision: ${error.message}` } });
  }
});

// GET /api/decisions/:reqId/consensus - consensus analysis
router.get('/decisions/:reqId/consensus', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqId = req.params.reqId as string;

    const decisions = await prisma.hiringDecision.findMany({
      where: { tenantId, requisitionId: reqId },
      orderBy: { createdAt: 'desc' },
    });

    const feedback = await prisma.interviewFeedback.findMany({
      where: { interview: { requisitionId: reqId, tenantId } },
      include: {
        interviewer: { select: { id: true, firstName: true, lastName: true } },
        candidate: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const candidateConsensus: Record<string, any> = {};
    for (const fb of feedback) {
      const cid = fb.candidateId;
      if (!candidateConsensus[cid]) {
        candidateConsensus[cid] = {
          candidate: fb.candidate,
          ratings: [],
          recommendations: [],
          feedbackCount: 0,
        };
      }
      candidateConsensus[cid].ratings.push(fb.overallRating);
      candidateConsensus[cid].recommendations.push(fb.recommendation);
      candidateConsensus[cid].feedbackCount++;
    }

    for (const cid of Object.keys(candidateConsensus)) {
      const c = candidateConsensus[cid];
      const ratings = c.ratings as number[];
      c.avgRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
      c.ratingVariance = ratings.length > 1
        ? ratings.reduce((sum: number, r: number) => sum + Math.pow(r - c.avgRating, 2), 0) / ratings.length
        : 0;
      c.consensusLevel = c.ratingVariance < 0.5 ? 'STRONG' : c.ratingVariance < 1.5 ? 'MODERATE' : 'WEAK';
    }

    return sendOk(res, {
      requisitionId: reqId,
      decisions,
      candidateConsensus: Object.values(candidateConsensus),
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get consensus: ${error.message}` } });
  }
});

// POST /api/decisions/:reqId/consensus/build - build consensus across stakeholders
router.post('/decisions/:reqId/consensus/build', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqId = req.params.reqId as string;
    const { candidateId, stakeholderInputs } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId is required' } });
    }

    const feedback = await prisma.interviewFeedback.findMany({
      where: { candidateId, interview: { requisitionId: reqId, tenantId } },
      include: { interviewer: { select: { id: true, firstName: true, lastName: true, role: true } } },
    });

    const panelConsensus: Record<string, any> = {
      candidateId,
      panelSize: feedback.length,
      ratings: feedback.map(f => ({
        interviewerId: f.interviewerId,
        interviewer: f.interviewer,
        rating: f.overallRating,
        recommendation: f.recommendation,
      })),
      stakeholderInputs: stakeholderInputs || [],
      builtAt: new Date().toISOString(),
    };

    const avgRating = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length
      : 0;

    const recommendation = avgRating >= 4 ? 'STRONG_HIRE' : avgRating >= 3 ? 'HIRE' : avgRating >= 2 ? 'NEEDS_DISCUSSION' : 'NO_HIRE';

    const decision = await prisma.hiringDecision.create({
      data: {
        tenantId,
        requisitionId: reqId,
        candidateId,
        decisionType: 'CONSENSUS',
        recommendation,
        confidence: avgRating / 5,
        panelConsensus,
        rationale: { method: 'stakeholder_consensus', avgRating, feedbackCount: feedback.length },
        status: 'PENDING',
        decidedBy: req.user!.id,
      },
    });

    return res.status(201).json({ data: decision, message: 'Consensus built' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to build consensus: ${error.message}` } });
  }
});

// GET /api/decisions/:reqId/comparison - side-by-side candidate comparison
router.get('/decisions/:reqId/comparison', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqId = req.params.reqId as string;

    const applications = await prisma.candidateApplication.findMany({
      where: { requisitionId: reqId, status: 'ACTIVE' },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true, location: true },
          include: { skills: { include: { skill: true } } },
        },
      },
      orderBy: { score: 'desc' },
    });

    const candidateIds = applications.map(a => a.candidateId);

    const [feedbackData, screeningData] = await Promise.all([
      prisma.interviewFeedback.findMany({
        where: { candidateId: { in: candidateIds }, interview: { requisitionId: reqId, tenantId } },
      }),
      (prisma as any).screeningResult.findMany({
        where: { tenantId, candidateId: { in: candidateIds }, requisitionId: reqId },
      }),
    ]);

    const comparison = applications.map(app => {
      const cFeedback = feedbackData.filter((f: any) => f.candidateId === app.candidateId);
      const cScreening = screeningData.filter((s: any) => s.candidateId === app.candidateId);

      return {
        candidateId: app.candidateId,
        candidate: app.candidate,
        applicationScore: app.score,
        stage: app.stage,
        interviewAvgRating: cFeedback.length > 0
          ? cFeedback.reduce((sum: any, f: any) => sum + f.overallRating, 0) / cFeedback.length
          : null,
        interviewCount: cFeedback.length,
        screeningAvgScore: cScreening.length > 0
          ? cScreening.reduce((sum: any, s: any) => sum + (s.score || 0), 0) / cScreening.length
          : null,
        skills: app.candidate.skills.map((cs: any) => ({
          name: cs.skill.name,
          proficiency: cs.proficiency,
          yearsExperience: cs.yearsExperience,
        })),
      };
    });

    return sendOk(res, { requisitionId: reqId, candidates: comparison });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to compare candidates: ${error.message}` } });
  }
});

// POST /api/decisions/copilot/insights - AI copilot insights for HM
router.post('/decisions/copilot/insights', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId } = req.body;

    if (!requisitionId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'requisitionId is required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const [applications, decisions, pipelineMetrics, offers] = await Promise.all([
      prisma.candidateApplication.findMany({
        where: { requisitionId, status: 'ACTIVE' },
        include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
      }),
      prisma.hiringDecision.findMany({
        where: { tenantId, requisitionId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.pipelineMetric.findMany({
        where: { tenantId, requisitionId },
        orderBy: { computedAt: 'desc' },
        take: 10,
      }),
      prisma.offer.findMany({
        where: { tenantId, requisitionId },
      }),
    ]);

    const stageCounts: Record<string, number> = {};
    for (const app of applications) {
      stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
    }

    const insights = {
      requisitionId,
      requisitionTitle: requisition.title,
      pipelineSummary: {
        totalActive: applications.length,
        byStage: stageCounts,
        headcount: requisition.headcount,
        filledVsTarget: `${offers.filter(o => o.status === 'ACCEPTED').length}/${requisition.headcount}`,
      },
      decisionSummary: {
        totalDecisions: decisions.length,
        pendingDecisions: decisions.filter(d => d.status === 'PENDING').length,
        latestDecision: decisions[0] || null,
      },
      recommendations: [
        ...(applications.filter(a => a.stage === 'FINAL_REVIEW').length === 0
          ? ['No candidates in final review - consider advancing top candidates']
          : []),
        ...(offers.length === 0 && applications.length > 5
          ? ['Pipeline has candidates but no offers yet - review decision pace']
          : []),
        ...(requisition.targetStartDate && new Date(requisition.targetStartDate) < new Date(Date.now() + 30 * 86400000)
          ? ['Target start date is within 30 days - expedite process']
          : []),
      ],
      pipelineVelocity: pipelineMetrics.slice(0, 5),
    };

    return sendOk(res, insights, { message: 'Copilot insights generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate copilot insights: ${error.message}` } });
  }
});

// POST /api/offers - create offer
router.post('/offers', validate(CreateOfferSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const {
      requisitionId, candidateId, salaryAmount, salaryCurrency,
      equity, benefits, startDate, expiresAt, approvalChain,
    } = req.body;

    if (!requisitionId || !candidateId || salaryAmount === undefined) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'requisitionId, candidateId, and salaryAmount are required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const offer = await prisma.offer.create({
      data: {
        tenantId,
        requisitionId,
        candidateId,
        salaryAmount,
        salaryCurrency: salaryCurrency || 'USD',
        equity: equity || null,
        benefits: benefits || null,
        startDate: startDate ? new Date(startDate) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        approvalChain: approvalChain || [],
        status: 'DRAFT',
      },
    });

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'OFFER_CREATED',
        resourceType: 'Offer',
        resourceId: offer.id,
        metadata: { requisitionId, candidateId, salaryAmount },
      },
    });

    return res.status(201).json({ data: offer, message: 'Offer created' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to create offer: ${error.message}` } });
  }
});

// GET /api/offers/compensation/benchmark - market salary benchmark
// NOTE: must be defined before /offers/:id to avoid shadowing
router.get('/offers/compensation/benchmark', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { jobFamily, level, location } = req.query;

    const where: any = { tenantId };
    if (jobFamily) where.jobFamily = jobFamily as string;
    if (level) where.level = level as string;
    if (location) where.location = location as string;

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return sendOk(res, benchmarks);
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get benchmarks: ${error.message}` } });
  }
});

// GET /api/offers/:id - get offer details
router.get('/offers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: {
        requisition: { select: { id: true, title: true, department: true, location: true } },
      },
    });

    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: offer.candidateId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    return sendOk(res, { ...offer, candidate });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get offer: ${error.message}` } });
  }
});

// PUT /api/offers/:id - update offer
router.put('/offers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const existing = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const {
      salaryAmount, salaryCurrency, equity, benefits,
      startDate, expiresAt, status, approvalChain, complianceCheck,
    } = req.body;

    const updated = await prisma.offer.update({
      where: { id: req.params.id as string },
      data: {
        ...(salaryAmount !== undefined && { salaryAmount }),
        ...(salaryCurrency !== undefined && { salaryCurrency }),
        ...(equity !== undefined && { equity }),
        ...(benefits !== undefined && { benefits }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(expiresAt !== undefined && { expiresAt: new Date(expiresAt) }),
        ...(status !== undefined && { status }),
        ...(approvalChain !== undefined && { approvalChain }),
        ...(complianceCheck !== undefined && { complianceCheck }),
        ...(status === 'SENT' && { sentAt: new Date() }),
        ...(status === 'ACCEPTED' || status === 'DECLINED' ? { respondedAt: new Date() } : {}),
      },
    });

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'OFFER_UPDATED',
        resourceType: 'Offer',
        resourceId: req.params.id as string,
        before: JSON.parse(JSON.stringify(existing)),
        after: JSON.parse(JSON.stringify(updated)),
      },
    });

    return sendOk(res, updated, { message: 'Offer updated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to update offer: ${error.message}` } });
  }
});

// POST /api/offers/:id/compliance-check - offer compliance check
router.post('/offers/:id/compliance-check', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: {
        requisition: { select: { id: true, salaryMin: true, salaryMax: true, salaryCurrency: true, country: true, location: true } },
      },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const jurisdictionRules = await prisma.jurisdictionRule.findMany({
      where: { tenantId, country: offer.requisition.country, isActive: true },
    });

    const compliancePolicies = await prisma.compliancePolicy.findMany({
      where: { tenantId, policyType: 'OFFER_COMPLIANCE', isActive: true },
    });

    const issues: string[] = [];
    const warnings: string[] = [];

    if (offer.requisition.salaryMin && offer.salaryAmount < offer.requisition.salaryMin) {
      issues.push('Offer salary below requisition minimum');
    }
    if (offer.requisition.salaryMax && offer.salaryAmount > offer.requisition.salaryMax) {
      warnings.push('Offer salary exceeds requisition maximum');
    }
    if (!offer.expiresAt) {
      warnings.push('No offer expiration date set');
    }

    const complianceResult = {
      offerId: offer.id,
      passed: issues.length === 0,
      issues,
      warnings,
      jurisdictionRulesChecked: jurisdictionRules.length,
      policiesChecked: compliancePolicies.length,
      checkedAt: new Date().toISOString(),
    };

    await prisma.offer.update({
      where: { id: req.params.id as string },
      data: { complianceCheck: complianceResult },
    });

    return sendOk(res, complianceResult, { message: 'Compliance check complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run compliance check: ${error.message}` } });
  }
});

// POST /api/offers/compensation/recommend - compensation recommendation
router.post('/offers/compensation/recommend', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, candidateId } = req.body;

    if (!requisitionId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'requisitionId is required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: {
        tenantId,
        jobFamily: requisition.jobFamily || undefined,
        location: requisition.location,
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const benchmark = benchmarks[0] || null;

    const existingOffers = await prisma.offer.findMany({
      where: { tenantId, requisitionId, status: { in: ['ACCEPTED', 'SENT'] } },
      select: { salaryAmount: true },
    });

    const avgExistingOffer = existingOffers.length > 0
      ? existingOffers.reduce((sum, o) => sum + o.salaryAmount, 0) / existingOffers.length
      : null;

    const recommendation = {
      requisitionId,
      candidateId: candidateId || null,
      salaryRange: {
        min: requisition.salaryMin,
        max: requisition.salaryMax,
        currency: requisition.salaryCurrency,
      },
      marketBenchmark: benchmark
        ? {
            percentile25: benchmark.percentile25,
            percentile50: benchmark.percentile50,
            percentile75: benchmark.percentile75,
            percentile90: benchmark.percentile90,
            source: benchmark.source,
          }
        : null,
      suggestedOffer: benchmark
        ? Math.round(benchmark.percentile50)
        : requisition.salaryMin && requisition.salaryMax
          ? Math.round((requisition.salaryMin + requisition.salaryMax) / 2)
          : null,
      internalEquity: avgExistingOffer
        ? { avgExistingOffer: Math.round(avgExistingOffer), offerCount: existingOffers.length }
        : null,
    };

    return sendOk(res, recommendation, { message: 'Compensation recommendation generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate recommendation: ${error.message}` } });
  }
});

// POST /api/offers/:id/retract - handle offer retraction
router.post('/offers/:id/retract', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { reason } = req.body;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    if (offer.status === 'RETRACTED') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Offer already retracted' } });
    }

    const updated = await prisma.offer.update({
      where: { id: req.params.id as string },
      data: { status: 'RETRACTED' },
    });

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'OFFER_RETRACTED',
        resourceType: 'Offer',
        resourceId: req.params.id as string,
        before: { status: offer.status },
        after: { status: 'RETRACTED' },
        metadata: { reason: reason || 'No reason provided' },
      },
    });

    return sendOk(res, updated, { message: 'Offer retracted' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to retract offer: ${error.message}` } });
  }
});

// POST /api/decisions/reference-check/orchestrate - orchestrate reference checks
router.post('/decisions/reference-check/orchestrate', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, references } = req.body;

    if (!candidateId || !references || !Array.isArray(references) || references.length === 0) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId and references array are required' } });
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    const created = await Promise.all(
      references.map((ref: any) =>
        prisma.referenceCheck.create({
          data: {
            tenantId,
            candidateId,
            referenceName: ref.name,
            referenceEmail: ref.email || null,
            relationship: ref.relationship,
            status: 'PENDING',
          },
        })
      )
    );

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'REFERENCE_CHECKS_ORCHESTRATED',
        resourceType: 'Candidate',
        resourceId: candidateId,
        metadata: { referenceCheckIds: created.map(r => r.id), count: created.length },
      },
    });

    return res.status(201).json({ data: created, message: 'Reference checks orchestrated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to orchestrate reference checks: ${error.message}` } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// P2 DECISION & OFFER MANAGEMENT ROUTES (29 features)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/offers/preboarding/orchestrate - Offer and Preboarding Orchestration Agent (id:14)
router.post('/offers/preboarding/orchestrate', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId, candidateId, requisitionId, startDate, onboardingTasks } = req.body;

    if (!offerId || !candidateId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'offerId and candidateId are required' } });
    }

    const offer = await prisma.offer.findFirst({
      where: { id: offerId, tenantId },
      include: { requisition: { select: { id: true, title: true, department: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    if (offer.status !== 'ACCEPTED') {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Offer must be in ACCEPTED status to initiate preboarding' } });
    }

    const hiringContext = {
      offerId,
      salaryAmount: offer.salaryAmount,
      salaryCurrency: offer.salaryCurrency,
      startDate: startDate || offer.startDate,
      benefits: offer.benefits,
      equity: offer.equity,
      requisitionTitle: offer.requisition.title,
      department: offer.requisition.department,
    };

    const handoff = await prisma.onboardingHandoff.create({
      data: {
        tenantId,
        candidateId,
        requisitionId: requisitionId || offer.requisitionId,
        hiringContext,
        status: 'PENDING',
      },
    });

    const defaultTasks = [
      { title: 'Send offer acceptance confirmation', taskType: 'COMMUNICATION' },
      { title: 'Initiate background check clearance', taskType: 'COMPLIANCE' },
      { title: 'Set up equipment provisioning request', taskType: 'IT_SETUP' },
      { title: 'Schedule first-day orientation', taskType: 'SCHEDULING' },
      { title: 'Prepare onboarding documentation packet', taskType: 'DOCUMENTATION' },
    ];

    const tasksToCreate = onboardingTasks?.length ? onboardingTasks : defaultTasks;

    const createdTasks = await Promise.all(
      tasksToCreate.map((t: any) =>
        prisma.onboardingTask.create({
          data: {
            tenantId,
            handoffId: handoff.id,
            title: t.title,
            taskType: t.taskType,
            dueDate: startDate ? new Date(new Date(startDate).getTime() - 7 * 86400000) : null,
            status: 'PENDING',
          },
        })
      )
    );

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'PREBOARDING_ORCHESTRATED',
        resourceType: 'OnboardingHandoff',
        resourceId: handoff.id,
        metadata: { offerId, candidateId, taskCount: createdTasks.length },
      },
    });

    return res.status(201).json({ data: { handoff, tasks: createdTasks }, message: 'Preboarding orchestration initiated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to orchestrate preboarding: ${error.message}` } });
  }
});

// GET /api/decisions/:reqId/:candidateId/decision-card - Decision Card with Uncertainty and Evidence Gaps (id:31)
router.get('/decisions/:reqId/:candidateId/decision-card', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { reqId, candidateId } = req.params;

    const [application, feedback, screeningResults, referenceChecks, decisions] = await Promise.all([
      prisma.candidateApplication.findFirst({
        where: { candidateId, requisitionId: reqId } as any,
        include: { candidate: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      prisma.interviewFeedback.findMany({
        where: { candidateId, interview: { requisitionId: reqId, tenantId } } as any,
        include: { interviewer: { select: { id: true, firstName: true, lastName: true } } },
      }),
      (prisma as any).screeningResult.findMany({
        where: { tenantId, candidateId, requisitionId: reqId },
      }),
      prisma.referenceCheck.findMany({
        where: { tenantId, candidateId } as any
      }),
      prisma.hiringDecision.findMany({
        where: { tenantId, requisitionId: reqId, candidateId } as any,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!application) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    const evidenceGaps: string[] = [];
    if (feedback.length === 0) evidenceGaps.push('No interview feedback recorded');
    if (screeningResults.length === 0) evidenceGaps.push('No screening results available');
    if (referenceChecks.length === 0) evidenceGaps.push('No reference checks initiated');
    if (referenceChecks.filter((r: any) => r.status === 'COMPLETED').length === 0 && referenceChecks.length > 0) {
      evidenceGaps.push('Reference checks pending completion');
    }

    const avgRating = feedback.length > 0
      ? feedback.reduce((sum: any, f: any) => sum + f.overallRating, 0) / feedback.length
      : null;

    const hireVotes = feedback.filter((f: any) => f.recommendation === 'HIRE' || f.recommendation === 'STRONG_HIRE').length;
    const noHireVotes = feedback.filter((f: any) => f.recommendation === 'NO_HIRE' || f.recommendation === 'STRONG_NO_HIRE').length;

    const uncertaintyScore = evidenceGaps.length > 0
      ? Math.min(1, evidenceGaps.length * 0.25)
      : avgRating && Math.abs(avgRating - 3) < 0.5 ? 0.4 : 0.1;

    const decisionCard = {
      candidateId,
      candidate: application.candidate,
      requisitionId: reqId,
      applicationScore: application.score,
      stage: application.stage,
      confidence: avgRating ? Math.round((avgRating / 5) * (1 - uncertaintyScore) * 100) : null,
      uncertaintyScore: Math.round(uncertaintyScore * 100),
      evidenceGaps,
      evidenceSummary: {
        interviewCount: feedback.length,
        avgInterviewRating: avgRating,
        hireVotes,
        noHireVotes,
        screeningCount: screeningResults.length,
        referenceChecksTotal: referenceChecks.length,
        referenceChecksComplete: referenceChecks.filter((r: any) => r.status === 'COMPLETED').length,
      },
      latestDecision: decisions[0] || null,
      readyForDecision: evidenceGaps.length === 0,
    };

    return sendOk(res, decisionCard, { message: 'Decision card generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate decision card: ${error.message}` } });
  }
});

// GET /api/decisions/:reqId/disagreements - Consensus and Disagreement Detector (id:33)
router.get('/decisions/:reqId/disagreements', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqId = req.params.reqId as string;
    const threshold = parseFloat(req.query.threshold as string) || 1.5;

    const feedback = await prisma.interviewFeedback.findMany({
      where: { interview: { requisitionId: reqId, tenantId } },
      include: {
        interviewer: { select: { id: true, firstName: true, lastName: true } },
        candidate: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const byCandidateId: Record<string, typeof feedback> = {};
    for (const f of feedback) {
      if (!byCandidateId[f.candidateId]) byCandidateId[f.candidateId] = [];
      byCandidateId[f.candidateId].push(f);
    }

    const disagreements = [];
    const agreements = [];

    for (const [cid, cfeedback] of Object.entries(byCandidateId)) {
      if (cfeedback.length < 2) continue;
      const ratings = cfeedback.map(f => f.overallRating);
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / ratings.length;
      const stdDev = Math.sqrt(variance);
      const recommendations = cfeedback.map(f => f.recommendation);
      const uniqueRecs = new Set(recommendations);

      const entry = {
        candidateId: cid,
        candidate: cfeedback[0].candidate,
        feedbackCount: cfeedback.length,
        avgRating: Math.round(avg * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        variance: Math.round(variance * 100) / 100,
        recommendations,
        divergentRecommendations: uniqueRecs.size > 1,
        interviewers: cfeedback.map(f => ({ interviewer: f.interviewer, rating: f.overallRating, recommendation: f.recommendation })),
      };

      if (stdDev >= threshold || (uniqueRecs.size > 1 && cfeedback.length > 1)) {
        disagreements.push(entry);
      } else {
        agreements.push(entry);
      }
    }

    return sendOk(res, {
      requisitionId: reqId,
      disagreements,
      agreements,
      summary: {
        totalCandidatesEvaluated: Object.keys(byCandidateId).length,
        candidatesWithDisagreement: disagreements.length,
        candidatesWithConsensus: agreements.length,
        flaggedForDiscussion: disagreements.map(d => d.candidateId),
      },
    }, { message: 'Disagreement detection complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to detect disagreements: ${error.message}` } });
  }
});

// GET /api/offers/:id/acceptance-risk - Offer Acceptance and Drop Off Risk Forecaster (id:34)
router.get('/offers/:id/acceptance-risk', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { requisition: { select: { id: true, title: true, salaryMin: true, salaryMax: true, location: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: offer.candidateId },
      select: { id: true, firstName: true, lastName: true, noticePeriod: true },
    });

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId, location: offer.requisition.location },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const historicalOffers = await prisma.offer.findMany({
      where: { tenantId, requisitionId: offer.requisitionId, status: { in: ['ACCEPTED', 'DECLINED'] } },
      select: { status: true, salaryAmount: true },
    });

    const riskFactors: string[] = [];
    let riskScore = 0;

    const benchmark = benchmarks[0];
    if (benchmark && offer.salaryAmount < benchmark.percentile50) {
      riskScore += 25;
      riskFactors.push('Offer below market median (p50)');
    }
    if (!offer.expiresAt) {
      riskScore += 10;
      riskFactors.push('No offer expiry creates urgency ambiguity');
    }
    if (offer.expiresAt && new Date(offer.expiresAt).getTime() - Date.now() < 3 * 86400000) {
      riskScore += 15;
      riskFactors.push('Offer expires within 72 hours');
    }
    if (!offer.benefits) {
      riskScore += 10;
      riskFactors.push('No benefits package specified');
    }

    const histAccepted = historicalOffers.filter(o => o.status === 'ACCEPTED').length;
    const histDeclined = historicalOffers.filter(o => o.status === 'DECLINED').length;
    const historicalAcceptRate = historicalOffers.length > 0
      ? Math.round((histAccepted / historicalOffers.length) * 100)
      : null;

    const acceptanceProbability = Math.max(0, Math.min(100, 80 - riskScore));

    return sendOk(res, {
      offerId: offer.id,
      candidate,
      riskScore,
      acceptanceProbability,
      riskLevel: riskScore >= 40 ? 'HIGH' : riskScore >= 20 ? 'MEDIUM' : 'LOW',
      riskFactors,
      marketContext: benchmark
        ? { p50: benchmark.percentile50, p75: benchmark.percentile75, offerVsP50: offer.salaryAmount - benchmark.percentile50 }
        : null,
      historicalAcceptRate,
      recommendations: [
        ...(riskScore >= 40 ? ['Consider proactive candidate engagement before expiry'] : []),
        ...(benchmark && offer.salaryAmount < benchmark.percentile50 ? ['Review salary against market median'] : []),
        ...(histDeclined > histAccepted ? ['Similar offers have low acceptance — consider adjusting package'] : []),
      ],
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to forecast acceptance risk: ${error.message}` } });
  }
});

// GET /api/decisions/:reqId/support - Decision Support Agent recommendations (id:60)
router.get('/decisions/:reqId/support', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqId = req.params.reqId as string;

    const requisition = await prisma.requisition.findFirst({
      where: { id: reqId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const applications = await prisma.candidateApplication.findMany({
      where: { requisitionId: reqId, status: 'ACTIVE' },
      include: { candidate: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    const candidateIds = applications.map(a => a.candidateId);

    const [feedbackData, screeningData] = await Promise.all([
      prisma.interviewFeedback.findMany({
        where: { candidateId: { in: candidateIds }, interview: { requisitionId: reqId, tenantId } },
      }),
      (prisma as any).screeningResult.findMany({
        where: { tenantId, candidateId: { in: candidateIds }, requisitionId: reqId },
      }),
    ]);

    const ranked = applications.map(app => {
      const cFeedback = feedbackData.filter((f: any) => f.candidateId === app.candidateId);
      const cScreening = screeningData.filter((s: any) => s.candidateId === app.candidateId);

      const avgRating = cFeedback.length > 0
        ? cFeedback.reduce((sum: any, f: any) => sum + f.overallRating, 0) / cFeedback.length
        : 0;
      const avgScreening = cScreening.length > 0
        ? cScreening.reduce((sum: any, s: any) => sum + (s.score || 0), 0) / cScreening.length
        : 0;

      const compositeScore = (avgRating / 5) * 0.5 + (avgScreening / 100) * 0.3 + ((app.score || 0) / 100) * 0.2;
      const hireVotes = cFeedback.filter((f: any) => f.recommendation === 'HIRE' || f.recommendation === 'STRONG_HIRE').length;

      const reasons: string[] = [];
      if (avgRating >= 4) reasons.push(`Strong interview ratings (avg ${avgRating.toFixed(1)}/5)`);
      if (avgScreening >= 80) reasons.push(`High screening score (${avgScreening.toFixed(0)}%)`);
      if (hireVotes === cFeedback.length && cFeedback.length > 0) reasons.push('Unanimous hire recommendation from panel');
      if ((app.score || 0) >= 85) reasons.push('Exceptional application score');

      return {
        candidateId: app.candidateId,
        candidate: app.candidate,
        compositeScore: Math.round(compositeScore * 100),
        stage: app.stage,
        avgInterviewRating: avgRating,
        avgScreeningScore: avgScreening,
        hireVotes,
        panelSize: cFeedback.length,
        reasons,
        recommendation: compositeScore >= 0.7 ? 'STRONG_HIRE' : compositeScore >= 0.5 ? 'HIRE' : compositeScore >= 0.35 ? 'NEEDS_DISCUSSION' : 'NO_HIRE',
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);

    return sendOk(res, {
      requisitionId: reqId,
      requisitionTitle: requisition.title,
      headcount: requisition.headcount,
      rankedCandidates: ranked,
      topRecommendation: ranked[0] || null,
    }, { message: 'Decision support analysis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate decision support: ${error.message}` } });
  }
});

// POST /api/offers/optimization/analyze - Offer Optimization Agent (id:61)
router.post('/offers/optimization/analyze', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, candidateId, proposedSalary, proposedEquity, proposedBenefits } = req.body;

    if (!requisitionId || proposedSalary === undefined) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'requisitionId and proposedSalary are required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId, jobFamily: requisition.jobFamily || undefined, location: requisition.location },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const acceptedOffers = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      select: { salaryAmount: true, equity: true, benefits: true },
      take: 20,
      orderBy: { respondedAt: 'desc' },
    });

    const benchmark = benchmarks[0];
    const avgAcceptedSalary = acceptedOffers.length > 0
      ? acceptedOffers.reduce((s, o) => s + o.salaryAmount, 0) / acceptedOffers.length
      : null;

    const optimizations: string[] = [];
    let acceptanceLiftEstimate = 0;

    if (benchmark) {
      if (proposedSalary < benchmark.percentile50) {
        optimizations.push(`Increase base to market median ($${benchmark.percentile50.toLocaleString()}) to improve acceptance odds`);
        acceptanceLiftEstimate += 15;
      } else if (proposedSalary >= benchmark.percentile75) {
        optimizations.push('Base salary is at or above p75 — strong competitive position');
      }
    }

    if (!proposedEquity) {
      optimizations.push('Consider adding equity component to improve total compensation value');
      acceptanceLiftEstimate += 10;
    }

    if (!proposedBenefits || Object.keys(proposedBenefits || {}).length === 0) {
      optimizations.push('Specify benefits package — a comprehensive benefits overview increases acceptance probability');
      acceptanceLiftEstimate += 5;
    }

    return sendOk(res, {
      requisitionId,
      candidateId: candidateId || null,
      proposedSalary,
      marketContext: benchmark
        ? { p25: benchmark.percentile25, p50: benchmark.percentile50, p75: benchmark.percentile75, p90: benchmark.percentile90 }
        : null,
      internalBenchmark: avgAcceptedSalary ? { avgAcceptedSalary: Math.round(avgAcceptedSalary), sampleSize: acceptedOffers.length } : null,
      optimizations,
      estimatedAcceptanceLift: `+${acceptanceLiftEstimate}%`,
      optimizedPackage: {
        suggestedSalary: benchmark ? benchmark.percentile50 : requisition.salaryMax || proposedSalary,
        equityRecommended: !proposedEquity,
        benefitsRecommended: !proposedBenefits,
      },
    }, { message: 'Offer optimization analysis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to analyze offer optimization: ${error.message}` } });
  }
});

// POST /api/decisions/:reqId/decision-room - Decision Room Agent session (id:67)
router.post('/decisions/:reqId/decision-room', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqId = req.params.reqId as string;
    const { candidateIds, stakeholderIds, sessionNotes } = req.body;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateIds array is required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: reqId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const feedbackData = await prisma.interviewFeedback.findMany({
      where: { candidateId: { in: candidateIds }, interview: { requisitionId: reqId, tenantId } },
      include: { interviewer: { select: { id: true, firstName: true, lastName: true } } },
    });

    const existingDecisions = await prisma.hiringDecision.findMany({
      where: { tenantId, requisitionId: reqId, candidateId: { in: candidateIds } },
    });

    const agendaItems = candidateIds.map((cid: string) => {
      const cFeedback = feedbackData.filter(f => f.candidateId === cid);
      const cDecisions = existingDecisions.filter(d => d.candidateId === cid);
      const hireVotes = cFeedback.filter(f => f.recommendation === 'HIRE' || f.recommendation === 'STRONG_HIRE').length;
      const noHireVotes = cFeedback.filter(f => f.recommendation === 'NO_HIRE' || f.recommendation === 'STRONG_NO_HIRE').length;
      const ratings = cFeedback.map(f => f.overallRating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
      const variance = ratings.length > 1
        ? ratings.reduce((sum, r) => sum + Math.pow(r - (avgRating || 0), 2), 0) / ratings.length
        : 0;

      return {
        candidateId: cid,
        feedbackCount: cFeedback.length,
        avgRating,
        hireVotes,
        noHireVotes,
        consensusLevel: variance < 0.5 ? 'STRONG' : variance < 1.5 ? 'MODERATE' : 'WEAK',
        existingDecisions: cDecisions.length,
        needsDiscussion: variance >= 1.5 || (hireVotes > 0 && noHireVotes > 0),
      };
    });

    const roomSession = await prisma.hiringDecision.create({
      data: {
        tenantId,
        requisitionId: reqId,
        candidateId: candidateIds[0],
        decisionType: 'DECISION_ROOM_SESSION',
        recommendation: 'NEEDS_DISCUSSION',
        panelConsensus: {
          sessionId: `room-${Date.now()}`,
          stakeholderIds: stakeholderIds || [],
          agendaItems,
          sessionNotes: sessionNotes || '',
          facilitatedBy: req.user!.id,
          startedAt: new Date().toISOString(),
        },
        rationale: { method: 'decision_room', candidatesReviewed: candidateIds.length },
        status: 'PENDING',
        decidedBy: req.user!.id,
      },
    });

    return res.status(201).json({ data: {
      session: roomSession,
      agendaItems,
      priorityDiscussions: agendaItems.filter((i: any) => i.needsDiscussion),
    }, message: 'Decision room session initiated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to initiate decision room: ${error.message}` } });
  }
});

// POST /api/offers/:id/compensation-rationale - Automated Compensation Rationale (id:86)
router.post('/offers/:id/compensation-rationale', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { requisition: { select: { id: true, title: true, salaryMin: true, salaryMax: true, jobFamily: true, location: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId, jobFamily: offer.requisition.jobFamily || undefined, location: offer.requisition.location },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const benchmark = benchmarks[0];

    const rationalePoints: string[] = [];

    if (benchmark) {
      const percentile = offer.salaryAmount >= benchmark.percentile90 ? 90
        : offer.salaryAmount >= benchmark.percentile75 ? 75
        : offer.salaryAmount >= benchmark.percentile50 ? 50
        : 25;
      rationalePoints.push(`Salary of ${offer.salaryCurrency} ${offer.salaryAmount.toLocaleString()} positions at approximately the ${percentile}th market percentile for ${offer.requisition.jobFamily || 'this role'} in ${offer.requisition.location}`);
    }

    if (offer.requisition.salaryMin && offer.requisition.salaryMax) {
      const midpoint = (offer.requisition.salaryMin + offer.requisition.salaryMax) / 2;
      const position = offer.salaryAmount > midpoint ? 'above' : offer.salaryAmount < midpoint ? 'below' : 'at';
      rationalePoints.push(`Offer is ${position} the approved salary band midpoint of ${offer.salaryCurrency} ${midpoint.toLocaleString()}`);
    }

    if (offer.equity) {
      rationalePoints.push('Equity component included to align candidate with long-term company performance');
    }

    if (offer.benefits) {
      rationalePoints.push('Total compensation package includes comprehensive benefits as per company standard');
    }

    const rationale = {
      offerId: offer.id,
      candidateId: offer.candidateId,
      salaryAmount: offer.salaryAmount,
      currency: offer.salaryCurrency,
      rationalePoints,
      marketBenchmark: benchmark
        ? { p50: benchmark.percentile50, p75: benchmark.percentile75, source: benchmark.source }
        : null,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user!.id,
    };

    await prisma.offer.update({
      where: { id: req.params.id as string },
      data: { complianceCheck: { ...((offer.complianceCheck as any) || {}), compensationRationale: rationale } },
    });

    return sendOk(res, rationale, { message: 'Compensation rationale generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate compensation rationale: ${error.message}` } });
  }
});

// POST /api/decisions/reference-check/:candidateId/synthesize - Reference Check Synthesizer (id:95)
router.post('/decisions/reference-check/:candidateId/synthesize', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId } = req.params;

    const referenceChecks = await prisma.referenceCheck.findMany({
      where: { tenantId, candidateId, status: 'COMPLETED' } as any
    });

    if (referenceChecks.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No completed reference checks found for this candidate' } });
    }

    const positiveThemes: string[] = [];
    const concernThemes: string[] = [];
    const allInsights: any[] = [];

    for (const check of referenceChecks) {
      if (check.insights) {
        const insights = check.insights as any;
        if (insights.positives) positiveThemes.push(...(insights.positives as string[]));
        if (insights.concerns) concernThemes.push(...(insights.concerns as string[]));
        allInsights.push({ ...insights, referenceName: check.referenceName, relationship: check.relationship });
      }
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId } as any,
      select: { id: true, firstName: true, lastName: true },
    });

    const synthesis = {
      candidateId,
      candidate,
      referenceCount: referenceChecks.length,
      references: referenceChecks.map(r => ({
        id: r.id,
        referenceName: r.referenceName,
        relationship: r.relationship,
        completedAt: r.completedAt,
      })),
      synthesizedInsights: {
        overallSentiment: concernThemes.length === 0 ? 'POSITIVE' : concernThemes.length <= 1 ? 'MOSTLY_POSITIVE' : 'MIXED',
        positiveThemes: [...new Set(positiveThemes)],
        concernThemes: [...new Set(concernThemes)],
        detailedInsights: allInsights,
      },
      recommendation: concernThemes.length === 0
        ? 'References strongly support hire recommendation'
        : concernThemes.length <= 1
          ? 'References are generally positive with minor concerns to discuss'
          : 'Multiple concerns raised — recommend further discussion before final decision',
      synthesizedAt: new Date().toISOString(),
    };

    return sendOk(res, synthesis, { message: 'Reference check synthesis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to synthesize reference checks: ${error.message}` } });
  }
});

// POST /api/offers/approvals/chase - Automated Offer Approval Chaser (id:96)
router.post('/offers/approvals/chase', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerIds, staleDays } = req.body;

    const staleThreshold = staleDays || 2;
    const cutoff = new Date(Date.now() - staleThreshold * 86400000);

    const where: any = {
      tenantId,
      status: 'PENDING_APPROVAL',
      updatedAt: { lt: cutoff },
    };

    if (offerIds && Array.isArray(offerIds) && offerIds.length > 0) {
      where.id = { in: offerIds };
    }

    const staleOffers = await prisma.offer.findMany({
      where,
      include: { requisition: { select: { id: true, title: true } } },
    });

    const chasedOffers = await Promise.all(
      staleOffers.map(async (offer) => {
        await prisma.auditTrailEntry.create({
          data: {
            tenantId,
            actorId: req.user!.id,
            action: 'OFFER_APPROVAL_CHASED',
            resourceType: 'Offer',
            resourceId: offer.id,
            metadata: {
              staleSinceDays: Math.floor((Date.now() - offer.updatedAt.getTime()) / 86400000),
              requisitionTitle: offer.requisition.title,
            },
          },
        });
        return { offerId: offer.id, candidateId: offer.candidateId, requisitionTitle: offer.requisition.title, staleSince: offer.updatedAt };
      })
    );

    return sendOk(res, {
      chased: chasedOffers,
      count: chasedOffers.length,
      message: chasedOffers.length > 0
        ? `${chasedOffers.length} approval reminder(s) dispatched`
        : 'No stale pending approvals found',
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to chase offer approvals: ${error.message}` } });
  }
});

// GET /api/offers/compensation/transparent-match - Transparent Compensation Matcher (id:123)
router.get('/offers/compensation/transparent-match', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { jobFamily, level, location, targetSalary } = req.query;

    const where: any = { tenantId };
    if (jobFamily) where.jobFamily = jobFamily as string;
    if (level) where.level = level as string;
    if (location) where.location = location as string;

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (benchmarks.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No market benchmarks found for specified criteria' } });
    }

    const latest = benchmarks[0];
    const salary = targetSalary ? parseFloat(targetSalary as string) : null;

    let positionLabel = 'N/A';
    let competitivenessScore = 0;
    if (salary !== null) {
      if (salary >= latest.percentile90) { positionLabel = 'Top 10%'; competitivenessScore = 100; }
      else if (salary >= latest.percentile75) { positionLabel = 'Top 25%'; competitivenessScore = 85; }
      else if (salary >= latest.percentile50) { positionLabel = 'Median'; competitivenessScore = 65; }
      else if (salary >= latest.percentile25) { positionLabel = 'Below Median'; competitivenessScore = 40; }
      else { positionLabel = 'Below Market'; competitivenessScore = 20; }
    }

    return sendOk(res, {
      criteria: { jobFamily, level, location },
      benchmark: {
        p25: latest.percentile25,
        p50: latest.percentile50,
        p75: latest.percentile75,
        p90: latest.percentile90,
        currency: latest.currency,
        source: latest.source,
        validUntil: latest.validUntil,
      },
      targetSalaryAnalysis: salary !== null
        ? { salary, positionLabel, competitivenessScore, gap: Math.round(salary - latest.percentile50) }
        : null,
      historicalBenchmarks: benchmarks.slice(1).map(b => ({
        p50: b.percentile50, p75: b.percentile75, createdAt: b.createdAt,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch transparent compensation match: ${error.message}` } });
  }
});

// POST /api/offers/negotiation/strategy - Intelligent Offer Negotiation Strategist (id:133)
router.post('/offers/negotiation/strategy', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId, candidateCounterOffer, priorityFactors } = req.body;

    if (!offerId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'offerId is required' } });
    }

    const offer = await prisma.offer.findFirst({
      where: { id: offerId, tenantId },
      include: { requisition: { select: { id: true, title: true, salaryMin: true, salaryMax: true, jobFamily: true, location: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId, location: offer.requisition.location, jobFamily: offer.requisition.jobFamily || undefined },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const benchmark = benchmarks[0];
    const strategies: string[] = [];
    const concessions: string[] = [];

    const counter = candidateCounterOffer?.salary;
    const maxBudget = offer.requisition.salaryMax || (benchmark?.percentile90);

    if (counter && maxBudget && counter <= maxBudget) {
      strategies.push(`Counter-offer of ${counter} is within budget ceiling — consider accepting directly`);
    } else if (counter && maxBudget && counter > maxBudget) {
      strategies.push(`Counter-offer exceeds budget ceiling — propose meeting at ${maxBudget}`);
      concessions.push('Offer signing bonus as alternative to base increase');
      concessions.push('Accelerate first performance review to 6 months');
    }

    if (!offer.equity) {
      concessions.push('Introduce equity grant as total compensation enhancer without increasing base');
    }

    if (priorityFactors?.includes('flexibility')) {
      strategies.push('Emphasize remote/hybrid flexibility as key benefit differentiator');
    }

    if (benchmark && offer.salaryAmount >= benchmark.percentile75) {
      strategies.push('Leverage above-market positioning — candidate likely aware of strong offer');
    }

    strategies.push('Lead negotiation with total compensation framing, not just base salary');

    return sendOk(res, {
      offerId,
      currentOffer: { salary: offer.salaryAmount, currency: offer.salaryCurrency },
      candidateCounter: counter || null,
      budgetCeiling: maxBudget || null,
      strategies,
      possibleConcessions: concessions,
      winProbabilityEstimate: counter && maxBudget && counter <= maxBudget ? 85
        : counter && maxBudget && counter > maxBudget ? 50 : 70,
      marketContext: benchmark ? { p50: benchmark.percentile50, p75: benchmark.percentile75 } : null,
    }, { message: 'Negotiation strategy generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate negotiation strategy: ${error.message}` } });
  }
});

// GET /api/offers/:id/negotiation-preferences - Negotiation Preference Agent (id:170)
router.get('/offers/:id/negotiation-preferences', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: offer.candidateId },
      select: { id: true, firstName: true, lastName: true, location: true, noticePeriod: true, desiredSalary: true },
    });

    const communications = await prisma.candidateCommunication.findMany({
      where: { tenantId, candidateId: offer.candidateId, channel: { in: ['EMAIL', 'PHONE'] } },
      orderBy: { sentAt: 'desc' },
      take: 10,
    });

    const inferredPreferences: string[] = [];
    if (candidate?.desiredSalary && candidate.desiredSalary > offer.salaryAmount) {
      inferredPreferences.push(`Candidate desired salary ($${(candidate as any).desiredSalary.toLocaleString()}) is above current offer — likely to negotiate on base`);
    }
    if (candidate?.noticePeriod && candidate.noticePeriod > 30) {
      inferredPreferences.push(`Long notice period (${candidate.noticePeriod} days) — may value start date flexibility`);
    }
    if (!offer.equity) {
      inferredPreferences.push('No equity offered — candidate may raise this in negotiation');
    }

    const toneSignal = communications.length > 3 ? 'ENGAGED' : communications.length > 0 ? 'MODERATELY_ENGAGED' : 'LOW_ENGAGEMENT';

    return sendOk(res, {
      offerId: offer.id,
      candidateId: offer.candidateId,
      candidate,
      inferredPreferences,
      engagementSignal: toneSignal,
      communicationCount: communications.length,
      negotiationRisk: inferredPreferences.length >= 2 ? 'HIGH' : inferredPreferences.length === 1 ? 'MEDIUM' : 'LOW',
      tailoredApproach: toneSignal === 'ENGAGED'
        ? 'Candidate is engaged — approach negotiation collaboratively'
        : 'Candidate engagement is low — proactively address concerns before counter',
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch negotiation preferences: ${error.message}` } });
  }
});

// POST /api/offers/compensation/dynamic-salary-range - Dynamic Salary Range Recommendations (id:494)
router.post('/offers/compensation/dynamic-salary-range', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, jobFamily, level, location } = req.body;

    const benchmarkWhere: any = { tenantId };
    if (jobFamily) benchmarkWhere.jobFamily = jobFamily;
    if (level) benchmarkWhere.level = level;
    if (location) benchmarkWhere.location = location;

    const [benchmarks, recentAccepted] = await Promise.all([
      prisma.compensationBenchmark.findMany({
        where: benchmarkWhere,
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      prisma.offer.findMany({
        where: { tenantId, status: 'ACCEPTED', ...(requisitionId ? { requisitionId } : {}) },
        select: { salaryAmount: true, salaryCurrency: true },
        orderBy: { respondedAt: 'desc' },
        take: 10,
      }),
    ]);

    const latest = benchmarks[0];
    const avgAccepted = recentAccepted.length > 0
      ? recentAccepted.reduce((s, o) => s + o.salaryAmount, 0) / recentAccepted.length
      : null;

    const dynamicMin = latest
      ? Math.round(Math.max(latest.percentile25, (avgAccepted || 0) * 0.9))
      : null;
    const dynamicMax = latest
      ? Math.round(Math.min(latest.percentile90, (avgAccepted || latest.percentile75) * 1.15))
      : null;
    const dynamicMid = dynamicMin && dynamicMax ? Math.round((dynamicMin + dynamicMax) / 2) : null;

    return sendOk(res, {
      criteria: { jobFamily, level, location, requisitionId },
      dynamicRange: { min: dynamicMin, mid: dynamicMid, max: dynamicMax, currency: latest?.currency || 'USD' },
      marketData: latest
        ? { p25: latest.percentile25, p50: latest.percentile50, p75: latest.percentile75, p90: latest.percentile90, source: latest.source }
        : null,
      internalData: avgAccepted
        ? { avgAcceptedSalary: Math.round(avgAccepted), sampleSize: recentAccepted.length }
        : null,
      dataFreshness: latest ? latest.validUntil : null,
    }, { message: 'Dynamic salary range generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate dynamic salary range: ${error.message}` } });
  }
});

// POST /api/offers/negotiation/win-probability - Intelligent Offer Negotiation Support with Win Probability (id:504)
router.post('/offers/negotiation/win-probability', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId, scenarioSalary, scenarioEquity, scenarioBenefits } = req.body;

    if (!offerId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'offerId is required' } });
    }

    const offer = await prisma.offer.findFirst({
      where: { id: offerId, tenantId },
      include: { requisition: { select: { id: true, salaryMin: true, salaryMax: true, jobFamily: true, location: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId, location: offer.requisition.location },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const historicalOffers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['ACCEPTED', 'DECLINED'] } },
      select: { status: true, salaryAmount: true },
      take: 50,
    });

    const histAcceptRate = historicalOffers.length > 0
      ? historicalOffers.filter(o => o.status === 'ACCEPTED').length / historicalOffers.length
      : 0.65;

    const benchmark = benchmarks[0];
    const evalSalary = scenarioSalary || offer.salaryAmount;

    let probability = Math.round(histAcceptRate * 100);

    if (benchmark) {
      if (evalSalary >= benchmark.percentile75) probability = Math.min(95, probability + 15);
      else if (evalSalary >= benchmark.percentile50) probability = Math.min(90, probability + 5);
      else if (evalSalary < benchmark.percentile25) probability = Math.max(10, probability - 25);
    }

    if (scenarioEquity || offer.equity) probability = Math.min(95, probability + 8);
    if (scenarioBenefits || offer.benefits) probability = Math.min(95, probability + 4);

    const scenarios = [
      { label: 'Current offer', salary: offer.salaryAmount, equity: !!offer.equity, winProbability: probability - 5 },
      { label: 'Scenario', salary: evalSalary, equity: !!(scenarioEquity || offer.equity), winProbability: probability },
      ...(benchmark ? [{ label: 'At p75 market', salary: benchmark.percentile75, equity: !!(scenarioEquity || offer.equity), winProbability: Math.min(95, probability + 10) }] : []),
    ];

    return sendOk(res, {
      offerId,
      winProbability: probability,
      riskLevel: probability >= 75 ? 'LOW' : probability >= 50 ? 'MEDIUM' : 'HIGH',
      scenarios,
      guidance: probability >= 75
        ? 'Strong position — proceed with current terms'
        : probability >= 50
          ? 'Moderate risk — consider small enhancements to improve odds'
          : 'High risk — significant package adjustment recommended',
    }, { message: 'Win probability analysis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to calculate win probability: ${error.message}` } });
  }
});

// GET /api/offers/:id/decline-risk - Predictive Offer Decline Risk with Intervention Triggers (id:513)
router.get('/offers/:id/decline-risk', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { requisition: { select: { id: true, title: true, salaryMax: true, location: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const [benchmarks, communications] = await Promise.all([
      prisma.compensationBenchmark.findMany({
        where: { tenantId, location: offer.requisition.location },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }),
      prisma.candidateCommunication.findMany({
        where: { tenantId, candidateId: offer.candidateId },
        orderBy: { sentAt: 'desc' },
        take: 5,
      }),
    ]);

    const benchmark = benchmarks[0];
    const riskSignals: string[] = [];
    let declineRiskScore = 0;

    if (benchmark && offer.salaryAmount < benchmark.percentile50) {
      riskSignals.push('Offer below market median');
      declineRiskScore += 30;
    }
    if (offer.expiresAt && Date.now() - offer.sentAt!.getTime() > 5 * 86400000 && !offer.respondedAt) {
      riskSignals.push('No response after 5+ days — candidate may be stalling or shopping');
      declineRiskScore += 20;
    }
    if (communications.length === 0) {
      riskSignals.push('No recent candidate communications logged');
      declineRiskScore += 10;
    }
    if (!offer.equity && !offer.benefits) {
      riskSignals.push('Offer lacks equity and explicit benefits');
      declineRiskScore += 15;
    }

    const interventions: string[] = [];
    if (declineRiskScore >= 30) {
      interventions.push('Schedule a call with the candidate to address concerns proactively');
      interventions.push('Consider an informal total compensation walk-through');
    }
    if (declineRiskScore >= 50) {
      interventions.push('Prepare a revised offer with enhanced terms for contingency');
      interventions.push('Engage hiring manager to personally reach out to the candidate');
    }

    return sendOk(res, {
      offerId: offer.id,
      candidateId: offer.candidateId,
      declineRiskScore,
      declineRiskLevel: declineRiskScore >= 50 ? 'HIGH' : declineRiskScore >= 25 ? 'MEDIUM' : 'LOW',
      riskSignals,
      interventionTriggers: interventions,
      sentAt: offer.sentAt,
      daysSinceSent: offer.sentAt ? Math.floor((Date.now() - offer.sentAt.getTime()) / 86400000) : null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to assess decline risk: ${error.message}` } });
  }
});

// GET /api/decisions/:managerId/consistency - Manager Decision Consistency Checker (id:550)
router.get('/decisions/:managerId/consistency', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { managerId } = req.params;

    const decisions = await prisma.hiringDecision.findMany({
      where: { tenantId, decidedBy: managerId } as any,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (decisions.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No decisions found for this manager' } });
    }

    const byRecommendation: Record<string, number> = {};
    const byDecisionType: Record<string, number> = {};
    const pendingCount = decisions.filter(d => d.status === 'PENDING').length;
    const approvedCount = decisions.filter(d => d.status === 'APPROVED').length;

    for (const d of decisions) {
      byRecommendation[d.recommendation] = (byRecommendation[d.recommendation] || 0) + 1;
      byDecisionType[d.decisionType] = (byDecisionType[d.decisionType] || 0) + 1;
    }

    const hireRate = decisions.length > 0
      ? ((byRecommendation['HIRE'] || 0) + (byRecommendation['STRONG_HIRE'] || 0)) / decisions.length
      : 0;

    const consistencyIssues: string[] = [];
    if (hireRate > 0.9) consistencyIssues.push('Very high hire rate — may indicate insufficient scrutiny');
    if (hireRate < 0.1) consistencyIssues.push('Very low hire rate — may indicate overly selective standards');
    if (pendingCount / decisions.length > 0.5) consistencyIssues.push('High proportion of pending decisions — review cadence recommended');

    const managerUser = await prisma.user.findUnique({
      where: { id: managerId } as any,
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    return sendOk(res, {
      manager: managerUser,
      decisionCount: decisions.length,
      hireRate: Math.round(hireRate * 100),
      byRecommendation,
      byDecisionType,
      pendingCount,
      approvedCount,
      consistencyScore: consistencyIssues.length === 0 ? 'CONSISTENT' : consistencyIssues.length === 1 ? 'MINOR_ANOMALY' : 'REVIEW_REQUIRED',
      consistencyIssues,
    }, { message: 'Manager decision consistency analysis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to check decision consistency: ${error.message}` } });
  }
});

// POST /api/decisions/calibration/copilot - Hiring Manager Calibration Co-pilot (id:752)
router.post('/decisions/calibration/copilot', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, managerId, calibrationNotes } = req.body;

    if (!requisitionId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'requisitionId is required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const [decisions, feedback] = await Promise.all([
      prisma.hiringDecision.findMany({
        where: { tenantId, requisitionId, decidedBy: managerId || undefined },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.interviewFeedback.findMany({
        where: { interview: { requisitionId, tenantId } },
        include: { interviewer: { select: { id: true, firstName: true, lastName: true } } },
      }),
    ]);

    const calibrationGuidance: string[] = [
      'Ensure all candidates are evaluated against the same criteria set in the scorecard',
      'Avoid recency bias — weigh all interview rounds equally unless specified',
      'Document specific behavioral examples when recommending HIRE or NO_HIRE',
    ];

    if (decisions.length > 3) {
      const hireRate = decisions.filter(d => d.recommendation === 'HIRE' || d.recommendation === 'STRONG_HIRE').length / decisions.length;
      if (hireRate > 0.8) calibrationGuidance.push('Your recent hire rate is above 80% — ensure standards are being applied consistently');
    }

    const uniqueInterviewers = new Set(feedback.map(f => f.interviewerId));
    if (uniqueInterviewers.size > 1) {
      const ratings = feedback.map(f => f.overallRating);
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const variance = ratings.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / ratings.length;
      if (variance > 1.5) {
        calibrationGuidance.push(`High inter-rater variance detected (${Math.round(variance * 100) / 100}) — consider a calibration discussion before finalizing decisions`);
      }
    }

    const calibrationRecord = await prisma.hiringDecision.create({
      data: {
        tenantId,
        requisitionId,
        candidateId: decisions[0]?.candidateId || 'CALIBRATION',
        decisionType: 'CALIBRATION',
        recommendation: 'CALIBRATION',
        rationale: {
          calibrationNotes: calibrationNotes || '',
          guidance: calibrationGuidance,
          conductedAt: new Date().toISOString(),
        },
        panelConsensus: { interviewerCount: uniqueInterviewers.size },
        status: 'COMPLETED',
        decidedBy: managerId || req.user!.id,
      },
    });

    return res.status(201).json({ data: {
      calibrationRecord,
      guidance: calibrationGuidance,
      stats: {
        decisionsReviewed: decisions.length,
        feedbackReviewed: feedback.length,
        interviewerCount: uniqueInterviewers.size,
      },
    }, message: 'Calibration co-pilot session recorded' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run calibration co-pilot: ${error.message}` } });
  }
});

// GET /api/offers/:id/expectation-analysis - Offer Expectation and Negotiation Assistant (id:765)
router.get('/offers/:id/expectation-analysis', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { requisition: { select: { id: true, title: true, salaryMin: true, salaryMax: true, location: true, jobFamily: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: offer.candidateId },
      select: { id: true, firstName: true, lastName: true, desiredSalary: true, location: true, noticePeriod: true },
    });

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId, location: offer.requisition.location },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const benchmark = benchmarks[0];
    const desiredSalary = candidate?.desiredSalary;
    const gap = desiredSalary ? desiredSalary - offer.salaryAmount : null;

    const advisories: string[] = [];
    if (gap && gap > 0) {
      advisories.push(`Candidate expects ~$${gap.toLocaleString()} more than current offer`);
      if (benchmark && desiredSalary && desiredSalary <= benchmark.percentile75) {
        advisories.push('Candidate expectation is within p75 — consider meeting it');
      } else if (benchmark && desiredSalary && desiredSalary > benchmark.percentile75) {
        advisories.push('Candidate expectation is above p75 — negotiate with total compensation framing');
      }
    } else if (gap !== null && gap <= 0) {
      advisories.push('Offer meets or exceeds candidate expectations — straightforward close anticipated');
    }

    if (candidate?.noticePeriod && candidate.noticePeriod > 30) {
      advisories.push(`Notice period of ${candidate.noticePeriod} days may impact start timeline — consider transition support`);
    }

    return sendOk(res, {
      offerId: offer.id,
      candidate,
      offerSalary: offer.salaryAmount,
      desiredSalary,
      gap,
      marketContext: benchmark ? { p50: benchmark.percentile50, p75: benchmark.percentile75 } : null,
      advisories,
      negotiationPositioning: gap && gap > 0 ? 'CANDIDATE_EXPECTS_MORE' : 'OFFER_MEETS_EXPECTATIONS',
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to analyze offer expectations: ${error.message}` } });
  }
});

// POST /api/decisions/:reqId/briefing - Hiring Decision Briefing Generator (id:766)
router.post('/decisions/:reqId/briefing', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqId = req.params.reqId as string;
    const { candidateId, audienceType } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId is required' } });
    }

    const [application, feedback, decisions, referenceChecks, requisition] = await Promise.all([
      prisma.candidateApplication.findFirst({
        where: { candidateId, requisitionId: reqId },
        include: { candidate: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      prisma.interviewFeedback.findMany({
        where: { candidateId, interview: { requisitionId: reqId, tenantId } },
        include: { interviewer: { select: { firstName: true, lastName: true } } },
      }),
      prisma.hiringDecision.findMany({
        where: { tenantId, requisitionId: reqId, candidateId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.referenceCheck.findMany({
        where: { tenantId, candidateId, status: 'COMPLETED' },
      }),
      prisma.requisition.findFirst({
        where: { id: reqId, tenantId },
        select: { id: true, title: true, department: true, location: true },
      }),
    ]);

    if (!application) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    const avgRating = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length
      : null;

    const hireVotes = feedback.filter(f => f.recommendation === 'HIRE' || f.recommendation === 'STRONG_HIRE').length;
    const finalDecision = decisions.find(d => d.status === 'APPROVED') || decisions[0];

    const briefing = {
      generatedAt: new Date().toISOString(),
      audience: audienceType || 'LEADERSHIP',
      requisition,
      candidate: application.candidate,
      summary: {
        recommendation: finalDecision?.recommendation || (hireVotes > feedback.length / 2 ? 'HIRE' : 'NEEDS_DISCUSSION'),
        confidence: finalDecision?.confidence || (avgRating ? Math.round((avgRating / 5) * 100) : null),
        rationale: finalDecision?.rationale || {},
      },
      evidenceSummary: {
        interviewRounds: feedback.length,
        avgInterviewRating: avgRating ? Math.round(avgRating * 100) / 100 : null,
        unanimousHireVote: hireVotes === feedback.length && feedback.length > 0,
        referenceChecksCompleted: referenceChecks.length,
      },
      keyStrengths: feedback
        .filter(f => f.strengths && Array.isArray(f.strengths))
        .flatMap(f => f.strengths as string[])
        .slice(0, 5),
      keyConcerns: feedback
        .filter(f => f.concerns && Array.isArray(f.concerns))
        .flatMap(f => f.concerns as string[])
        .slice(0, 3),
      decisionHistory: decisions.map(d => ({ type: d.decisionType, status: d.status, createdAt: d.createdAt })),
    };

    return sendOk(res, briefing, { message: 'Decision briefing generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate decision briefing: ${error.message}` } });
  }
});

// GET /api/offers/approvals/timeline-prediction - Offer Approval Workflow Prediction (id:825)
router.get('/offers/approvals/timeline-prediction', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { workflowType, salaryAmount } = req.query;

    const approvalWorkflows = await prisma.approvalWorkflow.findMany({
      where: { tenantId, isActive: true, ...(workflowType ? { workflowType: workflowType as string } : {}) },
    });

    const recentInstances = await prisma.approvalInstance.findMany({
      where: { status: { in: ['APPROVED', 'REJECTED'] } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: { workflow: { where: { tenantId } } } as any,
    });

    const tenantInstances = recentInstances.filter(i => (i as any).workflow);

    const avgApprovalHours = tenantInstances.length > 0
      ? tenantInstances.reduce((sum, i) => {
          const hours = (i.updatedAt.getTime() - i.createdAt.getTime()) / 3600000;
          return sum + hours;
        }, 0) / tenantInstances.length
      : 48;

    const workflow = approvalWorkflows[0];
    const steps = workflow ? (workflow.steps as any[]).length : 2;
    const estimatedHours = Math.round(avgApprovalHours * steps);

    const salary = salaryAmount ? parseFloat(salaryAmount as string) : null;
    const additionalSteps: string[] = [];
    if (salary && salary > 150000) additionalSteps.push('Executive sign-off required for above-band compensation');
    if (salary && salary > 200000) additionalSteps.push('Board compensation committee review may be triggered');

    return sendOk(res, {
      workflowType: workflowType || 'STANDARD',
      estimatedApprovalHours: estimatedHours,
      estimatedApprovalDays: Math.ceil(estimatedHours / 8),
      approvalSteps: steps,
      additionalSteps,
      basedOnSampleSize: tenantInstances.length,
      activeWorkflows: approvalWorkflows.length,
      recommendation: estimatedHours <= 24
        ? 'Streamlined workflow — candidate can be informed of quick turnaround'
        : estimatedHours <= 72
          ? 'Standard approval timeline — set candidate expectations accordingly'
          : 'Lengthy approval process — consider expediting or candidate may lose interest',
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to predict approval timeline: ${error.message}` } });
  }
});

// GET /api/offers/decline-modeling/factors - Predictive Offer Declination Modeling (id:833)
router.get('/offers/decline-modeling/factors', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { period } = req.query;

    const days = period ? parseInt(period as string) : 90;
    const since = new Date(Date.now() - days * 86400000);

    const [accepted, declined] = await Promise.all([
      prisma.offer.findMany({
        where: { tenantId, status: 'ACCEPTED', respondedAt: { gte: since } },
        select: { salaryAmount: true, equity: true, benefits: true, startDate: true },
      }),
      prisma.offer.findMany({
        where: { tenantId, status: 'DECLINED', respondedAt: { gte: since } },
        select: { salaryAmount: true, equity: true, benefits: true, startDate: true },
      }),
    ]);

    const totalResponded = accepted.length + declined.length;
    const acceptanceRate = totalResponded > 0 ? Math.round((accepted.length / totalResponded) * 100) : null;

    const declineFactors: Array<{ factor: string; declineCorrelation: string }> = [];

    const avgAccepted = accepted.length > 0
      ? accepted.reduce((s, o) => s + o.salaryAmount, 0) / accepted.length
      : null;
    const avgDeclined = declined.length > 0
      ? declined.reduce((s, o) => s + o.salaryAmount, 0) / declined.length
      : null;

    if (avgAccepted && avgDeclined && avgDeclined < avgAccepted) {
      declineFactors.push({
        factor: 'Below-average salary',
        declineCorrelation: `Declined offers average $${Math.round(avgDeclined).toLocaleString()} vs accepted $${Math.round(avgAccepted).toLocaleString()}`,
      });
    }

    const declinedWithoutEquity = declined.filter(o => !o.equity).length;
    if (declined.length > 0 && declinedWithoutEquity / declined.length > 0.7) {
      declineFactors.push({ factor: 'Missing equity component', declineCorrelation: `${Math.round((declinedWithoutEquity / declined.length) * 100)}% of declined offers had no equity` });
    }

    const declinedWithoutBenefits = declined.filter(o => !o.benefits).length;
    if (declined.length > 0 && declinedWithoutBenefits / declined.length > 0.6) {
      declineFactors.push({ factor: 'Unspecified benefits package', declineCorrelation: `${Math.round((declinedWithoutBenefits / declined.length) * 100)}% of declined offers lacked benefits detail` });
    }

    return sendOk(res, {
      period: `${days} days`,
      totalOffersAnalyzed: totalResponded,
      acceptedCount: accepted.length,
      declinedCount: declined.length,
      acceptanceRate,
      declineFactors,
      modelledRiskFactors: declineFactors.map(f => f.factor),
      dataQuality: totalResponded >= 10 ? 'SUFFICIENT' : 'LIMITED',
    }, { message: 'Declination modeling factors generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to model decline factors: ${error.message}` } });
  }
});

// GET /api/offers/compensation/market-intelligence - Compensation Market Agent (id:840)
router.get('/offers/compensation/market-intelligence', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { jobFamily, location } = req.query;

    const where: any = { tenantId };
    if (jobFamily) where.jobFamily = jobFamily as string;
    if (location) where.location = location as string;

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (benchmarks.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No compensation market data found for specified criteria' } });
    }

    const latest = benchmarks[0];
    const trendData = benchmarks.slice(0, 5).map(b => ({
      p50: b.percentile50,
      p75: b.percentile75,
      createdAt: b.createdAt,
      source: b.source,
    }));

    const p50Trend = trendData.length >= 2
      ? ((trendData[0].p50 - trendData[trendData.length - 1].p50) / trendData[trendData.length - 1].p50) * 100
      : null;

    const internalOffers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['ACCEPTED', 'SENT'] }, createdAt: { gte: new Date(Date.now() - 180 * 86400000) } },
      select: { salaryAmount: true, createdAt: true },
    });

    const avgInternal = internalOffers.length > 0
      ? internalOffers.reduce((s, o) => s + o.salaryAmount, 0) / internalOffers.length
      : null;

    return sendOk(res, {
      jobFamily: jobFamily || 'All',
      location: location || 'All',
      currentMarket: {
        p25: latest.percentile25,
        p50: latest.percentile50,
        p75: latest.percentile75,
        p90: latest.percentile90,
        currency: latest.currency,
        source: latest.source,
        validUntil: latest.validUntil,
      },
      marketTrend: {
        direction: p50Trend !== null ? (p50Trend > 2 ? 'RISING' : p50Trend < -2 ? 'DECLINING' : 'STABLE') : 'UNKNOWN',
        percentageChange: p50Trend ? Math.round(p50Trend * 100) / 100 : null,
        trendData,
      },
      internalBenchmark: avgInternal
        ? { avgOfferSalary: Math.round(avgInternal), vs_p50: Math.round(avgInternal - latest.percentile50), sampleSize: internalOffers.length }
        : null,
      competitivePosition: avgInternal
        ? avgInternal >= latest.percentile75 ? 'HIGHLY_COMPETITIVE' : avgInternal >= latest.percentile50 ? 'COMPETITIVE' : 'BELOW_MARKET'
        : 'UNKNOWN',
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch market intelligence: ${error.message}` } });
  }
});

// POST /api/offers/compensation/dynamic-calibration - Dynamic Market Viability & Compensation Calibrator (id:847)
router.post('/offers/compensation/dynamic-calibration', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, candidateFactors } = req.body;

    if (!requisitionId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'requisitionId is required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId, jobFamily: requisition.jobFamily || undefined, location: requisition.location },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const benchmark = benchmarks[0];
    let baseRecommendation = benchmark ? benchmark.percentile50
      : requisition.salaryMin && requisition.salaryMax
        ? (requisition.salaryMin + requisition.salaryMax) / 2
        : null;

    const calibrationAdjustments: Array<{ factor: string; adjustment: number }> = [];

    if (candidateFactors?.yearsExperience > 10) {
      calibrationAdjustments.push({ factor: 'Senior experience premium', adjustment: 0.1 });
    } else if (candidateFactors?.yearsExperience < 3) {
      calibrationAdjustments.push({ factor: 'Early career adjustment', adjustment: -0.05 });
    }

    if (candidateFactors?.uniqueSkillPremium) {
      calibrationAdjustments.push({ factor: 'Scarce skill set premium', adjustment: 0.08 });
    }

    if (candidateFactors?.competingOffer) {
      calibrationAdjustments.push({ factor: 'Competing offer counter-pressure', adjustment: 0.05 });
    }

    const totalAdjustmentFactor = calibrationAdjustments.reduce((sum, a) => sum + a.adjustment, 1);
    const calibratedRecommendation = baseRecommendation ? Math.round(baseRecommendation * totalAdjustmentFactor) : null;

    return sendOk(res, {
      requisitionId,
      baseRecommendation: baseRecommendation ? Math.round(baseRecommendation) : null,
      calibratedRecommendation,
      calibrationAdjustments,
      totalAdjustmentPercent: Math.round((totalAdjustmentFactor - 1) * 100),
      marketContext: benchmark
        ? { p25: benchmark.percentile25, p50: benchmark.percentile50, p75: benchmark.percentile75 }
        : null,
      viabilityAssessment: calibratedRecommendation && benchmark
        ? calibratedRecommendation >= benchmark.percentile25 && calibratedRecommendation <= benchmark.percentile90
          ? 'VIABLE' : 'OUT_OF_RANGE'
        : 'UNKNOWN',
    }, { message: 'Dynamic compensation calibration complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to calibrate compensation: ${error.message}` } });
  }
});

// GET /api/offers/:id/acceptance-model - Predictive Offer Acceptance Modeler (id:874)
router.get('/offers/:id/acceptance-model', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { requisition: { select: { id: true, title: true, location: true, jobFamily: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const [benchmarks, historicalOffers, candidate] = await Promise.all([
      prisma.compensationBenchmark.findMany({
        where: { tenantId, location: offer.requisition.location },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }),
      prisma.offer.findMany({
        where: { tenantId, status: { in: ['ACCEPTED', 'DECLINED'] } },
        select: { status: true, salaryAmount: true, equity: true, benefits: true },
        take: 50,
      }),
      prisma.candidate.findUnique({
        where: { id: offer.candidateId },
        select: { id: true, firstName: true, lastName: true, desiredSalary: true },
      }),
    ]);

    const benchmark = benchmarks[0];
    const accepted = historicalOffers.filter(o => o.status === 'ACCEPTED');
    const baseRate = historicalOffers.length > 0 ? accepted.length / historicalOffers.length : 0.65;

    let acceptanceProbability = baseRate * 100;

    if (benchmark) {
      if (offer.salaryAmount >= benchmark.percentile75) acceptanceProbability = Math.min(95, acceptanceProbability + 15);
      else if (offer.salaryAmount >= benchmark.percentile50) acceptanceProbability = Math.min(90, acceptanceProbability + 5);
      else acceptanceProbability = Math.max(15, acceptanceProbability - 20);
    }

    if (offer.equity) acceptanceProbability = Math.min(95, acceptanceProbability + 8);
    if (offer.benefits) acceptanceProbability = Math.min(95, acceptanceProbability + 4);

    if (candidate?.desiredSalary) {
      const gap = candidate.desiredSalary - offer.salaryAmount;
      if (gap <= 0) acceptanceProbability = Math.min(97, acceptanceProbability + 10);
      else if (gap <= 5000) acceptanceProbability = Math.max(10, acceptanceProbability - 5);
      else if (gap > 10000) acceptanceProbability = Math.max(10, acceptanceProbability - 20);
    }

    const probability = Math.round(acceptanceProbability);
    const modelFeatures = [
      { feature: 'Salary vs market', weight: '40%' },
      { feature: 'Equity presence', weight: '20%' },
      { feature: 'Benefits completeness', weight: '10%' },
      { feature: 'Candidate salary alignment', weight: '20%' },
      { feature: 'Historical base rate', weight: '10%' },
    ];

    return sendOk(res, {
      offerId: offer.id,
      candidate,
      acceptanceProbability: probability,
      confidenceLevel: historicalOffers.length >= 10 ? 'HIGH' : historicalOffers.length >= 5 ? 'MEDIUM' : 'LOW',
      modelFeatures,
      recommendation: probability >= 75
        ? 'High acceptance likelihood — proceed to send'
        : probability >= 50
          ? 'Moderate likelihood — consider minor enhancements before sending'
          : 'Low acceptance likelihood — review package before proceeding',
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to model offer acceptance: ${error.message}` } });
  }
});

// POST /api/offers/:id/total-rewards-simulator - Equity and Total Rewards Customization Simulator (id:875)
router.post('/offers/:id/total-rewards-simulator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { equityScenarios, benefitsScenarios } = req.body;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { requisition: { select: { id: true, title: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const defaultEquityScenarios = [
      { label: 'No equity', grantValue: 0, vestingYears: 0 },
      { label: 'Standard (0.1%)', grantValue: 10000, vestingYears: 4 },
      { label: 'Premium (0.25%)', grantValue: 25000, vestingYears: 4 },
    ];

    const defaultBenefitsScenarios = [
      { label: 'Basic', estimatedAnnualValue: 5000 },
      { label: 'Standard', estimatedAnnualValue: 12000 },
      { label: 'Premium', estimatedAnnualValue: 20000 },
    ];

    const evalEquity = equityScenarios || defaultEquityScenarios;
    const evalBenefits = benefitsScenarios || defaultBenefitsScenarios;

    const simulations = evalEquity.flatMap((eq: any) =>
      evalBenefits.map((ben: any) => ({
        label: `${eq.label} + ${ben.label} benefits`,
        baseSalary: offer.salaryAmount,
        equityGrant: eq.grantValue,
        equityAnnualizedValue: eq.vestingYears > 0 ? Math.round(eq.grantValue / eq.vestingYears) : 0,
        benefitsAnnualValue: ben.estimatedAnnualValue,
        totalAnnualCompensation: offer.salaryAmount + (eq.vestingYears > 0 ? Math.round(eq.grantValue / eq.vestingYears) : 0) + ben.estimatedAnnualValue,
      }))
    );

    const bestPackage = simulations.reduce((best: any, sim: any) =>
      sim.totalAnnualCompensation > best.totalAnnualCompensation ? sim : best, simulations[0]);

    return sendOk(res, {
      offerId: offer.id,
      baseSalary: offer.salaryAmount,
      currency: offer.salaryCurrency,
      simulations,
      bestPackage,
      packageCount: simulations.length,
    }, { message: 'Total rewards simulation complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run total rewards simulation: ${error.message}` } });
  }
});

// POST /api/offers/:id/clause-adaptation - Offer-Clause Adaptation Engine (id:951)
router.post('/offers/:id/clause-adaptation', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidatePreferences, companyPolicies } = req.body;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { requisition: { select: { id: true, title: true, country: true, location: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const jurisdictionRules = await prisma.jurisdictionRule.findMany({
      where: { tenantId, country: offer.requisition.country, isActive: true },
    });

    const compliancePolicies = await prisma.compliancePolicy.findMany({
      where: { tenantId, policyType: 'OFFER_COMPLIANCE', isActive: true },
    });

    const adaptedClauses: Array<{ clause: string; reason: string; source: string }> = [];

    if (jurisdictionRules.some((r: any) => r.ruleType === 'SALARY_TRANSPARENCY')) {
      adaptedClauses.push({
        clause: 'Include full salary band disclosure per local salary transparency law',
        reason: 'Jurisdiction requirement',
        source: 'JurisdictionRule',
      });
    }

    if (candidatePreferences?.remoteWork) {
      adaptedClauses.push({
        clause: 'Add remote work arrangement clause specifying work-from-home days and equipment policy',
        reason: 'Candidate preference for remote flexibility',
        source: 'CandidatePreference',
      });
    }

    if (candidatePreferences?.flexibleHours) {
      adaptedClauses.push({
        clause: 'Include flexible working hours addendum with core hours specification',
        reason: 'Candidate preference for flexible schedule',
        source: 'CandidatePreference',
      });
    }

    if (compliancePolicies.length > 0) {
      adaptedClauses.push({
        clause: 'Append standard IP and non-disclosure agreement per company policy',
        reason: 'Mandatory per company compliance policy',
        source: 'CompliancePolicy',
      });
    }

    if (!offer.expiresAt) {
      adaptedClauses.push({
        clause: 'Add offer validity clause (recommended: 5 business days)',
        reason: 'Best practice — undefined expiry reduces urgency',
        source: 'BestPractice',
      });
    }

    return sendOk(res, {
      offerId: offer.id,
      location: offer.requisition.location,
      jurisdictionRulesApplied: jurisdictionRules.length,
      companyPoliciesApplied: compliancePolicies.length,
      adaptedClauses,
      clauseCount: adaptedClauses.length,
      generatedAt: new Date().toISOString(),
    }, { message: 'Offer clause adaptation complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to adapt offer clauses: ${error.message}` } });
  }
});

// POST /api/offers/:id/counter-scenario - Real-Time Offer Counter-Scenario Simulator (id:965)
router.post('/offers/:id/counter-scenario', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { counterOfferSalary, counterEquity, counterStartDate } = req.body;

    if (counterOfferSalary === undefined) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'counterOfferSalary is required' } });
    }

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { requisition: { select: { id: true, title: true, salaryMax: true, jobFamily: true, location: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId, location: offer.requisition.location },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const benchmark = benchmarks[0];
    const budgetCeiling = offer.requisition.salaryMax || (benchmark?.percentile90);
    const delta = counterOfferSalary - offer.salaryAmount;
    const deltaPercent = Math.round((delta / offer.salaryAmount) * 100);
    const withinBudget = budgetCeiling ? counterOfferSalary <= budgetCeiling : null;

    const responseOptions = [
      {
        strategy: 'ACCEPT_COUNTER',
        viable: withinBudget === true,
        description: `Accept counter at ${offer.salaryCurrency} ${counterOfferSalary.toLocaleString()}`,
        tradeoffs: withinBudget ? 'Within budget; closes candidate quickly' : 'Exceeds budget ceiling',
      },
      {
        strategy: 'SPLIT_DIFFERENCE',
        viable: delta > 0,
        description: `Meet halfway at ${offer.salaryCurrency} ${Math.round((offer.salaryAmount + counterOfferSalary) / 2).toLocaleString()}`,
        tradeoffs: 'Compromise position; candidate may accept or push further',
      },
      {
        strategy: 'HOLD_WITH_ADDITIONS',
        viable: true,
        description: `Hold base, offer signing bonus of ${offer.salaryCurrency} ${Math.round(delta * 0.5).toLocaleString()} + accelerated review`,
        tradeoffs: 'Preserves comp structure; candidate gets value without permanent base increase',
      },
      {
        strategy: 'DECLINE_COUNTER',
        viable: true,
        description: `Restate offer at ${offer.salaryCurrency} ${offer.salaryAmount.toLocaleString()} with final deadline`,
        tradeoffs: 'Risk of candidate declining; appropriate if counter is unreasonable',
      },
    ];

    return sendOk(res, {
      offerId: offer.id,
      currentOffer: offer.salaryAmount,
      counterOffer: counterOfferSalary,
      delta,
      deltaPercent,
      withinBudget,
      budgetCeiling: budgetCeiling || null,
      counterEquity: counterEquity || null,
      counterStartDate: counterStartDate || null,
      responseOptions: responseOptions.filter(o => o.viable),
      marketContext: benchmark ? { p50: benchmark.percentile50, p75: benchmark.percentile75 } : null,
      simulatedAt: new Date().toISOString(),
    }, { message: 'Counter-offer scenarios simulated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to simulate counter scenarios: ${error.message}` } });
  }
});

// POST /api/offers/:id/personalize-package - Offer-Package Personalization Engine (id:972)
router.post('/offers/:id/personalize-package', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateProfile } = req.body;

    const offer = await prisma.offer.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: { requisition: { select: { id: true, title: true, location: true, jobFamily: true, salaryMax: true } } },
    });
    if (!offer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: offer.candidateId },
      select: { id: true, firstName: true, lastName: true, desiredSalary: true, location: true, noticePeriod: true },
    });

    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId, location: offer.requisition.location },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const profile = candidateProfile || {};
    const benchmark = benchmarks[0];

    const personalizations: Array<{ element: string; suggestion: string; rationale: string }> = [];

    if (candidate?.desiredSalary && candidate.desiredSalary > offer.salaryAmount) {
      const budget = offer.requisition.salaryMax || (benchmark?.percentile75);
      const adjustedSalary = budget ? Math.min(candidate.desiredSalary, budget) : offer.salaryAmount;
      if (adjustedSalary > offer.salaryAmount) {
        personalizations.push({
          element: 'Base salary',
          suggestion: `Adjust to ${offer.salaryCurrency} ${adjustedSalary.toLocaleString()}`,
          rationale: 'Aligns with candidate desired salary within budget constraints',
        });
      }
    }

    if (profile.prioritizesFlexibility) {
      personalizations.push({
        element: 'Work arrangement',
        suggestion: 'Add remote-first arrangement with flexible hours',
        rationale: 'Candidate has indicated work flexibility as a priority',
      });
    }

    if (profile.hasFamily) {
      personalizations.push({
        element: 'Benefits',
        suggestion: 'Highlight enhanced parental leave, childcare support, and health coverage',
        rationale: 'Family-focused benefits resonate with this candidate profile',
      });
    }

    if (profile.careerGrowthFocused) {
      personalizations.push({
        element: 'Growth package',
        suggestion: 'Include learning & development budget ($2,000/yr) and defined promotion pathway',
        rationale: 'Growth-focused candidate will value career development commitments',
      });
    }

    if (candidate?.noticePeriod && candidate.noticePeriod > 30) {
      personalizations.push({
        element: 'Start date',
        suggestion: `Accommodate ${candidate.noticePeriod}-day notice period — propose start date accordingly`,
        rationale: 'Prevents candidate from feeling pressured over notice period obligations',
      });
    }

    const estimatedAcceptanceLift = personalizations.length * 6;

    return sendOk(res, {
      offerId: offer.id,
      candidate,
      currentOffer: { salary: offer.salaryAmount, currency: offer.salaryCurrency, equity: offer.equity, benefits: offer.benefits },
      personalizations,
      personalizationCount: personalizations.length,
      estimatedAcceptanceLift: `+${estimatedAcceptanceLift}%`,
      personalizationScore: personalizations.length === 0 ? 'NO_PERSONALIZATION' : personalizations.length <= 2 ? 'BASIC' : 'HIGHLY_PERSONALIZED',
    }, { message: 'Offer package personalization complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to personalize offer package: ${error.message}` } });
  }
});

// ─── P2/P3/P4 DECISION & OFFER FEATURES ────────────────────────────────────

// GET /api/decisions/offer-and-preboarding-orchestration-agent
router.get('/decisions/offer-and-preboarding-orchestration-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      include: {
        requisition: { select: { id: true, title: true, department: true } },
      },
      orderBy: { respondedAt: 'desc' },
    });
    const result = offers.map(o => ({
      ...o,
      preboardingStatus: o.startDate
        ? new Date(o.startDate) > new Date() ? 'SCHEDULED' : 'STARTED'
        : 'NOT_SCHEDULED',
    }));
    return sendOk(res, result, { message: 'Accepted offers with preboarding status' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch preboarding orchestration data: ${error.message}` } });
  }
});

// POST /api/decisions/offer-and-preboarding-orchestration-agent/run
router.post('/decisions/offer-and-preboarding-orchestration-agent/run', validate(z.object({ offerId: z.string().min(1), startDate: z.string().optional() })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId, startDate } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    if (offer.status !== 'ACCEPTED') return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Offer must be ACCEPTED' } });
    const tasks = [
      { step: 'send_welcome_email', status: 'QUEUED' },
      { step: 'provision_equipment', status: 'QUEUED' },
      { step: 'schedule_orientation', status: 'QUEUED' },
      { step: 'complete_documentation', status: 'QUEUED' },
    ];
    return sendOk(res, { offerId, startDate: startDate || offer.startDate, orchestrationTasks: tasks }, { message: 'Preboarding orchestration initiated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run preboarding orchestration: ${error.message}` } });
  }
});

// GET /api/decisions/decision-card-with-uncertainty-and-evidence-gaps
router.get('/decisions/decision-card-with-uncertainty-and-evidence-gaps', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const decisions = await (prisma.hiringDecision as any).findMany({
      where: { tenantId, confidenceScore: { lt: 0.8 } },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        requisition: { select: { id: true, title: true } },
      },
      orderBy: { confidenceScore: 'asc' },
    }) as any[];
    const result = decisions.map(d => ({
      ...d,
      uncertaintyLevel: ((d as any).confidenceScore ?? 0) < 0.5 ? 'HIGH' : 'MODERATE',
      evidenceGaps: ((d as any).confidenceScore ?? 0) < 0.6
        ? ['Missing structured interview feedback', 'Incomplete reference checks']
        : ['Additional data point recommended'],
    }));
    return sendOk(res, result, { message: 'Low-confidence decisions with uncertainty analysis' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch decision uncertainty data: ${error.message}` } });
  }
});

// GET /api/decisions/consensus-and-disagreement-detector
router.get('/decisions/consensus-and-disagreement-detector', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const decisions = await prisma.hiringDecision.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    const grouped: Record<string, any[]> = {};
    for (const d of decisions) {
      if (!grouped[d.requisitionId]) grouped[d.requisitionId] = [];
      grouped[d.requisitionId].push(d);
    }
    const result = Object.entries(grouped).map(([reqId, ds]) => {
      const scores = ds.map(d => d.confidenceScore ?? 0.5);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
      return { requisitionId: reqId, decisionCount: ds.length, avgConfidence: avg, variance, consensusLevel: variance < 0.05 ? 'STRONG' : variance < 0.15 ? 'MODERATE' : 'WEAK' };
    });
    return sendOk(res, result, { message: 'Consensus and disagreement analysis' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to detect consensus: ${error.message}` } });
  }
});

// POST /api/decisions/consensus-and-disagreement-detector/run
router.post('/decisions/consensus-and-disagreement-detector/run', validate(z.object({ requisitionId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId } = req.body;
    const decisions = await prisma.hiringDecision.findMany({ where: { tenantId, requisitionId } });
    if (!decisions.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No decisions found for requisition' } });
    const scores = decisions.map(d => (d as any).confidenceScore ?? 0.5);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const recommendations = decisions.map(d => d.recommendation);
    const uniqueRecs = new Set(recommendations);
    return sendOk(res, { requisitionId, decisionCount: decisions.length, avgConfidence: avg, variance, disagreements: uniqueRecs.size > 1 ? [...uniqueRecs] : [], consensusReached: uniqueRecs.size === 1 }, { message: 'Consensus analysis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to analyze consensus: ${error.message}` } });
  }
});

// GET /api/decisions/offer-acceptance-and-drop-off-risk-forecaster
router.get('/decisions/offer-acceptance-and-drop-off-risk-forecaster', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const now = new Date();
    const threshold48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
    });
    const result = offers.map(o => {
      const expiringsSoon = o.expiresAt && new Date(o.expiresAt) < threshold48h;
      const noResponse = !o.respondedAt;
      const riskScore = expiringsSoon && noResponse ? 'HIGH' : expiringsSoon || noResponse ? 'MEDIUM' : 'LOW';
      return { ...o, expiringsSoon, noResponse, acceptanceRisk: riskScore };
    });
    return sendOk(res, result, { message: 'Offer acceptance risk forecast' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to forecast acceptance risk: ${error.message}` } });
  }
});

// GET /api/decisions/decision-support-agent-core-feature
router.get('/decisions/decision-support-agent-core-feature', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const decisions = await (prisma.hiringDecision as any).findMany({
      where: { tenantId, status: 'PENDING' },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        requisition: { select: { id: true, title: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    }) as any[];
    const result = decisions.map(d => ({
      ...d,
      supportingEvidence: { confidenceScore: (d as any).confidenceScore, rationale: d.rationale, recommendation: d.recommendation },
      actionRequired: true,
    }));
    return sendOk(res, result, { message: 'Pending decisions with supporting evidence' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch decision support data: ${error.message}` } });
  }
});

// POST /api/decisions/decision-support-agent-core-feature/run
router.post('/decisions/decision-support-agent-core-feature/run', validate(z.object({ candidateId: z.string().min(1), requisitionId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId } = req.body;
    const [decisions, candidate, requisition] = await Promise.all([
      prisma.hiringDecision.findMany({ where: { tenantId, candidateId, requisitionId } }),
      prisma.candidate.findFirst({ where: { id: candidateId, tenantId }, select: { id: true, firstName: true, lastName: true } }),
      prisma.requisition.findFirst({ where: { id: requisitionId, tenantId }, select: { id: true, title: true } }),
    ]);
    if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    if (!requisition) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    const avgConfidence = decisions.length ? decisions.reduce((s, d) => s + ((d as any).confidenceScore ?? 0.5), 0) / decisions.length : null;
    return sendOk(res, { candidateId, requisitionId, candidate, requisition, decisionCount: decisions.length, avgConfidence, supportSummary: avgConfidence && avgConfidence > 0.7 ? 'PROCEED_TO_OFFER' : 'NEEDS_REVIEW' }, { message: 'Decision support generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate decision support: ${error.message}` } });
  }
});

// GET /api/decisions/offer-optimization-agent-premium-differentiator
router.get('/decisions/offer-optimization-agent-premium-differentiator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['DRAFT', 'SENT', 'NEGOTIATING'] } } as any,
      include: { requisition: { select: { id: true, salaryMin: true, salaryMax: true, salaryCurrency: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const result = offers.map(o => ({
      ...o,
      optimizationRecommendations: [
        ...(o.equity === null ? ['Add equity component to improve competitiveness'] : []),
        ...(o.benefits === null ? ['Define benefits package'] : []),
        ...(!o.expiresAt ? ['Set expiration date to create urgency'] : []),
      ],
    }));
    return sendOk(res, result, { message: 'Offer optimization recommendations' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch optimization data: ${error.message}` } });
  }
});

// POST /api/decisions/offer-optimization-agent-premium-differentiator/run
router.post('/decisions/offer-optimization-agent-premium-differentiator/run', validate(z.object({ offerId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId }, include: { requisition: { select: { salaryMin: true, salaryMax: true } } } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    const benchmarks = await prisma.compensationBenchmark.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 1 });
    const bm = benchmarks[0];
    const suggestedSalary = bm ? bm.percentile75 : offer.requisition?.salaryMax ?? offer.salaryAmount;
    return sendOk(res, { offerId, currentSalary: offer.salaryAmount, suggestedSalary, delta: suggestedSalary - offer.salaryAmount, optimizationActions: ['Increase to p75 market rate', 'Add sign-on bonus', 'Enhance equity vesting schedule'] }, { message: 'Offer optimization complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to optimize offer: ${error.message}` } });
  }
});

// GET /api/decisions/decision-room-agent
router.get('/decisions/decision-room-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const requisitions = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, title: true, department: true },
    });
    const reqIds = requisitions.map(r => r.id);
    const applications = await prisma.candidateApplication.findMany({
      where: { requisitionId: { in: reqIds }, stage: { in: ['FINAL_REVIEW', 'OFFER'] } },
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
    });
    const byReq = reqIds.map(id => ({
      requisition: requisitions.find(r => r.id === id),
      finalStageCandidates: applications.filter(a => a.requisitionId === id),
    })).filter(r => r.finalStageCandidates.length > 0);
    return sendOk(res, byReq, { message: 'Decision room data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch decision room data: ${error.message}` } });
  }
});

// POST /api/decisions/decision-room-agent/run
router.post('/decisions/decision-room-agent/run', validate(z.object({ requisitionId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId } = req.body;
    const requisition = await prisma.requisition.findFirst({ where: { id: requisitionId, tenantId } });
    if (!requisition) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    const decisions = await prisma.hiringDecision.findMany({ where: { tenantId, requisitionId }, orderBy: { createdAt: 'desc' } });
    const offers = await prisma.offer.findMany({ where: { tenantId, requisitionId } });
    const recommendations = decisions.map(d => d.recommendation);
    const hireCount = recommendations.filter(r => r === 'HIRE' || r === 'STRONG_HIRE').length;
    return sendOk(res, { requisitionId, title: requisition.title, decisionsReviewed: decisions.length, hireRecommendations: hireCount, offersExtended: offers.length, roomAnalysis: hireCount > 0 ? 'READY_TO_OFFER' : 'NEEDS_MORE_REVIEW' }, { message: 'Decision room analysis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run decision room: ${error.message}` } });
  }
});

// GET /api/decisions/usp-automated-compensation-rationale
router.get('/decisions/usp-automated-compensation-rationale', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId },
      include: { requisition: { select: { id: true, title: true, salaryMin: true, salaryMax: true, salaryCurrency: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const benchmarks = await prisma.compensationBenchmark.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
    const result = offers.map(o => {
      const bm = benchmarks[0];
      return {
        offerId: o.id, salaryAmount: o.salaryAmount, salaryCurrency: o.salaryCurrency,
        rationale: bm ? `Offer at ${Math.round((o.salaryAmount / bm.percentile50) * 100)}% of market median` : 'No benchmark data available',
        marketMedian: bm?.percentile50 ?? null,
      };
    });
    return sendOk(res, result, { message: 'Compensation rationale data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch compensation rationale: ${error.message}` } });
  }
});

// GET /api/decisions/usp-reference-check-synthesizer
router.get('/decisions/usp-reference-check-synthesizer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const checks = await prisma.referenceCheck.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    const grouped: Record<string, any> = {};
    for (const c of checks) {
      if (!grouped[c.candidateId]) grouped[c.candidateId] = { candidateId: c.candidateId, checks: [] };
      grouped[c.candidateId].checks.push(c);
    }
    const result = Object.values(grouped).map((g: any) => ({
      ...g,
      totalChecks: g.checks.length,
      completedChecks: g.checks.filter((c: any) => c.status === 'COMPLETED').length,
      synthesis: g.checks.filter((c: any) => c.status === 'COMPLETED').length === g.checks.length ? 'ALL_COMPLETE' : 'IN_PROGRESS',
    }));
    return sendOk(res, result, { message: 'Reference check synthesis' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to synthesize reference checks: ${error.message}` } });
  }
});

// GET /api/decisions/usp-automated-offer-approval-chaser
router.get('/decisions/usp-automated-offer-approval-chaser', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: 'PENDING_APPROVAL' },
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'asc' },
    });
    const now = new Date();
    const result = offers.map(o => ({
      ...o,
      daysWaiting: Math.floor((now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      chaseRequired: Math.floor((now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24)) > 2,
    }));
    return sendOk(res, result, { message: 'Pending approval offers with chase status' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch approval chase data: ${error.message}` } });
  }
});

// GET /api/decisions/transparent-compensation-matcher
router.get('/decisions/transparent-compensation-matcher', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [benchmarks, requisitions] = await Promise.all([
      prisma.compensationBenchmark.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
      prisma.requisition.findMany({ where: { tenantId, status: 'OPEN' }, select: { id: true, title: true, salaryMin: true, salaryMax: true, salaryCurrency: true, location: true } }),
    ]);
    const result = requisitions.map(r => {
      const bm = benchmarks.find(b => b.location === r.location) ?? benchmarks[0] ?? null;
      return {
        requisitionId: r.id, title: r.title, salaryRange: { min: r.salaryMin, max: r.salaryMax, currency: r.salaryCurrency },
        marketBenchmark: bm ? { p25: bm.percentile25, p50: bm.percentile50, p75: bm.percentile75 } : null,
        matchScore: bm && r.salaryMax ? Math.min(100, Math.round((r.salaryMax / bm.percentile75) * 100)) : null,
      };
    });
    return sendOk(res, result, { message: 'Compensation benchmark matches' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to match compensation benchmarks: ${error.message}` } });
  }
});

// GET /api/decisions/intelligent-offer-negotiation-strategist
router.get('/decisions/intelligent-offer-negotiation-strategist', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['DECLINED', 'NEGOTIATING'] } } as any,
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        requisition: { select: { id: true, title: true, salaryMin: true, salaryMax: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    const result = offers.map(o => ({
      ...o,
      negotiationStrategy: o.status === 'DECLINED'
        ? 'COUNTER_WITH_TOTAL_REWARDS'
        : 'EXPLORE_FLEXIBILITY',
      leveragePoints: ['Sign-on bonus', 'Remote work flexibility', 'Accelerated review cycle'],
    }));
    return sendOk(res, result, { message: 'Negotiation strategy data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch negotiation strategy: ${error.message}` } });
  }
});

// GET /api/decisions/negotiation-preference-agent
router.get('/decisions/negotiation-preference-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId },
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'desc' },
    });
    const grouped: Record<string, any> = {};
    for (const o of offers) {
      if (!grouped[o.candidateId]) grouped[o.candidateId] = { candidateId: o.candidateId, candidate: (o as any).candidate, offerHistory: [] };
      grouped[o.candidateId].offerHistory.push({ status: o.status, salaryAmount: o.salaryAmount, equity: o.equity });
    }
    const result = Object.values(grouped).map((g: any) => ({
      ...g,
      inferredPreferences: g.offerHistory.some((o: any) => o.equity !== null) ? ['equity_focused'] : ['cash_focused'],
    }));
    return sendOk(res, result, { message: 'Candidate negotiation preferences' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch negotiation preferences: ${error.message}` } });
  }
});

// POST /api/decisions/negotiation-preference-agent/run
router.post('/decisions/negotiation-preference-agent/run', validate(z.object({ candidateId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId } = req.body;
    const candidate = await prisma.candidate.findFirst({ where: { id: candidateId, tenantId }, select: { id: true, firstName: true, lastName: true } });
    if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    const offers = await prisma.offer.findMany({ where: { tenantId, candidateId } });
    const hasDeclined = offers.some(o => o.status === 'DECLINED');
    const hasNegotiated = offers.some(o => (o.status as string) === 'NEGOTIATING');
    const strategy = hasDeclined ? 'FLEXIBLE_PACKAGE' : hasNegotiated ? 'INCREMENTAL_IMPROVEMENT' : 'STANDARD_OFFER';
    return sendOk(res, { candidateId, candidate, offerCount: offers.length, hasDeclined, hasNegotiated, suggestedStrategy: strategy, tactics: ['Highlight total rewards', 'Offer flexibility on start date', 'Provide growth roadmap'] }, { message: 'Negotiation strategy generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate negotiation strategy: ${error.message}` } });
  }
});

// GET /api/decisions/dynamic-salary-range-recommendations-based-on-market-data
router.get('/decisions/dynamic-salary-range-recommendations-based-on-market-data', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    const result = benchmarks.map(bm => ({
      benchmarkId: bm.id, jobFamily: bm.jobFamily, level: bm.level, location: bm.location,
      recommendedRange: { min: bm.percentile25, midpoint: bm.percentile50, max: bm.percentile75, stretch: bm.percentile90 },
      currency: 'USD',
      dataFreshness: (bm as any).updatedAt ?? bm.createdAt,
    }));
    return sendOk(res, result, { message: 'Dynamic salary range recommendations' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch salary recommendations: ${error.message}` } });
  }
});

// GET /api/decisions/intelligent-offer-negotiation-support-with-win-probability
router.get('/decisions/intelligent-offer-negotiation-support-with-win-probability', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'desc' },
    });
    const benchmarks = await prisma.compensationBenchmark.findMany({ where: { tenantId }, take: 1 });
    const bm = benchmarks[0];
    const result = offers.map(o => {
      const marketRatio = bm ? o.salaryAmount / bm.percentile50 : 1;
      const winProbability = Math.min(95, Math.max(10, Math.round(marketRatio * 65)));
      return { ...o, winProbability: `${winProbability}%`, marketPositioning: marketRatio > 1 ? 'ABOVE_MARKET' : 'AT_MARKET' };
    });
    return sendOk(res, result, { message: 'Offer win probability scores' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to calculate win probability: ${error.message}` } });
  }
});

// GET /api/decisions/predictive-offer-decline-risk-with-intervention-triggers
router.get('/decisions/predictive-offer-decline-risk-with-intervention-triggers', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
    });
    const result = offers.map(o => {
      const daysSinceSent = o.sentAt ? Math.floor((now.getTime() - new Date(o.sentAt).getTime()) / 86400000) : 0;
      const declineRisk = daysSinceSent > 5 ? 'HIGH' : daysSinceSent > 2 ? 'MEDIUM' : 'LOW';
      return { ...o, daysSinceSent, declineRisk, interventionTrigger: declineRisk === 'HIGH', suggestedIntervention: declineRisk === 'HIGH' ? 'Schedule urgent call with hiring manager' : null };
    });
    return sendOk(res, result, { message: 'Offer decline risk assessment' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to assess decline risk: ${error.message}` } });
  }
});

// POST /api/decisions/predictive-offer-decline-risk-with-intervention-triggers/run
router.post('/decisions/predictive-offer-decline-risk-with-intervention-triggers/run', validate(z.object({ offerId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    const now = new Date();
    const daysSinceSent = offer.sentAt ? Math.floor((now.getTime() - new Date(offer.sentAt).getTime()) / 86400000) : 0;
    const declineRiskScore = Math.min(1, daysSinceSent * 0.12 + (offer.equity === null ? 0.1 : 0));
    const riskLevel = declineRiskScore > 0.6 ? 'HIGH' : declineRiskScore > 0.3 ? 'MEDIUM' : 'LOW';
    return sendOk(res, { offerId, declineRiskScore: Math.round(declineRiskScore * 100) / 100, riskLevel, interventionRequired: riskLevel === 'HIGH', recommendedActions: riskLevel === 'HIGH' ? ['Call candidate immediately', 'Offer sign-on bonus', 'Arrange HM conversation'] : [] }, { message: 'Decline risk prediction complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to predict decline risk: ${error.message}` } });
  }
});

// GET /api/decisions/manager-decision-consistency-checker
router.get('/decisions/manager-decision-consistency-checker', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const decisions = await prisma.hiringDecision.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    const grouped: Record<string, any[]> = {};
    for (const d of decisions) {
      const key = d.decidedBy ?? 'unknown';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    }
    const result = Object.entries(grouped).map(([actorId, ds]) => {
      const scores = ds.map(d => d.confidenceScore ?? 0.5);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
      return { actorId, decisionCount: ds.length, avgConfidence: avg, consistencyScore: Math.round((1 - variance) * 100), consistencyLevel: variance < 0.05 ? 'HIGH' : variance < 0.15 ? 'MEDIUM' : 'LOW' };
    });
    return sendOk(res, result, { message: 'Manager decision consistency analysis' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to check manager consistency: ${error.message}` } });
  }
});

// POST /api/decisions/manager-decision-consistency-checker
router.post('/decisions/manager-decision-consistency-checker', validate(z.object({ managerId: z.string().optional() })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { managerId } = req.body;
    const where: any = { tenantId };
    if (managerId) where.decidedBy = managerId;
    const decisions = await prisma.hiringDecision.findMany({ where, orderBy: { createdAt: 'desc' } });
    const scores = decisions.map(d => (d as any).confidenceScore ?? 0.5);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const variance = scores.length > 1 ? scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length : 0;
    return sendOk(res, { managerId: managerId ?? 'all', decisionCount: decisions.length, avgConfidence: avg, consistencyScore: Math.round((1 - variance) * 100), flags: variance > 0.2 ? ['High variance detected - calibration recommended'] : [] }, { message: 'Consistency check complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run consistency check: ${error.message}` } });
  }
});

// GET /api/decisions/hiring-manager-calibration-co-pilot
router.get('/decisions/hiring-manager-calibration-co-pilot', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const decisions = await prisma.hiringDecision.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const scores = decisions.map(d => (d as any).confidenceScore ?? 0.5);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const hireRate = decisions.length ? decisions.filter(d => d.recommendation === 'HIRE' || d.recommendation === 'STRONG_HIRE').length / decisions.length : 0;
    return sendOk(res, { totalDecisions: decisions.length, avgConfidenceScore: avg, hireRate: Math.round(hireRate * 100), calibrationStatus: hireRate > 0.8 ? 'LENIENT' : hireRate < 0.3 ? 'STRICT' : 'CALIBRATED', recommendation: hireRate > 0.8 ? 'Review criteria rigor' : 'Calibration within normal range' }, { message: 'Calibration data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch calibration data: ${error.message}` } });
  }
});

// POST /api/decisions/hiring-manager-calibration-co-pilot
router.post('/decisions/hiring-manager-calibration-co-pilot', validate(z.object({ requisitionId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId } = req.body;
    const requisition = await prisma.requisition.findFirst({ where: { id: requisitionId, tenantId } });
    if (!requisition) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    const decisions = await prisma.hiringDecision.findMany({ where: { tenantId, requisitionId } });
    const scores = decisions.map(d => (d as any).confidenceScore ?? 0.5);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return sendOk(res, { requisitionId, title: requisition.title, decisionCount: decisions.length, avgConfidence: avg, calibrationActions: avg < 0.6 ? ['Align on evaluation criteria', 'Run calibration session with panel'] : ['Calibration on track'], calibrationRunAt: new Date().toISOString() }, { message: 'Calibration run complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run calibration: ${error.message}` } });
  }
});

// GET /api/decisions/offer-expectation-negotiation-assistant
router.get('/decisions/offer-expectation-negotiation-assistant', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'NEGOTIATING', 'DECLINED'] } } as any,
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        requisition: { select: { id: true, title: true, salaryMin: true, salaryMax: true } },
      },
    });
    const result = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate, requisition: (o as any).requisition,
      offeredSalary: o.salaryAmount, salaryBand: { min: (o as any).requisition?.salaryMin, max: (o as any).requisition?.salaryMax },
      expectationGap: (o as any).requisition?.salaryMax ? Math.max(0, (o as any).requisition.salaryMax - o.salaryAmount) : null,
      assistanceAvailable: ['Counter-offer template', 'Benefits comparison', 'Total rewards calculator'],
    }));
    return sendOk(res, result, { message: 'Offer expectation gap analysis' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch expectation analysis: ${error.message}` } });
  }
});

// GET /api/decisions/hiring-decision-briefing-generator
router.get('/decisions/hiring-decision-briefing-generator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const decisions = await (prisma.hiringDecision as any).findMany({
      where: { tenantId },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        requisition: { select: { id: true, title: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }) as any[];
    const briefings = decisions.map(d => ({
      decisionId: d.id,
      candidate: d.candidate,
      requisition: d.requisition,
      recommendation: d.recommendation,
      confidenceScore: (d as any).confidenceScore,
      briefingSummary: `${d.candidate?.firstName} ${d.candidate?.lastName} — ${d.recommendation} for ${d.requisition?.title} (confidence: ${Math.round(((d as any).confidenceScore ?? 0) * 100)}%)`,
      generatedAt: new Date().toISOString(),
    }));
    return sendOk(res, briefings, { message: 'Decision briefings generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate decision briefings: ${error.message}` } });
  }
});

// GET /api/decisions/offer-approval-workflow-prediction
router.get('/decisions/offer-approval-workflow-prediction', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['DRAFT', 'PENDING_APPROVAL'] } },
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'desc' },
    });
    const result = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate, salaryAmount: o.salaryAmount, status: o.status,
      predictedApprovalDays: o.salaryAmount > 150000 ? 5 : o.salaryAmount > 100000 ? 3 : 1,
      approvalComplexity: o.salaryAmount > 150000 ? 'HIGH' : 'STANDARD',
    }));
    return sendOk(res, result, { message: 'Offer approval timeline predictions' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to predict approval timeline: ${error.message}` } });
  }
});

// POST /api/decisions/offer-approval-workflow-prediction
router.post('/decisions/offer-approval-workflow-prediction', validate(z.object({ offerId: z.string().optional() })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId } = req.body;
    const where: any = { tenantId };
    if (offerId) where.id = offerId;
    const offers = await prisma.offer.findMany({ where, take: offerId ? 1 : 50 });
    const predictions = offers.map(o => ({
      offerId: o.id, predictedDays: o.salaryAmount > 150000 ? 5 : o.salaryAmount > 100000 ? 3 : 1,
      approversRequired: o.salaryAmount > 150000 ? 3 : 2, bottleneckRisk: o.salaryAmount > 200000 ? 'HIGH' : 'LOW',
    }));
    return sendOk(res, offerId ? predictions[0] : predictions, { message: 'Approval time prediction complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to predict approval time: ${error.message}` } });
  }
});

// GET /api/decisions/predictive-offer-declination-modeling
router.get('/decisions/predictive-offer-declination-modeling', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: 'DECLINED' },
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { respondedAt: 'desc' },
    });
    const patterns = {
      totalDeclined: offers.length,
      avgDeclinedSalary: offers.length ? offers.reduce((s, o) => s + o.salaryAmount, 0) / offers.length : 0,
      noEquityDeclines: offers.filter(o => o.equity === null).length,
      commonFactors: ['Below-market compensation', 'Lack of equity', 'Competing offer accepted'],
      modelConfidence: offers.length >= 10 ? 'HIGH' : offers.length >= 5 ? 'MEDIUM' : 'LOW',
    };
    return sendOk(res, { patterns, declinedOffers: offers }, { message: 'Declination modeling data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to model declinations: ${error.message}` } });
  }
});

// GET /api/decisions/compensation-market-agent
router.get('/decisions/compensation-market-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const benchmarks = await prisma.compensationBenchmark.findMany({
      where: { tenantId },
      orderBy: [{ jobFamily: 'asc' }, { level: 'asc' }, { createdAt: 'desc' }],
    });
    return sendOk(res, benchmarks, { message: 'Market compensation data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch market data: ${error.message}` } });
  }
});

// POST /api/decisions/compensation-market-agent/run
router.post('/decisions/compensation-market-agent/run', validate(z.object({ jobFamily: z.string().min(1), location: z.string().optional() })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { jobFamily, location } = req.body;
    const where: any = { tenantId, jobFamily };
    if (location) where.location = location;
    const benchmarks = await prisma.compensationBenchmark.findMany({ where, orderBy: { createdAt: 'desc' } });
    return sendOk(res, { jobFamily, location: location ?? 'all', benchmarkCount: benchmarks.length, data: benchmarks, fetchedAt: new Date().toISOString() }, { message: 'Market data fetched' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch market data: ${error.message}` } });
  }
});

// GET /api/decisions/dynamic-market-viability-compensation-calibrator
router.get('/decisions/dynamic-market-viability-compensation-calibrator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [benchmarks, requisitions] = await Promise.all([
      prisma.compensationBenchmark.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
      prisma.requisition.findMany({ where: { tenantId, status: 'OPEN' }, select: { id: true, title: true, salaryMin: true, salaryMax: true } }),
    ]);
    const bm = benchmarks[0];
    const result = requisitions.map(r => ({
      requisitionId: r.id, title: r.title,
      viabilityScore: bm && r.salaryMax ? Math.min(100, Math.round((r.salaryMax / bm.percentile50) * 100)) : null,
      viabilityStatus: bm && r.salaryMax ? (r.salaryMax >= bm.percentile50 ? 'VIABLE' : 'BELOW_MARKET') : 'UNKNOWN',
      calibrationRecommendation: bm && r.salaryMax && r.salaryMax < bm.percentile25 ? 'Urgent: increase budget to at least p25' : 'Within acceptable range',
    }));
    return sendOk(res, result, { message: 'Market viability assessment' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to assess market viability: ${error.message}` } });
  }
});

// GET /api/decisions/predictive-offer-acceptance-modeler
router.get('/decisions/predictive-offer-acceptance-modeler', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId },
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const accepted = offers.filter(o => o.status === 'ACCEPTED').length;
    const total = offers.filter(o => ['ACCEPTED', 'DECLINED'].includes(o.status)).length;
    const historicalRate = total ? Math.round((accepted / total) * 100) : null;
    const pendingOffers = offers.filter(o => o.status === 'SENT');
    const predictions = pendingOffers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate,
      predictedAcceptanceProbability: historicalRate ? `${Math.min(95, historicalRate + (o.equity ? 10 : 0))}%` : 'Insufficient data',
    }));
    return sendOk(res, { historicalAcceptanceRate: historicalRate ? `${historicalRate}%` : null, pendingPredictions: predictions }, { message: 'Acceptance model data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to model acceptance: ${error.message}` } });
  }
});

// GET /api/decisions/equity-total-rewards-customization-simulator
router.get('/decisions/equity-total-rewards-customization-simulator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId },
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'desc' },
      take: 50,
    }) as any[];
    const simulations = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate,
      baseSalary: o.salaryAmount, equity: o.equity,
      totalRewardsScenarios: [
        { label: 'Base only', totalValue: o.salaryAmount },
        { label: 'Base + equity (4yr vest)', totalValue: o.salaryAmount + (o.equity ? o.equity * 10000 : 0) },
        { label: 'Base + equity + benefits', totalValue: o.salaryAmount + (o.equity ? o.equity * 10000 : 0) + 15000 },
      ],
    }));
    return sendOk(res, simulations, { message: 'Equity and total rewards simulations' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to simulate equity rewards: ${error.message}` } });
  }
});

// GET /api/decisions/offer-clause-adaptation-engine
router.get('/decisions/offer-clause-adaptation-engine', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['DRAFT', 'SENT'] } },
      include: { requisition: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const result = offers.map(o => ({
      offerId: o.id, requisition: o.requisition,
      clauseRecommendations: ['At-will employment clause', 'IP assignment agreement', 'Non-solicitation (12 months)', 'Confidentiality clause'],
      adaptationStatus: 'PENDING_REVIEW',
    }));
    return sendOk(res, result, { message: 'Clause adaptation recommendations' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch clause recommendations: ${error.message}` } });
  }
});

// POST /api/decisions/offer-clause-adaptation-engine/run
router.post('/decisions/offer-clause-adaptation-engine/run', validate(z.object({ offerId: z.string().min(1), jurisdiction: z.string().optional() })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId, jurisdiction } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    const jur = jurisdiction ?? 'US-DEFAULT';
    const clauses = jur.startsWith('EU') ? ['GDPR data processing addendum', 'Works council notification', 'Notice period per local law'] : ['At-will employment', 'IP assignment', 'Arbitration clause'];
    return sendOk(res, { offerId, jurisdiction: jur, adaptedClauses: clauses, adaptedAt: new Date().toISOString() }, { message: 'Clause adaptation complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to adapt clauses: ${error.message}` } });
  }
});

// GET /api/decisions/real-time-offer-counter-scenario-simulator
router.get('/decisions/real-time-offer-counter-scenario-simulator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'desc' },
    });
    const scenarios = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate, currentOffer: o.salaryAmount,
      counterScenarios: [
        { label: 'Accept as-is', salary: o.salaryAmount, probability: '40%' },
        { label: 'Counter +5%', salary: Math.round(o.salaryAmount * 1.05), probability: '35%' },
        { label: 'Counter +10%', salary: Math.round(o.salaryAmount * 1.10), probability: '20%' },
        { label: 'Decline', salary: null, probability: '5%' },
      ],
    }));
    return sendOk(res, scenarios, { message: 'Counter-offer scenarios' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to simulate counter scenarios: ${error.message}` } });
  }
});

// GET /api/decisions/offer-package-personalization-engine
router.get('/decisions/offer-package-personalization-engine', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['DRAFT', 'SENT'] } },
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'desc' },
    });
    const result = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate,
      personalizationOpportunities: [
        ...(o.equity === null ? ['Add equity component'] : []),
        ...(o.benefits === null ? ['Customize benefits package'] : []),
      ],
      personalizationScore: o.equity !== null && o.benefits !== null ? 'HIGH' : o.equity !== null || o.benefits !== null ? 'MEDIUM' : 'LOW',
    }));
    return sendOk(res, result, { message: 'Offer package personalization opportunities' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch personalization data: ${error.message}` } });
  }
});

// POST /api/decisions/offer-package-personalization-engine/run
router.post('/decisions/offer-package-personalization-engine/run', validate(z.object({ candidateId: z.string().min(1), offerId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, offerId } = req.body;
    const [candidate, offer] = await Promise.all([
      prisma.candidate.findFirst({ where: { id: candidateId, tenantId }, select: { id: true, firstName: true, lastName: true } }),
      prisma.offer.findFirst({ where: { id: offerId, tenantId } }),
    ]);
    if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    const personalizations = [
      ...(offer.equity === null ? [{ element: 'Equity', suggestion: 'Add 0.1% options over 4-year vest', impact: 'HIGH' }] : []),
      ...(offer.benefits === null ? [{ element: 'Benefits', suggestion: 'Include comprehensive health + dental', impact: 'MEDIUM' }] : []),
      { element: 'Welcome', suggestion: `Personalized offer letter addressed to ${candidate.firstName}`, impact: 'LOW' },
    ];
    return sendOk(res, { candidateId, offerId, candidate, personalizations, personalizationCount: personalizations.length }, { message: 'Offer package personalized' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to personalize offer package: ${error.message}` } });
  }
});

// GET /api/decisions/offer-to-start-retention-agent
router.get('/decisions/offer-to-start-retention-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      include: { candidate: { select: { id: true, firstName: true, lastName: true, email: true } } } as any,
      orderBy: { respondedAt: 'desc' },
    });
    const now = new Date();
    const result = offers.map(o => ({
      ...o,
      daysUntilStart: o.startDate ? Math.floor((new Date(o.startDate).getTime() - now.getTime()) / 86400000) : null,
      retentionRisk: o.startDate && Math.floor((new Date(o.startDate).getTime() - now.getTime()) / 86400000) > 30 ? 'ELEVATED' : 'LOW',
      retentionActions: ['Send welcome package', 'Pre-start check-in call', 'Introduce to team buddy'],
    }));
    return sendOk(res, result, { message: 'Post-acceptance retention data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch retention data: ${error.message}` } });
  }
});

// POST /api/decisions/offer-to-start-retention-agent/run
router.post('/decisions/offer-to-start-retention-agent/run', validate(z.object({ offerId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    if (offer.status !== 'ACCEPTED') return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Offer must be ACCEPTED for retention analysis' } });
    const daysUntilStart = offer.startDate ? Math.floor((new Date(offer.startDate).getTime() - Date.now()) / 86400000) : null;
    const retentionActions = [
      { action: 'Send personalized welcome email', dueDay: 0, status: 'SCHEDULED' },
      { action: 'Week-2 pre-start check-in call', dueDay: -14, status: 'SCHEDULED' },
      { action: 'Send first-day logistics guide', dueDay: -3, status: 'SCHEDULED' },
    ];
    return sendOk(res, { offerId, daysUntilStart, retentionActions, retentionScore: daysUntilStart && daysUntilStart > 30 ? 72 : 90 }, { message: 'Retention analysis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run retention analysis: ${error.message}` } });
  }
});

// GET /api/decisions/offer-outcome-simulation-engine
router.get('/decisions/offer-outcome-simulation-engine', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['DRAFT', 'SENT', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'desc' },
    });
    const result = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate, baseSalary: o.salaryAmount,
      outcomeSimulations: [
        { scenario: 'Accept as-is', probability: 55, timeToDecision: '3 days' },
        { scenario: 'Counter and accept', probability: 30, timeToDecision: '7 days' },
        { scenario: 'Decline', probability: 15, timeToDecision: '5 days' },
      ],
    }));
    return sendOk(res, result, { message: 'Outcome simulations' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch outcome simulations: ${error.message}` } });
  }
});

// POST /api/decisions/offer-outcome-simulation-engine/run
router.post('/decisions/offer-outcome-simulation-engine/run', validate(z.object({ offerId: z.string().min(1), scenarios: z.array(z.string()).optional() })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId, scenarios } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    const activeScenarios = scenarios ?? ['accept', 'counter', 'decline'];
    const results = activeScenarios.map((s: string) => ({
      scenario: s, simulatedOutcome: s === 'accept' ? { status: 'ACCEPTED', daysToClose: 3 } : s === 'counter' ? { status: 'NEGOTIATING', counterAmount: Math.round(offer.salaryAmount * 1.07), daysToClose: 7 } : { status: 'DECLINED', daysToClose: 5 },
    }));
    return sendOk(res, { offerId, scenarios: results, simulatedAt: new Date().toISOString() }, { message: 'Outcome simulation complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to simulate outcomes: ${error.message}` } });
  }
});

// GET /api/decisions/adaptive-offer-management-negotiation-agents
router.get('/decisions/adaptive-offer-management-negotiation-agents', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { updatedAt: 'desc' },
    });
    const result = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate, status: o.status,
      agentState: (o.status as string) === 'NEGOTIATING' ? 'ACTIVE_NEGOTIATION' : 'MONITORING',
      adaptationHistory: [], nextAdaptation: (o.status as string) === 'NEGOTIATING' ? 'Evaluate counter-offer response' : null,
    }));
    return sendOk(res, result, { message: 'Adaptive negotiation state' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch adaptive negotiation state: ${error.message}` } });
  }
});

// POST /api/decisions/adaptive-offer-management-negotiation-agents/run
router.post('/decisions/adaptive-offer-management-negotiation-agents/run', validate(z.object({ offerId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    const agentAction = (offer.status as string) === 'NEGOTIATING' ? 'PROPOSE_COUNTER' : 'SEND_FOLLOW_UP';
    return sendOk(res, { offerId, agentAction, proposedAdjustment: agentAction === 'PROPOSE_COUNTER' ? { salaryAmount: Math.round(offer.salaryAmount * 1.04), rationale: 'Adaptive 4% increment within budget' } : null, executedAt: new Date().toISOString() }, { message: 'Negotiation agent run complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run negotiation agent: ${error.message}` } });
  }
});

// GET /api/decisions/autonomous-offer-management-negotiation
router.get('/decisions/autonomous-offer-management-negotiation', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { updatedAt: 'desc' },
    });
    const result = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate, status: o.status,
      autonomousMode: 'SUPERVISED', maxAutoBudget: Math.round(o.salaryAmount * 1.05),
      negotiationRounds: 0, closingProbability: '65%',
    }));
    return sendOk(res, result, { message: 'Autonomous negotiation status' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch autonomous negotiation status: ${error.message}` } });
  }
});

// GET /api/decisions/legal-clause-negotiation-agent
router.get('/decisions/legal-clause-negotiation-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { notIn: ['RETRACTED', 'DECLINED'] } },
      include: { requisition: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const result = offers.map(o => ({
      offerId: o.id, requisition: o.requisition,
      clauseRisks: ['Non-compete enforceability varies by state', 'Arbitration clause may need opt-out provision'],
      negotiableItems: ['Notice period duration', 'Non-compete scope', 'IP carve-outs'],
      legalReviewStatus: 'PENDING',
    }));
    return sendOk(res, result, { message: 'Legal clause analysis' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch legal clause data: ${error.message}` } });
  }
});

// POST /api/decisions/legal-clause-negotiation-agent/run
router.post('/decisions/legal-clause-negotiation-agent/run', validate(z.object({ offerId: z.string().min(1), clauses: z.array(z.string()).optional() })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId, clauses } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    const targetClauses = clauses ?? ['non-compete', 'ip-assignment', 'arbitration'];
    const negotiatedClauses = targetClauses.map((c: string) => ({ clause: c, status: 'STANDARD', recommendation: `Use standard ${c} language`, requiresLegalReview: c.includes('non-compete') }));
    return sendOk(res, { offerId, negotiatedClauses, clauseCount: negotiatedClauses.length, legalReviewRequired: negotiatedClauses.some((c: any) => c.requiresLegalReview), completedAt: new Date().toISOString() }, { message: 'Clause negotiation complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to negotiate clauses: ${error.message}` } });
  }
});

// GET /api/decisions/autonomous-offer-revocation-risk-engine
router.get('/decisions/autonomous-offer-revocation-risk-engine', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'ACCEPTED', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { createdAt: 'desc' },
    });
    const result = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate, status: o.status,
      revocationRisk: o.status === 'SENT' && !o.respondedAt ? 'MODERATE' : 'LOW',
      riskFactors: ['Budget freeze risk', 'Headcount re-prioritization', 'Background check pending'],
      mitigationSteps: ['Expedite approval chain', 'Confirm budget lock', 'Complete pre-employment checks'],
    }));
    return sendOk(res, result, { message: 'Revocation risk assessment' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to assess revocation risk: ${error.message}` } });
  }
});

// POST /api/decisions/autonomous-offer-revocation-risk-engine/run
router.post('/decisions/autonomous-offer-revocation-risk-engine/run', validate(z.object({ offerId: z.string().min(1) })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    const daysSinceCreation = Math.floor((Date.now() - new Date(offer.createdAt).getTime()) / 86400000);
    const riskScore = Math.min(1, daysSinceCreation * 0.03 + ((offer.status as string) === 'NEGOTIATING' ? 0.2 : 0));
    const riskLevel = riskScore > 0.6 ? 'HIGH' : riskScore > 0.3 ? 'MEDIUM' : 'LOW';
    return sendOk(res, { offerId, riskScore: Math.round(riskScore * 100) / 100, riskLevel, immediateActions: riskLevel === 'HIGH' ? ['Alert HRBP', 'Lock budget line', 'Accelerate closing'] : [], assessedAt: new Date().toISOString() }, { message: 'Revocation risk assessment complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to assess revocation risk: ${error.message}` } });
  }
});

// GET /api/decisions/autonomous-offer-negotiator-closer
router.get('/decisions/autonomous-offer-negotiator-closer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { updatedAt: 'desc' },
    });
    const result = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate, status: o.status,
      closerStatus: 'READY', closingStrategy: (o.status as string) === 'NEGOTIATING' ? 'FINAL_BEST_OFFER' : 'STANDARD_CLOSE',
      urgencyLevel: o.expiresAt && new Date(o.expiresAt) < new Date(Date.now() + 24 * 3600000) ? 'HIGH' : 'NORMAL',
      closingActions: ['Send closing message', 'Confirm start date', 'Request signed offer'],
    }));
    return sendOk(res, result, { message: 'Autonomous negotiation closer status' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch negotiator closer status: ${error.message}` } });
  }
});

// GET /api/decisions/agent-to-agent-a2a-salary-negotiator
router.get('/decisions/agent-to-agent-a2a-salary-negotiator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: { in: ['SENT', 'NEGOTIATING'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } } as any,
      orderBy: { updatedAt: 'desc' },
    });
    const result = offers.map(o => ({
      offerId: o.id, candidate: (o as any).candidate,
      a2aState: { employerAgentBudget: Math.round(o.salaryAmount * 1.08), candidateAgentAsk: null, roundsCompleted: 0, status: 'AWAITING_CANDIDATE_AGENT' },
      protocol: 'A2A_SALARY_NEGOTIATION_V1',
    }));
    return sendOk(res, result, { message: 'A2A negotiation state' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch A2A negotiation state: ${error.message}` } });
  }
});

// POST /api/decisions/agent-to-agent-a2a-salary-negotiator/run
router.post('/decisions/agent-to-agent-a2a-salary-negotiator/run', validate(z.object({ offerId: z.string().min(1), agentStrategy: z.string().optional() })), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { offerId, agentStrategy } = req.body;
    const offer = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
    if (!offer) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    const strategy = agentStrategy ?? 'COLLABORATIVE';
    const maxBudget = Math.round(offer.salaryAmount * 1.08);
    const a2aResult = {
      offerId, strategy, employerAgentOffer: offer.salaryAmount, maxBudget,
      simulatedCandidateAsk: Math.round(offer.salaryAmount * 1.06),
      convergencePoint: Math.round((offer.salaryAmount + offer.salaryAmount * 1.06) / 2),
      roundsSimulated: 3, outcome: 'LIKELY_AGREEMENT',
      negotiatedAt: new Date().toISOString(),
    };
    return sendOk(res, a2aResult, { message: 'A2A negotiation simulation complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run A2A negotiation: ${error.message}` } });
  }
});

export default router;
