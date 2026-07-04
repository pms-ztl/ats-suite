# Assessment Integration Runbook - HackerRank and HackerEarth

For NCR Voyix. This is the operator runbook for connecting the ATS to the coding /
technical-assessment vendors your team uses: **HackerRank** (HackerRank for Work) and
**HackerEarth**. It describes exactly what the shipped code does today - the invite,
take, and result-sync flow, what data lands in the ATS, and the honest state of each
integration before and after you add your own API keys.

Every step below maps to real code. The adapters are code-complete and make real
vendor HTTP calls; they are **inert until your credentials are pasted in** - until
then the provider shows "Not connected" and no candidate can be invited on it. No
fabricated "connected" state and no fake scores are ever shown.

Same-family vendors (Codility, iMocha, TestGorilla) work identically; this runbook
focuses on HackerRank and HackerEarth as requested.

---

## 0. TL;DR of the two vendors' result channels

The single most important operational difference:

| Vendor | Auth | Result sync channel (as shipped) |
|---|---|---|
| **HackerRank** | Bearer API key (v3) | **Polling only.** HackerRank for Work has no per-invite completion webhook; the ATS poll reconciler retrieves the result. |
| **HackerEarth** | `client_id` + `client_secret` (+ optional webhook secret) | **Polling today**, with a signed webhook path also implemented in the code (see §5.2 for the honest nuance). |

Both vendors reliably deliver results via the **poll reconciler** with zero extra
setup. The HackerEarth webhook is an optional accelerator, not a requirement.

---

## 1. Prerequisites

1. **The `oa-assessments` module must be enabled** for your tenant. The Assessment
   Providers configuration panel only appears when it is (`useModules` in
   `apps/frontend/app/(dashboard)/settings/integrations/page.tsx`). The invite worker
   and poll reconciler also short-circuit for any tenant with the module off
   (`isModuleEnabled(tenantId, "oa-assessments")`).
2. **You must be a workspace ADMIN.** Only ADMIN can add or change assessment-provider
   credentials - the panel shows "Admin only" to everyone else, matching the
   `requireTenantAdmin` gate on the save/delete API routes.
3. **A vendor account** with API access: HackerRank for Work (API key), and/or a
   HackerEarth Assessment account (Partner API `client_id` + `client_secret`).
4. **`ATS_CONFIG_ENC_KEY` must be set** on the platform. Every credential you paste is
   AES-256-GCM encrypted at rest with this key; it is never stored or logged in
   plaintext, and secret fields are never shown again after saving.

---

## 2. Where to connect: Settings → Integrations

Navigate to **Settings → Integrations** in the ATS. Below the integrations
marketplace you will find the live **Assessment providers** panel. Before you add any
credentials it shows an honest empty state:

> "No assessment provider is configured yet. Choose a provider below and add its
> credentials to start inviting candidates to tests."

Each provider card shows **Not connected** until credentials are saved, then flips to
**Configured**. This status reflects only whether a credential row exists - it is not
a fake claim that a live handshake succeeded.

### 2.1 Connect HackerRank

On the **HackerRank** card, click **Connect** and fill in:

| Field | Secret? | What to paste |
|---|---|---|
| **API key** | yes (write-only) | Your HackerRank for Work v3 personal access token. HackerRank for Work → Settings → API. |
| **API token (optional)** | yes | Only if your account uses a separate Bearer token form. |
| **Base URL (optional)** | no | Leave blank to use `https://www.hackerrank.com`. Override only for a dedicated instance. |

The adapter (`apps/assessment-service/src/providers/hackerrank.ts`) sends
`Authorization: Bearer <apiKey>` on every call. Click **Save**. The card now reads
**Configured**.

### 2.2 Connect HackerEarth

On the **HackerEarth** card, click **Connect** and fill in:

