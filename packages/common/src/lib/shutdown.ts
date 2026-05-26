/**
 * Graceful shutdown — every service registers a shutdown handler so that
 * kubernetes rolling deploys, docker stops, or local Ctrl-C drain
 * in-flight requests + background workers cleanly.
 *
 * Lifecycle:
 *   1. SIGTERM / SIGINT received → mark unhealthy (readinessProbe fails)
 *   2. Wait `gracePeriodMs` so load balancer drains
 *   3. Close http.Server (stops accepting new connections, finishes in-flight)
 *   4. Run user cleanup hooks (NATS drain, BullMQ close, Prisma disconnect)
 *   5. Hard-exit after `maxShutdownMs` if step 4 hangs
 */
import type { Server } from "http";
import type { Logger } from "pino";

export interface ShutdownOptions {
  /** Logger to emit lifecycle events. */
  logger: Logger;
  /** http.Server returned by app.listen() — closed step 3. */
  server: Server;
  /** Delay before closing the server so load balancers see /readyz fail. */
  gracePeriodMs?: number;
  /** Hard timeout — process.exit(1) if shutdown isn't done by then. */
  maxShutdownMs?: number;
  /** Async cleanup hooks (Prisma disconnect, NATS drain, BullMQ close). */
  onShutdown?: Array<() => Promise<void> | void>;
  /** Readiness flag — set to false during shutdown so /readyz returns 503. */
  setReady?: (ready: boolean) => void;
}

export function registerGracefulShutdown(opts: ShutdownOptions): void {
  const grace = opts.gracePeriodMs ?? 5_000;
  const maxMs = opts.maxShutdownMs ?? 30_000;
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    opts.logger.info({ signal }, "graceful shutdown initiated");

    // 1. Mark unhealthy so readinessProbe fails + LB stops sending traffic
    opts.setReady?.(false);

    // 2. Hard timeout — process.exit(1) if anything below hangs past maxMs
    const hardKill = setTimeout(() => {
      opts.logger.error({ signal }, "graceful shutdown exceeded maxShutdownMs — forcing exit");
      process.exit(1);
    }, maxMs);
    hardKill.unref();

    try {
      // 3. Wait grace period so in-flight requests can finish
      if (grace > 0) {
        opts.logger.info({ gracePeriodMs: grace }, "waiting grace period for connection drain");
        await new Promise((r) => setTimeout(r, grace));
      }

      // 4. Close HTTP server — no new connections, in-flight requests finish
      await new Promise<void>((resolve, reject) => {
        opts.server.close((err) => (err ? reject(err) : resolve()));
      });
      opts.logger.info("http server closed");

      // 5. Run user cleanup hooks in parallel
      if (opts.onShutdown?.length) {
        await Promise.allSettled(opts.onShutdown.map((h) => Promise.resolve(h())));
        opts.logger.info({ hookCount: opts.onShutdown.length }, "shutdown hooks completed");
      }

      opts.logger.info("graceful shutdown complete");
      clearTimeout(hardKill);
      process.exit(0);
    } catch (err) {
      opts.logger.error({ err }, "graceful shutdown error");
      clearTimeout(hardKill);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    opts.logger.fatal({ reason }, "unhandledRejection — service will exit");
    process.exit(1);
  });
  process.on("uncaughtException", (err) => {
    opts.logger.fatal({ err }, "uncaughtException — service will exit");
    process.exit(1);
  });
}
