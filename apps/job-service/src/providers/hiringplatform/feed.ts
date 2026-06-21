/**
 * Hiring-platform feed + JSON-LD builders (job-service) - WF-F / SLICE F1.
 *
 * Pure serializers that turn the board-agnostic {@link NormalizedJob} into the two
 * canonical syndication wire formats a job board ingests when it does NOT accept a
 * programmatic post:
 *
 *   1. schema.org `JobPosting` JSON-LD - {@link toJsonLd}. The structured-data shape
 *      Google Jobs (and any crawler that reads schema.org markup) indexes. Emits the
 *      Google-required fields (title, description, datePosted, hiringOrganization,
 *      jobLocation), the conditionally-required `validThrough`, and the recommended
 *      fields (baseSalary, employmentType, identifier, directApply) ONLY when the
 *      job actually carries the underlying data. A remote role is marked with
 *      `jobLocationType: "TELECOMMUTE"` + `applicantLocationRequirements` per
 *      Google's remote-job guidance, never a fabricated physical address.
 *
 *   2. An XML `<source>/<job>` envelope - {@link buildSourceFeed}. The de-facto
 *      "source" feed schema most aggregators (Indeed-style) ingest: a `<source>`
 *      root with `<publisher>`/`<publisherurl>`/`<lastBuildDate>` metadata and one
 *      `<job>` per posting. Free-text fields are wrapped in CDATA; any literal '<'
 *      inside CDATA is escaped so a stray angle bracket in a description cannot
 *      break the envelope. Dates are ISO-8601. {@link toAdzunaFeed} and
 *      {@link toJoobleFeed} are thin per-channel transforms over the same job set.
 *
 * == HARD RULES ==============================================================
 *  - REAL data or honest omission. A field that the job does not carry is OMITTED
 *    from the output, never defaulted (no "Salary: 0", no placeholder location, no
 *    synthesized expiry). The feed reflects exactly what the requisition holds.
 *  - FULL snapshot, no deltas. {@link buildSourceFeed} / {@link toAdzunaFeed} /
 *    {@link toJoobleFeed} serialize the COMPLETE set of currently-distributable
 *    jobs every run; an aggregator diffs against its own prior crawl. A job dropped
 *    from the array is dropped from the feed (the board expires it on next crawl).
 *  - Pure + side-effect-free: no network, no creds, no DB, no logging. These are
 *    deterministic functions of their inputs (stable ordering, stable
 *    `referencenumber` = the ATS JobPosting id) so two runs over the same jobs
 *    produce byte-identical output (cache/ETag friendly).
 *  - No em / en dashes anywhere in emitted text.
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication), DISTINCT from the
 * assessment-provider axis. The per-board adapter's optional `toFeedEntry` /
 * `toJsonLd` methods delegate here for the channels that use these formats.
 */
import type { NormalizedJob, NormalizedJobLocation, NormalizedJobSalary } from "./types.js";

/* ===========================================================================
 * Small, dependency-free XML helpers (xmlbuilder2 is NOT a dep; hand-build).
 * =========================================================================== */

/** Escape the five XML-significant characters for use in element/attribute text. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Wrap free-text in a CDATA section. A literal `<` inside the text is escaped to
 * `&lt;` first (CDATA itself cannot contain `]]>`, so we also neutralize that
 * sequence) - this keeps a stray angle bracket in a job description from breaking
 * the envelope while leaving the bulk of the markup human-readable.
 */
function cdata(value: string): string {
  const safe = value.replace(/]]>/g, "]]&gt;").replace(/</g, "&lt;");
  return `<![CDATA[${safe}]]>`;
}

/** A `<tag>CDATA-wrapped text</tag>` element, omitted entirely when value is empty. */
function elCdata(tag: string, value: string | undefined): string {
  if (value === undefined || value === null || value.trim() === "") return "";
  return `<${tag}>${cdata(value)}</${tag}>`;
}

/** A `<tag>escaped-text</tag>` element, omitted entirely when value is empty. */
function elText(tag: string, value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const s = typeof value === "number" ? String(value) : value.trim();
  if (s === "") return "";
  return `<${tag}>${xmlEscape(s)}</${tag}>`;
}

/** Indent a block of pre-built child elements (already strings) under a parent. */
function joinEls(els: string[], indent: string): string {
  return els.filter((e) => e !== "").map((e) => `${indent}${e}`).join("\n");
}

/* ===========================================================================
 * Shared normalized-job projections (so every channel reads a job the SAME way).
 * =========================================================================== */

