# Data contract, batch C1 (dashboards)

How to read this: each screen takes a single `data` prop (plus optional `on*`
handlers). Every field below is what the app must supply; arrays passed as `[]`
render a graceful empty state. Exact TS interfaces live in `components/types.ts`.
Enums are verbatim from Appendix C. No data is fetched inside any component.

Shared sub-shapes (from the kit): `KPI`, `HeroStat`, `FunnelStage`, `DonutDatum`,
`TimelineItem`, `PendingItem`. See their per-field notes in `components/types.ts`.
Key recurring fields:
- `KPI.value` raw number (CountUp animates to it); `KPI.spark` series oldest->newest;
  `KPI.delta` already-computed change vs last period; `KPI.good` whether that delta is
  positive in meaning; `KPI.suffix`/`prefix` units ("%", "d", "$"); `KPI.ai` marks a
  machine metric (violet accent + AI pill).
- `FunnelStage` = { stage label, n: count at that stage, color: token }.
- `DonutDatum` = { g: group label, v: percent 0..100, color }.
- `TimelineItem` = { ic: icon, who, what, t: relative time without "ago", ai? }.
- `PendingItem` = { ic, title, meta, tone: "ok"|"warn"|"danger", ai? }.

---

## OrgOverview  (`<OrgOverview data={OrgOverviewData} />`)  -- admin / super-admin
Source: dash-admin.jsx AdminDash. Header is the glass CommandHero, fixed copy
"Org overview" / "Everything happening across your hiring operation, in real time."

| field | meaning / units |
|---|---|
| workspace | workspace name shown in the hero eyebrow (uppercased by the hero) |
| live | initial LIVE/PAUSED toggle state (bool) |
| heroStats[] | 4 hero tiles: { label, value:number, icon, spark?:number[], ai?, prefix?, suffix? }. Prototype: Active candidates, Open reqs, AI decisions (ai), Time to hire (suffix "d") |
| kpis[] | 8 KPI cards (KPI shape) |
| funnel[] | pipeline stages (FunnelStage); first stage is the 100% baseline |
| funnelConversionLabel | preformatted overall-conversion pill, e.g. "1.0% applied->hired" |
| diversity[] | donut segments (DonutDatum), percentages should sum to ~100 |
| diversityIndex | donut center string, e.g. "0.78" (four-fifths index) |
| trend[] | time-to-hire trend, numbers in DAYS, oldest->newest |
| trendLabels[] | one x-axis label per trend point (every other is rendered) |
| trendDeltaLabel | preformatted YoY pill, e.g. "-9 days YoY" |
| activity[] | org activity feed (TimelineItem); ai:true marks agent actions |
| pending[] | pending actions (PendingItem); tone sets the color |
| pendingCountLabel | header pill, e.g. "4 need attention" |
| agentBars[] | relative bar heights for the agent-activity sparkbars (unitless) |
| agents[] | agent tiles: { name: agent id e.g. "candidate-screener", stat: e.g. "1,284 scored" } |

Handlers: none required (Export report / Breakdown / EEOC report are presentational here).

---

## RecruiterHome  (`<RecruiterHome data={RecruiterHomeData} onBulkUpload? onSource? />`)
Source: dash-views.jsx RecruiterDash.

| field | meaning / units |
|---|---|
| title | greeting line, e.g. "Good morning, Avery" (app composes greeting + name) |
| sub | subline, e.g. "47 new applications and 9 candidates waiting to be scheduled." |
| kpis[] | KPI cards (count auto-fits columns) |
| applications[] | { n: name, role, src: source, score: 0..100, st: "pass"\|"review"\|"fail", t: relative time }. st drives the score-ring color + StatusBadge |
| myReqs[] | { title, dept, stagePct: number[4] stage widths as percentages [applied,screen,interview,offer], cand: total count } |
| scheduling[] | { n: name, role, round: e.g. "Technical", urgent?: bool } |

Handlers: onBulkUpload, onSource (the two header buttons).

---

