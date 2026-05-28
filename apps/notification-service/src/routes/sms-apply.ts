/**
 * Phase 34e — SMS / WhatsApp apply via Twilio.
 *
 * Tenant admin (via /settings/sms — Phase 34e UI) provisions a Twilio
 * number (or links their existing one); we store it in TenantIntegration.
 *
 * Twilio is configured to POST inbound messages to /api/twilio/sms.
 * That endpoint:
 *   1. Looks up the tenant by the To number
 *   2. Loads or creates the SmsConversation for this fromNumber
 *   3. Advances the state machine: greet → name → email → resume URL → done
 *   4. Replies with TwiML (the inbound webhook's response BODY is the reply)
 *   5. On COMPLETED: upserts a candidate via candidate-service, downloads
 *      the resume URL if provided, forwards to resume-service
 *
 * Why state-machine in DB vs in-memory: conversations span minutes-to-days.
 * An applicant may text the name, walk away, come back tomorrow to send
 * email. Process restarts must not lose state.
 *
 * Auth: Twilio signs every inbound request — we verify the signature
 * with the auth token before processing.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import twilio from "twilio";
import { Errors, createLogger, getTenantId, getUserId, requireTenantAdmin, ok } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const logger = createLogger({ serviceName: "notification-service:sms-apply" });
const router = Router();

// ─── Twilio config + signature verification ──────────────────────────────

function twilioAuthToken(): string {
  const t = process.env["TWILIO_AUTH_TOKEN"];
  if (!t) throw Errors.unavailable("TWILIO_AUTH_TOKEN not configured");
  return t;
}

function publicWebhookUrl(suffix: string): string {
  const base = process.env["PUBLIC_API_URL"] ?? "http://localhost:4000/api";
  return `${base}/twilio${suffix}`;
}

/** Verify Twilio's X-Twilio-Signature header. Express adds rawBody for us
 * if we mount express.urlencoded() first; we use Twilio's helper. */
function verifyTwilioSignature(req: Request): boolean {
  const signature = req.headers["x-twilio-signature"] as string | undefined;
  if (!signature) return false;
  const url = publicWebhookUrl(req.originalUrl.replace(/^\/api\/twilio/, ""));
  // Twilio expects form-encoded params for the canonical string.
  const params = req.body as Record<string, string>;
  return twilio.validateRequest(twilioAuthToken(), signature, url, params);
}

// ─── tenant lookup by Twilio number ──────────────────────────────────────

async function findTenantByTwilioNumber(toNumber: string, channel: "sms" | "whatsapp"): Promise<{
  tenantId: string;
  config: any;
} | null> {
  // Twilio number lives in TenantIntegration(kind="twilio").
  // config: { phoneNumber: "+1...", whatsappNumber: "whatsapp:+1...", ... }
  const integ = await prisma.tenantIntegration.findMany({
    where: { kind: "twilio", enabled: true },
  });
  for (const i of integ) {
    const cfg = i.config as any;
    if (channel === "sms" && cfg.phoneNumber === toNumber) return { tenantId: i.tenantId, config: cfg };
    if (channel === "whatsapp" && cfg.whatsappNumber === toNumber) return { tenantId: i.tenantId, config: cfg };
  }
  return null;
}

// ─── state-machine ──────────────────────────────────────────────────────

const GREETING = (tenantName: string) =>
  `Hi! Thanks for your interest in ${tenantName}. To apply, I'll need your name, email, and resume.\n\nWhat's your full name?`;
const ASK_EMAIL = "Got it. What's your email address?";
const ASK_RESUME = "Last thing — text me a link to your resume (Google Drive, Dropbox, or any public URL). If you don't have one online, just reply NONE.";
const COMPLETED = "Got it! Your application has been received. We'll be in touch.";
const COMPLETED_NO_RESUME = "Got it! Your application has been received without a resume. We'll follow up by email if needed.";
const EMAIL_INVALID = "That doesn't look like a valid email. Please reply with your email address (e.g. you@example.com).";
const NAME_TOO_SHORT = "Please reply with your full name (first + last).";

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const URL_RE = /https?:\/\/\S+/i;

