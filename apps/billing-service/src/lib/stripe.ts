/**
 * Phase 30 — Stripe SDK setup + plan/price mapping.
 *
 * Stripe configuration is driven entirely from env vars so we can move
 * between test/live mode (and rotate keys) without code changes:
 *
 *   STRIPE_SECRET_KEY           sk_test_… or sk_live_…
 *   STRIPE_WEBHOOK_SECRET       whsec_… — used to verify webhook signatures
 *   STRIPE_PRICE_STARTER        price_… for the STARTER monthly tier
 *   STRIPE_PRICE_PROFESSIONAL   price_… for the PROFESSIONAL monthly tier
 *   STRIPE_SUCCESS_URL          where to redirect after successful checkout
 *                               (defaults to {APP_URL}/billing?stripe=success)
 *   STRIPE_CANCEL_URL           where to redirect on checkout cancel
 *                               (defaults to {APP_URL}/billing?stripe=cancel)
 *
 * If STRIPE_SECRET_KEY is unset, getStripe() throws — callers wrap that in
 * a 503 so dev can still boot without Stripe configured. Webhook signature
 * verification is non-negotiable: an unsigned webhook is rejected even in
 * dev mode (the alternative is a footgun where a stale env var silently
 * disables auth in production).
 */
import Stripe from "stripe";
import { Errors } from "@cdc-ats/common";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) {
    throw Errors.unavailable("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  // Lock to a known API version so Stripe's autoupdating types don't shift
  // under us. Bump intentionally when we test a newer version end-to-end.
  _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  return _stripe;
}

/**
 * Map a Stripe price id back to our internal plan name. Self-serve only
 * supports STARTER + PROFESSIONAL — ENTERPRISE still flows through the
 * PlanChangeRequest approval workflow because it needs a contract.
 */
export function priceIdToPlan(priceId: string): "STARTER" | "PROFESSIONAL" | null {
  const starter = process.env["STRIPE_PRICE_STARTER"];
  const pro     = process.env["STRIPE_PRICE_PROFESSIONAL"];
  if (priceId === starter) return "STARTER";
  if (priceId === pro)     return "PROFESSIONAL";
  return null;
}

/**
 * Inverse of priceIdToPlan — used when building Checkout sessions from a
 * plan name selected in the UI. Returns null when the plan isn't sellable
 * via self-serve (FREE, ENTERPRISE).
 */
export function planToPriceId(plan: string): string | null {
  switch (plan) {
    case "STARTER":      return process.env["STRIPE_PRICE_STARTER"] ?? null;
    case "PROFESSIONAL": return process.env["STRIPE_PRICE_PROFESSIONAL"] ?? null;
    default:             return null;
  }
}

export interface CheckoutUrls {
  successUrl: string;
  cancelUrl:  string;
}

export function getCheckoutUrls(): CheckoutUrls {
  const appUrl = process.env["APP_URL"] ?? "http://localhost:3000";
  return {
    successUrl: process.env["STRIPE_SUCCESS_URL"] ?? `${appUrl}/billing?stripe=success`,
    cancelUrl:  process.env["STRIPE_CANCEL_URL"]  ?? `${appUrl}/billing?stripe=cancel`,
  };
}

export function getWebhookSecret(): string {
  const s = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!s) throw Errors.unavailable("STRIPE_WEBHOOK_SECRET is not configured.");
  return s;
}
