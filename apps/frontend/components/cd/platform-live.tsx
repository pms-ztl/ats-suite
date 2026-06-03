"use client";
// components/cd/platform-live.tsx
// Mounts the byte-exact CD super-admin platform-operator screens (PlatformScreens +
// AiSurfaceScreens.PlatformCostScreen) on the /admin/* routes. The platform gateway
// is not wired for this operator surface, so the data is the design's example
// content. These routes are super-admin-gated by app/(dashboard)/admin/layout.tsx
// (Admins get AccessDenied), and were verified by tsc + build only (no super-admin
// login available to verify visually).
import { TenantsScreen, PlatformAgentsScreen, PromptsScreen, PlanRequestsScreen, PlatformAuditScreen } from "./PlatformScreens";
import { PlatformCostScreen } from "./AiSurfaceScreens";
import type { TenantsData, PlatformAgentsData, PromptsData, PlanRequestsData, PlatformAuditData, PlatformCostData } from "./types";

const TENANTS_DATA: TenantsData = {
  summary: "9 active workspaces across 4 plans. $52.4k MRR, up 12 percent this month.",
  kpis: [
    { label: "Active tenants", value: 9, icon: "building", spark: [6, 6, 7, 7, 8, 8, 9, 9], delta: 2, good: true },
    { label: "MRR", value: 52400, prefix: "$", icon: "card", spark: [44000, 46000, 47500, 49000, 50200, 51000, 51800, 52400], delta: 8, good: true },
    { label: "AI cost (mo)", value: 9120, prefix: "$", icon: "cpu", ai: true, spark: [7600, 7900, 8200, 8500, 8700, 8900, 9000, 9120], delta: 6, good: false },
    { label: "Avg tenant health", value: 92, suffix: "%", icon: "check", spark: [88, 89, 90, 90, 91, 91, 92, 92], delta: 1, good: true },
  ],
  tenants: [
    { id: "t1", name: "Pinnacle Tech", slug: "pinnacle", created: "Jan 2026", plan: "FREE", users: 1, mrr: 0, cost: 12, runs: "1.2k", health: "healthy" },
    { id: "t2", name: "Northwind Talent", slug: "northwind", created: "Nov 2025", plan: "PROFESSIONAL", users: 14, mrr: 999, cost: 1840, runs: "182k", health: "healthy" },
    { id: "t3", name: "Apex Robotics", slug: "apex", created: "Sep 2025", plan: "ENTERPRISE", users: 62, mrr: 4200, cost: 3120, runs: "640k", health: "watch" },
    { id: "t4", name: "Lumen Health", slug: "lumen", created: "Aug 2025", plan: "ENTERPRISE", users: 48, mrr: 4200, cost: 2010, runs: "410k", health: "healthy" },
    { id: "t5", name: "Cedar Finance", slug: "cedar", created: "Dec 2025", plan: "STARTER", users: 6, mrr: 299, cost: 220, runs: "38k", health: "healthy" },
    { id: "t6", name: "Vela Logistics", slug: "vela", created: "Oct 2025", plan: "PROFESSIONAL", users: 11, mrr: 999, cost: 1280, runs: "96k", health: "over" },
    { id: "t7", name: "Bright Labs", slug: "bright", created: "Feb 2026", plan: "STARTER", users: 4, mrr: 299, cost: 140, runs: "21k", health: "healthy" },
  ],
};

const AGENTS_DATA: PlatformAgentsData = {
  agents: [
    { n: "candidate-screener", tenants: 9, runs: "1.2M", cost: 4200, err: 0.4, status: "deployed" },
    { n: "resume-parser", tenants: 9, runs: "3.8M", cost: 2100, err: 0.2, status: "deployed" },
    { n: "jd-author", tenants: 8, runs: "240k", cost: 1180, err: 0.6, status: "deployed" },
    { n: "bias-auditor", tenants: 8, runs: "61k", cost: 540, err: 1.8, status: "degraded" },
    { n: "copilot", tenants: 7, runs: "520k", cost: 1620, err: 0.5, status: "deployed" },
    { n: "analytics", tenants: 6, runs: "180k", cost: 410, err: 1.1, status: "deployed" },
    { n: "offer", tenants: 5, runs: "44k", cost: 190, err: 0.3, status: "deployed" },
    { n: "scheduling", tenants: 6, runs: "88k", cost: 260, err: 0.4, status: "paused" },
  ],
};

