/**
 * api-gateway entry point.
 *
 * Boots in this order:
 *   1. OpenTelemetry (must be FIRST so subsequent imports get instrumented)
 *   2. Sentry (also early so unhandled-exception capture is in place)
 *   3. NATS with retry (k8s pod startup race)
 *   4. Express app + middleware
 *   5. Listen on PORT
 *   6. Register graceful-shutdown handlers
 */
import { initOpenTelemetry, initSentry } from "@cdc-ats/common";

initOpenTelemetry({ serviceName: "api-gateway" });
initSentry({ serviceName: "api-gateway" });

import { createApp } from "./app.js";
import { createLogger, registerGracefulShutdown } from "@cdc-ats/common";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
// WF4 D3b — module-toggle cache buster (best-effort; no-op if NATS is down).
import { subscribeModuleToggles } from "./lib/module-gate.js";

const logger = createLogger({ serviceName: "api-gateway" });
const PORT = Number(process.env["PORT"] ?? 4000);

// Track readiness state — readiness probe in createApp reads this
let ready = false;
export const isReady = () => ready;

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "api-gateway" });
      await ensureStreams();
      // WF4 D3b — bust the module-gate cache on each module.toggled event so a
      // tenant/super-admin toggle takes effect within one round-trip. Best-effort.
      subscribeModuleToggles(logger);
      logger.info("NATS connected");
    } catch (err) {
      logger.warn({ err }, "NATS connect failed after retries — gateway agents will not publish cost events");
    }
  }

  const app = createApp(logger);
  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "api-gateway listening");
    ready = true;
  });

  // WF-I / I5 — keep-alive + header timeouts. Under a real apply spike the
  // gateway fronts thousands of short-lived inbound connections (often through a
  // tunnel / load balancer that pools upstream sockets). Node's default
  // keepAliveTimeout is 5s, which races the LB's own keep-alive and produces
  // spurious ECONNRESET / 502s ("socket hang up") at the proxy edge. Raise it
  // above the typical 60s LB idle so the LB, not us, closes idle sockets, and
  // set headersTimeout strictly greater so a slow-but-legit client is not cut
  // mid-headers. Both are env-tunable for the load test without a code change.
  //   GATEWAY_KEEPALIVE_TIMEOUT_MS  default 65000 (LB idle + headroom)
  //   GATEWAY_HEADERS_TIMEOUT_MS    default 66000 (must exceed keepAliveTimeout)
  server.keepAliveTimeout = Number(process.env["GATEWAY_KEEPALIVE_TIMEOUT_MS"] ?? 65_000);
  server.headersTimeout = Number(process.env["GATEWAY_HEADERS_TIMEOUT_MS"] ?? 66_000);
  // Cap concurrent sockets defensively so a flood cannot exhaust file
  // descriptors before the async pipeline absorbs the load (0 = unlimited).
  const maxConns = Number(process.env["GATEWAY_MAX_CONNECTIONS"] ?? 0);
  if (maxConns > 0) server.maxConnections = maxConns;

  registerGracefulShutdown({
    logger,
    server,
    setReady: (r) => { ready = r; },
    onShutdown: [
      async () => { await closeNats().catch(() => {}); },
    ],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "api-gateway failed to start");
  process.exit(1);
});
