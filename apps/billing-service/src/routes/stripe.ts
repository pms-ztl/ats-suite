/**
 * Phase 30 — Stripe self-serve subscription routes.
 *
 *   POST /internal/stripe/checkout    — create Checkout Session, return URL
 *   POST /internal/stripe/portal      — create Customer Portal Session, return URL
 *   GET  /internal/stripe/subscription — current subscription state for tenant
 *   POST /internal/stripe/webhook     — Stripe → us; mounted with raw body
 *
 * The webhook route is mounted separately (in app.ts) because Stripe's
 * signature verification requires the raw bytes — express.json() would
 * mangle them. Everything else uses the normal JSON-parsed routes.
 *
 * Idempotency: every webhook event is written to StripeWebhookEvent with
 * Stripe's evt_xxx id as the primary key. A duplicate delivery (Stripe
 * retries on 5xx) is a no-op on the second arrival.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import type Stripe from "stripe";
import { ok, Errors, getTenantId, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { getStripe, planToPriceId, priceIdToPlan, getCheckoutUrls, getWebhookSecret } from "../lib/stripe.js";

const router = Router();

// Self-serve catalog — keep the FE in sync via this list. Enterprise is
// intentionally omitted (custom contract via PlanChangeRequest).
const SELF_SERVE_PLANS = ["STARTER", "PROFESSIONAL"] as const;
const PlanSchema = z.enum(SELF_SERVE_PLANS);

// ─── helpers ─────────────────────────────────────────────────────────────

async function getTenantPlan(tenantId: string): Promise<string> {
  const cache = await prisma.tenantPlanCache.findUnique({ where: { tenantId } });
  return cache?.plan ?? "FREE";
}

/**
 * Look up the tenant's Stripe customer id, creating a Stripe Customer if
 * this is their first paid plan. The tenant-side `stripeCustomerId` field
 * is updated via a side-channel HTTP call to tenant-service so the next
 * checkout reuses the same customer (cards stay on file, invoices stay
 * grouped).
 */
