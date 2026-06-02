/* cand-data.jsx, Candidates (Group E) data */

const CAND_STAGES = [
  { id: "applied",   label: "Applied",   color: "var(--ink-3)" },
  { id: "screening", label: "Screening", color: "var(--info)", ai: true },
  { id: "interview", label: "Interview", color: "var(--ai)" },
  { id: "offer",     label: "Offer",     color: "var(--brand)" },
  { id: "hired",     label: "Hired",     color: "var(--ok)" },
];

/* st: pass/review/fail (AI band) · days = time in current stage · match "n/6" requirements met */
const CANDIDATES = [
  { id: "c1",  name: "Priya Raman",      ini: "PR", role: "Sr. Backend Engineer", reqId: "REQ-4821", stage: "screening", score: 78, st: "review", match: "2/4", source: "Referral", days: 6, loc: "Austin, TX", you: true, focus: true },
  { id: "c2",  name: "Lena Whitfield",   ini: "LW", role: "Sr. Backend Engineer", reqId: "REQ-4821", stage: "screening", score: 81, st: "pass",   match: "3/4", source: "LinkedIn", days: 5, loc: "Denver, CO", you: true },
  { id: "c3",  name: "Aisha Bello",      ini: "AB", role: "Sr. Backend Engineer", reqId: "REQ-4821", stage: "screening", score: 73, st: "review", match: "2/4", source: "Inbound", days: 2, loc: "Remote", you: true },
  { id: "c4",  name: "Dana Osei",        ini: "DO", role: "Platform Engineer",     reqId: "REQ-4799", stage: "interview", score: 84, st: "pass",   match: "4/4", source: "Referral", days: 8, loc: "Seattle, WA", you: true },
  { id: "c5",  name: "Marcus Bell",      ini: "MB", role: "Staff Product Designer",reqId: "REQ-4810", stage: "interview", score: 41, st: "fail",   match: "1/4", source: "Job board", days: 3, loc: "New York, NY" },
  { id: "c6",  name: "Yuki Tanaka",      ini: "YT", role: "Platform Engineer",     reqId: "REQ-4799", stage: "interview", score: 88, st: "pass",   match: "4/4", source: "Referral", days: 1, loc: "Remote", you: true },
  { id: "c7",  name: "Sofia Karim",      ini: "SK", role: "Platform Engineer",     reqId: "REQ-4799", stage: "offer",     score: 86, st: "pass",   match: "4/4", source: "LinkedIn", days: 4, loc: "Boston, MA", you: true },
  { id: "c8",  name: "Noah Frye",        ini: "NF", role: "Data Engineer",         reqId: "REQ-4771", stage: "offer",     score: 79, st: "pass",   match: "3/4", source: "Inbound", days: 6, loc: "Remote" },
  { id: "c9",  name: "Carlos Mendez",    ini: "CM", role: "Growth Marketing Lead", reqId: "REQ-4788", stage: "applied",   score: 64, st: "review", match: "2/4", source: "Job board", days: 1, loc: "Miami, FL" },
  { id: "c10", name: "Tomas Reyes",      ini: "TR", role: "Data Engineer",         reqId: "REQ-4771", stage: "screening", score: 67, st: "review", match: "2/4", source: "Inbound", days: 7, loc: "Remote" },
  { id: "c11", name: "Hana Suzuki",      ini: "HS", role: "Sr. Backend Engineer",  reqId: "REQ-4821", stage: "applied",   score: 0,  st: "pending",match: ", ",  source: "Referral", days: 0, loc: "Remote", you: true },
  { id: "c12", name: "Owen Walsh",       ini: "OW", role: "Sr. Backend Engineer",  reqId: "REQ-4821", stage: "applied",   score: 0,  st: "pending",match: ", ",  source: "LinkedIn", days: 1, loc: "Austin, TX" },
  { id: "c13", name: "Maya Idris",       ini: "MI", role: "Security Engineer",     reqId: "REQ-4725", stage: "screening", score: 90, st: "pass",   match: "4/4", source: "Referral", days: 3, loc: "Remote" },
  { id: "c14", name: "Leo Fontaine",     ini: "LF", role: "Security Engineer",     reqId: "REQ-4725", stage: "applied",   score: 0,  st: "pending",match: ", ",  source: "Inbound", days: 2, loc: "Chicago, IL" },
  { id: "c15", name: "Grace Park",       ini: "GP", role: "Staff Product Designer",reqId: "REQ-4810", stage: "screening", score: 76, st: "review", match: "3/4", source: "LinkedIn", days: 4, loc: "Los Angeles, CA" },
  { id: "c16", name: "Ben Carter",       ini: "BC", role: "Growth Marketing Lead", reqId: "REQ-4788", stage: "applied",   score: 0,  st: "pending",match: ", ",  source: "Job board", days: 3, loc: "Remote" },
  { id: "c17", name: "Zara Ahmed",       ini: "ZA", role: "Platform Engineer",     reqId: "REQ-4799", stage: "screening", score: 71, st: "review", match: "2/4", source: "Inbound", days: 9, loc: "Remote" },
  { id: "c18", name: "Diego Santos",     ini: "DS", role: "Data Engineer",         reqId: "REQ-4771", stage: "interview", score: 82, st: "pass",   match: "3/4", source: "Referral", days: 2, loc: "Austin, TX" },
  { id: "c19", name: "Ivy Chen",         ini: "IC", role: "Staff Product Designer",reqId: "REQ-4810", stage: "offer",     score: 88, st: "pass",   match: "4/4", source: "Referral", days: 5, loc: "New York, NY" },
  { id: "c20", name: "Sam Okafor",       ini: "SO", role: "Security Engineer",     reqId: "REQ-4725", stage: "hired",     score: 91, st: "pass",   match: "4/4", source: "Referral", days: 1, loc: "Remote" },
  { id: "c21", name: "Ruth Nakamura",    ini: "RN", role: "Sr. Backend Engineer",  reqId: "REQ-4821", stage: "hired",     score: 89, st: "pass",   match: "4/4", source: "LinkedIn", days: 12, loc: "Remote" },
  { id: "c22", name: "Theo Marsh",       ini: "TM", role: "Growth Marketing Lead", reqId: "REQ-4788", stage: "screening", score: 58, st: "fail",   match: "1/4", source: "Job board", days: 4, loc: "Remote" },
];

