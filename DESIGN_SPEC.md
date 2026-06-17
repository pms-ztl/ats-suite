# CDC ATS — Responsive + Dashboard Design Spec (2026)

Single source of truth for the layout/responsive/viz/dashboard rebuild. Derived from a
10-area code audit + a 10-topic 2026 web-research pass. Implementers: read this, then your
slice. HARD RULES: real data or honest empty states only (NEVER fabricated/mock/0-as-empty);
match existing code idioms; no em/en dashes in authored copy; build (`npx tsc --noEmit`) before
finishing. The dashboard is wrapped in `.cd-scope`; tokens live in
`apps/frontend/components/cd/cd-tokens.css` (light = `.cd-scope`, dark = `.dark .cd-scope`).

NOTE ON `zoom:0.9`: KEEP the global `html { zoom: 0.9 }` (globals.css) and the
`calc(100dvh / 0.9)` in cd-shell.tsx. It is a uniform scale, not the cause of the non-uniform
margins, and removing it destabilizes the byte-exact design. Do NOT touch it.

---

## 1. CONTAINER SYSTEM (the headline fix)

ROOT CAUSE: there is no shared page container. cd-shell.tsx forks into full-bleed (no padding)
vs flow (`padding:24`), and neither caps or centers width, so every screen sets its own
`maxWidth` (720..1280) + padding (24/26/28/30/36). That is why margins differ per page and
content is a narrow band on wide screens.

### 1a. Tokens to ADD in cd-tokens.css `.cd-scope` (layout block near `--rail/--side/--topbar`)
```css
/* page-shell width system (Every Layout "Center" pattern) */
--page-gutter: clamp(16px, 1rem + 1.5vw, 40px);  /* fluid side gutter */
--page-max: 1440px;        /* standard dashboard cap (cards/tables/charts) */
--page-max-wide: 1760px;   /* ultrawide / bento variant */
--page-max-prose: 66ch;    /* single-column running text only */
```

### 1b. The shared `.cd-page` class (add to cd-tokens.css, NOT scoped per-page)
```css
.cd-scope .cd-page {
  inline-size: 100%;
  max-inline-size: var(--page-max);
  margin-inline: auto;
  padding-inline: var(--page-gutter);
  padding-block: clamp(16px, 2vw, 28px);
}
.cd-scope .cd-page[data-width="wide"]  { max-inline-size: var(--page-max-wide); }
.cd-scope .cd-page[data-width="prose"] { max-inline-size: var(--page-max-prose); }
```

### 1c. cd-shell.tsx flow branch — route flow pages through `.cd-page`
Replace the inner `<div style={{ padding: 24 }}>{children}</div>` (the flow branch) with:
```tsx
<div className="cd-page">{children}</div>
```
Keep the outer `<div style={{ flex:1, minHeight:0, overflowY:"auto" }}>`. Bleed branch keeps
its definite-height flex parent. KEEP `height:"calc(100dvh / 0.9)"`.

### 1d. FULL_BLEED membership corrections (cd-shell.tsx:212)
Bleed = a true full-height pane that owns its own scroll/layout. Flow = scrolls inside `.cd-page`.
- ADD `/chat` to bleed (it is a fixed-height two-pane app; today it collapses in the auto-height
  flow branch). Also fix the chat page root: `height:100%` -> `flex:1; minHeight:0`.
- REMOVE `/scheduling` and `/mobility` from bleed (they are scroll content that self-caps to a
  narrow centered column; let `.cd-page` give them the uniform cap+gutter).
