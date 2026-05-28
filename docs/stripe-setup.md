# Stripe Self-Serve Setup (Phase 30)

This document walks through configuring Stripe for the self-serve plan
purchase flow at `/billing`. Enterprise plans are intentionally NOT
self-serve — they continue to go through the `PlanChangeRequest` approval
workflow because they require a contract.

## What you need

- A Stripe account (start with [test mode](https://dashboard.stripe.com/test/dashboard))
- The Stripe CLI (`brew install stripe/stripe-cli/stripe` or
  [download](https://stripe.com/docs/stripe-cli))

## Step 1 — Create products + prices

In the Stripe dashboard:

1. **Products → Add product**
   - Name: `CDC ATS Starter`
   - Pricing: Recurring · Monthly · `$299.00 USD`
2. **Products → Add product**
   - Name: `CDC ATS Professional`
   - Pricing: Recurring · Monthly · `$999.00 USD`

After creating each product, copy the `price_xxx` id (NOT the `prod_xxx`
id) — that's what goes in the env vars below.

## Step 2 — Enable Customer Portal

1. **Settings → Billing → Customer portal** → enable
2. In the portal settings, allow:
   - Update payment method
   - View invoice history
   - Cancel subscriptions (recommended: cancel at period end)
   - Switch plans → enable both Starter and Professional as switchable

## Step 3 — Get your API keys

**Settings → Developers → API keys**

- Secret key (`sk_test_…` or `sk_live_…`) → `STRIPE_SECRET_KEY`

## Step 4 — Set env vars

Add to your `.env` (see `.env.example` for the full block):

```bash
APP_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...        # next step
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
```

Restart `billing-service` after editing — it caches the Stripe client.

## Step 5 — Wire up webhooks

### Development (Stripe CLI)

```bash
stripe login
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

The CLI prints a webhook signing secret (`whsec_…`) — paste it into
`STRIPE_WEBHOOK_SECRET` and restart billing-service.

### Production

1. **Developers → Webhooks → Add endpoint**
2. URL: `https://<your-gateway-host>/api/stripe/webhook`
3. Events to send (minimum):
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `checkout.session.completed`
4. After creating the endpoint, click **Reveal signing secret** and copy
   the `whsec_…` value into `STRIPE_WEBHOOK_SECRET`.

## Step 6 — Smoke test

1. Sign in as a tenant admin
2. Go to `/billing`
3. Click **Start STARTER trial**
4. You'll be redirected to Stripe Checkout — use card `4242 4242 4242 4242`
   with any future expiry + any CVC
5. After completion you're redirected back to `/billing?stripe=success`;
   within ~2 seconds the page should show your active subscription and a
   **Manage subscription** button
6. Click **Manage subscription** to open the Customer Portal — verify you
   can switch plans, update payment methods, and cancel

## How it works (event flow)

```
[Browser]
  │  click "Start STARTER trial"
  ▼
POST /api/billing/stripe/checkout   (gateway → billing-service)
  │
  ▼  billing-service.ensureStripeCustomer
     creates Stripe Customer if first paid plan,
     writes Tenant.stripeCustomerId via tenant-service
  │
  ▼  stripe.checkout.sessions.create
[Stripe Checkout]
  │  user enters card, submits
  ▼
[Stripe] → POST /api/stripe/webhook   (raw body, signature verified)
  │
  ▼  billing-service.processWebhookEvent
     - upserts StripeSubscription row
     - upserts TenantPlanCache
     - PUT /internal/tenants/:id/plan-from-stripe → tenant-service
       updates Tenant.plan + emits canonical tenant.plan-changed NATS event
  │
  ▼
existing subscribers (billing cache refresh, notification email) react
identically to a manual plan change
```

## Idempotency

Every webhook event is written to `StripeWebhookEvent` with Stripe's
`evt_xxx` id as the primary key. If Stripe retries (which it does on any
non-2xx, with exponential backoff up to 3 days), our second handling is a
no-op — we check `processedAt` before doing any work.

## What about ENTERPRISE?

Enterprise pricing is custom (volume discounts, custom contracts, white-glove
onboarding). The billing page hides the Stripe self-serve cards once a
tenant is on ENTERPRISE; the **Request plan change** button stays available
so they can request a downgrade through the existing approval workflow.

The `/internal/tenants/:id/plan-from-stripe` endpoint refuses to touch
tenants on ENTERPRISE — a defensive guard in case a misconfigured webhook
ever tried to.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `503 Stripe is not configured` on click | `STRIPE_SECRET_KEY` unset | Set env var, restart billing-service |
| `400 Missing stripe-signature header` in webhook logs | Webhook hit a path other than `/api/stripe/webhook` | Use the gateway path, not billing-service's `/internal/stripe/webhook` directly |
| Webhook event marked failed in `StripeWebhookEvent.processingError` | tenant-service unreachable | Check `TENANT_SERVICE_URL`; cache will resync on next webhook |
| Plan stays FREE after checkout | Webhook not delivered | Check `stripe listen` is running (dev) or endpoint URL/secret (prod) |
| Trial doesn't get applied | Tenant already had a StripeSubscription row | `isNewPaidSubscription` returns false on second checkout — only first checkout gets the 14-day trial |
