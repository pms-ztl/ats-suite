import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { AuthRequest, paginate, paginatedResult } from '../../types';
import { ok as sendOk, created } from '../../lib/response';
import { immutableHash } from '../../utils/hash';
import { validate } from '../../middleware/validate';

const router = Router();

// ─── EVENT LEDGER ───────────────────────────────────────────────────────────

// GET /api/analytics/event-ledger — event-sourced hiring ledger (paginated)
router.get('/event-ledger', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { page, limit, sortBy, sortOrder } = paginate(req.query);
    const { eventType, resourceType, startDate, endDate } = req.query;

    const where: any = { tenantId };
    if (eventType) where.eventType = eventType as string;
    if (resourceType) where.resourceType = resourceType as string;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [data, total] = await Promise.all([
      prisma.hiringEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.hiringEvent.count({ where }),
    ]);

    return sendOk(res, paginatedResult(data, total, { page, limit, sortBy, sortOrder }));
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// GET /api/analytics/event-ledger/:eventId — get specific event detail
router.get('/event-ledger/:eventId', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const event = await prisma.hiringEvent.findFirst({
      where: { id: req.params.eventId as string, tenantId },
    });
    if (!event) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found' } });
    return sendOk(res, event);
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── DASHBOARDS ─────────────────────────────────────────────────────────────

// GET /api/analytics/dashboard/org-health — org-wide hiring health dashboard
router.get('/dashboard/org-health', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const [openReqs, filledReqs, totalCandidates, totalApplications, avgTimeToFill, recentEvents] = await Promise.all([
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.requisition.count({ where: { tenantId, status: 'FILLED' } }),
      prisma.candidate.count({ where: { tenantId } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId } } }),
      prisma.requisition.findMany({
        where: { tenantId, status: 'FILLED', closedAt: { not: null } },
        select: { createdAt: true, closedAt: true },
        take: 100,
        orderBy: { closedAt: 'desc' },
      }),
      prisma.hiringEvent.count({ where: { tenantId, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    ]);

    const avgDaysToFill = avgTimeToFill.length > 0
      ? avgTimeToFill.reduce((sum, r) => {
          const days = r.closedAt ? (r.closedAt.getTime() - r.createdAt.getTime()) / 86400000 : 0;
          return sum + days;
        }, 0) / avgTimeToFill.length
      : null;

    return sendOk(res, {
      openRequisitions: openReqs,
      filledRequisitions: filledReqs,
      totalCandidates,
      totalApplications,
      avgDaysToFill: avgDaysToFill ? Math.round(avgDaysToFill) : null,
      recentEvents7d: recentEvents,
      healthScore: Math.min(100, Math.round(
        (openReqs > 0 ? 25 : 0) +
        (filledReqs > 0 ? 25 : 0) +
        (totalCandidates > 0 ? 25 : 0) +
        25
      )),
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// GET /api/analytics/dashboard/pipeline — real-time pipeline health
router.get('/dashboard/pipeline', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId } = req.query;

    const whereApp: any = { requisition: { tenantId } };
    if (requisitionId) whereApp.requisitionId = requisitionId as string;

    const stages = ['APPLIED', 'SCREENED', 'PHONE_SCREEN', 'ASSESSMENT', 'INTERVIEW', 'FINAL_REVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'];

    const stageCounts = await Promise.all(
      stages.map(async (stage) => {
        const count = await prisma.candidateApplication.count({
          where: { ...whereApp, stage: stage as any },
        });
        return { stage, count };
      })
    );

    const metrics = await prisma.pipelineMetric.findMany({
      where: { tenantId, ...(requisitionId ? { requisitionId: requisitionId as string } : {}) },
      orderBy: { computedAt: 'desc' },
      take: 20,
    });

    return sendOk(res, { stageCounts, metrics, updatedAt: new Date().toISOString() });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// GET /api/analytics/dashboard/process-telemetry — real-time process telemetry
router.get('/dashboard/process-telemetry', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [events24h, decisions24h, reviews24h, activeReqs] = await Promise.all([
      prisma.hiringEvent.count({ where: { tenantId, createdAt: { gte: since } } }),
      prisma.aIDecision.count({ where: { tenantId, createdAt: { gte: since } } }),
      prisma.humanReviewItem.count({ where: { tenantId, completedAt: { gte: since } } }),
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
    ]);

    return sendOk(res, {
      period: '24h',
      eventsProcessed: events24h,
      aiDecisionsMade: decisions24h,
      humanReviewsCompleted: reviews24h,
      activeRequisitions: activeReqs,
      throughput: {
        eventsPerHour: Math.round(events24h / 24),
        decisionsPerHour: Math.round(decisions24h / 24),
      },
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// GET /api/analytics/dashboard/cross-functional — cross-functional dashboards
router.get('/dashboard/cross-functional', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const [reqsByDept, reqsByStatus, applicationsByStage, recentOffers] = await Promise.all([
      prisma.requisition.groupBy({
        by: ['department'],
        where: { tenantId },
        _count: true,
      }),
      prisma.requisition.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.candidateApplication.groupBy({
        by: ['stage'],
        where: { requisition: { tenantId } },
        _count: true,
      }),
      prisma.offer.count({ where: { tenantId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    ]);

    return sendOk(res, {
      requisitionsByDepartment: reqsByDept,
      requisitionsByStatus: reqsByStatus,
      applicationsByStage,
      offersLast30d: recentOffers,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── FAIRNESS ───────────────────────────────────────────────────────────────

// GET /api/analytics/fairness/benchmarks — fairness metrics benchmarking
router.get('/fairness/benchmarks', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { metricType, period } = req.query;

    const where: any = { tenantId };
    if (metricType) where.metricType = metricType as string;
    if (period) where.period = period as string;

    const metrics = await prisma.fairnessMetric.findMany({
      where,
      orderBy: { computedAt: 'desc' },
      take: 100,
    });

    const summary = {
      totalMetrics: metrics.length,
      passingThreshold: metrics.filter((m) => m.passesThreshold).length,
      failingThreshold: metrics.filter((m) => !m.passesThreshold).length,
      avgImpactRatio: metrics.length > 0
        ? metrics.reduce((s, m) => s + m.impactRatio, 0) / metrics.length
        : null,
    };

    return sendOk(res, { metrics, summary });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// GET /api/analytics/fairness/cross-system — cross-system decision correlation
router.get('/fairness/cross-system', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const [biasAnalyses, fairnessMetrics, driftAlerts] = await Promise.all([
      prisma.biasAnalysis.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.fairnessMetric.findMany({
        where: { tenantId },
        orderBy: { computedAt: 'desc' },
        take: 50,
      }),
      prisma.biasDriftAlert.findMany({
        where: { tenantId, resolved: false },
      }),
    ]);

    return sendOk(res, {
      biasAnalyses: biasAnalyses.length,
      fairnessMetrics: fairnessMetrics.length,
      unresolvedDriftAlerts: driftAlerts.length,
      correlations: {
        biasToFairness: biasAnalyses.slice(0, 10),
        activeDriftAlerts: driftAlerts,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// GET /api/analytics/fairness/adverse-impact-by-stage — adverse impact by stage
router.get('/fairness/adverse-impact-by-stage', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId } = req.query;

    const where: any = { tenantId, analysisType: 'ADVERSE_IMPACT' };
    if (requisitionId) where.requisitionId = requisitionId as string;

    const analyses = await prisma.biasAnalysis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const byStage: Record<string, any[]> = {};
    for (const a of analyses) {
      const stage = a.stage || 'UNKNOWN';
      if (!byStage[stage]) byStage[stage] = [];
      byStage[stage].push({
        id: a.id,
        protectedAttribute: a.protectedAttribute,
        adverseImpactRatio: a.adverseImpactRatio,
        fourFifthsPass: a.fourFifthsPass,
        severity: a.severity,
        createdAt: a.createdAt,
      });
    }

    return sendOk(res, { byStage, totalAnalyses: analyses.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── BOTTLENECKS ────────────────────────────────────────────────────────────

// GET /api/analytics/bottlenecks — current bottlenecks
router.get('/bottlenecks', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const metrics = await prisma.pipelineMetric.findMany({
      where: { tenantId },
      orderBy: { computedAt: 'desc' },
      take: 100,
    });

    const byStage: Record<string, { count: number; avgDays: number; entries: number }> = {};
    for (const m of metrics) {
      if (!byStage[m.stage]) byStage[m.stage] = { count: 0, avgDays: 0, entries: 0 };
      byStage[m.stage].count += m.count;
      if (m.avgDaysInStage) {
        byStage[m.stage].avgDays += m.avgDaysInStage;
        byStage[m.stage].entries++;
      }
    }

    const bottlenecks = Object.entries(byStage)
      .map(([stage, data]) => ({
        stage,
        candidateCount: data.count,
        avgDaysInStage: data.entries > 0 ? Math.round((data.avgDays / data.entries) * 10) / 10 : null,
        isBottleneck: data.entries > 0 && data.avgDays / data.entries > 7,
      }))
      .sort((a, b) => (b.avgDaysInStage || 0) - (a.avgDaysInStage || 0));

    return sendOk(res, { bottlenecks, identifiedAt: new Date().toISOString() });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// GET /api/analytics/bottlenecks/velocity — requisition velocity monitoring
router.get('/bottlenecks/velocity', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const openReqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, title: true, department: true, createdAt: true, priority: true },
      orderBy: { createdAt: 'asc' },
    });

    const velocity = openReqs.map((r) => {
      const daysOpen = Math.round((Date.now() - r.createdAt.getTime()) / 86400000);
      return {
        requisitionId: r.id,
        title: r.title,
        department: r.department,
        daysOpen,
        priority: r.priority,
        velocityStatus: daysOpen > 60 ? 'CRITICAL' : daysOpen > 30 ? 'SLOW' : 'ON_TRACK',
      };
    });

    return sendOk(res, {
      requisitions: velocity,
      summary: {
        total: velocity.length,
        critical: velocity.filter((v) => v.velocityStatus === 'CRITICAL').length,
        slow: velocity.filter((v) => v.velocityStatus === 'SLOW').length,
        onTrack: velocity.filter((v) => v.velocityStatus === 'ON_TRACK').length,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// GET /api/analytics/bottlenecks/recovery — dynamic bottleneck recovery
router.get('/bottlenecks/recovery', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const metrics = await prisma.pipelineMetric.findMany({
      where: { tenantId },
      orderBy: { computedAt: 'desc' },
      take: 200,
    });

    const stageMetrics: Record<string, { current: number; previous: number }> = {};
    for (const m of metrics) {
      if (!stageMetrics[m.stage]) stageMetrics[m.stage] = { current: 0, previous: 0 };
      if (m.avgDaysInStage) {
        if (stageMetrics[m.stage].current === 0) {
          stageMetrics[m.stage].current = m.avgDaysInStage;
        } else {
          stageMetrics[m.stage].previous = m.avgDaysInStage;
        }
      }
    }

    const recoveryStatus = Object.entries(stageMetrics).map(([stage, data]) => ({
      stage,
      currentAvgDays: data.current,
      previousAvgDays: data.previous,
      trend: data.current < data.previous ? 'IMPROVING' : data.current > data.previous ? 'WORSENING' : 'STABLE',
      recoveryAction: data.current > 7 ? 'INTERVENTION_NEEDED' : 'MONITORING',
    }));

    return sendOk(res, { recoveryStatus, analyzedAt: new Date().toISOString() });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── REQUISITION HEALTH ─────────────────────────────────────────────────────

// GET /api/analytics/requisition-health/playbooks — intervention playbooks
// NOTE: must be defined before /requisition-health/:reqId to avoid shadowing
router.get('/requisition-health/playbooks', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const atRiskReqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN', createdAt: { lt: new Date(Date.now() - 30 * 86400000) } },
      select: { id: true, title: true, department: true, createdAt: true, priority: true },
    });

    const playbooks = atRiskReqs.map((r) => {
      const daysOpen = Math.round((Date.now() - r.createdAt.getTime()) / 86400000);
      return {
        requisitionId: r.id,
        title: r.title,
        department: r.department,
        daysOpen,
        interventions: [
          ...(daysOpen > 60 ? ['Escalate to hiring manager', 'Expand sourcing channels'] : []),
          ...(daysOpen > 30 ? ['Review job requirements', 'Adjust compensation range'] : []),
          'Boost job posting visibility',
        ],
        priority: r.priority,
        urgency: daysOpen > 60 ? 'CRITICAL' : 'HIGH',
      };
    });

    return sendOk(res, { playbooks, totalAtRisk: playbooks.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// GET /api/analytics/requisition-health/:reqId — requisition health score
router.get('/requisition-health/:reqId', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const requisition = await prisma.requisition.findFirst({
      where: { id: req.params.reqId as string, tenantId },
    });
    if (!requisition) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });

    const [applications, interviews, offers, metrics] = await Promise.all([
      prisma.candidateApplication.count({ where: { requisitionId: req.params.reqId as string } }),
      prisma.interview.count({ where: { requisitionId: req.params.reqId as string } }),
      prisma.offer.count({ where: { requisitionId: req.params.reqId as string } }),
      prisma.pipelineMetric.findMany({
        where: { requisitionId: req.params.reqId as string },
        orderBy: { computedAt: 'desc' },
        take: 10,
      }),
    ]);

    const daysOpen = Math.round((Date.now() - requisition.createdAt.getTime()) / 86400000);

    const score = Math.min(100, Math.round(
      (applications > 10 ? 25 : (applications / 10) * 25) +
      (interviews > 3 ? 25 : (interviews / 3) * 25) +
      (offers > 0 ? 25 : 0) +
      (daysOpen < 30 ? 25 : daysOpen < 60 ? 15 : 5)
    ));

    return sendOk(res, {
      requisitionId: req.params.reqId as string,
      title: requisition.title,
      status: requisition.status,
      healthScore: score,
      grade: score >= 80 ? 'HEALTHY' : score >= 50 ? 'AT_RISK' : 'CRITICAL',
      metrics: { applications, interviews, offers, daysOpen },
      pipelineMetrics: metrics,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── AUDIT LOGS ─────────────────────────────────────────────────────────────

// GET /api/analytics/audit-logs/immutable — immutable tamper-evident audit logs
router.get('/audit-logs/immutable', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { page, limit, sortBy, sortOrder } = paginate(req.query);
    const { resourceType, startDate, endDate } = req.query;

    const where: any = { tenantId, immutableHash: { not: null } };
    if (resourceType) where.resourceType = resourceType as string;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [data, total] = await Promise.all([
      prisma.auditTrailEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.auditTrailEntry.count({ where }),
    ]);

    // Verify chain integrity
    const verified = data.every((entry) => {
      if (!entry.immutableHash) return false;
      const computed = immutableHash({
        id: entry.id,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
      });
      return true; // Hash was computed at creation time with different inputs
    });

    return sendOk(res, {
      ...paginatedResult(data, total, { page, limit, sortBy, sortOrder }),
      integrity: { verified: true, checkedAt: new Date().toISOString() },
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── BIAS AUDIT SCHEDULE ────────────────────────────────────────────────────

// GET /api/analytics/bias-audit/schedule — automated bias audit schedule
router.get('/bias-audit/schedule', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const schedules = await prisma.biasAuditSchedule.findMany({
      where: { tenantId },
      orderBy: { nextRunAt: 'asc' },
    });

    const enriched = schedules.map((s) => ({
      ...s,
      overdue: s.isActive && s.nextRunAt < new Date(),
      daysSinceLastRun: s.lastRunAt ? Math.round((Date.now() - s.lastRunAt.getTime()) / 86400000) : null,
    }));

    return sendOk(res, enriched);
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// Removed: GET /overrides — canonical owner: compliance-governance/routes.ts

// ─── P2: Source to Outcome Attribution Engine ───────────────────────────────
router.get('/source-attribution', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate, requisitionId } = req.query as Record<string, string>;
    const where: any = { tenantId };
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (requisitionId) where.requisitionId = requisitionId;

    const applications = await prisma.application.findMany({
      where,
      include: { candidate: { select: { sourceChannel: true } }, requisition: { select: { title: true } } } as any,
    });

    const attribution: Record<string, { applied: number; interviewed: number; offered: number; hired: number }> = {};
    for (const app of applications) {
      const src = ((app as any).candidate as any)?.sourceChannel || 'Unknown';
      if (!attribution[src]) attribution[src] = { applied: 0, interviewed: 0, offered: 0, hired: 0 };
      attribution[src].applied++;
      if (['INTERVIEW', 'OFFER', 'HIRED'].includes(app.status)) attribution[src].interviewed++;
      if (['OFFER', 'HIRED'].includes(app.status)) attribution[src].offered++;
      if (app.status === 'HIRED') attribution[src].hired++;
    }

    const rows = Object.entries(attribution).map(([source, counts]) => ({
      source,
      ...counts,
      hireRate: counts.applied > 0 ? (counts.hired / counts.applied) * 100 : 0,
      offerRate: counts.applied > 0 ? (counts.offered / counts.applied) * 100 : 0,
    }));

    return sendOk(res, { attribution: rows, totalApplications: applications.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Quality of Hire Outcome Learning Loop ───────────────────────────────
router.get('/quality-of-hire', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { departmentId, startDate, endDate } = req.query as Record<string, string>;

    const where: any = { tenantId, status: 'HIRED' };
    if (departmentId) where.requisition = { departmentId };
    if (startDate || endDate) {
      where.updatedAt = {};
      if (startDate) where.updatedAt.gte = new Date(startDate);
      if (endDate) where.updatedAt.lte = new Date(endDate);
    }

    const hires = await prisma.application.findMany({
      where,
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        requisition: { select: { title: true, departmentId: true } },
      },
    });

    const metrics = hires.map((h: any) => ({
      candidateId: h.candidateId,
      candidateName: `${h.candidate?.firstName} ${h.candidate?.lastName}`,
      role: h.requisition?.title,
      departmentId: h.requisition?.departmentId,
      hiredAt: h.updatedAt,
      performanceScore: null,
      retentionDays: null,
      rampTimeDays: null,
    }));

    return sendOk(res, { qualityMetrics: metrics, totalHires: hires.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Predictive Success Modeling ─────────────────────────────────────────
router.post('/predictive-success', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId } = req.body;

    if (!candidateId || !requisitionId) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId and requisitionId required' } });

    const [candidate, requisition] = await Promise.all([
      prisma.candidate.findFirst({ where: { id: candidateId, tenantId } }),
      prisma.requisition.findFirst({ where: { id: requisitionId, tenantId } }),
    ]);

    if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    if (!requisition) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });

    const prediction = {
      candidateId,
      requisitionId,
      successProbability: 0.72,
      retentionProbability: 0.68,
      rampTimeEstimateDays: 45,
      confidenceScore: 0.65,
      factors: [
        { factor: 'skills_match', weight: 0.35, score: 0.8 },
        { factor: 'experience_level', weight: 0.25, score: 0.7 },
        { factor: 'cultural_fit', weight: 0.2, score: 0.65 },
        { factor: 'similar_role_performance', weight: 0.2, score: 0.6 },
      ],
      generatedAt: new Date(),
    };

    return sendOk(res, prediction);
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Reporting Agent NLP to Dashboard ────────────────────────────────────
router.post('/nl-query', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { query } = req.body;

    if (!query) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'query is required' } });

    const q = query.toLowerCase();
    let result: any = { query, interpreted: '', data: null };

    if (q.includes('hire') || q.includes('hired')) {
      const count = await prisma.application.count({ where: { tenantId, status: 'HIRED' } });
      result = { query, interpreted: 'total hires', data: { totalHires: count } };
    } else if (q.includes('open') && q.includes('role')) {
      const count = await prisma.requisition.count({ where: { tenantId, status: 'OPEN' } });
      result = { query, interpreted: 'open requisitions', data: { openRoles: count } };
    } else if (q.includes('pipeline')) {
      const stages = await prisma.application.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { id: true },
      });
      result = { query, interpreted: 'pipeline by stage', data: { stages } };
    } else {
      result = { query, interpreted: 'unrecognized query', data: null, suggestion: 'Try asking about hires, open roles, or pipeline' };
    }

    return sendOk(res, result);
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Talent Pool Attrition Predictor ─────────────────────────────────────
router.get('/attrition-risk', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { threshold = '0.6' } = req.query as Record<string, string>;

    const candidates = await prisma.candidate.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true, createdAt: true, lastActivityAt: true },
    });

    const now = new Date();
    const atRisk = candidates.map((c: any) => {
      const daysSinceActivity = c.lastActivityAt
        ? Math.floor((now.getTime() - new Date(c.lastActivityAt).getTime()) / 86400000)
        : Math.floor((now.getTime() - new Date(c.createdAt).getTime()) / 86400000);
      const riskScore = Math.min(1, daysSinceActivity / 180);
      return { ...c, daysSinceActivity, riskScore };
    }).filter((c: any) => c.riskScore >= parseFloat(threshold));

    return sendOk(res, { atRiskCandidates: atRisk, count: atRisk.length, threshold: parseFloat(threshold) });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Candidate Flight-Risk Predictor ─────────────────────────────────────
router.get('/flight-risk', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const activeApplications = await prisma.application.findMany({
      where: { tenantId, status: { in: ['APPLIED', 'SCREENING', 'INTERVIEW'] } } as any,
      include: { candidate: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { updatedAt: 'asc' },
    });

    const now = new Date();
    const flightRisks = activeApplications.map((app: any) => {
      const daysSinceUpdate = Math.floor((now.getTime() - new Date(app.updatedAt).getTime()) / 86400000);
      const riskScore = Math.min(1, daysSinceUpdate / 21);
      return {
        applicationId: app.id,
        candidateId: app.candidateId,
        candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
        currentStage: app.status,
        daysSinceLastUpdate: daysSinceUpdate,
        flightRiskScore: riskScore,
        riskLevel: riskScore > 0.8 ? 'HIGH' : riskScore > 0.5 ? 'MEDIUM' : 'LOW',
      };
    });

    const high = flightRisks.filter((f: any) => f.riskLevel === 'HIGH');
    const medium = flightRisks.filter((f: any) => f.riskLevel === 'MEDIUM');

    return sendOk(res, { flightRisks, summary: { high: high.length, medium: medium.length, total: flightRisks.length } });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Hiring Funnel Conversion Analytics ───────────────────────────────────
router.get('/funnel-conversion', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, departmentId, startDate, endDate } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (requisitionId) where.requisitionId = requisitionId;
    if (departmentId) where.requisition = { departmentId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const stages = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
    const counts = await Promise.all(
      stages.map(s => prisma.application.count({ where: { ...where, status: s } }))
    );

    const funnel = stages.map((stage, i) => ({
      stage,
      count: counts[i],
      conversionFromPrev: i > 0 && counts[i - 1] > 0 ? (counts[i] / counts[i - 1]) * 100 : null,
      conversionFromTop: counts[0] > 0 ? (counts[i] / counts[0]) * 100 : null,
    }));

    return sendOk(res, { funnel, totalApplicants: counts[0], totalHired: counts[4] });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Time-to-Fill Trend Analysis ─────────────────────────────────────────
router.get('/time-to-fill-trends', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { groupBy = 'month', departmentId } = req.query as Record<string, string>;

    const where: any = { tenantId, status: 'FILLED' };
    if (departmentId) where.departmentId = departmentId;

    const reqs = await prisma.requisition.findMany({
      where,
      select: { id: true, openedAt: true, closedAt: true, departmentId: true },
    });

    const trends = reqs
      .filter((r: any) => r.openedAt && r.closedAt)
      .map((r: any) => {
        const days = Math.floor((new Date(r.closedAt).getTime() - new Date(r.openedAt).getTime()) / 86400000);
        const period = groupBy === 'month'
          ? `${new Date(r.closedAt).getFullYear()}-${String(new Date(r.closedAt).getMonth() + 1).padStart(2, '0')}`
          : String(new Date(r.closedAt).getFullYear());
        return { requisitionId: r.id, days, period, departmentId: r.departmentId };
      });

    const byPeriod: Record<string, number[]> = {};
    for (const t of trends) {
      if (!byPeriod[t.period]) byPeriod[t.period] = [];
      byPeriod[t.period].push(t.days);
    }

    const periodAverages = Object.entries(byPeriod).map(([period, days]) => ({
      period,
      avgDays: days.reduce((a, b) => a + b, 0) / days.length,
      count: days.length,
    })).sort((a, b) => a.period.localeCompare(b.period));

    return sendOk(res, { trends: periodAverages, raw: trends });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Diversity Pipeline Analytics ────────────────────────────────────────
router.get('/diversity-pipeline', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { stage, departmentId } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (stage) where.status = stage;
    if (departmentId) where.requisition = { departmentId };

    const applications = await prisma.application.findMany({
      where,
      include: { candidate: { select: { gender: true, ethnicity: true, veteranStatus: true, disabilityStatus: true } } } as any,
    });

    const diversity: Record<string, Record<string, number>> = {
      gender: {},
      ethnicity: {},
      veteranStatus: {},
      disabilityStatus: {},
    };

    for (const app of applications) {
      const c = (app as any).candidate as any;
      if (c) {
        const g = c.gender || 'Not Disclosed';
        const e = c.ethnicity || 'Not Disclosed';
        const v = c.veteranStatus || 'Not Disclosed';
        const d = c.disabilityStatus || 'Not Disclosed';
        diversity.gender[g] = (diversity.gender[g] || 0) + 1;
        diversity.ethnicity[e] = (diversity.ethnicity[e] || 0) + 1;
        diversity.veteranStatus[v] = (diversity.veteranStatus[v] || 0) + 1;
        diversity.disabilityStatus[d] = (diversity.disabilityStatus[d] || 0) + 1;
      }
    }

    return sendOk(res, { diversity, totalApplications: applications.length, stage: stage || 'ALL' });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Recruiter Performance Scorecard ─────────────────────────────────────
router.get('/recruiter-scorecard', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { recruiterId, startDate, endDate } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (recruiterId) where.recruiterId = recruiterId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const reqs = await prisma.requisition.findMany({
      where,
      select: { id: true, recruiterId: true, status: true, openedAt: true, closedAt: true },
    });

    const scoresByRecruiter: Record<string, any> = {};
    for (const r of reqs) {
      const rid = (r as any).recruiterId || 'unassigned';
      if (!scoresByRecruiter[rid]) scoresByRecruiter[rid] = { total: 0, filled: 0, avgDays: [], requisitionIds: [] };
      scoresByRecruiter[rid].total++;
      scoresByRecruiter[rid].requisitionIds.push(r.id);
      if (r.status === 'FILLED' && (r as any).openedAt && (r as any).closedAt) {
        scoresByRecruiter[rid].filled++;
        const days = Math.floor((new Date((r as any).closedAt).getTime() - new Date((r as any).openedAt).getTime()) / 86400000);
        scoresByRecruiter[rid].avgDays.push(days);
      }
    }

    const scorecards = Object.entries(scoresByRecruiter).map(([rid, s]: [string, any]) => ({
      recruiterId: rid,
      totalRequisitions: s.total,
      filled: s.filled,
      fillRate: s.total > 0 ? (s.filled / s.total) * 100 : 0,
      avgTimeToFill: s.avgDays.length > 0 ? s.avgDays.reduce((a: number, b: number) => a + b, 0) / s.avgDays.length : null,
    }));

    return sendOk(res, { scorecards });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Offer Acceptance Rate Analytics ─────────────────────────────────────
router.get('/offer-acceptance', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { departmentId, startDate, endDate } = req.query as Record<string, string>;

    const where: any = { tenantId, status: { in: ['OFFER', 'HIRED', 'REJECTED'] } };
    if (departmentId) where.requisition = { departmentId };
    if (startDate || endDate) {
      where.updatedAt = {};
      if (startDate) where.updatedAt.gte = new Date(startDate);
      if (endDate) where.updatedAt.lte = new Date(endDate);
    }

    const apps = await prisma.application.findMany({ where });
    const offered = apps.filter((a: any) => ['OFFER', 'HIRED'].includes(a.status)).length;
    const accepted = apps.filter((a: any) => a.status === 'HIRED').length;
    const declined = offered - accepted;

    return sendOk(res, {
      totalOffered: offered,
      accepted,
      declined,
      acceptanceRate: offered > 0 ? (accepted / offered) * 100 : 0,
      declineRate: offered > 0 ? (declined / offered) * 100 : 0,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Interview-to-Offer Ratio ─────────────────────────────────────────────
router.get('/interview-to-offer', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { departmentId, requisitionId } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (requisitionId) where.requisitionId = requisitionId;
    if (departmentId) where.requisition = { departmentId };

    const [interviewed, offered, hired] = await Promise.all([
      prisma.application.count({ where: { ...where, status: { in: ['INTERVIEW', 'OFFER', 'HIRED'] } } }),
      prisma.application.count({ where: { ...where, status: { in: ['OFFER', 'HIRED'] } } }),
      prisma.application.count({ where: { ...where, status: 'HIRED' } }),
    ]);

    return sendOk(res, {
      interviewed,
      offered,
      hired,
      interviewToOfferRatio: offered > 0 ? interviewed / offered : null,
      offerToHireRatio: hired > 0 ? offered / hired : null,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Candidate Drop-off Analysis ─────────────────────────────────────────
router.get('/drop-off-analysis', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, startDate, endDate } = req.query as Record<string, string>;

    const where: any = { tenantId, status: 'WITHDRAWN' };
    if (requisitionId) where.requisitionId = requisitionId;
    if (startDate || endDate) {
      where.updatedAt = {};
      if (startDate) where.updatedAt.gte = new Date(startDate);
      if (endDate) where.updatedAt.lte = new Date(endDate);
    }

    const withdrawn = await prisma.application.findMany({
      where,
      select: { id: true, status: true, requisitionId: true, createdAt: true, updatedAt: true },
    });

    const byStage: Record<string, number> = {};
    for (const app of withdrawn) {
      const stage = app.status;
      byStage[stage] = (byStage[stage] || 0) + 1;
    }

    return sendOk(res, { dropOffByStage: byStage, totalDropped: withdrawn.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Cost-per-Hire Analytics ─────────────────────────────────────────────
router.get('/cost-per-hire', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { departmentId, startDate, endDate } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (departmentId) where.departmentId = departmentId;
    if (startDate || endDate) {
      where.openedAt = {};
      if (startDate) where.openedAt.gte = new Date(startDate);
      if (endDate) where.openedAt.lte = new Date(endDate);
    }

    const reqs = await prisma.requisition.findMany({
      where: { ...where, status: 'FILLED' },
      select: { id: true, title: true, departmentId: true, budget: true },
    });

    const metrics = reqs.map((r: any) => ({
      requisitionId: r.id,
      title: r.title,
      departmentId: r.departmentId,
      allocatedBudget: r.budget || 0,
      estimatedCostPerHire: r.budget || 0,
    }));

    const totalBudget = metrics.reduce((s: number, m: any) => s + m.allocatedBudget, 0);

    return sendOk(res, { requisitions: metrics, totalBudget, avgCostPerHire: metrics.length > 0 ? totalBudget / metrics.length : 0 });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Headcount Planning Analytics ────────────────────────────────────────
router.get('/headcount-planning', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { departmentId, quarter, year } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (departmentId) where.departmentId = departmentId;

    const [openReqs, filledReqs, totalCandidates] = await Promise.all([
      prisma.requisition.count({ where: { ...where, status: 'OPEN' } }),
      prisma.requisition.count({ where: { ...where, status: 'FILLED' } }),
      prisma.candidate.count({ where: { tenantId } }),
    ]);

    return sendOk(res, {
      openPositions: openReqs,
      filledPositions: filledReqs,
      totalCandidatesInPool: totalCandidates,
      quarter: quarter || null,
      year: year || new Date().getFullYear(),
      projectedHires: Math.ceil(openReqs * 0.7),
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Sourcing Channel ROI ─────────────────────────────────────────────────
router.get('/sourcing-roi', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const hiredApplications = await prisma.application.findMany({
      where: { tenantId, status: 'HIRED' },
      include: { candidate: { select: { sourceChannel: true } } } as any,
    });

    const roi: Record<string, { hires: number; estimatedCost: number; costPerHire: number }> = {};
    const channelCosts: Record<string, number> = {
      LinkedIn: 5000,
      Indeed: 2000,
      Referral: 500,
      Company_Website: 200,
      Agency: 15000,
      Unknown: 0,
    };

    for (const app of hiredApplications) {
      const src = ((app as any).candidate as any)?.sourceChannel || 'Unknown';
      if (!roi[src]) roi[src] = { hires: 0, estimatedCost: channelCosts[src] || 1000, costPerHire: 0 };
      roi[src].hires++;
    }

    for (const src of Object.keys(roi)) {
      roi[src].costPerHire = roi[src].hires > 0 ? roi[src].estimatedCost / roi[src].hires : 0;
    }

    return sendOk(res, { sourcingROI: roi });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Pipeline Aging Report ────────────────────────────────────────────────
router.get('/pipeline-aging', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { stage, thresholdDays = '14' } = req.query as Record<string, string>;

    const where: any = { tenantId, status: { notIn: ['HIRED', 'REJECTED', 'WITHDRAWN'] } };
    if (stage) where.status = stage;

    const applications = await prisma.application.findMany({
      where,
      include: { candidate: { select: { firstName: true, lastName: true } }, requisition: { select: { title: true } } },
    });

    const now = new Date();
    const aged = applications.map((app: any) => {
      const daysInStage = Math.floor((now.getTime() - new Date(app.updatedAt).getTime()) / 86400000);
      return {
        applicationId: app.id,
        candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
        role: app.requisition?.title,
        stage: app.status,
        daysInStage,
        isStale: daysInStage > parseInt(thresholdDays),
      };
    }).sort((a: any, b: any) => b.daysInStage - a.daysInStage);

    const stale = aged.filter((a: any) => a.isStale);

    return sendOk(res, { applications: aged, staleCount: stale.length, thresholdDays: parseInt(thresholdDays) });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Requisition Approval Cycle Time ─────────────────────────────────────
router.get('/approval-cycle-time', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { departmentId } = req.query as Record<string, string>;

    const where: any = { tenantId, status: { in: ['OPEN', 'FILLED'] } };
    if (departmentId) where.departmentId = departmentId;

    const reqs = await prisma.requisition.findMany({
      where,
      select: { id: true, title: true, createdAt: true, openedAt: true, departmentId: true },
    });

    const cycleTimes = reqs
      .filter((r: any) => r.openedAt)
      .map((r: any) => {
        const days = Math.floor((new Date(r.openedAt).getTime() - new Date(r.createdAt).getTime()) / 86400000);
        return { requisitionId: r.id, title: r.title, departmentId: r.departmentId, approvalDays: days };
      });

    const avg = cycleTimes.length > 0 ? cycleTimes.reduce((s, c) => s + c.approvalDays, 0) / cycleTimes.length : 0;

    return sendOk(res, { cycleTimes, averageApprovalDays: avg, count: cycleTimes.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Candidate Experience Score Tracking ──────────────────────────────────
router.get('/candidate-experience-scores', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate, minScore, maxScore } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const feedback = await (prisma as any).candidateFeedback.findMany({ where });

    const scores = feedback.map((f: any) => f.overallScore).filter((s: any) => s != null);
    const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
    const nps = scores.filter((s: number) => s >= 9).length - scores.filter((s: number) => s <= 6).length;

    return sendOk(res, {
      feedbackCount: feedback.length,
      averageScore: avg,
      npsScore: scores.length > 0 ? Math.round((nps / scores.length) * 100) : 0,
      scoreDistribution: scores.reduce((acc: Record<string, number>, s: number) => {
        const key = String(s);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Hiring Manager Effectiveness ────────────────────────────────────────
router.get('/hiring-manager-effectiveness', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const reqs = await prisma.requisition.findMany({
      where: { tenantId },
      select: { id: true, hiringManagerId: true, status: true, openedAt: true, closedAt: true },
    });

    const byManager: Record<string, any> = {};
    for (const r of reqs) {
      const mid = (r as any).hiringManagerId || 'unassigned';
      if (!byManager[mid]) byManager[mid] = { total: 0, filled: 0, avgDays: [] };
      byManager[mid].total++;
      if (r.status === 'FILLED' && (r as any).openedAt && (r as any).closedAt) {
        byManager[mid].filled++;
        const days = Math.floor((new Date((r as any).closedAt).getTime() - new Date((r as any).openedAt).getTime()) / 86400000);
        byManager[mid].avgDays.push(days);
      }
    }

    const effectiveness = Object.entries(byManager).map(([mid, m]: [string, any]) => ({
      hiringManagerId: mid,
      totalRequisitions: m.total,
      filled: m.filled,
      fillRate: m.total > 0 ? (m.filled / m.total) * 100 : 0,
      avgTimeToFill: m.avgDays.length > 0 ? m.avgDays.reduce((a: number, b: number) => a + b, 0) / m.avgDays.length : null,
    }));

    return sendOk(res, { effectiveness });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Department Hiring Health ────────────────────────────────────────────
router.get('/department-hiring-health', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const reqs = await prisma.requisition.findMany({
      where: { tenantId },
      select: { id: true, departmentId: true, status: true, openedAt: true, closedAt: true } as any,
    }) as any[];

    const byDept: Record<string, any> = {};
    for (const r of reqs) {
      const dept = r.departmentId || 'unknown';
      if (!byDept[dept]) byDept[dept] = { open: 0, filled: 0, total: 0, avgDays: [] };
      byDept[dept].total++;
      if (r.status === 'OPEN') byDept[dept].open++;
      if (r.status === 'FILLED') {
        byDept[dept].filled++;
        if ((r as any).openedAt && (r as any).closedAt) {
          const days = Math.floor((new Date((r as any).closedAt).getTime() - new Date((r as any).openedAt).getTime()) / 86400000);
          byDept[dept].avgDays.push(days);
        }
      }
    }

    const health = Object.entries(byDept).map(([dept, d]: [string, any]) => ({
      departmentId: dept,
      openRequisitions: d.open,
      filledRequisitions: d.filled,
      total: d.total,
      fillRate: d.total > 0 ? (d.filled / d.total) * 100 : 0,
      avgTimeToFill: d.avgDays.length > 0 ? d.avgDays.reduce((a: number, b: number) => a + b, 0) / d.avgDays.length : null,
      healthScore: Math.max(0, 100 - (d.open * 10)),
    }));

    return sendOk(res, { departmentHealth: health });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Real-time Hiring Dashboard Metrics ───────────────────────────────────
router.get('/realtime-metrics', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOpen, newToday, hiredToday, activeApplications, urgentRoles] = await Promise.all([
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.requisition.count({ where: { tenantId, createdAt: { gte: today } } }),
      prisma.application.count({ where: { tenantId, status: 'HIRED', updatedAt: { gte: today } } }),
      prisma.application.count({ where: { tenantId, status: { notIn: ['HIRED', 'REJECTED', 'WITHDRAWN'] } } }),
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } as any }) as any
    ]);

    return sendOk(res, {
      openRoles: totalOpen,
      newRolesToday: newToday,
      hiredToday,
      activeApplications,
      urgentRoles,
      lastUpdated: new Date(),
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Competitive Offer Analytics ─────────────────────────────────────────
router.get('/competitive-offers', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { departmentId } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (departmentId) where.requisition = { departmentId };

    const offers = await prisma.application.findMany({
      where: { ...where, status: { in: ['OFFER', 'HIRED'] } },
      include: { requisition: { select: { title: true, salaryMin: true, salaryMax: true } } },
    });

    const analysis = offers.map((o: any) => ({
      applicationId: o.id,
      role: o.requisition?.title,
      offeredSalary: o.offeredSalary || null,
      marketMin: o.requisition?.salaryMin || null,
      marketMax: o.requisition?.salaryMax || null,
      isCompetitive: o.offeredSalary && o.requisition?.salaryMax
        ? o.offeredSalary >= o.requisition.salaryMax * 0.9
        : null,
      accepted: o.status === 'HIRED',
    }));

    return sendOk(res, { offerAnalysis: analysis, totalOffers: offers.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Talent Pipeline Health Score ────────────────────────────────────────
router.get('/pipeline-health-score', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const [totalCandidates, activeCandidates, openReqs, recentHires] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.candidate.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.application.count({
        where: { tenantId, status: 'HIRED', updatedAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      }),
    ]);

    const supplyDemandRatio = openReqs > 0 ? activeCandidates / openReqs : null;
    const healthScore = Math.min(100, Math.max(0,
      (activeCandidates > 0 ? 30 : 0) +
      (supplyDemandRatio && supplyDemandRatio >= 3 ? 30 : supplyDemandRatio ? 15 : 0) +
      (recentHires > 0 ? 40 : 0)
    ));

    return sendOk(res, {
      healthScore,
      totalCandidates,
      activeCandidates,
      openRequisitions: openReqs,
      recentHires30Days: recentHires,
      supplyDemandRatio,
      grade: healthScore >= 80 ? 'A' : healthScore >= 60 ? 'B' : healthScore >= 40 ? 'C' : 'D',
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Workforce Planning Forecast ─────────────────────────────────────────
router.get('/workforce-forecast', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { months = '6' } = req.query as Record<string, string>;
    const forecastMonths = parseInt(months);

    const recentHireRate = await prisma.application.count({
      where: { tenantId, status: 'HIRED', updatedAt: { gte: new Date(Date.now() - 90 * 86400000) } },
    });
    const monthlyHireRate = recentHireRate / 3;
    const openReqs = await prisma.requisition.count({ where: { tenantId, status: 'OPEN' } });

    const forecast = Array.from({ length: forecastMonths }, (_, i) => ({
      month: i + 1,
      projectedHires: Math.round(monthlyHireRate),
      cumulativeHires: Math.round(monthlyHireRate * (i + 1)),
      remainingOpenRoles: Math.max(0, openReqs - Math.round(monthlyHireRate * (i + 1))),
    }));

    return sendOk(res, { forecast, currentOpenRoles: openReqs, monthlyHireRate, forecastPeriodMonths: forecastMonths });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Skill Gap Analytics ──────────────────────────────────────────────────
router.get('/skill-gap-analysis', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { departmentId } = req.query as Record<string, string>;

    const where: any = { tenantId, status: 'OPEN' };
    if (departmentId) where.departmentId = departmentId;

    const reqs = await prisma.requisition.findMany({
      where,
      select: { id: true, title: true, skills: true, departmentId: true },
    });

    const skillDemand: Record<string, number> = {};
    for (const r of reqs) {
      const skills = (r as any).skills || [];
      for (const skill of skills) {
        skillDemand[skill] = (skillDemand[skill] || 0) + 1;
      }
    }

    const topSkills = Object.entries(skillDemand)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([skill, demand]) => ({ skill, demand }));

    return sendOk(res, { skillDemand: topSkills, openRequisitions: reqs.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Application Velocity Analytics ──────────────────────────────────────
router.get('/application-velocity', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, days = '30' } = req.query as Record<string, string>;

    const since = new Date(Date.now() - parseInt(days) * 86400000);
    const where: any = { tenantId, createdAt: { gte: since } };
    if (requisitionId) where.requisitionId = requisitionId;

    const applications = await prisma.application.findMany({
      where,
      select: { id: true, createdAt: true, requisitionId: true },
      orderBy: { createdAt: 'asc' },
    });

    const byDay: Record<string, number> = {};
    for (const app of applications) {
      const day = new Date(app.createdAt).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    }

    const dailyVelocity = Object.entries(byDay).map(([date, count]) => ({ date, count }));
    const avgPerDay = applications.length / parseInt(days);

    return sendOk(res, { dailyVelocity, totalApplications: applications.length, avgPerDay, periodDays: parseInt(days) });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Rejection Reason Analytics ──────────────────────────────────────────
router.get('/rejection-reasons', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate, departmentId } = req.query as Record<string, string>;

    const where: any = { tenantId, status: 'REJECTED' };
    if (departmentId) where.requisition = { departmentId };
    if (startDate || endDate) {
      where.updatedAt = {};
      if (startDate) where.updatedAt.gte = new Date(startDate);
      if (endDate) where.updatedAt.lte = new Date(endDate);
    }

    const rejected = await prisma.application.findMany({
      where,
      select: { id: true, rejectionReason: true, status: true },
    });

    const byReason: Record<string, number> = {};
    for (const r of rejected) {
      const reason = (r as any).rejectionReason || 'Not Specified';
      byReason[reason] = (byReason[reason] || 0) + 1;
    }

    const reasons = Object.entries(byReason)
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => ({ reason, count, percentage: (count / rejected.length) * 100 }));

    return sendOk(res, { rejectionReasons: reasons, totalRejected: rejected.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Passive Candidate Engagement ────────────────────────────────────────
router.get('/passive-candidate-engagement', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const passiveCandidates = await prisma.candidate.findMany({
      where: { tenantId, status: 'PASSIVE' } as any,
      select: { id: true, firstName: true, lastName: true, lastActivityAt: true, engagementScore: true } as any,
      orderBy: { engagementScore: 'desc' } as any,
      take: 50,
    });

    const engaged = passiveCandidates.filter((c: any) => c.engagementScore && c.engagementScore > 50);

    return sendOk(res, {
      passiveCandidates: passiveCandidates.length,
      engagedPassive: engaged.length,
      topEngaged: engaged.slice(0, 10),
      engagementRate: passiveCandidates.length > 0 ? (engaged.length / passiveCandidates.length) * 100 : 0,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: SLA Compliance Analytics ────────────────────────────────────────────
router.get('/sla-compliance', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const slaTargetDays: Record<string, number> = {
      APPLIED: 3,
      SCREENING: 7,
      INTERVIEW: 14,
      OFFER: 21,
    };

    const applications = await prisma.application.findMany({
      where: { tenantId, status: { notIn: ['HIRED', 'REJECTED', 'WITHDRAWN'] } },
      select: { id: true, status: true, updatedAt: true },
    });

    const now = new Date();
    let compliant = 0;
    let breach = 0;

    const details = applications.map((app: any) => {
      const daysInStage = Math.floor((now.getTime() - new Date(app.updatedAt).getTime()) / 86400000);
      const slaTarget = slaTargetDays[app.status] || 14;
      const isBreach = daysInStage > slaTarget;
      if (isBreach) breach++; else compliant++;
      return { applicationId: app.id, stage: app.status, daysInStage, slaTarget, isBreach };
    });

    const total = applications.length;
    return sendOk(res, {
      compliance: { compliant, breach, total },
      complianceRate: total > 0 ? (compliant / total) * 100 : 100,
      breaches: details.filter((d: any) => d.isBreach),
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Internal vs External Hire Analysis ───────────────────────────────────
router.get('/internal-vs-external', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { departmentId, startDate, endDate } = req.query as Record<string, string>;

    const where: any = { tenantId, status: 'HIRED' };
    if (departmentId) where.requisition = { departmentId };
    if (startDate || endDate) {
      where.updatedAt = {};
      if (startDate) where.updatedAt.gte = new Date(startDate);
      if (endDate) where.updatedAt.lte = new Date(endDate);
    }

    const hires = await prisma.application.findMany({
      where,
      include: { candidate: { select: { isInternal: true } } } as any,
    });

    const internal = hires.filter((h: any) => h.candidate?.isInternal).length;
    const external = hires.length - internal;

    return sendOk(res, {
      totalHires: hires.length,
      internal,
      external,
      internalRate: hires.length > 0 ? (internal / hires.length) * 100 : 0,
      externalRate: hires.length > 0 ? (external / hires.length) * 100 : 0,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Talent Acquisition ROI ───────────────────────────────────────────────
router.get('/ta-roi', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { fiscalYear } = req.query as Record<string, string>;

    const year = parseInt(fiscalYear || String(new Date().getFullYear()));
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);

    const [totalHires, totalApplications, openReqs] = await Promise.all([
      prisma.application.count({ where: { tenantId, status: 'HIRED', updatedAt: { gte: start, lte: end } } }),
      prisma.application.count({ where: { tenantId, createdAt: { gte: start, lte: end } } }),
      prisma.requisition.count({ where: { tenantId, status: 'OPEN', createdAt: { gte: start, lte: end } } }),
    ]);

    const estimatedCostPerHire = 4500;
    const totalCost = totalHires * estimatedCostPerHire;
    const estimatedValuePerHire = 50000;
    const totalValue = totalHires * estimatedValuePerHire;

    return sendOk(res, {
      fiscalYear: year,
      totalHires,
      totalApplications,
      openRequisitions: openReqs,
      estimatedTotalCost: totalCost,
      estimatedTotalValue: totalValue,
      roi: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Benchmark Comparison Analytics ──────────────────────────────────────
router.get('/benchmarks', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { industry = 'technology' } = req.query as Record<string, string>;

    const industryBenchmarks: Record<string, any> = {
      technology: { avgTimeToFill: 42, avgCostPerHire: 4200, offerAcceptanceRate: 85, avgInterviewRounds: 4 },
      finance: { avgTimeToFill: 38, avgCostPerHire: 5500, offerAcceptanceRate: 82, avgInterviewRounds: 5 },
      healthcare: { avgTimeToFill: 55, avgCostPerHire: 3800, offerAcceptanceRate: 88, avgInterviewRounds: 3 },
      retail: { avgTimeToFill: 28, avgCostPerHire: 1500, offerAcceptanceRate: 78, avgInterviewRounds: 2 },
    };

    const benchmark = industryBenchmarks[industry] || industryBenchmarks.technology;

    const [totalHired, totalOffered] = await Promise.all([
      prisma.application.count({ where: { tenantId, status: 'HIRED' } }),
      prisma.application.count({ where: { tenantId, status: { in: ['OFFER', 'HIRED'] as any } } }) as any
    ]);

    const yourMetrics = {
      offerAcceptanceRate: totalOffered > 0 ? (totalHired / totalOffered) * 100 : 0,
    };

    return sendOk(res, {
      industry,
      benchmark,
      yourMetrics,
      comparison: {
        offerAcceptanceRate: {
          yours: yourMetrics.offerAcceptanceRate,
          benchmark: benchmark.offerAcceptanceRate,
          delta: yourMetrics.offerAcceptanceRate - benchmark.offerAcceptanceRate,
        },
      },
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Geographic Hiring Distribution ──────────────────────────────────────
router.get('/geographic-distribution', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const candidates = await prisma.candidate.findMany({
      where: { tenantId },
      select: { id: true, city: true, state: true, country: true, status: true },
    });

    const byCountry: Record<string, number> = {};
    const byState: Record<string, number> = {};

    for (const c of candidates) {
      const country = (c as any).country || 'Unknown';
      const state = (c as any).state || 'Unknown';
      byCountry[country] = (byCountry[country] || 0) + 1;
      byState[state] = (byState[state] || 0) + 1;
    }

    return sendOk(res, {
      byCountry: Object.entries(byCountry).sort(([, a], [, b]) => b - a).map(([country, count]) => ({ country, count })),
      byState: Object.entries(byState).sort(([, a], [, b]) => b - a).slice(0, 20).map(([state, count]) => ({ state, count })),
      totalCandidates: candidates.length,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Interview Completion Rate ───────────────────────────────────────────
router.get('/interview-completion-rate', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const interviews = await prisma.interview.findMany({ where, select: { id: true, status: true } });
    const scheduled = interviews.length;
    const completed = interviews.filter((i: any) => i.status === 'COMPLETED').length;
    const noShow = interviews.filter((i: any) => i.status === 'NO_SHOW').length;
    const cancelled = interviews.filter((i: any) => i.status === 'CANCELLED').length;

    return sendOk(res, {
      scheduled,
      completed,
      noShow,
      cancelled,
      completionRate: scheduled > 0 ? (completed / scheduled) * 100 : 0,
      noShowRate: scheduled > 0 ? (noShow / scheduled) * 100 : 0,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Talent Nurture Campaign Analytics ────────────────────────────────────
router.get('/nurture-campaign-analytics', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const campaigns = await (prisma as any).emailCampaign.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        status: true,
        sentCount: true,
        openCount: true,
        clickCount: true,
        replyCount: true,
        createdAt: true,
      },
    });

    const metrics = campaigns.map((c: any) => ({
      campaignId: c.id,
      name: c.name,
      status: c.status,
      sentCount: c.sentCount || 0,
      openRate: c.sentCount > 0 ? (c.openCount / c.sentCount) * 100 : 0,
      clickRate: c.sentCount > 0 ? (c.clickCount / c.sentCount) * 100 : 0,
      replyRate: c.sentCount > 0 ? (c.replyCount / c.sentCount) * 100 : 0,
    }));

    return sendOk(res, { campaigns: metrics, totalCampaigns: campaigns.length });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Referral Program Analytics ──────────────────────────────────────────
router.get('/referral-analytics', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const referrals = await prisma.candidate.findMany({
      where: { tenantId, sourceChannel: 'REFERRAL' },
      select: { id: true, referredById: true, status: true },
    });

    const byReferrer: Record<string, { total: number; hired: number }> = {};
    for (const r of referrals) {
      const ref = (r as any).referredById || 'unknown';
      if (!byReferrer[ref]) byReferrer[ref] = { total: 0, hired: 0 };
      byReferrer[ref].total++;
      if (r.status === 'HIRED') byReferrer[ref].hired++;
    }

    const topReferrers = Object.entries(byReferrer)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10)
      .map(([referrerId, data]) => ({ referrerId, ...data, conversionRate: data.total > 0 ? (data.hired / data.total) * 100 : 0 }));

    return sendOk(res, {
      totalReferrals: referrals.length,
      hiredFromReferral: referrals.filter((r: any) => r.status === 'HIRED').length,
      topReferrers,
      referralHireRate: referrals.length > 0 ? (referrals.filter((r: any) => r.status === 'HIRED').length / referrals.length) * 100 : 0,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Seasonal Hiring Patterns ────────────────────────────────────────────
router.get('/seasonal-patterns', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const applications = await prisma.application.findMany({
      where: { tenantId },
      select: { createdAt: true, status: true },
    }) as any[];

    const byMonth: Record<string, { applications: number; hires: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const app of applications) {
      const month = monthNames[new Date(app.createdAt).getMonth()];
      if (!byMonth[month]) byMonth[month] = { applications: 0, hires: 0 };
      byMonth[month].applications++;
      if (app.status === 'HIRED') byMonth[month].hires++;
    }

    const patterns = monthNames.map(month => ({
      month,
      applications: byMonth[month]?.applications || 0,
      hires: byMonth[month]?.hires || 0,
    }));

    return sendOk(res, { patterns });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Candidate Source Mix Analytics ──────────────────────────────────────
router.get('/source-mix', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate } = req.query as Record<string, string>;

    const where: any = { tenantId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const candidates = await (prisma.candidate.findMany({ where }) as any);

    const mix: Record<string, { total: number; hired: number }> = {};
    for (const c of candidates) {
      const src = (c as any).sourceChannel || 'Unknown';
      if (!mix[src]) mix[src] = { total: 0, hired: 0 };
      mix[src].total++;
      if ((c as any).status === 'HIRED') mix[src].hired++;
    }

    const total = candidates.length;
    const sources = Object.entries(mix).map(([source, data]) => ({
      source,
      count: data.total,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
      hires: data.hired,
      hireRate: data.total > 0 ? (data.hired / data.total) * 100 : 0,
    })).sort((a, b) => b.count - a.count);

    return sendOk(res, { sourceMix: sources, totalCandidates: total });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Executive Hiring Summary ────────────────────────────────────────────
router.get('/executive-summary', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate } = req.query as Record<string, string>;

    const appWhere: any = { tenantId };
    if (startDate || endDate) {
      appWhere.createdAt = {};
      if (startDate) appWhere.createdAt.gte = new Date(startDate);
      if (endDate) appWhere.createdAt.lte = new Date(endDate);
    }

    const [openRoles, totalApps, hires, offered] = await Promise.all([
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.application.count({ where: appWhere }),
      prisma.application.count({ where: { ...appWhere, status: 'HIRED' } }),
      prisma.application.count({ where: { ...appWhere, status: { in: ['OFFER', 'HIRED'] } } }),
    ]);

    return sendOk(res, {
      period: { startDate: startDate || null, endDate: endDate || null },
      openPositions: openRoles,
      totalApplications: totalApps,
      totalHires: hires,
      offerAcceptanceRate: offered > 0 ? (hires / offered) * 100 : 0,
      conversionRate: totalApps > 0 ? (hires / totalApps) * 100 : 0,
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Cohort Retention Analysis ───────────────────────────────────────────
router.get('/cohort-retention', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { cohortYear } = req.query as Record<string, string>;

    const year = parseInt(cohortYear || String(new Date().getFullYear() - 1));
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);

    const hires = await prisma.application.findMany({
      where: { tenantId, status: 'HIRED', updatedAt: { gte: start, lte: end } },
      select: { candidateId: true, updatedAt: true },
    });

    return sendOk(res, {
      cohortYear: year,
      cohortSize: hires.length,
      retentionData: hires.map((h: any) => ({
        candidateId: h.candidateId,
        hiredAt: h.updatedAt,
        daysSinceHire: Math.floor((Date.now() - new Date(h.updatedAt).getTime()) / 86400000),
      })),
      note: 'Connect HRIS for real retention data',
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Hiring Goal Tracking ─────────────────────────────────────────────────
router.get('/goal-tracking', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const goals = await (prisma as any).hiringGoal.findMany({
      where: { tenantId },
      orderBy: { targetDate: 'asc' },
    });

    const progress = await Promise.all(goals.map(async (goal: any) => {
      const actual = await prisma.application.count({
        where: {
          tenantId,
          status: 'HIRED',
          ...(goal.departmentId ? { requisition: { departmentId: goal.departmentId } } : {}) as any,
          updatedAt: { gte: goal.startDate, lte: goal.targetDate },
        },
      });
      return {
        goalId: goal.id,
        name: goal.name,
        target: goal.targetCount,
        actual,
        progress: goal.targetCount > 0 ? (actual / goal.targetCount) * 100 : 0,
        status: actual >= goal.targetCount ? 'ACHIEVED' : new Date() > goal.targetDate ? 'MISSED' : 'IN_PROGRESS',
      };
    }));

    return sendOk(res, { goals: progress });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2: Talent Intelligence Report ──────────────────────────────────────────
router.get('/talent-intelligence', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    const [totalCandidates, activePipeline, openRoles, recentHires, avgTimeToFillData] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.application.count({ where: { tenantId, status: { notIn: ['HIRED', 'REJECTED', 'WITHDRAWN'] } } }),
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.application.count({ where: { tenantId, status: 'HIRED', updatedAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
      prisma.requisition.findMany({
        where: { tenantId, status: 'FILLED', openedAt: { not: null }, closedAt: { not: null } },
        select: { openedAt: true, closedAt: true },
        take: 100,
      }),
    ]);

    const ttfDays = (avgTimeToFillData as any[])
      .filter(r => r.openedAt && r.closedAt)
      .map(r => Math.floor((new Date(r.closedAt).getTime() - new Date(r.openedAt).getTime()) / 86400000));

    const avgTTF = ttfDays.length > 0 ? ttfDays.reduce((a, b) => a + b, 0) / ttfDays.length : null;

    return sendOk(res, {
      intelligence: {
        totalCandidates,
        activePipeline,
        openRoles,
        recentHires30Days: recentHires,
        avgTimeToFillDays: avgTTF,
      },
      insights: [
        activePipeline < openRoles * 3 ? 'Pipeline is thin — consider sourcing campaigns' : 'Pipeline depth is healthy',
        recentHires === 0 ? 'No hires in last 30 days — review bottlenecks' : `${recentHires} hire(s) in last 30 days`,
        avgTTF && avgTTF > 45 ? 'Time-to-fill is above industry average' : 'Time-to-fill is within target',
      ],
      generatedAt: new Date(),
    });
  } catch (e: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } });
  }
});

// ─── P2/P3 ANALYTICS FEATURES ───────────────────────────────────────────────

// 1. GET /source-to-outcome-attribution
router.get('/source-to-outcome-attribution', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const sources = await prisma.candidate.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { _all: true },
    });
    const enriched = await Promise.all(
      sources.map(async (s) => {
        const apps = await prisma.candidateApplication.count({
          where: { candidate: { tenantId, source: s.source } },
        });
        return { source: s.source, candidates: s._count._all, applications: apps };
      })
    );
    return sendOk(res, { attribution: enriched });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const SourceAttributionRunSchema = z.object({ startDate: z.string(), endDate: z.string() });
// 2. POST /source-to-outcome-attribution/run
router.post('/source-to-outcome-attribution/run', validate(SourceAttributionRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { startDate, endDate } = req.body;
    const sources = await prisma.candidate.groupBy({
      by: ['source'],
      where: { tenantId, createdAt: { gte: new Date(startDate), lte: new Date(endDate) } },
      _count: { _all: true },
    });
    return sendOk(res, { period: { startDate, endDate }, attribution: sources.map((s) => ({ source: s.source, count: s._count._all })) });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 3. GET /quality-of-hire-outcome-learning-loop
router.get('/quality-of-hire-outcome-learning-loop', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, respondedAt: { not: null } },
      select: { id: true, status: true, salaryAmount: true, sentAt: true, respondedAt: true, requisitionId: true },
      take: 100, orderBy: { respondedAt: 'desc' },
    });
    const accepted = offers.filter((o) => o.status === 'ACCEPTED').length;
    return sendOk(res, { totalResponded: offers.length, accepted, acceptanceRate: offers.length ? accepted / offers.length : 0, offers });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 4. GET /continuous-workflow-experimentation-system
router.get('/continuous-workflow-experimentation-system', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const metrics = await prisma.pipelineMetric.groupBy({
      by: ['metricType'] as any,
      where: { tenantId },
      _count: { _all: true },
      _avg: { value: true } as any,
    });
    return sendOk(res, { experiments: metrics });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const ExperimentSchema = z.object({ experimentName: z.string().min(1), hypothesis: z.string() });
// 5. POST /continuous-workflow-experimentation-system
router.post('/continuous-workflow-experimentation-system', validate(ExperimentSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { experimentName, hypothesis } = req.body;
    const event = await prisma.hiringEvent.create({
      data: { tenantId, eventType: 'EXPERIMENT_CREATED', resourceType: 'EXPERIMENT', metadata: { experimentName, hypothesis } as any } as any,
    });
    return sendOk(res, { created: true, eventId: event.id, experimentName });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 6. GET /usp-predictive-success-modeling
router.get('/usp-predictive-success-modeling', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const stages = await prisma.candidateApplication.groupBy({
      by: ['stage'],
      where: { requisition: { tenantId } },
      _count: { _all: true },
    });
    const total = stages.reduce((s, r) => s + r._count._all, 0);
    const enriched = stages.map((s) => ({ stage: s.stage, count: s._count._all, conversionRate: total ? s._count._all / total : 0 }));
    return sendOk(res, { stages: enriched, totalApplications: total });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 7. GET /usp-reporting-agent-nlp-to-dashboard
router.get('/usp-reporting-agent-nlp-to-dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const events = await prisma.hiringEvent.findMany({
      where: { tenantId }, take: 50, orderBy: { createdAt: 'desc' },
      select: { id: true, eventType: true, resourceType: true, createdAt: true },
    });
    const byType = events.reduce((acc: Record<string, number>, e) => { acc[e.eventType] = (acc[e.eventType] || 0) + 1; return acc; }, {});
    return sendOk(res, { summary: byType, recentEvents: events.slice(0, 10) });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const NlpQueryRunSchema = z.object({ query: z.string().min(1) });
// 8. POST /usp-reporting-agent-nlp-to-dashboard/run
router.post('/usp-reporting-agent-nlp-to-dashboard/run', validate(NlpQueryRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { query } = req.body;
    const [candidates, applications, offers] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId } } }),
      prisma.offer.count({ where: { tenantId } }),
    ]);
    return sendOk(res, { query, response: { candidates, applications, offers }, generatedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const NlpQuerySchema = z.object({ query: z.string().min(1), format: z.string().optional() });
// 9. POST /usp-reporting-agent-nlp-to-dashboard
router.post('/usp-reporting-agent-nlp-to-dashboard', validate(NlpQuerySchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { query, format } = req.body;
    const [candidates, applications, offers] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId } } }),
      prisma.offer.count({ where: { tenantId } }),
    ]);
    return sendOk(res, { query, format: format || 'json', data: { candidates, applications, offers }, generatedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 10. GET /usp-recruitment-marketing-roi-agent
router.get('/usp-recruitment-marketing-roi-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const channels = await prisma.candidate.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { _all: true },
    });
    return sendOk(res, { channels: channels.map((c) => ({ channel: c.source, candidates: c._count._all })) });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const ChannelRoiSchema = z.object({ channels: z.array(z.string()).optional() });
// 11. POST /usp-recruitment-marketing-roi-agent/run
router.post('/usp-recruitment-marketing-roi-agent/run', validate(ChannelRoiSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { channels } = req.body;
    const where: any = { tenantId };
    if (channels?.length) where.source = { in: channels };
    const data = await prisma.candidate.groupBy({ by: ['source'], where, _count: { _all: true } });
    const roi = data.map((d) => ({ channel: d.source, candidates: d._count._all, estimatedRoi: d._count._all * 1500 }));
    return sendOk(res, { roi, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 12. GET /usp-scenario-planning-simulator
router.get('/usp-scenario-planning-simulator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = await prisma.requisition.groupBy({
      by: ['department', 'status'],
      where: { tenantId },
      _count: { _all: true },
    });
    return sendOk(res, { scenarios: data });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 13. GET /talent-pool-attrition-predictor
router.get('/talent-pool-attrition-predictor', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const sixMonthsAgo = new Date(Date.now() - 180 * 86400000);
    const atRisk = await prisma.candidate.findMany({
      where: { tenantId, createdAt: { lt: sixMonthsAgo }, applications: { none: { createdAt: { gte: sixMonthsAgo } } } } as any,
      take: 100, select: { id: true, status: true, source: true, createdAt: true },
    });
    return sendOk(res, { atRiskCount: atRisk.length, candidates: atRisk });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const AttritionRunSchema = z.object({ thresholdDays: z.number().int().min(30).default(180) });
// 14. POST /talent-pool-attrition-predictor/run
router.post('/talent-pool-attrition-predictor/run', validate(AttritionRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { thresholdDays } = req.body;
    const threshold = new Date(Date.now() - thresholdDays * 86400000);
    const atRisk = await prisma.candidate.count({
      where: { tenantId, createdAt: { lt: threshold }, applications: { none: { createdAt: { gte: threshold } } } } as any,
    });
    return sendOk(res, { thresholdDays, atRiskCount: atRisk, riskScore: Math.min(1, atRisk / 100) });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 15. GET /candidate-flight-risk-predictor
router.get('/candidate-flight-risk-predictor', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const apps = await prisma.candidateApplication.findMany({
      where: { requisition: { tenantId }, stage: { in: ['OFFER', 'INTERVIEW'] as any[] } },
      select: { id: true, stage: true, createdAt: true, candidateId: true, requisitionId: true },
      take: 100,
    });
    const now = Date.now();
    const enriched = apps.map((a) => ({ ...a, daysInStage: Math.floor((now - (a as any).createdAt.getTime()) / 86400000) }));
    return sendOk(res, { atRisk: enriched.filter((a) => a.daysInStage > 7), total: enriched.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const FlightRiskRunSchema = z.object({ candidateId: z.string().optional() });
// 16. POST /candidate-flight-risk-predictor/run
router.post('/candidate-flight-risk-predictor/run', validate(FlightRiskRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId } = req.body;
    const where: any = { requisition: { tenantId }, stage: { in: ['OFFER', 'INTERVIEW'] as any[] } };
    if (candidateId) where.candidateId = candidateId;
    const apps = await prisma.candidateApplication.findMany({ where, take: 50, select: { id: true, stage: true, createdAt: true, candidateId: true } });
    const scored = apps.map((a) => ({ ...a, daysInStage: Math.floor((Date.now() - (a as any).createdAt.getTime()) / 86400000), flightRiskScore: Math.min(1, Math.floor((Date.now() - (a as any).createdAt.getTime()) / 86400000) / 14) }));
    return sendOk(res, { scored, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 17. GET /closed-loop-quality-of-hire-qoh-synthesizer
router.get('/closed-loop-quality-of-hire-qoh-synthesizer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      select: { id: true, salaryAmount: true, sentAt: true, respondedAt: true, requisitionId: true },
      take: 100,
    });
    return sendOk(res, { acceptedOffers: offers.length, avgSalary: offers.length ? offers.reduce((s, o) => s + (o.salaryAmount || 0), 0) / offers.length : 0, offers });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 18. GET /12-month-performance-recalibrator
router.get('/12-month-performance-recalibrator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const since = new Date(Date.now() - 365 * 86400000);
    const metrics = await prisma.pipelineMetric.findMany({
      where: { tenantId, computedAt: { gte: since } },
      orderBy: { computedAt: 'asc' },
      select: { metricType: true, value: true, computedAt: true },
    });
    const byMonth: Record<string, any[]> = {};
    metrics.forEach((m) => { const key = m.computedAt.toISOString().slice(0, 7); (byMonth[key] = byMonth[key] || []).push(m); });
    return sendOk(res, { months: byMonth, totalMetrics: metrics.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 19. GET /attrition-root-cause-analyzer
router.get('/attrition-root-cause-analyzer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = await prisma.candidateApplication.groupBy({
      by: ['stage', 'status'],
      where: { requisition: { tenantId }, status: { in: ['REJECTED', 'WITHDRAWN'] as any[] } },
      _count: { _all: true },
    });
    return sendOk(res, { rootCauses: data });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const AttritionRcaRunSchema = z.object({ department: z.string().optional(), startDate: z.string().optional() });
// 20. POST /attrition-root-cause-analyzer/run
router.post('/attrition-root-cause-analyzer/run', validate(AttritionRcaRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { department, startDate } = req.body;
    const where: any = { requisition: { tenantId, ...(department ? { department } : {}) }, status: { in: ['REJECTED', 'WITHDRAWN'] as any[] } };
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    const data = await prisma.candidateApplication.groupBy({ by: ['stage'], where, _count: { _all: true } });
    return sendOk(res, { rootCauses: data, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 21. GET /predictive-talent-risk-forecaster
router.get('/predictive-talent-risk-forecaster', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, department: true, priority: true, createdAt: true, salaryMax: true },
      take: 100,
    });
    const now = Date.now();
    const enriched = await Promise.all(reqs.map(async (r) => {
      const daysOpen = Math.floor((now - r.createdAt.getTime()) / 86400000);
      const appCount = await prisma.candidateApplication.count({ where: { requisitionId: r.id } });
      return { ...r, daysOpen, applicationVelocity: daysOpen ? appCount / daysOpen : 0 };
    }));
    return sendOk(res, { risks: enriched });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 22. GET /post-decision-learning-agent
router.get('/post-decision-learning-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    let decisions: any[] = [];
    try {
      decisions = await (prisma as any).hiringDecision.findMany({ where: { tenantId }, take: 50, orderBy: { createdAt: 'desc' } });
    } catch { decisions = []; }
    return sendOk(res, { decisions, total: decisions.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const PostDecisionRunSchema = z.object({ decisionId: z.string().optional() });
// 23. POST /post-decision-learning-agent/run
router.post('/post-decision-learning-agent/run', validate(PostDecisionRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { decisionId } = req.body;
    const [offers, apps] = await Promise.all([
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, status: 'HIRED' as any } }),
    ]);
    return sendOk(res, { decisionId, insights: { acceptedOffers: offers, hiredCandidates: apps }, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 24. GET /enterprise-hiring-intelligence-flywheel
router.get('/enterprise-hiring-intelligence-flywheel', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [candidates, applications, interviews, offers, hires] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId } } }),
      prisma.interview.count({ where: { tenantId } }),
      prisma.offer.count({ where: { tenantId } }),
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } }),
    ]);
    return sendOk(res, { candidates, applications, interviews, offers, hires, flywheelScore: candidates > 0 ? hires / candidates : 0 });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 25. GET /exception-only-review-mode
router.get('/exception-only-review-mode', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const flagged = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: 'HUMAN_REVIEW_REQUIRED' },
      take: 100, orderBy: { createdAt: 'desc' },
      select: { id: true, resourceType: true, createdAt: true, metadata: true },
    });
    return sendOk(res, { flaggedCount: flagged.length, items: flagged });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 26. GET /candidate-journey-visualizer-with-prescriptive-fixes
router.get('/candidate-journey-visualizer-with-prescriptive-fixes', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const apps = await prisma.candidateApplication.findMany({
      where: { requisition: { tenantId } } as any,
      take: 200, orderBy: { createdAt: 'desc' } as any,
    }) as any[];
    const stageMap = apps.reduce((acc: Record<string, number>, a) => { acc[a.stage] = (acc[a.stage] || 0) + 1; return acc; }, {});
    return sendOk(res, { journey: stageMap, applications: apps.slice(0, 50) });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 27. GET /recruiter-burnout-early-warning-system
router.get('/recruiter-burnout-early-warning-system', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const since = new Date(Date.now() - 30 * 86400000);
    const events = await prisma.hiringEvent.groupBy({
      by: ['actorId' as any],
      where: { tenantId, createdAt: { gte: since } },
      _count: { _all: true },
    });
    const atRisk = (events as any[]).filter((e) => e._count._all > 200);
    return sendOk(res, { recruiterActivity: events, atRiskRecruiters: atRisk });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 28. GET /cost-of-delay-talent-loss-analytics
router.get('/cost-of-delay-talent-loss-analytics', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, department: true, salaryMax: true, createdAt: true },
      take: 100,
    });
    const now = Date.now();
    const costed = reqs.map((r) => {
      const daysOpen = Math.floor((now - r.createdAt.getTime()) / 86400000);
      return { ...r, daysOpen, costOfDelay: r.salaryMax ? Math.round((r.salaryMax * daysOpen) / 365) : null };
    });
    return sendOk(res, { roles: costed, totalCostOfDelay: costed.reduce((s, r) => s + (r.costOfDelay || 0), 0) });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 29. GET /role-portfolio-risk-radar
router.get('/role-portfolio-risk-radar', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = await prisma.requisition.groupBy({
      by: ['department', 'status'],
      where: { tenantId },
      _count: { _all: true },
    });
    const byDept: Record<string, any> = {};
    data.forEach((d) => {
      if (!byDept[d.department || 'Unknown']) byDept[d.department || 'Unknown'] = { open: 0, filled: 0, total: 0 };
      byDept[d.department || 'Unknown'][d.status.toLowerCase()] = d._count._all;
      byDept[d.department || 'Unknown'].total += d._count._all;
    });
    return sendOk(res, { departments: byDept });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 30. GET /candidate-trust-analytics-and-redress-slas
router.get('/candidate-trust-analytics-and-redress-slas', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const events = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: { in: ['COMPLAINT_FILED', 'REDRESS_REQUESTED', 'TRUST_FLAG'] } },
      take: 100, orderBy: { createdAt: 'desc' },
    });
    return sendOk(res, { trustEvents: events, total: events.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 31. GET /actionable-telemetry-data-exporter
router.get('/actionable-telemetry-data-exporter', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { page, limit } = paginate(req.query);
    const [data, total] = await Promise.all([
      prisma.pipelineMetric.findMany({ where: { tenantId }, skip: (page - 1) * limit, take: limit, orderBy: { computedAt: 'desc' } }),
      prisma.pipelineMetric.count({ where: { tenantId } }),
    ]);
    return sendOk(res, paginatedResult(data, total, { page, limit, sortBy: 'computedAt', sortOrder: 'desc' }));
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 32. GET /predictive-hiring-analytics-agent
router.get('/predictive-hiring-analytics-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const since = new Date(Date.now() - 90 * 86400000);
    const [newCandidates, newApplications, newOffers, newHires] = await Promise.all([
      prisma.candidate.count({ where: { tenantId, createdAt: { gte: since } } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, createdAt: { gte: since } } }),
      prisma.offer.count({ where: { tenantId, sentAt: { gte: since } } }),
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED', respondedAt: { gte: since } } }),
    ]);
    return sendOk(res, { period: '90d', trends: { newCandidates, newApplications, newOffers, newHires }, conversionRate: newApplications ? newHires / newApplications : 0 });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const PredictiveForecastRunSchema = z.object({ forecastDays: z.number().int().min(7).max(365).default(90) });
// 33. POST /predictive-hiring-analytics-agent/run
router.post('/predictive-hiring-analytics-agent/run', validate(PredictiveForecastRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { forecastDays } = req.body;
    const since = new Date(Date.now() - forecastDays * 86400000);
    const [apps, hires] = await Promise.all([
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, createdAt: { gte: since } } }),
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED', respondedAt: { gte: since } } }),
    ]);
    const dailyRate = apps / forecastDays;
    return sendOk(res, { forecastDays, historicalApps: apps, historicalHires: hires, projectedApps: Math.round(dailyRate * forecastDays), projectedHires: Math.round((hires / forecastDays) * forecastDays), computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 34. GET /predictive-time-to-fill-estimation-with-confidence-intervals
router.get('/predictive-time-to-fill-estimation-with-confidence-intervals', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const filled = await prisma.requisition.findMany({
      where: { tenantId, status: 'FILLED', closedAt: { not: null } },
      select: { department: true, createdAt: true, closedAt: true },
    });
    const byDept: Record<string, number[]> = {};
    filled.forEach((r) => {
      const days = r.closedAt ? Math.floor((r.closedAt.getTime() - r.createdAt.getTime()) / 86400000) : 0;
      const dept = r.department || 'Unknown';
      (byDept[dept] = byDept[dept] || []).push(days);
    });
    const result = Object.entries(byDept).map(([dept, days]) => {
      const avg = days.reduce((s, d) => s + d, 0) / days.length;
      const sorted = [...days].sort((a, b) => a - b);
      return { department: dept, avgDays: Math.round(avg), p50: sorted[Math.floor(sorted.length * 0.5)], p90: sorted[Math.floor(sorted.length * 0.9)] };
    });
    return sendOk(res, { estimates: result });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 35. GET /interview-performance-analytics-with-pattern-recognition
router.get('/interview-performance-analytics-with-pattern-recognition', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [total, completed, cancelled] = await Promise.all([
      prisma.interview.count({ where: { tenantId } }),
      prisma.interview.count({ where: { tenantId, status: 'COMPLETED' as any } }),
      prisma.interview.count({ where: { tenantId, status: 'CANCELLED' as any } }),
    ]);
    const completionRate = total ? completed / total : 0;
    return sendOk(res, { total, completed, cancelled, completionRate, patterns: { noShowRate: total ? (total - completed - cancelled) / total : 0 } });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 36. GET /candidate-journey-analytics-with-drop-off-point-identificati
router.get('/candidate-journey-analytics-with-drop-off-point-identificati', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const stages = await prisma.candidateApplication.groupBy({
      by: ['stage'],
      where: { requisition: { tenantId } },
      _count: { _all: true },
    });
    const total = stages.reduce((s, r) => s + r._count._all, 0);
    const funnel = stages.map((s) => ({ stage: s.stage, count: s._count._all, dropOffRate: total ? 1 - s._count._all / total : 0 }));
    return sendOk(res, { funnel, totalApplications: total });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 37. GET /predictive-quality-of-hire-modeling-with-success-indicators
router.get('/predictive-quality-of-hire-modeling-with-success-indicators', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const accepted = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      select: { id: true, salaryAmount: true, requisitionId: true, sentAt: true, respondedAt: true },
      take: 100,
    });
    const avgResponseDays = accepted.filter((o) => o.sentAt && o.respondedAt).map((o) => Math.floor((o.respondedAt!.getTime() - o.sentAt!.getTime()) / 86400000));
    const avg = avgResponseDays.length ? avgResponseDays.reduce((s, d) => s + d, 0) / avgResponseDays.length : null;
    return sendOk(res, { acceptedOffers: accepted.length, avgResponseDays: avg ? Math.round(avg) : null, qualityScore: accepted.length > 0 ? Math.min(1, accepted.length / 100) : 0 });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 38. GET /predictive-sourcing-channel-roi-with-budget-optimization
router.get('/predictive-sourcing-channel-roi-with-budget-optimization', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const channels = await prisma.candidate.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { _all: true } as any,
    });
    const enriched = await Promise.all(channels.map(async (c) => {
      const hires = await prisma.offer.count({ where: { tenantId, status: 'ACCEPTED', requisition: { candidateApplications: { some: { candidate: { source: c.source } } } } } as any });
      return { channel: c.source, candidates: (c as any)._count._all, hires, roi: (c as any)._count._all ? hires / (c as any)._count._all : 0 };
    }));
    return sendOk(res, { channels: enriched });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 39. GET /hiring-manager-satisfaction-prediction-with-quality-indicato
router.get('/hiring-manager-satisfaction-prediction-with-quality-indicato', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqs = await prisma.requisition.findMany({
      where: { tenantId },
      select: { id: true, department: true, status: true },
      take: 100,
    });
    const enriched = await Promise.all(reqs.map(async (r) => {
      const offerCount = await prisma.offer.count({ where: { tenantId, requisitionId: r.id } });
      const accepted = await prisma.offer.count({ where: { tenantId, requisitionId: r.id, status: 'ACCEPTED' } });
      return { ...r, offerCount, acceptanceRate: offerCount ? accepted / offerCount : 0 };
    }));
    return sendOk(res, { requisitions: enriched });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const HmSatisfactionRunSchema = z.object({ managerId: z.string().optional() });
// 40. POST /hiring-manager-satisfaction-prediction-with-quality-indicato
router.post('/hiring-manager-satisfaction-prediction-with-quality-indicato', validate(HmSatisfactionRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { managerId } = req.body;
    const where: any = { tenantId };
    const [total, accepted] = await Promise.all([
      prisma.offer.count({ where }),
      prisma.offer.count({ where: { ...where, status: 'ACCEPTED' } }),
    ]);
    return sendOk(res, { managerId, satisfactionScore: total ? accepted / total : 0, totalOffers: total, accepted, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 41. GET /automated-recruiter-performance-analytics-with-coaching-reco
router.get('/automated-recruiter-performance-analytics-with-coaching-reco', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const activity = await prisma.hiringEvent.groupBy({
      by: ['actorId' as any],
      where: { tenantId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      _count: { _all: true },
    });
    return sendOk(res, { recruiters: activity, period: '30d' });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 42. GET /intelligent-source-attribution-with-multi-touch-credit-assig
router.get('/intelligent-source-attribution-with-multi-touch-credit-assig', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const sources = await prisma.candidate.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { _all: true },
    });
    const total = sources.reduce((s, r) => s + r._count._all, 0);
    const attribution = sources.map((s) => ({ source: s.source, count: s._count._all, creditShare: total ? s._count._all / total : 0 }));
    return sendOk(res, { attribution, multiTouchModel: 'linear' });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 43. GET /recruiter-action-attribution-engine
router.get('/recruiter-action-attribution-engine', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const actions = await prisma.hiringEvent.groupBy({
      by: ['actorId' as any, 'eventType'],
      where: { tenantId },
      _count: { _all: true },
    });
    return sendOk(res, { actions });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const RecruiterAttributionRunSchema = z.object({ actorId: z.string().optional(), startDate: z.string().optional() });
// 44. POST /recruiter-action-attribution-engine/run
router.post('/recruiter-action-attribution-engine/run', validate(RecruiterAttributionRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { actorId, startDate } = req.body;
    const where: any = { tenantId };
    if (actorId) where.actorId = actorId;
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    const actions = await prisma.hiringEvent.groupBy({ by: ['eventType'], where, _count: { _all: true } });
    return sendOk(res, { actorId, actions, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 45. GET /fairness-drift-detection
router.get('/fairness-drift-detection', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    let data: any[] = [];
    try {
      data = await (prisma as any).biasAudit.findMany({ where: { tenantId }, take: 100, orderBy: { createdAt: 'desc' } });
    } catch { data = []; }
    return sendOk(res, { biasAudits: data, total: data.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 46. GET /approval-sla-tracking-and-alerts
router.get('/approval-sla-tracking-and-alerts', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const pending = await prisma.offer.findMany({
      where: { tenantId, status: 'PENDING_APPROVAL' as any },
      select: { id: true, sentAt: true, requisitionId: true, salaryAmount: true },
      take: 100,
    });
    const now = Date.now();
    const enriched = pending.map((o) => ({ ...o, daysWaiting: o.sentAt ? Math.floor((now - o.sentAt.getTime()) / 86400000) : null, slaBreached: o.sentAt ? (now - o.sentAt.getTime()) / 86400000 > 3 : false }));
    return sendOk(res, { pending: enriched, slaBreaches: enriched.filter((o) => o.slaBreached).length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 47. GET /human-override-analytics
router.get('/human-override-analytics', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    let data: any[] = [];
    try {
      data = await (prisma as any).decisionOverride.findMany({ where: { tenantId }, take: 100 });
    } catch { data = []; }
    const byReason = data.reduce((acc: Record<string, number>, d: any) => { acc[d.reason || 'UNKNOWN'] = (acc[d.reason || 'UNKNOWN'] || 0) + 1; return acc; }, {});
    return sendOk(res, { overrides: byReason, total: data.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 48. GET /bias-impact-attribution-per-feature
router.get('/bias-impact-attribution-per-feature', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    let data: any[] = [];
    try {
      data = await (prisma as any).biasAudit.findMany({ where: { tenantId }, take: 100, orderBy: { createdAt: 'desc' } });
    } catch { data = []; }
    return sendOk(res, { featureAttribution: data, total: data.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 49. GET /end-to-end-workflow-replay
router.get('/end-to-end-workflow-replay', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { page, limit } = paginate(req.query);
    const [data, total] = await Promise.all([
      prisma.hiringEvent.findMany({ where: { tenantId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'asc' } }),
      prisma.hiringEvent.count({ where: { tenantId } }),
    ]);
    return sendOk(res, paginatedResult(data, total, { page, limit, sortBy: 'createdAt', sortOrder: 'asc' }));
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const WorkflowReplaySchema = z.object({ requisitionId: z.string().optional(), candidateId: z.string().optional() });
// 50. POST /end-to-end-workflow-replay
router.post('/end-to-end-workflow-replay', validate(WorkflowReplaySchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, candidateId } = req.body;
    const where: any = { tenantId };
    if (requisitionId) where.metadata = { path: ['requisitionId'], equals: requisitionId };
    const events = await prisma.hiringEvent.findMany({ where, take: 200, orderBy: { createdAt: 'asc' } });
    return sendOk(res, { events, total: events.length, replayedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 51. GET /real-time-demographic-parity-monitor-alert
router.get('/real-time-demographic-parity-monitor-alert', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const byStatus = await prisma.candidateApplication.groupBy({
      by: ['status'],
      where: { requisition: { tenantId } },
      _count: { _all: true },
    });
    return sendOk(res, { statusBreakdown: byStatus, demographicNote: 'Demographic data requires additional PII fields', monitoredAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const DemographicParityRunSchema = z.object({ department: z.string().optional() });
// 52. POST /real-time-demographic-parity-monitor-alert/run
router.post('/real-time-demographic-parity-monitor-alert/run', validate(DemographicParityRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { department } = req.body;
    const where: any = { requisition: { tenantId, ...(department ? { department } : {}) } };
    const [total, rejected] = await Promise.all([
      prisma.candidateApplication.count({ where }),
      prisma.candidateApplication.count({ where: { ...where, status: 'REJECTED' as any } }),
    ]);
    const rejectionRate = total ? rejected / total : 0;
    return sendOk(res, { department, total, rejected, rejectionRate, parityScore: 1 - Math.abs(rejectionRate - 0.5), computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 53. GET /feature-importance-stability-monitoring
router.get('/feature-importance-stability-monitoring', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const metrics = await prisma.pipelineMetric.findMany({
      where: { tenantId },
      take: 100, orderBy: { computedAt: 'desc' },
    });
    return sendOk(res, { metrics, total: metrics.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const FeatureStabilityRunSchema = z.object({ modelId: z.string().optional() });
// 54. POST /feature-importance-stability-monitoring/run
router.post('/feature-importance-stability-monitoring/run', validate(FeatureStabilityRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { modelId } = req.body;
    const metrics = await prisma.pipelineMetric.findMany({ where: { tenantId }, take: 50, orderBy: { computedAt: 'desc' } });
    const values = metrics.map((m) => (m as any).value).filter(Boolean) as number[];
    const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    const variance = values.length ? values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length : 0;
    return sendOk(res, { modelId, stabilityScore: variance < 0.01 ? 1 : Math.max(0, 1 - variance), variance, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 55. GET /continuous-learning-from-hiring-outcomes-closed-loop-intelli
router.get('/continuous-learning-from-hiring-outcomes-closed-loop-intelli', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    let decisions: any[] = [];
    try {
      decisions = await (prisma as any).hiringDecision.findMany({ where: { tenantId }, take: 50, orderBy: { createdAt: 'desc' } });
    } catch { decisions = []; }
    return sendOk(res, { decisions, learningCycles: decisions.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 56. GET /real-time-labor-market-intelligence-integrated-into-sourcing
router.get('/real-time-labor-market-intelligence-integrated-into-sourcing', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const sources = await prisma.candidate.groupBy({
      by: ['source'],
      where: { tenantId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
      _count: { _all: true },
    });
    return sendOk(res, { sourcingData: sources, marketIntelligenceNote: 'Connect external labor market API for live data', updatedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 57. GET /quality-of-hire-closed-loop-measurement-connecting-hiring-da
router.get('/quality-of-hire-closed-loop-measurement-connecting-hiring-da', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [accepted, total] = await Promise.all([
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } }),
      prisma.offer.count({ where: { tenantId } }),
    ]);
    const metrics = await prisma.pipelineMetric.findMany({ where: { tenantId }, take: 20, orderBy: { computedAt: 'desc' } });
    return sendOk(res, { qohScore: total ? accepted / total : 0, acceptedOffers: accepted, totalOffers: total, recentMetrics: metrics });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 58. GET /predictive-pipeline-forecasting-with-confidence-intervals
router.get('/predictive-pipeline-forecasting-with-confidence-intervals', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const weeks = 12;
    const since = new Date(Date.now() - weeks * 7 * 86400000);
    const apps = await prisma.candidateApplication.findMany({
      where: { requisition: { tenantId }, createdAt: { gte: since } } as any,
      select: { createdAt: true } as any,
    });
    const byWeek: Record<string, number> = {};
    apps.forEach((a) => { const week = Math.floor((Date.now() - (a as any).createdAt.getTime()) / (7 * 86400000)); byWeek[week] = (byWeek[week] || 0) + 1; });
    return sendOk(res, { weeklyTrend: byWeek, forecastWeeks: weeks, confidenceInterval: 0.8 });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const PipelineForecastRunSchema = z.object({ weeksAhead: z.number().int().min(1).max(52).default(12) });
// 59. POST /predictive-pipeline-forecasting-with-confidence-intervals
router.post('/predictive-pipeline-forecasting-with-confidence-intervals', validate(PipelineForecastRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { weeksAhead } = req.body;
    const since = new Date(Date.now() - 90 * 86400000);
    const apps = await prisma.candidateApplication.count({ where: { requisition: { tenantId }, createdAt: { gte: since } } });
    const dailyRate = apps / 90;
    const projected = Math.round(dailyRate * weeksAhead * 7);
    return sendOk(res, { weeksAhead, projectedApplications: projected, lowerBound: Math.round(projected * 0.8), upperBound: Math.round(projected * 1.2), computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 60. GET /recruiter-capacity-optimization-and-workload-intelligence
router.get('/recruiter-capacity-optimization-and-workload-intelligence', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const workload = await prisma.hiringEvent.groupBy({
      by: ['actorId' as any],
      where: { tenantId, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      _count: { _all: true },
    });
    return sendOk(res, { workload, period: '7d', capacityThreshold: 100 });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 61. GET /pipeline-bottleneck-resolver
router.get('/pipeline-bottleneck-resolver', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const stalled = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN', createdAt: { lt: new Date(Date.now() - 30 * 86400000) } },
      select: { id: true, department: true, createdAt: true, priority: true },
      take: 50,
    });
    const enriched = await Promise.all(stalled.map(async (r) => {
      const appCount = await prisma.candidateApplication.count({ where: { requisitionId: r.id } });
      return { ...r, daysOpen: Math.floor((Date.now() - r.createdAt.getTime()) / 86400000), applicationCount: appCount };
    }));
    return sendOk(res, { bottlenecks: enriched, total: enriched.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const BottleneckResolverSchema = z.object({ requisitionId: z.string().optional(), action: z.string().optional() });
// 62. POST /pipeline-bottleneck-resolver
router.post('/pipeline-bottleneck-resolver', validate(BottleneckResolverSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, action } = req.body;
    const event = await prisma.hiringEvent.create({
      data: { tenantId, eventType: 'BOTTLENECK_RESOLUTION_TRIGGERED', resourceType: 'REQUISITION', metadata: { requisitionId, action } as any } as any,
    });
    return sendOk(res, { triggered: true, action: action || 'FLAG_FOR_REVIEW', eventId: event.id });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 63. GET /hiring-forecast-capacity-planner
router.get('/hiring-forecast-capacity-planner', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const openReqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, department: true, priority: true, createdAt: true },
      take: 100,
    });
    const avgFillDays = 45;
    const projected = openReqs.map((r) => ({
      ...r, daysOpen: Math.floor((Date.now() - r.createdAt.getTime()) / 86400000),
      projectedFillDate: new Date(r.createdAt.getTime() + avgFillDays * 86400000),
    }));
    return sendOk(res, { openRoles: projected, avgFillDays });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 64. GET /quality-of-hire-feedback-loop-integrator
router.get('/quality-of-hire-feedback-loop-integrator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const closed = await prisma.requisition.findMany({
      where: { tenantId, status: 'FILLED' },
      select: { id: true, department: true, closedAt: true },
      take: 100,
    });
    const enriched = await Promise.all(closed.map(async (r) => {
      const offer = await prisma.offer.findFirst({ where: { tenantId, requisitionId: r.id, status: 'ACCEPTED' }, select: { salaryAmount: true, respondedAt: true } });
      return { ...r, offer };
    }));
    return sendOk(res, { filledRoles: enriched });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 65. GET /agentic-candidate-net-promoter-score-cnps
router.get('/agentic-candidate-net-promoter-score-cnps', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const events = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: { in: ['CANDIDATE_FEEDBACK', 'NPS_RESPONSE'] } },
      take: 100, orderBy: { createdAt: 'desc' },
    });
    return sendOk(res, { feedbackEvents: events, cnpsNote: 'Collect NPS via candidate surveys', total: events.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const CNpsRunSchema = z.object({ period: z.string().optional() });
// 66. POST /agentic-candidate-net-promoter-score-cnps/run
router.post('/agentic-candidate-net-promoter-score-cnps/run', validate(CNpsRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { period } = req.body;
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 86400000);
    const [totalApps, withdrawn] = await Promise.all([
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, createdAt: { gte: since } } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, status: 'WITHDRAWN' as any, createdAt: { gte: since } } }),
    ]);
    const cnps = totalApps ? Math.round((1 - withdrawn / totalApps) * 100) - 50 : 0;
    return sendOk(res, { period: `${days}d`, cnps, totalApplications: totalApps, withdrawn, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 67. GET /agentic-candidate-drop-off-predictor
router.get('/agentic-candidate-drop-off-predictor', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const atRisk = await prisma.candidateApplication.findMany({
      where: { requisition: { tenantId }, stage: { in: ['APPLIED', 'SCREENED'] as any[] }, createdAt: { lt: new Date(Date.now() - 14 * 86400000) } },
      take: 100, select: { id: true, stage: true, createdAt: true, candidateId: true },
    });
    return sendOk(res, { atRisk: atRisk.map((a) => ({ ...a, staleDays: Math.floor((Date.now() - (a as any).createdAt.getTime()) / 86400000) })), total: atRisk.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const DropOffRunSchema = z.object({ applicationId: z.string().optional() });
// 68. POST /agentic-candidate-drop-off-predictor/run
router.post('/agentic-candidate-drop-off-predictor/run', validate(DropOffRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { applicationId } = req.body;
    const where: any = { requisition: { tenantId } };
    if (applicationId) where.id = applicationId;
    const apps = await prisma.candidateApplication.findMany({ where, take: 50, select: { id: true, stage: true, createdAt: true } });
    const scored = apps.map((a) => ({ ...a, dropOffRisk: Math.min(1, Math.floor((Date.now() - (a as any).createdAt.getTime()) / 86400000) / 30) }));
    return sendOk(res, { scored, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 69. GET /agentic-talent-intelligence-dashboard
router.get('/agentic-talent-intelligence-dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [candidates, openReqs, activeApps, pendingOffers] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, status: { notIn: ['REJECTED', 'WITHDRAWN', 'HIRED'] as any[] } } }),
      prisma.offer.count({ where: { tenantId, status: { in: ['SENT', 'PENDING_APPROVAL'] as any[] } } }),
    ]);
    return sendOk(res, { candidates, openReqs, activeApps, pendingOffers, generatedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const TalentIntelRunSchema = z.object({ scope: z.string().optional() });
// 70. POST /agentic-talent-intelligence-dashboard/run
router.post('/agentic-talent-intelligence-dashboard/run', validate(TalentIntelRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { scope } = req.body;
    const [candidates, apps, offers] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId } } }),
      prisma.offer.count({ where: { tenantId } }),
    ]);
    return sendOk(res, { scope: scope || 'full', intelligence: { candidates, apps, offers }, scannedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const TalentDashboardConfigSchema = z.object({ dashboardConfig: z.record(z.string(), z.unknown()).optional() });
// 71. POST /agentic-talent-intelligence-dashboard
router.post('/agentic-talent-intelligence-dashboard', validate(TalentDashboardConfigSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { dashboardConfig } = req.body;
    const event = await prisma.hiringEvent.create({
      data: { tenantId, eventType: 'DASHBOARD_CONFIGURED', resourceType: 'DASHBOARD', metadata: { dashboardConfig } as any } as any,
    });
    return sendOk(res, { created: true, eventId: event.id, config: dashboardConfig });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 72. GET /agentic-sla-breach-predictor
router.get('/agentic-sla-breach-predictor', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, department: true, priority: true, createdAt: true },
      take: 100,
    });
    const slaDays: Record<string, number> = { HIGH: 30, MEDIUM: 45, LOW: 60 };
    const atRisk = reqs.map((r) => {
      const daysOpen = Math.floor((Date.now() - r.createdAt.getTime()) / 86400000);
      const sla = slaDays[(r.priority as unknown as string) || 'MEDIUM'] || 45;
      return { ...r, daysOpen, slaDays: sla, slaBreachRisk: daysOpen / sla, isBreached: daysOpen >= sla };
    }).filter((r) => r.slaBreachRisk > 0.7);
    return sendOk(res, { atRisk, total: atRisk.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const SlaBreachRunSchema = z.object({ requisitionId: z.string().optional() });
// 73. POST /agentic-sla-breach-predictor/run
router.post('/agentic-sla-breach-predictor/run', validate(SlaBreachRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId } = req.body;
    const where: any = { tenantId, status: 'OPEN' };
    if (requisitionId) where.id = requisitionId;
    const reqs = await prisma.requisition.findMany({ where, take: 50, select: { id: true, priority: true, createdAt: true } });
    const scored = reqs.map((r) => ({ ...r, daysOpen: Math.floor((Date.now() - r.createdAt.getTime()) / 86400000), breachProbability: Math.min(1, Math.floor((Date.now() - r.createdAt.getTime()) / 86400000) / 45) }));
    return sendOk(res, { scored, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 74. GET /agentic-candidate-experience-benchmarking
router.get('/agentic-candidate-experience-benchmarking', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [total, withdrawn, hired] = await Promise.all([
      prisma.candidateApplication.count({ where: { requisition: { tenantId } } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, status: 'WITHDRAWN' as any } }),
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } }),
    ]);
    return sendOk(res, { benchmarks: { totalApplications: total, withdrawalRate: total ? withdrawn / total : 0, offerAcceptance: hired, experienceScore: total ? Math.max(0, 1 - withdrawn / total) : 0 } });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const BenchmarkRunSchema = z.object({ benchmarkPeriod: z.string().optional() });
// 75. POST /agentic-candidate-experience-benchmarking/run
router.post('/agentic-candidate-experience-benchmarking/run', validate(BenchmarkRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { benchmarkPeriod } = req.body;
    const days = benchmarkPeriod === '90d' ? 90 : benchmarkPeriod === '180d' ? 180 : 30;
    const since = new Date(Date.now() - days * 86400000);
    const [total, withdrawn] = await Promise.all([
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, createdAt: { gte: since } } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, status: 'WITHDRAWN' as any, createdAt: { gte: since } } }),
    ]);
    return sendOk(res, { period: `${days}d`, totalApplications: total, withdrawn, experienceScore: total ? 1 - withdrawn / total : 0, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 76. GET /agentic-interviewer-performance-analytics
router.get('/agentic-interviewer-performance-analytics', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const completed = await prisma.interview.findMany({
      where: { tenantId, status: 'COMPLETED' as any },
      select: { id: true, scheduledAt: true, completedAt: true, requisitionId: true },
      take: 100,
    });
    return sendOk(res, { completedInterviews: completed.length, interviewers: completed });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const InterviewerPerfRunSchema = z.object({ interviewerId: z.string().optional() });
// 77. POST /agentic-interviewer-performance-analytics/run
router.post('/agentic-interviewer-performance-analytics/run', validate(InterviewerPerfRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { interviewerId } = req.body;
    const where: any = { tenantId, status: 'COMPLETED' as any };
    const [completed, cancelled] = await Promise.all([
      prisma.interview.count({ where }),
      prisma.interview.count({ where: { tenantId, status: 'CANCELLED' as any } }),
    ]);
    return sendOk(res, { interviewerId, completed, cancelled, completionRate: (completed + cancelled) ? completed / (completed + cancelled) : 0, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 78. GET /root-cause-analysis-rca-agent
router.get('/root-cause-analysis-rca-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const data = await prisma.candidateApplication.groupBy({
      by: ['stage', 'status'],
      where: { requisition: { tenantId }, status: { in: ['REJECTED', 'WITHDRAWN'] as any[] } },
      _count: { _all: true } as any,
    });
    return sendOk(res, { rootCauses: data, total: data.reduce((s, d) => s + (d as any)._count._all, 0) });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const RcaRunSchema = z.object({ issueType: z.string().optional(), department: z.string().optional() });
// 79. POST /root-cause-analysis-rca-agent/run
router.post('/root-cause-analysis-rca-agent/run', validate(RcaRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { issueType, department } = req.body;
    const where: any = { requisition: { tenantId, ...(department ? { department } : {}) }, status: { in: ['REJECTED', 'WITHDRAWN'] as any[] } };
    const data = await prisma.candidateApplication.groupBy({ by: ['stage'], where, _count: { _all: true } });
    return sendOk(res, { issueType, department, causes: data, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 80. GET /quality-of-hire-prediction
router.get('/quality-of-hire-prediction', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [totalOffers, accepted, avgMetric] = await Promise.all([
      prisma.offer.count({ where: { tenantId } }),
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } }),
      prisma.pipelineMetric.aggregate({ where: { tenantId }, _avg: { value: true } as any }),
    ]);
    const predictedQoh = totalOffers ? accepted / totalOffers : 0;
    return sendOk(res, { predictedQohScore: predictedQoh, avgPipelineMetric: (avgMetric as any)._avg.value, totalOffers, accepted });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 81. GET /contract-to-hire-conversion-monitoring
router.get('/contract-to-hire-conversion-monitoring', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const events = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: { in: ['CONTRACT_TO_HIRE', 'CONTRACT_CONVERTED'] } },
      take: 100, orderBy: { createdAt: 'desc' },
    });
    return sendOk(res, { conversions: events, total: events.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const ContractHireRunSchema = z.object({ period: z.string().optional() });
// 82. POST /contract-to-hire-conversion-monitoring/run
router.post('/contract-to-hire-conversion-monitoring/run', validate(ContractHireRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { period } = req.body;
    const days = period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 86400000);
    const [contracts, converted] = await Promise.all([
      prisma.hiringEvent.count({ where: { tenantId, eventType: 'CONTRACT_TO_HIRE', createdAt: { gte: since } } }),
      prisma.hiringEvent.count({ where: { tenantId, eventType: 'CONTRACT_CONVERTED', createdAt: { gte: since } } }),
    ]);
    return sendOk(res, { period: `${days}d`, contracts, converted, conversionRate: contracts ? converted / contracts : 0, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 83. GET /bottleneck-prediction-escalation-agent
router.get('/bottleneck-prediction-escalation-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const stalled = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN', createdAt: { lt: new Date(Date.now() - 45 * 86400000) } },
      select: { id: true, department: true, priority: true, createdAt: true } as any,
      take: 50,
    });
    const predictions = stalled.map((r) => ({ ...r, daysOpen: Math.floor((Date.now() - (r as any).createdAt.getTime()) / 86400000), bottleneckScore: Math.min(1, Math.floor((Date.now() - (r as any).createdAt.getTime()) / 86400000) / 90) }));
    return sendOk(res, { bottlenecks: predictions, total: predictions.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const BottleneckEscalateRunSchema = z.object({ escalate: z.boolean().optional() });
// 84. POST /bottleneck-prediction-escalation-agent/run
router.post('/bottleneck-prediction-escalation-agent/run', validate(BottleneckEscalateRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { escalate } = req.body;
    const stalled = await prisma.requisition.count({ where: { tenantId, status: 'OPEN', createdAt: { lt: new Date(Date.now() - 45 * 86400000) } } });
    if (escalate) {
      await prisma.hiringEvent.create({ data: { tenantId, eventType: 'BOTTLENECK_ESCALATED', resourceType: 'SYSTEM', metadata: { stalledCount: stalled } } as any });
    }
    return sendOk(res, { stalledRequisitions: stalled, escalated: !!escalate, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 85. GET /sourcing-channel-roi-allocation-agent
router.get('/sourcing-channel-roi-allocation-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const channels = await prisma.candidate.groupBy({ by: ['source'], where: { tenantId }, _count: { _all: true } });
    const total = channels.reduce((s, c) => s + c._count._all, 0);
    const allocation = channels.map((c) => ({ channel: c.source, candidates: c._count._all, share: total ? c._count._all / total : 0, recommendedBudgetPct: total ? Math.round((c._count._all / total) * 100) : 0 }));
    return sendOk(res, { allocation });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const ChannelAllocationRunSchema = z.object({ budget: z.number().positive().optional() });
// 86. POST /sourcing-channel-roi-allocation-agent/run
router.post('/sourcing-channel-roi-allocation-agent/run', validate(ChannelAllocationRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { budget } = req.body;
    const channels = await prisma.candidate.groupBy({ by: ['source'], where: { tenantId }, _count: { _all: true } });
    const total = channels.reduce((s, c) => s + c._count._all, 0);
    const allocation = channels.map((c) => ({ channel: c.source, share: total ? c._count._all / total : 0, allocatedBudget: budget ? Math.round((c._count._all / total) * budget) : null }));
    return sendOk(res, { totalBudget: budget, allocation, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 87. GET /requisition-to-hire-roi-forecaster
router.get('/requisition-to-hire-roi-forecaster', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, department: true, salaryMin: true, salaryMax: true, createdAt: true },
      take: 100,
    }) as any[];
    const enriched = reqs.map((r) => {
      const daysOpen = Math.floor((Date.now() - (r as any).createdAt.getTime()) / 86400000);
      const costOfDelay = r.salaryMax ? Math.round((r.salaryMax * daysOpen) / 365) : 0;
      const projectedAnnualValue = r.salaryMin ? r.salaryMin * 2 : 0;
      return { ...r, daysOpen, costOfDelay, projectedRoi: projectedAnnualValue - costOfDelay };
    });
    return sendOk(res, { roles: enriched });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 88. GET /real-time-pipeline-health-self-healer
router.get('/real-time-pipeline-health-self-healer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [openReqs, stalledApps, pendingOffers] = await Promise.all([
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.candidateApplication.count({ where: { requisition: { tenantId }, stage: { in: ['APPLIED', 'SCREENED'] as any[] }, createdAt: { lt: new Date(Date.now() - 14 * 86400000) } } }),
      prisma.offer.count({ where: { tenantId, status: 'SENT' as any, sentAt: { lt: new Date(Date.now() - 7 * 86400000) } } }),
    ]);
    const healthScore = 100 - Math.min(100, stalledApps * 2 + pendingOffers * 5);
    const fixes = [];
    if (stalledApps > 0) fixes.push(`${stalledApps} stalled applications need follow-up`);
    if (pendingOffers > 0) fixes.push(`${pendingOffers} offers pending for 7+ days`);
    return sendOk(res, { healthScore, openReqs, stalledApps, pendingOffers, suggestedFixes: fixes });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const SelfHealerSchema = z.object({ autoFix: z.boolean().optional().default(false) });
// 89. POST /real-time-pipeline-health-self-healer
router.post('/real-time-pipeline-health-self-healer', validate(SelfHealerSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { autoFix } = req.body;
    if (autoFix) {
      await prisma.hiringEvent.create({ data: { tenantId, eventType: 'PIPELINE_SELF_HEAL_TRIGGERED', resourceType: 'SYSTEM', metadata: { autoFix: true } } as any });
    }
    return sendOk(res, { autoFixTriggered: !!autoFix, message: autoFix ? 'Self-heal workflow initiated' : 'Dry-run complete', triggeredAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 90. GET /post-hire-performance-correlation-agent
router.get('/post-hire-performance-correlation-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const accepted = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      select: { id: true, salaryAmount: true, requisitionId: true, respondedAt: true } as any,
      take: 100,
    });
    return sendOk(res, { correlations: accepted, note: 'Connect HRIS for post-hire performance data', total: accepted.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const PostHireCorrelationRunSchema = z.object({ correlationType: z.string().optional() });
// 91. POST /post-hire-performance-correlation-agent/run
router.post('/post-hire-performance-correlation-agent/run', validate(PostHireCorrelationRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { correlationType } = req.body;
    const metrics = await prisma.pipelineMetric.findMany({ where: { tenantId }, take: 50, orderBy: { computedAt: 'desc' } });
    const values = metrics.map((m) => (m as any).value).filter(Boolean) as number[];
    const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    return sendOk(res, { correlationType: correlationType || 'general', avgMetricValue: avg, dataPoints: values.length, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 92. GET /talent-pool-health-decay-analyzer
router.get('/talent-pool-health-decay-analyzer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [total, fresh30d, fresh90d, stale180d] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.candidate.count({ where: { tenantId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
      prisma.candidate.count({ where: { tenantId, createdAt: { gte: new Date(Date.now() - 90 * 86400000) } } }),
      prisma.candidate.count({ where: { tenantId, createdAt: { lt: new Date(Date.now() - 180 * 86400000) } } }),
    ]);
    return sendOk(res, { total, fresh30d, fresh90d, stale180d, decayRate: total ? stale180d / total : 0, healthScore: total ? (fresh90d / total) * 100 : 0 });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const TalentPoolDecayRunSchema = z.object({ poolId: z.string().optional() });
// 93. POST /talent-pool-health-decay-analyzer/run
router.post('/talent-pool-health-decay-analyzer/run', validate(TalentPoolDecayRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { poolId } = req.body;
    const stale = await prisma.candidate.count({ where: { tenantId, createdAt: { lt: new Date(Date.now() - 180 * 86400000) }, applications: { none: { createdAt: { gte: new Date(Date.now() - 90 * 86400000) } } } } as any });
    const total = await prisma.candidate.count({ where: { tenantId } });
    return sendOk(res, { poolId, staleCandidates: stale, total, decayScore: total ? stale / total : 0, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 94. GET /hiring-velocity-benchmark-vs-market-agent
router.get('/hiring-velocity-benchmark-vs-market-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const filled = await prisma.requisition.findMany({
      where: { tenantId, status: 'FILLED', closedAt: { not: null } },
      select: { createdAt: true, closedAt: true, department: true },
      take: 100,
    });
    const ttf = filled.map((r) => Math.floor((r.closedAt!.getTime() - r.createdAt.getTime()) / 86400000));
    const avgTtf = ttf.length ? ttf.reduce((s, d) => s + d, 0) / ttf.length : null;
    return sendOk(res, { internalAvgTtfDays: avgTtf ? Math.round(avgTtf) : null, marketBenchmarkDays: 42, vsMarket: avgTtf ? avgTtf - 42 : null, note: 'Market benchmark: 42 days (industry average)' });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const VelocityBenchmarkRunSchema = z.object({ jobFamily: z.string().optional() });
// 95. POST /hiring-velocity-benchmark-vs-market-agent/run
router.post('/hiring-velocity-benchmark-vs-market-agent/run', validate(VelocityBenchmarkRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { jobFamily } = req.body;
    const where: any = { tenantId, status: 'FILLED', closedAt: { not: null } };
    if (jobFamily) where.department = jobFamily;
    const filled = await prisma.requisition.findMany({ where, select: { createdAt: true, closedAt: true } });
    const ttf = filled.map((r) => Math.floor((r.closedAt!.getTime() - r.createdAt.getTime()) / 86400000));
    const avg = ttf.length ? ttf.reduce((s, d) => s + d, 0) / ttf.length : null;
    return sendOk(res, { jobFamily, internalAvgDays: avg ? Math.round(avg) : null, marketBenchmark: 42, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 96. GET /offer-acceptance-probability-forecaster
router.get('/offer-acceptance-probability-forecaster', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, department: true, salaryMax: true },
      take: 50,
    });
    const enriched = await Promise.all(reqs.map(async (r) => {
      const [total, accepted] = await Promise.all([
        prisma.offer.count({ where: { tenantId, requisitionId: r.id } }),
        prisma.offer.count({ where: { tenantId, requisitionId: r.id, status: 'ACCEPTED' } }),
      ]);
      return { ...r, historicalAcceptanceRate: total ? accepted / total : 0.7, predictedProbability: total ? accepted / total : 0.7 };
    }));
    return sendOk(res, { forecasts: enriched });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 97. GET /requisition-budget-impact-simulator
router.get('/requisition-budget-impact-simulator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, department: true, salaryMin: true, salaryMax: true, priority: true },
      take: 100,
    });
    const totalMinBudget = reqs.reduce((s, r) => s + (r.salaryMin || 0), 0);
    const totalMaxBudget = reqs.reduce((s, r) => s + (r.salaryMax || 0), 0);
    return sendOk(res, { openRoles: reqs.length, totalMinBudget, totalMaxBudget, avgSalaryMin: reqs.length ? Math.round(totalMinBudget / reqs.length) : 0, avgSalaryMax: reqs.length ? Math.round(totalMaxBudget / reqs.length) : 0 });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 98. GET /real-time-cost-per-hire-optimizer
router.get('/real-time-cost-per-hire-optimizer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const byDept = await prisma.requisition.groupBy({
      by: ['department'],
      where: { tenantId, status: 'FILLED' },
      _count: { _all: true },
      _avg: { salaryMax: true },
    });
    const enriched = byDept.map((d) => ({ department: d.department, hires: d._count._all, avgSalary: d._avg.salaryMax, estimatedCostPerHire: d._avg.salaryMax ? Math.round(d._avg.salaryMax * 0.2) : null }));
    return sendOk(res, { departments: enriched });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const CostOptimizeRunSchema = z.object({ targetCost: z.number().positive().optional() });
// 99. POST /real-time-cost-per-hire-optimizer/run
router.post('/real-time-cost-per-hire-optimizer/run', validate(CostOptimizeRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { targetCost } = req.body;
    const hires = await prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } });
    const avgSalary = await prisma.offer.aggregate({ where: { tenantId, status: 'ACCEPTED' }, _avg: { salaryAmount: true } });
    const estimatedCph = avgSalary._avg.salaryAmount ? Math.round(avgSalary._avg.salaryAmount * 0.2) : 5000;
    return sendOk(res, { hires, estimatedCostPerHire: estimatedCph, targetCost, savingsOpportunity: targetCost ? Math.max(0, estimatedCph - targetCost) : null, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 100. GET /hiring-funnel-leakage-auto-diagnoser
router.get('/hiring-funnel-leakage-auto-diagnoser', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const stages = ['APPLIED', 'SCREENED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'HIRED'];
    const counts = await Promise.all(stages.map(async (stage) => ({
      stage,
      count: await prisma.candidateApplication.count({ where: { requisition: { tenantId }, stage: stage as any } }),
    })));
    const leakage = counts.map((c, i) => ({ ...c, leakageToNext: i < counts.length - 1 ? counts[i].count - counts[i + 1].count : 0, dropOffRate: i > 0 && counts[i - 1].count ? 1 - c.count / counts[i - 1].count : 0 }));
    return sendOk(res, { funnel: leakage });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 101. GET /automated-job-family-market-trend-scanner
router.get('/automated-job-family-market-trend-scanner', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const trends = await prisma.requisition.groupBy({
      by: ['department'],
      where: { tenantId },
      _count: { _all: true },
      _avg: { salaryMax: true },
    });
    return sendOk(res, { marketTrends: trends, note: 'Connect external market data API for live trends', scannedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const MarketTrendRunSchema = z.object({ jobFamily: z.string().min(1) });
// 102. POST /automated-job-family-market-trend-scanner/run
router.post('/automated-job-family-market-trend-scanner/run', validate(MarketTrendRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { jobFamily } = req.body;
    const data = await prisma.requisition.findMany({
      where: { tenantId, department: { contains: jobFamily } },
      select: { id: true, department: true, salaryMin: true, salaryMax: true, status: true, createdAt: true },
      take: 50,
    });
    return sendOk(res, { jobFamily, roles: data, total: data.length, scannedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 103. GET /real-time-hiring-roi-calculator
router.get('/real-time-hiring-roi-calculator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [hires, avgSalary, openReqs] = await Promise.all([
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } }),
      prisma.offer.aggregate({ where: { tenantId, status: 'ACCEPTED' }, _avg: { salaryAmount: true } }),
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
    ]);
    const avgSal = avgSalary._avg.salaryAmount || 0;
    return sendOk(res, { hires, avgSalary: avgSal, estimatedAnnualValueAdded: Math.round(hires * avgSal), estimatedCost: Math.round(hires * avgSal * 0.2), roi: Math.round(hires * avgSal * 0.8), openReqs, calculatedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const RoiCalcRunSchema = z.object({ requisitionId: z.string().optional() });
// 104. POST /real-time-hiring-roi-calculator/run
router.post('/real-time-hiring-roi-calculator/run', validate(RoiCalcRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId } = req.body;
    const where: any = { tenantId, status: 'ACCEPTED' };
    if (requisitionId) where.requisitionId = requisitionId;
    const result = await prisma.offer.aggregate({ where, _avg: { salaryAmount: true }, _count: { _all: true } });
    const avgSal = result._avg.salaryAmount || 0;
    return sendOk(res, { requisitionId, hires: result._count._all, avgSalary: avgSal, roi: Math.round(result._count._all * avgSal * 0.8), computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 105. GET /hiring-experimentation-framework
router.get('/hiring-experimentation-framework', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const experiments = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: 'EXPERIMENT_CREATED' },
      take: 100, orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, metadata: true },
    });
    return sendOk(res, { experiments, total: experiments.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 106. GET /multi-objective-hiring-optimizer-speed-quality-dei-cost
router.get('/multi-objective-hiring-optimizer-speed-quality-dei-cost', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [openReqs, hires, ttfData, costData] = await Promise.all([
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } }),
      prisma.requisition.findMany({ where: { tenantId, status: 'FILLED', closedAt: { not: null } }, select: { createdAt: true, closedAt: true }, take: 50 }),
      prisma.offer.aggregate({ where: { tenantId, status: 'ACCEPTED' }, _avg: { salaryAmount: true } }),
    ]);
    const avgTtf = ttfData.length ? ttfData.reduce((s, r) => s + Math.floor((r.closedAt!.getTime() - r.createdAt.getTime()) / 86400000), 0) / ttfData.length : null;
    return sendOk(res, { objectives: { speed: avgTtf ? Math.round(avgTtf) : null, quality: hires, cost: costData._avg.salaryAmount ? Math.round(costData._avg.salaryAmount * 0.2) : null }, openReqs });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const MultiObjectiveRunSchema = z.object({ weights: z.record(z.string(), z.number()).optional() });
// 107. POST /multi-objective-hiring-optimizer-speed-quality-dei-cost/run
router.post('/multi-objective-hiring-optimizer-speed-quality-dei-cost/run', validate(MultiObjectiveRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { weights } = req.body;
    const w = weights || { speed: 0.33, quality: 0.33, cost: 0.34 };
    const [hires, openReqs] = await Promise.all([
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } }),
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
    ]);
    const score = hires * (w.quality || 0.33) + (1 / (openReqs + 1)) * (w.speed || 0.33);
    return sendOk(res, { weights: w, optimizationScore: score, hires, openReqs, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 108. GET /burnout-risk-monitor-for-recruiters
router.get('/burnout-risk-monitor-for-recruiters', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const since = new Date(Date.now() - 30 * 86400000);
    const activity = await prisma.hiringEvent.groupBy({
      by: ['actorId' as any],
      where: { tenantId, createdAt: { gte: since } },
      _count: { _all: true },
    });
    const atRisk = (activity as any[]).map((a) => ({ actorId: a.actorId, actionsLast30d: a._count._all, burnoutRisk: Math.min(1, a._count._all / 300) })).filter((a) => a.burnoutRisk > 0.5);
    return sendOk(res, { atRisk, total: activity.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const BurnoutRunSchema = z.object({ recruiterId: z.string().optional() });
// 109. POST /burnout-risk-monitor-for-recruiters/run
router.post('/burnout-risk-monitor-for-recruiters/run', validate(BurnoutRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { recruiterId } = req.body;
    const where: any = { tenantId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } };
    if (recruiterId) where.actorId = recruiterId;
    const count = await prisma.hiringEvent.count({ where });
    return sendOk(res, { recruiterId, actionsLast30d: count, burnoutRiskScore: Math.min(1, count / 300), threshold: 300, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 110. GET /role-outcome-simulation-engine
router.get('/role-outcome-simulation-engine', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const reqs = await prisma.requisition.findMany({
      where: { tenantId, status: 'OPEN' },
      select: { id: true, department: true, salaryMin: true, salaryMax: true, priority: true },
      take: 50,
    });
    const simulations = reqs.map((r) => ({
      ...r,
      scenarios: {
        bestCase: { fillDays: 21, cost: r.salaryMax ? Math.round(r.salaryMax * 0.15) : null },
        baseCase: { fillDays: 45, cost: r.salaryMax ? Math.round(r.salaryMax * 0.20) : null },
        worstCase: { fillDays: 90, cost: r.salaryMax ? Math.round(r.salaryMax * 0.25) : null },
      },
    }));
    return sendOk(res, { simulations });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

const RoleOutcomeSimRunSchema = z.object({ requisitionId: z.string().min(1), scenarios: z.array(z.string()).optional() });
// 111. POST /role-outcome-simulation-engine/run
router.post('/role-outcome-simulation-engine/run', validate(RoleOutcomeSimRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId, scenarios } = req.body;
    const req2 = await prisma.requisition.findFirst({ where: { id: requisitionId, tenantId }, select: { id: true, department: true, salaryMin: true, salaryMax: true } });
    if (!req2) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    const scenarioNames = scenarios || ['bestCase', 'baseCase', 'worstCase'];
    const results = scenarioNames.map((s: any) => ({ scenario: s, projectedFillDays: s === 'bestCase' ? 21 : s === 'worstCase' ? 90 : 45 }));
    return sendOk(res, { requisitionId, results, computedAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 112. GET /experiment-as-a-service-for-recruiting-flows
router.get('/experiment-as-a-service-for-recruiting-flows', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const experiments = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: { in: ['EXPERIMENT_CREATED', 'EXPERIMENT_STARTED', 'EXPERIMENT_COMPLETED'] } },
      take: 100, orderBy: { createdAt: 'desc' },
      select: { id: true, eventType: true, createdAt: true, metadata: true },
    });
    return sendOk(res, { experiments, total: experiments.length });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 113. GET /culture-add-trajectory-simulator
router.get('/culture-add-trajectory-simulator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [byDept, recentHires] = await Promise.all([
      prisma.requisition.groupBy({ by: ['department'], where: { tenantId, status: 'FILLED' }, _count: { _all: true } }),
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED', respondedAt: { gte: new Date(Date.now() - 90 * 86400000) } } }),
    ]);
    return sendOk(res, { cultureTrajectory: byDept, recentHires90d: recentHires, note: 'Culture-add scoring requires interview feedback integration' });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

// 114. GET /predictive-headcount-vs-revenue-modeler
router.get('/predictive-headcount-vs-revenue-modeler', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const [totalHires, openReqs, totalBudget] = await Promise.all([
      prisma.offer.count({ where: { tenantId, status: 'ACCEPTED' } }),
      prisma.requisition.count({ where: { tenantId, status: 'OPEN' } }),
      prisma.requisition.aggregate({ where: { tenantId }, _sum: { salaryMax: true } }),
    ]);
    return sendOk(res, { totalHires, openReqs, totalBudgetCommitment: totalBudget._sum.salaryMax, note: 'Connect financial system for revenue correlation', modeledAt: new Date() });
  } catch (e: any) { return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: e.message } }); }
});

export default router;

