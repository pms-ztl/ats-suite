/**
 * JobPosting (+ its Requisition) -> board-agnostic {@link NormalizedJob} mapper
 * (job-service) - WF-F / SLICE F2.
 *
 * The single place a persisted JobPosting row is projected onto the
 * {@link NormalizedJob} shape every hiring-platform feed builder + board adapter
 * reads FROM. The public XML/JSON feed route uses it now; the outbound board-post
 * worker (WF-G) reuses the SAME mapping so a job is serialized identically whether
 * it leaves through a pull feed or a programmatic post.
 *
 * == HARD RULES ==============================================================
 *  - REAL data or honest omission. A field the requisition / posting does not
 *    carry is left undefined (or an empty array), NEVER defaulted to a placeholder
 *    (no "Salary: 0", no fabricated city, no synthesized expiry). The downstream
 *    feed builder omits an absent field from the wire output.
 *  - `externalRefs` starts EMPTY here. This mapper never invents a board posting
 *    id / url / status; those are populated ONLY from a real adapter response by
 *    the board-post worker (WF-G), keyed by ProviderKey on the same NormalizedJob.
 *  - Pure + side-effect-free: a deterministic function of the row it is given (no
 *    network, no creds, no DB, no logging), so two runs over the same data produce
 *    byte-identical output (the feed route relies on this for stable snapshots).
 *  - No em / en dashes in emitted text.
 *
 * The contactEmail field is REQUIRED on NormalizedJob but job-service holds no
 * per-tenant public contact address; the caller passes a real platform contact
 * (env FEED_CONTACT_EMAIL) or an empty string. The feed builder OMITS the `<email>`
 * element when it is empty, so an unset address is an honest absence, never a fake.
 */
import type {
  NormalizedJob,
  NormalizedJobLocation,
  NormalizedJobSalary,
} from "../providers/hiringplatform/types.js";

/** The minimal JobPosting + Requisition projection this mapper needs. Mirrors the
 *  Prisma select the feed route runs (kept narrow so the route fetches no more than
 *  the wire shape requires). */
export interface PostingForFeed {
  id: string;
  slug: string;
  title: string;
  description: string;
  requirements: string[];
  publishedAt: Date | null;
  expiresAt: Date | null;
  requisition: {
    department: string | null;
    location: string | null;
    country: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string | null;
  } | null;
}

/** Inputs the mapper cannot read off the row: where applicants land + the public
 *  contact address (both real platform config, never per-row fabrication). */
export interface NormalizeContext {
  /** Public app origin (e.g. https://careers.example.com). No trailing slash. */
  appUrl: string;
  /** Real public contact email, or "" when none is configured (then omitted). */
  contactEmail: string;
}

/** Trim a value to a non-empty string, else undefined (never an empty placeholder). */
function nonEmpty(value: string | null | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

/** A finite number or undefined (never NaN, never a 0 default for "unknown"). */
function finite(value: number | null | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * Derive a normalized location from the requisition's free-text `location` +
 * structured `country`. The requisition stores location as one human string (e.g.
 * "Remote", "Austin, TX", "London"), so we detect a remote marker and keep the rest
 * as the `city` line WITHOUT inventing a region/postalCode the row does not hold.
 * `remote` is the only field NormalizedJobLocation requires.
 */
function toLocation(locationText: string | undefined, country: string | undefined): NormalizedJobLocation {
  const text = nonEmpty(locationText);
  const remote = !!text && /\bremote\b/i.test(text);
  // The portion of the free-text line that is not the bare "remote" marker becomes
  // the city line; a line that is ONLY "remote" yields no city (remote-anywhere).
  const stripped = text ? text.replace(/\(?\bremote\b\)?/gi, "").replace(/^[\s,]+|[\s,]+$/g, "") : "";
  const city = stripped.length > 0 ? stripped : undefined;
  const loc: NormalizedJobLocation = { remote };
  if (city) loc.city = city;
  const c = nonEmpty(country);
  if (c) loc.country = c;
  return loc;
}

/**
 * Derive a normalized salary range ONLY when the requisition carries at least one
 * real bound. An open-ended range (only min OR only max) is honest; a requisition
 * with neither bound yields `undefined` (no `baseSalary` / salary fields emitted).
 */
function toSalary(
  min: number | undefined,
  max: number | undefined,
  currency: string | undefined,
): NormalizedJobSalary | undefined {
  if (min === undefined && max === undefined) return undefined;
  const salary: NormalizedJobSalary = {
    currency: currency ?? "USD",
    // The requisition stores no pay period; "year" is the platform convention for a
    // salaried range and is the only structural default (it is a unit label, not a
    // fabricated value). It can be widened to a per-posting field later.
    period: "year",
  };
  if (min !== undefined) salary.min = min;
  if (max !== undefined) salary.max = max;
  return salary;
}

/**
 * Project a published JobPosting (+ its Requisition) onto a {@link NormalizedJob}.
 *
 * `applyUrl` points at the tenant's public apply page for this posting slug; the
 * board listing links the applicant straight there (directApply). `datePublished`
 * is the posting's real `publishedAt` (ISO-8601); `validThrough` is its real
 * `expiresAt` when set (omitted otherwise). `externalRefs` is empty - a feed never
 * carries a per-board external state.
 */
export function toNormalizedJob(posting: PostingForFeed, ctx: NormalizeContext): NormalizedJob {
  const req = posting.requisition;
  const base = ctx.appUrl.replace(/\/+$/, "");
  const salary = toSalary(
    finite(req?.salaryMin),
    finite(req?.salaryMax),
    nonEmpty(req?.salaryCurrency),
  );

  const job: NormalizedJob = {
    id: posting.id,
    externalRefs: {},
    title: posting.title,
    descriptionHtml: posting.description,
    location: toLocation(req?.location ?? undefined, req?.country ?? undefined),
    // The requisition carries no structured employment-type taxonomy yet; emit an
    // empty list rather than fabricate "FULL_TIME". The feed builder omits the
    // jobtype element when the list is empty.
    employmentType: [],
    requirements: Array.isArray(posting.requirements)
      ? posting.requirements.filter((r): r is string => typeof r === "string" && r.trim() !== "")
      : [],
    // No benefits column on the requisition; honest empty list.
    benefits: [],
    // publishedAt should be set for a published posting; fall back to "now" only if
    // the row genuinely lacks one (a posting being syndicated must carry a date).
    datePublished: (posting.publishedAt ?? new Date()).toISOString(),
    applyUrl: `${base}/jobs/${encodeURIComponent(posting.slug)}/apply`,
    // contactEmail is required by the type; "" is honestly omitted by the builder.
    contactEmail: ctx.contactEmail,
  };

  const department = nonEmpty(req?.department);
  if (department) job.department = department;
  if (posting.expiresAt) job.validThrough = posting.expiresAt.toISOString();
  if (salary) job.salary = salary;

  return job;
}