const SAVED_VIEWS = [
  { id: "v1", label: "All active", icon: "users", count: 22 },
  { id: "v2", label: "My candidates", icon: "userCog", count: 8 },
  { id: "v3", label: "Needs screening", icon: "scan", ai: true, count: 4 },
  { id: "v4", label: "Awaiting interview", icon: "calendar", count: 4 },
  { id: "v5", label: "Top scores (85+)", icon: "chart", count: 6 },
  { id: "v6", label: "Flagged for review", icon: "flag", ai: true, count: 7 },
];
const CAND_SOURCES = ["All sources", "Referral", "LinkedIn", "Inbound", "Job board"];

/* focal candidate profile (Priya Raman), reuses window.SCREENING + window.PARSED */
const CAND_PROFILE = {
  id: "c1", name: "Priya Raman", ini: "PR", role: "Senior Backend Engineer", reqId: "REQ-4821",
  stage: "screening", loc: "Austin, TX", source: "Referral", applied: "May 24, 2026", email: "priya.raman@hey.com", phone: "+1 (512) 555‑0148",
  scorecards: [
    { who: "Sam Okafor", role: "Technical screen", rec: "YES", recTone: "ok", overall: 4.2,
      dims: [{ d: "Coding", s: 4 }, { d: "Systems depth", s: 5 }, { d: "Communication", s: 4 }], note: "Excellent on distributed systems; clean problem decomposition." },
    { who: "Jordan Lee", role: "Behavioral", rec: "NEUTRAL", recTone: "warn", overall: 3.3,
      dims: [{ d: "Ownership", s: 4 }, { d: "Leadership", s: 2 }, { d: "Collaboration", s: 4 }], note: "Strong IC signal; limited evidence of people leadership." },
  ],
  activity: [
    { ic: "sparkles", ai: true, who: "candidate-screener", what: "produced a screening verdict (78, REVIEW)", t: "6d" },
    { ic: "calendar", who: "Avery Chen", what: "scheduled the technical screen", t: "5d" },
    { ic: "fileText", who: "Sam Okafor", what: "submitted a scorecard (YES · 4.2)", t: "3d" },
    { ic: "flag", ai: true, who: "candidate-screener", what: "flagged confidence below threshold for human review", t: "2d" },
  ],
  notes: [
    { who: "Avery Chen", ini: "AC", t: "2d", text: "Referred by Ruth (current backend hire). Strong systems signal, the open question is fintech domain depth. Pushing to a human-reviewed decision." },
    { who: "Jordan Lee", ini: "JL", t: "1d", text: "Agree it's borderline on leadership. Let's probe scope in the final panel rather than rejecting on the AI gap." },
  ],
};

Object.assign(window, { CAND_STAGES, CANDIDATES, SAVED_VIEWS, CAND_SOURCES, CAND_PROFILE });