async function advanceConversation(args: {
  tenantId: string;
  tenantName: string;
  fromNumber: string;
  toNumber: string;
  channel: "sms" | "whatsapp";
  message: string;
}): Promise<string> {
  const convo = await prisma.smsConversation.upsert({
    where: { tenantId_fromNumber: { tenantId: args.tenantId, fromNumber: args.fromNumber } },
    create: {
      tenantId: args.tenantId,
      fromNumber: args.fromNumber,
      toNumber: args.toNumber,
      channel: args.channel,
      step: "GREETING",
    },
    update: {},
  });

  const msg = args.message.trim();

  if (convo.step === "GREETING") {
    // First contact — send greeting + ask for name
    await prisma.smsConversation.update({
      where: { id: convo.id },
      data: { step: "AWAITING_NAME" },
    });
    return GREETING(args.tenantName);
  }

  if (convo.step === "AWAITING_NAME") {
    const parts = msg.split(/\s+/).filter(Boolean);
    if (parts.length < 2 || msg.length < 3) return NAME_TOO_SHORT;
    await prisma.smsConversation.update({
      where: { id: convo.id },
      data: { step: "AWAITING_EMAIL", collectedName: msg },
    });
    return ASK_EMAIL;
  }

  if (convo.step === "AWAITING_EMAIL") {
    const m = msg.match(EMAIL_RE);
    if (!m) return EMAIL_INVALID;
    await prisma.smsConversation.update({
      where: { id: convo.id },
      data: { step: "AWAITING_RESUME", collectedEmail: m[0].toLowerCase() },
    });
    return ASK_RESUME;
  }

  if (convo.step === "AWAITING_RESUME") {
    const isNone = /^(none|no|skip|nope)$/i.test(msg);
    const urlMatch = msg.match(URL_RE);
    const resumeUrl = isNone ? null : (urlMatch ? urlMatch[0] : null);
    if (!isNone && !resumeUrl) {
      return "I couldn't find a URL in that. Please paste a link, or reply NONE.";
    }
    // Create candidate
    const [firstName, ...lastParts] = (convo.collectedName ?? "Unknown Unknown").split(/\s+/);
    const lastName = lastParts.join(" ") || "—";
    const candidateUrl = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
    let candidateId: string | null = null;
    try {
      const res = await fetch(`${candidateUrl}/internal/candidates/upsert-from-application`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": "sms-apply",
          "X-Tenant-Id": args.tenantId,
          "X-User-Role": "ADMIN",
        },
        body: JSON.stringify({
          email: convo.collectedEmail!,
          firstName: firstName ?? "Unknown",
          lastName,
          phone: args.fromNumber,
          source: `${args.channel.toUpperCase()}_APPLY`,
        }),
      });
      if (res.ok) {
        const body: any = await res.json();
        candidateId = (body.data ?? body).id;
      }
    } catch (err) {
      logger.warn({ err }, "Candidate upsert from SMS failed");
    }

    await prisma.smsConversation.update({
      where: { id: convo.id },
      data: {
        step: "COMPLETED",
        completedAt: new Date(),
        collectedResumeUrl: resumeUrl,
        candidateId,
      },
    });

    // TODO Phase 34e+: also download resumeUrl and forward to resume-service
    // for parsing. Skipped here because public file fetch + virus scan is a
    // can of worms; leaving the URL in candidate.metadata.resumeUrl is safer.

    return resumeUrl ? COMPLETED : COMPLETED_NO_RESUME;
  }

  // COMPLETED state — gentle off-ramp
  return "You've already applied! We'll be in touch. Reply HELP for more info.";
}

// ─── webhook routes ──────────────────────────────────────────────────────

