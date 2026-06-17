export const meta = {
  name: 'viz-readability-and-chart-replacements',
  description: 'WF-Viz: one shared useMeasuredScale hook to kill tiny SVG labels kit-wide, plus the chart replacements (FunnelViz->StepCascade, cramped Treemaps->OrbitField/WaffleField/BarsChart, remove dead RadialGauge)',
  phases: [
    { title: 'Hook', detail: 'create useMeasuredScale + apply to ribbon.tsx (PetalBloom + radial offenders)' },
    { title: 'Apply', detail: 'ribbon-ext.tsx + charts.tsx + consumer chart swaps (disjoint files)' },
    { title: 'Verify', detail: 'frontend tsc + viz-conformance audit' },
  ],
}

const REPORT = {
  type: "object", additionalProperties: false,
  properties: {
    files: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
    buildClean: { type: "boolean" },
    notes: { type: "string" },
  },
  required: ["files", "summary", "buildClean", "notes"],
}

const CTX = "Repo D:/CDC/ATS, Next.js 14 frontend at apps/frontend. FIRST read D:/CDC/ATS/DESIGN_SPEC.md sections 5 (VIZ READABILITY) and 6 (CHART REPLACEMENTS) — the single source of truth. Read the actual files before editing; match existing idioms. HARD RULES: real data or honest empty states only (NEVER fabricated/mock); no em/en dashes in authored copy; the SVG viz kit is the bespoke house kit in apps/frontend/components/shared/ribbon.tsx + ribbon-ext.tsx; the recharts kit is components/shared/charts.tsx. Build your slice with `cd apps/frontend && npx tsc --noEmit` before finishing and report buildClean honestly. The Okabe-Ito categorical tokens (--viz-1..-7) and status tokens already exist in cd-tokens.css.";

phase('Hook')
log('Create the shared measured-scale hook + apply to ribbon.tsx (PetalBloom first)')
const hook = await agent(CTX + "\n\n=== SLICE: shared useMeasuredScale hook + ribbon.tsx ===\n1) CREATE apps/frontend/components/shared/use-measured-scale.ts: a tiny client hook `useMeasuredScale(viewBoxWidth: number): [React.RefObject<SVGSVGElement>, number]` that attaches a ResizeObserver to the <svg> ref and returns the live forward scale k = svgEl.clientWidth / viewBoxWidth (default k=1 until measured; guard SSR / zero width). Export a helper too: `scaledFont(basePx: number, k: number, minPx = 11) => Math.max(basePx, minPx / k)` so on-screen text never drops below ~11px (12-14 for primary readouts) regardless of how the fixed viewBox is stretched. Keep it dependency-free (React only).\n2) APPLY in apps/frontend/components/shared/ribbon.tsx: import the hook; in PetalBloom attach the ref to its <svg>, route EVERY text fontSize through scaledFont(BASE,k) (petal label ~13-14 base, sub ~11.5, centerSub ~11, hub keeps its size) so labels stay legible on wide screens; DROP PetalBloom's `maxWidth:660` self-cap so it can fill its card; fix the near-vertical petal label collision (loosen the sin>±0.35 textAnchor flip + nudge tipR / add a small vertical de-overlap). Then apply the SAME scaledFont treatment to the other cited sub-9px-after-scale offenders in ribbon.tsx: OrbitField (label/sub ~265/274), HaloStack/RayBurst centerSub (~805/993), SonarSweep (~607/619), FlowRibbon (~127/130). Long category labels: keep/extend the existing ellipsis + <title> tooltip pattern. Use the --viz-1..-7 tokens for categorical series fills where a chart currently hardcodes series colors. Build: cd apps/frontend && npx tsc --noEmit. Report the hook's exact export signature + file path in notes so the Apply agents import it correctly.", { label: 'viz:hook', phase: 'Hook', schema: REPORT })
log('Hook done: buildClean=' + (hook && hook.buildClean))

