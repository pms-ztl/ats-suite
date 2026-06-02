/* data.jsx, workspaces, roles, role-gated nav, notifications, palette, agents */

const ROLES = {
  admin:              { label: "Tenant Admin",       short: "Admin",      hue: "var(--brand)" },
  recruiter:          { label: "Recruiter",          short: "Recruiter",  hue: "var(--info)" },
  hiring_manager:     { label: "Hiring Manager",     short: "Hiring Mgr", hue: "var(--ai)" },
  interviewer:        { label: "Interviewer",        short: "Interviewer",hue: "var(--ok)" },
  compliance_officer: { label: "Compliance Officer", short: "Compliance", hue: "var(--warn)" },
  super_admin:        { label: "Super Admin",        short: "Platform",   hue: "var(--danger)" },
};

const WORKSPACES = [
  { id: "northwind",  name: "Northwind Talent",   slug: "northwind", plan: "PROFESSIONAL", initials: "NT", color: "var(--brand)", seats: "12 / 15", role: "admin", invites: 2 },
  { id: "helios",     name: "Helios Robotics",    slug: "helios",    plan: "STARTER",      initials: "HR", color: "var(--info)",  seats: "5 / 5",  role: "recruiter", invites: 0 },
  { id: "atlas",      name: "Atlas Health Group",  slug: "atlas",    plan: "ENTERPRISE",   initials: "AH", color: "var(--ai)",    seats: "240 seats", role: "compliance_officer", invites: 1 },
  { id: "meridian",   name: "Meridian Studio",    slug: "meridian",  plan: "FREE",         initials: "MS", color: "var(--warn)",  seats: "1 / 1",  role: "hiring_manager", invites: 0 },
];

/* AI items carry ai:true → violet accent dot, marking machine surfaces */
const NAV = [
  { section: null, items: [
    { id: "home",        label: "Home",            icon: "home",       roles: ["admin","recruiter","hiring_manager","interviewer","compliance_officer","super_admin"] },
    { id: "design",      label: "Design System",   icon: "swatch",     roles: ["admin","recruiter","hiring_manager","interviewer","compliance_officer","super_admin"] },
  ]},
  { section: "Hiring", items: [
    { id: "candidates",  label: "Candidates",      icon: "users",      roles: ["admin","recruiter","hiring_manager"], count: 1284 },
    { id: "requisitions",label: "Requisitions",    icon: "briefcase",  roles: ["admin","recruiter","hiring_manager"], count: 38 },
    { id: "sourcing",    label: "Sourcing",        icon: "radar",      roles: ["admin","recruiter"], ai: true },
    { id: "jobs",        label: "Job Postings",    icon: "rocket",     roles: ["admin","recruiter"] },
    { id: "screening",   label: "Screening",       icon: "scan",       roles: ["admin","recruiter","hiring_manager"], ai: true, count: 26 },
    { id: "interviews",  label: "Interviews",      icon: "calendar",   roles: ["admin","recruiter","hiring_manager","interviewer"] },
    { id: "scheduling",  label: "Scheduling",      icon: "clock",      roles: ["admin","recruiter","hiring_manager"] },
    { id: "decisions",   label: "Decisions",       icon: "gavel",      roles: ["admin","recruiter","hiring_manager"], count: 7 },
    { id: "offers",      label: "Offers",          icon: "fileText",   roles: ["admin","recruiter","hiring_manager"] },
  ]},
  { section: "Intelligence", items: [
    { id: "copilot",     label: "Copilot",         icon: "sparkles",   roles: ["admin","recruiter","hiring_manager"], ai: true },
    { id: "hitl",        label: "Review Queue",    icon: "listChecks", roles: ["admin","hiring_manager","compliance_officer"], ai: true, count: 9 },
    { id: "ai",          label: "AI Operations",   icon: "cpu",        roles: ["admin","compliance_officer","super_admin"], ai: true },
    { id: "analytics",   label: "Analytics",       icon: "chart",      roles: ["admin","recruiter","hiring_manager","compliance_officer"] },
  ]},
  { section: "Governance", items: [
    { id: "compliance",  label: "Compliance",      icon: "shield",     roles: ["admin","compliance_officer"] },
    { id: "security",    label: "Security",        icon: "shield",     roles: ["admin","compliance_officer"] },
    { id: "audit",       label: "Audit Log",       icon: "scroll",     roles: ["admin","compliance_officer"] },
  ]},
  { section: "Workspace", items: [
    { id: "team",        label: "Team",            icon: "userCog",    roles: ["admin"] },
    { id: "mobility",    label: "Internal Mobility",icon: "mobility",  roles: ["admin","hiring_manager"] },
    { id: "integrations",label: "Integrations",    icon: "plug",       roles: ["admin","recruiter"] },
    { id: "billing",     label: "Billing & Plan",  icon: "card",       roles: ["admin"] },
    { id: "settings",    label: "Settings",        icon: "settings",   roles: ["admin"] },
    { id: "support",     label: "Support",         icon: "lifebuoy",   roles: ["admin"] },
  ]},
  { section: "Platform", platform: true, items: [
    { id: "tenants",     label: "Tenants",         icon: "building",   roles: ["super_admin"], count: 142 },
    { id: "pagents",     label: "Platform Agents", icon: "server",     roles: ["super_admin"], ai: true },
    { id: "pcost",       label: "Cost Analytics",  icon: "chart",      roles: ["super_admin"] },
    { id: "prompts",     label: "Agent Prompts",   icon: "terminal",   roles: ["super_admin"], ai: true },
    { id: "preq",        label: "Plan Requests",   icon: "inbox",      roles: ["super_admin"], count: 4 },
    { id: "paudit",      label: "Platform Audit",  icon: "scroll",     roles: ["super_admin"] },
  ]},
];

