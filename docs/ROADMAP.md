# CDC ATS Roadmap

Where we are, what shipped, what's planned, what we explicitly won't do.
Update this in every PR that closes or opens a roadmap item.

**Last updated:** 2026-05-28 (after Phase 32f)
**Repo:** `D:\CDC\ATS` (10-microservice monorepo + Next.js frontend)

---

## Current status (honest)

| Dimension | Score | Notes |
|---|---|---|
| Functional | **~90%** | Core hiring flows + AI agents + billing + auth all work end-to-end. Some niceties (changelog, product analytics) missing. |
| AI-powered | **100%** | 12 real Claude agents via OpenRouter/Anthropic. Cost dashboard live. |
| Agentic | **35%** | Single-call agents with prompts, no ReAct loop, no agent memory. |
| Production-ready | **85%** | Backups + alerts + impersonation + SOC 2 docs all present. Missing: external pen test, SOC 2 attestation, per-tenant rate limits. |
| Procurement-ready | **75%** | SECURITY.md + ACCESSIBILITY.md + LOAD_TESTING.md + BACKUP.md + OPERATIONS.md all present. Missing: SOC 2 Type II, external pen test report. |

---

## §1 — Completed phases

Every phase has a git commit; SHA is canonical.

| Phase | What shipped | Commit |
|---|---|---|
| 0–6  | Monorepo + 10 services + frontend cutover | (see batch commits) |
| 7a–b | UI page sweep + K8s manifests + CI | |
| 8 | Production hardening | |
| 9 | Observability dashboards + real LLM via OpenRouter | |
| 10 | Email + Slack notification delivery | |
| 11 | AI cost + ops dashboard | |
| 12 | Frontend integrations UI | |
| 13 | Realistic seed data + demo flow | |
| 14 | HITL infrastructure | |
| 15 | Auth polish — forgot password + MFA + password change | |
| 16 | Frontend UI for auth-polish + HITL | |
| 17 | Outbox pattern for NATS | |
| 18 | GDPR export + delete per candidate | |
| 19 | Production frontend build | |
| 20 | Tenant self-service config | |
| 21 | Super-admin platform control plane | |
| 22 | Phase 21 honest gap closure | |
| 23 | Tier-3 staff workflows | |
| 24 | Cross-tenant isolation pen test (10/10 PASS) | |
| 25 | Production deployment | |
| 26 | Demo walkthrough + screenshots | |
| 27 | TOCTOU + requireRole audit applied to microservices | `55f598e` `eb2879b` `c4946d5` |
| 27.6 | Pen test re-verified post-repo-rename | `79e6cad` |
| 28 | Enterprise SSO (SAML 2.0 + OIDC) with JIT | `e11e7da` |
| 29 | First-run tenant onboarding wizard | `1487a72` |
| 30 | Stripe self-serve plan purchase | `0b5ea46` |
| 31a–e | Invite emails, email verification, tenant export, alerts, backup runbook | `508e3f4` |
| 32a–f | Impersonation, support tickets, audit viewer, SECURITY.md, k6 + SLO, axe a11y | `24687e7` |
| 33a–c | Gate Stripe behind super-admin approval; super-admin notify on every plan-changed event; public candidate-portal tenant branding | `a5fcbbb` |

---

## §2 — Phase 33 candidates (next work)

Ordered by procurement / ship-blocker impact. Pick one or several; the
list is *honest* — every item here is a real gap, not busywork.

### Tier 1 — fixes followups from prior phases

These are explicit known gaps surfaced (and documented) during 31/32.
Fast wins. Probably 1-2 days each.

| # | Gap | From | Effort |
|---|---|---|---|
| 33a | Email notifications on new support ticket replies (customer + super-admin) | 32b followup | 0.5d |
| 33b | Per-tenant API rate limits at gateway | SECURITY.md known gap | 1d |
| 33c | Brand-color contrast validation in PUT /api/branding | ACCESSIBILITY.md known gap | 0.5d |
| 33d | Chart `<title>` + `<figcaption>` for screen-reader chart access | ACCESSIBILITY.md known gap | 1d |
| 33e | Toast a11y — `aria-live="polite"`, no time limit | ACCESSIBILITY.md known gap | 0.5d |
| 33f | Authenticated pages in a11y scan (login fixture) | ACCESSIBILITY.md known gap | 1d |
| 33g | k6 soak.js + stress.js + spike.js profiles | LOAD_TESTING.md placeholder | 1d |
| 33h | `notification_delivery_queue_size` Prometheus gauge so the EmailDeliveryBacklog alert actually fires | OPERATIONS.md known gap | 0.5d |
| 33i | Implement `IMPERSONATION_STARTED`/`STOPPED` in action allowlist (or remove the allowlist concept) | 32a caveat | 0.5d |

