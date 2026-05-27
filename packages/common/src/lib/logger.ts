/**
 * Pino logger — every service uses the same factory so logs are structured
 * identically and can be parsed by Loki / any aggregator.
 *
 * When LOKI_URL is set, logs also stream to Loki via a tiny custom stream
 * that batches lines and POSTs them. We avoid pino's worker-thread
 * transport because it has known issues with npm-workspace package
 * resolution AND silently swallows errors that break stdout too.
 */
import pino, { type StreamEntry, type LoggerOptions } from "pino";
import * as http from "node:http";
import * as https from "node:https";
import { URL } from "node:url";

export interface CreateLoggerOptions {
  /** Service name — added as a structured field to every log line. */
  serviceName: string;
  /** Override log level (defaults to LOG_LEVEL env or "info"). */
  level?: pino.LevelWithSilent;
}

// ── Tiny Loki HTTP-push stream ──────────────────────────────────────────────

class LokiStream {
  private buffer: Array<[string, string]> = [];     // [ns_timestamp, jsonLine]
  private timer: NodeJS.Timeout | null = null;
  private readonly endpoint: URL;
  private readonly labels: Record<string, string>;
  private readonly transport: typeof http | typeof https;
  private readonly batchIntervalMs: number;

  constructor(lokiBaseUrl: string, labels: Record<string, string>, batchIntervalMs = 2000) {
    const url = new URL("/loki/api/v1/push", lokiBaseUrl);
    this.endpoint = url;
    this.labels = labels;
    this.transport = url.protocol === "https:" ? https : http;
    this.batchIntervalMs = batchIntervalMs;
  }

  write(line: string): boolean {
    // line is the pino JSON ending in \n
    const trimmed = line.endsWith("\n") ? line.slice(0, -1) : line;
    if (!trimmed) return true;
    // Loki wants ns since epoch (string). Use `time` from the log if present.
    let timeMs = Date.now();
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed.time === "number") timeMs = parsed.time;
      else if (typeof parsed.time === "string") timeMs = new Date(parsed.time).getTime();
    } catch { /* keep timeMs */ }
    const ns = `${timeMs}000000`;
    this.buffer.push([ns, trimmed]);
    if (!this.timer) this.timer = setTimeout(() => this.flush(), this.batchIntervalMs);
    return true;
  }

  private flush(): void {
    this.timer = null;
    if (this.buffer.length === 0) return;
    const values = this.buffer;
    this.buffer = [];
    const body = JSON.stringify({
      streams: [{ stream: this.labels, values }],
    });
    const opts: http.RequestOptions = {
      method: "POST",
      hostname: this.endpoint.hostname,
      port: this.endpoint.port || (this.endpoint.protocol === "https:" ? 443 : 80),
      path: this.endpoint.pathname,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const req = this.transport.request(opts);
    req.on("error", () => { /* swallow — best-effort */ });
    req.write(body);
    req.end();
  }
}

// ── Logger factory ──────────────────────────────────────────────────────────

const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers['x-super-admin-key']",
  "*.password",
  "*.passwordHash",
  "*.token",
  "*.refreshToken",
  "*.apiKey",
];

export function createLogger(opts: CreateLoggerOptions): pino.Logger {
  const level = opts.level ?? (process.env["LOG_LEVEL"] as pino.LevelWithSilent | undefined) ?? "info";

  const baseOpts: LoggerOptions = {
    level,
    base: { service: opts.serviceName },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACT_PATHS, remove: true },
    formatters: { level: (label) => ({ level: label }) },
  };

  const lokiUrl = process.env["LOKI_URL"];
  if (!lokiUrl) {
    // Stdout only — single fast stream, no worker threads
    return pino(baseOpts);
  }

  // Multi-stream: stdout + Loki HTTP push (custom stream, no workers)
  const lokiStream = new LokiStream(lokiUrl, {
    service: opts.serviceName,
    env: process.env["NODE_ENV"] ?? "development",
  });
  // pino's StreamEntry.level is `Level`, not `LevelWithSilent` — silent
  // streams make no sense (they wouldn't write anywhere). Cast away.
  const safeLevel = level === "silent" ? "info" : level;
  const streams: StreamEntry[] = [
    { level: safeLevel, stream: process.stdout },
    { level: safeLevel, stream: lokiStream as unknown as NodeJS.WritableStream },
  ];
  return pino(baseOpts, pino.multistream(streams));
}
