# Event contracts (NATS / JetStream)

Versioned JSON Schemas for every NATS event this platform publishes or consumes,
derived by reading the ACTUAL `publishEvent(...)` and `subscribeToEvents(...)`
call sites across `apps/*/src` and `packages/*`. Each `<type>.v1.schema.json`
describes ONE event's `payload`; the shared wire envelope is in
`_envelope.schema.json`.

These are documentation contracts (JSON Schema), not runtime validators. The
runtime source of truth is `publishEvent()` in
`packages/nats-client/src/publisher.ts` (builds the envelope) and the per-service
Zod schemas each subscriber parses on receipt. Where a real call site diverges
from a typed `packages/contracts` schema, the JSON Schema here documents the REAL
wire payload, and its `description` says so.

## Envelope

Every event is wrapped by `publishEvent()` into:

```
{ eventId, type, tenantId, emittedAt, traceparent?, payload }
```

- `eventId` — UUID v4, the JetStream publish-dedup `msgID` AND the subscriber
  idempotency key.
- `tenantId` — the tenant UUID, or `null` for platform-scoped events
  (`tenant.created`, `platform.agent.kill-switch.toggled`).
- `payload` — the per-type body described by these schemas.

See `_envelope.schema.json`.

## Subject pattern

Built by `tenantSubject(tenantId, domain, event)` in
`packages/contracts/src/events/event-base.ts`:

- tenant-scoped: `tenant.{tenantId}.{domain}.{event}`
- platform-scoped: `platform.{domain}.{event}` (when `tenantId` is `null`)

Consumers use `tenant.*.{domain}.{event}` wildcards. Some subjects nest the
event under a compound leaf, e.g. `interview.round.started` (domain=`interview`,
event=`round.started`) and `jobboard.application.received`.

## Multi-tenancy mandate

