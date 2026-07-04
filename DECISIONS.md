# Architecture Decisions (As Built)

This document records the deliberate engineering choices where the shipped system
chose a sane, defensible default over the literal letter of the build mandate. It
describes what the code actually does today, not what a design proposal would like it
to do. Every entry states: the decision, why it was made, and what would have to change
to swap it for the alternative the mandate names.

The house discipline throughout is real data or an honest empty state, never fabricated
values, and additive/backward-compatible change so a frozen v1 demo image and the
current v2 both keep working. Two entries below (stub KYC, stub assessment vendors)
apply that discipline even where it means intentionally NOT meeting the letter of a
"return a mock token" instruction, because a fake pass reads as real downstream.

Line numbers drift as files change. File paths and identifier names are the stable
reference; treat any line number here as "at the time of writing."

---

## Table of contents

1. Foundational stack decisions (technology the mandate names by product)
   - 1.1 Express 5 modular services kept vs NestJS
   - 1.2 NATS JetStream + BullMQ vs Kafka
   - 1.3 Custom WebRTC room vs LiveKit or an external meeting tool
   - 1.4 TypeScript resume parser + LLM screening vs Python FastAPI
   - 1.5 `apps/*` repo layout vs `/services/*`
   - 1.6 Export rendering in a shared frontend lib vs a dedicated export-service
   - 1.7 Postgres RLS pattern as belt-and-suspenders tenancy
2. Architecture and tenancy decisions (surfaced by audit)
3. Jobs and application intake decisions
4. Resume engine decisions
5. Pipeline, interviews and assessments decisions
6. Collab video room decisions
7. AI matching and notifications decisions
8. Offer and onboarding decisions
9. Analytics, exports, customization and engineering-standards decisions

---

## 1. Foundational stack decisions

### 1.1 Express 5 modular services kept vs NestJS

**Decision.** Every backend service is a small Express 5 application (`apps/*-service`,
Express 5.2.1) organized by feature routers, not a NestJS application.

**Why.** The mandate's intent is the modular-microservice discipline: independently
deployable services, one bounded context each, its own database, communicating over a
gateway and an event bus. That discipline is already enforced and shipped, with a test
suite that passes over it. NestJS is a framework choice, not that discipline. It would
give dependency-injection modules and decorators but change nothing about the service
boundaries, the tenancy model, or the event contracts that actually deliver the
requirement.

**What would change to swap.** A full rewrite of working, tested software: every router
becomes a Nest controller, every `lib/*` a provider, `packages/common` middleware
(`readAuthHeaders`, `tenantContext`, `requireRole`) becomes Nest guards and
interceptors. High cost, no isolation or correctness benefit, so it was not done.

### 1.2 NATS JetStream + BullMQ vs Kafka

**Decision.** Inter-service events flow over NATS JetStream on tenant-scoped subjects
`tenant.{tenantId}.*` (and `platform.*` for platform-scope events); durable background
work runs on BullMQ over Redis.

**Why.** At this scale NATS JetStream plus BullMQ gives the same guarantees the mandate
wants from an event backbone: durable, replayable, versioned events with an
idempotency key on the envelope (`packages/contracts/src/events/event-base.ts`,
`eventId` doubles as the idempotency key), plus tenant partitioning by subject and a
separate queue tier for retries/backoff. Kafka would add an operationally heavier
cluster (ZooKeeper/KRaft, partition management) for throughput this system does not
need today.

**What would change to swap.** Replace the NATS publish/subscribe helpers in
`packages/common` and the per-service subscribers with a Kafka producer/consumer; map
the `tenant.{tenantId}.*` subject hierarchy onto topic-plus-key partitioning
(tenantId as the partition key preserves per-tenant ordering). The `EventEnvelope`
contract is transport-agnostic and would carry over unchanged, which is what keeps this
a swap rather than a redesign.

### 1.3 Custom WebRTC room vs LiveKit or an external meeting tool

**Decision.** The interview room is a built-in WebRTC mesh: peer-to-peer media
(`apps/frontend/lib/collab/use-collab-room.ts`) with a stateless signaling relay
(`apps/collab-service`), and no external meeting product (no Zoom, Meet, LiveKit, Daily,
etc.).

**Why.** Constraint 4 of the mandate is explicit: no external meeting tools. A built-in
room satisfies it in the strongest possible reading, with zero third-party media
infrastructure and no vendor account. LiveKit or an SFU would be an infrastructure
option for scale, not a requirement, and pulling in a media server would arguably weaken
the "built-in, no external platform" property, not strengthen it.

**What would change to swap.** For scale past a small panel or for hostile NATs, the
media path (currently `RTCPeerConnection` per pair) would point at an SFU. The seam is
the `ICE_SERVERS` constant in `use-collab-room.ts` plus the signaling relay; see
DEFERRED.md (TURN relay) for the config-driven ICE seam that a self-hosted or vendor
SFU/TURN would plug into. The persistence and PDF-export legs are independent of the
media transport and would not change.

### 1.4 TypeScript resume parser + LLM screening vs a Python FastAPI resume service

