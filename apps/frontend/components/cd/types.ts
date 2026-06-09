// components/types.ts
// Exact prop/data shapes for the Aurora kit (components/aurora-kit.tsx) and screens.
// Screen-level types will be appended here as each screen ships. These are the
// shapes the app passes DOWN as props; no component fetches its own data.
import type { IconName } from "./icon";

/* ----- KPI (KPICard / KpiRow) ----- */
export interface KPI {
  id?: string;
  label: string;          // e.g. "Time to hire"
  value: number;          // raw number; CountUp animates to it
  icon: IconName;
  spark: number[];        // sparkline series, oldest -> newest
  delta: number;          // change vs last period (already computed)
  good?: boolean;         // is the delta direction good? drives green/red
  ai?: boolean;           // machine-generated metric -> violet accent + AI pill
  prefix?: string;        // e.g. "$"
  suffix?: string;        // e.g. "%", "d"
}

/* ----- CommandHero stat tile ----- */
export interface HeroStat {
  label: string;
  value: number;
  icon: IconName;
  spark?: number[];
  ai?: boolean;
  prefix?: string;
  suffix?: string;
}

/* ----- Funnel ----- */
export interface FunnelStage {
  stage: string;          // stage label, e.g. "Applied"
  n: number;              // count at this stage
  color: string;          // CSS color / token for the bar
}

/* ----- Donut (diversity) ----- */
export interface DonutDatum {
  g: string;              // group label
  v: number;              // percent 0..100
  color: string;
}

/* ----- Timeline (activity) ----- */
export interface TimelineItem {
  ic: IconName;
  who: string;            // actor (person or agent name)
  what: string;           // action text
  t: string;              // relative time, e.g. "3m" (rendered as "3m ago")
  ai?: boolean;           // machine action -> AI pill
}

/* ----- PendingList (pending actions) ----- */
export interface PendingItem {
  ic: IconName;
  title: string;
  meta: string;
  tone: "ok" | "warn" | "danger";
  ai?: boolean;
}

/* ----- Shared status vocab used across screens ----- */
export type ScreeningResult = "PASS" | "REVIEW" | "FAIL";
export type StatusKind = "pass" | "review" | "fail" | "open" | "draft";

/* ===================== Shell (components/Shell.tsx) ===================== */
export interface ShellUser {
  name: string;
  email: string;
  initials: string;       // e.g. "AC"
  role: string;           // active role id, must be a key in the roles map
}

export interface RoleMeta {
  label: string;          // e.g. "Recruiter"
  short: string;          // chip label, e.g. "Recruiter"
}

export interface Workspace {
  id: string;
  name: string;
  initials: string;       // monogram, e.g. "NT"
  color: string;          // brand color for the monogram tile
  plan: string;           // FREE | STARTER | PROFESSIONAL | ENTERPRISE
  planTone: string;       // text color token for the plan badge
  planBg: string;         // background token for the plan badge
  role: string;           // the signed-in user's role in THIS workspace
  invites?: number;       // pending invites badge in the switcher
}

export interface NavItem {
  id: string;             // route id (used for active state + onNavigate)
  label: string;
  icon: IconName;
  roles?: string[];       // role ids that may see this item; omit = all roles
  count?: number;         // optional count pill
  ai?: boolean;           // shows the violet AI dot on the icon
}

export interface NavSection {
  section?: string;       // section heading; omit for the top (ungrouped) block
  platform?: boolean;     // platform/operator section -> danger-tinted heading + bolt
  items: NavItem[];
}

export interface PlanUsage {
  label: string;          // e.g. "Resumes this month"
  used: number;
  limit: number;
}

export interface Notif {
  id: string;
  icon: IconName;
  title: string;
  body: string;
  action: string;         // call-to-action label
  time: string;           // relative, e.g. "3m" (rendered as "3m ago")
  ai?: boolean;
  unread?: boolean;
}
export interface NotifGroup { group: string; items: Notif[]; }

export interface CommandItem {
  id: string;
  label: string;
  icon: IconName;
  meta?: string;          // secondary line
  nav?: string;           // route id to navigate to on select
  ai?: boolean;           // violet AI action
  kbd?: string;           // optional shortcut hint
}
export interface CommandGroup { group: string; items: CommandItem[]; }

