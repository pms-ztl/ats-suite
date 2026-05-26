/**
 * Plan limits — billing-service is the canonical source of truth.
 * All other services that need plan-gating call billing-service via REST.
 */
export interface PlanLimits {
  seats: number;
  activeJobs: number;
  resumesPerMonth: number;
  bulkUploadMax: number;
  agents: readonly string[] | "ALL";
  customForms: boolean;
  configurableRounds: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    seats: 1, activeJobs: 3, resumesPerMonth: 10, bulkUploadMax: 25,
    agents: ["resume-parser"],
    customForms: false, configurableRounds: false,
  },
  STARTER: {
    seats: 5, activeJobs: 20, resumesPerMonth: 500, bulkUploadMax: 100,
    agents: ["resume-parser", "candidate-screener", "interview-scheduler"],
    customForms: true, configurableRounds: true,
  },
  PROFESSIONAL: {
    seats: 15, activeJobs: -1, resumesPerMonth: 5000, bulkUploadMax: 500,
    agents: "ALL",
    customForms: true, configurableRounds: true,
  },
  ENTERPRISE: {
    seats: -1, activeJobs: -1, resumesPerMonth: -1, bulkUploadMax: 1000,
    agents: "ALL",
    customForms: true, configurableRounds: true,
  },
};

export const ALL_AGENT_TYPES = [
  "resume-parser", "candidate-screener", "jd-author",
  "interview-scheduler", "interview-kit", "interview-intelligence",
  "candidate-assistant", "sourcing", "offer", "analytics",
  "bias-auditor", "copilot",
];

export function isUnlimited(n: number): boolean { return n === -1; }

export function isPlanAgentEnabled(plan: string, agentType: string): boolean {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return false;
  const allowed = limits.agents;
  if (allowed === "ALL") return true;
  return (allowed as readonly string[]).includes(agentType);
}

export function canParseMoreResumes(plan: string, monthCount: number, addingN = 1): boolean {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return false;
  const limit = limits.resumesPerMonth;
  if (isUnlimited(limit)) return true;
  return monthCount + addingN <= limit;
}
