/**
 * Plan limits — copy of monolith's plan-limits.ts that identity-service uses
 * for seat enforcement. In Phase 2 this moves into billing-service and
 * identity-service calls it via HTTP — for Phase 1 we duplicate to avoid
 * circular service dependency before billing-service exists.
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
    seats: 1,
    activeJobs: 3,
    resumesPerMonth: 10,
    bulkUploadMax: 25,
    agents: ["resume-parser"],
    customForms: false,
    configurableRounds: false,
  },
  STARTER: {
    seats: 5,
    activeJobs: 20,
    resumesPerMonth: 500,
    bulkUploadMax: 100,
    agents: ["resume-parser", "candidate-screener", "interview-scheduler"],
    customForms: true,
    configurableRounds: true,
  },
  PROFESSIONAL: {
    seats: 15,
    activeJobs: -1,
    resumesPerMonth: 5000,
    bulkUploadMax: 500,
    agents: "ALL",
    customForms: true,
    configurableRounds: true,
  },
  ENTERPRISE: {
    seats: -1,
    activeJobs: -1,
    resumesPerMonth: -1,
    bulkUploadMax: 1000,
    agents: "ALL",
    customForms: true,
    configurableRounds: true,
  },
};

export function isUnlimited(n: number): boolean {
  return n === -1;
}

export function canAddSeats(plan: string, currentSeats: number, addingN = 1): boolean {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return true;
  const limit = limits.seats;
  if (isUnlimited(limit)) return true;
  return currentSeats + addingN <= limit;
}