/* ===================== Dashboards (batch C1) ===================== */
/* Shared sub-shapes */
export interface AgentStat { name: string; stat: string; } // agent name + activity line

/* --- OrgOverview (admin dashboard) --- */
export interface OrgOverviewData {
  workspace?: string;            // workspace name shown in the hero eyebrow
  live?: boolean;                // initial LIVE/PAUSED state of the hero badge
  heroStats: HeroStat[];         // 4 hero stat tiles (label/value/icon/spark)
  kpis: KPI[];                   // 8 KPI cards
  funnel: FunnelStage[];         // pipeline funnel stages (stage label, n count, color)
  funnelConversionLabel?: string;// e.g. "1.0% applied->hired" (already formatted)
  diversity: DonutDatum[];       // diversity donut segments (group, percent, color)
  diversityIndex?: string;       // donut center value, e.g. "0.78"
  trend: number[];               // time-to-hire trend series, in DAYS
  trendLabels: string[];         // x-axis labels for the trend (one per point)
  trendDeltaLabel?: string;      // e.g. "-9 days YoY" (already formatted)
  activity: TimelineItem[];      // org activity feed
  pending: PendingItem[];        // pending actions list
  pendingCountLabel?: string;    // e.g. "4 need attention"
  agentBars: number[];           // bar heights for the agent-activity sparkbars (relative)
  agents: AgentStat[];           // agent summary tiles (name + stat, e.g. "1,284 scored")
}

/* --- RecruiterHome --- */
export interface RecruiterApplication {
  n: string;                     // candidate name
  role: string;                  // role applied to
  src: string;                   // source, e.g. "Referral"
  score: number;                 // AI match score 0..100
  st: "pass" | "review" | "fail";// advisory verdict, drives ring color + badge
  t: string;                     // relative time, e.g. "2m"
}
export interface RecruiterReq {
  title: string; dept: string;
  stagePct: number[];            // 4 stage widths as percentages [applied,screen,interview,offer]
  cand: number;                  // total candidate count
}
export interface RecruiterSchedule { n: string; role: string; round: string; urgent?: boolean; }
export interface RecruiterHomeData {
  title: string;                 // greeting line, e.g. "Good morning, Avery"
  sub: string;                   // subline summary
  kpis: KPI[];
  applications: RecruiterApplication[];
  myReqs: RecruiterReq[];
  scheduling: RecruiterSchedule[];
}

/* --- HiringManagerHome --- */
export interface HMDecision {
  n: string;                     // candidate name
  role: string; by: string;      // role + who advanced them
  rec: string;                   // recommendation label, e.g. "Advance"
  recAi?: boolean;               // recommendation came from AI
  tone: "ok" | "warn";           // drives the icon/badge color
  wait: string;                  // how long it has been waiting, e.g. "2d"
}
export interface HMReq {
  title: string;
  funnel: number[];              // 4 raw counts [applied, screen, interview, offer]
  risk: "on-track" | "at-risk";
  target: string;                // target label, e.g. "On track" / "12d over"
}
export interface HiringManagerHomeData {
  title: string; sub: string; kpis: KPI[];
  decisions: HMDecision[];
  reqs: HMReq[];
}

/* --- InterviewerHome --- */
export interface InterviewerToday {
  time: string;                  // start time, e.g. "2:00 PM"
  dur: string;                   // duration label, e.g. "45m"
  n: string;                     // candidate name
  role: string; type: string;    // role + interview type
  panel: number;                 // panelist count
  mode: "Video" | "Phone" | "Onsite";
  soon?: boolean;                // highlight + Join button if starting soon
}
export interface InterviewerFeedback {
  n: string; role: string; type: string;
  overdue?: boolean;
  when: string;                  // due label when not overdue, e.g. "Due today"
}
export interface InterviewerHomeData {
  title: string; sub: string; kpis: KPI[];
  today: InterviewerToday[];
  feedback: InterviewerFeedback[];
  allCaughtUpNote?: string;      // footer note shown under the feedback list
}

