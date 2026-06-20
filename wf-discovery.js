export const meta = {
  name: 'discovery-customizable-ui-oa-modules',
  description: 'Heavy discovery (research + codebase audit + synthesis) for three enterprise capabilities: user-customizable dashboard/UI, online-assessment (OA) platform (native + integrations), and a modular/embeddable architecture',
  phases: [
    { title: 'Research', detail: '12 web-research agents (waves of 4): customizable dashboards, modules, OA, embedding' },
    { title: 'Audit', detail: '9 codebase agents (waves of 3): what exists to build on' },
    { title: 'Synthesize', detail: '2 agents: architecture + data models + the implementation-workflow build plan' },
  ],
}

const RES = {
  type: "object", additionalProperties: false,
  properties: {
    topic: { type: "string" },
    findings: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      practice: { type: "string" },
      detail: { type: "string", description: "concrete: exact patterns, libraries+versions, data shapes, API flows, values" },
      source: { type: "string", description: "URL or named authority" },
    }, required: ["practice", "detail", "source"] } },
    recommendation: { type: "string", description: "what WE should adopt for the CDC ATS (Next.js 14 + Express microservices + Prisma/Postgres), concrete" },
  },
  required: ["topic", "findings", "recommendation"],
}

const AUD = {
  type: "object", additionalProperties: false,
  properties: {
    area: { type: "string" },
    currentState: { type: "string", description: "how it works now, cite file:line" },
    reusable: { type: "array", items: { type: "string" }, description: "existing pieces to build ON (file paths)" },
    gaps: { type: "array", items: { type: "string" }, description: "what is missing for the target features" },
    recommendation: { type: "string" },
  },
  required: ["area", "currentState", "reusable", "gaps", "recommendation"],
}

const RCTX = "You are a senior SaaS architect researcher. USE WebSearch + WebFetch (load via ToolSearch: query 'select:WebSearch,WebFetch'). Research CURRENT 2026 best practices and cite real source URLs. Be concrete: name exact libraries (+versions), data shapes, API flows, persistence schemas, numeric values. Target product: CDC ATS, a multi-tenant AI applicant-tracking SaaS, Next.js 14 (app router, React 18, TS, Tailwind, CSS-in-JS + a cd-tokens design-token layer, a bespoke SVG viz kit), Express 5 microservices, Prisma 7 + Postgres (DB-per-service + RLS), BullMQ, NATS, Docker. END every topic with a concrete recommendation for THIS stack.";

const ACTX = "You are a senior engineer auditing the CDC ATS monorepo at D:/CDC/ATS (READ-ONLY — do not edit). Read/grep the real code and cite file:line. Frontend at apps/frontend (Next.js 14 app router; dashboard wrapped in .cd-scope; screens under components/cd/*; shell components/cd/cd-shell.tsx + Shell.tsx; design tokens cd-tokens.css; viz kit components/shared/ribbon.tsx + ribbon-ext.tsx + charts.tsx + the new dashboard-kit.tsx; data fetchers lib/api.ts; the new shared .cd-page container). Backend: Express microservices under apps/* (api-gateway, identity, tenant, billing, job, candidate, interview, resume, screening, notification, agent, analytics, compliance, search) each with prisma/schema.prisma; gateway aggregates. Identify exactly what EXISTS to build the target features on, and the gaps. Be precise.";

