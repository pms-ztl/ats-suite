import { z } from "zod";

// ── Module E — Hire / approve / offer / reject lifecycle events ───────────────
// Emitted by candidate-service when a recruiter drives the terminal decision.
// notification-service subscribes to send the candidate + stakeholder comms and
// onboarding-service subscribes to offer.accepted / application.hired to open an
// onboarding case. All payloads are tenant-scoped (the subject also encodes it).

export const ApplicationHiredPayloadSchema = z.object({
  tenantId: z.string(),
  applicationId: z.string(),
  candidateId: z.string(),
  requisitionId: z.string().nullable(),
  candidateName: z.string().nullable(),
  candidateEmail: z.string().email().nullable(),
  jobTitle: z.string().nullable(),
  /** User id of the recruiter/hiring manager who approved. */
  decidedByUserId: z.string().nullable(),
  /** Stakeholder user ids to notify (hiring manager, recruiter, …). */
  stakeholderUserIds: z.array(z.string()).default([]),
});
export type ApplicationHiredPayload = z.infer<typeof ApplicationHiredPayloadSchema>;

export const OfferApprovedPayloadSchema = z.object({
  tenantId: z.string(),
  offerId: z.string(),
  applicationId: z.string().nullable(),
  candidateId: z.string(),
  candidateName: z.string().nullable(),
  candidateEmail: z.string().email().nullable(),
  jobTitle: z.string().nullable(),
  /** Object-storage key of the rendered offer-letter PDF, if generated. */
  offerLetterKey: z.string().nullable(),
  approvedByUserId: z.string().nullable(),
});
export type OfferApprovedPayload = z.infer<typeof OfferApprovedPayloadSchema>;

export const OfferAcceptedPayloadSchema = z.object({
  tenantId: z.string(),
  offerId: z.string(),
  applicationId: z.string().nullable(),
  candidateId: z.string(),
  candidateName: z.string().nullable(),
  candidateEmail: z.string().email().nullable(),
  jobTitle: z.string().nullable(),
  /** When the candidate accepted (ISO). */
  acceptedAt: z.string().datetime().nullable(),
});
export type OfferAcceptedPayload = z.infer<typeof OfferAcceptedPayloadSchema>;

export const ApplicationRejectedPayloadSchema = z.object({
  tenantId: z.string(),
  applicationId: z.string(),
  candidateId: z.string(),
  candidateName: z.string().nullable(),
  candidateEmail: z.string().email().nullable(),
  jobTitle: z.string().nullable(),
  /** Reason-code label surfaced to the candidate-experience layer (never raw notes). */
  reason: z.string().nullable(),
  decidedByUserId: z.string().nullable(),
});
export type ApplicationRejectedPayload = z.infer<typeof ApplicationRejectedPayloadSchema>;