## HiringManagerHome  (`<HiringManagerHome data={HiringManagerHomeData} onNewReq? onAnalytics? />`)
Source: dash-views.jsx HMDash.

| field | meaning / units |
|---|---|
| title / sub | greeting + summary, e.g. "4 decisions are waiting on you, 2 are time-sensitive." |
| kpis[] | KPI cards |
| decisions[] | { n: name, role, by: who advanced, rec: recommendation label e.g. "Advance", recAi?: from AI, tone: "ok"\|"warn", wait: e.g. "2d" } |
| reqs[] | { title, funnel: number[4] raw counts [applied,screen,interview,offer], risk: "on-track"\|"at-risk", target: label e.g. "On track" } |

Handlers: onNewReq, onAnalytics.

---

## InterviewerHome  (`<InterviewerHome data={InterviewerHomeData} onSchedule? />`)
Source: dash-views.jsx InterviewerDash (calm layout, max width 980).

| field | meaning / units |
|---|---|
| title / sub | greeting + summary, e.g. "You have 3 interviews today and 2 scorecards to write." |
| kpis[] | KPI cards |
| today[] | { time: e.g. "2:00 PM", dur: e.g. "45m", n: name, role, type, panel: panelist count (number), mode: "Video"\|"Phone"\|"Onsite", soon?: highlight + Join } |
| feedback[] | { n: name, role, type, overdue?: bool, when: due label when not overdue e.g. "Due today" } |
| allCaughtUpNote | optional footer note under the feedback list, e.g. "You're all caught up after these. Nice work." |

Handlers: onSchedule.

---

### Role dispatch (app-side, not a component)
The prototype's DashboardHome maps role -> view. Recreate in the app:
`recruiter -> RecruiterHome`, `hiring_manager -> HiringManagerHome`,
`interviewer -> InterviewerHome`, `admin` / `super_admin` -> `OrgOverview`,
`compliance_officer -> ComplianceHub` (ships in a later batch). Wrap the chosen
screen in a scroll container with padding "28px 30px 60px" to match the prototype.

### Imports (every screen)
`./aurora-kit` (kit), `./aurora-ui` (Btn, StatusBadge, EmptyHint), `./icon`, `./types`.
Colors via inline `var(--token)` only; Tailwind for layout utilities only.

---

# Data contract, batch C2 (screening, candidates, profile)

## Screening  (`<Screening data={ScreeningData} onExport? onDecide? onBulkAdvance? onBulkReview? />`)
Source: screen-screenq.jsx. Queue with a slide-over verdict panel. Result states
PASS / REVIEW / FAIL. AI is advisory; the human's click is the deciding action.

| field | meaning / units |
|---|---|
| rows[] | queue rows (ScreeningRow). Empty -> empty state |
| rows[].ini | candidate initials for the avatar |
| rows[].name / role | candidate name + role applied to |
| rows[].reqId | requisition id (mono), e.g. "REQ-2381" |
| rows[].score | AI match score 0..100 |
| rows[].kind | "pass" \| "review" \| "fail" (renders PASS/REVIEW/FAIL) |
| rows[].conf | model confidence 0..1; the bar marks the 0.70 auto-advance threshold |
| rows[].band | verdict band label, e.g. "Strong match", "Strong potential", "Below the bar" |
| rows[].status | "approved" \| "pending" (human decision state before any in-session action) |
| rows[].requirements? | optional per-row requirement breakdown; else uses data.requirements |
| rows[].trace? | optional per-row reasoning trace; else uses data.trace |
| requirements[] | default ReqBreakdown for the open verdict: { id, label, custom?, state: verdict, weight: %, sub: e.g. "9/10", note: AI evidence } |
| trace[] | default reasoning trace: { t: step text, tool: function name, status } rendered as tool() |

Handlers: onDecide(id, decision) where decision is "advance"\|"decline"\|"review";
onBulkAdvance(ids[]), onBulkReview(ids[]), onExport. Decisions are also reflected
optimistically in local state (the Status pill updates immediately).

