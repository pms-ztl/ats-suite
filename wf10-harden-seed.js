export const meta = {
  name: 'wf10-hardening-gdpr-audit-seed',
  description: 'WF10 (SOURCE-ONLY): final production-readiness pass — GDPR/EU-AI-Act for OA, the no-fabrication contract audit across all new widgets/sources, per-module fail-open/closed policy, the demo entitlement seed (real TenantModule rows), and the deploy recipe/docs.',
  phases: [
    { title: 'Harden', detail: '4 agents: GDPR-OA, contract-audit test, fail-open policy, docs/recipe (disjoint)' },
    { title: 'Seed', detail: '1 agent: idempotent demo entitlement seed (real TenantModule rows, source-only)' },
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

const CTX = "Repo D:/CDC/ATS. Docker is up but this is SOURCE work; verify with host builds / `cd apps/frontend && npx tsc --noEmit`; do NOT run docker (the demo seed is WRITTEN now, RUN in the deferred integration pass). READ the real code FIRST: the compliance-service DSR/erasure path + the existing HITL review queue, the WF7 assessment-service models (Attempt/Answer/AssessmentResult/ProctorEvent) + the assessment.completed -> ApplicationStage.ASSESSMENT advance, the WF5/6 dashboard registry (lib/widgets/registry.ts + sources.ts with realData flags) + defaults (lib/widgets/defaults.ts), the WF1 MODULE_REGISTRY (@cdc-ats/common modules/registry, the failMode field) + WF4 resolver (billing modules.ts + is-module-on), the existing demo seed (infra/seed.sh or the seeder), the demo ENTERPRISE tenant (Pinnacle) + a FREE tenant. HARD RULES: REAL data / honest empty only; the demo seed enables features via REAL TenantModule rows (NOT code hacks) on the demo tenant ONLY and keeps a FREE tenant to prove gating still 402/404s; GDPR = no solely-automated reject (route OA outcomes to HITL, Art.22), DSR erasure must cover OA rows, store an explainability record per score; everything additive + backward-compatible; no em/en dashes. This is WF10 (final build WF) of a 10-workflow enterprise build.";

phase('Harden')
log('4 agents: gdpr-oa / contract-audit / fail-open policy / docs')
const harden = (await parallel([
  () => agent(CTX + "\n\n=== SLICE J1: GDPR / EU-AI-Act for OA ===\n(1) EDIT the compliance-service DSR/erasure path so a candidate data-subject erasure/export ALSO covers the OA rows (Attempt/Answer/AssessmentResult/ProctorEvent) keyed by candidateId — add the assessment-service calls/handlers needed (a new assessment-service /internal/gdpr/erase + /export by candidateId using prismaAdmin, invoked by compliance). (2) Ensure the OA scoring path stores an EXPLAINABILITY record per score (the autoVerdict/rationale already captured by WF7 grading is the basis; persist/expose it for the candidate-facing explanation). (3) Add a candidate AI-usage NOTICE on the OA runner (a short honest disclosure that AI assists scoring + a human reviews). (4) Confirm assessment.completed routes to the existing HITL queue with NO solely-automated reject (Art.22). Build the touched services + frontend. In `contract` give the erase/export endpoints + the explainability field + the notice location.", { label: 'j1:gdpr', phase: 'Harden', schema: REPORT }),
  () => agent(CTX + "\n\n=== SLICE J2: no-fabrication contract audit (test) ===\nNEW a real vitest test (in apps/frontend or packages) that PROGRAMMATICALLY enforces the honest-empty invariant: (a) EVERY dashboard registry CatalogEntry.dataSourceKey (lib/widgets/registry.ts) resolves to a sources.ts entry with realData:true (except the source-less markdown_note/quick_actions); (b) the not-bindable landmine keys (decisions_list/source_of_hire/adverse_impact/compliance_score/diversity_score) are realData:false AND do NOT appear in any seeded default document (lib/widgets/defaults.ts) or any registry entry; (c) every widget in every seeded default doc references a registered widgetType. Wire it into the test runner. Run it and report pass. In `contract` give the test file + what it asserts.", { label: 'j2:audit', phase: 'Harden', schema: REPORT }),
  () => agent(CTX + "\n\n=== SLICE J3: per-module fail-open/closed policy ===\nEDIT the WF1 MODULE_REGISTRY (@cdc-ats/common modules/registry.ts) so each manifest declares an explicit failMode: HARD-gate (failMode:'closed') the modules where a billing outage must NOT silently grant access (compliance, white-label-embed, oa-assessments billing-sensitive paths, any SSO/governance) and soft-gate (failMode:'open') the rest. CONFIRM the WF4 resolver + the is-module-on helper honor failMode (they were built to read getModule().failMode) — fix if any path ignores it. Rebuild common. In `contract` list each module's failMode + confirm the resolver enforces it.", { label: 'j3:failmode', phase: 'Harden', schema: REPORT }),
  () => agent(CTX + "\n\n=== SLICE J5: deploy recipe + docs ===\nUpdate the deploy documentation (append to DESIGN_SPEC.md or a NEW DEPLOY.md): the full migrator-rebuild recipe for the WF3 schema batch (regen prisma per svc -> host build -> REBUILD migrator image so baked schema includes new cols -> db push -> recreate each svc --no-deps -> restart -> re-run apply-rls), the new env vars (EMBED_SECRET, ATS_CONFIG_ENC_KEY, ASSESSMENT_DATABASE_URL/APP, JUDGE0_URL + Judge0 creds), the new docker-compose services (assessment-service 4014 + Judge0 isolated sidecar), the new npm deps (react-grid-layout, nanoid, @monaco-editor/react, ajv), and how to enable the new modules per tenant. Document that v1 stays additive/backward-compatible. In `contract` give the doc file + the recipe outline.", { label: 'j5:docs', phase: 'Harden', schema: REPORT }),
])).filter(Boolean)
log('Harden done: ' + harden.length + '/4')

phase('Seed')
log('demo entitlement seed (source-only)')
const seed = await agent(CTX + "\n\n=== SLICE J4: demo entitlement seed (idempotent, source-only) ===\nWRITE (do NOT run) an idempotent seed that, for the demo ENTERPRISE tenant (Pinnacle), inserts REAL TenantModule rows enabling oa-assessments + custom-dashboards + white-label-embed (and any other new modules that should be ON for the demo), and seeds a sample tenant-default DashboardLayout + a tenant theme (dashboardThemeTokens/defaultColorMode) + embedAllowedOrigins for the demo origin — all via REAL rows (billing TenantModule, identity DashboardLayout, tenant theme columns), NOT code hacks. Keep a FREE tenant with these modules OFF so the gating proof (402/404) still holds. Add it to the existing seed mechanism (infra/seed.sh / the seeder) as an idempotent step that runs for new AND existing demo tenants. It must be safe to run repeatedly. Do NOT run docker; this is written now and executed in the deferred integration pass. In `contract` give the seed steps + which tenant gets what + the idempotency guard.", { label: 'j4:seed', phase: 'Seed', schema: REPORT })
log('Seed done: buildClean=' + (seed && seed.buildClean))

return { harden, seed }
