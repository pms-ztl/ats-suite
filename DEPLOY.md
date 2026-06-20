# DEPLOY — WF3 schema batch, new services, env, and module enablement

Companion to `DEPLOYMENT.md` (which covers the base single-host Compose + K8s
topologies). This file documents the operational recipe for the WF3 enterprise
build: the assessment-service schema batch, the new env vars, the new Compose
services (assessment-service + the isolated Judge0 sidecar), the new npm deps,
and how to enable the new modules per tenant.

HARD RULE for v1: everything in this batch is **additive and
backward-compatible**. No existing column is dropped, no existing route changes
shape, the new modules ship `defaultEnabled:false` (plan-gated), and a tenant
that never enables them sees exactly the pre-WF3 product. A FREE tenant still
gets 402/404 on the new surfaces, proving gating is intact.

---

## 1. The migrator-rebuild recipe (WF3 schema batch)

The new schema lives in `apps/assessment-service/prisma/schema.prisma`
(Assessment / AssessmentInvite / Attempt / Answer / ProctorEvent /
AssessmentResult + the QuestionBank/Question library). It also adds the
authoring columns on `Assessment` (`schemaJson`, `version`, `publishedHash`,
`publishedAt`) and the external-provider correlation columns on
`AssessmentInvite` (`provider`, `providerInvitationId`, `providerSecret`).

WHY a full migrator rebuild is required: the `migrator` one-shot service is
built from `infra/Dockerfile.tools`, which `COPY apps ./apps` at **build time**.
The baked image therefore carries a frozen copy of every `prisma/schema.prisma`.
`db push` pushes the BAKED schema, not the host's working tree. If you edit a
schema on the host and re-run the existing migrator image, the new columns are
NOT pushed — and worse, `db push` will **drop a manually-added empty column**
even without `--accept-data-loss` (the documented managerId trap). So any schema
change MUST be followed by a migrator image rebuild before `db push` runs.

Run in order:

```bash
# 0. (host) regenerate the Prisma client for each changed service so the host
#    TS build sees the new model types. Assessment is the WF3 service.
npx prisma generate --schema apps/assessment-service/prisma/schema.prisma

# 1. (host) validate the TypeScript build BEFORE touching Docker. tsc is the
#    gate; a green build here means the image build will not fail on type errors.
npm run build --workspace=@cdc-ats/assessment-service
#    plus any service whose generated client changed (e.g. billing for modules):
npm run build --workspace=@cdc-ats/billing-service
cd apps/frontend && npx tsc --noEmit && cd ../..

# 2. REBUILD the migrator image so its baked schema.prisma includes the new
#    columns/models. THIS IS THE STEP THAT IS EASY TO FORGET.
docker compose -f docker-compose.demo.yml build migrator

# 3. db push the new schema. The migrator one-shot runs infra/migrate.sh, which
#    `prisma db push`es assessment-service against ASSESSMENT_DATABASE_URL
#    (no --accept-data-loss on the core path, so it only ADDS columns).
docker compose -f docker-compose.demo.yml up migrator
#    (or run just the push: `docker compose ... run --rm migrator bash infra/migrate.sh`)

# 4. recreate the assessment-service container WITHOUT pulling the migrator back
#    in as a dependency (--no-deps), then any service whose image changed.
docker compose -f docker-compose.demo.yml build assessment-service
docker compose -f docker-compose.demo.yml up -d --no-deps assessment-service
#    (billing-service too, if the module resolver / generated client changed)
docker compose -f docker-compose.demo.yml up -d --no-deps billing-service

# 5. restart in place to pick up the recreated env/image where a rebuild was not
#    needed but a reload is (e.g. a service that only reads a new env var).
docker restart cdc-ats-api-gateway-1   # gateway reads EMBED_SECRET, proxies

# 6. RE-RUN apply-rls for assessment-service. db push recreates tables; RLS
#    policies are NOT in the Prisma schema, so they must be re-applied (the
#    applier is idempotent). Run it against the ADMIN/superuser URL, not the
#    ats_app app URL — the applier creates the ats_app role + FORCE policies and
#    must run as a superuser. apply-rls imports the `prisma` export, so point
#    ASSESSMENT_APP_DATABASE_URL at the admin URL for this one invocation (or
#    unset it so it falls back to prismaAdmin).
docker compose -f docker-compose.demo.yml run --rm \
  -e ASSESSMENT_APP_DATABASE_URL="$ASSESSMENT_DATABASE_URL" \
  assessment-service \
  node --import tsx prisma/apply-rls.ts
```