| Field | Secret? | What to paste |
|---|---|---|
| **Client ID** | yes (write-only) | Your HackerEarth Partner API `client_id`. HackerEarth Assessment → Integrations. |
| **Client secret** | yes | Your HackerEarth `client_secret`. |
| **Webhook secret (optional)** | yes | The report-callback signing secret, if you plan to use the webhook accelerator (§5.2). Leave blank to rely on polling. |

The adapter (`apps/assessment-service/src/providers/hackerearth.ts`) sends the
`client_id` + `client_secret` in the JSON body of each Partner API call. Click
**Save**.

### 2.3 Write-only secret handling (important)

- Secret fields are **write-only**. After you save, the field renders empty and the
  redacted API returns at most a masked hint (e.g. `…1234`) as the placeholder - never
  the real value.
- To rotate a key, type the new value and save. **Leaving a secret field blank
  preserves the currently stored secret** (a blank secret is omitted from the update),
  so you can edit a non-secret field like Base URL without retyping the key.
- **Remove** deletes the stored credentials; the card returns to **Not connected** and
  the provider goes inert again.

---

## 3. The invite → take → result flow

Once a provider is configured, the flow for a candidate is:

### 3.1 Invite (ATS → vendor)

A recruiter/hiring manager invites a candidate to a specific vendor test. Under the
hood the ATS creates an invite in **external-vendor mode**
(`apps/assessment-service/src/routes/invites.ts`, `POST
/api/assessments/:id/invite`): you pass `provider` (`"hackerrank"` /
`"hackerearth"`) and `providerTestId` (the vendor's own test id). The ATS:

1. Creates a local invite row as **PENDING** and enqueues an outbound provider-invite
   job (async; the recruiter's request returns immediately). No vendor id is
   fabricated here.
2. The provider-invite worker
   (`apps/assessment-service/src/workers/provider-invite.worker.ts`) loads your
   **decrypted** credentials at the point of use, calls `adapter.invite(...)` on the
   real vendor, and stores the REAL `providerInvitationId` the vendor returns. It flips
   the invite to **SENT**.
3. Both adapters send **`send_email: false`** to the vendor - a hard rule: the vendor
   must NOT email the candidate. The ATS owns all candidate communication. The ATS then
   publishes `assessment.invited` so the notification-service emails the candidate the
   take link (the vendor's test URL when the vendor returns one, else a native
   fallback link).

If no credentials are configured for that vendor, the worker does NOT fabricate an
invite - it leaves the invite un-SENT and routes it to manual handling and logs
`no vendor credentials configured`.

Rate limits are respected: the worker caps issuance throughput and each adapter spaces
its calls and honors the vendor's per-second cap + `Retry-After` 429 backoff (e.g.
HackerRank ~10 rps).

### 3.2 Take (candidate → vendor)

The candidate clicks the emailed link and takes the test **on the vendor's platform**
(HackerRank / HackerEarth host the actual coding environment). The ATS does not proxy
the test-taking; it holds the correlation (`providerInvitationId`) so it can retrieve
the result.

### 3.3 Result sync (vendor → ATS)

This is where the two vendors differ.

**HackerRank - polling (the only channel).** HackerRank for Work has no per-invite
webhook. The **poll reconciler** (`apps/assessment-service/src/workers/
assessment-poll.worker.ts`) runs on a Redis-backed repeatable schedule (default every
30 minutes; `ASSESSMENT_POLL_INTERVAL_MIN` overrides for demos). Each tick, for every
provider-backed invite still pending, it calls `adapter.fetchResult(...)` on the
vendor. HackerRank encodes the result key as a compound `{testId}:{candidateId}` id, so
one opaque id round-trips through polling. A genuinely completed, scored candidate
yields a result; a still-in-progress candidate yields `null` and is left for the next
tick - **never a fabricated zero**.

**HackerEarth - polling today (see §5.2 for the webhook).** The same poll reconciler
calls HackerEarth's report endpoint (`POST /partner/hackerearth/report/` with the
`invitation_id`) each tick and ingests a real completed report. HackerEarth also
supports a signed completion webhook, whose receiver is implemented in the ATS
(§5.2) - but as shipped the invite does not auto-register the callback URL, so polling
is the guaranteed channel for HackerEarth too.

