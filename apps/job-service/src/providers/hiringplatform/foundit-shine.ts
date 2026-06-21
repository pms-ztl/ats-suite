/**
 * foundit (formerly Monster India / APAC) + Shine.com adapters (job-service
 * hiring-platform axis) - WF-H / SLICE H3.
 *
 * Both foundit and Shine are credential-stored connectors with NO documented public
 * employer job-posting API. The real integration path for each is a manual partner
 * arrangement (a signed commercial agreement + a privately-issued endpoint/credential
 * set), NOT a self-serve REST surface we can call. So these are the lowest-priority,
 * deliberately HONEST stubs in the registry:
 *
 *  - {@link ProviderCapabilities} is mostly FALSE (no postApi, no feed, no jsonLd, no
 *    inbound apply webhook, no disposition push, no talent-search). A tenant who has
 *    arranged a private foundit/Shine partner contract supplies its endpoint + secret
 *    out of band; this module ships NO baked-in endpoint to call.
 *  - {@link foundit-shine.postJob} returns PENDING_PARTNER_APPROVAL with an EMPTY
 *    externalId and a clear `no-public-api` flag. It NEVER invents an ACTIVE posting,
 *    a synthetic external id, or a guessed endpoint URL.
 *  - {@link foundit-shine.parseApplication} returns `null` unconditionally (no
 *    documented signed inbound callback exists), so no phantom candidate is ever
 *    created. The default apply flow for these boards redirects applicants to OUR
 *    public apply page (they become real Candidates through `/public/jobs/:slug/apply-custom`).
 *  - {@link foundit-shine.verifyWebhook} returns `false` unconditionally: with no
 *    documented signing scheme any inbound callback claiming to be foundit/shine is
 *    unverifiable, so it is rejected rather than trusted.
 *
 * == NO scrapers, NO fabricated endpoints ====================================
 * foundit and Shine both gate their resume databases behind manually-contracted
 * products whose ToS forbid programmatic scraping. This module therefore exposes NO
 * search surface and NO speculative REST endpoint. The honest "no public API" flag
 * keeps the distribution UI truthful (the board appears as a manual/partner-pending
 * connector) instead of silently failing or faking a post.
 *
 * == HARD RULES ==============================================================
 *  - REAL data or honest null: no API -> PENDING_PARTNER_APPROVAL, never a fake ACTIVE.
 *  - parseApplication null (no real signed payload) -> no auto-reject, no phantom.
 *  - verifyWebhook false (no documented signature) -> a forged callback is rejected.
 *  - No em / en dashes in emitted text.
 *
 * This is the HIRING-PLATFORM axis, DISTINCT from the assessment-provider axis.
 * Credentials, when a tenant stores them for a private contract, are decrypted per
 * call by the caller and are NEVER persisted or logged here (this stub never reads
 * or transmits them - there is no endpoint to send them to).
 */
import type {
  HiringPlatformProvider,
  NormalizedApplication,
  NormalizedJob,
  NormalizedJobStatus,
  PlatformCredentials,
  ProviderCapabilities,
  ProviderKey,
} from "./types.js";

/**
 * A credential-stored connector with no documented public API exposes no real
 * capabilities. Every flag is FALSE: there is nothing honest to claim until a
 * manual partner contract provides a private surface (which is configured out of
 * band, not through this adapter).
 */
const NO_PUBLIC_API_CAPS: ProviderCapabilities = {
  postApi: false,
  feed: false,
  jsonLd: false,
  applyWebhook: false,
  dispositionSync: false,
  searchCandidates: false,
};

/**
 * Build a no-public-API connector adapter for `id`. The display name is folded into
 * the honest PENDING_PARTNER_APPROVAL note so the distribution UI / logs read
 * truthfully ("foundit"/"Shine has no public employer API; arrange a manual partner
 * contract"). NEVER fabricates a posting, an endpoint, or an applicant.
 */
function makeNoPublicApiProvider(id: ProviderKey, displayName: string): HiringPlatformProvider {
  return {
    id,
    caps: NO_PUBLIC_API_CAPS,

    /**
     * No public job-posting API: there is nothing to call. Return
     * PENDING_PARTNER_APPROVAL with an EMPTY externalId and a clear `no-public-api`
     * flag so the row honestly records "awaiting a manual partner contract" rather
     * than a fabricated ACTIVE posting. NEVER invents an external id or an endpoint.
     */
    async postJob(
      _job: NormalizedJob,
      _creds: PlatformCredentials,
    ): Promise<{ externalId: string; externalUrl?: string; status: NormalizedJobStatus; raw: unknown }> {
      return {
        externalId: "",
        status: "PENDING_PARTNER_APPROVAL",
        raw: {
          reason: "no-public-api",
          provider: id,
          note: `${displayName} has no documented public employer job-posting API. Distribution requires a manual partner contract (a privately-issued endpoint + credentials configured out of band); this connector ships no baked-in endpoint and posts nothing automatically.`,
        },
      };
    },

    /**
     * Nothing was ever posted through an API, so there is nothing to close.
     * Idempotent no-op (never throws).
     */
    async closeJob(_externalId: string, _creds: PlatformCredentials): Promise<void> {
      // No API surface to close against; honest no-op.
    },

    /**
     * No documented signed inbound callback exists for this board, so any callback
     * claiming to be it is unverifiable. Reject it (return false) rather than trust
     * an unsigned / unverifiable payload.
     */
    verifyWebhook(
      _headers: Record<string, string | string[] | undefined>,
      _rawBody: string,
      _secret?: string,
    ): boolean {
      return false;
    },

    /**
     * No real inbound application arrives via this board (the default apply flow
     * redirects applicants to OUR public apply page). Honest null rather than a
     * fabricated candidate - this keeps a forged or speculative payload from ever
     * creating a phantom Candidate.
     */
    parseApplication(_rawBody: string): NormalizedApplication | null {
      return null;
    },
  };
}

/**
 * foundit (formerly Monster India / APAC). Credential-stored connector, no public
 * employer API; honest PENDING_PARTNER_APPROVAL / no-public-api stub.
 */
export const founditProvider: HiringPlatformProvider = makeNoPublicApiProvider("foundit", "foundit");

/**
 * Shine.com. Credential-stored connector, no public employer API; honest
 * PENDING_PARTNER_APPROVAL / no-public-api stub.
 */
export const shineProvider: HiringPlatformProvider = makeNoPublicApiProvider("shine", "Shine");

export default { founditProvider, shineProvider };
