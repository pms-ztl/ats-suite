/**
 * applicationCount rollup NATS subscriber (job-service).
 *
 * The EVENT-DRIVEN half of the applicationCount rollup (the periodic sweep lives in
 * application-count-rollup.ts). It observes the REAL application lifecycle events
 * candidate-service publishes and reconciles the affected requisition's
 * JobPosting.applicationCount to the real candidate-service count the instant the
 * pipeline moves — so the denormalized count is fresh right after a stage change
 * without waiting for the next sweep.
 *
 *   tenant.{id}.application.stage.changed -> reconcile that requisition's postings
 *
 * We key on `application.stage.changed` because its payload carries requisitionId
 * (the cross-lane contract: { tenantId, applicationId, candidateId, fromStage,
 * toStage, actorUserId, at } plus this service's requisitionId), and it fires on
 * EVERY transition — including the ones that ride alongside a hire/reject. It does
 * NOT fire on a brand-new accept-fast apply (candidate-service emits no submit
 * event); that gap is covered by the periodic sweep, so between the two drivers the
 * count converges to the real total.
 *
 * The reconcile itself reads the REAL per-requisition count from candidate-service
 * and writes it — this subscriber never increments or fabricates. A publish-storm
 * (many stage changes on one requisition) simply re-reads the same real total; the
 * reconcile is idempotent and a no-op when the stored count already matches.
 *
 * Runs outside any HTTP request -> the reconcile uses the admin (non-RLS) client
 * scoped explicitly by the event's tenantId, like the apply-ingest subscriber.
 */
import { subscribeToEvents, type ActiveSubscription } from "@cdc-ats/nats-client";
import { z } from "zod";
import { reconcileApplicationCountForRequisition } from "./application-count-rollup.js";
import type { Logger } from "pino";

// Defensive parse — we only need tenantId + requisitionId; the rest of the
// stage.changed payload is passed through. requisitionId is nullable in the
// contract (a legacy row may lack it), so we no-op when it is absent.
const StageChangedPayload = z
  .object({
    tenantId: z.string(),
    requisitionId: z.string().nullish(),
  })
  .passthrough();

export async function startApplicationCountSubscribers(logger: Logger): Promise<ActiveSubscription[]> {
  const subs: ActiveSubscription[] = [];

  subs.push(
    await subscribeToEvents({
      stream: "CANDIDATE_EVENTS",
      subject: "tenant.*.application.stage.changed",
      durable: "job-service:application-count-rollup",
      logger,
      handler: async (envelope) => {
        const p = StageChangedPayload.parse(envelope.payload);
        if (!p.requisitionId) return; // no requisition on the event -> nothing to roll up
        const changed = await reconcileApplicationCountForRequisition(p.tenantId, p.requisitionId, logger);
        if (changed > 0) {
          logger.info(
            { tenantId: p.tenantId, requisitionId: p.requisitionId, postingsChanged: changed },
            "applicationCount rollup: reconciled on application.stage.changed",
          );
        }
      },
    }),
  );

  logger.info("applicationCount rollup subscriber started (application.stage.changed)");
  return subs;
}
