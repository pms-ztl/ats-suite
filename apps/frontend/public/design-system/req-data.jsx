/* req-data.jsx, Requisitions (Group D) data */

const REQ_STATUS = {
  DRAFT:     { label: "Draft",     tone: "var(--ink-3)",  bg: "var(--surface-3)", icon: "dot" },
  OPEN:      { label: "Open",      tone: "var(--brand)",  bg: "var(--brand-tint)", icon: "dot" },
  ON_HOLD:   { label: "On hold",   tone: "var(--warn)",   bg: "var(--warn-tint)", icon: "clock" },
  FILLED:    { label: "Filled",    tone: "var(--ok)",     bg: "var(--ok-tint)", icon: "check" },
  CLOSED:    { label: "Closed",    tone: "var(--ink-2)",  bg: "var(--surface-3)", icon: "x" },
  CANCELLED: { label: "Cancelled", tone: "var(--danger)", bg: "var(--danger-tint)", icon: "x" },
};

const REQ_LIST = [
  { id: "REQ-4821", title: "Senior Backend Engineer", dept: "Payments", loc: "Austin, TX · Remote", country: "US", status: "OPEN", min: 160000, max: 200000, head: 2, rec: "Avery Chen", recI: "AC", created: "May 24", pri: "High", cands: 42 },
  { id: "REQ-4810", title: "Staff Product Designer", dept: "Design", loc: "New York, NY", country: "US", status: "OPEN", min: 170000, max: 215000, head: 1, rec: "Avery Chen", recI: "AC", created: "May 21", pri: "High", cands: 38 },
  { id: "REQ-4799", title: "Platform Engineer", dept: "Infrastructure", loc: "Remote · US", country: "US", status: "ON_HOLD", min: 150000, max: 190000, head: 3, rec: "Sam Okafor", recI: "SO", created: "May 18", pri: "Medium", cands: 31 },
  { id: "REQ-4788", title: "Growth Marketing Lead", dept: "Marketing", loc: "Austin, TX", country: "US", status: "OPEN", min: null, max: null, head: 1, rec: "Avery Chen", recI: "AC", created: "May 16", pri: "Medium", cands: 28 },
  { id: "REQ-4771", title: "Data Engineer", dept: "Data", loc: "Remote · US", country: "US", status: "DRAFT", min: 145000, max: 180000, head: 1, rec: "Sam Okafor", recI: "SO", created: "May 14", pri: "Low", cands: 0 },
  { id: "REQ-4760", title: "Engineering Manager, Payments", dept: "Payments", loc: "San Francisco, CA", country: "US", status: "FILLED", min: 210000, max: 260000, head: 1, rec: "Jordan Lee", recI: "JL", created: "Apr 30", pri: "High", cands: 54 },
  { id: "REQ-4742", title: "Customer Success Manager", dept: "Customer", loc: "Chicago, IL", country: "US", status: "CLOSED", min: 90000, max: 120000, head: 2, rec: "Maya Idris", recI: "MI", created: "Apr 22", pri: "Low", cands: 47 },
  { id: "REQ-4725", title: "Security Engineer", dept: "Security", loc: "Remote · US", country: "US", status: "OPEN", min: 165000, max: 205000, head: 1, rec: "Sam Okafor", recI: "SO", created: "Apr 18", pri: "High", cands: 22 },
  { id: "REQ-4710", title: "Technical Recruiter", dept: "People", loc: "Austin, TX", country: "US", status: "CANCELLED", min: 95000, max: 125000, head: 1, rec: "Maya Idris", recI: "MI", created: "Apr 11", pri: "Low", cands: 12 },
];

/* focal requisition detail (REQ-4821) */
const REQ_DETAIL = {
  id: "REQ-4821", title: "Senior Backend Engineer", dept: "Payments", loc: "Austin, TX · Remote (US)", status: "OPEN",
  min: 160000, max: 200000, head: 2, filled: 0, level: "Senior (L5)", family: "Engineering",
  rec: "Avery Chen", hm: "Jordan Lee", target: "Aug 1, 2026", posted: "May 24, 2026",
  pipeline: [
    { stage: "Applied", n: 42, color: "var(--ink-3)" },
    { stage: "Screening", n: 26, color: "var(--info)" },
    { stage: "Interview", n: 9, color: "var(--ai)" },
    { stage: "Offer", n: 2, color: "var(--brand)" },
    { stage: "Hired", n: 0, color: "var(--ok)" },
  ],
  activity: [
    { ic: "sparkles", ai: true, who: "candidate-screener", what: "screened 4 new applicants", t: "12m" },
    { ic: "users", who: "Avery Chen", what: "moved Lena Whitfield to Interview", t: "1h" },
    { ic: "fileText", who: "Jordan Lee", what: "approved the job description", t: "2d" },
    { ic: "briefcase", who: "Avery Chen", what: "posted the requisition", t: "6d" },
  ],
};

