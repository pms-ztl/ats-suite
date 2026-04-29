import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, created, noContent, paginated } from "../lib/response";
import { dispatchWebhook } from "../lib/webhooks";
import { IntegrationStatus, WebhookStatus } from "../../node_modules/.prisma/client/enums";

const router = Router();
router.use(requireAuth);

// ── Zod schemas ───────────────────────────────────────────────────────────────

const listIntegrationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["ACTIVE", "INACTIVE", "ERROR", "PENDING_SETUP"] as const).optional(),
});

const createIntegrationSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  config: z.record(z.string(), z.unknown()).optional(),
});

const updateIntegrationSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ERROR", "PENDING_SETUP"] as const).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const listWebhooksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["ACTIVE", "INACTIVE", "FAILING"] as const).optional(),
  integrationId: z.string().optional(),
});

const createWebhookSchema = z.object({
  url: z.string().url(),
  secret: z.string().min(1),
  events: z.array(
    z.enum([
      "CANDIDATE_CREATED",
      "CANDIDATE_UPDATED",
      "APPLICATION_STAGE_CHANGED",
      "INTERVIEW_SCHEDULED",
      "OFFER_EXTENDED",
      "OFFER_ACCEPTED",
      "REQUISITION_OPENED",
      "REQUISITION_CLOSED",
      "HIRE_COMPLETED",
    ] as const)
  ).min(1),
  integrationId: z.string().optional(),
  headers: z.record(z.string(), z.unknown()).optional(),
});

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  secret: z.string().min(1).optional(),
  events: z.array(
    z.enum([
      "CANDIDATE_CREATED",
      "CANDIDATE_UPDATED",
      "APPLICATION_STAGE_CHANGED",
      "INTERVIEW_SCHEDULED",
      "OFFER_EXTENDED",
      "OFFER_ACCEPTED",
      "REQUISITION_OPENED",
      "REQUISITION_CLOSED",
      "HIRE_COMPLETED",
    ] as const)
  ).min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "FAILING"] as const).optional(),
  headers: z.record(z.string(), z.unknown()).optional(),
});

// ── Integration Config (provider-level settings, e.g. Slack webhook) ─────────

// POST /config — save or update integration configuration for a provider
router.post("/config", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { provider, config: integrationConfig, integrationType } = req.body;

    if (!provider || !integrationConfig) {
      throw new AppError("VALIDATION_ERROR", "provider and config required", 400);
    }

    const type = integrationType ?? provider;

    const existing = await prisma.integrationConfig.findFirst({
      where: { tenantId, provider },
    });

    if (existing) {
      const updated = await prisma.integrationConfig.update({
        where: { id: existing.id },
        data: { config: integrationConfig, status: "ACTIVE" },
      });
      return ok(res, updated);
    }

    const newConfig = await prisma.integrationConfig.create({
      data: { tenantId, provider, integrationType: type, config: integrationConfig, status: "ACTIVE" },
    });
    return created(res, newConfig);
  } catch (err) {
    return next(err);
  }
});

// GET /config — list all integration configs for tenant
router.get("/config", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const configs = await prisma.integrationConfig.findMany({ where: { tenantId } });
    return ok(res, configs.map((c: any) => ({
      ...c,
      config: {
        ...((c.config as Record<string, unknown>) || {}),
        // Mask sensitive tokens in the response
        accessToken: (c.config as any)?.accessToken ? "***" : undefined,
        webhookUrl: (c.config as any)?.webhookUrl
          ? (c.config as any).webhookUrl.substring(0, 40) + "..."
          : undefined,
      },
    })));
  } catch (err) {
    return next(err);
  }
});

// DELETE /config/:provider — disconnect integration by provider
router.delete("/config/:provider", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const provider = req.params.provider as string;
    await prisma.integrationConfig.updateMany({
      where: { tenantId, provider },
      data: { status: "INACTIVE" },
    });
    return ok(res, { disconnected: provider });
  } catch (err) {
    return next(err);
  }
});

// ── Integrations ──────────────────────────────────────────────────────────────