**Decision.** Resume text extraction (`apps/resume-service`, pdf-parse / mammoth / txt)
and LLM screening (`apps/screening-service`) are TypeScript services, not a separate
Python/FastAPI microservice.

**Why.** This is an ecosystem choice under the same contract. The mandate cares that
resumes get parsed to structured data and scored against a rubric with cited evidence,
which the TypeScript path delivers end to end. Keeping the whole backend one language
(Node 22, Prisma, shared `packages/contracts` and `packages/common`) removes a runtime,
a build toolchain and a second set of tenancy/RLS plumbing. Python's parsing libraries
are strong, but nothing in the requirement needs them.

**What would change to swap.** Stand up a FastAPI service behind the gateway that
consumes the same `resume.parsed` event contract and posts screening results back on the
same `screening.completed` shape. Because the interface is the event contract, not the
language, the rest of the system would not notice the substitution.

### 1.5 `apps/*` repo layout vs `/services/*`

**Decision.** Services live under `apps/` (e.g. `apps/job-service`,
`apps/candidate-service`), with shared code in `packages/`.

**Why.** Historical, and it is the standard Turborepo/npm-workspaces convention this
monorepo already uses. The directory name carries no architectural meaning: each service
still has its own `package.json`, its own `prisma/schema.prisma` and database, and is
independently buildable and deployable (`infra/Dockerfile.service`, per-service Helm
values). "apps vs services" is a label, not a boundary.

**What would change to swap.** A directory move plus updates to workspace globs in the
root `package.json`, `turbo.json`, the Dockerfiles and the Helm chart's service list.
Pure churn with no functional gain, so it was not done.

### 1.6 Export rendering in a shared frontend lib vs a dedicated export-service

**Decision.** PDF/DOCX/CSV/table export is rendered client-side from a shared frontend
library (`apps/frontend/lib/export.ts`, plus the candidate-summary export component and
the universal `ExportTable` model), operating on data the API already returned. There is
no separate export-service.

**Why.** The security property that matters is that an export cannot leak fields the
viewer is not allowed to see. That is guaranteed at the source: the server returns only
role-visible fields (RBAC filtering happens in the services), so a client-side renderer
physically cannot include restricted data because it never received it. A dedicated
export-service would re-fetch the same RBAC-filtered data and re-implement the same
renderers, adding a service and a network hop without changing the trust boundary. For
the one case that needs a server-authoritative bundle (the interview record PDF), the
server owns the bundle at `GET /artifact/export` and the browser only lays it out.

**What would change to swap.** Move `lib/export.ts` behind a new service that accepts the
same already-filtered payloads and streams back files. The RBAC filtering would stay
exactly where it is (in the data services); only the render location moves. Worth doing
only if headless/high-volume server-side rendering becomes a requirement.

### 1.7 Postgres RLS pattern as belt-and-suspenders tenancy

**Decision.** Tenant isolation is enforced twice: application-level scoping on every
query plus Postgres Row-Level Security. Each data service ships an idempotent
`prisma/apply-rls.ts` that creates a non-superuser `ats_app` role and `ENABLE`/`FORCE`
policies keyed on `"tenantId" = current_setting('app.current_tenant_id', true)`; the
shared `rlsExtend` + `tenantContext` in `packages/common` set that GUC per request; a
two-client Prisma setup routes request paths through the RLS client and trusted
cross-tenant paths (workers, subscribers, super-admin rollups) through a superuser admin
client.

**Why.** Application scoping alone fails open the moment a developer forgets a `where`
clause. `FORCE` RLS makes the database refuse cross-tenant reads/writes even for the
table owner, so a missing filter is a "no rows" bug, not a data-leak incident. This is
the belt-and-suspenders posture appropriate for multi-tenant hiring PII.

**What would change to swap.** RLS is opt-in only for the three structurally
cross-tenant services (see entry 2.3); everywhere else it is the default. Removing it
would mean deleting the `apply-rls.ts` files and collapsing to the single admin client,
which is not on the table because it is the primary tenant-isolation guarantee. The
honest caveat: the dev-fallback `ats_app` credentials and the RLS GUC must be set in
production env for the policies to bind to request traffic.

---

## 2. Architecture and tenancy decisions (master prompt 1, 2, 7)

### 2.1 RBAC role source is central; the route-to-role map is distributed

**Decision.** The role vocabulary and role assignment are centralized in
identity-service; enforcement is a single shared per-route helper, rather than a single
machine-readable permission matrix served by identity-service.

**Detail.** The `UserRole` enum lives in identity's schema
(`apps/identity-service/prisma/schema.prisma`) and is mirrored exactly once in shared
contracts (`packages/contracts/src/dtos/user.ts`). identity-service is the sole role
authority: it mints roles at login and invite and owns the invite `ROLE_HIERARCHY` gate
(`apps/identity-service/src/routes/users.ts`). Every service gates routes with the same
`requireRole` / `requireTenantAdmin` / `requireSuperAdmin` helpers from
`packages/common` (`auth-headers.ts`) against the gateway-verified JWT role. What is
distributed is the role-to-permission mapping itself: the per-route `requireRole` calls
across services, plus the frontend nav matrix `ROLE_PERMISSIONS`
(`apps/frontend/lib/constants.ts`).

