import { Router } from "express";
import { z } from "zod";
import { requireAuth, getTenantId } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import { ok } from "../lib/response";
import { generateInsights } from "../agents/analytics-agent";
import { generateComplianceReport } from "../lib/compliance-compute";

const router = Router();
router.use(requireAuth);

// ── Types ─────────────────────────────────────────────────────────────────────

type StageGroup = { stage: string; _count: { id: number } };
type SourceGroup = { source: string | null; _count: { id: number } };

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

const FUNNEL_STAGES = [
  "APPLIED",
  "SCREENED",
  "PHONE_SCREEN",
  "ASSESSMENT",
  "INTERVIEW",
  "FINAL_REVIEW",
  "OFFER",
  "HIRED",
] as const;

// ── GET /dashboard ────────────────────────────────────────────────────────────

router.get("/dashboard", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    const [
      openRequisitions,
      totalCandidates,
      totalApplications,
      applicationsThisMonth,
      completedInterviews,
      hiredCount,
      pipelineGrouped,
    ] = await Promise.all([
      prisma.requisition.count({ where: { tenantId, status: "OPEN" } }),
      prisma.candidate.count({ where: { tenantId, isAnonymized: false } }),
      prisma.application.count({ where: { tenantId } }),
      prisma.application.count({
        where: { tenantId, appliedAt: { gte: startOfMonth() } },
      }),
      prisma.interview.count({ where: { tenantId, status: "COMPLETED" } }),
      prisma.application.count({ where: { tenantId, stage: "HIRED" } }),
      prisma.application.groupBy({
        by: ["stage"],
        where: { tenantId },
        _count: { id: true },
      }),
    ]);

    const pipelineByStage = (pipelineGrouped as StageGroup[]).map((g) => ({
      stage: g.stage,
      count: g._count.id,
    }));

    return ok(res, {
      openRequisitions,
      totalCandidates,
      totalApplications,
      applicationsThisMonth,
      completedInterviews,
      hiredCount,
      pipelineByStage,
    });
  } catch (err) {
    return next(err);
  }
});

// ── GET /funnel ───────────────────────────────────────────────────────────────

router.get("/funnel", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    const grouped = await prisma.application.groupBy({
      by: ["stage"],
      where: { tenantId },
      _count: { id: true },
    });

    const countByStage: Record<string, number> = {};
    for (const g of grouped as StageGroup[]) {
      countByStage[g.stage] = g._count.id;
    }

    // Build funnel stages with conversion rates
    const stages = FUNNEL_STAGES.map((stage, i) => {
      const count = countByStage[stage] ?? 0;
      let conversionRate: number | null = null;
      if (i < FUNNEL_STAGES.length - 1) {
        const nextCount = countByStage[FUNNEL_STAGES[i + 1]] ?? 0;
        conversionRate = count > 0 ? Math.round((nextCount / count) * 1000) / 10 : 0;
      }
      return { stage, count, conversionRate };
    });

    const appliedCount = countByStage["APPLIED"] ?? 0;
    const hiredCount = countByStage["HIRED"] ?? 0;
    const overallConversionRate =
      appliedCount > 0
        ? Math.round((hiredCount / appliedCount) * 1000) / 10
        : 0;

    const rejectedCount = countByStage["REJECTED"] ?? 0;
    const withdrawnCount = countByStage["WITHDRAWN"] ?? 0;
    const totalDropped = rejectedCount + withdrawnCount;

    // Append REJECTED and WITHDRAWN as informational entries (no conversionRate)
    const extendedStages = [
      ...stages,
      { stage: "REJECTED", count: rejectedCount, conversionRate: null },
      { stage: "WITHDRAWN", count: withdrawnCount, conversionRate: null },
    ];

    return ok(res, {
      stages: extendedStages,
      overallConversionRate,
      totalDropped,
    });
  } catch (err) {
    return next(err);
  }
});

// ── GET /time-to-hire ─────────────────────────────────────────────────────────

