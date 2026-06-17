export const meta = {
  name: 'layout-ux-responsive-audit',
  description: 'Phase 1 audit (waved): layout inconsistency, contracted working area, bad UX, unreadable graphs, empty home cards, missing responsive framework across all pages',
  phases: [
    { title: 'Audit', detail: 'waves of <=3 agents auditing disjoint areas read-only' },
    { title: 'Synthesize', detail: 'consolidated prioritized issue map + root causes' },
  ],
}

const FIND = {
  type: "object", additionalProperties: false,
  properties: {
    area: { type: "string" },
    rootCause: { type: "string", description: "the underlying cause, with file:line" },
    issues: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      where: { type: "string", description: "page route + file:line" },
      problem: { type: "string" },
      severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
      evidence: { type: "string", description: "quoted code / measured value" },
    }, required: ["where", "problem", "severity", "evidence"] } },
    recommendation: { type: "string" },
  },
  required: ["area", "rootCause", "issues", "recommendation"],
}

const CTX = "Repo D:/CDC/ATS, Next.js 14 app-router frontend at apps/frontend. READ-ONLY audit — do NOT edit any file. Read/grep the real code, cite file:line, quote the actual values. The app uses 'use client' dashboard pages under app/(dashboard)/, byte-exact 'CD' design screens under components/cd/, a shell (components/cd/cd-shell.tsx) and layouts (components/layouts/, app/(dashboard)/layout.tsx). The user reports: every page has DIFFERENT left/right/bottom spacing (non-uniform margins), the working content area is contracted/too small while the side margins are huge, layouts look bad/un-UX-friendly, graphs (esp. the home agent-activity PetalBloom) have tiny unreadable labels on large/wide screens, the home dashboard has empty cards, and there is no real responsive framework for different aspect ratios. Be specific and exhaustive.";

// each entry: [label, promptTail]
const A = {
  shell: () => agent(CTX + "\n\nAREA: GLOBAL SHELL + PAGE-WIDTH SYSTEM. Read components/cd/cd-shell.tsx, app/(dashboard)/layout.tsx, components/layouts/* and the root app/layout.tsx. Determine EXACTLY how the main content area's width, max-width, horizontal padding, and the sidebar width are set, and whether routes render full-bleed vs inside a constrained container. Identify the single source (or lack thereof) that should give every page uniform spacing. Quote the container styles (padding, maxWidth, margin, grid).", { label: 'audit:shell', phase: 'Audit', schema: FIND }),

  containers: () => agent(CTX + "\n\nAREA: PER-PAGE CONTAINER INVENTORY (the root cause of non-uniform margins). For EACH dashboard page/screen, find its OUTERMOST content wrapper and record its maxWidth + horizontal padding + margin. Cover at least: app/(dashboard)/page.tsx (home/org-overview), candidates, requisitions, sourcing, screening, interviews, scheduling, decisions, offers, hitl(review-queue), chat, workspace, mobility(internal-mobility), settings, compliance, security, audit, analytics, billing, copilot. Also the components/cd/screens/* and components/cd/*Screen.tsx these mount. Produce a TABLE in evidence: page -> maxWidth -> padding -> margin. Flag every divergence (one screen maxWidth 1100, another 1080, another 1200, another none/full-bleed). This inconsistency is the headline bug.", { label: 'audit:containers', phase: 'Audit', schema: FIND }),

  responsive: () => agent(CTX + "\n\nAREA: RESPONSIVE FRAMEWORK. Determine the app's responsive strategy for different aspect ratios/devices (ultrawide desktop, laptop, tablet, mobile). Check: tailwind.config breakpoints, any @media queries (grep app/globals.css + components for '@media'), any container queries, use of clamp()/min()/max()/vw units, fixed-pixel widths that do NOT adapt, and whether the byte-exact CD screens use fixed px layouts. Is there a coherent responsive system or is it ad-hoc? On a very wide screen, does content stay a fixed narrow column with huge empty sides? Quote evidence.", { label: 'audit:responsive', phase: 'Audit', schema: FIND }),

  homeData: () => agent(CTX + "\n\nAREA: HOME DASHBOARD content + emptiness. Read app/(dashboard)/page.tsx (org-overview-live / OrgOverview screen) and its live wrapper. List every card and whether it shows real data or an empty/'Not enough history'/'No recent activity' state, and WHY (no data in DB vs not wired vs honest-empty). Identify which real datasets are available (fetchers in lib/api) that a richer real-time ops dashboard could surface but currently does NOT. The user wants the home to be a jaw-dropping real-time ops dashboard — note what's missing and what real data exists to fill it.", { label: 'audit:home-data', phase: 'Audit', schema: FIND }),

  viz: () => agent(CTX + "\n\nAREA: GRAPH/VIZ READABILITY at large viewports. Audit the visualization kit (components/shared/ribbon.tsx, ribbon-ext.tsx, charts.tsx) and their on-screen labels/fonts. The user says the home 'Agent activity' PetalBloom labels are tiny/unreadable on a wide screen. Find the fixed fontSize values in the SVG viz (e.g. petal labels at fontSize 11, count labels, axis labels) that do NOT scale with the rendered size, and any viz with a fixed small viewBox text. Quote the fontSizes + where they are too small relative to a large rendered card. Recommend a scaling approach (viewBox sizing, larger label fonts, responsive text).", { label: 'audit:viz-readability', phase: 'Audit', schema: FIND }),

  uxTokens: () => agent(CTX + "\n\nAREA: cross-cutting UX + design tokens + density. Audit overall UX quality: spacing scale consistency (gaps, card padding), typography scale, whether cards/sections have consistent radius/shadow/borders, vertical rhythm, and whether pages feel cramped vs balanced. Check the design tokens (globals.css --space/--r/--fs vars, cd-tokens.css) and how consistently pages use them vs hardcoded px. Identify the systemic UX inconsistencies that make the app feel 'bad layout'. This is the qualitative-but-grounded UX audit.", { label: 'audit:ux-tokens', phase: 'Audit', schema: FIND }),

  schedHitl: () => agent(CTX + "\n\nAREA: SCHEDULING + HITL(REVIEW-QUEUE) layout (user marked both 'Bad layout'). Read components/cd/scheduling-live.tsx + screens, and the hitl/review-queue page + screen. The scheduling page shows a left empty gap + unbalanced two-column; the review-queue has a cramped left list + big right panel with awkward proportions. Identify the grid/flex column ratios, fixed widths, and empty-space causes. Quote the layout styles.", { label: 'audit:sched-hitl', phase: 'Audit', schema: FIND }),

  mobility: () => agent(CTX + "\n\nAREA: INTERNAL-MOBILITY + WORKSPACE + SETTINGS layout (user: working area too contracted, margins too big). Read app/(dashboard)/mobility, workspace, settings (+ billing/branding/sms subpages). Find why the working area is small with large left/right/bottom empty space (over-constrained maxWidth, centered narrow column, big padding). Quote the container + content widths.", { label: 'audit:mobility-workspace', phase: 'Audit', schema: FIND }),

  badCharts: () => agent(CTX + "\n\nAREA: OFFERS funnel + other bad-looking charts to replace. Read components/cd/screens/Offers.tsx — the 'Offers by stage' FunnelViz renders as an ugly dark inverted triangle (user circled 'remove & replace'). Inspect the recharts kit (components/shared/charts.tsx) FunnelViz/Treemap/Sankey/RadialGauge usages app-wide and flag any that render poorly (dark/cramped/unreadable). For each, note the page + what a better replacement would be (the house viz kit has 17 nicer models). Quote the current usage.", { label: 'audit:bad-charts', phase: 'Audit', schema: FIND }),

  chatPortal: () => agent(CTX + "\n\nAREA: TEAM CHAT + candidate-portal layout. Read app/(dashboard)/chat/page.tsx — the main panel is empty after selecting a conversation and the layout leaves a big empty bottom. Audit the CURRENT layout + whether selecting a conversation renders the thread + fills the panel. Also audit the candidate-portal pages (app/(candidate-portal)/jobs, c/[slug]/jobs, apply) for layout/spacing consistency with the dashboard. Quote the layout + any empty-space issues.", { label: 'audit:chat-portal', phase: 'Audit', schema: FIND }),
}