**Why this meets the intent.** There is one authoritative role source and uniform
enforcement, so there is no per-service role drift. Consolidating the route-to-role map
into an identity-served matrix would be a refactor with no isolation benefit.

**Honest caveat.** There is no single queryable permission-matrix artifact in
identity-service. If the client wants one, generate it from the `requireRole` call sites;
do not hand-maintain a second copy that can drift.

### 2.2 Envelope `tenantId` is required but nullable, null == platform scope

**Decision.** `tenantId` is a required field on the event envelope but nullable, with
null meaning platform scope and only ever appearing on `platform.*` subjects
(`packages/contracts/src/events/event-base.ts`).

**Why.** Tenant events always publish on `tenant.{tenantId}.*` with the UUID in the
envelope. The only `tenantId: null` publishes are genuinely platform-wide (the
`tenant.created` registry event and super-admin broadcasts in notification
`subscribers.ts`). Making `tenantId` non-nullable would force a fake tenant onto
platform events; the subject hierarchy keeps the two planes physically separate for
consumers. No tenant-scoped event can omit its tenant, which is the mandate's intent.

**What would change to swap.** If platform events must carry a sentinel tenant, introduce
a reserved platform tenant UUID and make the field non-null; consumers would then have to
filter on the sentinel instead of on subject prefix. Not worth the fake-tenant smell.

### 2.3 Opt-in RLS (`prismaRls`) for cross-tenant-heavy services

**Decision.** identity, tenant and notification keep an admin default Prisma client with
an exported `prismaRls` client used only by their pure per-tenant handlers, instead of
making the RLS client the default everywhere.

**Why.** These three are structurally cross-tenant: login has to find a user before any
tenant context exists; tenant-service is the registry itself; notification's delivery
worker and NULL-tenant broadcasts span tenants by design. Forcing the RLS client
everywhere would break authentication itself. RLS policies still exist on their
tenant-scoped tables (`apply-rls.ts` is present in all three), and the per-tenant request
paths use the RLS client, so protection is equivalent exactly where tenant data is
served. The six request-path-heavy services use the standard default-is-RLS pattern.

**What would change to swap.** To make RLS the default in these three, login,
registration-saga, super-admin and cross-tenant delivery paths would each need an
explicit admin-client escape hatch, which is strictly more error-prone than the current
opt-in. The current split is the safer direction.

### 2.4 collab-service has no database and no RLS

**Decision.** collab-service is a stateless, room-scoped WebSocket relay with no database
and therefore no RLS.

**Why.** It relays WebRTC signaling and Yjs updates and deliberately persists nothing
(`apps/collab-service/src/index.ts`), so there is no table to tenant-scope. Access
control is the signed `CollabClaims` HMAC token (`apps/collab-service/src/token.ts`,
shared `COLLAB_TOKEN_SECRET`, expiry and role bound), minted only by interview-service,
which is itself tenant/RLS-scoped. Tenancy is enforced at the token mint, the only place
state exists.

**Honest caveat.** The dev-fallback secret `dev-collab-secret-change-me`
(`token.ts` and interview-service `collab-token.ts`) must be overridden in production
env, or tokens are forgeable.

### 2.5 Trusted service-to-service calls present synthetic ADMIN headers

**Decision.** Internal fan-out calls (job-service to resume/screening/billing on the
public apply path) present `X-User-Role: ADMIN` plus the internal service token, rather
than a per-user JWT.

**Why.** Public applicants have no JWT. The internal token (enforced in
`packages/common` `auth-headers.ts`) is the machine credential; the `tenantId` is set by
the calling service from its own request context and never taken from the applicant
(`apps/job-service/src/lib/service-client.ts`). This is the standard trusted-subsystem
pattern. Minting per-service JWTs would add key-rotation surface without changing the
trust boundary.

**What would change to swap.** Issue short-lived service JWTs signed by identity-service
and verify them at each callee. Only worth it if the internal network stops being a trust
boundary (for example true zero-trust between services).

---

## 3. Jobs and application intake decisions (master prompt 5.1, 5.2, constraint 3)

### 3.1 1000+ concurrent applicants: engineered and harness-verified, not a committed benchmark

**Decision.** Intake capacity for four-digit concurrency is engineered into the
architecture and covered by a threshold-enforced load harness, rather than proven by a
recorded benchmark artifact committed to the repo.

**Detail.** Presigned direct-to-storage upload keeps resume bytes off the gateway; the
202 accept path does only two small writes plus a queue enqueue; an atomic idempotency
ledger dedupes; the `applicationCount` row-lock hotspot was removed from the hot path; and
an open-model k6 script ramps to a 600 iterations/s spike (`maxVUs` 6000) with CI-failing
thresholds (p95 < 800ms, error rate < 1%, dropped iterations < 100) at
`load-tests/apply-custom.js`.