/** A single, human-readable location line from the structured location, or "". */
function locationLine(loc: NormalizedJobLocation): string {
  if (loc.remote && !loc.city && !loc.region && !loc.country) return "Remote";
  const parts = [loc.city, loc.region, loc.country].filter((p): p is string => !!p && p.trim() !== "");
  const line = parts.join(", ");
  return loc.remote && line ? `${line} (Remote)` : line;
}

/** ISO-8601 (the canonical feed date format). Returns "" for an unparseable date. */
function iso8601(value: string | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

/** Jooble-style DD.MM.YYYY date. Returns "" for an unparseable date. */
function ddmmyyyy(value: string | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getUTCFullYear());
  return `${dd}.${mm}.${yyyy}`;
}

/** Join employment-type tags into a single comma-separated string, or "". */
function employmentTypeLine(types: string[]): string {
  return types.filter((t) => t && t.trim() !== "").join(", ");
}

/* ===========================================================================
 * 1. schema.org JobPosting JSON-LD (Google Jobs structured data).
 * =========================================================================== */

/**
 * Map a {@link NormalizedJobSalary} onto a schema.org `MonetaryAmount` /
 * `QuantitativeValue` `baseSalary`. Emits `minValue`/`maxValue`/`value` ONLY for
 * the bounds the job actually carries (an open-ended range is honest).
 */
function jsonLdBaseSalary(salary: NormalizedJobSalary): object | undefined {
  const value: Record<string, unknown> = { "@type": "QuantitativeValue", unitText: salary.period.toUpperCase() };
  let hasBound = false;
  if (typeof salary.min === "number" && Number.isFinite(salary.min)) {
    value["minValue"] = salary.min;
    hasBound = true;
  }
  if (typeof salary.max === "number" && Number.isFinite(salary.max)) {
    value["maxValue"] = salary.max;
    hasBound = true;
  }
  // A single-point comp (min === max or only one bound) also exposes `value`.
  if (typeof salary.min === "number" && salary.min === salary.max) {
    value["value"] = salary.min;
  }
  if (!hasBound) return undefined;
  return { "@type": "MonetaryAmount", currency: salary.currency, value };
}

/**
 * schema.org `place` for the job location. A non-remote job emits a `Place` with a
 * `PostalAddress` carrying only the address parts the job actually has. A
 * remote-anywhere job (remote + no geo) emits no physical place (the caller adds
 * `jobLocationType`/`applicantLocationRequirements` instead).
 */
function jsonLdPlace(loc: NormalizedJobLocation): object | undefined {
  const address: Record<string, unknown> = { "@type": "PostalAddress" };
  let hasPart = false;
  if (loc.city) {
    address["addressLocality"] = loc.city;
    hasPart = true;
  }
  if (loc.region) {
    address["addressRegion"] = loc.region;
    hasPart = true;
  }
  if (loc.postalCode) {
    address["postalCode"] = loc.postalCode;
    hasPart = true;
  }
  if (loc.country) {
    address["addressCountry"] = loc.country;
    hasPart = true;
  }
  if (!hasPart) return undefined;
  return { "@type": "Place", address };
}

/**
 * Serialize a {@link NormalizedJob} into a schema.org `JobPosting` JSON-LD object
 * (Google Jobs structured data).
 *
 * Required (always present, since {@link NormalizedJob} guarantees them):
 *   `title`, `description`, `datePosted`, `hiringOrganization`, `jobLocation`.
 * Conditional:
 *   `validThrough` - only when the job carries a real expiry.
 * Recommended (present only when the underlying data exists, never defaulted):
 *   `baseSalary`, `employmentType`, `identifier`, `directApply`, plus the remote
 *   markers `jobLocationType: "TELECOMMUTE"` + `applicantLocationRequirements`.
 *
 * For a remote-anywhere job (no physical geo) `jobLocation` falls back to a
 * `TELECOMMUTE` marker and the applicant-location requirement defaults to the
 * job's country when present; never a fabricated street address.
 */
