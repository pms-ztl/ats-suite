// Module F — default onboarding checklist seeded onto a new case. A tenant's
// authored onboarding config (tenant-service /internal/onboarding) can refine
// this later; these defaults cover the Workday-style essentials the brief names
// (profile, signed offer, PAN + bank verification, ID, first-day setup).

import type { Prisma } from "../generated/prisma/index.js";

export interface SeedTask {
  kind: "PROFILE" | "DOCUMENT" | "VERIFICATION" | "ACKNOWLEDGE" | "FIRST_DAY";
  title: string;
  description: string;
  required: boolean;
  order: number;
}

export const DEFAULT_TASKS: SeedTask[] = [
  { kind: "PROFILE", title: "Confirm your personal details", description: "Name, contact, address and emergency contact.", required: true, order: 1 },
  { kind: "DOCUMENT", title: "Upload your signed offer letter", description: "The countersigned offer you received.", required: true, order: 2 },
  { kind: "VERIFICATION", title: "Verify your PAN", description: "Permanent Account Number for tax onboarding.", required: true, order: 3 },
  { kind: "VERIFICATION", title: "Add your bank account", description: "Salary account details (account no. + IFSC).", required: true, order: 4 },
  { kind: "DOCUMENT", title: "Upload a government photo ID", description: "Aadhaar / passport / driving licence.", required: true, order: 5 },
  { kind: "ACKNOWLEDGE", title: "Acknowledge the employee handbook", description: "Read and accept company policies.", required: false, order: 6 },
  { kind: "FIRST_DAY", title: "First-day setup", description: "Accounts, access, and your onboarding buddy.", required: false, order: 7 },
];

export const DEFAULT_VERIFICATIONS: Array<"PAN" | "BANK_ACCOUNT" | "ID"> = ["PAN", "BANK_ACCOUNT"];

/** Build the nested create payload for a new case's tasks + verification rows. */
export function buildSeed(tenantId: string): {
  tasks: Prisma.OnboardingTaskCreateWithoutCaseInput[];
  verifications: Prisma.VerificationCreateWithoutCaseInput[];
} {
  return {
    tasks: DEFAULT_TASKS.map((t) => ({
      tenantId,
      kind: t.kind,
      title: t.title,
      description: t.description,
      required: t.required,
      order: t.order,
    })),
    verifications: DEFAULT_VERIFICATIONS.map((type) => ({ tenantId, type, status: "NOT_STARTED" as const })),
  };
}