**Why this meets the intent.** The mandate wants intake that does not fall over at
four-digit concurrency; that is met by the architecture plus a repeatable,
threshold-gated harness. `docs/LOAD_TESTING.md` documents the SLOs, not a recorded run.

**Honest caveat.** No k6 run results are committed in-repo. This is stated plainly rather
than claimed as a passed benchmark. To turn it into a committed proof, run the harness
against a production-like stack and check in the summary output.

### 3.2 Live applicant counts derive from Application rows, not the denormalized counter

**Decision.** The counts a recruiter sees (funnel, per-stage totals) are computed live
from `Application` rows (candidate-service `groupBy`/list), not from the denormalized
`JobPosting.applicationCount`.

**Why.** Application rows are created synchronously on every intake path (portal 201,
accept-fast 202 before the response returns, board webhook), so row-derived counts are
always accurate and real-time. The denormalized counter was a proven write hotspot at
spike rates and was deliberately taken off the hot path (`apps/job-service/src/routes/public.ts`).

**Honest caveat.** The denormalized `applicationCount` field is still served publicly and
can drift from the true count. That residual is a known gap, not a display the recruiter
relies on.

### 3.3 Idempotency ledger on the two async paths; multipart relies on upsert-by-email

**Decision.** A full idempotency ledger backs the two paths that need it, accept-fast
(header key or a stable request-hash, replayed byte-identical as 202) and inbound board
webhooks (key `inbound:{provider}:{externalApplyId}`), while the legacy multipart
fallback relies on candidate upsert-by-email dedupe only.

**Why.** The mandate ties idempotency keys to the async intake path, which has them end
to end with atomic claim/steal/replay semantics (`public.ts`). Multipart is the low-rate
compatibility fallback for storage-off or old clients; a rare client retry there can
duplicate an `Application` row but never a `Candidate`. That is an accepted trade-off on a
path that is not the concurrency path.

**What would change to swap.** Extend the same ledger to wrap the multipart handler.
Cheap to add if the multipart path ever carries real load.

### 3.4 Eligibility as generic field+op rules, not named department/degree/CGPA columns

**Decision.** Eligibility is modeled as `EligibilityRule = { field, op, values,
errorMessage }` evaluated against whatever the tenant's own custom form collects
(`packages/contracts/src/dtos/eligibility.ts`), rather than as hardcoded department,
degree or CGPA columns.

**Why.** This is exactly the spec-driven genericity that constraint 3 demands. A
"CSE-only" gate or a "CGPA >= 7.5" gate is pure tenant data (rule rows), never code. `op`
covers categorical (`in`/`not_in`/`eq`/`neq`) and numeric (`gte`/`lte`/`between`) checks;
`field` is any form-schema id, including `collegeName` from the CDC channel. Every rule
carries a recruiter-authored rejection message and the evaluator fails closed on missing
answers.

### 3.5 CDC college capture rides the canonical apply page

**Decision.** The `/cdc/[token]` landing links to the generic apply page with
`?college=<name>`, which stamps `collegeName` into `formResponses` on both apply paths;
the tenant-branded `/c/[slug]` apply page does not read `?college=`.

**Why.** The CDC flow has exactly one entry (the share link), and that entry routes
through the canonical page where capture is implemented on both the multipart and
accept-fast submits (`apps/frontend/app/(candidate-portal)/jobs/[id]/apply/page.tsx`). A
second capture point on the branded page would be dead code for this flow.

**What would change to swap.** If CDC links ever need to open the branded page, add the
same `?college=` read there. One-line symmetry, deferred because nothing exercises it.

---

## 4. Resume engine decisions (master prompt 5.3, constraint 7)

### 4.1 Single scoring authority: screening-service computes all ATS scores

**Decision.** All ATS scores come from the one candidate-screener agent in
screening-service, through two entry points: async auto-screen (`resume.parsed` ->
`apps/screening-service/src/workers/screening.worker.ts`) and the sync candidate-less
`POST /internal/screening/score` (`apps/screening-service/src/routes/screening.ts`)
called by resume-service's bulk-archive worker. resume-service only stores the returned
score on `BulkImportItem`.

**Why.** Ranked bulk import and pipeline screening cannot drift because they share one
agent and one requisition-fetch path. candidate-service's sourcing ranker
(`apps/candidate-service/src/routes/agent-sourcing.ts`) is a separate sourcing-relevance
ranking, not the ATS score, and does not conflict.

### 4.2 LLM-judged score with deterministic post-calibration, not a keyword formula

**Decision.** Keep evidence-cited LLM scoring (per-requirement `requirementFindings` with
resume snippets, persisted as `agentTrace`) recalibrated by a transparent met/total
formula in code, rather than a keyword-coverage arithmetic.

**Why.** This satisfies the mandate's intent of inspectability better than keyword
counting: every requirement verdict carries direct resume evidence, the final number is a
deterministic, code-visible formula, and keyword-only scoring is trivially gameable. See
RUBRIC.md for the exact formula as shipped.