## Candidates  (`<Candidates data={CandidatesData} onMove? onOpenProfile? onImport? onSource? />`)
Source: cand-screen.jsx (controller) + cand-board.jsx + cand-table.jsx. Board <-> table
switch, saved views, search/source filters, blind + density toggles, bulk bar.

| field | meaning / units |
|---|---|
| candidates[] | Candidate rows (empty -> empty columns / "Drop here") |
| candidates[].ini / name / role / loc | initials, name, role, location (loc shown only in non-dense table) |
| candidates[].reqId | requisition id (mono) |
| candidates[].stage | current pipeline stage id (must match a stages[].id) |
| candidates[].st | "pass"\|"review"\|"fail"\|"pending" ("pending" = not scored yet) |
| candidates[].score | AI match 0..100 (ignored when pending) |
| candidates[].match | requirement match string e.g. "4/5"; ", " when none (renders n of d bars) |
| candidates[].source | source label e.g. "Referral" |
| candidates[].days | time in current stage in DAYS; 0 renders "new"; >=3 warn, >=6 danger (aging) |
| candidates[].you | assigned to the current user (brand dot) |
| stages[] | board columns + table StageBadge: { id, label, color, ai? } in pipeline order |
| savedViews[] | filter chips: { id, label, icon, count, ai?, predicate?(c)=>bool }. The app supplies predicates; the screen filters client-side. First view is the default |
| sources[] | source filter options; sources[0] is the "All sources" default |

Handlers: onMove(id, stage) persist a kanban drag (the screen also moves it optimistically
and resets days to 0); onOpenProfile(id) -> /candidates/[id]; onImport -> /candidates/import;
onSource -> /sourcing. View switch, blind, density, saved view and search are internal state.

Sub-components shipped: `CandBoard` (draggable kanban) and `CandTable` (dense triage table);
both take the same Candidate[] + CandStage[] and can be used standalone.

## CandidateProfile  (`<CandidateProfile data={CandidateProfileData} stages idx total blind onNav? onBack? onToggleBlind? onVerdict? onAddNote? onSchedule? onAdvance? />`)
Source: cand-profile.jsx. Multi-zone profile, prev/next nav, blind / bias-reduced mode.

| field | meaning / units |
|---|---|
| candidate | the Candidate (reuses the Candidate shape: ini, name, role, loc, reqId, stage, source...) |
| applied | applied date label, e.g. "May 24, 2026" |
| email / phone | contact info, hidden when blind is on |
| verdict | AI screening zone: { score 0..100, band, summary, confidence 0..1, requirements: ReqBreakdown[] } |
| scorecards[] | interview feedback: { who, role, overall e.g. "4.2", rec label, recTone "ok"\|"warn", dims:[{d,s:0..5}], note }. Empty -> "No interview feedback yet." |
| parsed | parsed-resume-with-source: { fields:[{k,v,c:0..1}], skills:[{n,c:0..1}], honestyFlag? }. confidence < 0.70 raises a flag icon; blind hides name/email/phone/location field values |
| activity[] | TimelineItem[] activity feed |
| notes[] | existing notes newest-first: { who, ini, t, text }. The screen prepends a new note locally and calls onAddNote |
| nextSteps[] | AI-suggested next steps: { icon, title, detail } (advisory; "you decide what happens next") |

Props: stages (CandStage[] for the stage label), idx + total (prev/next position), blind (controlled).
Handlers: onNav(dir: -1\|1) wrap prev/next; onBack -> /candidates; onToggleBlind; onVerdict -> open
the full screening verdict (the Screening slide-over); onAddNote(text); onSchedule; onAdvance.

---

Batches A, B, C1, C2 complete. Remaining screens (Requisitions list/detail/intake, Decisions,
Offers, Interviews, HITL, Scheduling, plus compliance/analytics/fairness/copilot/settings/billing/
security/ai-ops/platform/import/rounds/form-builder) follow in the next batches, same format.

## Decisions  (`<Decisions data={DecisionsData} onDecision? />`)
Source: screen-decisions.jsx. Human-approval-gated; AI is advisory. Two-pane list + detail.