### Tier 2 — customer-visible features

These are not ship-blockers but increase trial→paid conversion.

| # | Feature | Why |
|---|---|---|
| 33j | Customer-facing changelog / "What's new" widget | Customers can't see releases today; reduces support burden |
| 33k | Product analytics (PostHog or Mixpanel): feature usage, trial→paid conversion, churn cohorts | We're flying blind on what works |
| 33l | In-app NPS / CSAT survey trigger | Closed-loop feedback for the support workflow we just built |
| 33m | Tenant onboarding email drip (day 1 / day 3 / day 7) | Boosts trial activation past the wizard |

### Tier 3 — enterprise / compliance

Required for >$50k ACV contracts.

| # | Feature | Why |
|---|---|---|
| 33n | SOC 2 Type II attestation engagement | Procurement gate for most enterprises |
| 33o | Third-party pen test (Bishop Fox / NCC) | Same |
| 33p | Formal data-residency contract enforcement (not just `Tenant.dataRegion` honor system) | EU customers + sensitive verticals |
| 33q | HIPAA BAA path (encryption-at-rest CMEK, audit log immutability, PHI tagging) | Healthcare vertical |
| 33r | DPA / MSA contract templates | Legal review needed; not engineering work alone |

### Tier 4 — agentic depth

We claim "AI-powered ATS" but agents today are single-call. Real
agentic value (autonomous candidate sourcing, recruiter copilot that
plans multi-step actions) needs:

| # | Feature | Why |
|---|---|---|
| 33s | ReAct loop in agent framework (think → act → observe → repeat) | Required for any multi-step autonomy |
| 33t | Agent memory (per-tenant vector store) | Agents currently forget every conversation |
| 33u | Eval framework with regression suite | Without evals, prompt changes are flying blind |
| 33v | Auto-pipeline: candidate posted → sourced → screened → scheduled with zero human touch | The "actually agentic" demo |

### Tier 5 — vertical specialization

Pick ONE vertical and build the depth that makes us 10× better there
than horizontal ATS competitors:

- **Healthcare**: HIPAA-compliant, license verification, NPI lookup, credential workflows
- **Tech**: GitHub integration, technical-interview scoring, code-test integration (HackerRank/CoderPad)
- **Skilled trades**: Mobile-first, SMS-based apply flow, certification tracking
- **Hourly retail**: High-volume apply, automated scheduling, predictive no-show scoring

---

## §3 — What we explicitly won't do

Setting expectations so we don't drift:

- **Real-time guarantees** — AI agent calls can take seconds; this is fine
- **Zero-downtime major migrations** — we'll schedule windows
- **Per-tenant performance isolation today** — a single tenant doing 10× normal traffic can starve others until 33b ships
- **IE 11 support** — out of WCAG conformance scope
- **WCAG 2.1 Level AAA** — AA is the procurement standard; AAA includes
  things like sign-language interpretation that aren't realistic for B2B
- **Sub-minute RPO** — current RPO is 24h via nightly pg_dump; WAL-G can
  tighten this if/when a customer asks
- **Self-hosting Stripe** — we use hosted Checkout + Customer Portal, full stop
- **Multi-cloud abstraction layer** — we deploy on one cloud at a time per
  customer; the abstraction tax isn't worth paying

---

## §4 — How to use this file

- **Every PR that closes a roadmap item** updates the relevant row +
  links to the commit SHA
- **Every PR that opens a new roadmap item** adds it to the right tier
- **Quarterly review**: re-read §1 + §2; demote / promote / remove items
  based on what customers are actually asking for
- **Annual review**: re-read §3 to make sure the "won't do" list still
  reflects reality

This file is the source of truth for "what's next" — it lives in the
repo so the next engineer (or the next AI session) can pick up cold
without needing the verbal context.
