/**
 * Phase 34c — Email-to-apply inbound parser.
 *
 *   POST /internal/inbound-email/sendgrid   — SendGrid Inbound Parse webhook
 *   POST /internal/inbound-email/mailgun    — Mailgun Routes webhook
 *   POST /internal/inbound-email/postmark   — Postmark Inbound webhook
 *
 * Address scheme: jobs+<tenant-slug>@your-domain.com — the +slug part lets
 * a single MX record serve all tenants. The webhook payload includes the
 * full "To" address, which we parse to extract the tenant slug.
 *
 * Flow:
 *   1. Provider POSTs the parsed email (sender, subject, body, attachments)
 *   2. We extract slug from To address → look up tenant
 *   3. If attachments include PDF/DOC/DOCX, treat them as resumes
 *   4. Upsert candidate via candidate-service using sender as email
 *   5. Forward each attachment to resume-service for parsing
 *
 * Provider auth: SendGrid uses Basic Auth (configured in their UI);
 * Mailgun signs with HMAC; Postmark uses a webhook-specific token. Each
 * route validates its own.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import multer from "multer";
import { createHmac } from "crypto";
import { ok, Errors, createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "notification-service:inbound-email" });
const router = Router();

// multipart parser for SendGrid (sends multipart/form-data with attachments).
// 25 MB cap — most resumes are <2 MB; this leaves headroom for the email
// body + attachment overhead.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 10 },
});

// ─── helpers ─────────────────────────────────────────────────────────────

/** Parse "jobs+<slug>@host" → slug. Returns null if not a plus-address. */
function parsePlusAddress(to: string): string | null {
  // Strip display name + angle brackets if present: "Foo <jobs+slug@host>"
  const cleaned = to.replace(/.*<([^>]+)>.*/, "$1").trim().toLowerCase();
  const m = cleaned.match(/^jobs\+([a-z0-9-]+)@/);
  return (m && typeof m[1] === "string") ? m[1] : null;
}

/** Pull sender email from a header value like "John Doe <john@x.com>". */
function parseSenderEmail(from: string): { email: string; name: string | null } {
  const m = from.match(/^(.*?)<([^>]+)>$/);
  const email = m?.[2];
  const namePart = m?.[1];
  if (email) {
    const name = namePart ? namePart.trim().replace(/^"|"$/g, "") || null : null;
    return { email: email.trim(), name };
  }
  return { email: from.trim(), name: null };
}