Every tenant-scoped payload carries `tenantId` as a required field (in addition
to the envelope's `tenantId`). The only payload with no `tenantId` is
`platform.agent.kill-switch.toggled`, which is genuinely platform-wide.

## Streams

Streams are declared in `packages/nats-client/src/streams.ts` (`CORE_STREAMS`).
Mapping of stream to the subjects it retains:

| Stream | Subjects | Event types on it |
| --- | --- | --- |
| `TENANT_EVENTS` | `platform.tenant.>`, `tenant.*.tenant.>` | `tenant.created`, `tenant.plan-changed` |
| `USER_EVENTS` | `tenant.*.user.>` | `user.invited`, `user.deactivated` (declared, unused) |
| `PLAN_CHANGE_EVENTS` | `tenant.*.plan-change.>`, `platform.plan-change.>` | `plan-change.requested`, `plan-change.reviewed` |
| `RESUME_EVENTS` | `tenant.*.resume.>`, `tenant.*.bulk-upload.>` | `resume.parsed`, `bulk-upload.completed` |
| `SCREENING_EVENTS` | `tenant.*.screening.>` | `screening.completed`, `screening.review_requested` |
| `ASSESSMENT_EVENTS` | `tenant.*.assessment.>` | `assessment.invited`, `assessment.started`, `assessment.submitted`, `assessment.completed` |
| `INTERVIEW_EVENTS` | `tenant.*.interview.>` | `interview.scheduled`, `interview.round.started`, `interview.feedback.submitted` |
| `CANDIDATE_EVENTS` | `tenant.*.application.>`, `tenant.*.offer.>` | `application.hired`, `application.rejected`, `application.stage.changed`, `offer.approved`, `offer.accepted` |
| `ONBOARDING_EVENTS` | `tenant.*.onboarding.>` | (none — no producer; see below) |
| `AGENT_EVENTS` | `tenant.*.agent.>` | `agent.completed` |
| `PLATFORM_EVENTS` | `platform.agent.>`, `platform.prompt.>` | `platform.agent.kill-switch.toggled` |
| `JOB_EVENTS` | (NOT declared in `CORE_STREAMS`) | `job.published`, `job.closed` (consumer-only) |

There is no declared stream whose subjects match `tenant.*.jobboard.>`, so
`jobboard.application.received` currently has no home stream (see the honest
notes below).

## Producer / consumer matrix

Producer = the service whose code calls `publishEvent()` for that subject.
Consumers = services that `subscribeToEvents()` on it. "(none)" means the
subject is genuinely unconsumed today, not that a consumer was omitted.

| Event type | Subject | Producer | Consumers |
| --- | --- | --- | --- |
| `resume.parsed` | `tenant.{tenantId}.resume.parsed` | resume-service | candidate-service, screening-service, search-service, job-service (apply-ingest) |
| `bulk-upload.completed` | `tenant.{tenantId}.bulk-upload.completed` | resume-service | notification-service |
| `screening.completed` | `tenant.{tenantId}.screening.completed` | screening-service | job-service (apply-ingest) |
| `screening.review_requested` | `tenant.{tenantId}.screening.review_requested` | screening-service (agent tool) | (none) |
| `assessment.invited` | `tenant.{tenantId}.assessment.invited` | assessment-service (native route + vendor worker) | (none) |
| `assessment.started` | `tenant.{tenantId}.assessment.started` | assessment-service | (none) |
| `assessment.submitted` | `tenant.{tenantId}.assessment.submitted` | assessment-service | (none) |
| `assessment.completed` | `tenant.{tenantId}.assessment.completed` | assessment-service (grading worker + vendor ingest) | candidate-service, notification-service |
| `interview.scheduled` | `tenant.{tenantId}.interview.scheduled` | interview-service | notification-service |
| `interview.round.started` | `tenant.{tenantId}.interview.round.started` | interview-service | candidate-service |
| `interview.feedback.submitted` | `tenant.{tenantId}.interview.feedback.submitted` | (none — consumer-only) | notification-service |
| `interview.feedback.created` | `tenant.{tenantId}.interview.feedback.created` | interview-service (feedback route) | notification-service |
| `application.hired` | `tenant.{tenantId}.application.hired` | candidate-service | notification-service, onboarding-service |
| `application.rejected` | `tenant.{tenantId}.application.rejected` | candidate-service | notification-service |
| `application.stage.changed` | `tenant.{tenantId}.application.stage.changed` | candidate-service | (none) |
| `offer.approved` | `tenant.{tenantId}.offer.approved` | candidate-service | notification-service |
| `offer.accepted` | `tenant.{tenantId}.offer.accepted` | candidate-service | onboarding-service |
| `agent.completed` | `tenant.{tenantId}.agent.completed` | ai-engine hook (all agent services), resume-service, screening-service, job-service (jd-author) | billing-service |
| `tenant.created` | `platform.tenant.created` | tenant-service | billing-service, notification-service |
| `tenant.plan-changed` | `tenant.{tenantId}.tenant.plan-changed` | tenant-service (3 call sites) | billing-service, notification-service |
| `plan-change.requested` | `tenant.{tenantId}.plan-change.requested` | tenant-service | notification-service |
| `plan-change.reviewed` | `tenant.{tenantId}.plan-change.reviewed` | tenant-service | (none) |
| `platform.agent.kill-switch.toggled` | `platform.agent.kill-switch.toggled` | billing-service | notification-service |
| `jobboard.application.received` | `tenant.{tenantId}.jobboard.application.received` | job-service | (none) |
| `job.published` | `tenant.{tenantId}.job.published` | (none — consumer-only) | job-service (google-indexing worker) |
| `job.closed` | `tenant.{tenantId}.job.closed` | (none — consumer-only) | job-service (google-indexing worker) |
| `user.invited` | `tenant.{tenantId}.user.invited` | (none — declared, unused) | (none) |
| `user.deactivated` | `tenant.{tenantId}.user.deactivated` | (none — declared, unused) | (none) |

## Honest gaps and quirks (as of this snapshot)

These are documented in each schema's `description`; collected here for
visibility. Nothing below is aspirational — it is what the code does today.

- **Producer without consumer** — `screening.review_requested`,
  `assessment.invited`, `assessment.started`, `assessment.submitted`,
  `application.stage.changed`, `plan-change.reviewed`, and
  `jobboard.application.received` are published but no service subscribes to them
  yet. (`application.stage.changed` is an audit-trail event by design.)
- **Consumer without producer** — `interview.feedback.submitted` has a live
  notification-service subscriber, but interview-service persists feedback (and
  may auto-advance the round) WITHOUT publishing this event. `job.published` /
  `job.closed` have a live google-indexing subscriber but no publisher; the
  worker logs "idle - publisher slice not deployed" and stays quiet when the
  `JOB_EVENTS` stream is absent.
- **Declared but unused** — `user.invited` / `user.deactivated` have a declared
  `USER_EVENTS` stream and typed `packages/contracts` schemas, but no producer
  and no consumer. `ONBOARDING_EVENTS` is declared but onboarding-service
  publishes no `onboarding.*` events (it only consumes `offer.accepted` /
  `application.hired`).
- **Subject with no stream** — `jobboard.application.received`
  (`tenant.*.jobboard.>`) and `job.published` / `job.closed`
  (`JOB_EVENTS`) are not covered by any subject list in `CORE_STREAMS`. The
  producers/consumers are best-effort and non-fatal when the stream is missing.
- **Payloads richer than the typed contract** — the REAL wire payloads for
  `resume.parsed` (adds `parsed` / `enriched` / `githubCorroboration` /
  `verification`), `screening.completed` (adds an optional `agentic` block), and
  `interview.scheduled` (adds `endAt` / `durationMinutes` / `meetingUrl` /
  `attendees` / `organizer` / `ics` / `externalEvent` / `bookedByAgent`) are
  supersets of their `packages/contracts` typed schemas. These extra fields are
  documented here because consumers read them off the payload.
- **Payload that diverges from the typed contract** — `plan-change.reviewed`
  ships `action` / `toPlan` / `paymentMethod` / `requiresStripePayment` / `note`
  / `requestedByUserId` / `reviewedByUserId`, NOT the
  `status` / `decisionNote` / `reviewedByUserId` of the typed
  `PlanChangeReviewedPayloadSchema`. The schema here follows the real call site.
- **Variant payloads for one subject** — `tenant.plan-changed` has 3 producer
  call sites whose payloads differ (`source` + `stripeStatus` vs
  `changedByUserId` + `requestId`), so those fields are optional. `assessment.invited`
  and `assessment.completed` each have a native + a vendor producer; the vendor
  path adds `provider` (optional).
- **cuid vs uuid ids** — Module E events (`application.*`, `offer.*`) carry
  plain-string ids (Application.id / Offer.id are cuids), so those schemas use
  `"type": "string"` WITHOUT `"format": "uuid"`. candidate-service deliberately
  does not `.parse()` the strict uuid contract before publishing.

## Versioning

Schemas are suffixed `.v1`. Every field addition to a payload has so far been
additive and backward-compatible (a frozen v1 demo image and the current v2 must
both keep working), so `additionalProperties: true` is set on every payload
schema — a consumer that receives extra fields must ignore them. A breaking
change (removing/retyping a required field, changing a subject) would land as a
new `.v2` file alongside the `.v1`, never an in-place edit.
