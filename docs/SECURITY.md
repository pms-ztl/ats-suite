# Security Posture

How CDC ATS protects customer data and meets SOC 2 / GDPR / industry baseline
expectations. This document is what we hand to a prospect's security team
during procurement. Owner: Engineering + Compliance.

**Last reviewed:** 2026-05-28. Re-review quarterly.

## Quick reference for procurement

| Question | Answer | Evidence |
|---|---|---|
| Where is data stored? | Postgres + Redis + object storage, all in your chosen region | `Tenant.dataRegion` column; `infra/k8s/` region affinity |
| Is data encrypted at rest? | Yes — Postgres + S3 with provider-managed AES-256 | [Encryption at rest](#encryption-at-rest) |
| Is data encrypted in transit? | Yes — TLS 1.2+ everywhere, mTLS service-to-service in-cluster | [Encryption in transit](#encryption-in-transit) |
| Multi-factor auth? | TOTP MFA optional per-user; SSO (SAML/OIDC) for enterprise | [Authentication](#authentication--access-control) |
| Single Sign-On? | SAML 2.0 + OIDC. Per-tenant IdP config | [docs/sso-setup/](sso-setup/) |
| Audit logs? | All admin actions logged; super-admin viewer at `/admin/audit`; CSV export | [Audit logging](#audit-logging) |
| Data export on request (GDPR Article 20)? | Yes, in-app self-serve at Settings → Export tenant data | [docs/BACKUP.md](BACKUP.md) |
| Data deletion on request (GDPR Article 17)? | Per-candidate via GDPR panel; full tenant via support request | Same |
| Backups? | Nightly pg_dump, 30-day local + 90-day S3 | [docs/BACKUP.md](BACKUP.md) |
| Subprocessor list? | Below | [Subprocessors](#subprocessors) |
| Pen test history? | Internal cross-tenant isolation test (Phase 24, 10/10 PASS) | [SECURITY_REPORT.md](../SECURITY_REPORT.md) |
| Incident response plan? | Below | [Incident response](#incident-response) |

## Encryption

### Encryption at rest

| Layer | Mechanism | Key management |
|---|---|---|
| Postgres data files | AES-256 via cloud provider (RDS encryption, Cloud SQL CMEK, etc.) | Provider KMS, customer-managed keys available on Enterprise |
| Object storage (resumes, attachments) | S3 SSE-S3 (AES-256) by default; SSE-KMS on Enterprise | Provider KMS, key rotation: yearly |
| Backups | Same encryption as source — pg_dumps land in encrypted PVC + encrypted S3 bucket | See [BACKUP.md](BACKUP.md) |
| Secrets (JWT secret, Stripe keys, etc.) | Kubernetes Secrets with envelope encryption (sealed-secrets recommended) | Operator-managed; rotation policy below |

### Encryption in transit

| Path | Protocol | Notes |
|---|---|---|
| Browser → Gateway | TLS 1.2+ via nginx / managed LB | Cert via cert-manager + Let's Encrypt by default; BYO cert supported |
| Gateway → backend services | In-cluster mTLS optional (Istio / Linkerd) — TLS via service mesh | Without mesh, NetworkPolicy + service token (`X-Internal-Service`) provides defense-in-depth |
| Service → Postgres | TLS to managed DB | `sslmode=require` recommended |
| Service → Redis | TLS to managed Redis | `rediss://` URL |
| Service → external APIs (Stripe, OpenRouter, SendGrid) | TLS enforced by the SDK | Provider-managed certs |
| Webhook ingress (Stripe) | TLS termination at gateway + signature verification | `verifyAndProcess()` rejects unsigned/tampered payloads |

### Key rotation policy

| Key | Rotation cadence | How |
|---|---|---|
| `JWT_SECRET` | 90 days | Rolling deploy: deploy with both old + new accepted by `jwtVerify`, then drop old |
| `INTERNAL_SERVICE_TOKEN` | 180 days | Same rolling deploy |
| Stripe API key | When compromised; otherwise per Stripe's recommendation | Rotate in Stripe dashboard → update Secret → restart billing-service |
| OpenRouter / Anthropic / OpenAI API keys | 180 days | Same |
| SendGrid / SMTP credentials | 180 days | Same |
| Postgres user passwords | 365 days | Coordinate with DBA; use `ALTER USER` then update Secret |
| TLS certs (LE) | 90 days | Auto via cert-manager |
| TLS certs (BYO) | Per-provider | Manual upload |

## Authentication & access control

### User authentication

- **Password**: argon2id hashed (32-byte salt, default time-cost 3, memory-cost 65536 KiB)
- **MFA**: optional TOTP per user (Phase 15). Enforced for SUPER_ADMIN in production via `MFA_REQUIRED_ROLES=SUPER_ADMIN` env (recommended).
- **SSO**: SAML 2.0 + OIDC per-tenant (Phase 28). JIT user provisioning with IdP-group → role mapping.
- **Email verification**: required on signup (Phase 31b). Unverified users can sign in but see a banner.

### Session management

- httpOnly + Secure + SameSite=Lax cookies for browser sessions
- Access JWT: 24h TTL (1h for impersonation sessions — Phase 32a)
- Refresh JWT: 7d TTL, single-use rotation
- Logout endpoint clears the cookie server-side

### Authorization model

- Per-tenant data isolation enforced at the service layer (every query scoped by `tenantId`)
- 6 roles: `SUPER_ADMIN`, `ADMIN`, `RECRUITER`, `HIRING_MANAGER`, `INTERVIEWER`, `COMPLIANCE_OFFICER`
- `requireRole(...)` middleware gates every mutating endpoint
- Cross-tenant isolation verified by pen test (Phase 24, 10/10 PASS)
- TOCTOU class of bugs audited (Phase 27) — all `findFirst` → `update` pairs now use `updateMany` with tenant scope

### Super-admin impersonation (Phase 32a)

- SUPER_ADMIN can impersonate any tenant ADMIN for support debugging
- Impersonation JWT has hard-coded 1h TTL (shorter than normal sessions)
- Bright-red banner shown sitewide during impersonation
- Every start + stop written to AuditEvent with BOTH actor + target
- Nested impersonation rejected (must stop one before starting another)

## Audit logging

### What's logged

- Every login (success + failure) — `auth-polish.ts`
- Every user invite + accept-invite + email verification
- Every plan change (manual + Stripe-driven)
- Every super-admin action (kill switch flips, prompt overrides, impersonation)
- Every GDPR export + delete
- Every SSO login attempt (success + failure with reason)

### Where it's logged

- Cross-cutting events → `AuditEvent` table in `identity_db`
- SSO-specific → `SsoLoginAudit` table
- Webhook events (Stripe) → `StripeWebhookEvent` (append-only)
- Platform kill switches → `PlatformKillAudit`

### How auditors access it

- Super-admin UI: `/admin/audit` (Phase 32c) — filterable by tenant / actor / action / date
- CSV export: same page, up to 100k rows per export
- Database access: direct SQL for >100k rows or complex joins
- Retention: indefinite (audit log is append-only, never deleted)

## Subprocessors

Customer data is processed by:

| Vendor | What for | Data exposed | Region |
|---|---|---|---|
| AWS / GCP / Azure (deployment choice) | Compute, storage, networking | All data | Customer's chosen region |
| Stripe | Payment processing for self-serve plans | Tenant name, billing email, plan tier | US (Stripe HQ) — DPA available |
| OpenRouter (or direct Anthropic/OpenAI) | LLM inference for AI agents | Resume text, JD text, candidate notes — sent at inference time, NOT stored by us | US (provider HQ) |
| SendGrid (or SMTP provider) | Transactional email | Recipient email, subject, body | Provider region |
| Slack (optional integration) | Notification delivery to customer Slack workspace | Notification body only | Customer's Slack region |
| Sentry (optional) | Error tracking | Stack traces; PII scrubbed before send | Customer's choice |
| Langfuse (optional) | LLM tracing | Prompts + completions | Customer's choice |

**Update procedure:** any change to this list requires a 30-day notice to
Enterprise customers per DPA, and a notification in the platform changelog.

## Incident response

### Severity levels

| Level | Definition | Response time | Notification |
|---|---|---|---|
| **SEV-1** | Confirmed data breach OR full-platform outage | 15 min | All-channel page; customers within 1h via status page |
| **SEV-2** | Service degradation OR security finding requiring deploy | 1 hour | Slack + status page |
| **SEV-3** | Bug affecting <1% of users | Next business day | Internal only |

### SEV-1 runbook

1. **Contain**: invoke the per-tenant or platform kill switches (Phase 21) to stop the bleed
2. **Notify**: post incident to status page; email Enterprise customers within 1h
3. **Investigate**: pull from `AuditEvent`, `StripeWebhookEvent`, `SsoLoginAudit`, service logs (Loki)
4. **Eradicate**: deploy the fix
5. **Recover**: re-enable kill switches once verified
6. **Post-mortem**: blameless RCA within 5 business days; share summary with affected customers

### Data breach playbook

1. **Within 1 hour**: rotate the affected secret (JWT_SECRET, Stripe key, etc.)
2. **Within 24 hours**: notify affected customers per their DPA + applicable regulation (GDPR Article 33 = 72h, CCPA = "expedient time")
3. **Within 72 hours**: file regulatory notifications (DPA / state AG / etc.)
4. **Within 30 days**: deliver full RCA + remediation evidence

## Vulnerability management

- Dependency scanning: GitHub Dependabot weekly + per-PR
- Container scanning: Trivy in CI (Phase 7b)
- Penetration testing: annual external + quarterly internal (Phase 24 model)
- Bug bounty: not currently active; planned for post-GA
- Responsible disclosure: `security@your-org.com` (set up before launch)

## Open items / known gaps

Honest snapshot — what we KNOW we don't have yet:

- No SOC 2 Type II attestation (planned: complete the 12-month observation
  period starting at GA)
- No third-party pen test (planned: pre-GA engagement with Bishop Fox / NCC)
- No formal data-residency contract beyond `Tenant.dataRegion` honor system
- No HIPAA BAA (we don't currently process PHI; Healthcare vertical would need this)
- No formal change advisory board — solo engineering review for now

## Reporting a security issue

Email `security@your-org.com` with:
- Description of the issue
- Steps to reproduce
- Impact assessment
- Any PoC code (optional but appreciated)

We commit to:
- Acknowledge within 1 business day
- Status update within 5 business days
- Fix within 30 days for SEV-1/SEV-2; 90 days for SEV-3
- Recognition in our security advisories (unless you prefer anonymity)
