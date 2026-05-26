/**
 * Sentry error tracking — initialised once per service alongside OTel.
 *
 * Silently disabled when SENTRY_DSN is not set, so dev/CI works without
 * configuration. When set, captures unhandled exceptions, unhandled
 * rejections, and any error passed through the Express error handler.
 *
 *   import { initSentry, captureException } from "@cdc-ats/common";
 *   initSentry({ serviceName: "identity-service" });
 *   ...
 *   try { ... } catch (e) { captureException(e, { route: "/foo" }); throw e; }
 */
import * as Sentry from "@sentry/node";

let initialized = false;

export interface SentryOptions {
  serviceName: string;
  /** Override DSN — usually from SENTRY_DSN env. */
  dsn?: string;
  /** Sample rate 0-1. Defaults to SENTRY_SAMPLE_RATE env or 1.0. */
  sampleRate?: number;
  /** Traces sample rate 0-1. Defaults to 0.1 (10%) in prod, 1.0 in dev. */
  tracesSampleRate?: number;
  release?: string;
  environment?: string;
}

export function initSentry(opts: SentryOptions): void {
  if (initialized) return;
  const dsn = opts.dsn ?? process.env["SENTRY_DSN"];
  if (!dsn) return; // silently no-op when not configured

  const env = opts.environment ?? process.env["NODE_ENV"] ?? "development";
  Sentry.init({
    dsn,
    release: opts.release ?? process.env["SERVICE_VERSION"] ?? "0.0.1",
    environment: env,
    sampleRate: opts.sampleRate ?? Number(process.env["SENTRY_SAMPLE_RATE"] ?? 1.0),
    tracesSampleRate:
      opts.tracesSampleRate ??
      Number(process.env["SENTRY_TRACES_SAMPLE_RATE"] ?? (env === "production" ? 0.1 : 1.0)),
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.consoleIntegration(),
    ],
    // Strip PII from logged objects
    beforeSend(event) {
      // Drop authorization headers
      if (event.request?.headers) {
        delete (event.request.headers as Record<string, string>)["authorization"];
        delete (event.request.headers as Record<string, string>)["cookie"];
      }
      return event;
    },
  });
  Sentry.setTag("service", opts.serviceName);
  initialized = true;
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!initialized) return;
  Sentry.withScope((scope) => {
    if (context) {
      for (const [k, v] of Object.entries(context)) scope.setExtra(k, v);
    }
    Sentry.captureException(err);
  });
}

export function setSentryTenant(tenantId: string | null): void {
  if (!initialized) return;
  Sentry.setTag("tenant_id", tenantId ?? "anonymous");
}

export function setSentryUser(userId: string | null, email?: string | null): void {
  if (!initialized) return;
  Sentry.setUser(userId ? { id: userId, email: email ?? undefined } : null);
}

/** Express error handler that captures any error reaching it. Mount AFTER
 *  the route handlers but BEFORE the application's error responder.
 *  Returns `any` to avoid leaking @sentry/node internal types into consumers. */
export function sentryErrorHandler(): any {
  return Sentry.expressErrorHandler();
}

export { Sentry };
