/**
 * Phase 20 — per-tenant email template overrides.
 *
 * Tenants can override the auto-generated email subject + body for each
 * notification type. The template engine is Mustache-lite: `{{varName}}`
 * placeholders only, no helpers, no loops.
 *
 * Variables available per type are well-known and documented in the
 * frontend editor — backend just stores+returns whatever the tenant sent.
 * Unknown variables substitute to empty string at render time (mailer.ts).
 *
 * Endpoints:
 *   GET    /internal/email-templates                 — list all overrides for tenant
 *   GET    /internal/email-templates/:type           — fetch one (404 = use default)
 *   PUT    /internal/email-templates/:type           — upsert
 *   DELETE /internal/email-templates/:type           — revert to default
 *   POST   /internal/email-templates/:type/preview   — substitute sample vars
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { substituteVariables, renderNotificationEmail } from "../lib/mailer.js";
import { getTenantBranding } from "../lib/branding-cache.js";

const router = Router();

function requireTenantId(req: Request): string {
  const id = req.headers["x-tenant-id"];
  if (typeof id !== "string" || !id) throw Errors.unauthorized("Missing tenant context");
  return id;
}

// Notification types that can be customized. Keep in sync with NotificationType
// enum in schema.prisma — if you add a type, also add the variables the
// template can substitute (used by the frontend editor's variable picker).
const TEMPLATE_TYPES = [
  "PLAN_CHANGE_REQUESTED",
  "PLAN_CHANGE_APPROVED",
  "PLAN_CHANGE_REJECTED",
  "NEW_TENANT_SIGNUP",
  "BULK_UPLOAD_COMPLETED",
  "SEAT_LIMIT_REACHED",
  "INTERVIEW_FEEDBACK_NEW",
  "SYSTEM",
] as const;

export const TEMPLATE_VARIABLES: Record<string, string[]> = {
  PLAN_CHANGE_REQUESTED: ["tenantName", "fromPlan", "toPlan", "requestedBy", "reason"],
  PLAN_CHANGE_APPROVED: ["tenantName", "newPlan", "reviewerName"],
  PLAN_CHANGE_REJECTED: ["tenantName", "requestedPlan", "reviewerName", "reason"],
  NEW_TENANT_SIGNUP: ["tenantName", "industry", "plan", "signupUrl"],
  BULK_UPLOAD_COMPLETED: ["userName", "fileCount", "successCount", "failureCount"],
  SEAT_LIMIT_REACHED: ["tenantName", "currentSeats", "planLimit", "plan"],
  INTERVIEW_FEEDBACK_NEW: ["candidateName", "jobTitle", "panelistName", "recommendation"],
  SYSTEM: ["userName"],
};

// ─── GET /internal/email-templates ──────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const rows = await prisma.emailTemplate.findMany({
      where: { tenantId },
      orderBy: { type: "asc" },
    });
    ok(res, {
      templates: rows,
      availableTypes: TEMPLATE_TYPES,
      variables: TEMPLATE_VARIABLES,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/email-templates/:type ────────────────────────────────────
router.get("/:type", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const type = req.params["type"] as string;
    if (!TEMPLATE_TYPES.includes(type as any)) throw Errors.validation("Unknown template type");

    const template = await prisma.emailTemplate.findUnique({
      where: { tenantId_type: { tenantId, type } },
    });
    if (!template) throw Errors.notFound("Template");
    ok(res, { ...template, variables: TEMPLATE_VARIABLES[type] ?? [] });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /internal/email-templates/:type ────────────────────────────────────
const UpsertSchema = z.object({
  subject: z.string().min(1).max(200),
  bodyHtml: z.string().max(50_000),
  bodyText: z.string().max(50_000),
  enabled: z.boolean().optional(),
});

router.put("/:type", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const type = req.params["type"] as string;
    if (!TEMPLATE_TYPES.includes(type as any)) throw Errors.validation("Unknown template type");

    const body = UpsertSchema.parse(req.body);

    // Validate the template references only known variables for this type.
    // We don't reject unknown vars hard (forward compat) but we surface them
    // as warnings so the frontend can highlight typos.
    const known = new Set(TEMPLATE_VARIABLES[type] ?? []);
    const referenced = extractVariables(`${body.subject} ${body.bodyHtml} ${body.bodyText}`);
    const unknown = [...referenced].filter((v) => !known.has(v));

    const data = {
      subject: body.subject,
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText,
      enabled: body.enabled ?? true,
      variables: [...known],
    };
    const template = await prisma.emailTemplate.upsert({
      where: { tenantId_type: { tenantId, type } },
      create: { tenantId, type, ...data },
      update: data,
    });

    if (unknown.length > 0) {
      res.setHeader("X-Template-Warnings", `unknown-vars:${unknown.join(",")}`);
    }
    created(res, { ...template, unknownVariables: unknown });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /internal/email-templates/:type ─────────────────────────────────
router.delete("/:type", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const type = req.params["type"] as string;
    await prisma.emailTemplate
      .delete({ where: { tenantId_type: { tenantId, type } } })
      .catch(() => { /* idempotent — already deleted is fine */ });
    ok(res, { reverted: type });
  } catch (err) {
    next(err);
  }
});

