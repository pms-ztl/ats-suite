# Compliance posture & controls (audit-ready)

This maps **implemented** controls to the criteria a SOC 2 / ISO 27001 / GDPR
auditor checks. It does **not** claim certification — that requires a 3rd-party
audit over an observation window. It does make that audit fast by giving the
auditor evidence + control documentation up front.

## Evidence you can pull right now
- **`GET /api/compliance/evidence?days=90`** — append-only audit summary +
  recent entries + a machine-readable control map (tenant-scoped, admin-only).
- **`GET /api/compliance/audit?action=&limit=`** — filterable audit query.
- The `AuditLog` table is **append-only** (no update/delete routes).

## Control mapping

| Control area | Implementation | SOC2 / GDPR ref |
|---|---|---|
| **Tenant isolation** | Postgres RLS + tenant-scoped queries on every service; DB-per-service | CC6.1 |
| **Authentication** | JWT access tokens; passwords hashed with **argon2id** | CC6.1 |
| **Authorization (RBAC)** | SUPER_ADMIN / ADMIN / RECRUITER / HIRING_MANAGER / INTERVIEWER / CANDIDATE; `requireRole` guards | CC6.3 |
| **Audit logging** | Append-only `AuditLog`, fanned in from domain events (bookings, feedback, bulk ops, plan changes, kill-switches) | CC7.2 |
| **Encryption in transit** | TLS at the edge (nginx / Render); internal calls over the private network | CC6.7 |
| **Data retention** | Configurable retention + `retention-purge` worker (candidate-service) | GDPR Art. 5(1)(e) |
| **Right to erasure** | GDPR routes (api-gateway + candidate-service) anonymize / purge on request | GDPR Art. 17 |
| **AI fairness / non-discrimination** | `bias-auditor` agent (EEOC four-fifths), PII-stripped **fairness mode**, and **per-decision reasoning traces** for every agent | EEOC / NYC LL144 |
| **Explainability** | Agent ReAct traces (Thought→Action→Observation→Verdict) surfaced in the UI + persisted | EU AI Act transparency |
| **Availability / abuse** | Per-IP + per-tenant rate limits; platform agent kill-switches; health/readiness probes | CC7.1 |
| **Change management** | Versioned Prisma migrations (forward-only, documented in DEPLOY.md) | CC8.1 |
| **Vendor/sub-processor** | LLM via OpenRouter/Anthropic, embeddings via OpenAI, storage via S3 — all key-gated + configurable | CC9.2 |

## Honest gaps before an audit would pass
- **Certification itself** — needs an auditor + an observation window (Type II = months).
- **Encryption at rest** — relies on the managed DB/host (Render/AWS) defaults; document the provider's attestation.
- **Audit coverage** — currently captures the highest-value domain events; expand `auditAndDeliver(...)` to auth/login + impersonation + GDPR actions for full coverage (the seam is in place).
- **Access reviews / on/off-boarding, pen-test, DR drills** — operational processes, not code.
