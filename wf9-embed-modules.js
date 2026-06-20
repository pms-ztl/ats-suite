export const meta = {
  name: 'wf9-embed-and-module-ux',
  description: 'WF9 (SOURCE-ONLY): expose the WF2-secured embeddable surfaces (embed route group + @cdc-ats/embed-sdk) and complete the module-system UX so toggles visibly attach/detach surfaces (nav/middleware/features-page/super-admin/widget-palette). Finishes the modular + embeddable requirement.',
  phases: [
    { title: 'Embed', detail: '2 agents: embed route group + @cdc-ats/embed-sdk package (disjoint)' },
    { title: 'ModuleUX', detail: '4 agents: nav+middleware, features page, super-admin console, widget-palette filter' },
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

const CTX = "Repo D:/CDC/ATS. Docker is up but this is SOURCE work; verify with host builds / `cd apps/frontend && npx tsc --noEmit`; do NOT run docker. READ the real code FIRST: WF2 embed groundwork (apps/api-gateway/src/lib/embed-token.ts mint/verify + embed-headers.ts + POST /api/embed/token + the /embed/* relaxed nginx), WF4 module resolver (gateway GET /api/me/modules + PUT /api/tenant/modules/:key + GET/PUT /api/super-admin/modules; billing check-module), the WF1 MODULE_REGISTRY (@cdc-ats/common modules/registry), cd-shell.tsx (NavRow + NAV + role filtering + the WF6 theme inject), middleware.ts (route role-guard), app/(dashboard)/settings/features/page.tsx (the FAKE local-state saveFeatures that PUTs a nonexistent route), public/super-admin/superadmin.js (the SPA + its WIRED-flag pattern), the WF5/6 dashboard (components/dashboard/WidgetPalette.tsx + lib/widgets/registry.ts), and the existing screens to embed (pipeline/funnel, screening, a viz, the public apply). HARD RULES: every change ADDITIVE + backward-compatible — a NavRow with NO module key behaves exactly as today, middleware 404s ONLY explicitly-disabled modules (default-enabled => no v1 change), the features page was a fake no-op so wiring it real cannot regress, embeds FAIL CLOSED (empty allowlist => no framing); REAL data / honest empty only; no em/en dashes. This is WF9 of a 10-workflow enterprise build.";

phase('Embed')
log('embed route group + embed-sdk')
const embed = (await parallel([
  () => agent(CTX + "\n\n=== SLICE I1: embed route group ===\nNEW apps/frontend/app/(embed)/embed/{pipeline,screening,viz,apply}/[token]/page.tsx — CHROME-LESS ports of existing screens (no cd-shell sidebar/topbar; just the cd-token-themed content) that: read the [token] param, and render the corresponding screen's content using the existing components (pipeline -> the hiring funnel/FlowRibbon; screening -> the screening list; viz -> a chosen chart; apply -> the public apply form). The page calls the gateway to VALIDATE the embed token (WF2 verifyEmbedToken via a gateway endpoint) and fetch the locked resource/params from the token (tenantId/resourceId/params resolved server-side); on an invalid/expired token render an honest 'This embed link is invalid or expired' state. Apply the tenant brand (WF6 brand-ramp) for white-label. These pages mount in the (embed) route group which nginx/gateway serve with relaxed framing (WF2). In `contract` give each embed route + the token-validation flow.", { label: 'i1:embed-routes', phase: 'Embed', schema: REPORT }),
  () => agent(CTX + "\n\n=== SLICE I2: @cdc-ats/embed-sdk package ===\nNEW packages/embed-sdk (a first-party buildable package: package.json name @cdc-ats/embed-sdk, tsconfig, src/index.ts): a tiny browser SDK for HOST apps to embed CDC ATS modules. API: ATS.init({ host, getToken }) (getToken is a host callback that fetches a short-lived embed token from the host's backend, which proxies POST /api/embed/token) + per-module mount helpers e.g. ATS.PipelineBoard({requisitionId}).render('#el'), ATS.Screening(...).render(el), ATS.Viz(...).render(el), ATS.Apply(...).render(el) — each injects an <iframe src=`${host}/embed/<module>/<token>` sandbox=\"allow-scripts allow-forms allow-same-origin\"> and does strict origin-checked postMessage for height-autoresize + token-refresh + nav events; supports theme/customCSS passthrough into the cd-tokens layer. No heavy deps (vanilla TS). Build the package (npm run build --workspace=@cdc-ats/embed-sdk; add to workspace). In `contract` give the public SDK API + the postMessage protocol + the iframe sandbox attrs.", { label: 'i2:sdk', phase: 'Embed', schema: REPORT }),
])).filter(Boolean)
log('Embed done: ' + embed.length + '/2')

phase('ModuleUX')
log('nav+middleware / features page / super-admin / widget-palette')
const ux = (await parallel([
  () => agent(CTX + "\n\n=== SLICE I3: module-driven nav + middleware ===\nEDIT apps/frontend/components/cd/cd-shell.tsx: add an optional `module?: string` key to the NavRow type and tag the relevant NAV items with their owning module key (e.g. Sourcing->ai-sourcing, Screening->ai-screening, Copilot->copilot, Assessments(NEW nav item)->oa-assessments, etc.; items with NO module behave as today). Use the WF4 use-modules hook (GET /api/me/modules) to filter the nav by role[] AND resolved-module; for a PLAN-LOCKED item show an upgrade affordance (lock badge) instead of hiding it / a dead 402. Add a 'Assessments' nav entry (module oa-assessments) and a 'Dashboards' affordance if useful. EDIT apps/frontend/middleware.ts route-guard to 404 routes whose owning module is disabled (resolve via a lightweight check; default-enabled modules => no change, so v1 is unaffected). In `contract` give the NavRow change + which nav items got which module + the middleware rule.", { label: 'i3:nav', phase: 'ModuleUX', schema: REPORT }),
  () => agent(CTX + "\n\n=== SLICE I4: features page (real toggles) + client registry ===\nEDIT app/(dashboard)/settings/features/page.tsx: REPLACE the fake local-state saveFeatures (which PUTs a nonexistent /settings/features and shows a false 'Saved') with REAL data: GET /api/me/modules (or /api/tenant/modules) to list the tenant's modules + resolved enabled state + plan entitlement, and PUT /api/tenant/modules/:key {enabled} to toggle (tenant-admin only; show the 402/plan-locked state honestly for modules the plan does not entitle). NEW apps/frontend/lib/modules/registry.ts: a CLIENT mirror of the module catalog (name/category/description/requiresPlan) for display + filtering, sourced from /api/super-admin/modules or a static mirror of MODULE_REGISTRY. Honest empty/loading/error; real 'Saved' only on a real 200. In `contract` give the endpoints used + the client registry shape.", { label: 'i4:features', phase: 'ModuleUX', schema: REPORT }),
  () => agent(CTX + "\n\n=== SLICE I5: super-admin module console ===\nEDIT public/super-admin/superadmin.js: add a 'Modules' screen wired to GET /api/super-admin/modules (the platform ModuleRegistry catalog) + PUT /api/super-admin/modules/:key (platform defaults), following the existing SPA WIRED-flag pattern (the amber 'sample' banner clears only when real data loads). Show each module: key, name, category, version, requiresPlan, defaultEnabled, dependencies. Honest empty state if the catalog is empty. In `contract` give the screen + endpoints + the WIRED flag.", { label: 'i5:superadmin', phase: 'ModuleUX', schema: REPORT }),
  () => agent(CTX + "\n\n=== SLICE I6: widget-palette module filter (close the loop) ===\nEDIT apps/frontend/components/dashboard/WidgetPalette.tsx + lib/widgets/registry.ts: filter the add-widget palette by a widget's requiredModule using the resolved enabled set (use-modules), so a widget whose owning module is disabled does NOT appear in the palette (closing the dashboard<->module loop: e.g. an oa_results widget only shows when oa-assessments is enabled). Keep widgets with no requiredModule always available (subject to role/plan as before). In `contract` confirm the filter + which widgets gained a requiredModule.", { label: 'i6:widget-filter', phase: 'ModuleUX', schema: REPORT }),
])).filter(Boolean)
log('ModuleUX done: ' + ux.length + '/4')

return { embed, ux }
