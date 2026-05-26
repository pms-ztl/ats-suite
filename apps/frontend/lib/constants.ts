export const APP_NAME = "CDC ATS";
export const APP_DESCRIPTION = "AI-Powered Applicant Tracking System";

export const ROLES = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  HIRING_MANAGER: "hiring_manager",
  COMPLIANCE_OFFICER: "compliance_officer",
  CANDIDATE: "candidate",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  critical: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  archived: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  draft: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  review: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  rejected: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  in_progress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  overdue: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  compliant: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  non_compliant: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  pass: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  fail: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  high: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  low: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  sent: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  accepted: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  declined: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  pending_approval: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

export const CHART_COLORS = [
  "#4F46E5", // indigo
  "#10B981", // emerald
  "#F59E0B", // amber
  "#F43F5E", // rose
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo-lighter
];

export const PAGE_SIZES = [25, 50, 100] as const;

export const SIDEBAR_CATEGORIES = [
  { key: "platform", label: "Core Platform", icon: "LayoutDashboard", path: "/platform" },
  { key: "security", label: "Security & Privacy", icon: "Shield", path: "/security" },
  { key: "compliance", label: "Compliance & Governance", icon: "Scale", path: "/compliance" },
  { key: "ai", label: "AI/ML Operations", icon: "Brain", path: "/ai" },
  { key: "analytics", label: "Analytics & Reporting", icon: "BarChart3", path: "/analytics" },
  { key: "candidates", label: "Candidate Experience", icon: "Users", path: "/candidates" },
  { key: "interviews", label: "Interview Management", icon: "Video", path: "/interviews" },
  { key: "screening", label: "Screening & Assessment", icon: "ClipboardCheck", path: "/screening" },
  { key: "sourcing", label: "Sourcing", icon: "Search", path: "/sourcing" },
  { key: "decisions", label: "Decision & Offer", icon: "CheckCircle2", path: "/decisions" },
  { key: "offers", label: "Offers", icon: "FileText", path: "/offers" },
  { key: "mobility", label: "Internal Mobility", icon: "ArrowUpRight", path: "/mobility" },
  { key: "integrations", label: "Integrations", icon: "Plug", path: "/integrations" },
  { key: "scheduling", label: "Scheduling", icon: "Calendar", path: "/scheduling" },
  { key: "onboarding", label: "Onboarding", icon: "Rocket", path: "/onboarding" },
] as const;

export const CATEGORY_FEATURES_COUNT: Record<string, number> = {
  platform: 34,
  security: 65,
  compliance: 203,
  ai: 107,
  analytics: 97,
  candidates: 86,
  interviews: 58,
  screening: 60,
  sourcing: 52,
  decisions: 49,
  mobility: 45,
  integrations: 45,
  offers: 12,
  scheduling: 16,
  onboarding: 10,
};

const ALL_CATEGORIES = ["platform", "security", "compliance", "ai", "analytics", "candidates", "interviews", "screening", "sourcing", "decisions", "offers", "mobility", "integrations", "scheduling", "onboarding"];

// Both UPPERCASE (backend enum) and lowercase (legacy) keys for compatibility.
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  // Platform tier — sees everything
  SUPER_ADMIN: ALL_CATEGORIES,
  super_admin: ALL_CATEGORIES,
  // Tier 2 — Tenant Admin (semantic alias for ADMIN)
  ADMIN: ALL_CATEGORIES,
  admin: ALL_CATEGORIES,
  // Tier 3 — Staff
  RECRUITER: ["sourcing", "screening", "candidates", "interviews", "scheduling", "decisions", "offers", "analytics"],
  recruiter: ["sourcing", "screening", "candidates", "interviews", "scheduling", "decisions", "offers", "analytics"],
  HIRING_MANAGER: ["interviews", "decisions", "offers", "analytics", "candidates"],
  hiring_manager: ["interviews", "decisions", "offers", "analytics", "candidates"],
  INTERVIEWER: ["interviews", "candidates"],
  interviewer: ["interviews", "candidates"],
  // Cross-cutting
  COMPLIANCE_OFFICER: ["compliance", "security", "ai", "analytics"],
  compliance_officer: ["compliance", "security", "ai", "analytics"],
  CANDIDATE: [],
  candidate: [],
};
