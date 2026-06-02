/* ai-data.jsx, realistic data for the AI-trust surfaces (Part 4) */

/* ---- focal screening: Priya Raman × Senior Backend Engineer (REQ-4821) ---- */
const SCREENING = {
  candidate: { name: "Priya Raman", title: "Staff Backend Engineer · Lyra", loc: "Austin, TX", years: 8, initials: "PR", email: "priya.raman@hey.com" },
  req: { id: "REQ-4821", title: "Senior Backend Engineer", team: "Payments Platform", recruiter: "Avery Chen" },
  agent: "candidate-screener · agentic (ReAct)",
  score: 78, matchPercentage: 78, result: "REVIEW", confidence: 0.61,
  band: "Strong potential", recommended: "human_review", escalation: true,
  summary: "Deep distributed-systems and backend strength, clearly above bar on core engineering. Two requirements are uncertain, fintech domain depth is adjacent rather than direct, and people-leadership evidence is thin. Confidence is below the auto-advance threshold, so this verdict is routed to a human.",
  signals: { match: ["Distributed systems", "Go", "Observability", "High-scale data pipelines"], gap: ["Fintech domain depth", "People leadership"] },
  requirements: [
    { id: "r1", label: "Distributed systems at scale", weight: 30, sub: 92, state: "pass",
      evidence: "“Led the Kafka event pipeline at Lyra processing 1.2M msg/s across 40 services, cutting p99 latency 38%.”", src: "Experience · Lyra · 2021 to present",
      note: "Direct, quantified, recent. Strongly corroborated." },
    { id: "r2", label: "Go / Rust proficiency", weight: 25, sub: 88, state: "pass",
      evidence: "“5 years Go as primary language; Rust for two perf-critical settlement services.”", src: "Skills + Experience",
      note: "Go corroborated across 3 roles. Rust depth lighter than claimed (see honesty flag)." },
    { id: "r3", label: "Must have fintech domain experience", weight: 25, sub: 55, state: "review", custom: true, importance: "must-have",
      evidence: "“Built payments & payouts infrastructure for Lyra’s ride-hailing marketplace.”", src: "Experience · Lyra",
      note: "Payments infra is adjacent to fintech, but not core financial services / regulated money movement. Admin-defined must-have, flagged for human judgement." },
    { id: "r4", label: "Team leadership (5+ reports)", weight: 20, sub: 20, state: "fail",
      evidence: "“Tech lead for the Settlements pod.”", src: "Experience · Lyra",
      note: "‘Tech lead’ found, but no direct reports or team size stated. Could not corroborate 5+ people management." },
  ],
};

const TRACE = [
  { t: "Fetched job requirements", d: "REQ-4821, 4 requirements + 1 admin custom field loaded", status: "done", tool: "get_requirements" },
  { t: "Loaded candidate profile", d: "Priya Raman, parsed résumé v2, 8 yrs experience, 14 skills", status: "done", tool: "get_candidate" },
  { t: "Verified, Distributed systems at scale", d: "Corroborated · cite Experience §Lyra · sub-score 92", status: "pass", tool: "verify_requirement" },
  { t: "Verified, Go / Rust proficiency", d: "Corroborated (Go); Rust lighter than claimed · sub-score 88", status: "pass", tool: "verify_requirement" },
  { t: "Verified, Fintech domain (custom must-have)", d: "Adjacent evidence only; marked uncertain · sub-score 55", status: "review", tool: "verify_requirement" },
  { t: "Verified, Team leadership 5+", d: "No direct-report evidence found · sub-score 20", status: "fail", tool: "verify_requirement" },
  { t: "Calibrated against role history", d: "Compared to 23 prior screenings for REQ-4821 (mean 71)", status: "done", tool: "calibrate" },
  { t: "Confidence below threshold", d: "0.61 < 0.70 auto-advance threshold → flag for human review", status: "review", tool: "flag_for_review" },
  { t: "Submitted verdict", d: "REVIEW · matchPercentage 78 · recommend human_review", status: "done", tool: "submit_verdict" },
];

