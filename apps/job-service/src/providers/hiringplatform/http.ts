/**
 * Shared HTTP + rate-limit helpers for the hiring-platform board adapters
 * (WF-E / SLICE E7).
 *
 * Ported from apps/assessment-service/src/providers/http.ts and kept deliberately
 * tiny: a fetch wrapper with a per-request timeout (AbortSignal) + a 429/503-aware
 * retry that honors the board's `Retry-After`, a best-effort process-local
 * rate-spacing guard (a single worker must not burst past a board's documented
 * per-second cap), and a few pure helpers (safe number/date coercion, header
 * reading, constant-time compare) so every adapter normalizes a board payload the
 * SAME way WITHOUT fabricating anything.
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication / inbound apply),
 * DISTINCT from the assessment-provider axis. No adapter logs or persists
 * credentials; this module never touches the DB.
 */

/** A minimal HTTP error carrying the status so callers can branch on 404/429. */
export class PlatformHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly provider: string,
    message: string,
    public readonly body?: string,
  ) {
    super(`[${provider}] HTTP ${status}: ${message}`);
    this.name = "PlatformHttpError";
  }
}

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  /** Per-request timeout (ms). Default 15s. */
  timeoutMs?: number;
  /** Max retries on HTTP 429 (and 503). Default 3. Honors Retry-After. */
  maxRetries?: number;
  /** Label used in errors / logs (the board's registry key). */
  provider: string;
  /**
   * Minimum spacing between requests (ms) to respect a board rate limit. The
   * caller passes e.g. 200 for a 5 rps board. A best-effort process-local
   * throttle keyed by `rateKey`.
   */
  minIntervalMs?: number;
  rateKey?: string;
}

// Process-local last-call timestamps per rate key (best-effort spacing). This is
// NOT a distributed limiter; it simply keeps a single worker from bursting past a
// board's documented per-second cap. The 429 retry below is the real backstop.
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
 * Core fetch with a timeout, a process-local rate-spacing guard, and a
 * Retry-After-honoring backoff on 429/503. Throws {@link PlatformHttpError} on a
 * non-2xx (after exhausting retries) and returns the RAW response text (the board
 * decides what an empty body means). Adapters needing JSON call {@link fetchJson};
 * those ingesting XML/non-JSON (some feed/status reads) call {@link fetchText}.
 */
async function request(url: string, opts: FetchOptions): Promise<string> {
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

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        ...(body !== undefined ? { body } : {}),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      // A timeout/abort or transport error: retry like a transient failure so a
      // single network blip does not drop a post/poll, then surface it.
      if (attempt < maxRetries) {
        attempt += 1;
        await sleep(Math.min(30_000, 500 * 2 ** attempt));
        continue;
      }
      throw new PlatformHttpError(0, provider, err instanceof Error ? err.message : "transport error");
    }

    // Rate limited / temporarily unavailable: honor Retry-After, then retry.
    if ((res.status === 429 || res.status === 503) && attempt < maxRetries) {
      const retryAfter = parseRetryAfterMs(res.headers.get("retry-after"));
      // Exponential fallback when the board gives no Retry-After header.
      const backoff = retryAfter ?? Math.min(30_000, 500 * 2 ** attempt);
      attempt += 1;
      await sleep(backoff);
      continue;
    }

    const text = await res.text();
    if (!res.ok) {
      throw new PlatformHttpError(res.status, provider, res.statusText || "request failed", text.slice(0, 2000));
    }
    return text;
  }
}

/**
 * Fetch and parse JSON. Returns the parsed body, or `null` when the body is empty
 * or not valid JSON (the caller decides what an empty body means, never a fake).
 * Throws {@link PlatformHttpError} on a non-2xx after retries.
 */
export async function fetchJson<T = unknown>(url: string, opts: FetchOptions): Promise<T | null> {
  const text = await request(url, opts);
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Fetch the RAW response text (for boards that speak XML / non-JSON on a feed or
 * status read). Returns the body verbatim (empty string when the board returned an
 * empty body). Throws {@link PlatformHttpError} on a non-2xx after retries.
 */
export async function fetchText(url: string, opts: FetchOptions): Promise<string> {
  return request(url, opts);
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

/** Coerce a value to a non-empty trimmed string or undefined. */
export function str(value: unknown): string | undefined {
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
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

/** Constant-time string compare (for HMAC signature verification over RAW bytes). */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