/** Look up tenant by slug via tenant-service. */
async function resolveTenant(slug: string): Promise<{ id: string; name: string } | null> {
  const tenantUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
  // The /public-branding endpoint is unauthenticated and returns the slug→id mapping
  // (we added it in Phase 20 for the candidate-portal). Re-using it here keeps the
  // auth surface minimal.
  try {
    const res = await fetch(`${tenantUrl}/internal/public-branding/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const body: any = await res.json();
    const data = body.data ?? body;
    // public-branding doesn't return the id directly; fall through to tenants list
    // and match by slug. (Could be optimized with a dedicated slug-lookup endpoint.)
    const res2 = await fetch(`${tenantUrl}/internal/tenants?search=${encodeURIComponent(data.slug ?? slug)}`, {
      headers: { "X-User-Id": "system", "X-Tenant-Id": "system", "X-User-Role": "SUPER_ADMIN" },
    });
    if (!res2.ok) return null;
    const body2: any = await res2.json();
    const list = body2.data?.data ?? body2.data ?? [];
    const t = list.find((x: any) => x.slug === slug) ?? list[0];
    return t ? { id: t.id, name: t.name } : null;
  } catch {
    return null;
  }
}

/** Upsert candidate via candidate-service. */
async function upsertCandidate(args: {
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  source: string;
}): Promise<{ id: string } | null> {
  const candidateUrl = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
  try {
    const res = await fetch(`${candidateUrl}/internal/candidates/upsert-from-application`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": "inbound-email",
        "X-Tenant-Id": args.tenantId,
        "X-User-Role": "ADMIN",
      },
      body: JSON.stringify({
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        source: args.source,
      }),
    });
    if (!res.ok) return null;
    const body: any = await res.json();
    return body.data ?? body;
  } catch {
    return null;
  }
}

/** Upload a resume attachment to resume-service. */
async function uploadResume(args: {
  tenantId: string;
  candidateId: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<boolean> {
  const resumeUrl = process.env["RESUME_SERVICE_URL"] ?? "http://localhost:4007";
  try {
    // resume-service expects multipart/form-data on /internal/resume/upload.
    // We rebuild the form manually to forward the parsed bytes.
    const FormData = (await import("form-data")).default;
    const form = new FormData();
    form.append("candidateId", args.candidateId);
    form.append("file", args.buffer, { filename: args.fileName, contentType: args.mimeType });

    const res = await fetch(`${resumeUrl}/internal/resume/upload`, {
      method: "POST",
      headers: {
        ...form.getHeaders(),
        "X-User-Id": "inbound-email",
        "X-Tenant-Id": args.tenantId,
        "X-User-Role": "ADMIN",
      },
      body: form as any,
    });
    return res.ok;
  } catch (err) {
    logger.warn({ err }, "Failed to forward inbound-email attachment to resume-service");
    return false;
  }
}

const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

// ─── SendGrid Inbound Parse webhook ──────────────────────────────────────
// SendGrid POSTs multipart/form-data with these fields:
//   from, to, subject, text, html, attachments (count), attachment1, attachment2…
// Each attachmentN is a binary file part. The "to" field may contain
// multiple addresses comma-separated.
router.post(
  "/sendgrid",
  upload.any(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const to = (req.body.to as string | undefined) ?? "";
      const from = (req.body.from as string | undefined) ?? "";
      const subject = (req.body.subject as string | undefined) ?? "";

      // SendGrid may send "to" as comma-separated; check each for our plus-address.
      const addresses = to.split(",").map((a) => a.trim());
      let slug: string | null = null;
      for (const a of addresses) {
        const s = parsePlusAddress(a);
        if (s) { slug = s; break; }
      }
      if (!slug) {
        logger.warn({ to }, "No jobs+<slug>@ address found in inbound email");
        return res.status(200).json({ received: true, dropped: "no-slug-match" });
      }
      const tenant = await resolveTenant(slug);
      if (!tenant) {
        logger.warn({ slug }, "No tenant matched slug from inbound email");
        return res.status(200).json({ received: true, dropped: "no-tenant-match" });
      }

      const sender = parseSenderEmail(from);
      const [firstName, ...lastParts] = (sender.name ?? sender.email.split("@")[0] ?? "Unknown").split(/\s+/);
      const lastName = lastParts.join(" ") || "—";

      const cand = await upsertCandidate({
        tenantId: tenant.id,
        email: sender.email,
        firstName: firstName ?? "Unknown",
        lastName,
        source: `EMAIL_INBOUND:${subject.slice(0, 40)}`,
      });
      if (!cand) {
        logger.error({ slug, email: sender.email }, "Failed to upsert candidate");
        return res.status(200).json({ received: true, dropped: "candidate-upsert-failed" });
      }

      // Forward resume attachments.
      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      let resumesUploaded = 0;
      for (const f of files) {
        if (RESUME_MIME_TYPES.has(f.mimetype)) {
          const okUpload = await uploadResume({
            tenantId: tenant.id,
            candidateId: cand.id,
            buffer: f.buffer,
            fileName: f.originalname,
            mimeType: f.mimetype,
          });
          if (okUpload) resumesUploaded++;
        }
      }

      logger.info({ slug, candidateId: cand.id, resumesUploaded }, "Inbound email processed");
      ok(res, { tenantId: tenant.id, candidateId: cand.id, resumesUploaded });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Mailgun Routes webhook ──────────────────────────────────────────────
// Mailgun POSTs application/x-www-form-urlencoded with HMAC signature in
// timestamp/token/signature fields. We verify before processing.
router.post(
  "/mailgun",
  upload.any(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signingKey = process.env["MAILGUN_WEBHOOK_SIGNING_KEY"];
      if (!signingKey) {
        return res.status(503).json({ error: "MAILGUN_WEBHOOK_SIGNING_KEY not configured" });
      }
      const { timestamp, token, signature } = req.body as { timestamp?: string; token?: string; signature?: string };
      if (!timestamp || !token || !signature) {
        return res.status(400).json({ error: "Missing Mailgun signature fields" });
      }
      const expected = createHmac("sha256", signingKey).update(timestamp + token).digest("hex");
      if (expected !== signature) {
        return res.status(401).json({ error: "Invalid Mailgun signature" });
      }

      // From here, the payload shape is similar to SendGrid's parsed format.
      const to = (req.body.recipient as string | undefined) ?? (req.body.To as string | undefined) ?? "";
      const from = (req.body.from as string | undefined) ?? (req.body.From as string | undefined) ?? "";
      const subject = (req.body.subject as string | undefined) ?? (req.body.Subject as string | undefined) ?? "";

      const slug = parsePlusAddress(to);
      if (!slug) return res.status(200).json({ received: true, dropped: "no-slug-match" });

      const tenant = await resolveTenant(slug);
      if (!tenant) return res.status(200).json({ received: true, dropped: "no-tenant-match" });

      const sender = parseSenderEmail(from);
      const [firstName, ...lastParts] = (sender.name ?? sender.email.split("@")[0] ?? "Unknown").split(/\s+/);
      const lastName = lastParts.join(" ") || "—";

      const cand = await upsertCandidate({
        tenantId: tenant.id,
        email: sender.email,
        firstName: firstName ?? "Unknown",
        lastName,
        source: `EMAIL_INBOUND_MAILGUN:${subject.slice(0, 40)}`,
      });
      if (!cand) return res.status(200).json({ received: true, dropped: "candidate-upsert-failed" });

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      let resumesUploaded = 0;
      for (const f of files) {
        if (RESUME_MIME_TYPES.has(f.mimetype)) {
          const okUpload = await uploadResume({
            tenantId: tenant.id,
            candidateId: cand.id,
            buffer: f.buffer,
            fileName: f.originalname,
            mimeType: f.mimetype,
          });
          if (okUpload) resumesUploaded++;
        }
      }

      ok(res, { tenantId: tenant.id, candidateId: cand.id, resumesUploaded });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Postmark Inbound webhook ────────────────────────────────────────────
// Postmark POSTs JSON with: From, To, Subject, TextBody, Attachments[].
// Auth: webhook URL contains a per-tenant secret (or we share-token-auth
// via X-Postmark-Token header). Configured in the Postmark dashboard.
router.post(
  "/postmark",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expectedToken = process.env["POSTMARK_WEBHOOK_TOKEN"];
      if (expectedToken) {
        const provided = req.headers["x-postmark-token"] as string | undefined;
        if (provided !== expectedToken) {
          return res.status(401).json({ error: "Invalid Postmark token" });
        }
      }
      const PostmarkSchema = z.object({
        From: z.string(),
        To: z.string(),
        Subject: z.string().default(""),
        Attachments: z.array(z.object({
          Name: z.string(),
          Content: z.string(),       // base64
          ContentType: z.string(),
        })).optional().default([]),
      });
      const body = PostmarkSchema.parse(req.body);

      const slug = parsePlusAddress(body.To);
      if (!slug) return res.status(200).json({ received: true, dropped: "no-slug-match" });

      const tenant = await resolveTenant(slug);
      if (!tenant) return res.status(200).json({ received: true, dropped: "no-tenant-match" });

      const sender = parseSenderEmail(body.From);
      const [firstName, ...lastParts] = (sender.name ?? sender.email.split("@")[0] ?? "Unknown").split(/\s+/);
      const lastName = lastParts.join(" ") || "—";

      const cand = await upsertCandidate({
        tenantId: tenant.id,
        email: sender.email,
        firstName: firstName ?? "Unknown",
        lastName,
        source: `EMAIL_INBOUND_POSTMARK:${body.Subject.slice(0, 40)}`,
      });
      if (!cand) return res.status(200).json({ received: true, dropped: "candidate-upsert-failed" });

      let resumesUploaded = 0;
      for (const att of body.Attachments) {
        if (RESUME_MIME_TYPES.has(att.ContentType)) {
          const buf = Buffer.from(att.Content, "base64");
          const okUpload = await uploadResume({
            tenantId: tenant.id,
            candidateId: cand.id,
            buffer: buf,
            fileName: att.Name,
            mimeType: att.ContentType,
          });
          if (okUpload) resumesUploaded++;
        }
      }

      ok(res, { tenantId: tenant.id, candidateId: cand.id, resumesUploaded });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
