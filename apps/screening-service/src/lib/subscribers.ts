/**
 * NATS subscribers for screening-service.
 *   tenant.{*}.resume.parsed → enqueue a screening for each active application
 */
import { subscribeToEvents } from "@cdc-ats/nats-client";
import { ResumeParsedPayloadSchema } from "@cdc-ats/contracts";
import { enqueueScreening } from "./queue.js";
import { fetchCandidateApplications } from "./service-client.js";
import type { Logger } from "pino";

export async function startScreeningSubscribers(logger: Logger) {
  await subscribeToEvents({
    stream: "RESUME_EVENTS",
    subject: "tenant.*.resume.parsed",
    durable: "screening-service:resume-parsed",
    logger,
    handler: async (envelope) => {
      const payload = ResumeParsedPayloadSchema.parse(envelope.payload);

      // Phase 6b: fetch real applications from candidate-service and
      // enqueue ONE screening per ACTIVE application for this candidate.
      const apps = await fetchCandidateApplications(payload.candidateId, payload.tenantId);
      const activeApps = (apps ?? []).filter((a) => a.status === "ACTIVE");

      if (activeApps.length === 0) {
        logger.info(
          { candidateId: payload.candidateId },
          "resume.parsed: candidate has no active applications — skipping screening"
        );
        return;
      }

      for (const app of activeApps) {
        await enqueueScreening({
          candidateId: payload.candidateId,
          requisitionId: app.requisitionId,
          tenantId: payload.tenantId,
          userId: "system",
          resumeId: payload.resumeId,
        });
      }
      logger.info(
        { candidateId: payload.candidateId, screeningsEnqueued: activeApps.length },
        "Enqueued screenings per active application on resume.parsed"
      );
    },
  });
  logger.info("screening-service NATS subscribers started");
}