/* AI-generated JD content for "Senior Backend Engineer" */
const JD_GEN = {
  trace: [
    { t: "Analyzing role & level", d: "Senior Backend Engineer · L5 · Payments", status: "done" },
    { t: "Drafting responsibilities", d: "8 core responsibilities from role context", status: "done" },
    { t: "Separating required vs nice-to-have", d: "6 required · 4 preferred", status: "done" },
    { t: "Auditing for biased language", d: "Self-audit · 3 flags found", status: "review" },
    { t: "Scoring inclusivity", d: "Inclusivity score 92 / 100", status: "done" },
  ],
  description: "We're hiring a Senior Backend Engineer to design and scale the core services behind our payments platform, systems that move billions of dollars a year with correctness, low latency, and rock-solid reliability. You'll own services end to end, partner closely with product and infrastructure, and mentor other engineers as we grow.",
  required: [
    "5+ years building and operating backend services in production",
    "Strong proficiency in Go, Rust, or a comparable systems language",
    "Experience with distributed systems and event-driven architectures",
    "Hands-on with relational databases and data modeling at scale",
    "Track record of owning services from design through on-call",
    "Clear written and verbal communication across teams",
  ],
  niceToHave: [
    "Experience in payments, fintech, or regulated money movement",
    "Familiarity with Kafka or similar streaming platforms",
    "Exposure to Kubernetes and infrastructure-as-code",
    "Contributions to open-source systems projects",
  ],
  inclusivity: 92,
  biasFlags: [
    { id: "b1", text: "rock-solid reliability", type: "Ableist-adjacent", severity: "low", suggestion: "consistent reliability", applied: false },
    { id: "b2", text: "rockstar engineer", type: "Pedigree / culture-coded", severity: "medium", suggestion: "skilled engineer", applied: false, where: "An early draft used “rockstar engineer.”" },
    { id: "b3", text: "young and energetic team", type: "Age-coded", severity: "high", suggestion: "collaborative, motivated team", applied: false, where: "Found in the team-culture line." },
  ],
};

/* custom fields (admin-defined label + value + importance) */
const CUSTOM_FIELDS = [
  { id: "cf1", label: "Must have fintech domain experience", value: "Regulated money movement, payments, or banking", importance: "must-have" },
  { id: "cf2", label: "Time-zone overlap", value: "≥ 4 hours overlap with US Central", importance: "important" },
];
const IMPORTANCE = {
  "nice-to-have": { label: "Nice-to-have", tone: "var(--ink-3)", bg: "var(--surface-3)" },
  "important":    { label: "Important",    tone: "var(--info)",  bg: "var(--info-tint)" },
  "must-have":    { label: "Must-have",    tone: "var(--ai-ink)", bg: "var(--ai-tint)" },
};

/* interview rounds */
const ROUNDS = [
  { id: "rd1", name: "Recruiter phone screen", type: "PHONE_SCREEN", dur: 30, panel: "Recruiter", auto: true, instr: "Motivation, comp expectations, role fit." },
  { id: "rd2", name: "Technical screen", type: "TECHNICAL", dur: 60, panel: "Senior Engineer", auto: true, instr: "Coding + systems fundamentals." },
  { id: "rd3", name: "System design", type: "TECHNICAL", dur: 60, panel: "Staff Engineer", auto: false, instr: "Design a payments ledger service." },
  { id: "rd4", name: "Behavioral & values", type: "BEHAVIORAL", dur: 45, panel: "Hiring Manager", auto: false, instr: "Ownership, collaboration, conflict." },
  { id: "rd5", name: "Final panel", type: "PANEL", dur: 90, panel: "Cross-functional", auto: false, instr: "Bar-raiser + 2 panelists." },
];
const ROUND_TYPES = {
  PHONE_SCREEN: { label: "Phone screen", tone: "var(--info)" },
  TECHNICAL:    { label: "Technical",    tone: "var(--ai)" },
  BEHAVIORAL:   { label: "Behavioral",   tone: "var(--brand)" },
  PANEL:        { label: "Panel",        tone: "var(--warn)" },
  FINAL:        { label: "Final",        tone: "var(--ok)" },
};

/* application form-builder fields */
const FORM_FIELDS = [
  { id: "f1", type: "text", label: "Full name", required: true, locked: true },
  { id: "f2", type: "email", label: "Email address", required: true, locked: true },
  { id: "f3", type: "file", label: "Résumé / CV", required: true, locked: true },
  { id: "f4", type: "text", label: "LinkedIn or portfolio URL", required: false },
  { id: "f5", type: "select", label: "Years of backend experience", required: true, options: ["0 to 2", "3 to 5", "6 to 9", "10+"] },
  { id: "f6", type: "textarea", label: "Why are you interested in payments infrastructure?", required: false },
  { id: "f7", type: "checkbox", label: "Are you authorized to work in the US?", required: true },
];
const FIELD_PALETTE = [
  { type: "text", label: "Short text", icon: "type" },
  { type: "textarea", label: "Long text", icon: "fileText" },
  { type: "select", label: "Dropdown", icon: "chevD" },
  { type: "checkbox", label: "Yes / No", icon: "check" },
  { type: "file", label: "File upload", icon: "fileText" },
  { type: "email", label: "Email", icon: "dot" },
];

Object.assign(window, { REQ_STATUS, REQ_LIST, REQ_DETAIL, JD_GEN, CUSTOM_FIELDS, IMPORTANCE, ROUNDS, ROUND_TYPES, FORM_FIELDS, FIELD_PALETTE });