GOTCHAs (all previously hit on this codebase):
- **Rebuild before push.** Recreating `assessment-service` (or any service that
  lists `migrator` under `depends_on`) without `--no-deps` re-runs the OLD
  migrator image and can drop empty schema-only columns. Always rebuild the
  migrator first, or use `--no-deps` on the service recreate.
- **apply-rls is separate from migrate.** `infra/migrate.sh` only `db push`es the
  assessment schema; it explicitly defers RLS to `prisma/apply-rls.ts` (see the
  comment at migrate.sh line 56-58). RLS is not restored by `db push`.
- **Run apply-rls as superuser.** The applier creates the `ats_app` role and
  `FORCE ROW LEVEL SECURITY` policies; the non-superuser app role cannot.
- **Two clients, two URLs.** Migrations + apply-rls use `ASSESSMENT_DATABASE_URL`
  (superuser, RLS-exempt); the request path uses `ASSESSMENT_APP_DATABASE_URL`
  (the `ats_app` role, RLS enforced). The strict tables are tenant-isolated;
  QuestionBank/Question follow the Skill idiom (tenant rows isolated, NULL-tenant
  rows global).

---

## 2. New environment variables

All are interpolated into Compose from the gitignored `.env` (never literals in
the compose file). See `.env.example` for the canonical block + generation
one-liners.

| Var | Read by | Purpose | How to generate |
|---|---|---|---|
| `EMBED_SECRET` | api-gateway | Signs/verifies embed tokens for the `/embed/*` + `/api/embed/*` white-label surfaces | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ATS_CONFIG_ENC_KEY` | notification-service, assessment-service | AES-256-GCM key for `@cdc-ats/common` `encryptConfig`/`decryptConfig` (OA provider secrets at rest). MUST decode to EXACTLY 32 bytes | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` (64 hex chars) |
| `ASSESSMENT_DATABASE_URL` | assessment-service (admin), migrator, apply-rls | Superuser DB URL for the assessment DB. Used by migrations + RLS applier | `postgresql://postgres:...@host:5432/assessment_db` |
| `ASSESSMENT_APP_DATABASE_URL` | assessment-service (request path) | Non-superuser `ats_app` role URL so RLS policies apply on request paths | `postgresql://ats_app:...@host:5432/assessment_db` |
| `JUDGE0_URL` | assessment-service (grading worker, WF7) | In-network base URL of the isolated Judge0 sidecar | `http://judge0:2358` |
| `JUDGE0_CALLBACK_BASE_URL` | assessment-service | Public gateway base Judge0 calls back on `/api/internal/judge0/callback` | `http://api-gateway:4000` |
| `JUDGE0_AUTH_TOKEN` | assessment-service | Optional. Self-hosted Judge0 `X-Auth-Token` | from your Judge0 config |
| `JUDGE0_RAPIDAPI_KEY` / `JUDGE0_RAPIDAPI_HOST` | assessment-service | Optional. Hosted Judge0 via RapidAPI instead of self-host | from RapidAPI |

Note: `ASSESSMENT_SERVICE_URL` (gateway routing table, port 4014) already exists
in `.env.example`. WF7 wires the gateway proxy (`/api/assessments`,
`/api/public/assessment`, `/api/internal/judge0/callback`).

---

## 3. New Compose services

Both are already declared in `docker-compose.demo.yml`.

### assessment-service (port 4014)
- Standard static service image (`infra/Dockerfile.service`, `SERVICE=assessment-service`).
- Reads `ATS_CONFIG_ENC_KEY` (provider-secret encryption) + the two assessment
  DB URLs. Health-checks on 4014. On `ats_net`.
- Has its own DB (`assessment_db`), migrated by the `migrator` one-shot and
  RLS'd by `prisma/apply-rls.ts`.

