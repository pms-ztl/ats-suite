# Demo Screenshots

This directory holds polished screenshots for marketing / demo use. They are intentionally NOT generated in CI — capturing them requires a real browser session with seeded data, which is too brittle for headless automation.

## How to capture

1. Boot the system per [DEMO_WALKTHROUGH.md](../../DEMO_WALKTHROUGH.md) step 0
2. Run the seed: `npx tsx apps/security-test/src/seed-demo.ts`
3. Promote `super@cdc-ats.demo` to SUPER_ADMIN via SQL (see walkthrough)
4. Open `http://localhost:3000` in a real Chrome window at 1440×900
5. Walk through each persona in DEMO_WALKTHROUGH.md and `Cmd/Ctrl+Shift+S` each page

## Suggested screenshots (in priority order)

| # | URL | Persona | Caption |
|---|---|---|---|
| 01 | `/super-admin/login` | (logged out) | Three-tier identity portal — distinct branding per portal |
| 02 | `/login` | (logged out) | Tenant admin login |
| 03 | `/staff/login` | (logged out) | Staff login (recruiter / interviewer / hiring manager) |
| 04 | `/admin` | SUPER_ADMIN | Platform overview: KPIs, plan breakdown, tenant table |
| 05 | `/admin/platform/agents` | SUPER_ADMIN | Global kill switch dashboard — 12 agents, per-row stats |
| 06 | `/admin/platform/cost` | SUPER_ADMIN | Cross-tenant cost rollup with daily area chart |
| 07 | `/admin/platform/prompts` | SUPER_ADMIN | Prompt editor with version history + diff dialog |
| 08 | `/admin/platform/audit` | SUPER_ADMIN | Append-only audit log feed |
| 09 | `/` (as ADMIN) | TENANT_ADMIN | Hiring dashboard with Acme branding (violet primary) |
| 10 | `/settings/branding` | TENANT_ADMIN | Branding editor with live email + sidebar + portal preview |
| 11 | `/settings/email-templates` | TENANT_ADMIN | Per-type email override with variable picker + iframe preview |
| 12 | `/settings/retention` | TENANT_ADMIN | Retention slider with plan-driven floor warning |
| 13 | `/settings/security` | TENANT_ADMIN | Password change + MFA setup (QR code mid-enrolment) |
| 14 | `/` (as RECRUITER) | RECRUITER | Tier-3 dashboard: scheduling queue + latest applications |
| 15 | `/` (as INTERVIEWER) | INTERVIEWER | "Today's interviews" + feedback due |
| 16 | `/` (as HIRING_MANAGER) | HIRING_MANAGER | My requisitions + decisions awaiting |
| 17 | `/c/acme-hiring-<slug>/jobs` | (public) | Whitelabeled career portal with custom hero |
| 18 | `/c/acme-hiring-<slug>/jobs/<id>/apply` | (public) | Whitelabeled apply form |

## Verified during Phase 26 (without saving screenshots)

The system DOES boot, login DOES work, and every URL in the table above returns HTTP 200/307 (auth redirect) — verified via curl during the Phase 26 commit. See [DEMO_WALKTHROUGH.md](../../DEMO_WALKTHROUGH.md) "What works (verified live)" table for the exact endpoints probed.

Two screenshots WERE captured live during the Phase 26 commit (login page + tenant admin dashboard after login) but are stored only in the conversation transcript, not in this directory. Re-capture them with the steps above when polishing the demo.
