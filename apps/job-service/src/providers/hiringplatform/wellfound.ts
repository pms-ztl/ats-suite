/**
 * Wellfound (formerly AngelList Talent) adapter (job-service hiring-platform axis)
 * - WF-H / SLICE H3.
 *
 * Wellfound runs an INVERTED integration model: there is NO outbound, self-serve
 * employer job-create REST API a partner can push a posting to. Instead Wellfound
 * (and its partner-syndication program) PULLS the tenant's standard ATS job feed -
 * the same schema.org / `<source>` XML the WF-F feed.ts builders emit - on its own
 * crawl schedule, and applicants are routed to OUR public apply page. So the only
 * REAL distribution surface here is the generic feed: {@link ProviderCapabilities.feed}
 * is true and {@link HiringPlatformProvider.toFeedEntry} delegates verbatim to the
 * shared WF-F `buildSourceFeed` single-job snapshot.
 *
 * == What this adapter does NOT do ===========================================
 *  - There is no programmatic postJob: Wellfound does not accept a job-create call
 *    from a partner ATS, so {@link ProviderCapabilities.postApi} is FALSE and
 *    {@link wellfoundProvider.postJob} returns PENDING_PARTNER_APPROVAL with an
 *    'inverted / relationship integration' note and an EMPTY externalId. It NEVER
 *    fabricates an ACTIVE posting or a synthetic external id - the honest state is
 *    "the feed is published; Wellfound ingests it on its own crawl, subject to the
 *    relationship/partner setup".
 *  - There is no scraper. We expose NO Wellfound talent-search
 *    ({@link ProviderCapabilities.searchCandidates} is FALSE); a tenant wanting
 *    Wellfound's curated-candidate surface arranges it under a manual relationship
 *    contract out of band.
 *
 * == Inbound applications ====================================================
 * The default Wellfound apply flow REDIRECTS applicants to our public apply page
 * (they become real Candidates through `/public/jobs/:slug/apply-custom`, not via a
 * Wellfound callback). SOME partner relationships additionally wire an
 * application-writeback webhook; when - and only when - a configured writeback shape
 * arrives signed with the tenant's stored secret, {@link wellfoundProvider.parseApplication}
 * normalizes it into a real {@link NormalizedApplication}. Absent that configured
 * shape (or for a ping / redirect-only event) it returns `null` - a phantom
 * candidate is NEVER synthesized.
 *
 * == HARD RULES ==============================================================
 *  - REAL data or honest null: externalId / status come ONLY from a real signal;
 *    with no outbound API the post is PENDING_PARTNER_APPROVAL, never a fake ACTIVE.
 *  - verifyWebhook runs over the EXACT raw bytes the writeback signed (timing-safe);
 *    with no secret configured an unverifiable callback is rejected (returns false).
 *  - parseApplication returns a real applicant ONLY from a real signed writeback
 *    payload, else null - no auto-reject, no fabricated applicant.
 *  - No em / en dashes in emitted text.
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication), DISTINCT from the
 * assessment-provider axis. The feed serialization is a pure function of the job
 * (no network, no creds); credentials, when present, are decrypted per call and
 * NEVER persisted or logged here.
 */
import { createHmac } from "node:crypto";
import type {
  HiringPlatformProvider,
  NormalizedApplicant,
  NormalizedApplication,
  NormalizedJob,
  NormalizedJobStatus,
  NormalizedResume,
  PlatformCredentials,
  ProviderCapabilities,
  ScreenerAnswer,
} from "./types.js";
import { buildSourceFeed } from "./feed.js";
import { dt, header, str, timingSafeEqualStr } from "./http.js";
import { warnStub } from "./stub-logger.js";

const PROVIDER = "wellfound" as const;

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

/**
 * Capabilities: feed-only (Wellfound PULLS the ATS feed). No programmatic post-API,
 * no JSON-LD on this surface, no disposition push, no talent-search. An apply
 * webhook is set to true so a CONFIGURED partner application-writeback can route
 * through the inbound ingress; absent that wiring parseApplication simply returns
 * null (the default apply flow redirects to our public apply page).
 */
const CAPS: ProviderCapabilities = {
  postApi: false,
  feed: true,
  jsonLd: false,
  // A configured partner relationship MAY push an application-writeback; the
  // default flow redirects to our public apply page (parseApplication -> null).
  applyWebhook: true,
  dispositionSync: false,
  searchCandidates: false,
};

