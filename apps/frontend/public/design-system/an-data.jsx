/* an-data.jsx, Analytics, Compliance hub, Security, AI-ops (Group H) data */

const ANALYTICS = {
  range: "Last 90 days",
  kpis: [
    { id: "ttf", label: "Time-to-fill", value: 32, suffix: "d", delta: -4, good: true, spark: [40,38,37,35,34,33,33,32], icon: "clock" },
    { id: "tth", label: "Time-to-hire", value: 21, suffix: "d", delta: -3, good: true, spark: [28,27,25,24,23,22,22,21], icon: "calendar" },
    { id: "conv", label: "Applied → hire", value: 1.0, suffix: "%", delta: 0.1, good: true, spark: [0.7,0.8,0.8,0.9,0.9,1.0,1.0,1.0], icon: "radar" },
    { id: "cph", label: "Cost per hire", value: 4120, prefix: "$", delta: -180, good: true, spark: [4600,4500,4420,4360,4280,4220,4180,4120], icon: "card" },
  ],
  funnel: [
    { stage: "Applied", n: 4036, color: "var(--ink-3)" },
    { stage: "Screened", n: 902, color: "var(--info)" },
    { stage: "Interview", n: 318, color: "var(--ai)" },
    { stage: "Offer", n: 64, color: "var(--brand)" },
    { stage: "Hired", n: 41, color: "var(--ok)" },
  ],
  tthByDept: [
    { dept: "Engineering", days: 24, n: 18 },
    { dept: "Design", days: 19, n: 6 },
    { dept: "Marketing", days: 17, n: 5 },
    { dept: "Data", days: 26, n: 7 },
    { dept: "Security", days: 31, n: 5 },
  ],
  tthTrend: [30,29,31,28,26,27,24,23,25,22,21,21],
  tthLabels: ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"],
  sources: [
    { src: "Referral", hires: 16, apps: 640, quality: 82, cost: 1200, color: "var(--brand)" },
    { src: "LinkedIn", hires: 11, apps: 1120, quality: 71, cost: 4800, color: "var(--info)" },
    { src: "Inbound", hires: 8, apps: 980, quality: 64, cost: 900, color: "var(--ai)" },
    { src: "Job board", hires: 6, apps: 1296, quality: 52, cost: 3200, color: "var(--warn)" },
  ],
  diversity: [
    { g: "Women", v: 44, color: "var(--brand)" },
    { g: "Men", v: 49, color: "var(--info)" },
    { g: "Non-binary", v: 4, color: "var(--ai)" },
    { g: "Undisclosed", v: 3, color: "var(--ink-3)" },
  ],
  insights: [
    { sev: "critical", finding: "Job-board conversion is collapsing", evidence: "Job board: 1,296 applicants → 6 hires (0.46%), well below referral (2.5%) at 2.7× the cost.", rec: "Shift spend from job boards to referral incentives, projected −$2,000 cost-per-hire.", ai: true },
    { sev: "warning", finding: "Security roles are bottlenecked at screening", evidence: "Security time-to-hire is 31d vs 22d org-wide; 9-day gap concentrated in the screening stage.", rec: "Add a second technical screener or relax the must-have on niche tooling.", ai: true },
    { sev: "info", finding: "Offer-accept rate is trending up", evidence: "86% this quarter (+2pts), driven by faster scheduling (median 1.2 days to first interview).", rec: "Maintain the fast-scheduling SLA, it correlates with accept rate.", ai: true },
  ],
};

