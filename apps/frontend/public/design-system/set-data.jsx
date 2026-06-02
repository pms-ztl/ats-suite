/* set-data.jsx, Settings + Billing (Group I) data */

const TEAM = [
  { name: "Avery Chen", ini: "AC", email: "avery@northwind.co", role: "Admin", status: "active", last: "now" },
  { name: "Jordan Lee", ini: "JL", email: "jordan@northwind.co", role: "Hiring Manager", status: "active", last: "2h" },
  { name: "Sam Okafor", ini: "SO", email: "sam@northwind.co", role: "Recruiter", status: "active", last: "1d" },
  { name: "Maya Idris", ini: "MI", email: "maya@northwind.co", role: "Compliance Officer", status: "active", last: "3h" },
  { name: "Grace Park", ini: "GP", email: "grace@northwind.co", role: "Interviewer", status: "active", last: "5d" },
  { name: "Tomas Reyes", ini: "TR", email: "tomas@northwind.co", role: "Recruiter", status: "invited", last: ", " },
];
const ROLE_NAMES = ["Admin", "Recruiter", "Hiring Manager", "Interviewer", "Compliance"];
const PERMISSIONS = [
  { area: "Requisitions", caps: [true, true, true, false, false] },
  { area: "Candidates", caps: [true, true, true, "view", false] },
  { area: "Screening / AI", caps: [true, true, true, false, "view"] },
  { area: "Interviews & feedback", caps: [true, true, true, true, false] },
  { area: "Decisions & offers", caps: [true, true, true, false, false] },
  { area: "Compliance & audit", caps: [true, false, false, false, true] },
  { area: "Billing & plan", caps: [true, false, false, false, false] },
  { area: "Team & settings", caps: [true, false, false, false, false] },
];

const SSO_PROVIDERS = [
  { n: "Okta", st: "connected", detail: "SAML 2.0 · 142 users", icon: "shield" },
  { n: "Google Workspace", st: "available", detail: "OIDC", icon: "shield" },
  { n: "Microsoft Entra ID", st: "available", detail: "SAML / OIDC", icon: "shield" },
];
const EMAIL_TEMPLATES = [
  { n: "Interview invitation", edited: "May 22", on: true },
  { n: "Offer letter", edited: "May 18", on: true },
  { n: "Rejection (post-screen)", edited: "May 10", on: true },
  { n: "Status update", edited: "Apr 28", on: true },
  { n: "Application received", edited: "Apr 12", on: false },
];
const INTEGRATIONS = [
  { n: "Slack", cat: "Notifications", st: "connected", icon: "bolt" },
  { n: "Workday", cat: "HRIS", st: "connected", icon: "building" },
  { n: "Google Calendar", cat: "Scheduling", st: "connected", icon: "calendar" },
  { n: "LinkedIn", cat: "Sourcing", st: "available", icon: "radar" },
  { n: "Greenhouse", cat: "ATS sync", st: "available", icon: "briefcase" },
  { n: "Checkr", cat: "Background check", st: "available", icon: "shield" },
];
const API_KEYS = [
  { name: "Production", prefix: "cdc_live_8f3a…b21", created: "Mar 2026", last: "2m ago", scopes: "read, write" },
  { name: "Analytics export", prefix: "cdc_live_2k9d…7c4", created: "Apr 2026", last: "1d ago", scopes: "read" },
];
const FEATURE_FLAGS = [
  { f: "Agentic screening (ReAct)", on: true, plan: "Professional" },
  { f: "Copilot assistant", on: true, plan: "Professional" },
  { f: "Internal mobility engine", on: false, plan: "Enterprise", locked: true },
  { f: "Custom application forms", on: true, plan: "Starter" },
  { f: "Bias auditor (agentic)", on: true, plan: "Professional" },
  { f: "SSO / SAML", on: false, plan: "Enterprise", locked: true },
];
const RETENTION = [
  { d: "Candidate data", period: "24 months", note: "After last activity" },
  { d: "Rejected applications", period: "12 months", note: "GDPR minimum" },
  { d: "Audit logs", period: "7 years", note: "Compliance requirement" },
  { d: "Résumé files", period: "24 months", note: "Auto-purged" },
];

const BILLING = {
  plan: "PROFESSIONAL", price: 399, cycle: "month", renews: "Jun 24, 2026",
  usage: [
    { k: "Seats", used: 12, limit: 15 },
    { k: "Résumés this month", used: 3180, limit: 5000 },
    { k: "Active jobs", used: 38, limit: "Unlimited" },
    { k: "AI agent runs", used: 8420, limit: 50000 },
  ],
  invoices: [
    { id: "INV-2026-005", date: "May 24, 2026", amount: 399, status: "Paid" },
    { id: "INV-2026-004", date: "Apr 24, 2026", amount: 399, status: "Paid" },
    { id: "INV-2026-003", date: "Mar 24, 2026", amount: 399, status: "Paid" },
    { id: "INV-2026-002", date: "Feb 24, 2026", amount: 149, status: "Paid" },
  ],
  tiers: [
    { n: "STARTER", price: 149, feats: ["5 seats", "20 jobs", "500 résumés/mo", "Core agents"], cur: false },
    { n: "PROFESSIONAL", price: 399, feats: ["15 seats", "Unlimited jobs", "5,000 résumés/mo", "All 12 agents"], cur: true },
    { n: "ENTERPRISE", price: null, feats: ["Unlimited seats", "SSO / SAML", "Integrations", "Dedicated support"], cur: false },
  ],
};

Object.assign(window, { TEAM, ROLE_NAMES, PERMISSIONS, SSO_PROVIDERS, EMAIL_TEMPLATES, INTEGRATIONS, API_KEYS, FEATURE_FLAGS, RETENTION, BILLING });