| field | meaning / units |
|---|---|
| decisions[] | Decision rows (empty -> empty state). |
| decisions[].ini/name/role/reqId | candidate identity + requisition id (mono) |
| decisions[].aiRec | "hire"\|"reject"\|"hold" (advisory recommendation only) |
| decisions[].aiConf | model confidence 0..1; below 0.70 renders warn-tinted |
| decisions[].screenScore | screening score 0..100 |
| decisions[].interviewAvg | interview average 0..5 (shown as "x.x / 5") |
| decisions[].status | "pending"\|"approved"\|"sent"\|"accepted"\|"declined" (drives the StatusFlow + gate) |
| decisions[].by | who recorded the current state (", " if none yet) |
| decisions[].when | relative time e.g. "2h" (rendered "2h ago") |
| decisions[].rationale | AI rationale text |
| decisions[].lowConf | true -> shows the anti-rubber-stamp warning on a low-confidence reject |

Handler: onDecision(id, status) where status is "approved"\|"declined"\|"sent". The screen
updates status optimistically (sets by to the current user). Pending items show the approval
gate; a low-confidence reject requires a second confirm before it is recorded.

## Scheduling  (`<Scheduling data={SchedulingData} onBook? />`)
Source: screen-scheduling.jsx. Week calendar (busy overlays) + AI-proposed slots rail.
The agent suggests slots ranked by fit; the human books.

| field | meaning / units |
|---|---|
| round / candidate | interview round name + candidate name |
| dur | duration in MINUTES |
| weekLabel | header range, e.g. "May 29 to Jun 2" |
| week[] | 5 day-column headers, e.g. "Mon 29" |
| hours[] | row labels (hour numbers); rendered with a/p suffix by row index |
| busy | map who -> [day, startRowIdx, endRowIdx][] for the hatched busy overlays |
| slots[] | AI-proposed slots, best first: { day, time, score 0..1 fit, all: everyone free, note, selected? } |
| participants[] | { who, ini, role }; role "Candidate" gets the brand-gradient avatar |

Handler: onBook(slotIndex). First slot is labeled "Best"; the screen shows a confidence note
(>= 0.80 + all available is safe; otherwise it defers to the human) and a booked confirmation.

## Offers  (`<Offers data={OffersData} onStatus? onCreate? />`)
Source: screen-offers.jsx. List + offer-letter composer (AI-drafted, human-approved).

| field | meaning / units |
|---|---|
| offers[] | list rows: { id, ini, name, role, reqId, base: USD, status, expires label }. Empty -> empty state |
| detail | the composer's offer (opened from a row): see below |
| detail.name/role/level/reqId | candidate + requisition identity |
| detail.companyName/team/start/expiresInDays | letter fields |
| detail.ai | { bandPosition e.g. "60th percentile", confidence 0..1 } |
| detail.comp | { base, signing, annualBonus (fraction e.g. 0.15), equity text, total } all USD |
| detail.band | { min, mid, max, market.p50 } USD for the band-positioning bar |
| detail.justification | editable AI justification text |
| detail.approvalChain[] | { role, who, status: "done"\|"current"\|"pending" } |

Handlers: onStatus(id, status) where status walks draft -> pending -> approved -> sent
(the composer advances status optimistically; a human approves before send); onCreate.
Statuses: draft / pending / approved / sent / accepted / declined.

## Interviews  (`<Interviews data={InterviewsData} onSchedule? />`)
Source: screen-interviews.jsx. List + detail (panelist feedback + AI interview-intelligence).

| field | meaning / units |
|---|---|
| interviews[] | rows: { id, ini, name, role, reqId, round, type (key), when, dur MIN, mode, panel: names[], status (key) } |
| types | map type key -> { label, tone } (e.g. technical/behavioral) |
| statusMeta | map status key -> { label, tone, bg, icon }; status is scheduled\|awaiting\|completed |
| detail | shown when a row opens: identity + when/dur/mode/round |
| detail.ai | interview-intelligence: { rec, confidence 0..1, summary, signals:[{skill, rating strong/adequate/weak, quote, note?}], keyMoments:[{t timestamp, d}] } -- "a summary, not a decision" |
| detail.panelists[] | { who, role, status submitted/pending, overall, rec STRONG_YES..STRONG_NO, dims:[{d,s:0..5}], note } |
| detail.suggestedQuestions[] | from interview-kit, tailored to the gaps |