/* ===================== Screening (batch C2) ===================== */
export type VerdictKind = "pass" | "review" | "fail"; // maps to PASS / REVIEW / FAIL
export interface ReqBreakdown {
  id: string;
  label: string;                 // requirement name
  custom?: boolean;              // a custom admin-defined criterion (violet tag)
  state: VerdictKind;            // per-requirement verdict, drives icon + color
  weight: number;                // weight percent toward the score (0..100)
  sub: string;                   // sub-score label, e.g. "9/10"
  note: string;                  // AI evidence note, shown italic under the row
}
export interface TraceStep {
  t: string;                     // step description
  tool: string;                  // tool/function the agent called (rendered as tool())
  status: "pass" | "review" | "fail";
}
export interface ScreeningRow {
  id: string;
  ini: string;                   // candidate initials for the avatar
  name: string;
  role: string;
  reqId: string;                 // requisition id, shown mono
  score: number;                 // AI match score 0..100
  kind: VerdictKind;             // PASS / REVIEW / FAIL
  conf: number;                  // model confidence 0..1 (0.70 is the threshold)
  band: string;                  // verdict band label, e.g. "Strong match"
  status: "approved" | "pending";// human decision state before any in-session decision
  reasoning?: string;            // plain-English "why this verdict" summary from the screener
  requirements?: ReqBreakdown[]; // optional per-row breakdown; falls back to data.requirements
  trace?: TraceStep[];           // optional per-row trace; falls back to data.trace
}
export interface ScreeningData {
  rows: ScreeningRow[];          // queue rows
  requirements: ReqBreakdown[];  // default requirement breakdown for the open verdict
  trace: TraceStep[];            // default reasoning trace for the open verdict
}

/* ----- Candidates (board + table) ----- */
export interface Candidate {
  id: string;
  ini: string;                   // initials for the avatar
  name: string;
  role: string;
  loc?: string;                  // location (shown in the non-dense table row)
  reqId: string;                 // requisition id (mono)
  stage: string;                 // current pipeline stage id (matches a CandStage.id)
  st: "pass" | "review" | "fail" | "pending"; // AI verdict state ("pending" = not scored)
  score: number;                 // AI match score 0..100 (ignored when st === "pending")
  match: string;                 // requirement match, e.g. "4/5" or ", " when none
  source: string;                // source label, e.g. "Referral"
  days: number;                  // time in current stage, in DAYS (0 renders as "new")
  you?: boolean;                 // assigned to the current user (brand dot)
}
export interface CandStage {
  id: string;                    // stage id used by board columns + the table StageBadge
  label: string;
  color: string;                 // dot color token
  ai?: boolean;                  // stage produced/assisted by AI (sparkle on the column)
}
export interface SavedView {
  id: string;
  label: string;
  icon: IconName;
  count: number;                 // precomputed count shown on the chip
  ai?: boolean;                  // AI-flavored view (violet icon when inactive)
  predicate?: (c: Candidate) => boolean; // client-side filter; omit = show all
}

/* ----- CandidateProfile (/candidates/[id]) ----- */
export interface ProfileScorecard {
  who: string;                   // interviewer name
  role: string;                  // their role / round
  overall: string;              // overall rating, e.g. "4.2"
  rec: string;                   // recommendation label, e.g. "Lean hire"
  recTone: "ok" | "warn";       // drives the badge color
  dims: { d: string; s: number }[]; // dimension scores (s is 0..5, rendered as 5 dots)
  note: string;                  // free-text feedback (shown italic in quotes)
}
export interface ProfileVerdict {
  score: number;                 // AI match 0..100
  band: string;                  // verdict band label, e.g. "Strong potential"
  summary: string;               // one-line advisory summary
  confidence: number;            // 0..1 (0.70 threshold)
  requirements: ReqBreakdown[];  // per-requirement breakdown
}
export interface ParsedResume {
  fields: { k: string; v: string; c: number }[]; // parsed field: key, value, confidence 0..1 (<0.7 flags)
  skills: { n: string; c: number }[];            // skill name + confidence 0..1 (<0.7 flags)
  honestyFlag?: string;          // optional honesty-flag sentence (warn-tinted box)
}
export interface ProfileNote { who: string; ini: string; t: string; text: string; }
export interface ProfileNextStep { icon: IconName; title: string; detail: string; }
export interface CandidateProfileData {
  candidate: Candidate;          // the candidate (reuses the Candidate shape)
  applied: string;               // applied date label, e.g. "May 24, 2026"
  email: string;                 // contact email (hidden in blind mode)
  phone: string;                 // contact phone (hidden in blind mode)
  verdict: ProfileVerdict;       // AI screening verdict zone
  scorecards: ProfileScorecard[];// interview scorecards (empty -> "No interview feedback yet.")
  parsed: ParsedResume;          // parsed-resume-with-source zone
  activity: TimelineItem[];      // activity timeline
  notes: ProfileNote[];          // existing notes (newest first); the screen prepends new ones
  nextSteps: ProfileNextStep[];  // AI-suggested next steps (advisory)
}

