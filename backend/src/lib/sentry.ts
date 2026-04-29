import * as Sentry from '@sentry/node';
import logger from './logger';

let initialized = false;

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.info('Sentry not configured (no SENTRY_DSN) — error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Scrub PII from error events
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      return event;
    },
  });

  initialized = true;
  logger.info('Sentry initialized');
}

export function captureException(err: Error, context?: Record<string, unknown>): void {
  if (!initialized) return;
  Sentry.withScope(scope => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
    }
    Sentry.captureException(err);
  });
}

export function setUserContext(userId: string, tenantId: string): void {
  if (!initialized) return;
  Sentry.setUser({ id: userId });
  Sentry.setTag('tenantId', tenantId);
}

export function isSentryInitialized(): boolean {
  return initialized;
}

export { Sentry };