Handler: onSchedule. List has status filters; opening a row shows the detail (back returns).

## HITL  (`<HITL data={HitlData} onResolve? />`)
Source: screen-hitl.jsx. Two-pane review queue + evidence pack + resolution, with the
anti-rubber-stamp gate (an AI-driven decline requires reviewing evidence + a reason + a confirm).

| field | meaning / units |
|---|---|
| items[] | queue: { id, priority High/Normal, sla label, slaTone ok/warn/danger, kind, who, role, agent, conf 0..1, risk headline, why agent-output text } |
| reasonCodes[] | structured reason-code chips (logged to the audit trail) |
| trace[] | reasoning trace: { t, tool, status, d? } rendered as tool() |

Handler: onResolve(id, verb, reasonCode) where verb is Approved / Edited & approved / Rejected /
Escalated (or "Approved (reviewed)" after the confirm). For kinds matching reject/escalation the
Approve action is gated until evidence is opened and a reason is set, then requires a confirm.

## Requisitions (list)  (`<Requisitions data={ReqListData} onCreate? onOpen? onExport? />`)
Source: req-list.jsx. DataTable + filter bar (search, status, department, density).

| field | meaning / units |
|---|---|
| rows[] | { id, title, dept, loc, status, pri High/Normal, min/max salary USD (absent -> ", not set"), cands count, head openings, rec recruiter, recI initials, created label } |
| statusMeta | map ReqStatusKey -> { label, tone, bg, icon } for the status chip |
| workspaceName | shown in the subtitle count line |

Handlers: onOpen(id) -> /requisitions/[id]; onCreate -> intake; onExport. Status keys:
OPEN / DRAFT / ON_HOLD / FILLED / CLOSED / CANCELLED. Detail + intake/form-builder ship next.

## RequisitionDetail  (`<RequisitionDetail data={ReqDetailData} statusMeta roundsSlot formSlot onBack? onCandidates? onEdit? onPost? />`)
Source: req-detail.jsx. Header + status + tabs (overview / pipeline / rounds / form / activity).

| field | meaning / units |
|---|---|
| id/title/dept/loc/status | identity + status (statusMeta is the chip meta for that key) |
| min/max | salary band USD; level/family; filled/head headcount; target/posted labels |
| jd | { description, inclusivity score, required[], niceToHave[] } from jd-author |
| customFields[] | { id, label, value, importanceLabel/Tone/Bg } admin criteria fed to the screener |
| owners[] | { role, name, ini } |
| pipeline[] | { stage, n, color } funnel cards (first is the 100% baseline) |
| pipelineSummary | one-line summary under the Pipeline tab header |
| pipelineCards[] | { label, n, icon, color, sub } the 3 stage summary cards |
| activity[] | TimelineItem[] activity feed |

Props: statusMeta (ReqStatusMeta for the status chip), roundsSlot + formSlot (the app passes the
RoundsConfig and FormBuilder components for those tabs). Handlers: onBack, onCandidates, onEdit, onPost.

## IntakeScreen  (`<IntakeScreen data={IntakeData} orgName? onBack? onPost? onSaveDraft? />`)
Source: req-intake.jsx (the signature flow). Two-pane: form (left) + live preview (right).
Two paths: AI-generate the JD via jd-author, or paste your own with a skills input.
AI output is advisory; the recruiter edits everything before posting.