router.get("/time-to-hire", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    const hiredApps = await prisma.application.findMany({
      where: { tenantId, stage: "HIRED" },
      select: {
        appliedAt: true,
        stageUpdatedAt: true,
        requisition: { select: { department: true } },
      },
    });

    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    const allDays: number[] = [];
    const deptMap: Record<string, number[]> = {};

    for (const app of hiredApps) {
      const days =
        (app.stageUpdatedAt.getTime() - app.appliedAt.getTime()) / MS_PER_DAY;
      allDays.push(days);
      const dept = app.requisition?.department ?? "Unknown";
      if (!deptMap[dept]) deptMap[dept] = [];
      deptMap[dept].push(days);
    }

    const averageDays = Math.round(mean(allDays) * 10) / 10;
    const medianDays = Math.round(median(allDays) * 10) / 10;

    const byDepartment = Object.entries(deptMap).map(([department, days]) => ({
      department,
      averageDays: Math.round(mean(days) * 10) / 10,
      count: days.length,
    }));

    return ok(res, {
      averageDays,
      medianDays,
      sampleSize: hiredApps.length,
      byDepartment,
    });
  } catch (err) {
    return next(err);
  }
});

// ── GET /source-of-hire ───────────────────────────────────────────────────────

router.get("/source-of-hire", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    const [sourceGroups, hiredApps] = await Promise.all([
      prisma.candidate.groupBy({
        by: ["source"],
        where: { tenantId, isAnonymized: false },
        _count: { id: true },
      }),
      prisma.application.findMany({
        where: { tenantId, stage: "HIRED" },
        include: { candidate: { select: { source: true } } },
      }),
    ]);

    // Count hired per source
    const hiredBySource: Record<string, number> = {};
    for (const app of hiredApps) {
      const src = app.candidate?.source ?? "__null__";
      hiredBySource[src] = (hiredBySource[src] ?? 0) + 1;
    }

    const sources = (sourceGroups as SourceGroup[]).map((g) => {
      const src = g.source ?? "__null__";
      const totalCandidates = g._count.id;
      const hiredCount = hiredBySource[src] ?? 0;
      const hireRate =
        totalCandidates > 0
          ? Math.round((hiredCount / totalCandidates) * 1000) / 10
          : 0;
      return {
        source: g.source,
        totalCandidates,
        hiredCount,
        hireRate,
      };
    });

    return ok(res, { sources });
  } catch (err) {
    return next(err);
  }
});

// ── GET /diversity ────────────────────────────────────────────────────────────

router.get("/diversity", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    const [diversityMetrics, totalApplications, hiredCount] = await Promise.all(
      [
        prisma.diversityMetric.findMany({
          where: { tenantId },
          orderBy: { computedAt: "desc" },
          take: 100,
        }),
        prisma.application.count({ where: { tenantId } }),
        prisma.application.count({ where: { tenantId, stage: "HIRED" } }),
      ]
    );

    const summary = {
      totalApplications,
      hiredCount,
      hireRate:
        totalApplications > 0
          ? Math.round((hiredCount / totalApplications) * 1000) / 10
          : 0,
    };

    if (diversityMetrics.length === 0) {
      return ok(res, {
        available: false,
        message:
          "No diversity metrics computed yet. Run bias analysis to generate.",
        summary,
      });
    }

    // Group by stage
    const byStage: Record<string, typeof diversityMetrics> = {};
    for (const m of diversityMetrics) {
      if (!byStage[m.stage]) byStage[m.stage] = [];
      byStage[m.stage].push(m);
    }

    return ok(res, {
      available: true,
      metrics: diversityMetrics,
      byStage,
      summary,
    });
  } catch (err) {
    return next(err);
  }
});

// ── GET /recruiter-productivity ───────────────────────────────────────────────