### judge0 (isolated code-execution sidecar)
- Image `judge0/judge0:1.13.1`, `privileged: true`.
- DELIBERATELY isolated: sits on the `judge0_net` bridge with `internal: true`
  ONLY, with NO route to `ats_net`, and `ALLOW_ENABLE_NETWORK: "false"` so
  submitted candidate code cannot reach the network.
- NEVER expose Judge0 publicly. Untrusted candidate code runs here; the only path
  in is assessment-service's grading worker on the internal network, and the only
  path out is the async verdict callback to the gateway.

```bash
docker compose -f docker-compose.demo.yml up -d assessment-service judge0
```

---

## 4. New npm dependencies

WF3/WF5-7 frontend + service deps. After adding any of these, rebuild the
affected image (frontend `public/` and service `dist/` are baked at build time).

| Dep | Where | Why |
|---|---|---|
| `react-grid-layout` | frontend | Draggable/resizable widget grid for the custom-dashboards module (`/` dashboard editing) |
| `nanoid` | service(s) / frontend | Short opaque ids (invite tokens, widget instance ids) |
| `@monaco-editor/react` | frontend | The code-editor surface in the OA CODING-question take flow |
| `ajv` | assessment-service | JSON-schema validation of the immutable versioned `Assessment.schemaJson` authoring tree at publish time |

```bash
# install at the workspace root, then rebuild the affected image
npm install
docker compose -f docker-compose.demo.yml build frontend assessment-service
docker compose -f docker-compose.demo.yml up -d --no-deps frontend assessment-service
```

---

## 5. Enabling the new modules per tenant

The new modules are real `MODULE_REGISTRY` manifests (`packages/common/src/modules/registry.ts`):

| Module key | Name | requiresPlan | defaultEnabled | failMode |
|---|---|---|---|---|
| `oa-assessments` | Online Assessments | PROFESSIONAL | false | closed |
| `custom-dashboards` | Customizable Dashboards | PROFESSIONAL | false | open |
| `white-label-embed` | White-label Embed | ENTERPRISE | false | closed (depends on `custom-dashboards`) |

Entitlement is resolved by billing-service (`routes/modules.ts`) as an
AND-of-gates over REAL rows — NEVER a code flag: platform kill > plan
entitlement > `TenantModule` override (else manifest default) > tenant kill >
every dependency enabled. Enabling a module the plan does not include returns
402 PLAN_LIMIT.

**Enable via the real toggle route (the supported path):**

```bash
# PUT /api/billing/modules/:key  (tenant admin). Writes a real TenantModule row
# and publishes module.toggled to bust the gate caches within one round-trip.
curl -X PUT https://api.your-domain.com/api/billing/modules/oa-assessments \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true}'
```

**Demo seed enables modules on the demo (Pinnacle / ENTERPRISE) tenant ONLY**,
via REAL `TenantModule` rows (not code hacks), and keeps a FREE tenant with the
modules OFF to prove gating still 402/404s. After enabling, verify both sides:

```bash
# resolved set for the caller tenant (every module + its real reason)
curl -s https://api.your-domain.com/api/billing/modules -H "Authorization: Bearer <admin-jwt>"
# expect oa-assessments enabled on Pinnacle, and on the FREE tenant:
#   {"enabled":false,"reason":"Not included in plan FREE (requires PROFESSIONAL)","requiresPlan":"PROFESSIONAL"}
```

`white-label-embed` additionally needs `custom-dashboards` enabled first (it is a
dependency); enabling it while the dependency is off returns
`enabled:false, reason:"Blocked by disabled dependencies: custom-dashboards"`.

---

## 6. v1 compatibility statement

This batch is additive and backward-compatible:
- New tables only; no existing column dropped, no existing route shape changed.
- New modules ship `defaultEnabled:false` + plan-gated, so a tenant that does not
  opt in sees the exact pre-WF3 product.
- Judge0 is unrouted until WF7; assessment-service exists and migrates but the
  gateway proxy to it is wired in WF7, so v1 is safe to deploy ahead of it.
- A FREE tenant gets 402/404 on every new surface, proving gating is intact.
- GDPR posture preserved: OA outcomes route to HITL (no solely-automated reject,
  Art.22), DSR erasure covers the new OA rows, and an explainability record is
  stored per score.