/* ===================== Decisions (batch C3) ===================== */
export type AiRec = "hire" | "reject" | "hold";
export type DecStatus = "pending" | "approved" | "sent" | "accepted" | "declined";
export interface Decision {
  id: string;
  ini: string; name: string; role: string; reqId: string;
  aiRec: AiRec;                  // AI recommendation (advisory only)
  aiConf: number;               // model confidence 0..1 (<0.70 = low, warn-tinted)
  screenScore: number;          // screening score 0..100
  interviewAvg: number;         // interview average 0..5
  status: DecStatus;            // human-decision state in the approval flow
  by: string;                   // who recorded the current state (", " when none yet)
  when: string;                 // relative time, e.g. "2h" (rendered "2h ago")
  rationale: string;            // AI rationale text
  lowConf?: boolean;            // flags the anti-rubber-stamp warning on low-confidence rejects
}
export interface DecisionsData { decisions: Decision[]; }

/* ----- Scheduling ----- */
export interface SchedSlot {
  day: string;                  // e.g. "Tue Jun 3"
  time: string;                 // e.g. "2:00 PM"
  score: number;                // fit score 0..1 (>=0.8 ok, >=0.6 warn, else danger)
  all: boolean;                 // all participants available
  note: string;                 // short availability note
  selected?: boolean;           // initially-picked slot
}
export interface SchedParticipant { who: string; ini: string; role: string; } // role "Candidate" highlights the avatar
export interface SchedulingData {
  round: string;                // interview round name
  candidate: string;            // candidate name
  dur: number;                  // duration in MINUTES
  weekLabel: string;            // e.g. "May 29 to Jun 2"
  week: string[];               // 5 day-column headers, e.g. ["Mon 29", ...]
  hours: string[];             // row labels (9..) rendered with a/p suffix by index
  busy: Record<string, [string, number, number][]>; // who -> [day, startRowIdx, endRowIdx][]
  slots: SchedSlot[];           // AI-proposed slots, best first
  participants: SchedParticipant[];
}

/* ----- Offers ----- */
export type OfferStatusKey = "draft" | "pending" | "approved" | "sent" | "accepted" | "declined";
export interface OfferRow {
  id: string; ini: string; name: string; role: string; reqId: string;
  base: number;                 // base salary (USD)
  status: OfferStatusKey;
  expires: string;              // expiry label, e.g. "in 5d"
}
export interface OfferComp {
  base: number; signing: number; annualBonus: number; // annualBonus as a fraction, e.g. 0.15
  equity: string; total: number;                       // equity text + year-one total (USD)
}
export interface OfferBand {
  min: number; mid: number; max: number;               // salary band bounds (USD)
  market: { p50: number };                             // market p50 marker (USD)
}
export interface OfferDetail {
  name: string; role: string; level: string; reqId: string;
  companyName: string; team: string; start: string; expiresInDays: number;
  ai: { bandPosition: string; confidence: number };    // e.g. "60th percentile" + 0..1 confidence
  comp: OfferComp; band: OfferBand;
  justification: string;                               // editable AI justification text
  approvalChain: { role: string; who: string; status: "done" | "current" | "pending" }[];
}
export interface OffersData { offers: OfferRow[]; detail?: OfferDetail; }

