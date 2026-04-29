import { Router } from "express";
import { z } from "zod";
import { requireAuth, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, paginated, created, noContent } from "../lib/response";

const router = Router();
router.use(requireAuth);

// ── GET /requisition/:reqId — list reports for a requisition (BEFORE /:id) ────
router.get("/requisition/:reqId", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const reports = await prisma.biasReport.findMany({
      where: { tenantId, requisitionId: req.params.reqId },
      orderBy: { generatedAt: "desc" },
    });
    return ok(res, reports);
  } catch (err) {
    return next(err);
  }
});

// ── GET / — list all bias reports (paginated) ─────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;

    const overallRisk = req.query.overallRisk as string | undefined;
    const requisitionId = req.query.requisitionId as string | undefined;

    const where: any = {
      tenantId,
      ...(overallRisk ? { overallRisk } : {}),
      ...(requisitionId ? { requisitionId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.biasReport.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { generatedAt: "desc" },
      }),
      prisma.biasReport.count({ where }),
    ]);

    return paginated(res, {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    return next(err);
  }
});

// ── GET /:id — get single bias report ────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const report = await prisma.biasReport.findFirst({
      where: { id: req.params.id, tenantId },
    });
    if (!report) throw new AppError("NOT_FOUND", "Bias report not found", 404);
    return ok(res, report);
  } catch (err) {
    return next(err);
  }
});

// ── POST /generate — generate / create a bias report ─────────────────────────
const GenerateBiasReportSchema = z.object({
  requisitionId: z.string().min(1).optional(),
  scope: z.string().min(1),
  dimensions: z.array(z.string().min(1)).min(1),
  findings: z.record(z.string(), z.unknown()),
  overallRisk: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  recommendations: z.array(z.string()),
});

router.post("/generate", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = GenerateBiasReportSchema.parse(req.body);

    const report = await prisma.biasReport.create({
      data: {
        tenantId,
        requisitionId: body.requisitionId ?? null,
        scope: body.scope,
        dimensions: body.dimensions,
        findings: body.findings as any,
        overallRisk: body.overallRisk,
        recommendations: body.recommendations,
      },
    });

    return created(res, report);
  } catch (err) {
    return next(err);
  }
});

// ── BiasAnalysis routes (PROXY_DETECTION etc.) — BEFORE parameterised /:id ───

const RunBiasAnalysisSchema = z.object({
  analysisType: z.string().min(1),
  requisitionId: z.string().optional(),
  protectedAttribute: z.string().optional(),
  findings: z.array(z.record(z.string(), z.unknown())).optional(),
  severity: z.string().optional(),
  stage: z.string().optional(),
});

// GET /analyses — list BiasAnalysis records, filterable by ?analysisType=
router.get("/analyses", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const analysisType = req.query.analysisType as string | undefined;

    const where: any = {
      tenantId,
      ...(analysisType ? { analysisType } : {}),
    };

    const data = await prisma.biasAnalysis.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return ok(res, { data, total: data.length });
  } catch (err) {
    return next(err);
  }
});

// POST /analyses/run — create a new BiasAnalysis record
router.post("/analyses/run", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = RunBiasAnalysisSchema.parse(req.body);

    const analysis = await prisma.biasAnalysis.create({
      data: {
        tenantId,
        analysisType: body.analysisType as any,
        requisitionId: body.requisitionId ?? null,
        protectedAttribute: body.protectedAttribute ?? null,
        findings: (body.findings ?? []) as any,
        severity: body.severity ?? "LOW",
        stage: body.stage ?? null,
        status: "ACTIVE",
      },
    });

    return created(res, analysis);
  } catch (err) {
    return next(err);
  }
});

// GET /analyses/:id — get single BiasAnalysis
router.get("/analyses/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const analysis = await prisma.biasAnalysis.findFirst({
      where: { id: req.params.id, tenantId },
    });
    if (!analysis) throw new AppError("NOT_FOUND", "Bias analysis not found", 404);
    return ok(res, analysis);
  } catch (err) {
    return next(err);
  }
});

// ── DELETE /:id — delete a bias report ───────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.biasReport.findFirst({
      where: { id: req.params.id, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Bias report not found", 404);

    await prisma.biasReport.delete({ where: { id: req.params.id } });
    return noContent(res);
  } catch (err) {
    return next(err);
  }
});

export default router;
