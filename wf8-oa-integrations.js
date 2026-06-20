export const meta = {
  name: 'wf8-oa-thirdparty-adapters',
  description: 'WF8 (SOURCE-ONLY): 5-vendor assessment-provider path (HackerEarth/Codility/iMocha/TestGorilla/HackerRank) on the existing integration framework with now-mandatory AES-GCM credential encryption, webhook-first + polling-safety-net delivery. All behind the oa-assessments module.',
  phases: [
    { title: 'Crypto', detail: '1 agent: AES-GCM encrypt TenantIntegration creds + lift kind enum (hard prerequisite)' },
    { title: 'Adapters', detail: '1 agent: AssessmentProvider interface + 5 vendor adapters' },
    { title: 'WorkersWebhook', detail: '3 agents: outbound invite worker, inbound webhook+gateway, poll reconciler' },
    { title: 'Frontend', detail: '1 agent: settings integrations UI for the new provider kinds' },
  ],
}

const REPORT = {
  type: "object", additionalProperties: false,
  properties: {
    files: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    buildClean: { type: "boolean" },
    contract: { type: "string" },
    notes: { type: "string" },
  },
  required: ["files", "summary", "buildClean", "contract", "notes"],
}

const CTX = "Repo D:/CDC/ATS. Docker is up but assessment_db is unmigrated (deferred) — write SOURCE that COMPILES; verify with `npm run build --workspace=@cdc-ats/<svc>` / `cd apps/frontend && npx tsc --noEmit`; do NOT run docker. READ the real patterns FIRST: notification-service integrations.ts (TenantIntegration model + the hardcoded [slack,email] kind enum ~line 21 + the CRUD), @cdc-ats/common crypto/aes-gcm (WF1: encryptConfig/decryptConfig/isEncrypted, env ATS_CONFIG_ENC_KEY), the WF7 assessment-service (AssessmentInvite with provider/providerInvitationId/providerSecret fields, AssessmentResult, the grading worker, lib/queue, lib/nats, the assessment.completed publish, the WF7 judge0-callback RAW gateway proxy + inbound-email RAW proxy ~787-795 as the inbound-webhook template), the WF7 gateway /api/assessments + /api/public/assessment wiring + requireModule('oa-assessments'). HARD RULES: REAL data or honest empty ONLY — NormalizedResult is populated from the REAL vendor payload or null, NEVER synthesized; credentials MUST be AES-GCM encrypted at rest (the plaintext store is the one prod blocker) with a BACKWARD-COMPATIBLE read (detect plaintext via isEncrypted, encrypt-on-next-write, do NOT break existing slack/email rows); inbound webhook resolves tenant FROM the providerInvitationId correlation (no auth ctx) via prismaAdmin; vendor rate limits respected (HackerRank 10rps/429); no auto-reject (route to HITL); no em/en dashes. This is WF8 of a 10-workflow enterprise build.";

phase('Crypto')
log('AES-GCM credential encryption (hard prerequisite)')
const crypto = await agent(CTX + "\n\n=== SLICE H1: encrypt TenantIntegration creds + lift kind enum ===\nEDIT apps/notification-service integrations.ts: (1) lift the hardcoded [slack,email] kind enum to a registry/array that ALSO includes the new assessment-provider kinds: hackerrank, codility, hackerearth, imocha, testgorilla (additive; existing kinds keep working). (2) Apply @cdc-ats/common AES-GCM encryptConfig() to the integration `config` (which holds API keys/tokens) BEFORE persisting, and decryptConfig() on read. BACKWARD-COMPATIBLE: on read, use isEncrypted() to detect legacy plaintext rows and decrypt only if encrypted (plaintext passes through), and encrypt-on-next-write so existing slack/email rows migrate without a destructive data migration. NEVER return the decrypted secret to the client (the GET should redact/omit secret fields). Build: npm run build --workspace=@cdc-ats/notification-service (+ common if touched). In `contract` give the kind registry + the encrypt/decrypt boundary + the redaction rule.", { label: 'h1:crypto', phase: 'Crypto', schema: REPORT })
log('Crypto done: buildClean=' + (crypto && crypto.buildClean))

phase('Adapters')
log('AssessmentProvider interface + 5 adapters')
const adapters = await agent(CTX + "\n\n=== SLICE H2: provider adapter interface + 5 vendors ===\nNEW apps/assessment-service/src/providers/: an AssessmentProvider TS interface { id, listTests(creds), invite(req)->{providerInvitationId, candidateTestUrl, status}, fetchResult(providerInvitationId, creds)->NormalizedResult|null, verifyWebhook(headers, rawBody, secret)->boolean, parseWebhook(rawBody)->NormalizedResult } and 5 adapter files (one DISJOINT file each): hackerearth.ts, codility.ts, imocha.ts, testgorilla.ts, hackerrank.ts. Each implements the real vendor API shapes from the architecture/research (HackerEarth POST /partner/hackerearth/invite/ client_id/secret send_email:false per-invite report_callback_urls; Codility POST /api/tests/{id}/invite/ Bearer event_callbacks; iMocha POST /v3/.../invite x-api-key callbackUrl sendEmail:no; TestGorilla POST /assessments/{id}/invite_candidate/ Token no_email:true; HackerRank Basic/Bearer v3, NO per-invite webhook -> fetchResult/polling only, respect 10rps/429). NormalizedResult { providerInvitationId, provider, status, score?, maxScore?, percentage?, passed?, plagiarismFlag?, reportUrl?, sections?, startedAt?, completedAt?, raw }. A providers/index.ts registry maps providerKey -> adapter. NEVER fabricate a result — return null when the vendor has none. Build assessment-service. In `contract` give the interface + the registry + each adapter's invite/result/webhook specifics.", { label: 'h2:adapters', phase: 'Adapters', schema: REPORT })
log('Adapters done: buildClean=' + (adapters && adapters.buildClean))