/* ----- Interviews ----- */
export type IVStatusKey = "scheduled" | "awaiting" | "completed";
export interface IVTypeMeta { label: string; tone: string; }       // interview type -> label + tone
export interface IVStatusMeta { label: string; tone: string; bg: string; icon: IconName }
export interface InterviewRow {
  id: string; ini: string; name: string; role: string; reqId: string;
  round: string; type: string;            // type is a key into InterviewsData.types
  when: string; dur: number; mode: string;// when label, duration MIN, mode e.g. "Video"
  panel: string[];                        // panelist names (avatars show first 3)
  status: IVStatusKey;                    // key into InterviewsData.statusMeta
}
export type IVRec = "STRONG_YES" | "YES" | "NEUTRAL" | "NO" | "STRONG_NO";
// Discriminated union on status so the "submitted" branch narrows under strict TS.
export type IVPanelist =
  | { who: string; role: string; status: "pending" }
  | {
      who: string; role: string; status: "submitted";
      overall: string;                    // overall score, e.g. "4.2"
      rec: IVRec;
      dims: { d: string; s: number }[];   // dimension scores 0..5
      note: string;
    };
export interface InterviewDetail {
  ini: string; name: string; role: string; reqId: string; round: string; type: string;
  when: string; dur: number; mode: string;
  ai: {                                   // AI interview-intelligence (summary, not a decision)
    rec: string; confidence: number; summary: string;
    signals: { skill: string; rating: "strong" | "adequate" | "weak"; quote: string; note?: string }[];
    keyMoments: { t: string; d: string }[]; // timestamp + description
  };
  panelists: IVPanelist[];
  suggestedQuestions: string[];           // from interview-kit, tailored to the gaps
}
export interface InterviewsData {
  interviews: InterviewRow[];
  types: Record<string, IVTypeMeta>;      // type key -> { label, tone }
  statusMeta: Record<string, IVStatusMeta>; // status key -> badge meta
  detail?: InterviewDetail;               // detail shown when a row is opened
}

/* ----- HITL (human-in-the-loop review) ----- */
export interface HitlItem {
  id: string;
  priority: "High" | "Normal";
  sla: string;                  // SLA label, e.g. "2h left"
  slaTone: "ok" | "warn" | "danger";
  kind: string;                 // checkpoint kind, e.g. "AI-driven reject" ("reject"/"escalation" gates the confirm)
  who: string; role: string;
  agent: string;                // the agent that produced the output
  conf: number;                 // model confidence 0..1 (<0.70 warn)
  risk: string;                 // risk banner headline
  why: string;                  // agent output text (left evidence cell)
}
export interface HitlData {
  items: HitlItem[];
  reasonCodes: string[];        // structured reason-code chips
  trace: (TraceStep & { d?: string })[]; // reasoning trace (d = optional detail line)
}

/* ----- Requisitions list ----- */
export type ReqStatusKey = "OPEN" | "DRAFT" | "ON_HOLD" | "FILLED" | "CLOSED" | "CANCELLED";
export interface ReqStatusMeta { label: string; tone: string; bg: string; icon: IconName; }
export interface ReqRow {
  id: string;                   // requisition id (mono), e.g. "REQ-4799"
  title: string;
  dept: string; loc: string;
  status: ReqStatusKey;
  pri?: "High" | "Normal";      // priority (High shows a danger dot)
  min?: number; max?: number;   // salary band in USD; absent renders ", not set" (warn)
  cands?: number;               // candidate count (0 renders ", ")
  head: number;                 // headcount / openings
  rec: string;                  // recruiter name
  recI: string;                 // recruiter initials
  created: string;              // created label, e.g. "May 24"
}
export interface ReqListData {
  rows: ReqRow[];
  statusMeta: Record<ReqStatusKey, ReqStatusMeta>; // status -> chip meta (label/tone/bg/icon)
  workspaceName?: string;       // shown in the subtitle count line
}