const PLAN_META = {
  FREE:         { tone: "var(--ink-3)",  bg: "var(--surface-3)" },
  STARTER:      { tone: "var(--info)",   bg: "var(--info-tint)" },
  PROFESSIONAL: { tone: "var(--brand)",  bg: "var(--brand-tint)" },
  ENTERPRISE:   { tone: "var(--ai)",     bg: "var(--ai-tint)" },
};

const NOTIFS = [
  { group: "Needs your review", items: [
    { id: 1, ai: true, icon: "scan", title: "Screening flagged for human review", body: "Priya Raman · Sr. Backend Engineer · confidence 0.61, borderline on 2 requirements.", time: "4m", action: "Open evidence", unread: true },
    { id: 2, icon: "gavel", title: "Offer awaiting your approval", body: "Marcus Bell · Staff Designer · $182,000 base, 0.18% equity.", time: "22m", action: "Review offer", unread: true },
    { id: 3, ai: true, icon: "shield", title: "Adverse-impact alert", body: "Phone-screen stage selection ratio 0.74, below the 0.80 four-fifths threshold.", time: "1h", action: "View fairness", unread: true },
  ]},
  { group: "Earlier today", items: [
    { id: 4, icon: "calendar", title: "Panel confirmed", body: "Technical loop for Dana Osei scheduled Thu 2:00 PM with 3 panelists.", time: "3h", action: "View interview" },
    { id: 5, ai: true, icon: "sparkles", title: "JD drafted by jd-author", body: "“Principal Data Scientist”, inclusivity score 92, 1 bias flag remaining.", time: "5h", action: "Open draft" },
    { id: 6, icon: "users", title: "412 résumés ingested", body: "Bulk import for Growth Marketing Lead finished, 0 errors.", time: "6h", action: "View candidates" },
  ]},
];