router.get("/recruiter-productivity", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    const [requisitions, users] = await Promise.all([
      prisma.requisition.findMany({
        where: { tenantId, recruiterId: { not: null } },
        select: {
          recruiterId: true,
          status: true,
          closedAt: true,
          department: true,
        },
      }),
      prisma.user.findMany({
        where: { tenantId },
        select: { id: true, firstName: true, lastName: true, email: true },
      }),
    ]);

    const userMap: Record<
      string,
      { firstName: string; lastName: string; email: string }
    > = {};
    for (const u of users) {
      userMap[u.id] = { firstName: u.firstName, lastName: u.lastName, email: u.email };
    }

    // Aggregate per recruiter
    const recruiterMap: Record<
      string,
      { openReqs: number; filledReqs: number; cancelledReqs: number; totalReqs: number }
    > = {};

    for (const req of requisitions) {
      const rid = req.recruiterId!;
      if (!recruiterMap[rid]) {
        recruiterMap[rid] = { openReqs: 0, filledReqs: 0, cancelledReqs: 0, totalReqs: 0 };
      }
      recruiterMap[rid].totalReqs++;
      if (req.status === "OPEN") recruiterMap[rid].openReqs++;
      else if (req.status === "FILLED") recruiterMap[rid].filledReqs++;
      else if (req.status === "CANCELLED") recruiterMap[rid].cancelledReqs++;
    }

    const recruiters = Object.entries(recruiterMap).map(([recruiterId, stats]) => {
      const user = userMap[recruiterId];
      return {
        recruiterId,
        name: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        email: user?.email ?? null,
        openReqs: stats.openReqs,
        filledReqs: stats.filledReqs,
        cancelledReqs: stats.cancelledReqs,
        totalReqs: stats.totalReqs,
      };
    });

    return ok(res, { recruiters });
  } catch (err) {
    return next(err);
  }
});

// ── GET /export ───────────────────────────────────────────────────────────────

router.get("/export", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    // Compute all in parallel
    const [
      openRequisitions,
      totalCandidates,
      totalApplications,
      applicationsThisMonth,
      completedInterviews,
      hiredCount,
      pipelineGrouped,
      hiredApps,
      sourceGroups,
      hiredAppsForSource,
    ] = await Promise.all([
      prisma.requisition.count({ where: { tenantId, status: "OPEN" } }),
      prisma.candidate.count({ where: { tenantId, isAnonymized: false } }),
      prisma.application.count({ where: { tenantId } }),
      prisma.application.count({
        where: { tenantId, appliedAt: { gte: startOfMonth() } },
      }),
      prisma.interview.count({ where: { tenantId, status: "COMPLETED" } }),
      prisma.application.count({ where: { tenantId, stage: "HIRED" } }),
      prisma.application.groupBy({
        by: ["stage"],
        where: { tenantId },
        _count: { id: true },
      }),
      prisma.application.findMany({
        where: { tenantId, stage: "HIRED" },
        select: {
          appliedAt: true,
          stageUpdatedAt: true,
          requisition: { select: { department: true } },
        },
      }),
      prisma.candidate.groupBy({
        by: ["source"],
        where: { tenantId, isAnonymized: false },
        _count: { id: true },
      }),
      prisma.application.findMany({
        where: { tenantId, stage: "HIRED" },
        include: { candidate: { select: { source: true } } },
      }),
    ]);

    // Dashboard KPIs
    const pipelineByStage = (pipelineGrouped as StageGroup[]).map((g) => ({
      stage: g.stage,
      count: g._count.id,
    }));

    // Funnel
    const countByStage: Record<string, number> = {};
    for (const g of pipelineGrouped as StageGroup[]) {
      countByStage[g.stage] = g._count.id;
    }
    const funnelStages = FUNNEL_STAGES.map((stage, i) => {
      const count = countByStage[stage] ?? 0;
      let conversionRate: number | null = null;
      if (i < FUNNEL_STAGES.length - 1) {
        const nextCount = countByStage[FUNNEL_STAGES[i + 1]] ?? 0;
        conversionRate = count > 0 ? Math.round((nextCount / count) * 1000) / 10 : 0;
      }
      return { stage, count, conversionRate };
    });

    // TTH
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const allDays: number[] = [];
    const deptMap: Record<string, number[]> = {};
    for (const app of hiredApps) {
      const days =
        (app.stageUpdatedAt.getTime() - app.appliedAt.getTime()) / MS_PER_DAY;
      allDays.push(days);
      const dept = app.requisition?.department ?? "Unknown";
      if (!deptMap[dept]) deptMap[dept] = [];
      deptMap[dept].push(days);
    }
    const tth = {
      averageDays: Math.round(mean(allDays) * 10) / 10,
      medianDays: Math.round(median(allDays) * 10) / 10,
      sampleSize: hiredApps.length,
      byDepartment: Object.entries(deptMap).map(([department, days]) => ({
        department,
        averageDays: Math.round(mean(days) * 10) / 10,
        count: days.length,
      })),
    };

    // Source of hire
    const hiredBySource: Record<string, number> = {};
    for (const app of hiredAppsForSource) {
      const src = app.candidate?.source ?? "__null__";
      hiredBySource[src] = (hiredBySource[src] ?? 0) + 1;
    }
    const sources = (sourceGroups as SourceGroup[]).map((g) => {
      const src = g.source ?? "__null__";
      const total = g._count.id;
      const hired = hiredBySource[src] ?? 0;
      return {
        source: g.source,
        totalCandidates: total,
        hiredCount: hired,
        hireRate: total > 0 ? Math.round((hired / total) * 1000) / 10 : 0,
      };
    });

    return ok(res, {
      dashboard: {
        openRequisitions,
        totalCandidates,
        totalApplications,
        applicationsThisMonth,
        completedInterviews,
        hiredCount,
        pipelineByStage,
      },
      funnel: funnelStages,
      timeToHire: tth,
      sourceOfHire: { sources },
      exportedAt: new Date().toISOString(),
      format: "JSON",
    });
  } catch (err) {
    return next(err);
  }
});