/* ----- Requisition detail ----- */
export interface ReqCustomField {
  id: string; label: string; value: string;
  importanceLabel: string; importanceTone: string; importanceBg: string; // importance chip
}
export interface ReqDetailData {
  id: string; title: string; dept: string; loc: string;
  status: ReqStatusKey;
  min: number; max: number;     // salary band (USD)
  level: string; family: string;
  filled: number; head: number; // filled / total headcount
  target: string; posted: string;
  jd: {                          // jd-author generated description
    description: string; inclusivity: number;
    required: string[]; niceToHave: string[];
  };
  customFields: ReqCustomField[];// admin criteria fed to the screener
  owners: { role: string; name: string; ini: string }[];
  pipeline: { stage: string; n: number; color: string }[];
  pipelineSummary: string;       // e.g. "42 candidates across 5 stages..."
  pipelineCards: { label: string; n: string; icon: IconName; color: string; sub: string }[];
  activity: TimelineItem[];
}

/* ----- Requisition intake (the showpiece) ----- */
export interface IntakeCustomField {
  id: string; label: string; value: string;
  importance: string;           // key into IntakeData.importance
}
export interface IntakeBiasFlag {
  id: string; type: string;     // flag category, e.g. "Gendered language"
  severity: "low" | "medium" | "high";
  text: string;                 // the flagged phrase
  suggestion: string;           // the proposed replacement
  where?: string;               // location hint, e.g. "in requirements"
  applied?: boolean;            // set true once the one-click fix is applied
}
export interface IntakeTraceStep { t: string; d: string; status: "pass" | "review" | "fail"; }
export interface IntakeJDGen {
  description: string;
  required: string[];
  niceToHave: string[];
  inclusivity: number;          // 0..100
  biasFlags: IntakeBiasFlag[];
  trace: IntakeTraceStep[];     // streamed jd-author reasoning steps
}
export interface IntakeData {
  importance: Record<string, { label: string }>;   // IMPORTANCE options for custom fields
  seedCustomFields: IntakeCustomField[];            // CUSTOM_FIELDS starter rows
  jdGen: IntakeJDGen;                               // JD_GEN result the agent "produces"
  initial: { title: string; dept: string; level: string; location: string; min: number; max: number };
}
// live editor state held inside the component
export interface IntakeState {
  title: string; dept: string; level: string; location: string; min: number; max: number;
  mode: "ai" | "paste"; generating: boolean; generated: boolean;
  description: string; required: string[]; niceToHave: string[]; inclusivity: number;
  skills: string[]; customFields: IntakeCustomField[];
}

/* ----- Interview rounds config (fills the detail "rounds" tab) ----- */
export type RoundTypeKey = "TECHNICAL" | "BEHAVIORAL" | "SCREEN" | "ONSITE" | "FINAL" | string;
export interface RoundItem {
  id: string; name: string; type: RoundTypeKey;
  dur: number;                   // duration minutes
  panel: string;                 // panel label, e.g. "Engineer"
  auto: boolean;                 // auto-advance on pass
  instr: string;                 // optional instructions, shown after the panel
}
export interface RoundsData {
  rounds: RoundItem[];           // ordered rounds (ROUNDS)
  roundTypes: Record<string, { label: string; tone: string }>; // ROUND_TYPES meta keyed by type
}

/* ----- Application form builder (fills the detail "form" tab) ----- */
export interface FormField {
  id: string; type: string;      // text | textarea | select | checkbox | file | email | image | url | phone ...
  label: string; required?: boolean;
  locked?: boolean;              // default field that cannot be removed
  order?: number;                // persisted display order
  placeholder?: string;
  helpText?: string;
  options?: string[];            // select / multiselect / radio choices
  fileTypes?: string[];          // file / image accepted extensions (e.g. .pdf, .png)
  maxSizeMb?: number;            // file / image max upload size
}
export interface FormPaletteItem { type: string; label: string; icon: IconName; }
export interface FormBuilderData {
  fields: FormField[];           // starting fields (FORM_FIELDS)
  palette: FormPaletteItem[];    // field types to add (FIELD_PALETTE)
}

