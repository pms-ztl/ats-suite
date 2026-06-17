export const meta = {
  name: 'responsive-and-dashboard-design-research',
  description: 'Phase 2 research (waved): 2026 standards for responsive layout across aspect ratios + real-time ATS ops-dashboard design + advanced visualization, synthesized into a concrete design spec',
  phases: [
    { title: 'Research', detail: 'waves of <=3 web-research agents' },
    { title: 'Spec', detail: 'synthesize into a concrete design spec grounded in the audit + real datasets' },
  ],
}

const RES = {
  type: "object", additionalProperties: false,
  properties: {
    topic: { type: "string" },
    standards: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      practice: { type: "string", description: "the concrete, named best practice" },
      detail: { type: "string", description: "exact values / formulas / tokens / when-to-use" },
      source: { type: "string", description: "URL or named authority" },
    }, required: ["practice", "detail", "source"] } },
    appliedToOurApp: { type: "string", description: "how this maps to our Next.js dashboard (cd-shell, cd-tokens.css, the viz kit, the home ops dashboard)" },
  },
  required: ["topic", "standards", "appliedToOurApp"],
}

const CTX = "You are a senior product-design + frontend-architecture researcher. USE WebSearch and WebFetch (load them via ToolSearch: query 'select:WebSearch,WebFetch') to research CURRENT 2026 best practices. Cite real source URLs. Be concrete: return exact numeric values, CSS formulas, clamp() expressions, token values, breakpoint numbers, named patterns — NOT vague advice. Target context: a premium multi-tenant SaaS ATS (applicant tracking system) dashboard, Next.js 14 + React, CSS-in-JS inline styles + a cd-tokens.css token layer, a bespoke SVG visualization kit. Goal: a uniform, fully responsive (mobile/laptop/ultrawide aspect ratios), neat/clean/elegant, jaw-dropping real-time operations dashboard. End every finding with how it APPLIES to our app.";

