import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "assessment-service" });
initSentry({ serviceName: "assessment-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats, closeRedis } from "@cdc-ats/nats-client";
import { startGradingWorker } from "./workers/grading.worker.js";
import { startProviderInviteWorker } from "./workers/provider-invite.worker.js";
import { startAssessmentPollWorker } from "./workers/assessment-poll.worker.js";

const logger = createLogger({ serviceName: "assessment-service" });
const PORT = Number(process.env["PORT"] ?? 4014);

let gradingWorker: ReturnType<typeof startGradingWorker> | null = null;
let providerInviteWorker: ReturnType<typeof startProviderInviteWorker> | null = null;
let stopPollWorker: (() => Promise<void>) | null = null;

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "assessment-service" });
      await ensureStreams();
      logger.info("NATS connected");
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — assessment events will not publish");
    }
  }

  // BullMQ grading worker (G6) consumes the assessment-grading queue: real Judge0
  // verdicts for CODING + the oa-grader rubric agent for ESSAY, then publishes
  // assessment.completed. Uses the shared Redis connection (REDIS_URL). When Redis
  // is unset the queue cannot enqueue and the worker is not started (dev/CI).
  if (process.env["REDIS_URL"]) {
    try { gradingWorker = startGradingWorker(logger); }
    catch (err) { logger.warn({ err }, "BullMQ grading worker failed to start"); }
    // WF8 H3 — outbound provider-invite worker consumes the assessment-provider-invite
    // queue: issues a candidate's invite on an external OA vendor + stores the real
    // providerInvitationId. Shares the same Redis connection (REDIS_URL).
    try { providerInviteWorker = startProviderInviteWorker(logger); }
    catch (err) { logger.warn({ err }, "BullMQ provider-invite worker failed to start"); }
    // WF8 H5 — vendor result poll reconciler: every ~30 min, polls fetchResult for
    // provider-backed invites still pending (HackerRank has no webhook; also the
    // dropped-webhook backstop), ingesting real results via the shared idempotent
    // path. Repeatable schedule survives restarts (Redis-backed).
    try { stopPollWorker = startAssessmentPollWorker(logger); }
    catch (err) { logger.warn({ err }, "assessment poll reconciler failed to start"); }
  } else {
    logger.warn("REDIS_URL unset — assessment grading + provider-invite + poll queues/workers disabled");
  }

  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "assessment-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [
      async () => { if (gradingWorker) await gradingWorker.close().catch(() => {}); },
      async () => { if (providerInviteWorker) await providerInviteWorker.close().catch(() => {}); },
      async () => { if (stopPollWorker) await stopPollWorker().catch(() => {}); },
      async () => { await closeRedis().catch(() => {}); },
      async () => { await closeNats().catch(() => {}); },
    ],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "assessment-service failed to start");
  process.exit(1);
});