const PARSED = {
  fields: [
    { k: "Full name", v: "Priya Raman", c: 0.99, src: "Header" },
    { k: "Email", v: "priya.raman@hey.com", c: 0.98, src: "Header" },
    { k: "Phone", v: "+1 (512) 555‑0148", c: 0.95, src: "Header" },
    { k: "Location", v: "Austin, TX", c: 0.91, src: "Header" },
    { k: "Years of experience", v: "8", c: 0.86, src: "Computed from roles" },
  ],
  skills: [
    { n: "Go", c: 0.97 }, { n: "Kafka", c: 0.94 }, { n: "PostgreSQL", c: 0.93 }, { n: "gRPC", c: 0.9 },
    { n: "Kubernetes", c: 0.88 }, { n: "AWS", c: 0.85 }, { n: "Observability", c: 0.82 }, { n: "Rust", c: 0.58 }, { n: "Terraform", c: 0.71 },
  ],
  experience: [
    { co: "Lyra", role: "Staff Backend Engineer", dates: "2021, present", c: 0.96,
      bullets: [
        { text: "Led Kafka event pipeline processing 1.2M msg/s across 40 services", action: "Led", metric: "1.2M msg/s", change: "−38% p99" },
        { text: "Built payments & payouts infrastructure for the marketplace", action: "Built", metric: "$2.1B/yr GMV", change: null },
      ]},
    { co: "Boxcar", role: "Senior Software Engineer", dates: "2017, 2021", c: 0.92, bullets: [] },
  ],
  honesty: [
    { claim: "“Rust expert”", issue: "Résumé shows two side projects and one prod service, evidence suggests proficient, not expert.", severity: "low" },
  ],
};

/* ---- HITL review queue ---- */
const HITL = [
  { id: "HQ-1", kind: "Screening, rejection review", who: "Marcus Bell", role: "Staff Product Designer", agent: "candidate-screener", conf: 0.58, sla: "Due in 2h", slaTone: "warn",
    why: "AI recommends reject (score 41) but candidate has a strong portfolio signal the model may underweight.", priority: "High", risk: "No solely-automated rejection, human required" },
  { id: "HQ-2", kind: "Offer approval", who: "Dana Osei", role: "Platform Engineer", agent: "offer", conf: 0.91, sla: "Due in 6h", slaTone: "ok",
    why: "Offer drafted at 78th percentile (above midpoint), exceeds band guidance, needs sign-off.", priority: "Medium", risk: "Out-of-band exception flagged" },
  { id: "HQ-3", kind: "Bias flag", who: "Growth Marketing Lead", role: "Requisition · JD", agent: "jd-author", conf: 0.73, sla: "Due in 1d", slaTone: "ok",
    why: "Phrase “young, high-energy team” flagged as age-coded (severity: medium).", priority: "Medium", risk: "Compliance, pre-publish" },
  { id: "HQ-4", kind: "Screening, escalation", who: "Priya Raman", role: "Senior Backend Engineer", agent: "candidate-screener", conf: 0.61, sla: "Due in 4h", slaTone: "warn",
    why: "Confidence below threshold on a must-have custom field (fintech domain).", priority: "High", risk: "Advisory verdict, human decides" },
  { id: "HQ-5", kind: "Résumé verification", who: "Tomas Reyes", role: "Data Engineer", agent: "resume-verifier", conf: 0.49, sla: "Overdue 20m", slaTone: "danger",
    why: "Employment-date overlap detected between two roles (2019 to 2020); trust score 62.", priority: "High", risk: "Possible inconsistency" },
];
const REASON_CODES = ["Agree with AI", "Disagree, evidence weak", "Insufficient data", "Domain mismatch", "Bias concern", "Policy exception", "Needs more interview signal", "Escalate to compliance"];

