export const meta = {
  name: 'spec-gap-verify-and-fill',
  description: 'Audit the 4 genuine gap areas against the real code, then build ONLY what is actually missing (conditional on the audit). Source-only (Docker down): write-only agents, orchestrator builds. Covers the 6-stage flow, the AI alignment-score card, real-time OA results display, and the one-click Hire->offer->email->onboarding chain.',
  phases: [
    { title: 'Audit', detail: '4 read-only agents establish exactly what exists vs missing' },
    { title: 'Fill', detail: 'build only the areas the audit flagged as a real gap (disjoint)' },
  ],
}

const AUD = { type: "object", additionalProperties: false, properties: {
  area: { type: "string" },
  currentState: { type: "string", description: "what EXISTS today, cite file:line" },
  gapExists: { type: "boolean", description: "true ONLY if a real, user-visible gap remains vs the spec" },
  buildSpec: { type: "string", description: "if gapExists: the precise, minimal, ADDITIVE source changes to close it (files + what to add), reusing existing patterns; if no gap: empty" },
}, required: ["area", "currentState", "gapExists", "buildSpec"] };

const REPORT = { type: "object", additionalProperties: false, properties: {
  files: { type: "array", items: { type: "string" } }, summary: { type: "string" }, buildClean: { type: "boolean" }, notes: { type: "string" },
}, required: ["files", "summary", "buildClean", "notes"] };

const ACTX = "Repo D:/CDC/ATS, a multi-tenant AI ATS (Next.js 14 frontend apps/frontend; Express microservices apps/* incl candidate-service, screening-service, assessment-service, interview-service, onboarding-service, notification-service, job-service; Prisma/Postgres + RLS). READ-ONLY for the audit. Cite file:line. This system is ~90% built across prior sessions; your job is to find whether a SPECIFIC spec requirement is GENUINELY missing/incomplete (a real user-visible gap) vs already satisfied. Be honest: if it already exists, say gapExists=false and do NOT invent work. If it is partial, gapExists=true with a MINIMAL additive buildSpec that reuses existing patterns (no rebuilds).";

const BCTX = "Repo D:/CDC/ATS. EXECUTION RULE: write SOURCE ONLY — no npm/npx/tsc/prisma/docker (Docker is down on this host and those pop a Windows app-picker; the orchestrator builds + regenerates prisma + verifies). NodeNext ESM for services (.js imports). Build EXACTLY the buildSpec the audit produced for your area — minimal + ADDITIVE, reusing the existing patterns it cites; do NOT rebuild working features. HARD RULES: real data or honest empty states only (no fabricated scores/data); every change additive + backward-compatible (frozen v1 + current v2 unaffected); match existing idioms; no em/en dashes.";

phase('Audit')
log('4 read-only audits: stages / alignment-score / OA-realtime / hire-chain')
const audit = (await parallel([
  () => agent(ACTX + "\n\nAREA: 6-STAGE CANDIDATE FLOW. Spec wants: Application -> Resume Screening -> Assessment -> Technical Round -> HR Round -> Offer Letter, all managed in-system with multi-level interviews (L1/L2/L3). Read candidate-service prisma/schema.prisma (the ApplicationStage/status enum + Application model), the stage-transition logic, interview-service (how interview LEVELS map to stages), and the frontend pipeline UI. Determine: are Technical Round + HR Round represented as EXPLICIT, user-visible pipeline stages (or only as generic interview levels)? Is the full ordered flow enforced/visible end to end? gapExists=true only if Technical/HR are not first-class stages or the flow is not coherent end-to-end; buildSpec = the minimal additive stage/labels/transition + pipeline-UI changes (note any candidate-service schema enum addition the orchestrator must prisma-generate + migrate later).", { label: 'au:stages', phase: 'Audit', schema: AUD }),
  () => agent(ACTX + "\n\nAREA: AI CANDIDATE ALIGNMENT SCORE. Spec wants a VISIBLE per-candidate score showing how well they align to the JD: overall match %, technical-skills match, experience relevance, strengths, and missing skills. Read screening-service (the candidate-screener LLM output shape + what fields it produces), candidate-service, and the frontend candidate profile (components/cd/screens/CandidateProfile.tsx + candidate-profile-live.tsx) + any existing match/score UI. Determine: does the screener already produce these dimensions, and is a multi-dimensional alignment CARD visible on the candidate profile? gapExists=true only if the multi-dimensional breakdown (overall %, tech match, experience relevance, strengths, missing skills) is not surfaced as a real card fed by real screener data; buildSpec = the minimal additive screener-output enrichment (only if the dimensions are not already produced) + the frontend alignment card (reusing dashboard-kit/charts), real-data-only with honest empty when unscored.", { label: 'au:alignment', phase: 'Audit', schema: AUD }),
  () => agent(ACTX + "\n\nAREA: REAL-TIME OA RESULTS IN THE ATS. Spec wants: trigger OA on HackerRank/HackerEarth/etc and see, inside the ATS, how many problems a candidate solved + related details, real-time, without visiting the vendor. Read assessment-service (the provider adapters' fetchResult + the AssessmentResult model + the inbound webhook/poll that ingests vendor results), and the frontend (the assessment results UI + candidate profile). Determine: are vendor results (score, problems-solved, per-section breakdown) INGESTED and DISPLAYED inside the ATS candidate/assessment view? gapExists=true only if the vendor result data is fetched but NOT surfaced as a results panel (problems solved / score / status) in the UI; buildSpec = the minimal additive results-display panel (+ a refresh/fetch action if missing), bound to the REAL AssessmentResult/provider data, honest-empty when none.", { label: 'au:oa', phase: 'Audit', schema: AUD }),
  () => agent(ACTX + "\n\nAREA: ONE-CLICK HIRE -> OFFER + EMAIL + ONBOARDING. Spec wants: a Hire/Approve button that triggers the workflow, generates the offer document, sends the candidate email, and kicks off onboarding (Workday-style KYC/PAN/bank case) - all in one action, no external systems. Read candidate-service (decision-events / hire / approve handlers), the offer generation, notification-service (offer/hire emails), and onboarding-service (case creation + how it is triggered), plus the frontend Hire button. Determine: does clicking Hire ALREADY fire the full chain (offer doc -> candidate email -> onboarding case) in one action, or are these steps disconnected? gapExists=true only if the one-click chain is NOT wired end-to-end; buildSpec = the minimal additive wiring (e.g. a NATS event on hire that onboarding-service subscribes to create a case, + the offer-doc + email triggers) reusing the existing offer/notification/onboarding services.", { label: 'au:hire', phase: 'Audit', schema: AUD }),
])).filter(Boolean)
log('Audit done. Gaps: ' + audit.filter(a => a.gapExists).map(a => a.area).join(', ') || 'NONE')

phase('Fill')
const gaps = audit.filter(a => a && a.gapExists && a.buildSpec && a.buildSpec.trim().length > 0)
log(gaps.length + ' real gap(s) to fill: ' + gaps.map(g => g.area).join(', '))
let fill = []
if (gaps.length) {
  fill = (await parallel(gaps.map((g) => () =>
    agent(BCTX + "\n\n=== FILL: " + g.area + " ===\nThe audit established the current state:\n" + g.currentState + "\n\nBuild EXACTLY this (minimal, additive, reuse existing patterns), source-only:\n" + g.buildSpec + "\n\nReport the files changed + buildClean (your best judgment; orchestrator does the authoritative build).",
      { label: 'fill:' + g.area.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24), phase: 'Fill', schema: REPORT })
  ))).filter(Boolean)
} else {
  log('No real gaps found by the audit - everything already satisfied.')
}

return { audit, fill }
