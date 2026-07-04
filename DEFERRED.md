# Deferred Integrations (Interfaces Left Behind)

This document lists the integrations the system cannot fully exercise in this environment
because they require a vendor account, partner API access, OAuth app registration,
paid credentials, or infrastructure that only the provider can issue. For each one the
code is written to a typed interface and behaves honestly without credentials: it returns
`null` / an empty result / a `NEEDS_PROVIDER`-style state / an honest `FAILED` delivery, or
routes the work to manual handling, and it NEVER fabricates a vendor result. Configuring
the credential is what activates the real path; no code rewrite is needed.

This describes shipped behavior, not aspiration. Where a stub exists it is documented as a
stub, and the exact env var and interface file to make it real are named. Line numbers
drift; file paths and identifier names are the stable reference.

For the reasoning behind each deferral (why the honest-stub / manual-route posture was
chosen over faking a result), see the matching entries in DECISIONS.md sections 5.5, 8.1
and 8.2.

---

## Table of contents

1. Assessment (OA) vendor adapters: HackerRank / HackerEarth / Codility / iMocha / TestGorilla
2. Hiring-platform / job-board connectors: LinkedIn / Naukri / Indeed / ZipRecruiter / SEEK / Dice / Adzuna / Jooble / Wellfound / Foundit / Shine
3. Bot protection on public apply: Cloudflare Turnstile
4. KYC: PAN + bank-account (penny-drop) verification
5. Production email delivery: SMTP / ESP
6. Native calendar events: Google / Microsoft (provider-sent invites + RSVP)
7. Reliable media connectivity: TURN relay for the interview room
8. Code execution in the interview room (structured editor shipped instead)

---

## 1. Assessment (OA) vendor adapters

**What.** Live end-to-end integration with the five online-assessment vendors:
HackerEarth, Codility, iMocha, TestGorilla, HackerRank. Inviting a candidate to a real
vendor test and ingesting the real graded result (score, sections, per-question detail).

**Why deferred.** Every adapter makes real vendor HTTP calls and is code-complete, but
exercising it end to end requires a paid vendor account plus per-tenant API keys stored
encrypted (`TenantIntegration`, AES-GCM). None exist in this environment. Without
credentials the invite worker honestly routes the invite to manual handling and nothing
is faked (`apps/assessment-service/src/workers/provider-invite.worker.ts` logs a warning
that no vendor credentials are configured and the invite was routed to manual handling).
No code path synthesizes a score.

**Interface.**
- `AssessmentProvider` (`listTests` / `invite` / `fetchResult` / `verifyWebhook` /
  `parseWebhook`) at `apps/assessment-service/src/providers/types.ts`.
- Concrete adapters: `hackerrank.ts`, `hackerearth.ts`, `codility.ts`, `imocha.ts`,
  `testgorilla.ts` in the same directory.
- Registry at `apps/assessment-service/src/providers/index.ts`.
- Result normalization: `NormalizedResult { score, maxScore, percentage, passed,
  sections[] }`; `fetchResult` and `parseWebhook` return `null` when the vendor has no
  real result to report.

**How to activate for real.** Obtain a paid vendor account and API key. Store the
credential per tenant in `TenantIntegration` (AES-GCM encrypted) for the matching provider
key. The invite worker will then call the adapter's `invite()` instead of routing to
manual handling; completion arrives either via the vendor webhook (`verifyWebhook` +
`parseWebhook`) or via `fetchResult` polling (HackerRank has no per-invite webhook). No
demo depends on this: unconfigured tenants use the fully functional native OA platform
(question bank, public take page, Judge0 code execution, grading worker).

---

## 2. Hiring-platform / job-board connectors

**What.** Live posting and application ingest with real external boards: Indeed
(ATS/Apply partner), LinkedIn (Talent partner), ZipRecruiter, Naukri, SEEK, Dice, Adzuna,
Jooble, Wellfound, Foundit, Shine. This covers posting a job, closing it, publishing a
feed (JSON-LD), receiving signed inbound applications, and syncing disposition back to the
board, per each board's declared capabilities.

**Why deferred.** Every adapter is code-complete (post, close, feed/JSON-LD, signed
inbound apply, disposition sync per `ProviderCapabilities`) but exercising them requires
vendor partner accounts, API keys and webhook signing secrets that only the vendor can
issue. Partner-gated boards additionally return a `PENDING_PARTNER_APPROVAL` status while
the board's manual partner review is outstanding, which is the honest state rather than a
faked "posted" confirmation.

**Interface.**
- `HiringPlatformProvider` at `apps/job-service/src/providers/hiringplatform/types.ts`
  (`ProviderCapabilities`, `ProviderKey`, `PENDING_PARTNER_APPROVAL` in the post-status
  union).