/* ---- Fairness / adverse-impact (four-fifths, 0.80 threshold) ---- */
const FAIRNESS = {
  range: "Jan 1 to May 30, 2026", stage: "Application → Phone screen", overall: false,
  attributes: [
    { name: "Race / ethnicity", groups: [
        { g: "White", app: 1840, sel: 412, rate: 0.224, ref: true },
        { g: "Asian", app: 1120, sel: 268, rate: 0.239 },
        { g: "Hispanic / Latino", app: 640, sel: 106, rate: 0.166 },
        { g: "Black / African American", app: 520, sel: 86, rate: 0.165 },
      ], ratio: 0.69, pass: false, finding: "Selection ratio for Black/African American applicants is 0.69 of the highest-selected group, below the 0.80 four-fifths threshold." },
    { name: "Gender", groups: [
        { g: "Men", app: 2360, sel: 540, rate: 0.229, ref: true },
        { g: "Women", app: 1580, sel: 332, rate: 0.210 },
        { g: "Non-binary", app: 96, sel: 19, rate: 0.198 },
      ], ratio: 0.86, pass: true, finding: "All gender groups within the four-fifths threshold. No adverse impact indicated at this stage." },
    { name: "Age (40+)", groups: [
        { g: "Under 40", app: 3010, sel: 712, rate: 0.237, ref: true },
        { g: "40 and over", app: 1020, sel: 190, rate: 0.186 },
      ], ratio: 0.79, pass: false, finding: "Applicants 40+ select at 0.79 of the reference group, marginally below 0.80. Monitor and review screening criteria." },
  ],
};

/* ---- Copilot ---- */
const COPILOT_THREAD = [
  { role: "user", text: "Which candidates for the Payments backend role are strongest but stalled in the pipeline?" },
  { role: "assistant", confidence: 0.84,
    reasoning: ["Searched candidates scoped to REQ-4821 (Senior Backend Engineer)","Filtered to stage age > 5 days with no scheduled next step","Ranked by screening score and recency of activity"],
    text: "Three strong candidates for **Senior Backend Engineer (REQ-4821)** have stalled with no next step scheduled:",
    items: [
      { n: "Priya Raman", meta: "Score 78 · in Screening 6 days · awaiting human review", src: "CAND-3192" },
      { n: "Dana Osei", meta: "Score 84 · Interview stage 8 days · panel not booked", src: "CAND-2885" },
      { n: "Lena Whitfield", meta: "Score 81 · Screening 5 days · no recruiter touch", src: "CAND-3044" },
    ],
    sources: ["CAND-3192", "CAND-2885", "CAND-3044", "REQ-4821"],
    actions: ["Book panel for Dana Osei", "Open Priya’s review", "Message all three"],
    followups: ["Why is Priya awaiting review?", "Compare these three side by side", "Draft an outreach note"] },
];
const COPILOT_SUGGESTIONS = [
  "Summarize this week’s offer activity",
  "Where are we losing candidates in the funnel?",
  "Draft rejection feedback for Marcus Bell",
  "Which reqs are at risk of missing target start?",
];

/* ---- Candidate-facing transparency ---- */
const CANDIDATE_VIEW = {
  name: "Priya", job: "Senior Backend Engineer", company: "Northwind Talent", stage: "Under review",
  assessed: ["Skills and experience against the role’s requirements","Relevant projects and measurable impact","Strengths and areas to explore in interviews"],
  notAssessed: ["Your name, photo, age, gender, race, or any protected characteristic","Where you went to school as a ranking factor"],
  strengths: ["Distributed systems at scale","Backend engineering (Go)","High-scale data pipelines"],
  explore: ["Depth of fintech / payments domain","Team leadership experience"],
};

Object.assign(window, { SCREENING, TRACE, PARSED, HITL, REASON_CODES, FAIRNESS, COPILOT_THREAD, COPILOT_SUGGESTIONS, CANDIDATE_VIEW });