Either way, the result is ingested through **one shared code path**
(`ingestVendorResult`) that both the webhook and the poll use, so the two are
byte-identical and idempotent with each other (a result already finalized by one path
is a no-op for the other).

---

## 4. What data lands in the ATS

When a real result is ingested (from either channel), the ATS stores an
`AssessmentResult` built strictly from the REAL vendor payload (the raw payload is
kept verbatim). Depending on what the vendor reports, that includes:

- **Score** and **max score** (the raw numbers the vendor returned).
- **Percentage** - the vendor's explicit percentage, or derived from score/max when
  the vendor gives both.
- **Sections / per-problem breakdown** - HackerRank question/score-breakdown entries;
  HackerEarth report `sections` (name, score, max, percentage). This is where
  "problems-solved" per-section detail lands.
- **Plagiarism flag** - HackerRank `plagiarism` / `plagiarism_status`; HackerEarth
  `plagiarism_flagged`.
- **Pass/fail** - HackerEarth `passed` when present (HackerRank does not report a
  boolean pass, so it stays null).
- **Report URL** - a link to the vendor's full PDF/report when the vendor returns one.
- **Started / completed timestamps.**

Honesty rules that govern what is stored:

- A score/percentage is stored **only when the vendor actually reported one**. A
  completion event with no numeric result is routed to **manual review**
  (`pendingManualReview = true`) rather than being recorded as a zero.
- On a real result the ATS publishes `assessment.completed` - the same event the
  native take path emits - which advances the application's `ASSESSMENT` stage and
  routes to the existing Human-in-the-Loop (HITL) queue.
- **No auto-reject.** This path never rejects a candidate on the vendor's number
  alone; a human owns any candidate-facing decision (GDPR Art. 22). `passed` is left
  null whenever a result needs a human look.

---

## 5. Result-sync details and options

### 5.1 Polling (default, zero extra setup)

The poll reconciler is the guaranteed result channel for both vendors and needs
nothing beyond the credentials you pasted in §2. Operational notes:

- Runs on **one replica at a time** (a Redis-backed BullMQ repeatable job), regardless
  of how many assessment-service pods run.
- Default cadence **every 30 minutes**; set `ASSESSMENT_POLL_INTERVAL_MIN` lower for a
  demo or a time-sensitive round. A tick is rate-limited per vendor and caps invites
  processed per tick (`ASSESSMENT_POLL_MAX_PER_TICK`, default 500) so one large tenant
  cannot starve others.
- It is also the **dropped-webhook backstop**: even for webhook-capable vendors, a
  callback that never arrives (network blip, vendor outage, a restart) is reconciled on
  the next poll.
- A genuinely lapsed invite (past `expiresAt` + grace with no result) is marked
  **EXPIRED** so it stops being polled. EXPIRED is a lifecycle fact, not an adverse
  decision - no auto-reject.

### 5.2 HackerEarth webhook (optional accelerator - honest state)

The ATS ships a complete **inbound webhook receiver** for vendor results
(`apps/assessment-service/src/routes/inbound-assessment.ts`), exposed through the
gateway at:

```
POST /api/inbound-assessment/hackerearth/{providerInvitationId}
```

The receiver verifies the vendor's HMAC-SHA256 signature over the raw request body
(header `X-HackerEarth-Signature`, keyed by the per-invite/webhook secret you saved)
**before trusting a single byte**, resolves the owning tenant/application from the
`providerInvitationId` correlation key (no auth header is required - the unguessable id
+ the signature are the credential), then ingests the result through the same shared
path as polling. A forged/unsigned/wrong-secret callback is rejected with 401 and
nothing is persisted.