phase('Apply')
log('3 agents: ribbon-ext / charts / consumer swaps (disjoint files)')
const APPLY = CTX + "\n\nThe Hook phase created apps/frontend/components/shared/use-measured-scale.ts exporting `useMeasuredScale(viewBoxWidth)` -> [svgRef, k] and `scaledFont(basePx,k,minPx=11)`. Import from '@/components/shared/use-measured-scale' (or the correct relative path) and use it; do NOT redefine it.";
const apply = (await parallel([
  () => agent(APPLY + "\n\n=== SLICE: ribbon-ext.tsx ===\nIn apps/frontend/components/shared/ribbon-ext.tsx apply useMeasuredScale + scaledFont so labels stay >=11px on screen for the cited offenders: KiteRadar grid/axis labels (~436/445), CalendarHeat day/month labels (~335/362), and the SPLIT models (StreamGraph, WaffleField, ActivityRings, HoneyComb, MilestoneSpine) wherever a fixed fontSize sits in a fixed viewBox rendered width:100%. Attach the ref to each model's <svg> and route its text fontSizes through scaledFont. Keep the value-panel HTML text (already real CSS px) as-is. Build: cd apps/frontend && npx tsc --noEmit.", { label: 'viz:ribbon-ext', phase: 'Apply', schema: REPORT }),
  () => agent(APPLY + "\n\n=== SLICE: charts.tsx (recharts kit) ===\nIn apps/frontend/components/shared/charts.tsx: (1) the AutoSize wrapper already measures width — derive tick/label/legend/treemap/sankey/funnel-label fontSizes from that width via fontSize = Math.max(11, Math.round(w/60)) so labels grow on big cards instead of staying pinned (axis tick ~133, threshold ~236, TreemapCell ~329-334, SankeyNode ~367/373, FunnelViz LabelList ~457). (2) REMOVE the dead RadialGauge export (~421-445, zero call sites) and any now-unused imports. (3) Harden the FunnelViz definition as a fallback (in case any caller keeps it): add `margin={{left:90,right:90,top:8,bottom:8}}` to the FunnelChart and change both LabelList `fill=\"currentColor\"` to explicit theme tokens (name -> var(--ink), value -> var(--ink-2)) so labels never render dark/clipped. Build: cd apps/frontend && npx tsc --noEmit.", { label: 'viz:charts', phase: 'Apply', schema: REPORT }),
  () => agent(APPLY + "\n\n=== SLICE: consumer chart swaps (spec 6) ===\nReplace the bad chart usages with the house-kit equivalents (all live in components/shared/ribbon.tsx / ribbon-ext.tsx; props take the same real data). (1) FunnelViz -> StepCascade at: components/cd/screens/Offers.tsx (~111-114, the 'Offers by stage', bump the ChartCard height 190->220), app/(dashboard)/page.tsx (~304-317, home 'Hiring pipeline'), components/cd/AnalyticsScreen.tsx (~139-145, 'Pipeline funnel', height ~260). Map funnel data {name,value} -> StepCascade stages {label, n} (read StepCascade's exact prop names in ribbon.tsx ~822 first). (2) Channel-mix Treemap -> OrbitField (or WaffleField): app/(dashboard)/page.tsx (~294 'Where candidates come from' -- this is REDUNDANT with the OrbitField already at ~361, so just REMOVE the treemap card) and components/cd/screens/OrgOverview.tsx (~200). (3) Spend-by-tenant Treemap -> horizontal BarsChart at components/cd/AiSurfaceScreens.tsx (~42) to match its sibling 'Spend by agent'. Preserve all real data + honest empty states; do NOT fabricate. Build: cd apps/frontend && npx tsc --noEmit.", { label: 'viz:consumers', phase: 'Apply', schema: REPORT }),
])).filter(Boolean)
log('Apply done: ' + apply.length + '/3')

phase('Verify')
const verify = (await parallel([
  () => agent("Build verification for D:/CDC/ATS frontend. Run verbatim: cd apps/frontend && npx tsc --noEmit. Report REPORT: files=files with type errors, summary=pass/fail, buildClean=true iff zero errors, notes=every error verbatim.", { label: 'vf:tsc', phase: 'Verify', schema: REPORT }),
  () => agent(CTX + "\n\n=== AUDIT: viz conformance (read-only) ===\nVerify citing file:line: (1) use-measured-scale.ts exists and exports useMeasuredScale + scaledFont; PetalBloom (ribbon.tsx) routes its label fontSizes through scaledFont and no longer hard-caps maxWidth:660. (2) ribbon-ext.tsx + the cited ribbon.tsx offenders use scaledFont. (3) FunnelViz is REPLACED by StepCascade at Offers.tsx, app/(dashboard)/page.tsx, AnalyticsScreen.tsx (grep that no <FunnelViz is left at those 3 sites). (4) the cramped channel-mix Treemaps are gone (page.tsx redundant one removed, OrgOverview swapped) and AiSurfaceScreens spend-by-tenant uses BarsChart. (5) dead RadialGauge removed from charts.tsx. (6) NO new mock/sample/fabricated data introduced. Return REPORT: files=violations, summary=verdict, buildClean=true iff conformant, notes=each issue with file:line.", { label: 'vf:audit', phase: 'Verify', schema: REPORT }),
])).filter(Boolean)

return { hook, apply, verify }