async function ensureStripeCustomer(args: {
  tenantId: string;
  tenantName: string;
  adminEmail: string;
  existingCustomerId: string | null;
}): Promise<string> {
  if (args.existingCustomerId) return args.existingCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: args.adminEmail,
    name: args.tenantName,
    metadata: { tenantId: args.tenantId },
  });

  // Mirror back to tenant-service so future checkouts reuse the same customer.
  // Best-effort — if tenant-service is unreachable we still return the new
  // customer id so checkout proceeds; we'll write it on the next webhook.
  const tenantUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
  await fetch(`${tenantUrl}/internal/tenants/${args.tenantId}/stripe-customer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stripeCustomerId: customer.id }),
  }).catch(() => undefined);

  return customer.id;
}

/**
 * Fetch the tenant + the inviting admin's email from tenant-service +
 * identity-service. Used only by checkout to set the customer email on the
 * Stripe receipt — we DO NOT pre-fill payment details.
 */
async function fetchTenantMeta(tenantId: string, userId: string): Promise<{
  name: string;
  stripeCustomerId: string | null;
  adminEmail: string;
}> {
  const tenantUrl   = process.env["TENANT_SERVICE_URL"]   ?? "http://localhost:4002";
  const identityUrl = process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:4001";

  const [tRes, uRes] = await Promise.all([
    fetch(`${tenantUrl}/internal/tenants/${tenantId}`),
    fetch(`${identityUrl}/internal/users/${userId}`),
  ]);
  if (!tRes.ok) throw Errors.upstreamFailure("tenant", `Tenant lookup failed: ${tRes.status}`);
  if (!uRes.ok) throw Errors.upstreamFailure("identity", `User lookup failed: ${uRes.status}`);
  const tBody: any = await tRes.json();
  const uBody: any = await uRes.json();
  const t = tBody.data ?? tBody;
  const u = uBody.data ?? uBody;
  return {
    name:             t.name,
    stripeCustomerId: t.stripeCustomerId ?? null,
    adminEmail:       u.email,
  };
}

// ─── GET /internal/stripe/subscription ────────────────────────────────────
// Returns the StripeSubscription row for the caller's tenant (or null if
// they're on FREE / haven't bought a plan yet).
router.get("/subscription", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const sub = await prisma.stripeSubscription.findUnique({ where: { tenantId } });
    ok(res, sub);
  } catch (err) {
    next(err);
  }
});

// ─── POST /internal/stripe/checkout-for-request/:requestId ───────────────
// Phase 33a — Stripe Checkout is now gated behind super-admin approval.
//
// Required body: empty (target plan is read from the PlanChangeRequest).
// The endpoint:
//   1. Fetches the PlanChangeRequest from tenant-service
//   2. Confirms request belongs to caller's tenant
//   3. Confirms request.status = APPROVED AND paymentMethod = STRIPE
//   4. Confirms request.activatedAt is null (idempotency — can't pay twice)
//   5. Creates the Stripe Checkout session with metadata.planChangeRequestId
//      so the webhook can call /plan-changes/:id/activate on completion
//   6. Returns the Checkout URL
//
// Replaces Phase 30's POST /checkout which let any tenant admin self-serve
// without approval. That endpoint is removed — every paid plan change now
// flows through PlanChangeRequest first.
router.post(
  "/checkout-for-request/:requestId",
  requireTenantAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = req.headers["x-user-id"] as string | undefined;
      if (!userId) throw Errors.unauthorized("Missing user context");
      const requestId = req.params["requestId"];
      if (typeof requestId !== "string") throw Errors.validation("requestId required");

      // Pull the approved request from tenant-service.
      const request = await fetchPlanChangeRequest(requestId);
      if (request.tenantId !== tenantId) throw Errors.forbidden("Plan change request belongs to another tenant");
      if (request.status !== "APPROVED") throw Errors.validation(`Request must be APPROVED (currently ${request.status}); ask super-admin to approve first`);
      if (request.paymentMethod !== "STRIPE") throw Errors.validation(`Request payment method is ${request.paymentMethod}; no Stripe payment needed`);
      if (request.activatedAt) throw Errors.conflict("This plan was already activated; nothing to pay");

      const plan = request.toPlan as "STARTER" | "PROFESSIONAL";
      const priceId = planToPriceId(plan);
      if (!priceId) throw Errors.unavailable(`Stripe price not configured for ${plan}`);

      const meta = await fetchTenantMeta(tenantId, userId);
      const customerId = await ensureStripeCustomer({
        tenantId,
        tenantName: meta.name,
        adminEmail: meta.adminEmail,
        existingCustomerId: meta.stripeCustomerId,
      });

      const urls = getCheckoutUrls();
      const stripe = getStripe();
      const isFirstPaidSub = await isNewPaidSubscription(tenantId);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${urls.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: urls.cancelUrl,
        // CRITICAL: planChangeRequestId in metadata lets the webhook call
        // /plan-changes/:id/activate idempotently.
        metadata: { tenantId, plan, planChangeRequestId: requestId },
        subscription_data: {
          metadata: { tenantId, plan, planChangeRequestId: requestId },
          ...(isFirstPaidSub ? { trial_period_days: 14 } : {}),
        },
      });

      if (!session.url) throw Errors.upstreamFailure("stripe", "No checkout URL returned");
      ok(res, { url: session.url, requestId, plan });
    } catch (err) {
      next(err);
    }
  },
);

async function fetchPlanChangeRequest(id: string): Promise<{
  id: string;
  tenantId: string;
  toPlan: string;
  status: string;
  paymentMethod: string | null;
  activatedAt: string | null;
}> {
  const tenantUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
  const res = await fetch(`${tenantUrl}/internal/plan-changes/${id}`);
  if (!res.ok) throw Errors.upstreamFailure("tenant", `Plan change lookup failed: ${res.status}`);
  const body: any = await res.json();
  return body.data ?? body;
}

async function isNewPaidSubscription(tenantId: string): Promise<boolean> {
  const existing = await prisma.stripeSubscription.findUnique({ where: { tenantId } });
  return !existing;
}

// ─── POST /internal/stripe/portal ─────────────────────────────────────────
// Returns: { url } — Customer Portal Session for managing payment methods,
// downloading invoices, or cancelling.
router.post(
  "/portal",
  requireTenantAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const sub = await prisma.stripeSubscription.findUnique({ where: { tenantId } });
      if (!sub) throw Errors.notFound("Stripe subscription");

      const urls = getCheckoutUrls();
      const stripe = getStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: urls.successUrl.replace("?stripe=success", ""),
      });
      ok(res, { url: session.url });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Internal: process a webhook event ────────────────────────────────────
//
// Exported as `processWebhookEvent` so the app.ts raw-body handler can call
// it. Idempotent on Stripe's evt_xxx id — duplicates are no-ops.
export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  // Idempotency check — Stripe retries on any non-2xx, so the same evt_ id
  // can arrive multiple times.
  const existing = await prisma.stripeWebhookEvent.findUnique({ where: { id: event.id } });
  if (existing?.processedAt) return;

  // Try to extract tenantId from the event payload. customer.subscription.*
  // events carry the metadata we set at checkout creation; checkout.session.*
  // events carry it in metadata too. Best-effort — we still log the event
  // even if we can't resolve a tenant.
  let tenantId: string | null = null;
  const obj = event.data.object as any;
  if (obj?.metadata?.tenantId) {
    tenantId = obj.metadata.tenantId;
  }

  // Write the audit row first so even crashes during processing are visible.
  await prisma.stripeWebhookEvent.upsert({
    where: { id: event.id },
    create: {
      id: event.id,
      type: event.type,
      tenantId,
      livemode: event.livemode,
      payload: obj as any,
    },
    update: {},
  });

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await syncSubscription(obj as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(obj as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        // Stripe will retry automatically; we don't downgrade until the
        // subscription status itself transitions to past_due/unpaid, which
        // fires its own customer.subscription.updated event.
        break;
      case "checkout.session.completed":
        // The subscription created webhook will follow this within seconds
        // and do the actual sync; checkout.session.completed is informational.
        break;
      default:
        // Many event types we don't care about (price.updated, etc.).
        // Logging them all in StripeWebhookEvent is enough.
        break;
    }
    await prisma.stripeWebhookEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date(), processingError: null },
    });
  } catch (e: any) {
    await prisma.stripeWebhookEvent.update({
      where: { id: event.id },
      data: { processingError: e?.message ?? String(e) },
    });
    throw e;
  }
}

/**
 * Sync a Stripe Subscription into our StripeSubscription mirror + cascade
 * to TenantPlanCache + NATS so the rest of the platform reacts.
 */
async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const tenantId = (sub.metadata?.["tenantId"] ?? null) as string | null;
  if (!tenantId) return; // can't resolve — skip but the event row is preserved

  const item = sub.items.data[0];
  if (!item) return;
  const priceId = item.price.id;
  const plan = priceIdToPlan(priceId);

  // status mapping — Stripe statuses that should keep the tenant on the paid
  // plan: active, trialing. Everything else (past_due, unpaid, canceled,
  // incomplete) downgrades to FREE.
  const isPaidActive = sub.status === "active" || sub.status === "trialing";
  const effectivePlan = isPaidActive && plan ? plan : "FREE";

  // Stripe API returns current_period_end on subscription items (newer API);
  // fall back to the subscription-level field for older API versions.
  const periodEndUnix =
    (item as any).current_period_end ??
    (sub as any).current_period_end ??
    Math.floor(Date.now() / 1000);

  if (plan) {
    await prisma.stripeSubscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        stripeSubscriptionId: sub.id,
        plan,
        status: sub.status,
        currentPeriodEnd: new Date(periodEndUnix * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        stripePriceId: priceId,
      },
      update: {
        plan,
        status: sub.status,
        currentPeriodEnd: new Date(periodEndUnix * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        stripePriceId: priceId,
      },
    });
  }

  // Always keep TenantPlanCache in sync so existing fast-gates work even if
  // the tenant-service callback below fails (eventual consistency: the
  // tenant.plan-changed NATS event from tenant-service will re-sync it on
  // success). The cache write is local, fast, and idempotent.
  await prisma.tenantPlanCache.upsert({
    where: { tenantId },
    create: { tenantId, plan: effectivePlan },
    update: { plan: effectivePlan },
  });

  // Phase 33a — if the Checkout was created from an approved PlanChangeRequest
  // (metadata.planChangeRequestId), activate THAT request via tenant-service.
  // Activation atomically flips Tenant.plan + emits the canonical
  // tenant.plan-changed event. Idempotent on the tenant-service side.
  const planChangeRequestId = sub.metadata?.["planChangeRequestId"] as string | undefined;
  if (planChangeRequestId && isPaidActive) {
    await activatePlanChangeRequest(planChangeRequestId);
  } else {
    // Legacy / out-of-band sub (no request linkage) — fall back to the
    // direct plan-from-stripe call so old Phase 30 customers don't lose
    // service if their sub state mutates.
    await notifyTenantService(tenantId, effectivePlan, sub.status);
  }
}

async function activatePlanChangeRequest(requestId: string): Promise<void> {
  const tenantUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
  await fetch(`${tenantUrl}/internal/plan-changes/${requestId}/activate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  }).catch(() => undefined);
}