// GET / — list integrations for tenant
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const query = listIntegrationsQuerySchema.parse(req.query);
    const { page, pageSize, status } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      tenantId,
      ...(status ? { status: status as IntegrationStatus } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.integration.findMany({
        where,
        skip,
        take: pageSize,
        include: { _count: { select: { webhooks: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.integration.count({ where }),
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

// GET /webhooks — list webhooks for tenant (MUST be before /:id)
router.get("/webhooks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const query = listWebhooksQuerySchema.parse(req.query);
    const { page, pageSize, status, integrationId } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      tenantId,
      ...(status ? { status: status as WebhookStatus } : {}),
      ...(integrationId ? { integrationId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.webhook.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.webhook.count({ where }),
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

// POST /webhooks — create webhook (MUST be before /:id)
router.post("/webhooks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = createWebhookSchema.parse(req.body);

    // If integrationId provided, verify it belongs to this tenant
    if (body.integrationId) {
      const integration = await prisma.integration.findFirst({
        where: { id: body.integrationId, tenantId },
      });
      if (!integration) {
        throw new AppError("NOT_FOUND", "Integration not found", 404);
      }
    }

    const webhook = await prisma.webhook.create({
      data: {
        tenantId,
        url: body.url,
        secret: body.secret,
        events: body.events,
        integrationId: body.integrationId ?? null,
        headers: body.headers ?? {} as any,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return created(res, webhook);
  } catch (err) {
    return next(err);
  }
});

// POST /webhooks/:id/test — send a test webhook (MUST be before /:id)
router.post("/webhooks/:id/test", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);

    // Verify the webhook exists and belongs to this tenant
    const existing = await prisma.webhook.findFirst({
      where: { id: req.params.id, tenantId } as any,
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Webhook not found", 404);
    }

    // Dispatch a test event
    await dispatchWebhook(tenantId, 'candidate.created' as any, {
      message: 'Test webhook delivery',
      timestamp: new Date().toISOString(),
      test: true,
    });
    return ok(res, { sent: true, message: 'Test webhook dispatched' });
  } catch (err) { return next(err); }
});

// PATCH /webhooks/:id — update webhook (MUST be before /:id)
router.patch("/webhooks/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;
    const body = updateWebhookSchema.parse(req.body);

    const existing = await prisma.webhook.findFirst({
      where: { id, tenantId } as any
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Webhook not found", 404);
    }

    const webhook = await prisma.webhook.update({
      where: { id } as any,
      data: {
        ...(body.url !== undefined ? { url: body.url } : {}),
        ...(body.secret !== undefined ? { secret: body.secret } : {}),
        ...(body.events !== undefined ? { events: body.events } : {}),
        ...(body.status !== undefined ? { status: body.status as WebhookStatus } : {}),
        ...(body.headers !== undefined ? { headers: body.headers } : {}),
        updatedAt: new Date(),
      } as any,
    });

    return ok(res, webhook);
  } catch (err) {
    return next(err);
  }
});

// DELETE /webhooks/:id — delete webhook (ADMIN only, MUST be before /:id)
router.delete(
  "/webhooks/:id",
  requireRole("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const existing = await prisma.webhook.findFirst({
        where: { id, tenantId } as any
      });
      if (!existing) {
        throw new AppError("NOT_FOUND", "Webhook not found", 404);
      }

      await prisma.webhook.delete({ where: { id: id as string } });
      return noContent(res);
    } catch (err) {
      return next(err);
    }
  }
);

// GET /:id — get single integration with webhooks
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const integration = await prisma.integration.findFirst({
      where: { id, tenantId } as any,
      include: { webhooks: true },
    });
    if (!integration) {
      throw new AppError("NOT_FOUND", "Integration not found", 404);
    }

    return ok(res, integration);
  } catch (err) {
    return next(err);
  }
});

// POST / — create integration
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = createIntegrationSchema.parse(req.body);

    const integration = await prisma.integration.create({
      data: {
        tenantId,
        name: body.name,
        type: body.type,
        config: body.config ?? {} as any,
        status: "PENDING_SETUP",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return created(res, integration);
  } catch (err) {
    return next(err);
  }
});

// PATCH /:id — update integration
router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;
    const body = updateIntegrationSchema.parse(req.body);

    const existing = await prisma.integration.findFirst({
      where: { id, tenantId } as any
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Integration not found", 404);
    }

    const integration = await prisma.integration.update({
      where: { id } as any,
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.type !== undefined ? { type: body.type } : {}),
        ...(body.status !== undefined ? { status: body.status as IntegrationStatus } : {}),
        ...(body.config !== undefined ? { config: body.config } : {}),
        updatedAt: new Date(),
      } as any,
    });

    return ok(res, integration);
  } catch (err) {
    return next(err);
  }
});

// DELETE /:id — delete integration (ADMIN only)
router.delete(
  "/:id",
  requireRole("ADMIN"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const existing = await prisma.integration.findFirst({
        where: { id, tenantId } as any
      });
      if (!existing) {
        throw new AppError("NOT_FOUND", "Integration not found", 404);
      }

      // Cascade: delete all webhooks for this integration first
      await prisma.webhook.deleteMany({ where: { integrationId: id as string, tenantId } });
      await prisma.integration.delete({ where: { id: id as string } });
      return noContent(res);
    } catch (err) {
      return next(err);
    }
  }
);

// POST /:id/sync — trigger sync
router.post("/:id/sync", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const existing = await prisma.integration.findFirst({
      where: { id, tenantId } as any
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Integration not found", 404);
    }

    const integration = await prisma.integration.update({
      where: { id } as any,
      data: {
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return ok(res, integration);
  } catch (err) {
    return next(err);
  }
});

export default router;
