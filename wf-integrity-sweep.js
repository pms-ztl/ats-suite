export const meta = {
  name: 'app-integrity-sweep',
  description: 'App-wide integrity sweep: find + fix fabricated/mock data presented as real, dead/stub/unwired backend routes, and broken/hardcoded/placeholder redirects - making every redirect dynamic + working. Audit (read-only) then conditional fix by disjoint directory territory. Preserves honest empty-states + honest vendor-gated stubs (those are CORRECT). Write-only fixers; orchestrator builds/tests.',
  phases: [
    { title: 'Audit', detail: '4 read-only agents: redirects / frontend-fakedata / backend-dead-and-fake / gateway-wiring' },
    { title: 'Fix', detail: 'disjoint directory lanes fix only the REAL problems (never honest-empty / labeled stubs)' },
  ],
}

const AUDIT = { type: "object", additionalProperties: false, properties: {
  area: { type: "string" },
  issues: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    territory: { type: "string", enum: ["frontend", "backend", "gateway"] },
    service: { type: "string", description: "apps/<name> the fix touches (e.g. apps/frontend, apps/job-service, apps/api-gateway)" },
    file: { type: "string", description: "file:line" },
    kind: { type: "string", enum: ["broken-redirect", "hardcoded-redirect", "placeholder-redirect", "fabricated-data", "dead-route", "unwired-route", "wiring-mismatch", "other"] },
    detail: { type: "string" },
    severity: { type: "string", enum: ["real", "acceptable"], description: "real = a genuine fake/dead/broken problem to fix; acceptable = an honest empty-state, an honest labeled/vendor-gated stub, a design-system prototype file, or intended behavior (DO NOT fix)" },
    fix: { type: "string", description: "for real issues: the precise minimal fix (make the redirect dynamic + point to the real route; replace fabricated data with the real API call or an honest empty; wire/implement the dead route)" },
  }, required: ["territory", "service", "file", "kind", "detail", "severity", "fix"] } },
  notes: { type: "string" },
}, required: ["area", "issues", "notes"] };

const REPORT = { type: "object", additionalProperties: false, properties: {
  files: { type: "array", items: { type: "string" } }, summary: { type: "string" }, fixed: { type: "number" }, notes: { type: "string" },
}, required: ["files", "summary", "fixed", "notes"] };

const ACTX = "Repo D:/CDC/ATS - a SHIPPED multi-tenant AI ATS (Next.js 14 app-router frontend apps/frontend; 15 Express microservices apps/*; api-gateway proxies /api/* to services; NATS/BullMQ/Postgres+RLS). READ-ONLY audit. The house rule is REAL DATA OR HONEST EMPTY STATE. Your job: find genuine INTEGRITY problems - (a) fabricated/mock/sample/hardcoded data presented to the user AS IF real, (b) dead/stub/not-implemented backend routes or routes the frontend/gateway calls that do NOT exist, (c) broken/hardcoded/placeholder REDIRECTS + links. CRITICAL - mark severity 'acceptable' (DO NOT flag as a problem) for: honest empty-states (renders nothing / 'no data yet' when the API returns empty), honest LABELED stubs (vendor-gated adapters that log [STUB]/return NEEDS_CREDENTIALS, anything in DEFERRED.md, integrations that show 'Not connected' without keys), design-system PROTOTYPE files (apps/frontend/public/design-system/*, *.jsx mockups - these are NOT the live app), and intended static config. Only severity 'real' = a genuine fake-presented-as-real / dead-route / broken-redirect. Cite file:line. Give a precise minimal fix for each real issue. Set `service` to the apps/<name> dir the fix lives in.";

const FCTX = "Repo D:/CDC/ATS. EXECUTION RULE: write SOURCE ONLY - no npm/npx/tsc/prisma/docker (orchestrator builds/tests). Next.js 14 app-router frontend; NodeNext ESM services (.js specifiers). Fix EXACTLY the REAL issues handed to you, minimal + additive + backward-compatible (frozen v1 + current v2 unaffected; do not change working behavior or response shapes in a breaking way). HARD RULES: REAL data or honest empty-state ONLY - NEVER replace one fake with another fake; a redirect must point to a route that ACTUALLY EXISTS and be DYNAMIC (param/data-driven, not a hardcoded id/url where it should be dynamic) and handle the loading/not-found case; a dead route gets wired to real data or the dead LINK gets removed/pointed at the real feature (never leave a link to nothing); do NOT touch honest empty-states, labeled vendor stubs, or design-system prototype files. Match existing idioms; no em or en dashes in authored text. Stay STRICTLY in your lane's directory territory.";