- Resolved via `getProvider` / `requireProvider` in
  `apps/job-service/src/providers/hiringplatform/index.ts`.
- Per-tenant credential store: `loadPlatformCredentials` in
  `apps/job-service/src/providers/hiringplatform/provider-creds.ts`.
- Raw-bytes HMAC verification of inbound webhooks:
  `apps/job-service/src/providers/hiringplatform/verify-signature.ts` (runs over the
  unparsed raw body).

**How to activate for real.** Complete the board's partner onboarding to obtain API
credentials and a webhook signing secret. Store them per tenant via the credential store.
Posting then calls the adapter's `postJob`; the board's inbound apply webhook is verified
against the raw body and parsed by `parseApplication`; disposition changes push back via
`syncDisposition` where the board's capabilities allow it. Adapters return `null` / `[]`
rather than synthesizing data when the board reports nothing.

---

## 3. Bot protection on the public apply page (Cloudflare Turnstile)

**What.** CAPTCHA-style bot protection on the public application submit.

**Why deferred.** Enforcement requires a Cloudflare Turnstile site key and secret. Without
`TURNSTILE_SECRET` the verification hook honestly no-ops (returns allowed) so dev and demo
are never blocked. This is intentional: an unconfigured environment should not lock out
real applicants.

**Interface.**
- `verifyTurnstile` at `apps/job-service/src/routes/public.ts` (verification helper).
- The `turnstileToken` field on `AcceptFastSchema` in the same file.
- Enforcement gate: the token is only checked when `TURNSTILE_SECRET` is set.

**How to activate for real.** Create a Turnstile widget in the Cloudflare dashboard,
render it on the apply page to obtain a client token, and set `TURNSTILE_SECRET` in the
job-service environment. The hook then validates each submitted token against Cloudflare's
siteverify endpoint and rejects failures.

---

## 4. KYC: PAN + bank-account (penny-drop) verification

**What.** Real Indian KYC during onboarding: PAN verification and bank-account
verification (penny-drop).

**Why deferred.** This requires a paid, India-specific KYC vendor account (Signzy / Karza /
Cashfree / Razorpay) with API credentials. No such account exists in this environment. The
shipped `StubKycProvider` shape-validates the input and returns an honest
`NEEDS_PROVIDER` state; the onboarding case can never reach `COMPLETED` on a stub result,
and no verification token is fabricated (see DECISIONS.md 8.1 for why a fake "mock token"
was deliberately not returned).

**Interface.**
- `KycProvider` (`verify(KycCheckInput) => Promise<KycCheckResult>`) at
  `apps/onboarding-service/src/lib/kyc.ts`.
- Provider registry `PROVIDERS` in the same file, with a commented `signzy` slot; provider
  selection via the `KYC_PROVIDER` env var (defaults to `stub`).
- Format validation lives upstream in shared Zod contracts (`SubmitPanSchema` /
  `SubmitBankAccountSchema` in `packages/contracts/src/dtos/onboarding.ts`), so bad formats
  are rejected with 400 before the provider is ever called.

**How to activate for real.** Implement a class satisfying `KycProvider` behind the vendor
credentials, register it in `PROVIDERS` keyed by a name, and set `KYC_PROVIDER` to that
name plus the vendor credentials in env. Note for the implementer: raw PAN / account data
is NOT stored (only masked), so a real adapter must verify inline at submission time. The
schema reserves an AES-GCM `encryptedPayload` column (null in stub mode) if async re-checks
are ever needed.

---

## 5. Production email delivery (SMTP / ESP)

**What.** Real outbound email for every mandated communication (offer letters, rejection
notices, invite links, interview invites, bulk-upload summaries, and so on).

**Why deferred.** This needs a real SMTP or ESP account (SendGrid / Amazon SES / etc.).
Dev uses Mailpit. Without `SMTP_URL`, `sendEmail` honest-fails: it logs and returns
`{ ok: false }` instead of throwing, and the delivery row is marked `FAILED` (not crashed).
Everything upstream (template rendering, recipient resolution, delivery row + retry) is
verified end to end; nothing leaves the box in an unconfigured environment.

**Interface.**
- `sendEmail(SendEmailInput)` in `apps/notification-service/src/lib/mailer.ts` (single
  nodemailer transport seam).
- Env: `SMTP_URL` (e.g. `smtp://user:pass@host:587`) and `SMTP_FROM`.
- Delivery rows and retries already exist in
  `apps/notification-service/src/workers/delivery.worker.ts`.

