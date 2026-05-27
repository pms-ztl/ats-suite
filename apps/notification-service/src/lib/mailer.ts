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

/** Build a minimal-but-branded HTML email from a notification. */
export function renderNotificationEmail(opts: {
  title: string;
  body?: string | null;
  link?: string | null;
}): { text: string; html: string } {
  const link = opts.link ?? "";
  const text =
    `${opts.title}\n\n` +
    `${opts.body ?? ""}\n\n` +
    (link ? `View: ${link}\n\n` : "") +
    `— CDC ATS\n`;
  const html =
    `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:24px auto;color:#1f2937;">
  <div style="border-bottom:2px solid #10b981;padding-bottom:8px;margin-bottom:16px;">
    <strong style="color:#10b981;font-size:18px;">CDC ATS</strong>
  </div>
  <h2 style="font-size:20px;margin:0 0 12px 0;">${escapeHtml(opts.title)}</h2>
  ${opts.body ? `<p style="line-height:1.5;">${escapeHtml(opts.body)}</p>` : ""}
  ${link ? `<p><a href="${escapeHtmlAttr(link)}" style="display:inline-block;background:#10b981;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">View in dashboard</a></p>` : ""}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="color:#6b7280;font-size:12px;">You're receiving this because you're a member of a CDC ATS workspace. Manage notifications in your account settings.</p>
</body></html>`;
  return { text, html };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function escapeHtmlAttr(s: string): string {
  return escapeHtml(s);
}