phase('Audit')
const audit = []
log('Wave 1/4: shell, containers, responsive')
audit.push(...(await parallel([A.shell, A.containers, A.responsive])).filter(Boolean))
log('Wave 2/4: home-data, viz, ux-tokens')
audit.push(...(await parallel([A.homeData, A.viz, A.uxTokens])).filter(Boolean))
log('Wave 3/4: scheduling-hitl, mobility-workspace')
audit.push(...(await parallel([A.schedHitl, A.mobility])).filter(Boolean))
log('Wave 4/4: bad-charts, chat-portal')
audit.push(...(await parallel([A.badCharts, A.chatPortal])).filter(Boolean))
log('Audit done: ' + audit.length + '/10 areas')

phase('Synthesize')
const synth = await agent("Synthesize the layout/UX/responsive audit into a single actionable plan, using ONLY these findings (do not invent): " + JSON.stringify(audit) + "\n\nProduce: (1) the ROOT-CAUSE summary of the non-uniform spacing (one paragraph, with the specific files that must change to give every page a uniform responsive container); (2) a prioritized issue list (critical->low) grouped by theme: [uniform responsive container/shell], [per-page width/padding divergences], [responsive framework for aspect ratios], [unreadable graph labels], [bad-layout pages: scheduling/hitl/offers/chat/mobility], [empty home dashboard + real-time data to add]; (3) the concrete FIX ARCHITECTURE recommendation (a single PageShell/container component with clamp()-based fluid padding + max-width + responsive grid, applied to every route; a viz label-scaling fix; the home ops-dashboard data sources). Be specific with file paths. This feeds the research + fix workflows.",
  { label: 'synthesize', phase: 'Synthesize', schema: {
    type: "object", additionalProperties: false,
    properties: {
      rootCause: { type: "string" },
      prioritized: { type: "array", items: { type: "object", additionalProperties: false, properties: {
        theme: { type: "string" }, items: { type: "array", items: { type: "string" } }
      }, required: ["theme", "items"] } },
      fixArchitecture: { type: "string" },
      filesToChange: { type: "array", items: { type: "string" } },
    }, required: ["rootCause", "prioritized", "fixArchitecture", "filesToChange"],
  } })

return { audit, synth }
