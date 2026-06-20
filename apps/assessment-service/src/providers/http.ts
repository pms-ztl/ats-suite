/**
 * Shared HTTP + rate-limit helpers for the provider adapters (WF8 / H2).
 *
 * Kept deliberately tiny: a fetch wrapper with a timeout + a 429-aware retry that
 * honors the vendor's `Retry-After`, and a couple of pure normalization helpers
 * (percentage derivation, safe date parsing) so every adapter computes a
 * NormalizedResult the same way WITHOUT fabricating anything. No adapter logs or
 * persists credentials; this module never touches the DB.
 */

/** A minimal HTTP error carrying the status so callers can branch on 404/429. */
export class ProviderHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly provider: string,
    message: string,
    public readonly body?: string,
  ) {
    super(`[${provider}] HTTP ${status}: ${message}`);
    this.name = "ProviderHttpError";
  }
}

export interface FetchJsonOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  /** Per-request timeout (ms). Default 15s. */
  timeoutMs?: number;
  /** Max retries on HTTP 429 (and 503). Default 3. Honors Retry-After. */
  maxRetries?: number;
  /** Label used in errors / logs. */
  provider: string;
  /**
   * Minimum spacing between requests (ms) to respect a vendor rate limit. The
   * caller passes e.g. 100 for HackerRank's 10 rps. A best-effort process-local
   * throttle keyed by `rateKey`.
   */
  minIntervalMs?: number;
  rateKey?: string;
}

// Process-local last-call timestamps per rate key (best-effort spacing). This is
// NOT a distributed limiter; it simply keeps a single worker from bursting past a
// vendor's documented per-second cap. The 429 retry below is the real backstop.
const lastCallAt = new Map<string, number>();

async function respectRate(key: string | undefined, minIntervalMs: number | undefined): Promise<void> {
  if (!key || !minIntervalMs || minIntervalMs <= 0) return;
  const now = Date.now();
  const prev = lastCallAt.get(key) ?? 0;
  const wait = prev + minIntervalMs - now;
  if (wait > 0) await sleep(wait);
  lastCallAt.set(key, Date.now());
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch JSON with a timeout, a process-local rate-spacing guard, and a
 * Retry-After-honoring backoff on 429/503. Throws {@link ProviderHttpError} on a
 * non-2xx (after exhausting retries). Returns the parsed JSON (or `null` when the
 * body is empty / non-JSON — the caller decides what an empty body means).
 */
export async function fetchJson<T = unknown>(url: string, opts: FetchJsonOptions): Promise<T | null> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = 15_000,
    maxRetries = 3,
    provider,
    minIntervalMs,
    rateKey,
  } = opts;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await respectRate(rateKey, minIntervalMs);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        ...(body !== undefined ? { body } : {}),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    // Rate limited / temporarily unavailable: honor Retry-After, then retry.
    if ((res.status === 429 || res.status === 503) && attempt < maxRetries) {
      const retryAfter = parseRetryAfterMs(res.headers.get("retry-after"));
      // Exponential fallback when the vendor gives no Retry-After header.
      const backoff = retryAfter ?? Math.min(30_000, 500 * 2 ** attempt);
      attempt += 1;
      await sleep(backoff);
      continue;
    }

    const text = await res.text();
    if (!res.ok) {
      throw new ProviderHttpError(res.status, provider, res.statusText || "request failed", text.slice(0, 2000));
    }
    if (!text) return null;
    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }
}

/** Parse a Retry-After header (seconds or HTTP-date) into ms; null if absent. */
export function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null;
  const asNum = Number(value);
  if (Number.isFinite(asNum)) return Math.max(0, asNum * 1000);
  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

/** Basic-auth header value for `user:pass`. */
export function basicAuth(user: string, pass: string): string {
  return "Basic " + Buffer.from(`${user}:${pass}`, "utf8").toString("base64");
}

/**
 * Derive a 0..100 percentage WITHOUT inventing data: prefer an explicit
 * vendor-reported percentage; else derive from score + maxScore when BOTH are
 * real numbers and maxScore > 0; else return undefined (honest unknown).
 */
export function derivePercentage(
  explicit: unknown,
  score: number | undefined,
  maxScore: number | undefined,
): number | undefined {
  if (typeof explicit === "number" && Number.isFinite(explicit)) {
    return clampPct(explicit);
  }
  if (
    typeof score === "number" &&
    Number.isFinite(score) &&
    typeof maxScore === "number" &&
    Number.isFinite(maxScore) &&
    maxScore > 0
  ) {
    return clampPct((score / maxScore) * 100);
  }
  return undefined;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n * 100) / 100));
}

/** Coerce a value to a finite number or undefined (never NaN, never a default). */
export function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Coerce a value to a Date or undefined (parse failures yield undefined). */
export function dt(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value === "string" || typeof value === "number") {
    const ms = typeof value === "number" ? value : Date.parse(value);
    if (Number.isFinite(ms) && !Number.isNaN(ms)) return new Date(ms);
  }
  return undefined;
}

/** Read a header case-insensitively from a header bag. */
export function header(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) {
      const v = headers[key];
      return Array.isArray(v) ? v[0] : v;
    }
  }
  return undefined;
}

/** Constant-time string compare (for HMAC signature verification). */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
