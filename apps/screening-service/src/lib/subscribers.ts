/**
 * NATS subscribers for screening-service.
 *   tenant.{*}.resume.parsed → enqueue a screening for each active app
 */
import { subscribeToEvents } from "@cdc-ats/nats-client";
import { ResumeParsedPayloadSchema } from "@cdc-ats/contracts";
import { enqueueScreening } from "./queue.js";
import type { Logger } from "pino";

export async function startScreeningSubscribers(logger: Logger) {
  await subscribeToEvents({
    stream: "RESUME_EVENTS",
    subject: "tenant.*.resume.parsed",
    durable: "screening-service:resume-parsed",
    logger,
    handler: async (envelope) => {
      const payload = ResumeParsedPayloadSchema.parse(envelope.payload);
      // For Phase 3: enqueue ONE screening (placeholder requisitionId).
      // In Phase 3.5 we'll fetch candidate-service applications + screen one per active req.
      await enqueueScreening({
        candidateId: payload.candidateId,
        requisitionId: payload.candidateId, // placeholder — needs real req lookup
        tenantId: payload.tenantId,
        userId: "system",
        resumeId: payload.resumeId,
      });
      logger.info({ candidateId: payload.candidateId }, "Enqueued screening on resume.parsed");
    },
  });
  logger.info("screening-service NATS subscribers started");
}