phase('WorkersWebhook')
log('outbound invite worker / inbound webhook+gateway / poll reconciler')
const ww = (await parallel([
  () => agent(CTX + "\n\n=== SLICE H3: outbound provider-invite worker (assessment-service) ===\nNEW apps/assessment-service/src/workers/provider-invite.worker.ts (BullMQ, clone the grading worker boot idiom; start in index.ts): consumes a provider-invite job, loads the tenant's encrypted vendor creds (via the notification integration store / decryptConfig), calls the adapter.invite(), is vendor RATE-LIMIT aware (HackerRank 10rps/429 backoff), IDEMPOTENT per providerInvitationId, stores AssessmentInvite.provider + providerInvitationId + the AES-GCM-encrypted providerSecret, sets status SENT. SHORT-CIRCUITS via @cdc-ats/common isModuleEnabled when oa-assessments is off. Add an enqueue helper to lib/queue.ts (a new queue name) + wire the invite route (WF7 invites.ts) to enqueue a provider invite when invite body specifies a provider (keep native invite the default). Build assessment-service. In `contract` give the job shape + queue name.", { label: 'h3:invite', phase: 'WorkersWebhook', schema: REPORT }),
  () => agent(CTX + "\n\n=== SLICE H4: inbound result webhook + gateway raw proxy ===\nNEW apps/assessment-service/src/routes/inbound-assessment.ts (mounted with readAuthHeaders({optional:true, publicWebhook:true}), prismaAdmin): POST /internal/inbound-assessment/:provider/:inviteId -> resolve the adapter, provider.verifyWebhook(headers, rawBody, the decrypted per-invite providerSecret) (reject on failure), provider.parseWebhook(rawBody) -> NormalizedResult, resolve {tenantId, applicationId} FROM the AssessmentInvite.providerInvitationId correlation, upsert AssessmentResult (prismaAdmin), publish NATS assessment.completed (advances ApplicationStage.ASSESSMENT + HITL, exactly like the native path, NO auto-reject). It needs the RAW body for HMAC verify (express.raw). EDIT apps/api-gateway/src/app.ts to add a RAW createProxyMiddleware /api/inbound-assessment -> assessment /internal/inbound-assessment (mirror the WF7 judge0-callback / inbound-email block, NO X-Internal-Service stamp, NOT module-gated since vendors call it). Build assessment + gateway. In `contract` give the route + verify/correlation flow + the gateway mapping.", { label: 'h4:webhook', phase: 'WorkersWebhook', schema: REPORT }),
  () => agent(CTX + "\n\n=== SLICE H5: poll reconciler (assessment-service) ===\nNEW apps/assessment-service/src/workers/assessment-poll.worker.ts (BullMQ repeatable/backoff; start in index.ts): for any AssessmentInvite with a provider set and status still pending (SENT/STARTED, not COMPLETED/EXPIRED), call adapter.fetchResult() on backoff (~every 30 min up to expiresAt) -> if a real result exists, upsert AssessmentResult + publish assessment.completed (idempotent with the webhook path; skip if already COMPLETED). This covers HackerRank (no webhook) + dropped webhooks. SHORT-CIRCUITS via isModuleEnabled when the module is off. Build assessment-service. In `contract` give the schedule + idempotency rule.", { label: 'h5:poll', phase: 'WorkersWebhook', schema: REPORT }),
])).filter(Boolean)
log('WorkersWebhook done: ' + ww.length + '/3')

phase('Frontend')
log('settings integrations UI for new provider kinds')
const fe = await agent(CTX + "\n\n=== SLICE H6: settings integrations UI ===\nEDIT the frontend settings integrations page (app/(dashboard)/settings/integrations/page.tsx) to surface the new assessment-provider kinds (hackerrank/codility/hackerearth/imocha/testgorilla): let a tenant admin add/configure provider credentials (API key/token, test id) via the existing /api/integrations CRUD. The config form must NEVER display a previously-saved secret back (write-only / masked), matching the H1 redaction. Show the new kinds only when the oa-assessments module is enabled (use-modules). Honest empty state when none configured. Build: cd apps/frontend && npx tsc --noEmit. In `contract` give the UI fields per provider + the masking behavior.", { label: 'h6:ui', phase: 'Frontend', schema: REPORT })
log('Frontend done: buildClean=' + (fe && fe.buildClean))

return { crypto, adapters, ww, fe }
