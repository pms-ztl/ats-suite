/**
 * Pino logger — every service uses the same factory so logs are structured
 * identically and can be parsed by Loki / any aggregator.
 */
import pino from "pino";

export interface CreateLoggerOptions {
  /** Service name — added as a structured field to every log line. */
  serviceName: string;
  /** Override log level (defaults to LOG_LEVEL env or "info"). */
  level?: pino.LevelWithSilent;
}

export function createLogger(opts: CreateLoggerOptions): pino.Logger {
  const level = opts.level ?? (process.env["LOG_LEVEL"] as pino.LevelWithSilent | undefined) ?? "info";
  return pino({
    level,
    base: { service: opts.serviceName },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers['x-super-admin-key']",
        "*.password",
        "*.passwordHash",
        "*.token",
        "*.refreshToken",
        "*.apiKey",
      ],
      remove: true,
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
  });
}
