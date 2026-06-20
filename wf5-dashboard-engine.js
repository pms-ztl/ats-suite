export const meta = {
  name: 'wf5-dashboard-engine-readonly',
  description: 'WF5 (SOURCE-ONLY): customizable-dashboard runtime in VIEW mode — widget registry + sources + schema + react-grid-layout renderer, rendering the existing role bento as the seeded default. Zero edit/persist. Heavy reuse of the bespoke viz kit + dashboard-kit, no rewrites.',
  phases: [
    { title: 'Foundation', detail: '3 agents: sources, schema, grid (disjoint)' },
    { title: 'BuildOn', detail: '2 agents: registry (needs sources+schema), frame' },
    { title: 'Widgets', detail: '1 agent: thin widget wrappers extracted from existing cards' },
    { title: 'Page', detail: '1 agent: read hook + rework page.tsx to render WidgetGrid from resolved layout' },
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

const CTX = "Repo D:/CDC/ATS frontend apps/frontend (Next.js 14 app router, React 18). Docker is up but this is SOURCE work; verify with `cd apps/frontend && npx tsc --noEmit`. READ the real code first: the existing home cards in components/cd/screens/OrgOverview.tsx + components/cd/org-overview-live.tsx + app/(dashboard)/page.tsx (role homes), the viz kit components/shared/ribbon.tsx + ribbon-ext.tsx + charts.tsx, components/cd/dashboard-kit.tsx (KpiCard/DeltaPill/LiveStatus/EmptyMetric), components/cd/aurora-kit.tsx SectionCard, lib/use-data.ts (45s refresh), lib/api.ts (the data fetchers). react-grid-layout@^2.2.3 + nanoid@^5 are INSTALLED — read node_modules/react-grid-layout to confirm the v2 Responsive + WidthProvider import API. HARD RULES: REAL data or honest empty states ONLY — a widget bound to an empty source renders EmptyMetric/EmptyChart, NEVER a fabricated 0; REUSE the existing viz/card components verbatim (do NOT rewrite the viz kit); the page must render the SAME bento as today (now sourced from a seeded default document) so v1 is visually unchanged; no em/en dashes. RGL needs client-only mount -> next/dynamic({ssr:false}). This is WF5 of a 10-workflow enterprise build (the dashboard is fully customizable by WF6); @cdc-ats/contracts exports DashboardDocumentSchema (WF1).";

phase('Foundation')
log('3 foundation agents: sources, schema, grid')
const found = (await parallel([
  () => agent(CTX + "\n\n=== SLICE E1: dataSourceKey registry ===\nCreate apps/frontend/lib/widgets/sources.ts: a table mapping dataSourceKey -> { key, fetcher (the lib/api function), viewModelType, refreshMs, realData:boolean }. Seed it ONLY from AUDIT-VERIFIED-REAL fetchers in lib/api.ts (read lib/api.ts to confirm each exists + returns real data): dashboard_kpis(getDashboardKpis), platform_overview(getPlatformOverview), pipeline_funnel(getFunnel), billing_usage(getBillingUsage), spend_trend(getSpendTrend), oversight(getOversight), screening_list(listScreening), candidates_list(listCandidates), requisitions_list(listRequisitions), interviews_list(listInterviews), offers_list(listOffers), review_queue(listReviewQueue), and (super-admin) super_admin_tenants + platform_cost if those fetchers exist. EXPLICITLY add entries with realData:false for the KNOWN landmines so they can never be bound: listDecisions (no gateway proxy), source_of_hire conversion (hired always 0), complianceScore/diversityScore/getAdverseImpact (no backend source). Export getSource(key) + a helper listing only realData:true keys. In `contract` list every key + realData flag.", { label: 'e1:sources', phase: 'Foundation', schema: REPORT }),

  () => agent(CTX + "\n\n=== SLICE E3: document schema + migration ===\nCreate apps/frontend/lib/widgets/schema.ts: re-export / mirror @cdc-ats/contracts DashboardDocumentSchema (the {schemaVersion, globalFilters, widgets[{instanceId,type,title,dataSourceKey,viz,config,minW,minH}], layouts{lg,md,sm,xs,xxs:[{i,x,y,w,h}]}} zod) and add migrateDashboard(doc): DashboardDocument — a schemaVersion ladder (v1 baseline now; structured so a future widget/breakpoint change adds a migration step) that runs on read so old saved docs always upgrade before render. Add makeInstanceId() using nanoid (w_<nanoid>). In `contract` give the exported types + migrate signature.", { label: 'e3:schema', phase: 'Foundation', schema: REPORT }),

  () => agent(CTX + "\n\n=== SLICE E4: grid renderer ===\nCreate apps/frontend/components/dashboard/WidgetGrid.tsx: a react-grid-layout <Responsive> + WidthProvider renderer, mounted via next/dynamic({ssr:false}) (RGL needs window). Props { document, isEditing?, onLayoutChange?, children-render via a widget render fn }. Breakpoints {lg:1200,md:996,sm:768,xs:480,xxs:0}, cols {lg:12,md:10,sm:6,xs:4,xxs:2}. In VIEW mode isDraggable=false + isResizable=false (this WF); edit affordances come in WF6. Render each document.widgets item into its grid cell keyed by instanceId (item.i === instanceId). Import the RGL CSS (react-grid-layout/css/styles.css + react-resizable/css/styles.css) appropriately. Confirm the EXACT v2 import path by reading node_modules/react-grid-layout. In `contract` give the component props + the RGL version API used.", { label: 'e4:grid', phase: 'Foundation', schema: REPORT }),
])).filter(Boolean)
log('Foundation done: ' + found.length + '/3')

phase('BuildOn')
log('registry + frame')
const buildon = (await parallel([
  () => agent(CTX + "\n\n=== SLICE E2: widget registry ===\nThe Foundation phase created lib/widgets/sources.ts (getSource, realData flags) and lib/widgets/schema.ts. Create apps/frontend/lib/widgets/registry.ts: a CatalogEntry catalog mapping widgetType -> { type, label, icon, category, allowedViz[], dataSourceKey, component (React.lazy import of the WF5 widget wrapper), defaultConfig, defaultSize{w,h,minW,minH}, roles[], requiredModule?, planTier? }. Types: kpi_scorecard, time_series, pipeline_funnel, breakdown, table, list_feed, billing_spend, oversight_gauge, super_admin_cost, markdown_note, quick_actions. HARD: every entry's dataSourceKey MUST resolve to a realData:true source (assert against E1's table) EXCEPT markdown_note/quick_actions which have no source. Each entry owns its honest-empty behavior. Export the catalog + getCatalogEntry(type) + a filter(role, enabledModules, plan) helper. In `contract` list every widgetType -> dataSourceKey.", { label: 'e2:registry', phase: 'BuildOn', schema: REPORT }),

  () => agent(CTX + "\n\n=== SLICE E5: widget frame ===\nCreate apps/frontend/components/dashboard/WidgetFrame.tsx: wraps a widget body in the existing aurora-kit SectionCard chrome (title top-left, optional action top-right) + React.lazy/<Suspense fallback={<WidgetSkeleton/>}> gated by a useInView (IntersectionObserver) hook so OFF-screen widgets neither mount nor fetch. The frame binds the widget's data via the existing lib/use-data.ts useData(...) keyed by {instanceId, globalFilters} with the source's refreshMs. In view mode it is read-only (remove/settings affordances are WF6). Also create a small WidgetSkeleton + a useInView hook (or reuse one if present). In `contract` give the WidgetFrame props.", { label: 'e5:frame', phase: 'BuildOn', schema: REPORT }),
])).filter(Boolean)
log('BuildOn done: ' + buildon.length + '/2')

phase('Widgets')
log('thin widget wrappers extracted from existing cards')
const widgets = await agent(CTX + "\n\n=== SLICE E6: widget wrappers ===\nCreate apps/frontend/components/dashboard/widgets/*.tsx — ONE thin wrapper component per registry widgetType (kpi_scorecard, time_series, pipeline_funnel, breakdown, table, list_feed, billing_spend, oversight_gauge, super_admin_cost, markdown_note, quick_actions). Each wrapper takes { config, data } (data supplied by WidgetFrame's useData via the dataSourceKey) and renders by REUSING the existing components VERBATIM: kpi_scorecard->dashboard-kit KpiCard; time_series/billing_spend->charts TrendChart or ribbon viz; pipeline_funnel->StepCascade/FlowRibbon; breakdown->DonutChart/BarsChart or ribbon OrbitField/WaffleField; table->the existing table rendering; list_feed->the review-queue/screening list pattern; oversight_gauge->ribbon ArcMeter/FillGauge; markdown_note->a simple static card; quick_actions->deep-link tiles. Extract the rendering from the ~16 OrgOverview cards + role-home cards (do NOT rewrite the viz). Each wrapper renders the honest empty state (EmptyMetric/EmptyChart) when data is empty. Register each as the registry's lazy component. Build: cd apps/frontend && npx tsc --noEmit. In `contract` map each widgetType -> the reused component(s).", { label: 'e6:widgets', phase: 'Widgets', schema: REPORT })
log('Widgets done: buildClean=' + (widgets && widgets.buildClean))

phase('Page')
log('read hook + page.tsx rework')
const page = await agent(CTX + "\n\n=== SLICE E7: read hook + page render ===\nThe prior phases built sources/schema/registry/WidgetGrid/WidgetFrame/widget wrappers. Now:\n1) Create apps/frontend/hooks/use-dashboard-layout.ts: READ path only for this WF — resolves the active dashboard document with order user-override -> tenant-default -> a hardcoded SYSTEM-DEFAULT constant (no API yet; WF6 adds GET/PUT). Runs migrateDashboard on the resolved doc. (Add a TODO marker where the WF6 fetch will slot in.)\n2) Create apps/frontend/hooks/use-modules.ts: GET /api/me/modules (the WF4 route) returning the resolved enabled set (graceful fallback to all-enabled if the endpoint 404s, so v1 is unaffected).\n3) Create the SYSTEM-DEFAULT dashboard documents (one per role: admin/recruiter/hiring_manager/interviewer) that reproduce the CURRENT bento layout EXACTLY (same widgets, same order/sizes) — so rendering through WidgetGrid is visually identical to today. Put these constants in lib/widgets/defaults.ts.\n4) EDIT app/(dashboard)/page.tsx to render <WidgetGrid document={resolved} isEditing={false}/> (with WidgetFrame per widget) from the resolved layout, INSTEAD of the hard-coded role dispatch — but the resolved default IS the current bento, so the page looks the same. Keep all existing data fetchers working through the widget data path. Build: cd apps/frontend && npx tsc --noEmit. In `contract` confirm the page renders the same bento via the engine + the resolution order + the graceful module fallback.", { label: 'e7:page', phase: 'Page', schema: REPORT })
log('Page done: buildClean=' + (page && page.buildClean))

return { found, buildon, widgets, page }
