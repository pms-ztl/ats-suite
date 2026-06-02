/* plat-data.jsx, Super-admin platform console (K) + AI/extra (L) data */

const TENANTS = [
  { id: "t1", name: "Northwind Talent", slug: "northwind", plan: "PROFESSIONAL", seats: "12/15", users: 12, mrr: 399, cost: 284, runs: "8.4k", health: "healthy", created: "Jan 2026", focus: true },
  { id: "t2", name: "Helios Robotics", slug: "helios", plan: "STARTER", seats: "5/5", users: 5, mrr: 149, cost: 96, runs: "2.1k", health: "healthy", created: "Feb 2026" },
  { id: "t3", name: "Atlas Health Group", slug: "atlas", plan: "ENTERPRISE", seats: "240", users: 240, mrr: 4200, cost: 3180, runs: "112k", health: "watch", created: "Nov 2025" },
  { id: "t4", name: "Meridian Studio", slug: "meridian", plan: "FREE", seats: "1/1", users: 1, mrr: 0, cost: 12, runs: "180", health: "healthy", created: "May 2026" },
  { id: "t5", name: "Vertex Capital", slug: "vertex", plan: "PROFESSIONAL", seats: "14/15", users: 14, mrr: 399, cost: 410, runs: "11.2k", health: "over", created: "Mar 2026" },
  { id: "t6", name: "Quanta Bio", slug: "quanta", plan: "STARTER", seats: "3/5", users: 3, mrr: 149, cost: 64, runs: "1.4k", health: "healthy", created: "Apr 2026" },
  { id: "t7", name: "Orbital Freight", slug: "orbital", plan: "PROFESSIONAL", seats: "9/15", users: 9, mrr: 399, cost: 220, runs: "6.0k", health: "healthy", created: "Feb 2026" },
];
const PLAT_KPIS = [
  { id: "tenants", label: "Active tenants", value: 142, delta: 6, good: true, spark: [120,124,128,132,136,138,140,142], icon: "building" },
  { id: "mrr", label: "Platform MRR", value: 86400, prefix: "$", delta: 4200, good: true, spark: [72,75,78,80,82,84,85,86], icon: "card" },
  { id: "cost", label: "Inference cost (mo)", value: 38200, prefix: "$", delta: -1800, good: true, spark: [42,41,40,39,39,38,38,38], icon: "cpu", ai: true },
  { id: "margin", label: "Gross margin", value: 56, suffix: "%", delta: 2, good: true, spark: [50,51,52,53,54,55,55,56], icon: "chart" },
];

const PLAT_AGENTS = [
  { n: "candidate-screener", tenants: 142, runs: "1.2M", cost: 14200, status: "deployed", err: 0.4 },
  { n: "resume-parser", tenants: 142, runs: "4.8M", cost: 8600, status: "deployed", err: 0.2 },
  { n: "jd-author", tenants: 138, runs: "210k", cost: 4100, status: "deployed", err: 0.6 },
  { n: "bias-auditor", tenants: 96, runs: "64k", cost: 2800, status: "degraded", err: 2.1 },
  { n: "copilot", tenants: 120, runs: "640k", cost: 5200, status: "deployed", err: 0.5 },
  { n: "sourcing", tenants: 88, runs: "180k", cost: 3400, status: "deployed", err: 0.8 },
  { n: "offer", tenants: 110, runs: "42k", cost: 900, status: "deployed", err: 0.3 },
  { n: "scheduling", tenants: 124, runs: "320k", cost: 1600, status: "paused", err: 0.1 },
];

const PROMPTS = {
  agents: ["candidate-screener", "jd-author", "bias-auditor", "copilot", "offer"],
  current: { agent: "candidate-screener", version: "v4.2", deployed: "May 24", author: "platform@cdc", tenants: 142,
    text: "You are an expert technical recruiter evaluating a candidate against a job's requirements.\n\nGiven the résumé, extracted skills, and the requirements (including admin-defined custom fields), produce:\n- An overall score 0 to 100 and a match percentage\n- A result: PASS / REVIEW / FAIL\n- Per-requirement findings with evidence cited from the résumé\n- A confidence score (0 to 1); flag for human review when < 0.70\n\nNever auto-reject. The human is the decider. Do not consider name, gender, age, race, or school as ranking factors." },
  versions: [
    { v: "v4.2", date: "May 24", author: "platform@cdc", live: true, note: "Added custom-field weighting" },
    { v: "v4.1", date: "May 02", author: "platform@cdc", note: "Stronger evidence-citation requirement" },
    { v: "v4.0", date: "Apr 18", author: "j.okoro@cdc", note: "Confidence threshold → 0.70" },
    { v: "v3.8", date: "Mar 30", author: "platform@cdc", note: "Bias-language guardrails" },
  ],
};