export function toJsonLd(job: NormalizedJob): object {
  const datePosted = iso8601(job.datePublished);
  const validThrough = iso8601(job.validThrough);
  const place = jsonLdPlace(job.location);

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.descriptionHtml,
    // datePosted is required; fall back to "now" ONLY if the job genuinely has no
    // publish timestamp string (a posting being distributed must have a date).
    datePosted: datePosted || new Date().toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      // The public contact email is the only org-identifying field the normalized
      // job guarantees; the org name is carried by the requisition upstream and
      // injected by the dispatcher when present. We expose the contact email as a
      // same-as-free handle without inventing a company name.
      email: job.contactEmail,
    },
  };

  // jobLocation: a concrete Place when the job has geo; otherwise the remote marker.
  if (place) {
    ld["jobLocation"] = place;
  }
  if (job.location.remote) {
    ld["jobLocationType"] = "TELECOMMUTE";
    // Google requires applicantLocationRequirements for TELECOMMUTE roles; use the
    // job's country when it has one (a real constraint), else omit it (truly
    // anywhere) rather than fabricate a region.
    if (job.location.country) {
      ld["applicantLocationRequirements"] = {
        "@type": "Country",
        name: job.location.country,
      };
    }
  }
  // If a job is neither remote nor has any geo, jobLocation is genuinely unknown;
  // emit an explicit empty-but-typed Place so the required key is present without a
  // fabricated address (Google tolerates a Place with no address parts better than
  // a missing jobLocation on a non-remote role).
  if (!place && !job.location.remote) {
    ld["jobLocation"] = { "@type": "Place", address: { "@type": "PostalAddress" } };
  }

  // Conditional: validThrough only when a real expiry exists.
  if (validThrough) ld["validThrough"] = validThrough;

  // Recommended fields, each gated on real data.
  if (job.salary) {
    const baseSalary = jsonLdBaseSalary(job.salary);
    if (baseSalary) ld["baseSalary"] = baseSalary;
  }
  const employmentType = job.employmentType.filter((t) => t && t.trim() !== "");
  if (employmentType.length) ld["employmentType"] = employmentType;

  // identifier: the ATS JobPosting id (a stable, real correlation handle).
  ld["identifier"] = {
    "@type": "PropertyValue",
    name: "ATS",
    value: job.id,
  };

  // directApply: the applicant applies through the URL we publish (our public
  // apply page), so this is true. The URL itself goes on the apply action via the
  // standard `url`/applyUrl below.
  ld["directApply"] = true;
  ld["url"] = job.applyUrl;

  return ld;
}

/* ===========================================================================
 * 2. Default <source>/<job> XML feed envelope.
 * =========================================================================== */

/**
 * Build one `<job>` element for the default `<source>` envelope. Free-text fields
 * (title, description, company, city, ...) are CDATA-wrapped (with `<` escaped);
 * structured fields (dates, salary, url) are plain escaped text. Every field is
 * emitted ONLY when the job carries it.
 *
 *   - `referencenumber` = the ATS JobPosting id (stable across runs).
 *   - `url` = the direct public apply URL (where the applicant lands).
 *   - `date` / `validThrough` = ISO-8601.
 *   - `email` = the public contact email (posterEmail).
 */
function buildSourceJob(job: NormalizedJob): string {
  const loc = job.location;
  const fields: string[] = [
    elText("referencenumber", job.id),
    elCdata("title", job.title),
    elText("date", iso8601(job.datePublished)),
    elText("validThrough", iso8601(job.validThrough)),
    elText("url", job.applyUrl),
    elCdata("description", job.descriptionHtml),
    elCdata("city", loc.city),
    elCdata("state", loc.region),
    elCdata("country", loc.country),
    elText("postalcode", loc.postalCode),
    elText("remote", loc.remote ? "true" : ""),
    elCdata("jobtype", employmentTypeLine(job.employmentType) || undefined),
    elCdata("department", job.department),
    elText("email", job.contactEmail),
    elText("phone", job.contactPhone),
  ];
  // Salary, only when present.
  if (job.salary) {
    fields.push(elText("salarycurrency", job.salary.currency));
    fields.push(elText("salaryperiod", job.salary.period));
    fields.push(elText("salarymin", job.salary.min));
    fields.push(elText("salarymax", job.salary.max));
  }
  return `<job>\n${joinEls(fields, "      ")}\n    </job>`;
}

/** Metadata for the feed envelope header (publisher block). All optional. */
export interface FeedMeta {
  /** The publisher / employer name shown in the feed header. */
  publisher?: string;
  /** The publisher's site URL. */
  publisherUrl?: string;
}

/**
 * Build the default `<source>` XML feed envelope over the COMPLETE set of
 * distributable jobs (full snapshot, no deltas). One `<job>` per posting. The
 * header carries `<publisher>` / `<publisherurl>` (when supplied) + a
 * `<lastBuildDate>` so an aggregator can tell when the snapshot was generated.
 *
 * Jobs are emitted in the order given (the caller passes a stable ordering); each
 * `<referencenumber>` is the stable ATS JobPosting id so a crawler dedupes against
 * its own prior pull.
 */