async function notifyTenantService(
  tenantId: string,
  plan: string,
  stripeStatus: string,
): Promise<void> {
  const tenantUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
  await fetch(`${tenantUrl}/internal/tenants/${tenantId}/plan-from-stripe`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, stripeStatus }),
  }).catch(() => undefined); // best-effort; webhook still succeeds on retry
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const tenantId = (sub.metadata?.["tenantId"] ?? null) as string | null;
  if (!tenantId) return;

  // Don't delete the StripeSubscription row — keep it for audit, just mark
  // canceled. Downgrade the plan cache to FREE.
  await prisma.stripeSubscription.update({
    where: { tenantId },
    data: { status: "canceled", cancelAtPeriodEnd: false },
  }).catch(() => undefined);

  await prisma.tenantPlanCache.upsert({
    where: { tenantId },
    create: { tenantId, plan: "FREE" },
    update: { plan: "FREE" },
  });

  await notifyTenantService(tenantId, "FREE", "canceled");
}

/**
 * Verify a webhook payload using the configured webhook secret, parse it,
 * and hand it to processWebhookEvent. Exported for app.ts where the raw
 * body is available.
 *
 * Throws if signature verification fails — caller should map to 400.
 */
export async function verifyAndProcess(rawBody: Buffer, signature: string): Promise<void> {
  const stripe = getStripe();
  const secret = getWebhookSecret();
  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  await processWebhookEvent(event);
}

export default router;