/* Compliance hub */
const COMPLIANCE = {
  score: 94, range: "Jan 1 to May 30, 2026", generated: "May 30, 2026 · 09:14",
  policies: [
    { p: "EEOC adverse-impact monitoring", st: "active", note: "Auto-runs nightly" },
    { p: "GDPR data-retention (24 mo)", st: "active", note: "Next purge in 12 days" },
    { p: "Right-to-explanation (candidate portal)", st: "active", note: "Live · 1,204 explanations served" },
    { p: "Human-in-the-loop on rejections", st: "active", note: "No solely-automated declines" },
    { p: "Model drift alerts", st: "review", note: "1 model on watch (bias-auditor)" },
    { p: "Data Processing Agreements", st: "active", note: "All 3 sub-processors signed" },
  ],
  certs: [
    { c: "SOC 2 Type II", st: "Valid", until: "Mar 2027" },
    { c: "ISO 27001", st: "Valid", until: "Nov 2026" },
    { c: "GDPR", st: "Compliant", until: ", " },
    { c: "EEOC Uniform Guidelines", st: "Compliant", until: ", " },
  ],
  audit: [
    { who: "bias-auditor", act: "computed four-fifths report (3 attributes)", t: "3h", ai: true },
    { who: "Avery Chen", act: "exported EEOC summary (Q2)", t: "5h" },
    { who: "system", act: "retention purge, 1,204 records", t: "1d" },
    { who: "Jordan Lee", act: "overrode an AI rejection (HQ-1)", t: "1d" },
    { who: "Maya Idris", act: "updated retention policy to 24 months", t: "2d" },
  ],
};
/* reuse window.FAIRNESS for the adverse-impact dashboard */

/* Security */
const SECURITY = {
  score: 88,
  alerts: [
    { sev: "Medium", t: "3 users without MFA enabled", detail: "Last login within 30 days · enforce policy", icon: "shield" },
    { sev: "Low", t: "2 API keys older than 90 days", detail: "Rotate recommended", icon: "terminal" },
  ],
  posture: [
    { k: "MFA adoption", v: 91, unit: "%", good: true },
    { k: "SSO coverage", v: 78, unit: "%", good: true },
    { k: "TLS / encryption at rest", v: 100, unit: "%", good: true },
    { k: "Avg session length", v: 6.2, unit: "h", good: true },
  ],
  checklist: [
    { c: "Enforce MFA for all admins", done: true },
    { c: "SSO / SAML configured", done: true },
    { c: "IP allow-list for super-admin", done: true },
    { c: "API key rotation policy", done: false },
    { c: "Quarterly access review", done: true },
    { c: "Pen-test (annual)", done: true },
  ],
};

/* AI Ops, extends window.AGENTS with cost & perf */
const AIOPS = {
  kpis: [
    { id: "runs", label: "Agent runs (24h)", value: 8420, delta: 12, good: true, ai: true, spark: [6800,7000,7300,7600,7900,8100,8300,8420], icon: "cpu" },
    { id: "cost", label: "Inference cost (mo)", value: 2840, prefix: "$", delta: -120, good: true, spark: [3200,3100,3050,2990,2940,2900,2870,2840], icon: "card" },
    { id: "lat", label: "Median latency", value: 3.4, suffix: "s", delta: -0.3, good: true, spark: [4.2,4.0,3.9,3.7,3.6,3.5,3.4,3.4], icon: "clock" },
    { id: "health", label: "Agents healthy", value: 13, suffix: "/15", delta: 0, good: true, spark: [13,13,14,13,13,13,13,13], icon: "check" },
  ],
  agents: [
    { n: "candidate-screener", status: "healthy", acc: 0.93, drift: "stable", runs: "12.4k", cost: 980, lat: 3.8 },
    { n: "resume-parser", status: "healthy", acc: 0.91, drift: "stable", runs: "48.7k", cost: 620, lat: 1.2 },
    { n: "jd-author", status: "healthy", acc: 0.96, drift: "stable", runs: "3.1k", cost: 410, lat: 5.1 },
    { n: "bias-auditor", status: "watch", acc: 0.91, drift: "watch", runs: "640", cost: 180, lat: 6.4 },
    { n: "copilot", status: "healthy", acc: 0.89, drift: "stable", runs: "7.5k", cost: 520, lat: 2.9 },
    { n: "analytics", status: "watch", acc: 0.87, drift: "watch", runs: "2.6k", cost: 130, lat: 4.0 },
    { n: "offer", status: "healthy", acc: 0.94, drift: "stable", runs: "880", cost: 90, lat: 3.3 },
  ],
};

Object.assign(window, { ANALYTICS, COMPLIANCE, SECURITY, AIOPS });