/* ----- Fairness / adverse-impact ----- */
export interface FairnessGroup {
  g: string;                     // group label
  rate: number;                  // selection rate 0..1
  sel: number; app: number;      // selected / applicants counts
  ref?: boolean;                 // the reference (highest-rate) group
}
export interface FairnessAttr {
  name: string;                  // protected attribute, e.g. "Gender"
  ratio: number;                 // impact ratio (lowest group / reference)
  pass: boolean;                 // ratio >= 0.80
  groups: FairnessGroup[];
  finding: string;               // plain-language conclusion
}
export interface FairnessData {
  stage: string;                 // pipeline stage analyzed
  range: string;                 // date range stamp
  totals: [string, string][];    // banner stats [label, value], e.g. ["Applicants","4,036"]
  attributes: FairnessAttr[];
  heatmap: {                     // intersectional selection-rate grid
    subtitle: string;            // e.g. "gender x ethnicity"
    cols: string[];              // column labels
    rows: [string, number[]][]; // [rowLabel, rates 0..1 per col]
    okThreshold: number;         // cell-ok cutoff, e.g. 0.18
  };
}

/* ----- Copilot ----- */
export interface CopilotItem { n: string; meta: string; src: string; } // cited result row
export interface CopilotAnswer {
  reasoning: string[];           // streamed thinking steps
  confidence: number;            // 0..1
  text: string;                  // answer body, **bold** supported
  items: CopilotItem[];          // cited result cards (meta contains a number for the ring)
  sources: string[];            // source document chips
  actions: string[];            // suggested action labels
  followups: string[];          // follow-up question chips
}
export interface CopilotData {
  thread: { text: string };      // the seed user message (COPILOT_THREAD[0])
  answer: CopilotAnswer;         // the grounded answer (COPILOT_THREAD[1])
  suggestions: string[];         // "Try asking" rail (COPILOT_SUGGESTIONS)
}

/* ----- Analytics ----- */
export interface AnalyticsInsight {
  sev: "critical" | "warning" | "info";
  finding: string; evidence: string; rec: string;  // finding, supporting data, recommendation
}
export interface AnalyticsSource {
  src: string; color: string;
  hires: number; quality: number; apps: number; cost: number; // cost = cost/hire USD
}
export interface AnalyticsData {
  orgName: string;
  range: string;                 // date-range label
  kpis: KPI[];                   // KPICard data (see KPI)
  insights: AnalyticsInsight[];  // AI insights panel (3-up)
  funnel: FunnelStage[];         // pipeline funnel
  funnelConversion: string;      // headRight pill text, e.g. "1.0% applied to hired"
  diversity: DonutDatum[];       // diversity donut
  tthTrend: number[];            // time-to-hire trend series
  tthLabels: string[];           // trend x labels
  tthDelta: string;              // trend headRight pill, e.g. "-9 days YoY"
  tthByDept: { dept: string; days: number }[];
  sources: AnalyticsSource[];    // source-effectiveness table
}

/* ----- Billing ----- */
export interface BillingUsage { k: string; used: number; limit: number | string; } // limit string = unlimited
export interface BillingTier { n: string; price: number | null; feats: string[]; cur?: boolean; } // price null = Custom
export interface BillingInvoice { id: string; date: string; amount: number; status: string; }
// One month of AI spend: total + per-provider breakdown (Anthropic/Groq/OpenAI/Stub/Other).
export interface BillingSpendMonth { month: string; label: string; total: number; byProvider: Record<string, number>; }
export interface BillingData {
  plan: string;                  // current plan name
  price: number; cycle: string;  // price + billing cycle ("month"/"year")
  renews: string;                // renewal date label
  usage: BillingUsage[];         // usage meters
  card: { last4: string; exp: string };
  invoices: BillingInvoice[];
  tiers: BillingTier[];          // plans shown in the upgrade modal (cur marks the current one)
}