export const wellfoundProvider: HiringPlatformProvider = {
  id: PROVIDER,
  caps: CAPS,

  /**
   * Inverted model: Wellfound has no partner job-create API, so there is nothing to
   * post. Return PENDING_PARTNER_APPROVAL with an EMPTY externalId and an honest
   * 'inverted / relationship integration' note - the feed is the real distribution
   * surface (Wellfound ingests it on its own crawl). NEVER a fabricated ACTIVE / id.
   */
  async postJob(
    _job: NormalizedJob,
    _creds: PlatformCredentials,
  ): Promise<{ externalId: string; externalUrl?: string; status: NormalizedJobStatus; raw: unknown }> {
    // STUB path: no board API is called (Wellfound is inverted / feed-pull, no
    // outbound job-create API). Warn at runtime.
    warnStub(PROVIDER, "no-public-post-api");
    return {
      externalId: "",
      status: "PENDING_PARTNER_APPROVAL",
      raw: {
        stub: true,
        reason: "no-public-post-api",
        model: "inverted",
        note: "Wellfound pulls the ATS job feed (inverted / relationship integration); there is no outbound partner job-create API. The job is distributed via the generic feed (toFeedEntry), subject to the Wellfound partner relationship setup.",
      },
    };
  },

  /**
   * Nothing to close via API (no posting was created through a partner call). A job
   * drops from Wellfound when it leaves the tenant's feed on the next crawl.
   * Idempotent no-op (never throws).
   */
  async closeJob(_externalId: string, _creds: PlatformCredentials): Promise<void> {
    // Feed-driven lifecycle: removing the job from the feed expires it on next crawl.
  },

  /**
   * Serialize the job into ONE entry of the generic `<source>` pull feed Wellfound
   * crawls (a single-job snapshot via the shared WF-F builder). Pure function of the
   * job - no network, no creds.
   */
  toFeedEntry(job: NormalizedJob): string {
    return buildSourceFeed([job]);
  },

  /**
   * Verify a CONFIGURED Wellfound application-writeback callback. When a partner
   * relationship wires the writeback it signs the RAW body HMAC-SHA256 (the partner
   * setup decides hex or base64; we accept either, both timing-safe) in an
   * `X-Wellfound-Signature` / `X-AngelList-Signature` header keyed by the tenant's
   * stored webhook secret. Returns false when no secret is configured (an
   * unverifiable callback is rejected) or the signature mismatches. Runs over the
   * EXACT raw bytes the writeback signed (the inbound router must not parse first).
   */
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
    secret?: string,
  ): boolean {
    if (!secret) return false;
    const sig =
      header(headers, "x-wellfound-signature") ??
      header(headers, "x-angellist-signature") ??
      header(headers, "x-webhook-signature");
    if (!sig) return false;
    const expectedHex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const expectedB64 = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
    const provided = sig.replace(/^sha256=/i, "").trim();
    return (
      timingSafeEqualStr(expectedHex.toLowerCase(), provided.toLowerCase()) ||
      timingSafeEqualStr(expectedB64, provided)
    );
  },

  /**
   * Parse a verified Wellfound application-writeback payload into a
   * {@link NormalizedApplication}. Returns null for a ping / redirect-only event or
   * any payload that does not carry the configured writeback shape (the two
   * correlation keys + a real applicant identity) - the router then ack-ignores it
   * rather than persist a phantom candidate. NEVER synthesizes a candidate or
   * applyId. The default Wellfound apply flow redirects applicants to our public
   * apply page, so most tenants never see an inbound event here at all.
   */
  parseApplication(rawBody: string): NormalizedApplication | null {
    let payload: AnyObj;
    try {
      payload = obj(JSON.parse(rawBody));
    } catch {
      return null;
    }

    // Only an actual application-writeback event yields an application; a ping /
    // test / redirect-ack is ignored honestly.
    const eventType = String(
      payload["event"] ?? payload["type"] ?? payload["eventType"] ?? payload["event_type"] ?? "",
    ).toLowerCase();
    if (eventType && /ping|test|heartbeat|redirect|subscription/.test(eventType)) return null;
    if (eventType && !eventType.includes("appl")) return null;

    const application = obj(payload["application"] ?? payload["data"] ?? payload);
    const applicant = obj(
      application["candidate"] ?? application["applicant"] ?? application["user"] ?? application,
    );

    // Both correlation keys must be REAL (the inbound dedupe key + the posting id the
    // application targets); without them this is not a routable writeback -> null.
    const externalApplyId = str(
      application["application_id"] ??
        application["applicationId"] ??
        application["id"] ??
        payload["application_id"] ??
        payload["id"],
    );
    const jobExternalId = str(
      application["job_id"] ??
        application["jobId"] ??
        application["job_reference"] ??
        application["referenceId"] ??
        payload["job_id"] ??
        obj(application["job"])["id"],
    );
    if (!externalApplyId || !jobExternalId) return null;

    const candidate = parseApplicant(applicant);
    if (!candidate) return null; // no real identity => honest null, never a placeholder

    const appliedAt =
      dt(
        application["applied_at"] ??
          application["appliedAt"] ??
          application["created_at"] ??
          application["submitted_at"] ??
          payload["timestamp"],
      ) ?? new Date();

    const resume = parseResume(obj(application["resume"] ?? applicant["resume"]));
    const screenerAnswers = parseScreenerAnswers(
      application["screener_answers"] ?? application["answers"] ?? application["questions"],
    );
    const coverLetter = str(
      application["cover_letter"] ?? application["coverLetter"] ?? applicant["cover_letter"],
    );

    return {
      provider: PROVIDER,
      jobExternalId,
      externalApplyId,
      appliedAt,
      candidate,
      ...(resume ? { resume } : {}),
      screenerAnswers,
      ...(coverLetter ? { coverLetter } : {}),
      raw: payload,
    };
  },
};