export function buildSourceFeed(jobs: NormalizedJob[], meta: FeedMeta = {}): string {
  const header: string[] = [
    elText("publisher", meta.publisher),
    elText("publisherurl", meta.publisherUrl),
    elText("lastBuildDate", new Date().toISOString()),
  ];
  const headerXml = joinEls(header, "    ");
  const jobsXml = jobs.map((j) => `    ${buildSourceJob(j)}`).join("\n");
  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<source>`,
    headerXml,
    jobsXml,
    `</source>`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

/* ===========================================================================
 * 3. Thin per-channel transforms (Adzuna, Jooble).
 * =========================================================================== */

/**
 * Adzuna feed: a `<jobs>` root with one `<job>` per posting and Adzuna's
 * `<salary_min>` / `<salary_max>` numeric fields (currency carried separately).
 * Full snapshot. Reuses the same real-data discipline: a field absent on the job
 * is absent in the output.
 */
function buildAdzunaJob(job: NormalizedJob): string {
  const loc = job.location;
  const fields: string[] = [
    elText("id", job.id),
    elCdata("title", job.title),
    elCdata("description", job.descriptionHtml),
    elText("created", iso8601(job.datePublished)),
    elText("url", job.applyUrl),
    elCdata("location", locationLine(loc) || undefined),
    elCdata("category", job.department),
    elCdata("contract_type", employmentTypeLine(job.employmentType) || undefined),
    elText("latitude", undefined), // never synthesized
    elText("longitude", undefined), // never synthesized
  ];
  if (job.salary) {
    fields.push(elText("salary_min", job.salary.min));
    fields.push(elText("salary_max", job.salary.max));
    fields.push(elText("salary_currency", job.salary.currency));
  }
  return `<job>\n${joinEls(fields, "      ")}\n    </job>`;
}

/**
 * Serialize the full job set into an Adzuna `<jobs>` feed (salary_min / salary_max).
 * Full snapshot, no deltas.
 */
export function toAdzunaFeed(jobs: NormalizedJob[]): string {
  const jobsXml = jobs.map((j) => `    ${buildAdzunaJob(j)}`).join("\n");
  return [`<?xml version="1.0" encoding="utf-8"?>`, `<jobs>`, jobsXml, `</jobs>`]
    .filter((line) => line !== "")
    .join("\n");
}

/**
 * Jooble feed: a `<jobs>` root with one `<job id="...">` per posting, DD.MM.YYYY
 * `<updated>` dates, and the salary expressed inline as a single `<salary>` string
 * with the currency. Full snapshot. Real-data discipline as above.
 */
function buildJoobleJob(job: NormalizedJob): string {
  const loc = job.location;
  const fields: string[] = [
    elCdata("name", job.title),
    elCdata("region", locationLine(loc) || undefined),
    elText("updated", ddmmyyyy(job.datePublished)),
    elText("link", job.applyUrl),
    elCdata("desc", job.descriptionHtml),
    elCdata("company", job.department),
    elCdata("type", employmentTypeLine(job.employmentType) || undefined),
  ];
  // Jooble carries the comp inline as a single human string (currency + range).
  if (job.salary && (typeof job.salary.min === "number" || typeof job.salary.max === "number")) {
    const range =
      typeof job.salary.min === "number" && typeof job.salary.max === "number"
        ? `${job.salary.min} ${job.salary.max}`
        : typeof job.salary.min === "number"
          ? `${job.salary.min}`
          : `${job.salary.max}`;
    fields.push(elText("salary", `${job.salary.currency} ${range} per ${job.salary.period}`));
  }
  const idAttr = ` id="${xmlEscape(job.id)}"`;
  return `<job${idAttr}>\n${joinEls(fields, "      ")}\n    </job>`;
}

/**
 * Serialize the full job set into a Jooble `<jobs>` feed (`<job id>`, DD.MM.YYYY
 * dates, inline `<salary>`). Full snapshot, no deltas.
 */
export function toJoobleFeed(jobs: NormalizedJob[]): string {
  const jobsXml = jobs.map((j) => `    ${buildJoobleJob(j)}`).join("\n");
  return [`<?xml version="1.0" encoding="utf-8"?>`, `<jobs>`, jobsXml, `</jobs>`]
    .filter((line) => line !== "")
    .join("\n");
}