/* ----- Settings (two-panel) ----- */
export interface SettingsMember { ini: string; name: string; email: string; role: string; status: "active" | "invited"; last: string; }
export interface SettingsPerm { area: string; caps: (boolean | "view")[]; } // one cap per role column
export interface SettingsSSO { n: string; detail: string; icon: IconName; st: "connected" | string; }
export interface SettingsEmailTpl { n: string; edited: string; on: boolean; }
export interface SettingsIntegration { n: string; cat: string; icon: IconName; st: "connected" | string; }
export interface SettingsApiKey { name: string; scopes: string; prefix: string; created: string; last: string; }
export interface SettingsFeature { f: string; plan: string; on?: boolean; locked?: boolean; }
export interface SettingsRetention { d: string; note: string; period: string; }
export interface SettingsData {
  account: { ini: string; name: string; email: string; title: string };
  team: SettingsMember[];
  roleNames: string[];           // permission-matrix columns (ROLE_NAMES)
  permissions: SettingsPerm[];   // permission matrix rows
  ssoProviders: SettingsSSO[];
  emailTemplates: SettingsEmailTpl[];
  integrations: SettingsIntegration[];
  apiKeys: SettingsApiKey[];
  featureFlags: SettingsFeature[];
  retention: SettingsRetention[];
}

/* ----- Security ----- */
export interface SecurityAlert { t: string; detail: string; sev: string; icon: IconName; }
export interface SecurityData {
  orgName: string;
  score: number;                 // 0..100 security score
  posture: { k: string; v: number; unit: string }[]; // stat tiles (v>=90 renders ok)
  alerts: SecurityAlert[];       // open risk items
  checklist: { c: string; done: boolean }[]; // hardening checklist
}

/* ----- AI operations ----- */
export interface AiOpsAgent {
  n: string;                     // agent name
  status: "healthy" | string;
  acc: number;                   // accuracy 0..1
  drift: "stable" | "watch" | string;
  cost: number;                  // cost/mo USD
  lat: number;                   // latency seconds
}
export interface AiOpsData {
  agentCount: number;            // header pill, e.g. 15
  kpis: KPI[];                   // KPICard data
  agents: AiOpsAgent[];          // agent fleet table
}

/* ----- Super-admin platform console ----- */
export interface Tenant {
  id: string; name: string; slug: string; created: string;
  plan: string;                  // FREE/STARTER/PROFESSIONAL/ENTERPRISE
  users: number; mrr: number; cost: number; runs: string;
  health: "healthy" | "watch" | "over" | string;
}
export interface TenantsData { summary: string; kpis: KPI[]; tenants: Tenant[]; }
export interface PlatformAgent { n: string; tenants: number; runs: string; cost: number; err: number; status: "deployed" | "degraded" | "paused" | string; }
export interface PlatformAgentsData { agents: PlatformAgent[]; }
export interface PromptVersion { v: string; note: string; date: string; author: string; live?: boolean; }
export interface PromptsData {
  agents: string[];              // agent picker options
  current: { agent: string; tenants: number; text: string };
  versions: PromptVersion[];     // version history (live marks the deployed one)
}
export interface PlanRequest { id: string; tenant: string; from: string; to: string; mrr: string; reason: string; by: string; when: string; }
export interface PlanRequestsData { requests: PlanRequest[]; }
export interface PlatformAuditEntry { who: string; act: string; kind: "impersonation" | "deploy" | "killswitch" | "billing" | "alert" | string; ai?: boolean; t: string; }
export interface PlatformAuditData { entries: PlatformAuditEntry[]; }

/* ----- AI surfaces (cost, notif prefs, mobility, job postings) ----- */
export interface PlatformCostData {
  period: string;                // e.g. "May 2026"
  kpis: KPI[];
  agents: { n: string; cost: number }[];  // spend by agent (sorted desc in-component)
  tenants: { id: string; name: string; cost: number; health: string }[]; // top spenders
  overBudgetNote?: string;       // optional red note under the tenant list
}
export interface NotifPref {
  cat: string; desc: string; ai?: boolean;
  email: boolean; sms: boolean; inapp: boolean;
}
export interface NotifPrefsData { prefs: NotifPref[]; }
export interface MobilityMatch {
  ini: string; name: string; cur: string; tenure: string;
  skills: string[]; match: number;   // 0..100 AI match
  to: string; reqId: string; ai?: boolean;
}
export interface MobilityData { matches: MobilityMatch[]; }
export interface PlatformJob {
  title: string; reqId: string; posted: string; board: string;
  status: "published" | string; apps?: number; views?: number;
}
export interface PlatformJobsData { jobs: PlatformJob[]; }