**How to activate for real.** Set `SMTP_URL` (and optionally `SMTP_FROM`) to a real ESP.
The existing transport, delivery-row and retry machinery then deliver for real with no code
change. For local verification, point `SMTP_URL` at Mailpit
(`smtp://mailpit:1025`) from docker-compose.

---

## 6. Native calendar events: Google / Microsoft (provider-sent invites + RSVP)

**What.** Provider-native calendar invites and RSVPs for interview scheduling: reading a
participant's free/busy and creating a real calendar event that the provider sends as an
invite.

**Why deferred.** This requires OAuth app registrations
(`GOOGLE_OAUTH_CLIENT_ID` / `_SECRET`, `MS_OAUTH_CLIENT_ID` / `_SECRET` / `_TENANT`) plus
per-user consent tokens. Unconfigured, `createExternalEvent` no-ops and the system falls
back to the ICS-email path (an ICS attachment over the email channel).

**Interface.**
- `fetchExternalBusy()` / `createExternalEvent()` / `resolveConnection()` /
  `getAuthUrl()` in `apps/interview-service/src/lib/calendar-connectors.ts`.
- Token source seam: the `CALENDAR_OAUTH_TOKENS` env JSON map (documented in the file
  header), designed to be swapped for a per-user `CalendarConnection` table.
- Provider OAuth env: `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET`,
  `MS_OAUTH_CLIENT_ID` / `_SECRET` / `_TENANT`.

**How to activate for real.** Register OAuth apps with Google and Microsoft, set the client
env vars, run the consent flow (`getAuthUrl` / `exchangeCode`) to obtain per-user tokens,
and back `resolveConnection` with a real `CalendarConnection` store instead of the
`CALENDAR_OAUTH_TOKENS` map. `createExternalEvent` then creates provider-sent invites and
`fetchExternalBusy` reads real free/busy; the ICS-email path stays as the fallback for
participants without a connected calendar.

---

## 7. Reliable media connectivity: TURN relay for the interview room

**What.** Reliable peer-to-peer media for candidates behind symmetric NATs or strict
corporate firewalls.

**Why deferred.** The built-in interview room uses P2P WebRTC with a single public STUN
server only (`stun:stun.l.google.com:19302`). That is the correct posture for the
"built-in, no external vendor" mandate, but a meaningful fraction of real candidate
networks (corporate / symmetric NAT) cannot establish a P2P connection without a TURN
relay. A TURN relay needs either a self-hosted coturn deployment with real credentials and
infrastructure, or a paid vendor (Twilio Network Traversal Service, Cloudflare Calls TURN).
Neither is buildable-and-verifiable in this repo alone.

**Interface.**
- The seam is the `ICE_SERVERS: RTCIceServer[]` constant at
  `apps/frontend/lib/collab/use-collab-room.ts`.
- The intended activation shape: make it config-driven via an `IceConfigDTO
  { urls, username?, credential? }[]` served by interview-service alongside the collab-token
  response (`apps/interview-service/src/routes/artifacts.ts`), so short-lived TURN
  credentials can be minted per session when a provider is configured.

**How to activate for real.** Stand up coturn (or subscribe to a TURN vendor), then serve
the ICE server list (including short-lived TURN credentials) from interview-service next to
the collab token, and have the room read `ICE_SERVERS` from that response instead of the
hardcoded STUN-only constant. Media then relays through TURN when a direct P2P path cannot
be established.

---

## 8. Code execution in the interview room

**What.** Running candidate code inside the live interview room.

**Why deferred (design choice, not a missing credential).** The interview room ships a
structured, live-synced code editor (`apps/frontend/components/cd/interview-room/CollabCode.tsx`),
not an in-room execution sandbox. The room captures and persists the code (and language)
into the permanent interview record; it does not execute it in-call. This is deliberate:
the room stays a dependency-free P2P relay with client-side CRDTs, and running untrusted
code needs an isolated sandbox that does not belong in the browser room.

Where code execution IS shipped: the native OA platform runs candidate code against an
isolated Judge0 sidecar (`apps/assessment-service/src/lib/judge0.ts`, env `JUDGE0_URL`),
returning per-test-case verdicts. So automated code grading exists; it lives in the
assessment path, not the live room.

**Interface / how to activate for real.** If live in-room execution is required later, the
seam is the code text the room already captures in `CollabCode`. Wire a "Run" action to
submit that text to the same isolated Judge0 sidecar used by the OA platform (never execute
in the browser or on the collab relay) and stream the verdict back over the existing collab
channel. This reuses the already-shipped `judge0.ts` client and its `JUDGE0_URL`
deployment, so no new execution infrastructure is introduced.