**Honest nuance - the callback URL is not auto-registered today.** The HackerEarth
adapter's `invite()` will send `report_callback_urls: [webhookUrl]` to HackerEarth
*when a `webhookUrl` is supplied*, and the invite worker forwards a `webhookUrl` if the
invite job carries one - but the invite route does not currently populate that field
(see the comment in `apps/assessment-service/src/routes/invites.ts` around the
provider-invite enqueue). So as shipped:

- The webhook **receiver, signature verification, and ingest are fully implemented and
  live** end to end.
- HackerEarth is **not automatically told** to call it, so in practice HackerEarth
  results arrive via the poll reconciler.

To use the webhook accelerator today you would register the callback URL
`https://<your-ats-host>/api/inbound-assessment/hackerearth/<providerInvitationId>` on
the HackerEarth side (or wire the `webhookUrl` through the invite), and save the
matching **Webhook secret** in §2.2 so signatures verify. Polling remains the
guaranteed channel regardless, so the webhook is a latency optimization, not a
requirement.

HackerRank has no webhook path at all - its adapter's `verifyWebhook()` returns false
and `parseWebhook()` returns null by design; a forged HackerRank callback resolves no
result. HackerRank results come solely from polling.

---

## 6. The inert-until-keys state (honest posture)

Before you paste credentials, each integration is genuinely inert - this is deliberate,
not a bug:

- The provider card shows **Not connected** and no fake score, no fake "connected"
  handshake.
- Attempting a vendor invite with no configured credentials does not fabricate a vendor
  id: the worker leaves the invite un-SENT and routes it to manual handling.
- The poll reconciler skips any tenant/provider with no usable credentials (it logs
  `no usable creds for tenant/provider` and moves on) - it never invents a result.
- A credential-store outage is treated as transient (retry next tick), never mistaken
  for "no vendor configured."

Once you save real keys, the exact same code paths light up against the real vendor -
no code change, no redeploy. That is the whole design: the adapters are real and
waiting on your credentials.

---

## 7. Quick verification checklist

After connecting a vendor, confirm the integration is live:

1. Settings → Integrations → Assessment providers: the HackerRank / HackerEarth card
   reads **Configured**.
2. Invite a test candidate to a real vendor test id. The invite appears (PENDING →
   SENT once the worker confirms the real vendor invitation id) and the candidate
   receives the ATS-sent email (the vendor did not email them - `send_email: false`).
3. Have the candidate complete the test on the vendor. Within one poll cycle (lower
   `ASSESSMENT_POLL_INTERVAL_MIN` to speed this up in a demo), the `AssessmentResult`
   appears with the real score, percentage, section breakdown, and plagiarism flag, and
   the application advances to the `ASSESSMENT` stage / HITL queue.
4. Confirm no auto-decision was made - the candidate is routed for human review, not
   auto-rejected.

---

## Referenced files

- `apps/assessment-service/src/providers/hackerrank.ts` - HackerRank for Work v3 adapter (Bearer, polling-only)
- `apps/assessment-service/src/providers/hackerearth.ts` - HackerEarth Partner API adapter (client_id/secret, HMAC webhook verify)
- `apps/assessment-service/src/routes/invites.ts` - invite creation (native + external-vendor modes)
- `apps/assessment-service/src/workers/provider-invite.worker.ts` - outbound vendor invite (send_email:false, encrypted per-invite secret)
- `apps/assessment-service/src/workers/assessment-poll.worker.ts` - the poll reconciler (guaranteed result channel)
- `apps/assessment-service/src/routes/inbound-assessment.ts` - signed inbound webhook receiver
- `apps/frontend/app/(dashboard)/settings/integrations/page.tsx` - the credential-entry UI (write-only secrets, honest states)

For the broader deferred-integration posture (why the adapters ship inert and how each
is activated), see `DEFERRED.md` §1. For the engineering rationale behind the
honest-stub / manual-route discipline, see `DECISIONS.md` §5.5.
