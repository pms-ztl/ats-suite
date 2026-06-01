"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, Zap, Building2, Rocket, Crown,
  Brain, Shield, BarChart3, Users, Sparkles,
  ArrowRight, ChevronDown, ChevronUp,
} from "lucide-react";

// ── Plan definitions ────────────────────────────────────────────────────────
const PLANS = [
  {
    id:    "FREE",
    name:  "Free",
    icon:  Rocket,
    color: "text-muted-foreground",
    monthlyPrice: 0,
    yearlyPrice:  0,
    description:  "Explore the platform. Great for small teams just getting started.",
    badge:        null,
    features: [
      "Up to 3 active job postings",
      "50 candidate applications/mo",
      "Basic AI resume screening",
      "1 recruiter seat",
      "Candidate portal",
      "Email support",
    ],
    limits: {
      seats: 1,
      jobs:  3,
      candidates: 50,
    },
    cta:    "Get started free",
    href:   "/get-started?plan=FREE",
  },
  {
    id:    "STARTER",
    name:  "Starter",
    icon:  Zap,
    color: "text-blue-500",
    monthlyPrice: 149,
    yearlyPrice:  119,
    description:  "For growing companies that need AI-powered hiring at scale.",
    badge:        "Most popular",
    features: [
      "Up to 20 active job postings",
      "500 candidate applications/mo",
      "Full AI screening + scoring",
      "5 recruiter seats",
      "Interview scheduling agent",
      "Bias detection & EEOC reports",
      "Offer management",
      "Priority email support",
    ],
    limits: {
      seats: 5,
      jobs:  20,
      candidates: 500,
    },
    cta:    "Start 14-day trial",
    href:   "/get-started?plan=STARTER",
  },
  {
    id:    "PROFESSIONAL",
    name:  "Professional",
    icon:  Crown,
    color: "text-primary",
    monthlyPrice: 399,
    yearlyPrice:  319,
    description:  "Advanced AI agents, compliance automation, and analytics.",
    badge:        "Recommended",
    features: [
      "Unlimited job postings",
      "Unlimited candidates",
      "All 12 AI agents active",
      "15 recruiter seats",
      "Full compliance & GDPR suite",
      "Internal mobility engine",
      "Advanced analytics dashboard",
      "Custom integrations (ATS, HRIS)",
      "Dedicated CSM",
      "SLA: 99.9% uptime",
    ],
    limits: {
      seats: 15,
      jobs: -1,
      candidates: -1,
    },
    cta:    "Start 14-day trial",
    href:   "/get-started?plan=PROFESSIONAL",
  },
  {
    id:    "ENTERPRISE",
    name:  "Enterprise",
    icon:  Building2,
    color: "text-amber-500",
    monthlyPrice: null,  // custom
    yearlyPrice:  null,
    description:  "Custom contracts, dedicated infra, SSO, and white-labeling.",
    badge:        null,
    features: [
      "Everything in Professional",
      "Unlimited seats",
      "Dedicated cloud infrastructure",
      "White-label & custom domain",
      "SAML/OKTA SSO",
      "Custom AI model fine-tuning",
      "On-premise deployment option",
      "Custom SLA & DPA",
      "24/7 phone support",
      "Dedicated implementation team",
    ],
    limits: {
      seats: -1,
      jobs: -1,
      candidates: -1,
    },
    cta:    "Contact sales",
    href:   "mailto:sales@cdc-ats.com",
  },
] as const;

// ── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrades take effect immediately and you're billed prorated. Downgrades apply at the next billing cycle.",
  },
  {
    q: "What happens after the 14-day trial?",
    a: "You'll receive a reminder 3 days before your trial ends. If you don't add a payment method, your account moves to the Free plan — your data is never deleted.",
  },
  {
    q: "Is my data isolated from other customers?",
    a: "Absolutely. Every tenant gets full row-level database isolation and a dedicated encryption key. We also support data-residency selection (US, EU, APAC).",
  },
  {
    q: "Do you offer GDPR / EEOC compliance?",
    a: "Yes — GDPR data erasure, consent management, right-to-access exports, and full EEOC adverse-impact reporting are included on all paid plans.",
  },
  {
    q: "Can I white-label the candidate portal?",
    a: "White-labeling (custom domain, logo, brand colors) is available on the Enterprise plan.",
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/40 glass-surface">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary glow-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="font-bold text-sm">CDC ATS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/get-started">
              <Button size="sm" className="glow-primary">Get started free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            AI-Powered Hiring Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            One platform for every stage of hiring — from first post to final offer.
            No hidden fees. Cancel any time.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-muted/40 p-1 px-2">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                !yearly ? "bg-background shadow text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all flex items-center gap-2",
                yearly ? "bg-background shadow text-foreground" : "text-muted-foreground"
              )}
            >
              Yearly
              <span className="text-xs text-emerald-500 font-semibold">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Plan cards ──────────────────────────────────────────────────── */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isPro = plan.id === "PROFESSIONAL";

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6 transition-shadow",
                  isPro
                    ? "border-primary/60 bg-primary/5 shadow-[0_0_0_1px_oklch(var(--primary)/0.3),0_8px_32px_-8px_oklch(var(--primary)/0.25)]"
                    : "border-border/60 bg-card glass-hover"
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold border",
                        isPro
                          ? "bg-primary text-primary-foreground border-transparent"
                          : "bg-blue-500 text-white border-transparent"
                      )}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={cn("h-5 w-5", plan.color)} />
                  <span className="font-semibold text-sm">{plan.name}</span>
                </div>

                {/* Price */}
                <div className="mb-3">
                  {price === null ? (
                    <p className="text-3xl font-extrabold">Custom</p>
                  ) : price === 0 ? (
                    <p className="text-3xl font-extrabold">Free</p>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-extrabold">${price}</span>
                      <span className="text-muted-foreground text-sm mb-1">/mo</span>
                    </div>
                  )}
                  {yearly && price !== null && price > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">billed annually</p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                  {plan.description}
                </p>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={cn(
                    "block text-center rounded-lg py-2 text-sm font-semibold mb-5 transition-all",
                    isPro
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
                      : "border border-border hover:bg-accent"
                  )}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {(plan.features as readonly string[]).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Feature comparison strip ─────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/20 border-y border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Every plan includes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: Brain,    label: "12 AI agents" },
              { icon: Shield,   label: "GDPR compliant" },
              { icon: BarChart3, label: "Analytics" },
              { icon: Users,    label: "Candidate portal" },
              { icon: Sparkles, label: "Bias detection" },
              { icon: Zap,      label: "API access" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-sm font-medium text-left gap-4"
                >
                  <span>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-10">
            <h2 className="text-2xl font-bold mb-3">Ready to transform your hiring?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Join 500+ companies using CDC ATS to hire faster with AI.
            </p>
            <Link href="/get-started">
              <Button className="glow-primary gap-2">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-8 px-4 text-center text-xs text-muted-foreground">
        <div className="flex flex-wrap justify-center gap-6 mb-3">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/transparency" className="hover:text-foreground transition-colors">AI Transparency</Link>
          <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} CDC ATS. All rights reserved.</p>
      </footer>
    </div>
  );
}
