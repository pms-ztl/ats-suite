import { z } from "zod";

// ── Module F — Onboarding (Workday-style) ─────────────────────────────────────
// After an offer is accepted, onboarding-service opens an OnboardingCase for the
// hired candidate, seeded from the tenant's onboarding config (tasks + document
// requests + verifications). The candidate completes it from a portal: submits
// PAN, bank account, and documents; each verification runs through a pluggable
// KYC provider (stub by default — clearly "needs API key", never a fake pass).

export const OnboardingCaseStatusSchema = z.enum([
  "PENDING",     // opened, candidate not yet started
  "IN_PROGRESS", // candidate working through tasks
  "BLOCKED",     // a verification failed / awaiting provider
  "COMPLETED",   // all required tasks + verifications done
  "CANCELLED",
]);
export type OnboardingCaseStatus = z.infer<typeof OnboardingCaseStatusSchema>;

export const OnboardingTaskStatusSchema = z.enum(["TODO", "SUBMITTED", "DONE", "WAIVED"]);
export type OnboardingTaskStatus = z.infer<typeof OnboardingTaskStatusSchema>;

export const OnboardingTaskKindSchema = z.enum([
  "PROFILE",       // personal details
  "DOCUMENT",      // upload a document (signed offer, ID, etc.)
  "VERIFICATION",  // PAN / bank / ID verification
  "ACKNOWLEDGE",   // read & acknowledge (policy, handbook)
  "FIRST_DAY",     // logistics (accounts, buddy, etc.)
]);
export type OnboardingTaskKind = z.infer<typeof OnboardingTaskKindSchema>;

export const VerificationTypeSchema = z.enum(["PAN", "BANK_ACCOUNT", "ID"]);
export type VerificationType = z.infer<typeof VerificationTypeSchema>;

export const VerificationStatusSchema = z.enum([
  "NOT_STARTED",
  "PENDING",        // submitted, awaiting provider result
  "VERIFIED",
  "FAILED",
  "NEEDS_PROVIDER",  // no provider configured → honest "needs API key" state
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const OnboardingTaskDTOSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  kind: OnboardingTaskKindSchema,
  title: z.string(),
  description: z.string().nullable(),
  required: z.boolean(),
  status: OnboardingTaskStatusSchema,
  order: z.number().int(),
  completedAt: z.string().datetime().nullable(),
});
export type OnboardingTaskDTO = z.infer<typeof OnboardingTaskDTOSchema>;

export const OnboardingDocumentDTOSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  label: z.string(),
  /** Object-storage key of the uploaded file. */
  storageKey: z.string().nullable(),
  fileName: z.string().nullable(),
  uploadedAt: z.string().datetime().nullable(),
});
export type OnboardingDocumentDTO = z.infer<typeof OnboardingDocumentDTOSchema>;

export const VerificationDTOSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  type: VerificationTypeSchema,
  status: VerificationStatusSchema,
  /** Provider correlation id (when a real KYC provider is wired). */
  providerRef: z.string().nullable(),
  /** Provider name actually used ("stub" by default). */
  provider: z.string().nullable(),
  /** Masked identifier surfaced back to the UI (e.g. "•••• 4321"). */
  maskedValue: z.string().nullable(),
  message: z.string().nullable(),
  verifiedAt: z.string().datetime().nullable(),
});
export type VerificationDTO = z.infer<typeof VerificationDTOSchema>;

export const OnboardingCaseDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  candidateId: z.string().uuid(),
  applicationId: z.string().uuid().nullable(),
  offerId: z.string().uuid().nullable(),
  candidateName: z.string().nullable(),
  candidateEmail: z.string().email().nullable(),
  jobTitle: z.string().nullable(),
  status: OnboardingCaseStatusSchema,
  /** Opaque token for the candidate-facing portal (no auth). */
  portalToken: z.string().min(8),
  startDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  tasks: z.array(OnboardingTaskDTOSchema).default([]),
  documents: z.array(OnboardingDocumentDTOSchema).default([]),
  verifications: z.array(VerificationDTOSchema).default([]),
});
export type OnboardingCaseDTO = z.infer<typeof OnboardingCaseDTOSchema>;

// Candidate-portal submission payloads.
export const SubmitPanSchema = z.object({
  /** Indian PAN format AAAAA9999A. Validated shape; real check is provider-side. */
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format"),
  nameOnPan: z.string().min(1).max(120),
});
export type SubmitPan = z.infer<typeof SubmitPanSchema>;

export const SubmitBankAccountSchema = z.object({
  accountNumber: z.string().min(6).max(20),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  accountHolder: z.string().min(1).max(120),
  bankName: z.string().min(1).max(120).optional(),
});
export type SubmitBankAccount = z.infer<typeof SubmitBankAccountSchema>;