const R = {
  container: () => agent(CTX + "\n\nTOPIC: Fluid content-container & page-width standards for data-dense SaaS dashboards in 2026. Research: the canonical 'centered content column' pattern (max-width + margin-inline:auto + fluid side gutter), recommended MAX content widths for dashboards vs prose (e.g. 1440-1600px dashboard cap, 65-75ch prose), fluid gutter via clamp() (exact px/vw/px triples), how to make ULTRAWIDE screens fill usefully instead of a narrow centered band (multi-column, bento, max-width vs fluid), and the 'one shared layout primitive / page shell' approach. Give exact recommended token values we can put in cd-tokens.css (--page-max, --page-gutter clamp). Sources: web.dev, MDN, Smashing, Utopia, design-system docs.", { label: 'res:container', phase: 'Research', schema: RES }),

  cq: () => agent(CTX + "\n\nTOPIC: Container queries vs media queries in 2026 — the modern responsive strategy. Research: current browser support for CSS container queries (@container, container-type), when to prefer container queries over media queries for dashboard cards/grids, recommended breakpoint VALUES for dashboards (mobile <=640, tablet 641-1024, laptop 1025-1440, ultrawide >1440 — confirm/correct against 2026 sources), grid reflow patterns (repeat(auto-fit, minmax(Xpx,1fr)) recommended minmax values for KPI cards vs chart cards), and how to make a 4-up KPI row collapse to 2-up then 1-up. Give exact CSS we can drop in. Sources: web.dev, MDN, css-tricks, ishadeed.", { label: 'res:container-queries', phase: 'Research', schema: RES }),

  type: () => agent(CTX + "\n\nTOPIC: Fluid typography & spacing scales 2026. Research: fluid type with clamp() (the Utopia/CSS-locks method — exact clamp(min, preferred-with-vw, max) construction and a recommended type-scale ramp for a dashboard: caption/body/h3/h2/h1), the 8pt (4/8px) spacing grid and a recommended spacing-token ramp (--space-1..-8 values), fluid spacing with clamp() for section gaps, and minimum legible font sizes for UI labels and chart labels (the ~11-12px floor). Give exact token values + clamp expressions for cd-tokens.css. Sources: Utopia.fyi, web.dev, Material/IBM Carbon/Atlassian design systems.", { label: 'res:type-space', phase: 'Research', schema: RES }),

  layout: () => agent(CTX + "\n\nTOPIC: Modern SaaS operations-dashboard LAYOUT patterns 2026. Research: the standard information hierarchy of a great ops dashboard (hero KPI/scorecard row at top -> primary trend/funnel -> secondary breakdowns -> activity/feed), the 12-column and 'bento grid' layouts, card grouping and visual rhythm, density vs whitespace balance for an 'operator at a glance' view, F/Z reading patterns, progressive disclosure, and above-the-fold prioritization. What makes a dashboard feel 'premium / jaw-dropping' vs cluttered. Give a concrete recommended grid structure (rows, column spans) for our ATS home. Sources: Pencil&Paper, NN/g, Smashing, design-system dashboard guidelines, Dribbble/Mobbin patterns.", { label: 'res:dash-layout', phase: 'Research', schema: RES }),

  atsKpis: () => agent(CTX + "\n\nTOPIC: What a best-in-class ATS / recruiting-operations dashboard SURFACES (the metrics + widgets). Research the real recruiting-ops KPIs and how leading ATS analytics (Ashby, Gem, Greenhouse, Lever, Workday) present them: time-to-hire / time-to-fill, pipeline funnel + conversion by stage, source-of-hire / channel mix, offer acceptance rate, interview load & scheduling SLA, pass-through rates, candidate inflow over time, recruiter/agent activity, DEI/diversity parity, and AI-agent run/cost metrics for an AI-native ATS. For EACH, note the ideal visualization type. Map these to OUR available real datasets: getFunnel, getBillingUsage (per-agent runs/tokens/cost), getSpendTrend, getOversight (HITL SLA), getSourceOfHire, listInterviews, listScreening (verdict mix), listOffers (lifecycle), listRequisitions (by dept), weeklyCounts (inflow). Sources: Ashby/Gem/Greenhouse analytics docs, AIHR, recruiting-metrics references.", { label: 'res:ats-kpis', phase: 'Research', schema: RES }),

  realtime: () => agent(CTX + "\n\nTOPIC: Real-time / live dashboard UX 2026. Research: how to present LIVE data well (a subtle 'live' pulse indicator, 'last updated Xs ago', auto-refresh cadence best practices ~30-60s for ops, polling vs SSE/websocket UX), updating charts WITHOUT skeleton flicker (in-place transitions), sparklines + delta/trend pills (up/down with color semantics, the +N% vs last-period pattern), KPI scorecard anatomy (value + label + delta + sparkline + target), and how to show honest empty/no-data states (em-dash, 'not enough history') instead of fake zeros. Give concrete component anatomy we can build. Sources: NN/g, Pencil&Paper, Linear/Vercel/Stripe dashboard patterns.", { label: 'res:realtime', phase: 'Research', schema: RES }),

  advViz: () => agent(CTX + "\n\nTOPIC: Advanced / distinctive data-visualization models 2026 (the 'unique, sellable' charts the user wants) — and when each is appropriate. Research modern viz beyond bar/line/pie: radial/rose (petal) charts, stream/themeriver graphs, bump charts, bullet charts, waffle/unit charts, sankey/flow, calendar heatmaps, activity rings, beeswarm, slope charts, horizon charts. For EACH: what data shape it fits, readability pitfalls, and whether it suits an ATS ops dashboard. We HAVE a 17-model bespoke SVG kit (FlowRibbon, ArcMeter, OrbitField, PetalBloom, SonarSweep, TideBands, FillGauge, StepCascade, StreamGraph, WaffleField, ActivityRings, CalendarHeat, KiteRadar, MilestoneSpine, HoneyComb, BeadStream, PulseLine). Recommend WHICH model to use for WHICH ATS metric. Sources: FlowingData, Datavis catalog, Observable, datavizproject, Andy Kirk.", { label: 'res:adv-viz', phase: 'Research', schema: RES }),

  aesthetics: () => agent(CTX + "\n\nTOPIC: Premium SaaS dashboard AESTHETICS 2026 (neat, clean, elegant, 'not classical/simple'). Research the current premium look: restrained neutral palettes + one accent, the move away from heavy green tints toward neutral/slate surfaces, soft elevation/shadow tokens, border vs shadow card separation, subtle gradients/mesh used sparingly, glass vs flat in 2026, corner-radius scales, micro-interactions/motion (tasteful, prefers-reduced-motion), and dark+light parity. What specific choices read as 'expensive/premium' vs 'template'. Give concrete token-level recommendations (shadow ramp, radius ramp, accent usage, surface colors) that fit a clean SaaS ATS. Sources: Linear, Vercel, Stripe, Raycast, Mobbin, Refactoring UI.", { label: 'res:aesthetics', phase: 'Research', schema: RES }),

  vizA11y: () => agent(CTX + "\n\nTOPIC: Responsive SVG chart label readability + data-viz accessibility 2026. Research: keeping SVG text legible when the chart scales (the problem of fixed fontSize in a fixed viewBox rendered at width:100% — solutions: measure container + counter-scale font, non-scaling text, HTML label overlays, minimum on-screen px floor ~11-12px), label-collision avoidance for radial charts, ellipsis/truncation for long labels, colorblind-safe categorical palettes (Okabe-Ito, Tableau-10, ColorBrewer), text-contrast minimums on colored fills (WCAG), and legend vs direct-labeling. Give a concrete recommended approach (e.g. a useMeasuredScale ResizeObserver hook + fontSize = max(11, BASE/k)). Sources: web.dev, WCAG, Datawrapper blog, Highcharts a11y, observablehq.", { label: 'res:viz-a11y', phase: 'Research', schema: RES }),

  bench: () => agent(CTX + "\n\nTOPIC: Competitive teardown of premium analytics dashboards (visual benchmark). Research how the BEST-looking analytics/ops dashboards in 2026 are composed — Ashby, Gem, Linear Insights, Vercel Analytics, Stripe Dashboard, Posthog, Retool — specifically their home/overview layout: scorecard row design, primary chart treatment, the grid/bento composition, spacing density, and the signature 'premium' details. Pull concrete observations (from docs, public screenshots, Mobbin, Dribbble) we can emulate for an ATS ops home. Note 3-5 specific compositional moves that make them look high-end. Sources: Mobbin, Dribbble, the products' own marketing/docs pages.", { label: 'res:bench', phase: 'Research', schema: RES }),
}