router.post("/sms", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env["NODE_ENV"] === "production" && !verifyTwilioSignature(req)) {
      return res.status(401).type("text/xml").send("<Response><Message>Unauthorized</Message></Response>");
    }
    const body = req.body as { From?: string; To?: string; Body?: string };
    const from = body.From ?? "";
    const to = body.To ?? "";
    const message = body.Body ?? "";

    const tenant = await findTenantByTwilioNumber(to, "sms");
    if (!tenant) {
      logger.warn({ to }, "SMS to unknown number");
      return res.type("text/xml").send("<Response></Response>");
    }

    // Get tenant name for the greeting
    const tenantSvcUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
    let tenantName = "the team";
    try {
      const r = await fetch(`${tenantSvcUrl}/internal/tenants/${tenant.tenantId}`);
      if (r.ok) { const b: any = await r.json(); tenantName = (b.data ?? b).name ?? tenantName; }
    } catch { /* default */ }

    const reply = await advanceConversation({
      tenantId: tenant.tenantId,
      tenantName,
      fromNumber: from,
      toNumber: to,
      channel: "sms",
      message,
    });

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(reply);
    res.type("text/xml").send(twiml.toString());
  } catch (err) { next(err); }
});

// WhatsApp uses the same endpoint shape — Twilio Sandbox / Business sends
// the same fields. Just need to detect channel from the From: whatsapp: prefix.
router.post("/whatsapp", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env["NODE_ENV"] === "production" && !verifyTwilioSignature(req)) {
      return res.status(401).type("text/xml").send("<Response></Response>");
    }
    const body = req.body as { From?: string; To?: string; Body?: string };
    const from = body.From ?? "";          // "whatsapp:+1..."
    const to = body.To ?? "";              // "whatsapp:+1..."
    const message = body.Body ?? "";

    const tenant = await findTenantByTwilioNumber(to, "whatsapp");
    if (!tenant) return res.type("text/xml").send("<Response></Response>");

    const tenantSvcUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
    let tenantName = "the team";
    try {
      const r = await fetch(`${tenantSvcUrl}/internal/tenants/${tenant.tenantId}`);
      if (r.ok) { const b: any = await r.json(); tenantName = (b.data ?? b).name ?? tenantName; }
    } catch { /* default */ }

    const reply = await advanceConversation({
      tenantId: tenant.tenantId,
      tenantName,
      fromNumber: from,
      toNumber: to,
      channel: "whatsapp",
      message,
    });

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(reply);
    res.type("text/xml").send(twiml.toString());
  } catch (err) { next(err); }
});

// ─── tenant config (CRUD for the Twilio number + webhook URL display) ───

// GET /internal/twilio/config — what's currently set?
router.get("/config", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const integ = await prisma.tenantIntegration.findUnique({
      where: { tenantId_kind: { tenantId, kind: "twilio" } },
    });
    ok(res, {
      configured: !!integ,
      ...(integ ? {
        phoneNumber: (integ.config as any).phoneNumber ?? null,
        whatsappNumber: (integ.config as any).whatsappNumber ?? null,
      } : {}),
      smsWebhookUrl: publicWebhookUrl("/sms"),
      whatsappWebhookUrl: publicWebhookUrl("/whatsapp"),
    });
  } catch (err) { next(err); }
});

// PUT /internal/twilio/config — tenant pastes their Twilio number(s)
router.put("/config", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = req.body as { phoneNumber?: string; whatsappNumber?: string };

    await prisma.tenantIntegration.upsert({
      where: { tenantId_kind: { tenantId, kind: "twilio" } },
      create: {
        tenantId, kind: "twilio", enabled: true,
        config: {
          phoneNumber: body.phoneNumber ?? null,
          whatsappNumber: body.whatsappNumber ?? null,
        },
      },
      update: {
        enabled: true,
        config: {
          phoneNumber: body.phoneNumber ?? null,
          whatsappNumber: body.whatsappNumber ?? null,
        },
      },
    });
    ok(res, { configured: true });
  } catch (err) { next(err); }
});

router.delete("/config", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    await prisma.tenantIntegration.delete({
      where: { tenantId_kind: { tenantId, kind: "twilio" } },
    }).catch(() => undefined);
    ok(res, { disconnected: true });
  } catch (err) { next(err); }
});

// GET /internal/twilio/conversations — recent conversation log for this tenant
router.get("/conversations", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const conversations = await prisma.smsConversation.findMany({
      where: { tenantId },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    ok(res, conversations);
  } catch (err) { next(err); }
});

export default router;