**Honest caveat.** The documentation and per-tenant configurability halves of the rubric
mandate are genuine gaps; this decision does not paper over them. RUBRIC.md now covers the
documentation half; per-tenant rubric weights remain future work.

### 4.3 Quarantine = staging-row statuses in the same review queue

**Decision.** Bad, unsupported or empty files become visible `BulkImportItem` rows
(`extractStatus` `failed` / `unsupported` / `ocr_empty`) in the same manual-check staging
list and are auto-rejected at commit, rather than being moved to a separate quarantine
store.

**Why.** The recruiter sees every file that was in the archive in one place with its
status, which is functionally equivalent to a quarantine bucket and safer: nothing is
silently dropped and no fabricated successes appear (worker comments in
`apps/resume-service/src/workers/bulk-archive-extract.worker.ts`).

**Honest caveat.** The per-item human-readable reason string is not persisted today; the
status enum is. Persisting the reason is a small additive change.

### 4.4 Corrupt-file isolation: three independent layers

**Decision.** Isolation is enforced at three independent layers: per-entry try/catch in
the ZIP worker, per-file try/catch in loose bulk, and per-file BullMQ jobs at the parse
stage (one job failing cannot touch siblings).

**Why.** "Batch never aborts" holds at every stage a file can fail: extraction, candidate
creation, storage, parse and scoring (a score failure marks only that item
`scoreStatus=failed` in `service-client.ts`). The whole-archive catch fires only for
archive-level failures such as an unreadable zip, which is correct.

---

## 5. Pipeline, interviews and assessments decisions (master prompt 5.4, 5.5, 6)

### 5.1 Canonical stage names mapped 1:1 to the prompt vocabulary

**Decision.** The canonical enum uses `SCREENED` / `TECHNICAL_ROUND` / `HR_ROUND` /
`FINAL_REVIEW` instead of the prompt's literal `RESUME_SCREENING` / `TECHNICAL` /
`HR_ROUND`, mapped one-to-one.

**Why.** `TECHNICAL_ROUND` and `HR_ROUND` were added as first-class stages precisely to
close this spec item (commit 3d07f49). `SCREENED` is the resume-screening stage where the
resume-to-AI-screen pipeline lands its verdict. The semantics match the mandated machine
exactly (`apps/candidate-service/prisma/schema.prisma`); renaming enum values now would be
a data migration with no functional gain.

### 5.2 Onboarding is a separate case, not an Application stage

**Decision.** Onboarding is a dedicated `OnboardingCase` in onboarding-service, created on
`application.hired` / `offer.accepted`, rather than an `Application.stage` value.

**Why.** The hiring decision terminates at `HIRED`; onboarding is a different lifecycle
with its own tasks and portal, idempotently keyed per `(tenantId, candidateId)`
(`apps/onboarding-service/src/subscribers.ts`, `lib/case-service.ts`). The mandate's
intent, a post-offer onboarding leg that starts automatically, is met by the event chain.
Representing it also as an Application stage would duplicate state.

### 5.3 Stage set is data-driven per tenant, over a fixed canonical enum

**Decision.** Tenant-authored stages live in `UiConfig.workflow.stages` (id/label/
canonical/color), authored at `/settings/customization` and consumed by the pipeline
board.

**Why.** Each custom stage maps to a canonical enum value so analytics, automation and
cross-service events keep one vocabulary
(`packages/contracts/src/ui-config.ts`, `contracts/src/dtos/workflow.ts`,
`apps/frontend/components/cd/candidates-live.tsx`).

**Honest caveat.** Tenants can relabel, recolor, reorder and alias stages, but the
persisted state machine remains the fixed canonical enum: a tenant cannot mint a stage
with distinct persisted state. The richer `WorkflowTemplateDTO` contract has no backend
store and was superseded by the `UiConfig` path.

### 5.4 L1/L2/L3 realized as ordered per-requisition rounds

**Decision.** Interview levels are ordered `InterviewRound` records with free-form names
and types, not hardcoded L1/L2/L3 labels.

**Why.** This is strictly more general than three fixed levels: a tenant defines any
number of ordered rounds (name, type, duration, panelist role, auto-advance) per
requisition or tenant-wide, and each round type maps deterministically onto the canonical
pipeline stage (`apps/interview-service/src/routes/rounds.ts`, `lib/round-progression.ts`).

### 5.5 No stub assessment providers to label: real-call-or-honest-failure

**Decision.** There are no stub vendor providers to tag `[STUB]`; the design is
real-vendor-calls-or-honest-failure.

**Why.** The mandate's intent (never let fake vendor data masquerade as real) is enforced
harder than a `[STUB]` log: adapters return real payloads or `null` (HARD RULES in
`apps/assessment-service/src/providers/types.ts`); missing credentials route the invite to
manual handling with an explicit warn log (`workers/provider-invite.worker.ts`); no code
path synthesizes a score. Demos without vendor keys use the fully functional native OA
platform (question bank, public take, Judge0 code execution, grading worker). See
DEFERRED.md for the vendor adapters awaiting accounts.

