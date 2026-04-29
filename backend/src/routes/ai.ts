import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AIJobType, AIJobStatus, AIModelStatus } from "../../node_modules/.prisma/client/enums";
import { requireAuth, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, paginated, created, noContent } from "../lib/response";

const router = Router();
router.use(requireAuth);

// ── Zod schemas ───────────────────────────────────────────────────────────────

const createJobSchema = z.object({
  type: z.nativeEnum(AIJobType),
  input: z.record(z.string(), z.unknown()),
  modelId: z.string().optional(),
});

const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(AIJobStatus).optional(),
  type: z.nativeEnum(AIJobType).optional(),
});

const completeJobSchema = z.object({
  output: z.record(z.string(), z.unknown()),
});

const listModelsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(AIModelStatus).optional(),
});

const createModelSchema = z.object({
  name: z.string().min(1),
  provider: z.string().min(1),
  version: z.string().min(1),
  riskTier: z.string().optional(),
  modelCard: z.record(z.string(), z.unknown()).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const updateModelStatusSchema = z.object({
  status: z.nativeEnum(AIModelStatus),
  approvedBy: z.string().optional(),
});

// ── AI Jobs ───────────────────────────────────────────────────────────────────

// POST /jobs — submit a new AI job
router.post(
  "/jobs",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const body = createJobSchema.parse(req.body);

      // If modelId provided, verify it belongs to this tenant
      if (body.modelId) {
        const model = await prisma.aIModel.findFirst({
          where: { id: body.modelId, tenantId },
        });
        if (!model) {
          return next(
            new AppError("NOT_FOUND", "AI model not found", 404)
          );
        }
      }

      const job = await prisma.aIJob.create({
        data: {
          tenantId,
          type: body.type,
          status: AIJobStatus.QUEUED,
          input: body.input as any,
          modelId: body.modelId ?? null,
        },
      });

      return created(res, job);
    } catch (err) {
      return next(err);
    }
  }
);

// GET /jobs — list AI jobs (paginated)
router.get(
  "/jobs",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const query = listJobsQuerySchema.parse(req.query);
      const { page, pageSize, status, type } = query;

      const where = {
        tenantId,
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      };

      const [jobs, total] = await Promise.all([
        prisma.aIJob.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.aIJob.count({ where }),
      ]);

      return paginated(res, {
        data: jobs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (err) {
      return next(err);
    }
  }
);

// GET /jobs/:id — get single AI job
router.get(
  "/jobs/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const job = await prisma.aIJob.findFirst({
        where: { id, tenantId } as any
      });

      if (!job) {
        return next(new AppError("NOT_FOUND", "AI job not found", 404));
      }

      return ok(res, job);
    } catch (err) {
      return next(err);
    }
  }
);

// DELETE /jobs/:id — cancel an AI job
router.delete(
  "/jobs/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const job = await prisma.aIJob.findFirst({
        where: { id, tenantId } as any
      });

      if (!job) {
        return next(new AppError("NOT_FOUND", "AI job not found", 404));
      }

      const cancellableStatuses: AIJobStatus[] = [
        AIJobStatus.QUEUED,
        AIJobStatus.RUNNING,
      ];

      if (!cancellableStatuses.includes(job.status)) {
        return next(
          new AppError(
            "INVALID_STATE",
            `Cannot cancel a job with status '${job.status}'. Only QUEUED or RUNNING jobs can be cancelled.`,
            409
          )
        );
      }

      await prisma.aIJob.update({
        where: { id } as any,
        data: { status: AIJobStatus.CANCELLED },
      });

      return noContent(res);
    } catch (err) {
      return next(err);
    }
  }
);

// POST /jobs/:id/complete — mark job as completed (internal/admin)
// NOTE: registered before a hypothetical wildcard, but no conflict here since
// this is the only /:id/* route and method differs from GET /jobs/:id
router.post(
  "/jobs/:id/complete",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;
      const body = completeJobSchema.parse(req.body);

      const job = await prisma.aIJob.findFirst({
        where: { id, tenantId } as any
      });

      if (!job) {
        return next(new AppError("NOT_FOUND", "AI job not found", 404));
      }

      const updated = await prisma.aIJob.update({
        where: { id } as any,
        data: {
          status: AIJobStatus.COMPLETED,
          output: body.output as any,
          completedAt: new Date(),
        },
      });

      return ok(res, updated);
    } catch (err) {
      return next(err);
    }
  }
);

// ── AI Model Registry ─────────────────────────────────────────────────────────

// GET /models — list AI models (paginated)
router.get(
  "/models",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const query = listModelsQuerySchema.parse(req.query);
      const { page, pageSize, status } = query;

      const where = {
        tenantId,
        ...(status ? { status } : {}),
      };

      const [models, total] = await Promise.all([
        prisma.aIModel.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.aIModel.count({ where }),
      ]);

      return paginated(res, {
        data: models,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (err) {
      return next(err);
    }
  }
);

// POST /models — register a new AI model
router.post(
  "/models",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const body = createModelSchema.parse(req.body);

      const model = await prisma.aIModel.create({
        data: {
          tenantId,
          name: body.name,
          provider: body.provider,
          version: body.version,
          status: AIModelStatus.PENDING_APPROVAL,
          riskTier: body.riskTier ?? "MEDIUM",
          modelCard: body.modelCard ?? {} as any,
          config: body.config ?? {} as any
        },
      });

      return created(res, model);
    } catch (err) {
      return next(err);
    }
  }
);

// GET /models/:id — get single model
router.get(
  "/models/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const model = await prisma.aIModel.findFirst({
        where: { id, tenantId } as any
      });

      if (!model) {
        return next(new AppError("NOT_FOUND", "AI model not found", 404));
      }

      return ok(res, model);
    } catch (err) {
      return next(err);
    }
  }
);

// PATCH /models/:id/status — update model status
// Safe to register after GET /models/:id: different HTTP method (PATCH vs GET)
router.patch(
  "/models/:id/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;
      const body = updateModelStatusSchema.parse(req.body);

      const model = await prisma.aIModel.findFirst({
        where: { id, tenantId } as any
      });

      if (!model) {
        return next(new AppError("NOT_FOUND", "AI model not found", 404));
      }

      const statusTimestamps: Partial<{
        approvedAt: Date;
        approvedBy: string;
        deployedAt: Date;
        retiredAt: Date;
      }> = {};

      if (body.status === AIModelStatus.APPROVED) {
        statusTimestamps.approvedAt = new Date();
        if (body.approvedBy) {
          statusTimestamps.approvedBy = body.approvedBy;
        }
      } else if (body.status === AIModelStatus.DEPLOYED) {
        statusTimestamps.deployedAt = new Date();
      } else if (body.status === AIModelStatus.RETIRED) {
        statusTimestamps.retiredAt = new Date();
      }

      const updated = await prisma.aIModel.update({
        where: { id } as any,
        data: {
          status: body.status,
          ...statusTimestamps,
        },
      });

      return ok(res, updated);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
