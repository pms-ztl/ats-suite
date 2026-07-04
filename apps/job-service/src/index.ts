import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "job-service" });
initSentry({ serviceName: "job-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats, closeRedis } from "@cdc-ats/nats-client";
import { startOutboxWorker } from "@cdc-ats/outbox";
// The outbox worker drains events across all tenants — admin (non-RLS) client.
import { prismaAdmin as prisma } from "./lib/prisma.js";
import { startBoardPostWorker } from "./workers/board-post.worker.js";
import { startBoardSyncWorker } from "./workers/board-sync.worker.js";
import { startBoardCloseWorker } from "./workers/board-close.worker.js";
import { startApplyIngestWorker } from "./workers/apply-ingest.worker.js";
import { startApplyIngestSubscribers } from "./lib/apply-ingest-subscriber.js";
import { startApplicationCountSubscribers } from "./lib/application-count-subscriber.js";
import { startApplicationCountRollup } from "./lib/application-count-rollup.js";
import type { ActiveSubscription } from "@cdc-ats/nats-client";

const logger = createLogger({ serviceName: "job-service" });
const PORT = Number(process.env["PORT"] ?? 4004);

let stopOutbox: (() => Promise<void>) | null = null;
let boardPostWorker: ReturnType<typeof startBoardPostWorker> | null = null;
let boardSyncWorker: ReturnType<typeof startBoardSyncWorker> | null = null;
let boardCloseWorker: ReturnType<typeof startBoardCloseWorker> | null = null;
let applyIngestWorker: ReturnType<typeof startApplyIngestWorker> | null = null;
let applyIngestSubs: ActiveSubscription[] = [];
let applicationCountSubs: ActiveSubscription[] = [];
let stopApplicationCountRollup: (() => Promise<void>) | null = null;

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "job-service" });
      await ensureStreams();
      logger.info("NATS connected");
      // Outbox worker only makes sense when NATS is reachable
      stopOutbox = startOutboxWorker({ logger, prisma, pollMs: 2000 });

      // WF-I I3 — apply-ingest subscribers complete the ASYNC leg of the accept-fast
      // pipeline: they advance the ledger row's ingestStage to PARSED / SCREENED when
      // the REAL resume.parsed / screening.completed events arrive. Best-effort: a
      // subscriber failure must not stop the service booting.
      try {
        applyIngestSubs = await startApplyIngestSubscribers(logger);
      } catch (err) {
        logger.warn({ err }, "apply-ingest subscribers failed to start — PARSED/SCREENED stage will not advance");
      }

      // applicationCount rollup subscriber — reconciles a requisition's
      // JobPosting.applicationCount to the REAL candidate-service count the moment an
      // application.stage.changed event arrives (the event-driven half of the rollup
      // that replaced the per-apply count UPDATE dropped from the accept-fast path).
      try {
        applicationCountSubs = await startApplicationCountSubscribers(logger);
      } catch (err) {
        logger.warn({ err }, "applicationCount rollup subscriber failed to start — count refreshes only on the periodic sweep");
      }
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — agent.completed events will not publish");
    }
  }

  // applicationCount periodic rollup sweep — reconciles every published posting's
  // applicationCount to the REAL candidate-service count on a low-frequency timer.
  // It talks to candidate-service over HTTP (not NATS/Redis), so it runs regardless
  // of broker availability and catches the one case the event driver misses: a
  // brand-new accept-fast apply that sits at APPLIED and emits no stage.changed
  // event yet. Best-effort: a failed sweep is logged and retried on the next tick.
  try {
    stopApplicationCountRollup = startApplicationCountRollup(logger).stop;
  } catch (err) {
    logger.warn({ err }, "applicationCount rollup sweep failed to schedule");
  }

  // WF-G G6 — outbound board-distribution workers consume the board-post + board-sync
  // BullMQ queues over the shared Redis connection (REDIS_URL). board-post posts a
  // JobPosting to ONE board (or sets PENDING_PARTNER_APPROVAL when no creds, never a
  // fake ACTIVE); board-sync mirrors a HITL disposition back to the board. BOTH
  // short-circuit when the job-distribution module is OFF for the tenant. When
  // REDIS_URL is unset the queues cannot enqueue and the workers are not started.
  if (process.env["REDIS_URL"]) {
    try { boardPostWorker = startBoardPostWorker(logger); }
    catch (err) { logger.warn({ err }, "board-post worker failed to start"); }
    try { boardSyncWorker = startBoardSyncWorker(logger); }
    catch (err) { logger.warn({ err }, "board-sync worker failed to start"); }
    // WF-G G7 — board-close worker consumes the board-close queue (enqueued by the
    // distribution route's DELETE): takes a JobPosting's listing down on ONE board by
    // its real externalPostingId. Short-circuits when job-distribution is OFF.
    try { boardCloseWorker = startBoardCloseWorker(logger); }
    catch (err) { logger.warn({ err }, "board-close worker failed to start"); }
    // WF-I I3 — apply-ingest worker consumes the apply-ingest queue (enqueued by the
    // accept-fast public apply path): optional ClamAV scan, then forward the resume
    // from the incoming bucket into the resume pipeline, advancing ingestStage
    // PENDING_INGEST -> SCANNED -> FORWARDED (PARSED/SCREENED come from the subscriber).
    try { applyIngestWorker = startApplyIngestWorker(logger); }
    catch (err) { logger.warn({ err }, "apply-ingest worker failed to start"); }
  } else {
    logger.warn("REDIS_URL unset — board-post + board-sync + board-close + apply-ingest queues/workers disabled");
  }

  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "job-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [
      async () => { if (stopOutbox) await stopOutbox().catch(() => {}); },
      async () => { if (boardPostWorker) await boardPostWorker.close().catch(() => {}); },
      async () => { if (boardSyncWorker) await boardSyncWorker.close().catch(() => {}); },
      async () => { if (boardCloseWorker) await boardCloseWorker.close().catch(() => {}); },
      async () => { if (applyIngestWorker) await applyIngestWorker.close().catch(() => {}); },
      async () => { await Promise.all(applyIngestSubs.map((s) => s.stop().catch(() => {}))); },
      async () => { await Promise.all(applicationCountSubs.map((s) => s.stop().catch(() => {}))); },
      async () => { if (stopApplicationCountRollup) await stopApplicationCountRollup().catch(() => {}); },
      async () => { await closeRedis().catch(() => {}); },
      async () => { await closeNats().catch(() => {}); },
    ],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "job-service failed to start");
  process.exit(1);
});
