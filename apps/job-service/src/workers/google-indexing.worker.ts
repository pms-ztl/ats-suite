/**
 * Google Indexing API worker (job-service) - WF-F / SLICE F4.
 *
 * OPTIONAL background worker that pings the Google Indexing API when a public
 * JobPosting page goes live or comes down, so Google for Jobs re-crawls the
 * canonical listing promptly instead of waiting out its normal crawl cadence.
 * It is the real-time companion to the on-demand pull feed (F2) and the page's
 * embedded schema.org/JobPosting JSON-LD (F3): the feed + JSON-LD make the page
 * indexable, this worker tells Google WHEN to look.
 *
 *   job.published  -> Indexing API  type "URL_UPDATED"  (re-index the listing)
 *   job.closed     -> Indexing API  type "URL_DELETED"  (drop the stale listing)
 *
 * The notified URL is the canonical PUBLIC JobPosting page only
 *   `${APP_URL}/jobs/{slug}`
 * (the candidate-portal listing page that carries the JSON-LD), NEVER the apply
 * page and NEVER any internal URL. Google's Indexing API is documented for
 * JobPosting + BroadcastEvent pages, so we only ever submit a real published
 * posting's public URL.
 *
 * == ENV GATE (honest no-op when unconfigured) ===============================
 *  - GOOGLE_INDEXING_SA_JSON : the raw JSON of a Google service-account key
 *    (the same `client_email` + `private_key` you download from GCP). When this
 *    env var is UNSET or unparseable the worker is DISABLED: startGoogleIndexingWorker
 *    returns null and NOTHING is enqueued/sent. There is no fallback, no fake
 *    "indexed" state, no stub - an unconfigured platform simply does not ping
 *    Google (the page still gets crawled on Google's normal schedule).
 *  - REDIS_URL must also be set (BullMQ transport); unset -> disabled, like the
 *    sibling workers.
 *  - NATS must be connected (the caller only starts this after connectNats()).
 *
 * == HARD RULES baked in =====================================================
 *  - MODULE GATE: short-circuits per tenant via @cdc-ats/common
 *    isModuleEnabled(tenantId, "job-distribution") - the same answer the gateway
 *    requireModule would give. job-distribution is a failMode:"closed" module, so
 *    a billing blip resolves to OFF and the worker does NO Google work (it never
 *    pings on behalf of a tenant whose distribution module is disabled).
 *  - REAL data or skip: the public URL is built from the REAL persisted posting
 *    slug (resolved from the DB by id), never synthesized. A posting that is not
 *    found / not published is skipped (no ping), never a fabricated URL.
 *  - CREDENTIALS never persisted/logged: the service-account private key lives in
 *    GOOGLE_INDEXING_SA_JSON (env, decrypted by the platform secret store), is read
 *    at the point of use to mint a short-lived OAuth2 access token, and is NEVER
 *    written to the DB or a log line. The minted access token is cached in-process
 *    only, for its lifetime.
 *  - RATE / BUDGET: Google's Indexing API default quota is ~200 requests/day per
 *    project. A process-local daily counter caps issuance at GOOGLE_INDEXING_DAILY_BUDGET
 *    (default 200); over budget -> the job is skipped (acked, not failed) until the
 *    UTC-day rollover. BullMQ concurrency 1 + a modest limiter keep us well under
 *    the per-minute ceiling; a 429 from Google is retried with backoff by BullMQ.
 *  - NO auto-reject / no candidate decisions: this worker only nudges a crawler;
 *    it touches no candidate and makes no hiring decision.
 *
 * == EVENT SOURCE ============================================================
 * The worker subscribes to the JOB_EVENTS Jetstream (subjects
 * `tenant.*.job.published` + `tenant.*.job.closed`, emitted by the publish/close
 * path in a sibling slice). Each event is converted into a BullMQ job and
 * processed off the NATS ack path, so a slow/rate-limited Google call never
 * blocks the consume loop. If the JOB_EVENTS stream is not present yet (the
 * publisher slice not deployed) the subscribe fails softly: the worker logs and
 * stays idle rather than crashing the service - it is genuinely OPTIONAL.
 */
import { createSign } from "node:crypto";
import { Worker } from "bullmq";
import type { Job } from "bullmq";
import type { Logger } from "pino";
import { isModuleEnabled } from "@cdc-ats/common";
import { subscribeToEvents, getRedisConnection, getQueue, type ActiveSubscription } from "@cdc-ats/nats-client";
import type { EventEnvelope } from "@cdc-ats/contracts";
// Background worker (no HTTP request) - scopes by the event's tenantId explicitly,
// so it uses the admin (non-RLS) client, exactly like the outbox/board workers.
import { prismaAdmin as prisma } from "../lib/prisma.js";