const PLAN_REQUESTS = [
  { id: "pr1", tenant: "Helios Robotics", from: "STARTER", to: "PROFESSIONAL", by: "ops@helios.co", when: "2h", reason: "Hit seat + résumé limits", mrr: "+$250" },
  { id: "pr2", tenant: "Quanta Bio", from: "STARTER", to: "PROFESSIONAL", by: "hr@quanta.bio", when: "5h", reason: "Need all agents for Q3 hiring", mrr: "+$250" },
  { id: "pr3", tenant: "Meridian Studio", from: "FREE", to: "STARTER", by: "founder@meridian.io", when: "1d", reason: "Growing past 10 résumés/mo", mrr: "+$149" },
  { id: "pr4", tenant: "Orbital Freight", from: "PROFESSIONAL", to: "ENTERPRISE", by: "talent@orbital.com", when: "2d", reason: "SSO + integrations required", mrr: "Custom" },
];

const PLAT_AUDIT = [
  { who: "super@cdc", act: "impersonated Atlas Health Group (1h session)", t: "12m", kind: "impersonation" },
  { who: "platform@cdc", act: "deployed prompt candidate-screener v4.2 to 142 tenants", t: "1h", kind: "deploy", ai: true },
  { who: "system", act: "paused scheduling agent for Vertex Capital (cost over budget)", t: "3h", kind: "killswitch", ai: true },
  { who: "super@cdc", act: "approved plan upgrade, Helios Robotics → Professional", t: "5h", kind: "billing" },
  { who: "bias-auditor", act: "degraded health alert raised across 96 tenants", t: "6h", kind: "alert", ai: true },
  { who: "j.okoro@cdc", act: "rolled back copilot prompt to v3.9 for Atlas (tenant request)", t: "1d", kind: "deploy", ai: true },
];

/* ---- Group L ---- */
const NOTIF_PREFS = [
  { cat: "Screening verdicts", desc: "When an AI screening completes or is flagged", email: true, sms: false, inapp: true, ai: true },
  { cat: "Decisions awaiting you", desc: "Offers and approvals that need your sign-off", email: true, sms: true, inapp: true },
  { cat: "Interview scheduled", desc: "New or changed interviews on your calendar", email: true, sms: false, inapp: true },
  { cat: "Candidate replies", desc: "Messages from candidates in your pipeline", email: true, sms: false, inapp: true },
  { cat: "Compliance alerts", desc: "Adverse-impact and audit notifications", email: true, sms: true, inapp: true, ai: true },
  { cat: "Weekly digest", desc: "A Monday summary of your pipeline", email: true, sms: false, inapp: false },
];

const MOBILITY = [
  { name: "Ruth Nakamura", ini: "RN", cur: "Backend Engineer", tenure: "2.4 yr", match: 91, to: "Engineering Manager, Payments", reqId: "REQ-4760", skills: ["Leadership", "Go", "Payments"], ai: true },
  { name: "Diego Santos", ini: "DS", cur: "Data Engineer", tenure: "1.8 yr", match: 84, to: "Senior Data Engineer", reqId: "REQ-4771", skills: ["Spark", "dbt", "Python"] },
  { name: "Grace Park", ini: "GP", cur: "Product Designer", tenure: "3.1 yr", match: 88, to: "Staff Product Designer", reqId: "REQ-4810", skills: ["Systems", "Research", "Prototyping"] },
  { name: "Sam Okafor", ini: "SO", cur: "Security Engineer", tenure: "2.0 yr", match: 79, to: "Security Lead", reqId: "REQ-4725", skills: ["AppSec", "Cloud", "Mentoring"] },
];

const PLAT_JOBS = [
  { title: "Senior Backend Engineer", reqId: "REQ-4821", board: "Public + LinkedIn", status: "published", apps: 42, views: 1840, posted: "May 24" },
  { title: "Staff Product Designer", reqId: "REQ-4810", board: "Public", status: "published", apps: 38, views: 1210, posted: "May 21" },
  { title: "Platform Engineer", reqId: "REQ-4799", board: "Public + Job boards", status: "published", apps: 31, views: 980, posted: "May 18" },
  { title: "Growth Marketing Lead", reqId: "REQ-4788", board: "Public", status: "published", apps: 28, views: 760, posted: "May 16" },
  { title: "Data Engineer", reqId: "REQ-4771", board: ", ", status: "draft", apps: 0, views: 0, posted: ", " },
];

Object.assign(window, { TENANTS, PLAT_KPIS, PLAT_AGENTS, PROMPTS, PLAN_REQUESTS, PLAT_AUDIT, NOTIF_PREFS, MOBILITY, PLAT_JOBS });
