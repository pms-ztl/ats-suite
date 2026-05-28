# Security Audit — Microservices Repo (Phase 27)

**Date**: 2026-05-28
**Methodology**: FRESH AUDIT PASS #2 (monolith audit dated 2026-05-02) applied to `D:\CDC\ATS-microservices`.
**Reference**: See plan file `C:\Users\ASUS\.claude\plans\stateless-hopping-cupcake.md` §0 for the original monolith findings.

## Summary

| Finding | Count | Severity |
|---|---|---|
| **F-027-micro** TOCTOU (`prisma.X.update/delete({where:{id}})` after tenant-scoped findFirst) | 8 sites | HIGH |
| **F-028-micro** Mutating routes with zero `requireRole` guards | 26 files (~70 routes) | HIGH |
| **F-027b-micro** TOCTOU in saga rollback compensation paths | 2 sites | LOW (internal-only) |

`requireRole`/`requireSuperAdmin`/`requireTenantAdmin`/`requireTenantUser` helpers **already exist** at `packages/common/src/middleware/auth-headers.ts:61-73` and are exported via `@cdc-ats/common`. Step 3a (add helper) from the plan is NOT needed — the helpers are just unused in 26 of 28 route files.

## §1 — F-027-micro: TOCTOU instances

| # | File:Line | Pattern | Severity | Fix |
|---|---|---|---|---|
| 1 | `apps/candidate-service/src/routes/applications.ts:80` | `prisma.application.update({where:{id}})` | HIGH | `updateMany({where:{id, tenantId}})` |
| 2 | `apps/candidate-service/src/routes/candidates.ts:177` | `prisma.candidate.update({where:{id}})` | HIGH | `updateMany({where:{id, tenantId}})` |
| 3 | `apps/identity-service/src/routes/users.ts:255` | `prisma.user.delete({where:{id}})` (saga rollback compensation) | LOW (called only by gateway during register-company rollback, no user-facing path) | Tighten anyway: `deleteMany({where:{id, tenantId}})` — but tenantId may not exist on first-call User; verify before fix |
| 4 | `apps/interview-service/src/routes/rounds.ts:54` | `prisma.interviewRound.update({where:{id}})` | HIGH | `updateMany({where:{id, tenantId}})` |
| 5 | `apps/interview-service/src/routes/rounds.ts:67` | `prisma.interviewRound.delete({where:{id}})` | HIGH | `deleteMany({where:{id, tenantId}})` |
| 6 | `apps/job-service/src/routes/job-postings.ts:64` | `prisma.jobPosting.update({where:{id}})` | HIGH | `updateMany({where:{id, tenantId}})` |
| 7 | `apps/job-service/src/routes/requisitions.ts:107` | `prisma.requisition.update({where:{id}})` | HIGH | `updateMany({where:{id, tenantId}})` |
| 8 | `apps/tenant-service/src/routes/tenants.ts:67` | `prisma.tenant.delete({where:{id}})` (saga rollback) | LOW (super-admin or saga only; tenant table has no parent tenantId) | Already correct as-is (tenants don't have tenantId column) |

## §2 — F-028-micro: Missing role guards

Classified per the audit's severity tiers. Each file's mutating-route count and recommended role set:

### P0 — SUPER_ADMIN or ADMIN only (defense-in-depth)

| File | Mutating | Recommended | Notes |
|---|---|---|---|
| `apps/notification-service/src/routes/hitl.ts` | 3 | `requireTenantAdmin` | HITL approve/reject — admin-only |
| `apps/billing-service/src/routes/billing.ts` | 1 | `requireTenantAdmin` | Per-tenant agent toggle |
| `apps/tenant-service/src/routes/branding.ts` | 2 | `requireTenantAdmin` | Tenant branding/retention |
| `apps/tenant-service/src/routes/tenants.ts` | 3 | `requireSuperAdmin` | Tenant CRUD (gateway already mounts under /api/super-admin/tenants with requireSuperAdmin, so this is defense-in-depth) |
| `apps/tenant-service/src/routes/plan-changes.ts` | 3 | Mixed — see notes | Tenant-admin can create their own request; super-admin approves/rejects. Split per-route. |
| `apps/notification-service/src/routes/integrations.ts` | 3 | `requireTenantAdmin` | Slack/SMTP per-tenant config |
| `apps/notification-service/src/routes/email-templates.ts` | 3 | `requireTenantAdmin` | Template editing |
| `apps/identity-service/src/routes/users.ts` | 4 | `requireTenantAdmin` for invite/PATCH; gateway already guards `/api/users` with auth | Defense-in-depth |
| `apps/candidate-service/src/routes/gdpr.ts` | 1 | `requireTenantAdmin` | GDPR delete is destructive — admin-only |
| `apps/billing-service/src/routes/platform.ts` | 4 (1 currently guarded) | `requireSuperAdmin` | Mounted under /api/super-admin/platform; add per-route guard for defense-in-depth |

### P1 — ADMIN / RECRUITER / HIRING_MANAGER

| File | Mutating | Recommended | Notes |
|---|---|---|---|
| `apps/candidate-service/src/routes/candidates.ts` | 3 | `requireTenantUser` minus INTERVIEWER → use explicit `requireRole("ADMIN","RECRUITER","HIRING_MANAGER")` | Candidate CRUD |
| `apps/candidate-service/src/routes/applications.ts` | 3 | `requireRole("ADMIN","RECRUITER","HIRING_MANAGER")` | App stage transitions |
| `apps/interview-service/src/routes/interviews.ts` | 3 | `requireRole("ADMIN","RECRUITER","HIRING_MANAGER","INTERVIEWER")` for feedback; admin/recruiter for create | Per-route split |
| `apps/interview-service/src/routes/rounds.ts` | 3 | `requireRole("ADMIN","RECRUITER")` | Round CRUD |
| `apps/job-service/src/routes/requisitions.ts` | 3 | `requireRole("ADMIN","RECRUITER","HIRING_MANAGER")` | Req CRUD |
| `apps/job-service/src/routes/job-postings.ts` | 2 | `requireRole("ADMIN","RECRUITER")` | Posting publish |
| `apps/resume-service/src/routes/resume.ts` | 2 | `requireRole("ADMIN","RECRUITER")` | Bulk upload |

### P1 — Agent invocations (per-role)

| File | Mutating | Recommended |
|---|---|---|
| `apps/candidate-service/src/routes/agent-experience.ts` | 1 | `requireRole("ADMIN","RECRUITER","HIRING_MANAGER")` |
| `apps/candidate-service/src/routes/agent-offer.ts` | 1 | `requireRole("ADMIN","RECRUITER")` |
| `apps/candidate-service/src/routes/agent-sourcing.ts` | 1 | `requireRole("ADMIN","RECRUITER")` |
| `apps/interview-service/src/routes/agent-intelligence.ts` | 1 | `requireTenantUser` |
| `apps/interview-service/src/routes/agent-scheduling.ts` | 1 | `requireRole("ADMIN","RECRUITER")` |
| `apps/job-service/src/routes/jd-author.ts` | 1 | `requireRole("ADMIN","RECRUITER","HIRING_MANAGER")` |

### P2 — User-self-serve (lower priority, often gateway-gated already)

| File | Mutating | Recommended | Notes |
|---|---|---|---|
| `apps/notification-service/src/routes/notifications.ts` | 3 | `requireTenantUser` | Mark-read / mark-all-read — any logged-in user, just need defense-in-depth |

### ✅ Intentionally open (NO role check — by design)

| File | Mutating | Why |
|---|---|---|
| `apps/api-gateway/src/routes/auth.ts` | 7 | `/api/auth/login`, `/register-company`, `/refresh`, `/forgot-password`, etc. — these CREATE the JWT, so they cannot require a JWT-derived role |
| `apps/identity-service/src/routes/auth-polish.ts` | 7 | Forgot-password / reset-password / MFA setup — user-self-serve, role-agnostic |
| `apps/job-service/src/routes/public.ts` | 1 | `/api/public/jobs/:slug/apply-custom` — public candidate-facing apply endpoint |

## §3 — Execution sequence

Order optimized for risk reduction first:

1. **P0 fixes** — close hitl, gdpr, branding, plan-changes, tenants, billing-toggle, integrations, email-templates, users, platform (~10 files, 28 routes)
2. **TOCTOU fixes** — 8 sites (5 HIGH + 2 LOW + 1 N/A)
3. **P1 fixes** — candidates, applications, interviews, rounds, requisitions, job-postings, resume, 6 agent routes (~13 files, 22 routes)
4. **P2 fix** — notifications (1 file, 3 routes)
5. **Pen test re-run** — expect 10/10 (no regression) + optionally extend to 12/12 with role-bypass + TOCTOU attacks

## §4 — Per-finding tracking

(To be updated with commit SHAs as fixes land.)

| ID | Finding | Status | Commit |
|---|---|---|---|
| F-027-micro-a | applications.ts:80 TOCTOU | PENDING | — |
| F-027-micro-b | candidates.ts:177 TOCTOU | PENDING | — |
| F-027-micro-c | users.ts:255 saga rollback TOCTOU | PENDING (LOW priority) | — |
| F-027-micro-d | rounds.ts:54/67 TOCTOU | PENDING | — |
| F-027-micro-e | job-postings.ts:64 TOCTOU | PENDING | — |
| F-027-micro-f | requisitions.ts:107 TOCTOU | PENDING | — |
| F-028-micro-P0 | 10 P0 files missing requireRole | PENDING | — |
| F-028-micro-P1 | 13 P1 files missing requireRole | PENDING | — |
| F-028-micro-P2 | notifications.ts P2 | PENDING | — |
| Pen test 10/10 | Phase 24 regression check | PENDING | — |
