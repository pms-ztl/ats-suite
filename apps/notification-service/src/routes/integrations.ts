/**
 * Tenant integration management — Slack webhook URL, email config overrides.
 *
 *   GET    /internal/integrations            — list all for the tenant
 *   PUT    /internal/integrations/:kind      — upsert config for kind ("slack"|"email")
 *   DELETE /internal/integrations/:kind      — remove config
 *   POST   /internal/integrations/:kind/test — send a test notification via this channel
 *
 * All routes are tenant-scoped via X-Tenant-Id.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { sendSlack } from "../lib/slack.js";
import { sendEmail, renderNotificationEmail } from "../lib/mailer.js";

const router = Router();

const KindSchema = z.enum(["slack", "email"]);

// ── GET /internal/integrations ─────────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const rows = await prisma.tenantIntegration.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
    // Redact webhook URLs in list view — only show last 8 chars
    const safe = rows.map((r) => {
      const cfg = r.config as Record<string, unknown>;
      const redacted: Record<string, unknown> = { ...cfg };
      if (typeof cfg["webhookUrl"] === "string") {
        const url = cfg["webhookUrl"] as string;
        redacted["webhookUrl"] = `…${url.slice(-12)}`;
      }
      return { ...r, config: redacted };
    });
    ok(res, safe);
  } catch (err) { next(err); }
});

// ── PUT /internal/integrations/:kind ───────────────────────────────────────
const SlackConfigSchema = z.object({
  webhookUrl: z.string().url().regex(/^https:\/\/hooks\.slack\.com\//, "Must be a Slack incoming webhook URL"),
  channel: z.string().optional(),
});
const EmailConfigSchema = z.object({
  fromAddress: z.string().email().optional(),
  replyTo: z.string().email().optional(),
});
const UpsertSchema = z.object({
  config: z.record(z.string(), z.unknown()),
  enabled: z.boolean().optional(),
});

// Phase 27 F-028-micro-P0: integration config (Slack webhook, SMTP) is admin-only.
router.put("/:kind", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const kind = KindSchema.parse(req.params["kind"]);
    const body = UpsertSchema.parse(req.body);
    // Per-kind validation
    if (kind === "slack") SlackConfigSchema.parse(body.config);
    if (kind === "email") EmailConfigSchema.parse(body.config);

    const row = await prisma.tenantIntegration.upsert({
      where: { tenantId_kind: { tenantId, kind } },
      update: { config: body.config as any, enabled: body.enabled ?? true },
      create: { tenantId, kind, config: body.config as any, enabled: body.enabled ?? true },
    });
    ok(res, row);
  } catch (err) { next(err); }
});

// ── DELETE /internal/integrations/:kind ────────────────────────────────────
router.delete("/:kind", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const kind = KindSchema.parse(req.params["kind"]);
    await prisma.tenantIntegration.delete({
      where: { tenantId_kind: { tenantId, kind } },
    }).catch(() => { /* idempotent */ });
    ok(res, { ok: true });
  } catch (err) { next(err); }
});

// ── POST /internal/integrations/:kind/test ─────────────────────────────────
const TestPayloadSchema = z.object({
  /** Only used for kind=email — defaults to the caller's email. */
  to: z.string().email().optional(),
});

router.post("/:kind/test", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const kind = KindSchema.parse(req.params["kind"]);
    const body = TestPayloadSchema.parse(req.body ?? {});

    if (kind === "slack") {
      const integration = await prisma.tenantIntegration.findUnique({
        where: { tenantId_kind: { tenantId, kind: "slack" } },
      });
      const config = integration?.config as { webhookUrl?: string } | null;
      if (!integration?.enabled || !config?.webhookUrl) {
        throw Errors.validation("Slack integration not configured for this tenant");
      }
      const result = await sendSlack({
        webhookUrl: config.webhookUrl,
        title: "CDC ATS — Test notification",
        body: "If you see this, your Slack integration is wired up correctly. :tada:",
        iconEmoji: ":white_check_mark:",
      });
      return ok(res, result);
    }

    if (kind === "email") {
      // Test to caller email (look up via identity-service) or explicit `to`
      const userId = getUserId(req);
      let toAddress = body.to;
      if (!toAddress && userId) {
        const identityUrl = process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:4001";
        const r = await fetch(`${identityUrl}/internal/users/${userId}`, {
          headers: {
            "X-User-Id": userId,
            "X-Tenant-Id": tenantId,
            "X-User-Role": (req.headers["x-user-role"] as string) ?? "ADMIN",
          },
        });
        if (r.ok) {
          const u: any = await r.json();
          toAddress = u.data?.email;
        }
      }
      if (!toAddress) throw Errors.validation("No recipient email — pass 'to' in body or ensure caller has an email");
      const { text, html } = renderNotificationEmail({
        title: "CDC ATS — Test notification",
        body: "If you see this, your SMTP integration is wired up correctly.",
        link: process.env["CORS_ORIGIN"]?.split(",")[0] ?? "http://localhost:3000",
      });
      const result = await sendEmail({
        to: toAddress,
        subject: "CDC ATS — Test notification",
        text,
        html,
      });
      return ok(res, result);
    }
  } catch (err) { next(err); }
});

export default router;