phase('Research')
log('Research wave 1/3: dashboards, widget catalog, theming, builders')
const research = []
research.push(...(await parallel([
  () => agent(RCTX + "\n\nTOPIC: USER-CUSTOMIZABLE DASHBOARD systems (the headline feature). Research drag-and-drop dashboard builders: react-grid-layout vs gridstack.js vs dnd-kit (responsive 12-col grids, resize/move/add/remove widgets, breakpoints, layout JSON persistence); how Grafana / Datadog / Retool / Metabase / Power BI / Notion model a customizable dashboard (widget instances + config + layout + saved views per user); edit-mode vs view-mode UX; default vs user-override layouts; lazy-loading widgets for performance. Give the exact widget-instance + layout JSON schema and the recommended React grid library.", { label: 'r:dash', phase: 'Research', schema: RES }),
  () => agent(RCTX + "\n\nTOPIC: DASHBOARD WIDGET CATALOG for a recruiting/ATS ops product. What widget TYPES a customizable ATS dashboard should offer (KPI/scorecard, time-series chart, funnel, breakdown bar/donut, list/feed, table, calendar/heatmap, radar, activity, quick-actions, embed/iframe, markdown/note). For each: the data it binds to, the config a user sets (data source, metric, filter, time range, viz model, size), and sensible defaults. Map to a generic 'widget = {type, dataSourceKey, config, viz}' model. Cite real dashboard widget libraries/catalogs.", { label: 'r:widgets', phase: 'Research', schema: RES }),
  () => agent(RCTX + "\n\nTOPIC: UI CUSTOMIZATION & THEMING scope + white-label. What end-users vs tenant-admins should be able to customize: branding (logo, accent color, fonts), light/dark, density, nav order/visibility, default landing dashboard per role, per-widget config. How design-token theming enables runtime white-label (CSS custom properties, token overrides per tenant). Role-based customization scope (who can change what). Cite Tailwind/Material/Carbon theming + white-label SaaS guides.", { label: 'r:theming', phase: 'Research', schema: RES }),
  () => agent(RCTX + "\n\nTOPIC: NO-CODE FORM & PAGE/LAYOUT BUILDERS (schema-driven UI). How form builders model fields (type, label, validation, conditional/branching logic, scoring) and persist a JSON schema; how schema-driven renderers work (JSON Schema + UI schema, react-jsonschema-form, formily). How layout/page builders persist a component tree. This underpins BOTH the customizable UI and the native OA test builder. Give the recommended schema-driven approach + library.", { label: 'r:builders', phase: 'Research', schema: RES }),
])).filter(Boolean))
log('Research wave 2/3: modules, embedding, OA architecture, OA integrations')
research.push(...(await parallel([
  () => agent(RCTX + "\n\nTOPIC: MODULE / PLUGIN architecture for multi-tenant SaaS (the 'retrofit kit' / attachable-modules requirement). How to model features as MODULES that a tenant can enable/disable (module registry + manifest, per-tenant module config, dependencies between modules, capability/permission gating), feature-flag systems (LaunchDarkly/Unleold/OpenFeature patterns), and how a module toggles its routes/nav/widgets/services on or off cleanly. How this layers on an existing plan-gating + feature-flag system. Give a concrete module-manifest schema + enable/disable mechanism.", { label: 'r:modules', phase: 'Research', schema: RES }),
  () => agent(RCTX + "\n\nTOPIC: EMBEDDABLE / ATTACHABLE / white-label app architecture (mount the ATS, or its modules, on top of another application). Compare: iframe embedding + postMessage, Web Components / custom elements, Module Federation (Webpack/Vite), headless API + SDK, and embedded-analytics patterns (Retool/Metabase/Grafana embedding, signed embed tokens). How to expose each module as an attachable unit. Security of embedding (CSP, frame-ancestors, token-scoped embeds). Recommend how to make CDC ATS modules embeddable.", { label: 'r:embed', phase: 'Research', schema: RES }),
  () => agent(RCTX + "\n\nTOPIC: ONLINE ASSESSMENT (OA) PLATFORM architecture (native, build-our-own). Data model for assessments: Assessment/Test -> Section -> Question (types: MCQ single/multi, true-false, short-answer, essay, coding) + question bank/library, scoring/rubrics, time limits, randomization, attempt/session model, candidate invite + tokenized test link, result + report. Anti-cheat basics (tab-switch detection, time tracking, one-attempt). The candidate-facing test runner UX. Give the full Prisma-style data model + the invite->take->score->result flow.", { label: 'r:oa-arch', phase: 'Research', schema: RES }),
  () => agent(RCTX + "\n\nTOPIC: OA THIRD-PARTY INTEGRATIONS (HackerRank, Codility, HackerEarth, iMocha, TestGorilla). For each major one: the integration API (auth/API key/OAuth), the flow to assign a test to a candidate (create invite, send link), and how results come back (webhook vs polling, score payload). The common abstraction across providers (an 'assessment provider' interface). How ATSes (Greenhouse/Lever/Ashby) integrate these. Give a provider-adapter interface + the invite/result webhook contract.", { label: 'r:oa-integ', phase: 'Research', schema: RES }),
])).filter(Boolean))
log('Research wave 3/3: code execution, persistence/API, enterprise readiness, competitive')
research.push(...(await parallel([
  () => agent(RCTX + "\n\nTOPIC: CODING-ASSESSMENT EXECUTION for a native OA. In-browser code editor (Monaco / CodeMirror 6), and code execution/grading sandboxes: Judge0, Piston, self-hosted runners, or a queue+container model; test-case based grading; language support; security/sandboxing of untrusted code; latency. Recommend a pragmatic execution approach for our BullMQ+Docker stack (e.g. Judge0 self-host or hosted) and the submission->run->grade data flow.", { label: 'r:code-exec', phase: 'Research', schema: RES }),
  () => agent(RCTX + "\n\nTOPIC: PERSISTENCE & API DESIGN for customization + modules. How to store per-user AND per-tenant dashboard layouts, theme overrides, module enablement, nav prefs (defaults vs overrides resolution order; versioning/migration of layout schema; who can write tenant defaults vs personal overrides). Multi-tenant isolation (RLS) of these config rows. REST contract for GET/PUT layout, list widgets, toggle module. Give the exact tables + resolution algorithm + endpoints.", { label: 'r:persist', phase: 'Research', schema: RES }),
  () => agent(RCTX + "\n\nTOPIC: ENTERPRISE READINESS for customization, OA, and modules. RBAC for who can customize (personal vs tenant-wide), audit logging of customization/module/assessment changes, performance (lazy widget loading, layout caching, code-exec scaling), multi-tenant data isolation, GDPR for candidate assessment data, rollout/migration strategy, and graceful defaults when a module is disabled. Give concrete guardrails for a production SaaS.", { label: 'r:enterprise', phase: 'Research', schema: RES }),
  () => agent(RCTX + "\n\nTOPIC: COMPETITIVE TEARDOWN. How do leading products do these: (a) dashboard customization & saved views (Ashby, Greenhouse, Notion, Retool, Grafana); (b) module/marketplace/app-toggle systems (Greenhouse marketplace, Workday, Salesforce AppExchange, HubSpot); (c) assessments (HackerRank/Codility integration in ATSes, and native assessment in TestGorilla/iMocha). 3-5 concrete compositional/architectural moves we should emulate for each of our three features.", { label: 'r:competitive', phase: 'Research', schema: RES }),
])).filter(Boolean))
log('Research done: ' + research.length + '/12')