/** Build a NormalizedApplicant from a Wellfound writeback applicant node, or null
 *  when it lacks a real first/last name + email (we never default to a placeholder). */
function parseApplicant(applicant: AnyObj): NormalizedApplicant | null {
  const email = str(applicant["email"] ?? applicant["email_address"] ?? applicant["emailAddress"]);
  if (!email) return null;

  let firstName = str(applicant["first_name"] ?? applicant["firstName"] ?? applicant["given_name"]);
  let lastName = str(applicant["last_name"] ?? applicant["lastName"] ?? applicant["family_name"]);
  // Wellfound sometimes sends a single `name`; split it only when the parts are
  // genuinely absent (never invent a last name).
  if (!firstName && !lastName) {
    const full = str(applicant["name"] ?? applicant["full_name"] ?? applicant["fullName"]);
    if (full) {
      const parts = full.split(/\s+/);
      firstName = parts[0];
      if (parts.length > 1) lastName = parts.slice(1).join(" ");
    }
  }
  if (!firstName || !lastName) return null;

  const phone = str(applicant["phone"] ?? applicant["phone_number"] ?? applicant["phoneNumber"]);
  const location = str(applicant["location"] ?? applicant["city"] ?? applicant["address"]);
  return {
    firstName,
    lastName,
    email,
    ...(phone ? { phone } : {}),
    ...(location ? { location } : {}),
  };
}

/** Build a NormalizedResume from a Wellfound resume node, or null when it carries
 *  neither inline bytes nor a fetchable URL (honest absence, not a stub). */
function parseResume(resume: AnyObj): NormalizedResume | null {
  const base64 = str(resume["content"] ?? resume["base64"] ?? resume["data"] ?? resume["file_content"]);
  const mediaUrl = str(
    resume["url"] ?? resume["download_url"] ?? resume["file_url"] ?? resume["media_url"] ?? resume["mediaUrl"],
  );
  if (!base64 && !mediaUrl) return null;
  const fileName = str(resume["file_name"] ?? resume["filename"] ?? resume["name"]) ?? "resume";
  const contentType =
    str(resume["content_type"] ?? resume["mime_type"] ?? resume["mimetype"]) ?? "application/octet-stream";
  return {
    fileName,
    contentType,
    ...(base64 ? { base64 } : {}),
    ...(mediaUrl ? { mediaUrl } : {}),
  };
}

/** Map a Wellfound screener-answers payload (array or object) into normalized Q&A,
 *  passthrough only - never synthesized. */
function parseScreenerAnswers(raw: unknown): ScreenerAnswer[] {
  const out: ScreenerAnswer[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const a = obj(item);
      const question = str(a["question"] ?? a["prompt"] ?? a["label"]);
      const answer = str(a["answer"] ?? a["response"] ?? a["value"]);
      if (question && answer) out.push({ question, answer });
    }
  } else if (raw && typeof raw === "object") {
    for (const [question, value] of Object.entries(raw as AnyObj)) {
      const answer = str(value);
      if (question && answer) out.push({ question, answer });
    }
  }
  return out;
}

export default wellfoundProvider;