### 5.6 Interface shape `invite()` / `fetchResult()` + `NormalizedResult`, not literal `solvedCount`

**Decision.** The provider interface is `invite()` (trigger) and `fetchResult()` (results
fetch) returning `NormalizedResult { score, maxScore, percentage, passed, sections[] }`,
rather than a literal `solvedCount` method.

**Why.** Per-question / solved detail is carried as `NormalizedResult.sections` (and the
native results' `perQuestion[]` with per-test-case verdicts from Judge0), all derived
verbatim from real vendor or runner payloads. That is a superset of a `solvedCount`
integer (`apps/assessment-service/src/providers/types.ts`).

---

## 6. Collab video room decisions (master prompt 5.6, constraints 4, 6)

### 6.1 Periodic plain snapshots, not server-side Yjs CRDT state

**Decision.** The room snapshots `notesText` (plain), `code` (text), `codeLanguage` and a
whiteboard PNG to `InterviewArtifact` every 15s and on exit, rather than persisting Yjs
binary updates server-side.

**Why.** This gives a permanent, human-readable, PDF-able interview record that survives
the call, while keeping collab-service a stateless, dependency-free relay
(`apps/collab-service/src/index.ts`).

**Honest caveat.** There is no server-side rehydration of the live doc, which produces the
re-entry clobber defect noted in the audit gaps. Persisting notes JSON + strokes JSON and
seeding them on join closes that hole and keeps this architecture.

### 6.2 Pure P2P mesh, no media server / SFU

**Decision.** Media flows peer-to-peer (one `RTCPeerConnection` per pair, deterministic
initiator, `apps/frontend/lib/collab/use-collab-room.ts`); the server relays only
signaling.

**Why.** This is the honest fit for the 1:1 / small-panel interview use case and the
strongest reading of "built-in, no external platform": zero third-party media
infrastructure.

**Honest caveat.** It scales poorly past roughly four or five participants and needs TURN
for hostile NATs. Neither is required by the mandate; the TURN relay is in DEFERRED.md.

### 6.3 Client-side jsPDF fed by a server-authoritative export bundle

**Decision.** The PDF is generated in the browser (jsPDF) from data the server owns:
`GET /artifact/export` (`apps/interview-service/src/routes/artifacts.ts`) is the
access-gated authoritative bundle, including feedback.

**Why.** This meets "exports to PDF as hiring justification" without adding a
headless-render dependency to a Docker static image, and the bundle endpoint keeps the
export tenant-scoped and reproducible. The missing piece is only the post-call consumer
(an audit gap), not the mechanism.

### 6.4 Bespoke canvas whiteboard, not tldraw/excalidraw

**Decision.** A lightweight pointer-stroke canvas whose strokes live in a Yjs array and
rasterize to PNG (`apps/frontend/components/cd/interview-room/CollabWhiteboard.tsx`).

**Why.** This fully satisfies the whiteboard mandate (live-synced drawing, persisted into
the record, embedded in the PDF) with no heavy dependency in the baked frontend image. The
schema already reserves a `whiteboard Json` column if a richer tool is swapped in later.

### 6.5 Room access control via stateless HMAC collab tokens

**Decision.** interview-service mints `base64url(payload).hmac` tokens bound to
roomId + role + expiry; collab-service verifies before the WS upgrade completes, with no
shared database between the two services.

**Why.** Rooms cannot be joined without a server grant (verified at collab-service
`index.ts` with a timing-safe compare, `token.ts`), which is the right posture for a
candidate-facing call, and it keeps the relay horizontally trivial.

**Honest caveat.** The dev-fallback secret `dev-collab-secret-change-me` (in both
`token.ts` files) must be set in production env.

---

## 7. AI matching and notifications decisions (master prompt 5.7, 5.8)

### 7.1 Strengths / missing skills derived from screener evidence, not a second LLM field

**Decision.** The two lists are derived client-side from the screener's `MATCH:` / `GAP:`
evidence bullets, falling back to met/not-met `requirementFindings`
(`apps/frontend/lib/api.ts`).

**Why.** Real-data-only discipline: the signals are genuine per-requirement evidence the
model already cites, so there is no second LLM call and no fabricated tags. This satisfies
the strengths / missing-skills fields with real screener data.

### 7.2 `NotificationType` reuse (SYSTEM) for interview-invite and assessment-review notices

**Decision.** `interview.scheduled` and assessment-needs-review notices emit type
`SYSTEM` with full context in `metadata` (`apps/notification-service/src/lib/subscribers.ts`),
rather than new enum values.

**Why.** `NotificationType` is a DB enum; avoiding a migration was chosen deliberately, and
`metadata` / `title` / `link` carry the invite context.

**Honest caveat.** These two cannot get their own template override until a dedicated type
is added (SYSTEM's template variable set is just `userName`).

### 7.3 Rejection email content safety: reason-code label only

**Decision.** The candidate-facing rejection reason is always a stable reason-code label
mapped server-side; raw recruiter notes are never surfaced
(`apps/candidate-service/src/lib/decision-events.ts`, `routes/applications.ts`).

**Why.** This implements the mandated rejection comm while making it impossible to leak
internal notes to candidates. It is a deliberate safety property, not an omission.

### 7.4 Automation is code-defined event subscribers, not a tenant-facing rule builder

**Decision.** Automation is hard-wired NATS subscribers (hire/reject/offer/invite/
bulk-upload/plan events) plus pipeline auto-advance (`apps/candidate-service/src/subscribers.ts`)
and per-round `autoAdvanceOnPass` config (`apps/interview-service/src/routes/interviews.ts`).

**Why.** This satisfies the intent that key comms and actions fire automatically on events.
A generic tenant-configurable rules engine would be a larger product build and is not
required to close the mandate's examples.

**Honest caveat.** The mandate's own example (an auto email on stage change) has no trigger
at all, because no stage-change event is published today. That is an audit gap, not
something papered over here.

### 7.5 Overall match % is deterministic, not raw LLM opinion

**Decision.** The agentic verdict is post-processed into a calibrated score from
per-requirement findings (must-haves weighted 2x) with configurable PASS/REVIEW bars
(`apps/screening-service/src/workers/screening.worker.ts`).

**Why.** This fixes the "everyone scores below 70" LLM conservatism and makes the displayed
match % reproducible and explainable from the same evidence rows the alignment card
renders. See RUBRIC.md for the exact arithmetic.

### 7.6 Summary export is curated typed sections, not a resume dump

**Decision.** The candidate summary is one curated PDF/DOCX built from typed sections with
empty sections dropped
(`apps/frontend/components/.../candidate-summary-export.tsx`), not a raw resume dump.

**Why.** This matches the "summarized, not dumped" requirement at the component level. The
remaining problem is data wiring (an audit gap), not the design.

---

## 8. Offer and onboarding decisions (master prompt 5.9, section 4 KYC)

### 8.1 Stub KYC returns NEEDS_PROVIDER, not the mandated "mock verification token"

**Decision.** `StubKycProvider` returns `{ status: 'NEEDS_PROVIDER', providerRef: null,
message: 'Recorded... no result is fabricated' }` (`apps/onboarding-service/src/lib/kyc.ts`);
the UI maps `NEEDS_PROVIDER` to "Pending verification" and the case can never reach
`COMPLETED` on a stub result (`lib/case-service.ts`).

**Why.** Honest-stub policy is adopted repo-wide. The mandate's intent is "clearly not
production"; a fabricated token risks reading as a real pass downstream (`verifiedAt`,
`COMPLETED` status). `NEEDS_PROVIDER` is strictly more honest and blocks completion until a
real provider confirms.

**Honest caveat.** The literal letter of the mandate (a mock token) is intentionally not
met. If the client insists, returning `providerRef: stub-${uuid}` with status `PENDING` is
a two-line change; pair it with a `[STUB]` log so it never reads as real.

### 8.2 KYC format validation at the route boundary via shared Zod contracts

**Decision.** `SubmitPanSchema` / `SubmitBankAccountSchema`
(`packages/contracts/src/dtos/onboarding.ts`) reject bad formats with 400 before
`getKycProvider().verify` is ever called (`apps/onboarding-service/src/routes/portal.ts`).

**Why.** Same "format only" guarantee, single source of truth shared with the portal UI's
error copy; the stub adds masking on top and nothing else. Net behavior equals the mandate:
format-validate, no real verification.

### 8.3 One-click Hire auto-creates a 0/USD DRAFT offer when none exists

**Decision.** `applications.ts` creates a minimal DRAFT `Offer` (baseSalary 0, currency
USD) so the approve/letter/email leg can run, rather than inventing compensation from
requisition data.

**Why.** Never fabricate a salary figure. The recruiter edits the offer afterwards (PATCH
`apps/candidate-service/.../offers.ts`). This keeps the one-click chain unblocked for
candidates hired without a pre-drafted offer.

### 8.4 Hire chain is best-effort / decoupled, not atomic

**Decision.** An offer-approve leg failure never rolls back the `HIRED` mark or the
onboarding case (`applications.ts` try/catch); all NATS publishes are fire-and-forget with
warn-level logging (`lib/decision-events.ts`).

**Why.** Resilience over atomicity for a notification / side-effect chain: the terminal
business decision (`HIRED`) must not be hostage to letter rendering or broker availability.
Failures are logged, not swallowed silently.

### 8.5 Offer acceptance is recruiter-recorded, with `application.hired` as onboarding fallback

**Decision.** `POST /internal/offers/:id/accept` is gated `requireRecruiterOrAdmin`; there
is no candidate self-serve accept UI. onboarding-service also subscribes to
`application.hired` (`subscribers.ts`) so one-click Hire alone opens the onboarding case.

**Why.** This satisfies the intent (hire decision -> onboarding starts, no external system)
without a candidate-auth offer portal, which does not exist yet. The dual-trigger
subscription makes onboarding independent of which path the tenant uses.

---

## 9. Analytics, exports, customization and engineering-standards decisions (5.10, 5.11, 8, 12)

### 9.1 k8s via Helm chart, not raw manifests under `/deploy/k8s`

**Decision.** Keep the parameterized Helm chart at `infra/k8s/charts/cdc-ats` (plus
`infra/k8s/argocd/cdc-ats-application.yaml`) instead of raw manifests under `/deploy/k8s`.

**Why.** The mandate's intent, declarative k8s deployment artifacts, is satisfied by a
stronger mechanism: a parameterized chart (generic Deployment+Service loop, `values.yaml` +
`values-production.yaml`, cert-manager issuer, backup CronJob, common ConfigMap) plus GitOps
via ArgoCD. Moving it would be churn with zero functional gain.

**Honest caveat.** The real deficiency is chart coverage (services missing from the chart's
service list), filed as an audit gap. A pointer file at `/deploy/k8s/README.md` closes the
letter of the mandate.

### 9.2 Event contracts are Zod schemas in `packages/contracts`, root `/contracts/events` generated

**Decision.** The canonical event contract is the Zod payload schemas plus the typed
`EventEnvelope` in `packages/contracts/src/events`; any root `/contracts/events` artifact
should be generated from them, not hand-maintained.

**Why.** The Zod modules are compile-time enforced at every publisher and subscriber, which
is stronger than a passive schema folder. The envelope already standardizes
eventId-as-idempotency-key, tenant scoping and traceparent (`events/event-base.ts`).

**Honest caveat.** What is genuinely missing is (a) the root-level artifact, (b) schemas for
several newer subjects, and (c) explicit versioning, all filed as the `/contracts/events`
audit gap.

### 9.3 "HR manager" mapped onto tenant ADMIN

**Decision.** The mandated "HR manager" role maps onto the existing tenant `ADMIN` role
(with `COMPLIANCE_OFFICER` covering the audit slice), rather than adding an `HR_MANAGER`
enum value.

**Why.** `ADMIN` is the tenant-scoped people-ops role in this system (team management,
invites, settings, approvals), functionally the HR-manager seat. Adding a near-duplicate
enum value would fragment every `requireRole` gate for no behavioral difference.

**Honest caveat.** `DEPARTMENT_HEAD` and `EXECUTIVE` have genuinely distinct semantics
(org-subtree scope; read-only exec analytics) and are filed as a real gap, not mapped away.

### 9.4 Funnel metrics computed live from operational services, not the MetricRollup warehouse

**Decision.** Dashboards and funnel compute live from operational services via the gateway
aggregator (`apps/api-gateway/src/.../aggregators.ts`) rather than from the
analytics-service `MetricRollup` warehouse.

**Why.** Real-data-only discipline: the aggregator reads `applicationsByStage` from
candidate-service, so the funnel can never drift from reality or show fabricated rollups.

**Honest caveat.** The analytics-service warehouse path exists but is unpopulated (a known
E2E defect), filed as a gap with a subscriber-based ingest fix. Until then the aggregator
satisfies the 5.10 intent with real numbers.

### 9.5 Customizable reports via dashboard documents + widget registry + ExportTable

**Decision.** Report customization is delivered through customizable dashboard documents, a
widget registry, and the universal `ExportTable` model, not a dedicated report-builder
module.

**Why.** A tenant composes per-user / per-tenant dashboards from registered real-data
widgets (role/module/plan filtered) and exports any surface via the shared four-format
`ExportTable`, which covers the mandate's intent (tenant-shaped reporting output). A
standalone report designer would duplicate the widget/source registry.

**Honest caveat.** Export wiring is missing on several surfaces, filed as the 5.11 audit
gap.

### 9.6 Workflow customization is a mapping layer over a fixed canonical enum

**Decision.** Tenant workflow customization is a canonical-stage mapping layer
(labels/colors/order/approval declarations in `UiConfig`) over a fixed 12-stage canonical
enum; per-stage approval steps are authored config, not yet a server-side transition gate.

**Why.** Mapping custom stages onto `CanonicalStageSchema` keeps analytics, automation
(forward-only pipeline advance on `interview.round.started` / `assessment.completed`) and
events understandable across tenants, which is the standard ATS design. Real approval flows
exist where they matter (the offer.approved chain, plan-change review).

**Honest caveat.** Enforcing `ApprovalPolicyDTO` steps as a hard gate on stage transitions
in candidate-service is the next additive increment. This is stated plainly rather than
claiming full workflow-engine semantics.

### 9.7 collab-service documented as a WebSocket relay, not an OpenAPI REST spec

**Decision.** Document collab-service as a WebSocket relay (AsyncAPI-style note) rather than
forcing it into the OpenAPI REST mandate.

**Why.** It deliberately has no REST business routes, only `/health`, `/healthz`, `/metrics`
and the token-gated `/rt` WS upgrade (`apps/collab-service/src/index.ts`); the payloads are
opaque by design (client-side Yjs CRDTs and WebRTC signaling). An OpenAPI file would
misdescribe it. Its contract is the `CollabClaims` token minted by interview-service
(`src/token.ts`).