phase('Audit')
log('Audit wave 1/3: dashboard/viz, shell/routing, settings/theming')
const audit = []
audit.push(...(await parallel([
  () => agent(ACTX + "\n\nAREA: CURRENT DASHBOARD + VIZ. Read components/cd/screens/OrgOverview.tsx, components/cd/org-overview-live.tsx, the role homes app/(dashboard)/page.tsx, the new components/cd/dashboard-kit.tsx (KpiCard/DeltaPill/LiveStatus), and the viz kit components/shared/ribbon.tsx + ribbon-ext.tsx + charts.tsx. Catalog the EXISTING widget-like components + chart models (these become the customizable widget library). How the home renders today (fixed bento). What must change to make widgets user-arrangeable. List every reusable viz/card component.", { label: 'a:dash', phase: 'Audit', schema: AUD }),
  () => agent(ACTX + "\n\nAREA: SHELL + ROUTING + LAYOUT + TOKENS. Read components/cd/cd-shell.tsx, Shell.tsx, the .cd-page container + cd-tokens.css, the nav definition, and how routes mount. Determine where/how to inject a customizable grid layout per route, how nav could be reordered/toggled per tenant, and how the design-token layer enables runtime theming/white-label. Identify the hook points for module-driven nav + per-tenant theme overrides.", { label: 'a:shell', phase: 'Audit', schema: AUD }),
  () => agent(ACTX + "\n\nAREA: SETTINGS + BRANDING + THEMING (current customization surface). Read app/(dashboard)/settings/* (esp. branding), the tenant branding hook (hooks/use-tenant-branding) + tenant-service branding routes, and how logo/colors are applied today. What tenant-level customization already persists, where, and how it reaches the UI. The base to extend for full theming + per-user prefs.", { label: 'a:settings', phase: 'Audit', schema: AUD }),
])).filter(Boolean))
log('Audit wave 2/3: feature-flags/modules, data/api, assessment/screening')
audit.push(...(await parallel([
  () => agent(ACTX + "\n\nAREA: FEATURE-FLAGS / PLAN-GATING / MODULE foundation. Read billing-service FeatureFlag + AgentKillSwitch + plan limits, the gateway requireAgentPlan + requireAgentPlan/limits middleware, PLAN_LIMITS, and how nav/routes are gated by role/plan today (cd-shell roles, middleware.ts). This is the existing enable/disable substrate a MODULE SYSTEM extends. Map exactly how a feature is gated end-to-end now, and what a module-registry would add.", { label: 'a:flags', phase: 'Audit', schema: AUD }),
  () => agent(ACTX + "\n\nAREA: DATA LAYER + API CATALOG (widget data sources). Read apps/frontend/lib/api.ts and enumerate EVERY fetcher (name -> endpoint -> shape) that a dashboard widget could bind to (the real data sources). Note the gateway routes behind them. Flag which return real data vs honest-empty. This becomes the widget 'dataSourceKey' registry.", { label: 'a:data', phase: 'Audit', schema: AUD }),
  () => agent(ACTX + "\n\nAREA: ASSESSMENT / SCREENING current state (OA base). Read screening-service (candidate-screener, schema), the requisition FORM BUILDER (components/cd/RequisitionBuilder.tsx + form-builder-live.tsx + job-service form routes), the public custom-apply form (candidate-portal apply + job-service /public apply-custom), and interview-service. What form/question/scoring/submission machinery ALREADY exists that the native OA test builder+runner can reuse vs what is net-new. Cite models + routes.", { label: 'a:assess', phase: 'Audit', schema: AUD }),
])).filter(Boolean))
log('Audit wave 3/3: prisma models, auth/rbac/tenant, integrations framework')
audit.push(...(await parallel([
  () => agent(ACTX + "\n\nAREA: PRISMA DATA MODELS + service ownership. Survey the prisma/schema.prisma across services and decide WHERE new tables should live: DashboardLayout/WidgetInstance + UserUiPrefs + TenantTheme (which service?), ModuleRegistry/TenantModule (which service?), Assessment/Section/Question/QuestionBank/AssessmentInvite/AssessmentAttempt/AssessmentResult (new service vs extend screening/interview?). Note the RLS pattern (apply-rls.ts, tenantContext, prisma vs prismaAdmin) each must follow. Recommend the table set + owning service + RLS for each of the 3 features.", { label: 'a:prisma', phase: 'Audit', schema: AUD }),
  () => agent(ACTX + "\n\nAREA: AUTH / RBAC / TENANT / USER model. Read identity-service (User model, roles), the JWT claims, gatewayAuth + readAuthHeaders, the role set (ADMIN/RECRUITER/HIRING_MANAGER/INTERVIEWER/COMPLIANCE_OFFICER/SUPER_ADMIN), and managerId hierarchy. Determine how to scope: per-USER dashboard layout + prefs, per-TENANT theme + module enablement + default dashboards, and who (which role) can edit tenant-wide customization vs personal. Cite the claims + middleware.", { label: 'a:auth', phase: 'Audit', schema: AUD }),
  () => agent(ACTX + "\n\nAREA: INTEGRATION FRAMEWORK (OA integrations base). Read notification-service TenantIntegration + Webhook models + routes, the /settings/integrations page, the provider-webhook opt-out (publicWebhook), and any existing outbound-integration/credential storage. What exists to store provider API keys, send outbound calls, and receive inbound webhooks (the base for HackerRank/Codility result webhooks). Cite models + routes; list gaps for an assessment-provider adapter.", { label: 'a:integ', phase: 'Audit', schema: AUD }),
])).filter(Boolean))
log('Audit done: ' + audit.length + '/9')