const PROMPTS_DATA: PromptsData = {
  agents: ["candidate-screener", "jd-author", "bias-auditor", "copilot", "offer"],
  current: {
    agent: "candidate-screener",
    tenants: 9,
    text: "You are an expert technical recruiter. Score each candidate against the requirements provided, one weighted row per requirement. Cite evidence from the resume for every claim. Never infer protected attributes. Flag for human review when confidence is below 0.70.",
  },
  versions: [
    { v: "v7", note: "Add per-requirement evidence citations", date: "May 28, 2026", author: "platform-ops", live: true },
    { v: "v6", note: "Lower auto-advance confidence to 0.70", date: "May 12, 2026", author: "platform-ops" },
    { v: "v5", note: "Stricter protected-attribute guardrails", date: "Apr 30, 2026", author: "platform-ops" },
    { v: "v4", note: "Initial weighted-rubric rollout", date: "Apr 09, 2026", author: "platform-ops" },
  ],
};

const PLAN_REQUESTS_DATA: PlanRequestsData = {
  requests: [
    { id: "pr1", tenant: "Vela Logistics", from: "PROFESSIONAL", to: "ENTERPRISE", mrr: "+$3,201", reason: "Needs SSO and unlimited seats", by: "ops@vela.co", when: "2h ago" },
    { id: "pr2", tenant: "Cedar Finance", from: "STARTER", to: "PROFESSIONAL", mrr: "+$700", reason: "Hit the 500 resumes/mo cap", by: "talent@cedar.fin", when: "1d ago" },
    { id: "pr3", tenant: "Bright Labs", from: "STARTER", to: "PROFESSIONAL", mrr: "+$700", reason: "Wants all 12 AI agents", by: "hr@bright.io", when: "3d ago" },
  ],
};

const AUDIT_DATA: PlatformAuditData = {
  entries: [
    { who: "platform-ops", act: "Deployed candidate-screener prompt v7 to 9 tenants", kind: "deploy", t: "12m" },
    { who: "platform-ops", act: "Impersonated Northwind Talent for support ticket #4821", kind: "impersonation", t: "1h" },
    { who: "bias-auditor", act: "Raised drift alert on Apex Robotics screening", kind: "alert", ai: true, t: "3h" },
    { who: "platform-ops", act: "Approved Vela Logistics upgrade to Enterprise", kind: "billing", t: "5h" },
    { who: "platform-ops", act: "Paused scheduling agent for Cedar Finance", kind: "killswitch", t: "1d" },
  ],
};

const COST_DATA: PlatformCostData = {
  period: "May 2026",
  kpis: [
    { label: "Total AI spend", value: 9120, prefix: "$", icon: "cpu", ai: true, spark: [7600, 7900, 8200, 8500, 8700, 8900, 9000, 9120], delta: 6, good: false },
    { label: "Cost per hire", value: 41, prefix: "$", icon: "card", spark: [58, 54, 51, 48, 46, 44, 42, 41], delta: -7, good: true },
    { label: "Tokens (mo)", value: 482, suffix: "M", icon: "server", spark: [380, 400, 420, 440, 455, 468, 476, 482], delta: 9, good: false },
    { label: "Budget used", value: 76, suffix: "%", icon: "chart", spark: [60, 63, 66, 69, 71, 73, 75, 76], delta: 4, good: false },
  ],
  agents: [
    { n: "candidate-screener", cost: 4200 },
    { n: "copilot", cost: 1620 },
    { n: "jd-author", cost: 1180 },
    { n: "resume-parser", cost: 2100 },
    { n: "bias-auditor", cost: 540 },
    { n: "analytics", cost: 410 },
    { n: "scheduling", cost: 260 },
    { n: "offer", cost: 190 },
  ],
  tenants: [
    { id: "t3", name: "Apex Robotics", cost: 3120, health: "watch" },
    { id: "t4", name: "Lumen Health", cost: 2010, health: "healthy" },
    { id: "t2", name: "Northwind Talent", cost: 1840, health: "healthy" },
    { id: "t6", name: "Vela Logistics", cost: 1280, health: "over" },
    { id: "t5", name: "Cedar Finance", cost: 220, health: "healthy" },
  ],
  overBudgetNote: "Vela Logistics is over its inference budget this period. Consider an Enterprise upgrade or a per-tenant rate cap.",
};

export function TenantsLive() { return <TenantsScreen data={TENANTS_DATA} />; }
export function PlatformAgentsLive() { return <PlatformAgentsScreen data={AGENTS_DATA} />; }
export function PromptsLive() { return <PromptsScreen data={PROMPTS_DATA} />; }
export function PlanRequestsLive() { return <PlanRequestsScreen data={PLAN_REQUESTS_DATA} />; }
export function PlatformAuditLive() { return <PlatformAuditScreen data={AUDIT_DATA} />; }
export function PlatformCostLive() { return <PlatformCostScreen data={COST_DATA} />; }