phase('Audit')
log('4 read-only integrity audits')
const [a1, a2, a3, a4] = await parallel([
  () => agent(ACTX + "\n\nAREA: REDIRECTS + LINKS (frontend). Sweep apps/frontend for EVERY navigation: <Link href>, useRouter().push/replace, redirect()/permanentRedirect(), next.config redirects, <a href>, window.location assignments, router-based CTAs. For each, determine: does the target route/page ACTUALLY EXIST under app/ (or is it an external URL that resolves)? Is it DYNAMIC where it should be (uses the real id/slug/param) or a hardcoded/placeholder value (#, '/todo', a stale path, a hardcoded localhost, an id that is never real)? Flap the ones that are broken (point to a non-existent route), placeholder (# / dead), or hardcoded-where-they-should-be-dynamic. severity 'real' only for genuinely broken/placeholder/hardcoded-should-be-dynamic; a correct dynamic link is 'acceptable'. The user specifically wants ALL redirects strong, stable, dynamic, and working - be thorough here.", { label: 'au:redirects', phase: 'Audit', schema: AUDIT }),
  () => agent(ACTX + "\n\nAREA: FRONTEND FABRICATED DATA. Sweep apps/frontend components/pages for data shown to the user that is HARDCODED/mock/sample instead of fetched from the API: arrays of fake candidates/jobs/metrics, const MOCK_/SAMPLE_/DEMO_ data rendered in a LIVE dashboard/screen, lorem-ipsum, hardcoded counts/percentages/charts that should be real, fake tables. DISTINGUISH from acceptable: honest empty-states, loading skeletons, static UI labels/copy, enum option lists, the -live.tsx wrappers that DO fetch real data, and design-system/*.jsx prototypes (acceptable - not live). severity 'real' only when fabricated data is presented AS real app data on a live route. Give the real API/source it should use for the fix.", { label: 'au:fe-fakedata', phase: 'Audit', schema: AUDIT }),
  () => agent(ACTX + "\n\nAREA: BACKEND DEAD/FAKE ROUTES. Sweep apps/* services (NOT frontend). Find: (a) route handlers that are stubs / return hardcoded or empty canned data instead of real DB/service data / have TODO/not-implemented; (b) routes the frontend or gateway CALLS but that do NOT exist in the target service (404 at runtime); (c) handlers that fabricate a response (synthetic stats/ids) rather than reading the real source. DISTINGUISH acceptable: honest LABELED vendor-gated stubs (log [STUB], return NEEDS_CREDENTIALS, in DEFERRED.md), honest empty results, background workers. severity 'real' only for genuine dead/unwired/fabricating routes on the live request path. For each, name the service (apps/<name>) + the real data source or wiring the fix needs.", { label: 'au:be-dead', phase: 'Audit', schema: AUDIT }),
  () => agent(ACTX + "\n\nAREA: GATEWAY <-> ROUTE <-> FETCH WIRING. Cross-check three layers: (1) every gateway proxy mount in apps/api-gateway/src/app.ts and the downstream path it rewrites to - does that downstream route exist in the target service? (2) every frontend fetch('/api/...') / lib API call - is there a matching gateway proxy AND a real downstream route? (3) any service-to-service call (service-client) to a path that does not exist. Flag genuine mismatches (a proxy/fetch to a dead path, a missing mount) as 'real' with the exact fix (add the mount / correct the path / implement the route). Spot-check the core user journeys end to end: public apply, screening, interview scheduling+room, assessment invite+results, offer->hire->onboarding, dashboard. Cite file:line; set service to the dir the fix lives in (apps/api-gateway or the service).", { label: 'au:gateway', phase: 'Audit', schema: AUDIT }),
])
const audit = [a1, a2, a3, a4].filter(Boolean)
const allIssues = audit.flatMap(a => a.issues || [])
const real = allIssues.filter(i => i.severity === 'real')
log('Audit done: ' + allIssues.length + ' issues, ' + real.length + ' REAL (' + allIssues.filter(i=>i.severity==='acceptable').length + ' acceptable/honest, left alone)')

phase('Fix')
const CORE = ['candidate', 'job', 'resume', 'screening', 'assessment', 'interview', 'collab', 'onboarding'];
const inDir = (i, names) => names.some(n => (i.service || '').includes(n));
const buckets = {
  frontend: real.filter(i => i.territory === 'frontend' || (i.service || '').includes('frontend')),
  'backend-core': real.filter(i => i.territory !== 'frontend' && !(i.service||'').includes('frontend') && inDir(i, CORE)),
  'backend-platform': real.filter(i => i.territory !== 'frontend' && !(i.service||'').includes('frontend') && !inDir(i, CORE)),
};
const fmt = (arr) => arr.map((i, n) => `${n + 1}. [${i.kind}] ${i.file} :: ${i.detail}\n   FIX: ${i.fix}`).join("\n");
const lanes = Object.entries(buckets).filter(([, arr]) => arr.length > 0);
log('Fix lanes: ' + lanes.map(([k, arr]) => `${k}(${arr.length})`).join(', ') || 'none - app is clean');
let fixes = [];
if (lanes.length) {
  fixes = (await parallel(lanes.map(([territory, arr]) => () =>
    agent(FCTX + `\n\n=== FIX LANE: ${territory} (territory: only the apps/ dirs named in these issues) ===\nFix ONLY these REAL integrity issues (${arr.length}), each minimal + additive. Make redirects dynamic + point to real existing routes; replace fabricated data with the real API call or an honest empty-state; wire/implement dead routes or remove links to nothing. Do NOT touch anything not listed. Report how many you fixed.\n\n` + fmt(arr),
      { label: 'fix:' + territory, phase: 'Fix', schema: REPORT })
  ))).filter(Boolean);
} else {
  log('No real integrity problems found - everything is real/working or honestly empty.');
}

return {
  totalIssues: allIssues.length,
  realIssues: real.length,
  acceptableLeftAlone: allIssues.filter(i => i.severity === 'acceptable').length,
  realIssueList: real.map(i => `[${i.kind}] ${i.service} ${i.file}: ${i.detail}`),
  fixes: fixes.map(f => ({ summary: f.summary, fixed: f.fixed, files: f.files.length })),
};
