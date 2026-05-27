/**
 * SMTP mailer — uses nodemailer with a single global transport.
 *
 * SMTP_URL env (e.g. smtp://user:pass@host:587) configures the transport.
 * For local dev, use Mailpit (docker-compose) — SMTP_URL=smtp://mailpit:1025.
 *
 * When SMTP_URL is unset, sendEmail logs+returns false instead of throwing
 * so dev without SMTP keeps working (deliveries marked FAILED, not crashed).
 */
import nodemailer, { type Transporter } from "nodemailer";
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "notification-service:mailer" });

let transport: Transporter | null = null;

function getTransport(): Transporter | null {
  if (transport) return transport;
  const url = process.env["SMTP_URL"];
  if (!url) return null;
  try {
    transport = nodemailer.createTransport(url);
    return transport;
  } catch (err) {
    logger.error({ err }, "Failed to construct nodemailer transport");
    return null;
  }
}

export interface SendEmailInput {
  to: string;
  subject: string;
  /** Plaintext body. */
  text: string;
  /** Optional HTML body — falls back to text-only when omitted. */
  html?: string;
  /** Override From: header. Defaults to SMTP_FROM env or "noreply@cdc-ats.local" */
  from?: string;
}

export interface SendEmailResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const t = getTransport();
  if (!t) {
    return { ok: false, error: "SMTP_URL not configured" };
  }
  const from = input.from ?? process.env["SMTP_FROM"] ?? "noreply@cdc-ats.local";
  try {
    const info = await t.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
    });
    logger.info({ messageId: info.messageId, to: input.to }, "email sent");
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err, to: input.to }, "email send failed");
    return { ok: false, error: message };
  }
}

/**
 * Tenant branding applied to an outgoing email.
 *
 * All fields optional — the default is "CDC ATS green" so emails without
 * a branded tenant still look polished. Sourced by the delivery worker
 * from a 60s in-process cache keyed on tenantId (see branding-cache.ts).
 */
export interface TenantBranding {
  companyName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  website?: string | null;
}

/**
 * A tenant-customized email template fetched from the EmailTemplate table.
 * `bodyText`/`bodyHtml`/`subject` may contain `{{varName}}` placeholders
 * that get substituted from `variables`.
 */
export interface EmailTemplateOverride {
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

/**
 * Mustache-lite substitution: only flat keys, no nested objects, no helpers.
 * Unknown keys are replaced with an empty string (rather than left as
 * `{{foo}}` literal) so emails never leak internal variable names if
 * the template author forgets to set one.
 */
export function substituteVariables(template: string, variables: Record<string, string | number | null | undefined>): string {
  return template.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_, key) => {
    const v = variables[key];
    return v === null || v === undefined ? "" : String(v);
  });
}

/**
 * Build a branded HTML email. When a tenant override is provided, its
 * subject/body trump the auto-generated content but tenant branding (logo,
 * color, company name) still wraps the email so the visual identity is
 * consistent across templates.
 */
export function renderNotificationEmail(opts: {
  title: string;
  body?: string | null;
  link?: string | null;
  branding?: TenantBranding | null;
  /** Per-tenant template override (already substituted, ready to use). */
  template?: EmailTemplateOverride | null;
  /** Variables to substitute into title/body/link if no template override. */
  variables?: Record<string, string | number | null | undefined>;
}): { subject: string; text: string; html: string } {
  const branding = opts.branding ?? {};
  const primaryColor = branding.primaryColor || "#10b981";
  const companyName = branding.companyName || "CDC ATS";
  const logoUrl = branding.logoUrl;
  const link = opts.link ?? "";

  // Pre-substitute variables in the title/body if no template provided.
  const vars = opts.variables ?? {};
  const substTitle = substituteVariables(opts.title, vars);
  const substBody = opts.body ? substituteVariables(opts.body, vars) : "";

  const subject = opts.template?.subject ?? substTitle;
  const bodyText = opts.template?.bodyText ?? substBody;
  const bodyHtml = opts.template?.bodyHtml ?? escapeHtml(substBody).replace(/\n/g, "<br/>");

  const text =
    `${subject}\n\n` +
    `${bodyText}\n\n` +
    (link ? `View: ${link}\n\n` : "") +
    `— ${companyName}\n`;

  const logoBlock = logoUrl
    ? `<img src="${escapeHtmlAttr(logoUrl)}" alt="${escapeHtmlAttr(companyName)}" style="max-height:36px;max-width:180px;display:block;">`
    : `<strong style="color:${primaryColor};font-size:18px;">${escapeHtml(companyName)}</strong>`;

  const html =
    `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:24px auto;color:#1f2937;background:#ffffff;">
  <div style="border-bottom:2px solid ${escapeCssColor(primaryColor)};padding-bottom:8px;margin-bottom:16px;">
    ${logoBlock}
  </div>
  <h2 style="font-size:20px;margin:0 0 12px 0;color:#111827;">${escapeHtml(subject)}</h2>
  ${bodyHtml ? `<div style="line-height:1.6;color:#374151;">${bodyHtml}</div>` : ""}
  ${link ? `<p style="margin-top:24px;"><a href="${escapeHtmlAttr(link)}" style="display:inline-block;background:${escapeCssColor(primaryColor)};color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:500;">View in dashboard</a></p>` : ""}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="color:#6b7280;font-size:12px;">You're receiving this because you're a member of the ${escapeHtml(companyName)} workspace on CDC ATS. Manage notifications in your account settings.</p>
</body></html>`;
  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function escapeHtmlAttr(s: string): string {
  return escapeHtml(s);
}
/**
 * Defensive CSS-color sanitizer — only allows hex colors (3/6/8 digit) so
 * a malformed tenant input can't inject CSS like `red;background:url(...)`.
 * Falls back to default green if input is suspicious.
 */
function escapeCssColor(s: string): string {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s) ? s : "#10b981";
}
