// lib/job-jsonld.ts
// F3 / WF-F+WF-G: schema.org `JobPosting` JSON-LD for the PUBLIC candidate job
// page (Google for Jobs structured data). Frontend-only, REAL-data-or-omit.
//
// This mirrors the canonical server emitter
// apps/job-service/src/providers/hiringplatform/feed.ts -> toJsonLd(), but it
// builds from the shape the PUBLIC job API actually returns
// (GET /api/public/jobs/:slug -> { success, data: JobPosting }), so the markup a
// crawler reads on the candidate page matches the markup the distribution feed
// emits.
//
// HARD RULES (real-data-or-null):
//  - NOTHING is fabricated. A recommended field (baseSalary / employmentType /
//    validThrough / jobLocation parts) is emitted ONLY when the real job carries
//    it; otherwise the key is omitted. We never invent a salary, a city, a
//    company name, or an employment type.
//  - Render ONLY when the job is real AND published (`buildJobPostingJsonLd`
//    returns null otherwise, and the caller renders no <script>).
//  - Expiry hygiene: `validThrough` is the real `expiresAt` when set. On a
//    closed / expired req (isPublished === false, or expiresAt already in the
//    past) we still set `validThrough` to a real past timestamp so a crawler
//    de-indexes the listing rather than keeping a stale "open" role live. We do
//    NOT synthesize a future expiry to keep a closed role indexed.
//  - Remote: a `remote` flag (or a "remote"/"telecommute" location string) emits
//    `jobLocationType: "TELECOMMUTE"` + an applicant-location requirement from the
//    job's real country when known; never a fabricated region.

/** ISO-8601 from a date-ish value, or undefined when it is not parseable. A
 *  parse failure yields undefined (never a fabricated date). */
function iso8601(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  if (typeof value === "string" || typeof value === "number") {
    const ms = typeof value === "number" ? value : Date.parse(value);
    if (Number.isFinite(ms) && !Number.isNaN(ms)) return new Date(ms).toISOString();
  }
  return undefined;
}

/** Non-empty trimmed string, or undefined. Never a placeholder default. */
function str(value: unknown): string | undefined {
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

/** Finite number, or undefined (never NaN, never a default). */
function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Coerce a requirements value (string[] | string | objects) into clean lines. */
function toLines(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((r) => (typeof r === "string" ? r : str((r as { label?: unknown; text?: unknown })?.label ?? (r as { text?: unknown })?.text)))
      .map((r) => str(r))
      .filter((r): r is string => Boolean(r));
  }
  const single = str(value);
  return single ? [single] : [];
}

/**
 * The real public-job shape this builder reads. It is intentionally permissive
 * (the public API nests most descriptive fields under `requisition`) and every
 * field is optional, so a missing field is simply omitted from the markup.
 */
export interface PublicJobLike {
  // posting row
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  requirements?: unknown;
  isPublished?: unknown;
  publishedAt?: unknown;
  expiresAt?: unknown;
  // nested requisition (the public :slug route includes these)
  requisition?: {
    title?: unknown;
    department?: unknown;
    location?: unknown;
    country?: unknown;
    description?: unknown;
    requirements?: unknown;
    salaryMin?: unknown;
    salaryMax?: unknown;
    salaryCurrency?: unknown;
    employmentType?: unknown;
    remote?: unknown;
  } | null;
  // a few fields some payload variants flatten onto the posting
  department?: unknown;
  location?: unknown;
  country?: unknown;
  salaryMin?: unknown;
  salaryMax?: unknown;
  salaryCurrency?: unknown;
  employmentType?: unknown;
  remote?: unknown;
}

/** True when a free-text location reads as remote / work-from-anywhere. */
function looksRemote(remoteFlag: unknown, locationStr: string | undefined): boolean {
  if (remoteFlag === true) return true;
  if (typeof remoteFlag === "string" && /^(true|remote|yes)$/i.test(remoteFlag.trim())) return true;
  if (locationStr && /\b(remote|telecommute|work\s*from\s*home|anywhere)\b/i.test(locationStr)) return true;
  return false;
}

/**
 * Build a schema.org `JobPosting` JSON-LD object from the REAL public job
 * payload, or `null` when the job is not real+published (the caller then emits
 * no <script>). `appUrl` is the public site origin used for the canonical apply
 * URL (the only URL we control); `slug` is the posting slug for that URL.
 *
 * Required keys (per Google for Jobs): title, description, datePosted,
 * hiringOrganization, jobLocation. Conditional: validThrough. Recommended (only
 * when the real data exists): baseSalary, employmentType, identifier,
 * directApply, plus the TELECOMMUTE remote markers.
 */