// ── POST /ai-insights ────────────────────────────────────────────────────────

const AiInsightsSchema = z.object({
  query: z.string().min(5, 'Query must be at least 5 characters'),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  department: z.string().optional(),
});

router.post("/ai-insights", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = (req as any).user?.id || 'unknown';
    const body = AiInsightsSchema.parse(req.body);

    const timeRange = body.timeRange
      ? { start: new Date(body.timeRange.start), end: new Date(body.timeRange.end) }
      : undefined;

    const result = await generateInsights({
      tenantId,
      userId,
      query: body.query,
      timeRange,
      department: body.department,
    });

    return ok(res, {
      insights: result.insights.insights,
      metrics: result.insights.metrics,
      answer: result.insights.answer,
      runId: result.runId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    });
  } catch (err) {
    return next(err);
  }
});

// ── GET /export/pipeline — export pipeline data as CSV ───────────────────────

router.get("/export/pipeline", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const applications = await prisma.application.findMany({
      where: { tenantId },
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true, source: true } },
        requisition: { select: { title: true, department: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    const csvHeader = "Candidate,Email,Source,Role,Department,Stage,Status,Applied At\n";
    const csvRows = applications
      .map(
        (a) =>
          `"${a.candidate.firstName} ${a.candidate.lastName}","${a.candidate.email}","${a.candidate.source || ""}","${a.requisition.title}","${a.requisition.department}","${a.stage}","${a.status}","${a.appliedAt?.toISOString() || ""}"`
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="pipeline-report-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.send(csvHeader + csvRows);
  } catch (err) {
    return next(err);
  }
});

// ── GET /export/eeo — export EEO-1 / adverse impact report as CSV ────────────

router.get("/export/eeo", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const report = await generateComplianceReport({
      tenantId,
      timeRange: {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      attributes: ["source"],
    });

    const csvHeader =
      "Attribute,Stage,Group,Applicants,Selected,Selection Rate,Adverse Impact Ratio,Four-Fifths Pass\n";
    const csvRows = report.reports
      .flatMap((r) =>
        r.groups.map(
          (g) =>
            `"${r.attribute}","${r.stage}","${g.groupName}",${g.applicantCount},${g.selectedCount},${g.selectionRate.toFixed(4)},${r.adverseImpactRatio.toFixed(4)},${r.fourFifthsPass}`
        )
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="eeo-report-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.send(csvHeader + csvRows);
  } catch (err) {
    return next(err);
  }
});

export default router;