const QUEUE = "google-indexing";
const JOB_DISTRIBUTION_MODULE_KEY = "job-distribution";

const JOB_EVENTS_STREAM = "JOB_EVENTS";
const PUBLISHED_SUBJECT = "tenant.*.job.published";
const CLOSED_SUBJECT = "tenant.*.job.closed";

// Public origin the canonical JobPosting page lives on (no trailing slash). Mirrors
// the feed route + normalize-job mapper so the indexed URL matches the syndicated one.
const APP_URL = (process.env["APP_URL"] ?? "http://localhost:3000").replace(/\/+$/, "");

// Google Indexing API endpoints + scope (documented for JobPosting/BroadcastEvent).
const INDEXING_PUBLISH_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";

// Google's default project quota is ~200 publish calls/day. Cap issuance so a burst
// of publishes/closes can never blow the quota (over-budget jobs are skipped, not
// failed). Tunable for a project with a raised quota.
const DAILY_BUDGET = Number(process.env["GOOGLE_INDEXING_DAILY_BUDGET"] ?? 200);

/** What kind of Indexing API notification a job carries. */
type NotificationType = "URL_UPDATED" | "URL_DELETED";

/** The BullMQ job shape: enough to resolve the real public URL + module-gate. */
interface IndexingJob {
  tenantId: string;
  jobPostingId: string;
  type: NotificationType;
}

/** A parsed Google service-account key (only the two fields we sign/auth with). */
interface ServiceAccount {
  clientEmail: string;
  privateKey: string;
  tokenUri: string;
}

/**
 * Parse GOOGLE_INDEXING_SA_JSON into the minimal {@link ServiceAccount}. Returns
 * null (worker disabled) when the env var is unset, not valid JSON, or missing the
 * client_email / private_key the JWT grant needs. NEVER logs the key material.
 */
function loadServiceAccount(): ServiceAccount | null {
  const raw = process.env["GOOGLE_INDEXING_SA_JSON"];
  if (!raw || raw.trim() === "") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const clientEmail = typeof obj["client_email"] === "string" ? obj["client_email"] : "";
  // The PEM private key arrives with literal "\n" sequences when stored as one env
  // line; normalize them back to real newlines so the signer accepts the PEM.
  const rawKey = typeof obj["private_key"] === "string" ? obj["private_key"] : "";
  const privateKey = rawKey.replace(/\\n/g, "\n");
  const tokenUri = typeof obj["token_uri"] === "string" && obj["token_uri"] ? obj["token_uri"] : GOOGLE_TOKEN_URL;
  if (!clientEmail || !privateKey) return null;
  return { clientEmail, privateKey, tokenUri };
}

/** base64url (no padding) of a UTF-8 string or buffer, for the JWT segments. */
function base64Url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// In-process OAuth2 access-token cache (token + absolute expiry ms). The token is a
// short-lived bearer for the Indexing scope; cached only in memory, never persisted.
let cachedToken: { token: string; expiresAtMs: number } | null = null;

/**
 * Mint (or reuse a cached) Google OAuth2 access token from the service-account key
 * via the signed-JWT grant (RS256). The private key is read at the point of use to
 * sign the assertion and is never persisted or logged. Throws on a token-endpoint
 * error so BullMQ retries (a creds/transport blip must not be mistaken for "done").
 */