const AGENTS = [
  { id: "candidate-screener", n: "candidate-screener", d: "Scores candidates against requirements", runs: "12.4k", status: "healthy" },
  { id: "jd-author",          n: "jd-author",          d: "Inclusive, bias-checked job descriptions", runs: "3.1k", status: "healthy" },
  { id: "resume-parser",      n: "resume-parser",      d: "Structured fields from résumé text", runs: "48.7k", status: "healthy" },
  { id: "resume-verifier",    n: "resume-verifier",    d: "Verifies claims, gaps, GitHub corroboration", runs: "2.2k", status: "healthy" },
  { id: "bias-auditor",       n: "bias-auditor",       d: "Four-fifths adverse-impact narrative", runs: "640", status: "watch" },
  { id: "sourcing",           n: "sourcing",           d: "Ranks & shortlists candidate pools", runs: "5.8k", status: "healthy" },
  { id: "interview-kit",      n: "interview-kit",      d: "Round questions + scoring rubric", runs: "1.9k", status: "healthy" },
  { id: "interview-intelligence", n: "interview-intelligence", d: "Transcript → structured scorecard", runs: "1.1k", status: "healthy" },
  { id: "interview-questions",n: "interview-questions", d: "Cited, candidate-specific questions", runs: "2.7k", status: "healthy" },
  { id: "candidate-experience", n: "candidate-experience", d: "Candidate status chat assistant", runs: "9.3k", status: "healthy" },
  { id: "copilot",            n: "copilot",            d: "Recruiter pipeline Q&A with citations", runs: "7.5k", status: "healthy" },
  { id: "cover-letter-analyzer", n: "cover-letter-analyzer", d: "Cover-letter signal & red flags", runs: "1.4k", status: "healthy" },
  { id: "offer",              n: "offer",              d: "Drafts comp packages within band", runs: "880", status: "healthy" },
  { id: "scheduling",         n: "scheduling",         d: "Books interviews from availability", runs: "4.0k", status: "healthy" },
  { id: "analytics",          n: "analytics",          d: "Turns metrics into ranked insights", runs: "2.6k", status: "watch" },
];

/* command palette: navigation + actions */
const COMMANDS = [
  { group: "Actions", items: [
    { id: "c-req",   label: "Create requisition",       icon: "plus",     kbd: "C R", ai: false },
    { id: "c-jd",    label: "Generate job description",  icon: "sparkles", kbd: null,  ai: true },
    { id: "c-screen",label: "Run AI screening",          icon: "scan",     kbd: null,  ai: true },
    { id: "c-note",  label: "Add note to candidate",     icon: "fileText", kbd: "N",   ai: false },
    { id: "c-sched", label: "Schedule an interview",     icon: "calendar", kbd: null,  ai: false },
    { id: "c-stage", label: "Move candidate stage",      icon: "gavel",    kbd: null,  ai: false },
    { id: "c-copilot",label:"Ask Copilot…",              icon: "sparkles", kbd: "K",   ai: true },
  ]},
  { group: "Go to", items: [
    { id: "g-cand",  label: "Candidates",   icon: "users",     nav: "candidates" },
    { id: "g-req",   label: "Requisitions", icon: "briefcase", nav: "requisitions" },
    { id: "g-screen",label: "Screening",    icon: "scan",      nav: "screening", ai: true },
    { id: "g-hitl",  label: "Review Queue", icon: "listChecks",nav: "hitl", ai: true },
    { id: "g-comp",  label: "Compliance",   icon: "shield",    nav: "compliance" },
    { id: "g-ana",   label: "Analytics",    icon: "chart",     nav: "analytics" },
  ]},
  { group: "Recent candidates", items: [
    { id: "r-1", label: "Priya Raman",  icon: "dot", meta: "Sr. Backend Engineer · Screening" },
    { id: "r-2", label: "Marcus Bell",  icon: "dot", meta: "Staff Designer · Offer" },
    { id: "r-3", label: "Dana Osei",    icon: "dot", meta: "Platform Engineer · Interview" },
  ]},
];

Object.assign(window, { ROLES, WORKSPACES, NAV, PLAN_META, NOTIFS, AGENTS, COMMANDS });