| field | meaning / units |
|---|---|
| data.importance | Record<key,{label}> options for a custom field's importance select (IMPORTANCE) |
| data.seedCustomFields[] | { id, label, value, importance } starter custom-criteria rows |
| data.jdGen | what jd-author "produces": { description, required[], niceToHave[], inclusivity 0..100, biasFlags[], trace[] } |
| data.jdGen.biasFlags[] | { id, type, severity low/medium/high, text (flagged phrase), suggestion, where?, applied? } one-click fix |
| data.jdGen.trace[] | { t (step), d (detail), status } streamed while generating |
| data.initial | { title, dept, level, location, min, max } prefilled basics (min/max USD/yr) |
| orgName | shown in the candidate preview header (default "Northwind Talent") |

Behavior preserved: type a title -> Generate -> trace streams -> JD + inclusivity + bias flags appear;
Apply fix marks a flag fixed and nudges inclusivity +2; custom fields each become a weighted screener
row in the Screener preview; a pay-transparency nudge shows when min/max is empty. Handlers: onPost(state),
onSaveDraft(state), onBack. The full editor state (IntakeState) is internal and passed to onPost/onSaveDraft.

## RoundsConfig  (`<RoundsConfig data={RoundsData} jobTitle? onGenerateKits? />`)
Source: req-builder.jsx. Reorderable interview rounds; fills the RequisitionDetail "rounds" tab.

| field | meaning / units |
|---|---|
| rounds[] | { id, name, type, dur (min), panel, auto (auto-advance on pass), instr } in order |
| roundTypes | Record<type,{label,tone}> chip meta (ROUND_TYPES) |

Behavior: up/down reorder, per-round auto-advance toggle, add/remove, and an interview-kit AI nudge
(onGenerateKits). All edits are local state.

## FormBuilder  (`<FormBuilder data={FormBuilderData} jobTitle? orgLine? onPublish? />`)
Source: req-builder.jsx. 3-pane builder; fills the RequisitionDetail "form" tab.

| field | meaning / units |
|---|---|
| fields[] | { id, type (text/textarea/select/checkbox/file/email), label, required?, locked? } |
| palette[] | { type, label, icon } field types to add (FIELD_PALETTE) |
| jobTitle / orgLine | shown in the candidate preview header |

Behavior: click a palette item to add; reorder; inline-rename label; toggle Required; remove (locked
default fields cannot be removed); right pane is a live candidate-facing preview. onPublish(fields).

## FairnessScreen  (`<FairnessScreen data={FairnessData} onMethodology? onPublish? />`)
Source: screen-fairness.jsx. Adverse-impact analysis vs the four-fifths (0.80) rule,
computed by bias-auditor, date-stamped, with an intersectional heatmap and EEOC export.

| field | meaning / units |
|---|---|
| stage | pipeline stage analyzed |
| range | date range stamp shown in the subhead |
| totals[] | banner stats as [label, value] pairs, e.g. ["Applicants","4,036"] |
| attributes[] | protected attributes: { name, ratio (impact ratio), pass (ratio>=0.80), groups[], finding } |
| attributes[].groups[] | { g label, rate 0..1, sel/app counts, ref? (reference group) } |
| heatmap | { subtitle, cols[], rows: [label, rates0..1[]][], okThreshold } intersectional grid; cell red below okThreshold |

Handlers: onMethodology, onPublish (publish/export the audit summary). The 0.80 threshold and the
"AI computes, a human reviews" framing are fixed copy, not configurable.

## CopilotScreen  (`<CopilotScreen data={CopilotData} onAsk? />`)
Source: screen-copilot.jsx. Grounded AI assistant: streams reasoning, then an answer with cited
result cards, source chips, a confidence pill, suggested actions, and follow-ups. A "Try asking" rail.

| field | meaning / units |
|---|---|
| thread.text | the seed user question (COPILOT_THREAD[0].text) |
| answer.reasoning[] | thinking steps streamed before the answer |
| answer.confidence | 0..1 confidence pill |
| answer.text | answer body; **bold** markdown is rendered |
| answer.items[] | cited result cards { n, meta (contains a number used for the score ring), src } |
| answer.sources[] | source document chips |
| answer.actions[] | suggested action labels (outline-AI buttons) |
| answer.followups[] | follow-up question chips |
| suggestions[] | the right-rail "Try asking" prompts (COPILOT_SUGGESTIONS) |