phase('Synthesize')
log('Synthesis: architecture + data models + build-plan')
const arch = await agent("You are the lead architect. Using ONLY these research findings + codebase audit (cite sources/files; do NOT invent), produce the ARCHITECTURE + DATA MODEL for three features for the CDC ATS (Next.js 14 + Express microservices + Prisma/Postgres + RLS + BullMQ + NATS, static Docker images).\n\nRESEARCH:\n" + JSON.stringify(research) + "\n\nAUDIT:\n" + JSON.stringify(audit) + "\n\nProduce, concretely: (1) CUSTOMIZABLE DASHBOARD/UI: the chosen grid library, the widget-instance + layout JSON schema, the widget registry (mapped to the REAL lib/api data sources the audit found), per-user vs per-tenant persistence (tables + owning service + RLS + resolution order), edit-mode UX, theming/white-label token overrides, and the frontend components to build. (2) MODULE SYSTEM: the module-manifest + registry tables, per-tenant enable/disable layered on the existing feature-flag/plan-gating substrate, how a module toggles nav/routes/widgets/services, and the embeddable/attachable approach. (3) OA PLATFORM: native test builder + runner + scoring data model (reusing the form-builder where possible) AND the third-party provider-adapter interface + invite/result-webhook contract on the integration framework; the code-execution approach. For EACH feature give exact Prisma models (fields), owning service, gateway routes, and frontend files.", { label: 's:arch', phase: 'Synthesize', schema: {
  type: "object", additionalProperties: false,
  properties: {
    dashboardArchitecture: { type: "string" },
    moduleArchitecture: { type: "string" },
    oaArchitecture: { type: "string" },
    prismaModels: { type: "array", items: { type: "object", additionalProperties: false, properties: { model: { type: "string" }, service: { type: "string" }, fields: { type: "string" }, rls: { type: "string" } }, required: ["model", "service", "fields", "rls"] } },
    apiContracts: { type: "array", items: { type: "string" } },
    frontendComponents: { type: "array", items: { type: "string" } },
    libraryChoices: { type: "array", items: { type: "string" } },
    openRisks: { type: "array", items: { type: "string" } },
  }, required: ["dashboardArchitecture", "moduleArchitecture", "oaArchitecture", "prismaModels", "apiContracts", "frontendComponents", "libraryChoices", "openRisks"],
} })

