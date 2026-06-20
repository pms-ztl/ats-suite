export const meta = {
  name: 'wf4-module-enforcement-backend',
  description: 'WF4 (SOURCE-ONLY, Docker down): make modules a real enforced gate end-to-end on the backend by cloning the proven agent-gate mechanism. billing resolver + gateway requireModule + NATS bust + worker short-circuit helper. requireModule attached to NO existing route (fail-open soft modules).',
  phases: [
    { title: 'Common', detail: '1 agent: is-module-on worker helper in packages/common + rebuild dist' },
    { title: 'Backend', detail: '2 agents: billing resolver router + gateway module-gate (disjoint services)' },
    { title: 'Verify', detail: 'host tsc + backward-compat/no-fabrication audit (runtime curl deferred)' },
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

const CTX = "Repo D:/CDC/ATS. CRITICAL: Docker daemon is DOWN — do NOT run docker; host `npm run build --workspace=@cdc-ats/<svc>` / `npx tsc --noEmit` only; runtime curl verification is deferred. READ the real proven patterns FIRST and CLONE them exactly: billing-service check-agent resolver (apps/billing-service/src/routes/billing.ts — the AND-of-gates effective-state logic, ~lines 248-273) and the gateway agent-gate (apps/api-gateway/src/lib/agent-gate.ts — the 15s cache + fail-open posture + requireAgentPlan middleware) and how the gateway mounts proxied routes in app.ts. HARD RULES: every change ADDITIVE; requireModule must be attached to NO existing/proxied route (only exported for FUTURE module routes) so the frozen v1 demo is byte-identical; fail-OPEN for soft modules on billing outage (same as agent-gate); reads REAL TenantModule/ModuleRegistry rows (WF3 added them) + the WF1 MODULE_REGISTRY — NEVER hardcode enabled:true; no em/en dashes. @cdc-ats/common exports modules/registry (MODULE_REGISTRY, getModule, validateRegistry) + modules/plan-limits (PLAN_LIMITS). This is WF4 of a 10-workflow enterprise build.";

phase('Common')
log('is-module-on worker helper + rebuild common dist')
const common = await agent(CTX + "\n\n=== SLICE D4: is-module-on worker helper ===\nCreate packages/common/src/modules/is-module-on.ts: a service-side resolver isModuleEnabled(tenantId, moduleKey, opts?) for BullMQ workers + NATS subscribers to short-circuit (skip/ack) when their owning module is off. It should: read the effective state the same way the gateway will (call billing /internal/billing/check-module via the internal service client OR read TenantModule+ModuleRegistry+plan directly — pick whichever matches existing worker patterns; prefer a small internal HTTP call to billing with a Redis cache keyed [tenantId,moduleKey], TTL ~15s, busted on the NATS subject module.toggled). Fail-OPEN on billing/redis error for soft modules (same posture as agent-gate). Export isModuleEnabled + a bustModuleCache(tenantId?,moduleKey?) helper. Add the export to packages/common/src/index.ts. Then `npm run build --workspace=@cdc-ats/common`. NO docker. In `contract` give the signature + cache key + TTL + fail-mode.", { label: 'd4:helper', phase: 'Common', schema: REPORT })
log('Common done: buildClean=' + (common && common.buildClean))

phase('Backend')
log('billing resolver + gateway module-gate (disjoint services)')
const backend = (await parallel([
  () => agent(CTX + "\n\n=== SLICE D1+D3a: billing module resolver ===\nCreate apps/billing-service/src/routes/modules.ts and mount it additively in the billing app:\n- GET /internal/billing/check-module?key= -> { enabled:boolean, reason:string, requiresPlan?:string, dependsOn?:string[] }. Compute effective state as the AND-of-gates CLONE of check-agent (billing.ts ~248-273): module enabled IFF (plan entitles it via PLAN_LIMITS/requiresPlan) AND (TenantModule.enabled override OR manifest defaultEnabled when no override) AND (no AgentKillSwitch / PlatformAgentKillSwitch for it) AND (all manifest dependencies resolve enabled). Precedence highest-first: super-admin platform kill -> plan entitlement -> TenantModule explicit toggle -> dependency satisfied -> manifest default. Use the WF1 MODULE_REGISTRY (getModule) + the real TenantModule rows (RLS client) + ModuleRegistry table (prismaAdmin).\n- GET /internal/billing/modules -> the full resolved set for the tenant ([{key,enabled,reason,requiresPlan}]).\n- PUT /internal/billing/modules/:key body {enabled,config} (requireTenantAdmin; return 402 PLAN_LIMIT if the plan does not entitle it) -> upsert TenantModule (RLS client) + publish NATS subject `module.toggled` {tenantId,moduleKey} (D3a) so caches bust.\n- Super-admin GET/PUT /internal/platform/modules -> the platform ModuleRegistry catalog (prismaAdmin), mirroring the in-code MODULE_REGISTRY.\nBuild: `npm run build --workspace=@cdc-ats/billing-service`. NO docker. In `contract` give the exact response shapes + the NATS subject payload.", { label: 'd1:billing', phase: 'Backend', schema: REPORT }),

  () => agent(CTX + "\n\n=== SLICE D2+D3b: gateway module-gate ===\nCreate apps/api-gateway/src/lib/module-gate.ts as a LITERAL clone of apps/api-gateway/src/lib/agent-gate.ts: a requireModule(moduleKey) Express middleware that calls billing GET /internal/billing/check-module?key=, caches the result ~15s per [tenantId,moduleKey], FAILS OPEN for soft modules on billing error (same as agent-gate), and returns 404 (module surface absent) or 403 as appropriate when disabled. Subscribe to the NATS subject `module.toggled` to bust the cached entry (D3b). EDIT apps/api-gateway/src/app.ts to add (additive, behind gatewayAuth): GET /api/me/modules (the tenant's resolved enabled set, for nav/widget filtering), PUT /api/tenant/modules/:key (requireTenantAdmin -> billing PUT), and super-admin GET/PUT /api/super-admin/modules (-> billing /internal/platform/modules). EXPORT requireModule but DO NOT attach it to ANY existing proxied route (it is for FUTURE module routes in WF7/WF9). Build: `npm run build --workspace=@cdc-ats/api-gateway`. NO docker. In `contract` give the middleware signature + the 3 new gateway routes + confirm no existing route got a new gate.", { label: 'd2:gateway', phase: 'Backend', schema: REPORT }),
])).filter(Boolean)
log('Backend done: ' + backend.length + '/2')

phase('Verify')
const verify = (await parallel([
  () => agent("Host build verification for D:/CDC/ATS (Docker DOWN — host tsc only, no docker). Run verbatim and report each: npm run build --workspace=@cdc-ats/common ; npm run build --workspace=@cdc-ats/billing-service ; npm run build --workspace=@cdc-ats/api-gateway. REPORT: files=any with errors, summary=pass/fail, buildClean=all green, contract='', notes=every error verbatim.", { label: 'vf:build', phase: 'Verify', schema: REPORT }),
  () => agent(CTX + "\n\n=== AUDIT: backward-compat + no-fabrication (read-only, no docker) ===\nVerify citing file:line: (1) requireModule is exported but attached to NO existing/proxied route in app.ts (grep) — every v1 route keeps its current gating untouched; (2) the resolver computes effective state from REAL rows (TenantModule/ModuleRegistry/PLAN_LIMITS + MODULE_REGISTRY) via the AND-of-gates clone, never a hardcoded enabled:true; (3) fail-OPEN posture matches agent-gate for soft modules; (4) the 3 new gateway routes + billing routes are additive and the NATS module.toggled bust is wired both sides; (5) no mock/fabricated data. Return REPORT: files=violations, summary=verdict, buildClean=true iff clean, contract='deferred runtime checks: list the exact curl commands to run once Docker is up (check-module FREE vs ENTERPRISE, PUT toggle, cache bust)', notes=each issue with file:line.", { label: 'vf:audit', phase: 'Verify', schema: REPORT }),
])).filter(Boolean)

return { common, backend, verify }