Behavior: on mount (and "New thread") it replays thinking -> answer. onAsk(q) fires from the composer
(Enter / Ask), follow-up chips, and rail prompts. Grounding/privacy copy is fixed.

## AnalyticsScreen  (`<AnalyticsScreen data={AnalyticsData} onExport? />`)
Source: screen-analytics.jsx. KPIs + AI insights + funnel + diversity + time-to-hire + sources.

| field | meaning / units |
|---|---|
| orgName / range | header org name + date-range label |
| kpis[] | KPI[] for KPICard (id, label, value, delta, spark, etc.) |
| insights[] | { sev critical/warning/info, finding, evidence, rec } AI insights (3-up) |
| funnel[] | FunnelStage[]; funnelConversion = headRight pill text |
| diversity[] | DonutDatum[] hires diversity |
| tthTrend[] / tthLabels[] | time-to-hire trend series + x labels; tthDelta = headRight pill |
| tthByDept[] | { dept, days } bars (>28 days renders warn) |
| sources[] | { src, color, hires, quality, apps, cost (USD/hire) } source-effectiveness table |

Handler: onExport. All charts are kit components (Funnel, Donut, TrendArea, KPICard).

## BillingScreen  (`<BillingScreen data={BillingData} onUpgrade? onChangePlan? onUpdateCard? />`)
Source: screen-billing.jsx. Plan card + usage meters + payment method + invoices + upgrade modal.

| field | meaning / units |
|---|---|
| plan / price / cycle / renews | current plan, price USD, cycle, renewal date label |
| usage[] | { k label, used, limit (number, or string for unlimited) }; meter turns warn at >=80% |
| card | { last4, exp } payment method |
| invoices[] | { id, date, amount USD, status } |
| tiers[] | upgrade-modal plans { n, price (null = Custom), feats[], cur? (current) } |

Behavior: Upgrade/Change-plan open the modal (also fire onUpgrade/onChangePlan); onUpdateCard.
ENTERPRISE tier uses the AI-violet treatment + "Contact sales".

## SettingsScreen  (`<SettingsScreen data={SettingsData} initial? />`)
Source: screen-settings.jsx. Two-panel: a grouped nav rail + the active panel. `initial` selects the
opening panel (default "team"). Panels: account, team (+ permission matrix), security, sso, branding
(live preview), email, integrations, apikeys, features, retention.

| field | meaning / units |
|---|---|
| account | { ini, name, email, title } |
| team[] | { ini, name, email, role, status active/invited, last } |
| roleNames[] | permission-matrix role columns (ROLE_NAMES) |
| permissions[] | { area, caps[] } where caps is one value per role: true / "view" / false |
| ssoProviders[] | { n, detail, icon, st } (st "connected" shows the badge) |
| emailTemplates[] | { n, edited, on } |
| integrations[] | { n, cat, icon, st } |
| apiKeys[] | { name, scopes, prefix, created, last } |
| featureFlags[] | { f, plan, on?, locked? } (locked shows Upgrade instead of a toggle) |
| retention[] | { d, note, period } |

Note: Account / Security / Branding panels keep static demo copy (faithful to the prototype);
their toggles/inputs are local. List panels are entirely prop-driven.

## SecurityScreen  (`<SecurityScreen data={SecurityData} onReport? />`)
Source: screen-secai.jsx. Security score banner + posture tiles + risk alerts + hardening checklist.

| field | meaning / units |
|---|---|
| orgName / score | header org + 0..100 security score (ring) |
| posture[] | { k, v, unit } stat tiles (v>=90 renders green) |
| alerts[] | { t, detail, sev, icon } open risk items (sev "Medium" highlights) |
| checklist[] | { c, done } hardening items |

## AiOpsScreen  (`<AiOpsScreen data={AiOpsData} onManagePrompts? onInvestigate? />`)
Source: screen-secai.jsx. Agent-fleet monitoring (health, accuracy, drift, cost, latency).