const plan = await agent("Using the architecture below, produce the IMPLEMENTATION BUILD PLAN as a sequence of structured workflows (each ~10-25 agents, disjoint-file partitions, with verify phases) to ship all three features production-ready. Architecture:\n" + JSON.stringify(arch) + "\n\nFor EACH implementation workflow give: name, goal, the agent slices (each = which files/area it owns, kept DISJOINT so agents never collide), cross-phase dependencies (what must land before what), the backend-additive/backward-compatible guarantees (so the frozen v1 demo is never broken), and how it is verified (tsc per service + a no-fabrication/contract audit). Order them by dependency. Also note any new npm dependencies, new Prisma migrations (and the db-push/rebuild recipe), and which workflows can reuse the bespoke viz kit + dashboard-kit. Keep it concrete and buildable.", { label: 's:plan', phase: 'Synthesize', schema: {
  type: "object", additionalProperties: false,
  properties: {
    workflows: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      name: { type: "string" }, goal: { type: "string" },
      slices: { type: "array", items: { type: "string" } },
      dependencies: { type: "string" },
      verification: { type: "string" },
    }, required: ["name", "goal", "slices", "dependencies", "verification"] } },
    newDependencies: { type: "array", items: { type: "string" } },
    migrations: { type: "array", items: { type: "string" } },
    sequencing: { type: "string" },
  }, required: ["workflows", "newDependencies", "migrations", "sequencing"],
} })

return { research, audit, arch, plan }