export function buildJobPostingJsonLd(
  raw: unknown,
  opts: { appUrl: string; slug: string; orgName?: string; applyPath?: string },
): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  // Unwrap the { success, data } envelope when present.
  const env = raw as { data?: unknown };
  const job = (env.data && typeof env.data === "object" ? env.data : raw) as PublicJobLike;
  const req = (job.requisition && typeof job.requisition === "object" ? job.requisition : {}) as NonNullable<PublicJobLike["requisition"]>;

  // A title and a description are the two hard-required descriptive fields; with
  // neither there is no real job to mark up -> emit nothing (no fabrication).
  const title = str(job.title) ?? str(req.title);
  const description = str(job.description) ?? str(req.description);
  if (!title || !description) return null;

  // Honest published gate: only a genuinely published posting is "open". An
  // explicit isPublished === false means closed -> we still build the markup but
  // expire it (below) so a crawler de-indexes it.
  const isClosed = job.isPublished === false;

  const slug = str(opts.slug) ?? str(job.slug);
  if (!slug) return null;
  // The canonical apply URL: the caller may supply a tenant-scoped path (e.g.
  // /c/{tenant}/jobs/{slug}/apply); otherwise default to the global apply route.
  const origin = String(opts.appUrl).replace(/\/+$/, "");
  const applyPath = str(opts.applyPath) ?? `/jobs/${encodeURIComponent(slug)}/apply`;
  const applyUrl = `${origin}${applyPath.startsWith("/") ? "" : "/"}${applyPath}`;

  // datePosted is required; use the real publishedAt. If a published posting
  // genuinely lacks one, fall back to "now" ONLY for an open posting (a live
  // posting must carry a date); a closed posting keeps its real date or omits.
  const datePosted = iso8601(job.publishedAt) ?? (isClosed ? undefined : new Date().toISOString());

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title,
    description,
  };
  if (datePosted) ld["datePosted"] = datePosted;

  // hiringOrganization: use a real org name when the caller supplies one (the
  // tenant branding name); otherwise omit the name rather than invent a company.
  const orgName = str(opts.orgName);
  ld["hiringOrganization"] = {
    "@type": "Organization",
    ...(orgName ? { name: orgName } : {}),
  };

  // ── jobLocation / remote markers (real data only) ─────────────────────────
  const locationStr = str(job.location) ?? str(req.location);
  const country = str(job.country) ?? str(req.country);
  const remote = looksRemote(job.remote ?? req.remote, locationStr);

  const address: Record<string, unknown> = { "@type": "PostalAddress" };
  let hasAddressPart = false;
  if (locationStr) {
    // The public payload carries a single free-text location string; surface it
    // as addressLocality (the most specific honest mapping) without splitting it
    // into a fabricated city/region pair.
    address["addressLocality"] = locationStr;
    hasAddressPart = true;
  }
  if (country) {
    address["addressCountry"] = country;
    hasAddressPart = true;
  }

  if (remote) {
    ld["jobLocationType"] = "TELECOMMUTE";
    // Google requires applicantLocationRequirements for a TELECOMMUTE role; use
    // the real country when known, else omit (truly anywhere) - never invent one.
    if (country) {
      ld["applicantLocationRequirements"] = { "@type": "Country", name: country };
    }
    // A remote role may still carry a concrete office address; include it when
    // we actually have one.
    if (hasAddressPart) ld["jobLocation"] = { "@type": "Place", address };
  } else if (hasAddressPart) {
    ld["jobLocation"] = { "@type": "Place", address };
  } else {
    // Non-remote with no geo: emit an explicit empty-but-typed Place so the
    // required key is present without a fabricated address.
    ld["jobLocation"] = { "@type": "Place", address: { "@type": "PostalAddress" } };
  }

  // ── validThrough (expiry hygiene) ─────────────────────────────────────────
  const realExpiry = iso8601(job.expiresAt);
  if (isClosed) {
    // Closed/unpublished role: expire it in the past so crawlers de-index it.
    // Prefer the real expiresAt; otherwise stamp a real past timestamp (now)
    // rather than keep the listing live.
    ld["validThrough"] = realExpiry ?? new Date().toISOString();
  } else if (realExpiry) {
    // Open role with a real expiry window: pass it through verbatim (it may
    // already be in the past, which is correct expiry hygiene - we never push it
    // into the future to keep a lapsed role indexed).
    ld["validThrough"] = realExpiry;
  }

  // ── baseSalary (recommended, real bounds only) ────────────────────────────
  const salaryMin = num(job.salaryMin) ?? num(req.salaryMin);
  const salaryMax = num(job.salaryMax) ?? num(req.salaryMax);
  const currency = str(job.salaryCurrency) ?? str(req.salaryCurrency);
  if (currency && (salaryMin !== undefined || salaryMax !== undefined)) {
    const value: Record<string, unknown> = { "@type": "QuantitativeValue", unitText: "YEAR" };
    if (salaryMin !== undefined) value["minValue"] = salaryMin;
    if (salaryMax !== undefined) value["maxValue"] = salaryMax;
    if (salaryMin !== undefined && salaryMin === salaryMax) value["value"] = salaryMin;
    ld["baseSalary"] = { "@type": "MonetaryAmount", currency, value };
  }

  // ── employmentType (recommended, only when present) ───────────────────────
  const empRaw = job.employmentType ?? req.employmentType;
  const employmentType = Array.isArray(empRaw)
    ? empRaw.map((t) => str(t)).filter((t): t is string => Boolean(t))
    : str(empRaw)
      ? [str(empRaw) as string]
      : [];
  if (employmentType.length) ld["employmentType"] = employmentType;

  // identifier: the posting slug is the stable, real public correlation handle.
  ld["identifier"] = { "@type": "PropertyValue", name: "ATS", value: slug };

  // directApply: applicants apply through the URL we publish (our apply page).
  ld["directApply"] = true;
  ld["url"] = applyUrl;

  return ld;
}

/**
 * Serialize a built JSON-LD object for embedding inside a
 * <script type="application/ld+json"> tag. Escapes `<` so the closing
 * </script> sequence can never break out of the script element (the standard
 * safe-embed for JSON-LD). Returns null when given null (no markup to emit).
 */
export function jsonLdScriptText(ld: Record<string, unknown> | null): string | null {
  if (!ld) return null;
  return JSON.stringify(ld).replace(/</g, "\\u003c");
}