- KEEP bleed for the byte-exact board/table screens: /screening /candidates /decisions /offers
  /interviews /requisitions /analytics /billing /copilot /security /ai /admin/*.
- `/hitl` stays bleed BUT fix its internals (drop the 760 self-cap, make the 380px+1fr grid
  responsive — see §6).

### 1e. Per-page cap removal (every FLOW page)
DELETE the bespoke `maxWidth` + `margin:0 auto` + `mx-auto max-w-[...]` + ad-hoc outer padding
on each screen so spacing comes ONLY from `.cd-page`. Cap only true prose columns locally with
`data-width="prose"` on a wrapper. Targets (audit file:line): OrgOverview.tsx:100 (1280),
page.tsx:186/489 (1200) /746 (980), Requisitions.tsx:40 (1240), Offers.tsx (1080),
Interviews.tsx (~1100), InterviewerHome.tsx:13 (980), HITL.tsx:64 (760), Decisions.tsx:121 (720),
AnalyticsScreen.tsx (1240), settings/page.tsx:334 (820)+layout.tsx:17 (1280)+branding:104+sms:227
(820), workspace/page.tsx:318 (1200)+CSS wrap 1100, AiSurfaceScreens.tsx:84 (980),
scheduling-live.tsx:130/136 (1100).

---

## 2. RESPONSIVE SYSTEM

Breakpoints (Tailwind v4 scale): sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536, plus a custom
`3xl 1920` for the ultrawide/bento variant. Prefer CSS `@media` in cd-tokens.css (or container
queries for cards) — there are currently ZERO breakpoints in the dashboard.

Grid reflow — replace hardcoded fixed-fraction grids with auto-fit so ultrawide gains COLUMNS,
not stretched cards:
- KPI tile rows: `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`.
- Chart-card regions: `repeat(auto-fit, minmax(300px, 1fr))`.
- Gaps: `gap: clamp(8px, 2vw, 24px)` (8px base rhythm).
- Two-column working layouts (scheduling, hitl): `repeat(auto-fit, minmax(340px, 1fr))` and
  `align-items: stretch` (not start) so the short column matches the tall one.
Collapse rule: multi-col bands -> 1 col under ~1024px; KPI row 4-up -> 2-up under md -> 1-up at sm.

---

## 3. FLUID TYPE + SPACE (additive; do NOT remove the existing px scale)

Add a spacing ramp token set (4/8 base) to cd-tokens.css and use it for new code:
```css
--space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:20px;
--space-6:24px; --space-8:32px; --space-10:40px; --space-12:48px;
```
For NEW dashboard KPI values use a fluid clamp: `font-size: clamp(1.75rem, 1.2rem + 2vw, 2.5rem)`
with `font-variant-numeric: tabular-nums; letter-spacing:-0.012em`. Min on-screen label floor in
SVG viz = 11px (see §5). Do not refactor the existing fixed px scale globally.

---

## 4. AESTHETIC DIRECTION (shed the heavy green tint; premium-neutral)

- SURFACES stay near-neutral (chroma <= 0.008 — already true). The risk is `--brand-tint`
  (0.028c) / `--brand-tint-2` (0.045c): use them ONLY for selected/active/AI states, NEVER as
  page or card backgrounds. Audit any card/section using `--brand-tint*` as a background and
  switch it to `--surface`/`--surface-2`.
- ACCENT rationed to <=10% of pixels: status dots, ONE primary CTA per screen, active nav,
  focus ring, data-viz series.
- AURORA: dial WAY down on dense data routes (home dashboard, screening, analytics) so it does
  not compete with charts. Add a `data-dense` flag or a route-scoped class that sets
  `--aurora-opacity: .18` (light) / `.22` (dark) on those routes; keep the richer aurora on
  marketing/empty/auth screens. (globals.css `.aurora` already reads `--aurora-opacity`.)
- ELEVATION: keep `--e1` for cards; cards separate via the 1px `--line` border in light and the
  surface luminance step in dark (already correct). Reserve `--e2`/`--e3` for popovers/modals.
- RADIUS hierarchy: inputs/buttons `--r-sm`(8), cards `--r`/`--r-lg`(11/14), modals `--r-xl`(18),
  status/role pills `--r-pill` ONLY. Do not radius everything the same.
- MOTION: wrap real-time pulses/count-ups/chart draw-in in
  `@media (prefers-reduced-motion: no-preference)`; provide an opacity-only/instant reduce branch.

---

## 5. VIZ READABILITY (kills the tiny-label class kit-wide)

Add ONE shared hook in the viz kit (ribbon.tsx or a new shared util):
```ts
// returns k = renderedWidth / viewBoxWidth via ResizeObserver on the <svg>
function useMeasuredScale(viewBoxWidth: number): [React.RefObject<SVGSVGElement>, number]
```
Then route every SVG text fontSize through a floor so on-screen px never drops below ~11:
`fontSize = Math.max(BASE, MIN_PX / k)` where MIN_PX = 11 (12-14 for primary readouts).
Apply to PetalBloom first (ribbon.tsx:523-536), then OrbitField (265/274), HaloStack/RayBurst
(805/993), SonarSweep (607/619), FlowRibbon (127/130), ribbon-ext KiteRadar (436/445),
CalendarHeat (335/362). Drop PetalBloom's `maxWidth:660` self-cap; fix near-vertical petal label
collisions (loosen the sin>±0.35 anchor flip). Long labels: ellipsis + `<title>` tooltip.

Categorical palette: adopt Okabe-Ito (CVD-safe) as the viz series tokens —
#E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7 (+ #000000). In-fill text color picks
black vs white by the fill's relative luminance (threshold 0.179). role=img + title/desc on each
chart.

---

## 6. CHART REPLACEMENTS (fix the circled funnel + cramped treemaps)

- FunnelViz -> house-kit `StepCascade` (ribbon.tsx:822) at all 3 call sites: Offers.tsx:111-114
  (bump card height 190->220), app/(dashboard)/page.tsx:304-317 (home Hiring pipeline),
  AnalyticsScreen.tsx:139-145 (height ~260). StepCascade has readable bold value labels,
  uppercase stage labels, "-N" drop annotations, auto-height viewBox. If any FunnelViz must
  remain, add `margin={{left:90,right:90,top:8,bottom:8}}` and change both LabelList
  `fill="currentColor"` to explicit tokens.
- Channel-mix Treemap -> `OrbitField` (ribbon.tsx:220) or `WaffleField` (ribbon-ext.tsx:166):
  page.tsx:294 (also redundant with the OrbitField already at page.tsx:361 — remove the treemap),
  OrgOverview.tsx:200.
- "Spend by tenant" Treemap (AiSurfaceScreens.tsx:42) -> horizontal `BarsChart` to match its
  sibling "Spend by agent".
- Home "Source-to-stage" Sankey (page.tsx:322-331): raise node label fontSize via §5; or swap to
  `StreamGraph`.
- REMOVE dead `RadialGauge` (charts.tsx:421-445, zero call sites).

---

## 7. REAL-TIME OPS HOME (real data only; honest empty states)

### 7a. Live infra
- Status tokens in cd-tokens.css: `--st-good:#22C55E; --st-warn:#F59E0B; --st-bad:#EF4444;
  --st-info:#3B82F6; --st-nodata:#9CA3AF` (+ tinted chip bg variants). Map up/down via these.
- A single header-level `<LiveStatus>` pulse (role="status", green dot + "Updated Ns ago",
  amber when stale past 2x the refresh) — ONE pulse per page, not per card. The app already has
  `lib/use-data.ts` (45s refetch + focus revalidation, paused while hidden) — reuse it; surface
  its freshness in LiveStatus. No skeleton on refresh (keep previous data; skeleton only cold).

### 7b. KPI card anatomy (one shared component, identical across cards)
NAME (12-14px uppercase muted) / VALUE (clamp(1.75rem,1.2rem+2vw,2.5rem), tabular-nums,
-0.012em) / PERIOD caption / DELTA PILL (arrow glyph + signed value + "vs last period", colored
by direction-of-goodness per metric — inverse metrics like time-to-fill go RED on increase) /
SPARKLINE (no axes/grid, accent the latest point). Cap the top row at 4-6 tiles.

### 7c. Honest empty states (NEVER a fake 0)
Absent metric -> em-dash "—" + `--st-nodata` gray + "No data yet"/"Not enough history". Suppress
the delta pill entirely when there is no prior period. Distinguish a real measured 0 from absent.

### 7d. Home blueprint (12-col bento, top->bottom), each widget -> REAL dataset -> house-viz model
| Band | Widget | Dataset (lib/api) | Viz model | Span |
|---|---|---|---|---|
| Hero KPI row (4-6) | Candidates in pipeline (w/ sparkline) | weeklyCounts | KpiCard + sparkline | 2-3 |
| | Time-to-fill (vs benchmark) | getFunnel/listRequisitions timestamps | KpiCard + bullet | 2-3 |
| | Offer acceptance (R/A/G zones) | listOffers lifecycle | KpiCard | 2-3 |
| | HITL pending (-> 0 = healthy) | getOversight | KpiCard | 2-3 |
| | AI spend this period | getBillingUsage | KpiCard | 2-3 |
| Primary | Hiring funnel + pass-through % | getFunnel | FlowRibbon (Sankey) / StepCascade | 8 |
| | Diversity parity (gated, real demo data only) | (DEI module) | WaffleField/stacked | 4 |
| Breakdowns | Source of hire (applied+hired) | getSourceOfHire | OrbitField / dual bar | 4 |
| | AI spend by provider over time | getSpendTrend | StreamGraph / area | 4 |
| | Screening verdict mix (ADVANCE/REVIEW/REJECT) | listScreening | WaffleField / stacked bar | 4 |
| | Interview load / weekly | listInterviews | CalendarHeat / line | 4 |
| | Per-agent runs/tokens/cost | getBillingUsage.byAgent | BarsChart (sortable) | 8 |
| Activity | Activity timeline / pending | (real feed or hide) | Timeline | 8 |

Backend: `apps/api-gateway/src/routes/platform.ts` currently returns `null` for avgTimeToHire /
offerAcceptRate / complianceScore / diversityScore and emits no `*Change`/`*Sparkline`. Compute
real values + a real 7-point sparkline + period deltas, OR keep the card on an honest empty state.
`org-overview-live.tsx` must stop hardcoding `activity:[]` (:73), `trend:[]` (:106),
`agentBars:[]` (:111) — wire to real data or hide those cards. `lib/api.ts:786-789` must stop
coercing `null -> 0` (render em-dash, not 0 + flat spark).

---

## 8. SEQUENCE
WF-Foundation (container + tokens + responsive + aesthetics + bad pages) -> WF-Viz (useMeasuredScale
+ chart replacements) -> WF-Dashboard (platform.ts real data + home blueprint). Validate host TS
(`npm run build --workspace=@cdc-ats/frontend`) before any Docker rebuild; frontend public/ is baked
at build time so changes need image rebuild + recreate.