async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Date.now();
  // Reuse a still-valid token (30s safety skew) so a burst of pings shares one grant.
  if (cachedToken && cachedToken.expiresAtMs - 30_000 > now) return cachedToken.token;

  const iat = Math.floor(now / 1000);
  const exp = iat + 3600; // Google caps the assertion lifetime at 1h.
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: sa.clientEmail,
      scope: INDEXING_SCOPE,
      aud: sa.tokenUri,
      iat,
      exp,
    }),
  );
  const signingInput = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = base64Url(signer.sign(sa.privateKey));
  const assertion = `${signingInput}.${signature}`;

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const res = await fetch(sa.tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[google-indexing] token grant failed: HTTP ${res.status} ${text.slice(0, 300)}`);
  }
  const json = (await res.json().catch(() => null)) as { access_token?: string; expires_in?: number } | null;
  const token = json?.access_token;
  if (!token) throw new Error("[google-indexing] token grant returned no access_token");
  const expiresInSec = typeof json?.expires_in === "number" && json.expires_in > 0 ? json.expires_in : 3600;
  cachedToken = { token, expiresAtMs: now + expiresInSec * 1000 };
  return token;
}

/**
 * Submit one URL notification to the Google Indexing API. Throws on a non-2xx so
 * BullMQ retries with backoff (Google 429 / 5xx are transient); a 200 means Google
 * accepted the nudge (it does NOT guarantee indexing - that stays Google's call).
 */
async function submitNotification(url: string, type: NotificationType, accessToken: string): Promise<void> {
  const res = await fetch(INDEXING_PUBLISH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, type }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    // A 401 likely means a stale token; drop the cache so the next attempt re-mints.
    if (res.status === 401) cachedToken = null;
    const text = await res.text().catch(() => "");
    throw new Error(`[google-indexing] publish failed: HTTP ${res.status} ${text.slice(0, 300)}`);
  }
}

// Process-local daily budget counter. Resets on the UTC-day boundary (best-effort:
// this is a single-worker guard against blowing the project quota, not a distributed
// limiter). The Indexing API's own quota is the real backstop.
let budgetDay = utcDayKey(Date.now());
let budgetUsed = 0;

function utcDayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

/** Returns true and increments if there is budget left for today; false when spent. */
function consumeBudget(): boolean {
  const today = utcDayKey(Date.now());
  if (today !== budgetDay) {
    budgetDay = today;
    budgetUsed = 0;
  }
  if (budgetUsed >= DAILY_BUDGET) return false;
  budgetUsed += 1;
  return true;
}

/**
 * Resolve the REAL canonical public URL for a posting, or null when there is no
 * URL to submit. For URL_UPDATED the posting must exist AND be published (we never
 * ask Google to index an unpublished/closed page). For URL_DELETED we resolve the
 * slug even when the posting is no longer published (the page may already be down)
 * so Google is told to drop the stale listing; null only when the row is gone.
 */
async function resolvePublicUrl(
  tenantId: string,
  jobPostingId: string,
  type: NotificationType,
): Promise<string | null> {
  const posting = await prisma.jobPosting.findFirst({
    where: { id: jobPostingId, tenantId },
    select: { slug: true, isPublished: true },
  });
  if (!posting) return null;
  if (type === "URL_UPDATED" && !posting.isPublished) return null;
  if (!posting.slug || posting.slug.trim() === "") return null;
  return `${APP_URL}/jobs/${encodeURIComponent(posting.slug)}`;
}

/**
 * Process one indexing job: module-gate, resolve the real URL, check the daily
 * budget, then notify Google. Returns a small honest outcome object (never throws
 * for an expected skip; throws only on a transport error so BullMQ retries).
 */
async function processJob(job: Job<IndexingJob>, sa: ServiceAccount, logger: Logger): Promise<unknown> {
  const { tenantId, jobPostingId, type } = job.data;

  // Module gate: job-distribution OFF (or a billing blip, since failMode:closed) ->
  // skip + ack. The platform does no Google work for a tenant without the module.
  if (!(await isModuleEnabled(tenantId, JOB_DISTRIBUTION_MODULE_KEY))) {
    logger.info({ jobId: job.id, tenantId, jobPostingId }, "google-indexing skipped - job-distribution disabled");
    return { skipped: true, reason: "module-disabled" };
  }

  // Resolve the REAL public URL (never synthesized). No URL -> nothing to index.
  const url = await resolvePublicUrl(tenantId, jobPostingId, type);
  if (!url) {
    logger.info({ jobId: job.id, jobPostingId, type }, "google-indexing skipped - no publishable URL");
    return { skipped: true, reason: "no-url" };
  }

  // Daily budget guard: over the ~200/day quota -> skip (ack), retry tomorrow.
  if (!consumeBudget()) {
    logger.warn({ jobId: job.id, url, dailyBudget: DAILY_BUDGET }, "google-indexing skipped - daily budget exhausted");
    return { skipped: true, reason: "budget-exhausted", url };
  }

  const accessToken = await getAccessToken(sa);
  await submitNotification(url, type, accessToken);

  logger.info({ jobId: job.id, url, type }, "google-indexing notification submitted");
  return { url, type, submitted: true };
}

/** Map a job NATS event type to the Indexing API notification type, or null when
 *  the event is neither a publish nor a close (then it is ignored, not guessed). */
function notificationTypeForEvent(eventType: string): NotificationType | null {
  if (eventType === "job.published") return "URL_UPDATED";
  if (eventType === "job.closed") return "URL_DELETED";
  return null;
}

/** Narrow the unknown event payload to {jobPostingId} without fabricating one. */
function readJobPostingId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const id = p["jobPostingId"] ?? p["id"] ?? p["postingId"];
  return typeof id === "string" && id.trim() !== "" ? id : null;
}

/**
 * Start the Google Indexing worker. Returns a stop function (call from graceful
 * shutdown), or NULL when the worker is disabled - which is the honest default:
 *   - GOOGLE_INDEXING_SA_JSON unset/invalid  (no service-account key -> no pings)
 *   - REDIS_URL unset                        (no BullMQ transport)
 * A disabled worker enqueues nothing and sends nothing; the public page is still
 * crawled on Google's normal schedule.
 *
 * The caller (service index.ts) should only invoke this AFTER connectNats(), and
 * only when NATS is connected, since the worker subscribes to the JOB_EVENTS stream.
 * If that stream is not present yet (publisher slice not deployed) the subscription
 * fails softly and the worker stays idle rather than crashing the service.
 */
export function startGoogleIndexingWorker(logger: Logger): (() => Promise<void>) | null {
  const sa = loadServiceAccount();
  if (!sa) {
    logger.info("google-indexing worker disabled - GOOGLE_INDEXING_SA_JSON not configured");
    return null;
  }
  if (!process.env["REDIS_URL"]) {
    logger.info("google-indexing worker disabled - REDIS_URL not set");
    return null;
  }

  const connection = getRedisConnection();
  // Built on the SAME shared Redis connection singleton the worker uses (getQueue +
  // getRedisConnection both read the nats-client connection singleton).
  const queue = getQueue<IndexingJob>(QUEUE);

  // The BullMQ worker does the slow Google call OFF the NATS ack path. Concurrency 1
  // + a small limiter keep issuance well under Google's per-minute ceiling; each
  // adapter retry/backoff is BullMQ's (Google 429/5xx are transient).
  const worker = new Worker<IndexingJob>(
    QUEUE,
    async (job) => processJob(job, sa, logger),
    {
      // BullMQ bundles its own ioredis with slightly different types - cast to any,
      // exactly like the shared nats-client createWorker + the assessment workers.
      connection: connection as any,
      concurrency: 1,
      limiter: {
        max: Number(process.env["GOOGLE_INDEXING_RATE_MAX"] ?? 30),
        duration: Number(process.env["GOOGLE_INDEXING_RATE_DURATION_MS"] ?? 60_000),
      },
    },
  );
  worker.on("completed", (job, ret) => logger.debug({ jobId: job.id, ret }, "google-indexing job done"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err?.message }, "google-indexing job failed"));

  // Subscribe to publish/close events; convert each into a BullMQ job. A handler
  // throw NAKs (NATS redelivers), so a transient enqueue failure is not dropped.
  let publishedSub: ActiveSubscription | null = null;
  let closedSub: ActiveSubscription | null = null;

  const onEvent = async (envelope: EventEnvelope<unknown>): Promise<void> => {
    const type = notificationTypeForEvent(envelope.type);
    if (!type) return; // not a publish/close event - ignore (never guess a URL)
    const tenantId = envelope.tenantId;
    if (!tenantId) return; // a JobPosting event is always tenant-scoped; ignore otherwise
    const jobPostingId = readJobPostingId(envelope.payload);
    if (!jobPostingId) {
      logger.warn({ eventId: envelope.eventId, type: envelope.type }, "google-indexing: event missing jobPostingId - ignored");
      return;
    }
    // Coalesce duplicate notifications for the same (posting, type) via a stable
    // jobId so a redelivered NATS message does not double-spend the daily budget.
    const jobId = `${tenantId}:${jobPostingId}:${type}`;
    await queue.add(QUEUE, { tenantId, jobPostingId, type }, { jobId, removeOnComplete: 500, removeOnFail: 200 });
  };

  // subscribeToEvents requires the stream to already exist; if JOB_EVENTS is not
  // present (publisher slice not deployed) we log + stay idle, never crash the service.
  void (async () => {
    try {
      publishedSub = await subscribeToEvents({
        stream: JOB_EVENTS_STREAM,
        subject: PUBLISHED_SUBJECT,
        durable: "job-service:google-indexing-published",
        logger,
        handler: onEvent,
      });
      closedSub = await subscribeToEvents({
        stream: JOB_EVENTS_STREAM,
        subject: CLOSED_SUBJECT,
        durable: "job-service:google-indexing-closed",
        logger,
        handler: onEvent,
      });
      logger.info({ dailyBudget: DAILY_BUDGET }, "google-indexing worker started");
    } catch (err) {
      logger.warn(
        { err: err instanceof Error ? err.message : String(err) },
        "google-indexing worker idle - could not subscribe to JOB_EVENTS (publisher slice not deployed?)",
      );
    }
  })();

  return async () => {
    await publishedSub?.stop().catch(() => {});
    await closedSub?.stop().catch(() => {});
    await worker.close().catch(() => {});
    await queue.close().catch(() => {});
  };
}
