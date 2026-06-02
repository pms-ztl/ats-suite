/* ig-data.jsx, Interviews, Scheduling, Offers (Group G) data */

const INTERVIEW_TYPES = {
  PHONE_SCREEN: { label: "Phone screen", tone: "var(--info)" },
  TECHNICAL:    { label: "Technical",    tone: "var(--ai)" },
  BEHAVIORAL:   { label: "Behavioral",   tone: "var(--brand)" },
  PANEL:        { label: "Panel",        tone: "var(--warn)" },
  FINAL:        { label: "Final",        tone: "var(--ok)" },
};
const IV_STATUS = {
  scheduled: { label: "Scheduled", tone: "var(--info)", bg: "var(--info-tint)", icon: "calendar" },
  completed: { label: "Completed", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
  awaiting:  { label: "Feedback due", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "clock" },
  cancelled: { label: "Cancelled", tone: "var(--ink-2)", bg: "var(--surface-3)", icon: "x" },
};

const INTERVIEWS = [
  { id: "iv1", name: "Dana Osei", ini: "DO", role: "Platform Engineer", reqId: "REQ-4799", type: "TECHNICAL", round: "System design", status: "awaiting", when: "Today · 11:00", dur: 60, mode: "Video", panel: ["Sam Okafor", "Yuki Tanaka", "Avery Chen"], focus: true },
  { id: "iv2", name: "Marcus Bell", ini: "MB", role: "Staff Product Designer", reqId: "REQ-4810", type: "PANEL", round: "Portfolio panel", status: "scheduled", when: "Today · 14:00", dur: 60, mode: "Onsite", panel: ["Grace Park", "Ivy Chen"] },
  { id: "iv3", name: "Aisha Bello", ini: "AB", role: "Sr. Backend Engineer", reqId: "REQ-4821", type: "PHONE_SCREEN", round: "Recruiter screen", status: "scheduled", when: "Today · 16:30", dur: 30, mode: "Phone", panel: ["Avery Chen"] },
  { id: "iv4", name: "Sofia Karim", ini: "SK", role: "Platform Engineer", reqId: "REQ-4799", type: "FINAL", round: "Final panel", status: "completed", when: "Yesterday", dur: 90, mode: "Onsite", panel: ["Jordan Lee", "Sam Okafor", "Yuki Tanaka"] },
  { id: "iv5", name: "Lena Whitfield", ini: "LW", role: "Sr. Backend Engineer", reqId: "REQ-4821", type: "TECHNICAL", round: "Technical screen", status: "scheduled", when: "Thu · 10:00", dur: 60, mode: "Video", panel: ["Sam Okafor"] },
  { id: "iv6", name: "Diego Santos", ini: "DS", role: "Data Engineer", reqId: "REQ-4771", type: "BEHAVIORAL", round: "Behavioral", status: "completed", when: "Mon", dur: 45, mode: "Video", panel: ["Jordan Lee"] },
];

/* focal interview (Dana Osei), feedback + AI interview-intelligence */
const IV_DETAIL = {
  id: "iv1", name: "Dana Osei", ini: "DO", role: "Platform Engineer", reqId: "REQ-4799", type: "TECHNICAL", round: "System design",
  when: "Today · 11:00 AM", dur: 60, mode: "Video", link: "meet.northwind.co/dana-sys",
  panelists: [
    { who: "Sam Okafor", role: "Staff Engineer", status: "submitted", rec: "STRONG_YES", overall: 4.6, dims: [{ d: "Systems design", s: 5 }, { d: "Trade-offs", s: 5 }, { d: "Communication", s: 4 }], note: "Excellent ledger design; reasoned about consistency vs availability without prompting." },
    { who: "Yuki Tanaka", role: "Senior Engineer", status: "submitted", rec: "YES", overall: 4.1, dims: [{ d: "Systems design", s: 4 }, { d: "Trade-offs", s: 4 }, { d: "Communication", s: 4 }], note: "Strong fundamentals; could push harder on failure modes." },
    { who: "Avery Chen", role: "Recruiter", status: "pending", rec: null },
  ],
  ai: {
    rec: "YES", confidence: 0.86,
    summary: "Dana demonstrated senior-level systems-design ability, designing a sharded payments ledger with clear consistency trade-offs. Communication was structured and collaborative. The only softer area was depth on failure-mode recovery.",
    signals: [
      { skill: "Distributed systems", rating: "strong", quote: "“I'd shard by account-id and use a write-ahead log per shard to keep the ledger append-only.”" },
      { skill: "Trade-off reasoning", rating: "strong", quote: "“Eventual consistency is fine for analytics, but the balance read must be strongly consistent.”" },
      { skill: "Failure handling", rating: "adequate", quote: "“We'd retry with idempotency keys…”", note: "less depth on partial-failure recovery" },
    ],
    keyMoments: [
      { t: "00:14", d: "Proposed the sharding scheme unprompted" },
      { t: "00:38", d: "Identified the dual-write problem and resolved with an outbox" },
    ],
  },
};

/* scheduling, AI-proposed slots */
const SCHED = {
  candidate: "Aisha Bello", role: "Sr. Backend Engineer", round: "Technical screen", dur: 60,
  participants: [
    { who: "Aisha Bello", role: "Candidate", ini: "AB" },
    { who: "Sam Okafor", role: "Staff Engineer", ini: "SO" },
    { who: "Yuki Tanaka", role: "Senior Engineer", ini: "YT" },
  ],
  slots: [
    { day: "Wed May 31", time: "10:00 AM", score: 0.94, all: true, selected: true, note: "All available · morning preference met" },
    { day: "Wed May 31", time: "2:00 PM", score: 0.82, all: true, note: "All available" },
    { day: "Thu Jun 1", time: "11:00 AM", score: 0.78, all: true, note: "All available · short notice" },
    { day: "Thu Jun 1", time: "4:00 PM", score: 0.61, all: false, note: "Yuki tentative · late in day" },
    { day: "Fri Jun 2", time: "3:00 PM", score: 0.42, all: false, note: "Friday afternoon, avoided" },
  ],
  week: ["Mon 29", "Tue 30", "Wed 31", "Thu 1", "Fri 2"],
  hours: ["9", "10", "11", "12", "1", "2", "3", "4", "5"],
  busy: { "Sam Okafor": [["Mon 29", 0, 2], ["Tue 30", 4, 6]], "Yuki Tanaka": [["Mon 29", 3, 5], ["Thu 1", 7, 9]], "Aisha Bello": [["Tue 30", 0, 1]] },
};

/* offers */
const OFFER_STATUS = {
  draft:     { label: "Draft", tone: "var(--ink-3)", bg: "var(--surface-3)", icon: "dot" },
  pending:   { label: "Pending approval", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "clock" },
  approved:  { label: "Approved", tone: "var(--brand)", bg: "var(--brand-tint)", icon: "check" },
  sent:      { label: "Sent", tone: "var(--info)", bg: "var(--info-tint)", icon: "arrowUpRight" },
  accepted:  { label: "Accepted", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
  declined:  { label: "Declined", tone: "var(--danger)", bg: "var(--danger-tint)", icon: "x" },
};
const OFFERS = [
  { id: "of1", name: "Sofia Karim", ini: "SK", role: "Platform Engineer", reqId: "REQ-4799", base: 182000, status: "draft", expires: "Jun 14", focus: true },
  { id: "of2", name: "Ivy Chen", ini: "IC", role: "Staff Product Designer", reqId: "REQ-4810", base: 205000, status: "sent", expires: "Jun 8" },
  { id: "of3", name: "Sam Okafor", ini: "SO", role: "Security Engineer", reqId: "REQ-4725", base: 198000, status: "accepted", expires: ", " },
  { id: "of4", name: "Dana Osei", ini: "DO", role: "Platform Engineer", reqId: "REQ-4799", base: 176000, status: "pending", expires: "Jun 16" },
  { id: "of5", name: "Noah Frye", ini: "NF", role: "Data Engineer", reqId: "REQ-4771", base: 168000, status: "draft", expires: "Jun 20" },
];
const OFFER_DETAIL = {
  id: "of1", name: "Sofia Karim", ini: "SK", role: "Platform Engineer", level: "Senior (L5)", reqId: "REQ-4799", start: "Jul 14, 2026", expiresInDays: 10,
  ai: { confidence: 0.9, bandPosition: "75th percentile", signal: "STRONG_HIRE" },
  comp: { base: 182000, signing: 20000, annualBonus: 0.15, equity: "0.08% / 4yr", total: 230900 },
  band: { min: 160000, mid: 185000, max: 215000, market: { p25: 168000, p50: 188000, p75: 208000 } },
  justification: "Interview signal was STRONG_HIRE across the loop; positioning base near the 75th percentile of the band reflects the team's strong conviction and competing-offer risk. Signing bonus offsets unvested equity at current employer.",
  approvalChain: [
    { role: "Recruiter", who: "Avery Chen", status: "done" },
    { role: "Hiring Manager", who: "Jordan Lee", status: "current" },
    { role: "Finance", who: "Comp committee", status: "pending" },
  ],
  benefits: ["Full medical / dental / vision", "401(k) 4% match", "Unlimited PTO", "$2,000 learning budget", "Remote-first"],
};

Object.assign(window, { INTERVIEW_TYPES, IV_STATUS, INTERVIEWS, IV_DETAIL, SCHED, OFFER_STATUS, OFFERS, OFFER_DETAIL });