// ─── POST /internal/email-templates/:type/preview ───────────────────────────
// Renders the template with sample variables so the tenant can see what
// the email actually looks like before saving. Falls back to the system
// defaults if no template exists yet — gives a "compare new vs old" preview.
router.post("/:type/preview", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);
    const type = req.params["type"] as string;
    if (!TEMPLATE_TYPES.includes(type as any)) throw Errors.validation("Unknown template type");

    const previewBody = z
      .object({
        subject: z.string().optional(),
        bodyHtml: z.string().optional(),
        bodyText: z.string().optional(),
        sampleVariables: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
      })
      .parse(req.body);

    const branding = await getTenantBranding(tenantId);
    const variables = previewBody.sampleVariables ?? sampleVariablesFor(type);

    const rendered = renderNotificationEmail({
      title: "Preview",
      body: previewBody.bodyText ?? "Sample body",
      branding,
      template: previewBody.subject
        ? {
            subject: substituteVariables(previewBody.subject, variables),
            bodyText: substituteVariables(previewBody.bodyText ?? "", variables),
            bodyHtml: substituteVariables(previewBody.bodyHtml ?? "", variables),
          }
        : null,
      variables,
    });
    ok(res, rendered);
  } catch (err) {
    next(err);
  }
});

// Extract {{var}} references from a string. Used to surface unknown vars.
function extractVariables(s: string): Set<string> {
  const set = new Set<string>();
  const re = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) set.add(m[1]!);
  return set;
}

// Sample variables shown when the tenant clicks Preview without supplying
// custom values — gives a realistic-looking email instead of "{{candidateName}}".
function sampleVariablesFor(type: string): Record<string, string> {
  const base: Record<string, string> = {
    tenantName: "Acme Corp",
    candidateName: "Alex Morgan",
    userName: "Jordan Lee",
    jobTitle: "Senior Software Engineer",
    panelistName: "Sam Patel",
    recommendation: "STRONG_HIRE",
    fromPlan: "FREE",
    toPlan: "PROFESSIONAL",
    requestedBy: "Jordan Lee",
    reason: "Need bulk-upload + AI screening for our 200-resume hiring sprint",
    newPlan: "PROFESSIONAL",
    requestedPlan: "ENTERPRISE",
    reviewerName: "Platform Admin",
    industry: "Software",
    plan: "PROFESSIONAL",
    signupUrl: "https://app.example.com/admin/tenants/acme",
    fileCount: "127",
    successCount: "124",
    failureCount: "3",
    currentSeats: "5",
    planLimit: "5",
  };
  return base;
}

export default router;