| field | meaning / units |
|---|---|
| agentCount | header pill count |
| kpis[] | KPI[] for KPICard |
| agents[] | { n, status (healthy/...), acc 0..1, drift stable/watch, cost USD/mo, lat seconds } |

All machine surfaces are violet-accented (the agent fleet, the drift-watch note). Drift "watch" rows
use the warn tone. AI is monitored here, never granted autonomy.

## Platform console (super-admin, operator-dense) , screen-platform.jsx
A denser "operator console" feel, same system. Five exported screens:

### TenantsScreen  (`data={TenantsData} onImpersonate? onExport?`)
Cross-tenant list: { summary, kpis[], tenants[] }. Tenant = { id, name, slug, created, plan,
users, mrr USD, cost USD, runs, health healthy/watch/over }. Impersonate fires onImpersonate(name)
and shows a transient "impersonation started + persistent safety banner" note. Table scrolls in its box.

### PlatformAgentsScreen  (`data={PlatformAgentsData}`)
Agent kill-switches across tenants. agents[] = { n, tenants, runs, cost USD/mo, err %, status
deployed/degraded/paused }. Pause/Resume toggles status locally; a red kill-switch warning is fixed copy.

### PromptsScreen  (`data={PromptsData}`)
Versioned prompt editor. { agents[], current {agent, tenants, text}, versions[] }; version =
{ v, note, date, author, live? }. Selecting a version sets the rail; deploy/rollback are actions.
A fixed note warns deploy pushes to all tenants and is audit-logged; never expose secrets.

### PlanRequestsScreen  (`data={PlanRequestsData}`)
requests[] = { id, tenant, from, to, mrr, reason, by, when }. Approve/Deny set a local resolved pill.

### PlatformAuditScreen  (`data={PlatformAuditData} onExport?`)
entries[] = { who, act, kind impersonation/deploy/killswitch/billing/alert, ai?, t }. Timeline with
per-kind colored nodes; AI-attributed actions get the violet AI pill.

## AI surfaces , screen-aix.jsx

### PlatformCostScreen  (`data={PlatformCostData}`)
{ period, kpis[], agents[{n,cost}], tenants[{id,name,cost,health}], overBudgetNote? }. Spend-by-agent
(violet bars) + top tenant spenders (red bar when health "over"); over-budget note in red.

### NotificationsScreen  (`data={NotifPrefsData}`)  , notification preferences
prefs[] = { cat, desc, ai?, email, sms, inapp }. Per-channel toggles (local state) + a digest select.
AI-driven categories get the violet AI pill.

### MobilityScreen  (`data={MobilityData}`)  , internal-mobility engine
matches[] = { ini, name, cur, tenure, skills[], match 0..100, to, reqId, ai? }. Each match shows an
AI match ring; "Add to req" sets a local added pill. Fixed advisory note: a human reviews each transfer.

### PlatformJobsScreen  (`data={PlatformJobsData}`)  , platform jobs manager
jobs[] = { title, reqId, posted, board, status published/draft, apps?, views? }. Publish/Unpublish
per row; table scrolls in its own container.

---
Coverage: this completes the role-dispatched dashboards, AI-trust surfaces (screening, verdict, HITL,
copilot, fairness), requisitions (incl. intake + builder), candidates/profile, decisions, interviews,
offers, scheduling, analytics, settings, billing, security, ai-ops, the super-admin platform console,
and these AI surfaces. Every screen: props-only, kit imports, inline tokens, no em/en dashes.

---

Batches done: A, B, C1, C2, C3 (Decisions, Scheduling, Offers, Interviews, HITL). Remaining in C3:
Requisitions (list / detail / intake). Then the final batch: compliance, analytics, fairness,
copilot, settings, billing, security, ai-ops, platform, import, rounds, form-builder.

---

Batches done: A, B, C1, C2, C3 (Decisions, Scheduling, Offers, Interviews). Remaining in C3:
HITL, Requisitions (list / detail / intake). Then the later batch: compliance, analytics,
fairness, copilot, settings, billing, security, ai-ops, platform, import, rounds, form-builder.
