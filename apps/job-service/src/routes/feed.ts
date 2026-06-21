/**
 * Public job feed route (job-service) - WF-F / SLICE F2.
 *
 *   GET /public/feed/:tenantSlug/jobs.xml?token=&format=indeed|linkedin|adzuna|jooble
 *
 * Serves a tenant's COMPLETE set of published jobs as a syndication feed an
 * aggregator (Indeed-style source feed, LinkedIn, Adzuna, Jooble) pulls on a
 * crawl. This is the PULL half of the distribution layer (the push/programmatic
 * half is the board-post worker, WF-G); a board that ingests a feed rather than
 * accepting a post points its crawler at this URL.
 *
 * The gateway forwards /api/public/* -> job-service /public/* unauthenticated (see
 * the api-gateway /api/public proxy), so the public-facing URL is
 *   GET /api/public/feed/:tenantSlug/jobs.xml?token=...&format=...
 * and NO gateway edit is needed - this router mounts under the existing /public
 * tree at /public/feed.
 *
 * == SECURITY ================================================================
 * The per-tenant bearer `token` (JobFeedToken row) IS the credential: it resolves
 * the owning tenant with no auth context. `:tenantSlug` is a human-readable path
 * label only (it makes the URL self-describing for the board operator) and is NOT
 * trusted for authorization - the token alone decides which tenant's jobs are
 * served, so a guessed/forged slug cannot leak another tenant's postings. A
 * missing or unknown token is rejected 401 (NEVER a sample feed). The lookup uses
 * the admin (non-RLS) client because the request carries no tenant context yet -
 * the same pattern as the unauthenticated /public by-slug routes.
 *
 * == HARD RULES ==============================================================
 *  - REAL data or empty envelope. Only this tenant's `isPublished` postings (with a
 *    real `publishedAt`) are served; a tenant with zero published jobs gets a valid
 *    but EMPTY <source> envelope, never a fabricated/sample job.
 *  - FULL snapshot, no deltas. The complete distributable set is serialized every
 *    request (the aggregator diffs against its own prior crawl). Stable ordering +
 *    stable referencenumber = JobPosting id, so a re-crawl dedupes cleanly.
 *  - Response is gzip'd (Content-Encoding: gzip, Content-Type: application/xml).
 *  - No em / en dashes in emitted text.
 *
 * Materialize-to-MinIO + a nightly cron that pre-builds the gzip blob is an
 * OPTIONAL future optimization (this route builds on demand, which is correct for
 * the low feed-crawl rate); see the NOTE at the foot of the file.
 */
import { gzipSync } from "node:zlib";
import { Router, type Request, type Response, type NextFunction } from "express";
import { Errors } from "@cdc-ats/common";
// Public (unauthenticated) feed: resolves the tenant from the token with no tenant
// in context, so it uses the admin (non-RLS) client, like the other /public routes.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import { toNormalizedJob, type PostingForFeed } from "../lib/normalize-job.js";
import {
  buildSourceFeed,
  toAdzunaFeed,
  toJoobleFeed,
  type FeedMeta,
} from "../providers/hiringplatform/feed.js";
import type { NormalizedJob } from "../providers/hiringplatform/types.js";

const router = Router();

/** Public origin applicants land on (no trailing slash enforced by the mapper). */
const APP_URL = process.env["APP_URL"] ?? "http://localhost:3000";
/** Real public contact email for listings, or "" -> the builder omits <email>
 *  (NEVER a fabricated per-tenant address). */
const FEED_CONTACT_EMAIL = process.env["FEED_CONTACT_EMAIL"] ?? "";

/** The feed channels this route can serialize. `indeed` + `linkedin` both consume
 *  the canonical <source>/<job> envelope (the de-facto source-feed schema); adzuna
 *  + jooble have their own thin transforms. An unknown/absent format falls back to
 *  the default <source> envelope. */
type FeedFormat = "indeed" | "linkedin" | "adzuna" | "jooble";

function parseFormat(raw: unknown): FeedFormat | "default" {
  const f = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (f === "indeed" || f === "linkedin" || f === "adzuna" || f === "jooble") return f;
  return "default";
}

/** Serialize the full job set for the requested channel. */
function buildFeed(format: FeedFormat | "default", jobs: NormalizedJob[], meta: FeedMeta): string {
  switch (format) {
    case "adzuna":
      return toAdzunaFeed(jobs);
    case "jooble":
      return toJoobleFeed(jobs);
    // indeed + linkedin + default all use the canonical <source>/<job> envelope.
    case "indeed":
    case "linkedin":
    default:
      return buildSourceFeed(jobs, meta);
  }
}

// GET /public/feed/:tenantSlug/jobs.xml?token=&format=
router.get(
  "/:tenantSlug/jobs.xml",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The token (query OR Authorization: Bearer) is the credential; the slug is
      // a cosmetic path label only and is NOT trusted for authorization.
      const queryToken = typeof req.query["token"] === "string" ? (req.query["token"] as string).trim() : "";
      const authHeader = req.headers.authorization ?? "";
      const bearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
      const token = queryToken || bearer;
      if (!token) throw Errors.unauthorized("A feed token is required");

      // Resolve the owning tenant from the token alone (admin client - no tenant
      // context on this public path). An unknown token is rejected, never served a
      // sample feed.
      const feedToken = await prisma.jobFeedToken.findUnique({
        where: { token },
        select: { tenantId: true },
      });
      if (!feedToken) throw Errors.unauthorized("Invalid feed token");
      const tenantId = feedToken.tenantId;

      const format = parseFormat(req.query["format"]);

      // The COMPLETE published set for this tenant (full snapshot). Stable ordering
      // by publishedAt so a re-crawl is deterministic; only real published rows.
      const postings = await prisma.jobPosting.findMany({
        where: { tenantId, isPublished: true },
        orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          requirements: true,
          publishedAt: true,
          expiresAt: true,
          requisition: {
            select: {
              department: true,
              location: true,
              country: true,
              salaryMin: true,
              salaryMax: true,
              salaryCurrency: true,
            },
          },
        },
      });

      const ctx = { appUrl: APP_URL, contactEmail: FEED_CONTACT_EMAIL };
      const jobs: NormalizedJob[] = postings.map((p) =>
        toNormalizedJob(p as unknown as PostingForFeed, ctx),
      );

      // A tenant with zero published jobs gets a valid but EMPTY envelope (the
      // builder emits a well-formed <source> with no <job> rows), never a sample.
      const meta: FeedMeta = { publisherUrl: APP_URL.replace(/\/+$/, "") };
      const xml = buildFeed(format, jobs, meta);

      const gz = gzipSync(Buffer.from(xml, "utf8"));
      res.status(200);
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Content-Encoding", "gzip");
      // A feed is a fresh full snapshot each crawl; allow short edge caching but
      // never serve a stale snapshot indefinitely.
      res.setHeader("Cache-Control", "public, max-age=300");
      res.setHeader("Vary", "Accept-Encoding");
      res.end(gz);
    } catch (err) {
      next(err);
    }
  },
);

export default router;

// NOTE (optional, not built here): for a high feed-crawl rate this on-demand build
// can be replaced by a nightly cron that materializes the gzip'd snapshot per
// (tenant, format) to MinIO and serves the object directly (with an ETag). The
// route shape + token check stay identical; only the body source changes. Building
// on demand is correct at the current crawl rate (boards poll on the order of once
// per hour), so the materialization layer is deferred.
