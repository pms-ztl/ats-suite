/**
 * Tenant integration management — Slack webhook URL, email config overrides,
 * and assessment-provider (OA) credentials (HackerRank, Codility, etc.).
 *
 *   GET    /internal/integrations            — list all for the tenant (secrets redacted)
 *   PUT    /internal/integrations/:kind      — upsert config for a known kind
 *   DELETE /internal/integrations/:kind      — remove config
 *   POST   /internal/integrations/:kind/test — send a test notification via this channel
 *
 * All routes are tenant-scoped via X-Tenant-Id.
 *
 * WF8 (Slice H1): the `config` JSON column holds secrets (API keys/tokens/webhook
 * URLs). They are AES-GCM encrypted at rest (sealConfig) and decrypted on read
 * (unsealConfig, backward-compatible with legacy plaintext rows via isEncrypted).
 * Secrets are NEVER returned to the client — GET responses go through redactConfig.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId, requireTenantAdmin } from "@cdc-ats/common";
// Per-tenant router → RLS-scoped client.
import { prismaRls as prisma } from "../lib/prisma.js";
import { sendSlack } from "../lib/slack.js";
import { sendEmail, renderNotificationEmail } from "../lib/mailer.js";
import {
  INTEGRATION_KINDS,
  sealConfig,
  unsealConfig,
  redactConfig,
  isAssessmentKind,
} from "../lib/integration-config.js";

const router = Router();

// Kind registry: existing channels (slack, email) plus the WF8 assessment-provider
// kinds (hackerrank, codility, hackerearth, imocha, testgorilla). Additive — the
// enum is derived from the shared registry so new kinds are accepted everywhere.
const KindSchema = z.enum(INTEGRATION_KINDS);

// ── GET /internal/integrations ─────────────────────────────────────────────
// Admin-only, matching the PUT/DELETE/test on this router. Integration config
// (channels, enabled state, subdomains/regions, redacted secret tails) is a
// tenant settings surface reserved to ADMIN.
router.get("/", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const rows = await prisma.tenantIntegration.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
    // Decrypt (backward-compatible: legacy plaintext passes through) then redact
    // per-kind secret fields. Secrets are NEVER returned to the client.
    const safe = rows.map((r) => ({
      ...r,
      config: redactConfig(r.kind, unsealConfig(r.config)),
    }));
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
// Assessment-provider (OA) credentials. Non-secret routing fields (subdomain,
// region, baseUrl) sit alongside the encrypted-at-rest secrets (apiKey/token).
const AssessmentConfigSchema = z.object({
  apiKey: z.string().min(1).optional(),
  apiToken: z.string().min(1).optional(),
  clientSecret: z.string().min(1).optional(),
  webhookSecret: z.string().min(1).optional(),
  subdomain: z.string().optional(),
  region: z.string().optional(),
  baseUrl: z.string().url().optional(),
}).refine((c) => Boolean(c.apiKey || c.apiToken || c.clientSecret),
  { message: "Assessment provider requires an apiKey, apiToken or clientSecret" });

const UpsertSchema = z.object({
  config: z.record(z.string(), z.unknown()),
  enabled: z.boolean().optional(),
});

// Phase 27 F-028-micro-P0: integration config (Slack webhook, SMTP, OA creds) is admin-only.
router.put("/:kind", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const kind = KindSchema.parse(req.params["kind"]);
    const body = UpsertSchema.parse(req.body);
    // Per-kind validation
    if (kind === "slack") SlackConfigSchema.parse(body.config);
    if (kind === "email") EmailConfigSchema.parse(body.config);
    if (isAssessmentKind(kind)) AssessmentConfigSchema.parse(body.config);

    // Encrypt secrets at rest (seal-on-write). Existing plaintext rows for any
    // kind migrate to ciphertext here on their next save — no destructive backfill.
    const sealed = sealConfig(body.config) as any;

    const row = await prisma.tenantIntegration.upsert({
      where: { tenantId_kind: { tenantId, kind } },
      update: { config: sealed, enabled: body.enabled ?? true },
      create: { tenantId, kind, config: sealed, enabled: body.enabled ?? true },
    });
    // Return the redacted view — never echo the decrypted secret back.
    ok(res, { ...row, config: redactConfig(kind, body.config) });
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
      // Decrypt at the point of use (server-side only) — backward-compatible read.
      const config = integration ? (unsealConfig(integration.config) as { webhookUrl?: string }) : null;
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