phase('Research')
const research = []
log('Wave 1/4: container, container-queries, type+space')
research.push(...(await parallel([R.container, R.cq, R.type])).filter(Boolean))
log('Wave 2/4: dashboard-layout, ats-kpis, realtime-ux')
research.push(...(await parallel([R.layout, R.atsKpis, R.realtime])).filter(Boolean))
log('Wave 3/4: advanced-viz, aesthetics, viz-a11y')
research.push(...(await parallel([R.advViz, R.aesthetics, R.vizA11y])).filter(Boolean))
log('Wave 4/4: competitive-bench')
research.push(...(await parallel([R.bench])).filter(Boolean))
log('Research done: ' + research.length + '/10 topics')

phase('Spec')
const AUDIT_FACTS = "Audit established: root cause = no shared page container in cd-shell.tsx (forks full-bleed vs padding:24, neither caps/centers); per-page maxWidth caps all differ (OrgOverview 1280, Requisitions 1240, homes 1200/980, Offers 1080, HITL 760, Decisions 720, Settings 820); html{zoom:0.9}+calc(100dvh/0.9) hack; ZERO @media/container queries; duplicate tokens (--topbar 56/60, --rail 64/76, --side 268); PetalBloom + whole SVG kit have fixed-viewBox fonts that shrink in narrow columns; FunnelViz renders as dark clipped wedge (StepCascade is the house-kit replacement); home cards empty because platform.ts returns nulls + org-overview-live hardcodes activity:[]/trend:[]/agentBars:[]. REAL datasets available to fill the home with NO fabrication: getFunnel, getBillingUsage, getSpendTrend, getOversight (HITL SLA), getSourceOfHire, listInterviews, listScreening (verdict mix), listOffers (lifecycle), listRequisitions (by dept), weeklyCounts (inflow), SonarSweep interview radar (already real on recruiter home).";

const spec = await agent("You are the lead design architect. Using ONLY these research findings (cite their sources) + the audit facts, produce a CONCRETE, implementable DESIGN SPEC for the fix workflows.\n\nRESEARCH FINDINGS:\n" + JSON.stringify(research) + "\n\nAUDIT FACTS:\n" + AUDIT_FACTS + "\n\nProduce a spec with: (1) CONTAINER SYSTEM — exact cd-tokens.css values: --page-max, --page-gutter (clamp), the shared .cd-page container rules, and the bleed opt-out rule; (2) RESPONSIVE SYSTEM — exact breakpoints + whether to use @container or @media, and the auto-fit minmax values for KPI rows vs chart cards; (3) FLUID TYPE + SPACE — exact clamp() type ramp + spacing ramp token values; (4) AESTHETIC DIRECTION — surface/shadow/radius/accent tokens for a clean premium look (move off the green tint); (5) HOME OPS-DASHBOARD BLUEPRINT — the exact widget list top-to-bottom (scorecard row -> primary -> breakdowns -> activity), each mapped to a REAL dataset from the audit facts AND to a specific house-viz model, with grid spans; (6) VIZ READABILITY FIX — the exact useMeasuredScale approach + min-font floor; (7) CHART REPLACEMENTS — FunnelViz->StepCascade, cramped Treemap->OrbitField/WaffleField, etc. Be specific enough that an implementer copies values directly.",
  { label: 'spec', phase: 'Spec', schema: {
    type: "object", additionalProperties: false,
    properties: {
      containerSystem: { type: "string" },
      responsiveSystem: { type: "string" },
      fluidTypeSpace: { type: "string" },
      aestheticDirection: { type: "string" },
      homeDashboardBlueprint: { type: "array", items: { type: "object", additionalProperties: false, properties: {
        widget: { type: "string" }, dataset: { type: "string" }, vizModel: { type: "string" }, gridSpan: { type: "string" }, notes: { type: "string" }
      }, required: ["widget", "dataset", "vizModel", "gridSpan"] } },
      vizReadabilityFix: { type: "string" },
      chartReplacements: { type: "array", items: { type: "string" } },
      sources: { type: "array", items: { type: "string" } },
    }, required: ["containerSystem", "responsiveSystem", "fluidTypeSpace", "aestheticDirection", "homeDashboardBlueprint", "vizReadabilityFix", "chartReplacements", "sources"],
  } })

return { research, spec }
