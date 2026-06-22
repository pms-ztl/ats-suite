/**
 * Module F — onboarding triggers. When an offer is accepted (or a candidate is
 * marked hired), open an onboarding case for them. Idempotent per candidate.
 */
import { subscribeToEvents } from "@cdc-ats/nats-client";
import { OfferAcceptedPayloadSchema, ApplicationHiredPayloadSchema } from "@cdc-ats/contracts";
import type { Logger } from "pino";
import { openCase } from "./lib/case-service.js";

export async function startOnboardingSubscribers(logger: Logger) {
  await subscribeToEvents({
    stream: "CANDIDATE_EVENTS",
    subject: "tenant.*.offer.accepted",
    durable: "onboarding-service:offer-accepted",
    logger,
    handler: async (envelope) => {
      const p = OfferAcceptedPayloadSchema.parse(envelope.payload);
      const { created } = await openCase({
        tenantId: p.tenantId,
        candidateId: p.candidateId,
        applicationId: p.applicationId,
        offerId: p.offerId,
        candidateName: p.candidateName,
        candidateEmail: p.candidateEmail,
        jobTitle: p.jobTitle,
      });
      logger.info({ candidateId: p.candidateId, created }, "onboarding case ensured (offer.accepted)");
    },
  });

  // Fallback trigger: some flows mark HIRED directly without a separate accept.
  await subscribeToEvents({
    stream: "CANDIDATE_EVENTS",
    subject: "tenant.*.application.hired",
    durable: "onboarding-service:application-hired",
    logger,
    handler: async (envelope) => {
      const p = ApplicationHiredPayloadSchema.parse(envelope.payload);
      const { created } = await openCase({
        tenantId: p.tenantId,
        candidateId: p.candidateId,
        applicationId: p.applicationId,
        candidateName: p.candidateName,
        candidateEmail: p.candidateEmail,
        jobTitle: p.jobTitle,
      });
      logger.info({ candidateId: p.candidateId, created }, "onboarding case ensured (application.hired)");
    },
  });
}
