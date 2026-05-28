/**
 * Phase 37b — Date + skill + institution normalization.
 *
 * Resume parsers see dates in dozens of formats. Classical ATSes wrote
 * thousands of regex patterns; we use a small, ordered set that covers
 * ~95% of real-world resume dates without devolving into pattern soup.
 *
 * Each parser returns { iso, precision, confidence } so downstream code
 * can decide how to display ("Mar 2020" vs "2020"). Precision is the
 * finest granularity we could confidently extract.
 *
 * "Present" / "Current" / "Now" → null (caller-convention: null end = ongoing).
 */

export type DatePrecision = "year" | "month" | "day";

export interface NormalizedDate {
  iso: string;                    // ISO 8601 (YYYY, YYYY-MM, or YYYY-MM-DD)
  precision: DatePrecision;
  confidence: number;             // 0-1
  original: string;
}

const MONTHS: Record<string, number> = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sept: 9, sep: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

const QUARTERS: Record<string, number> = { q1: 1, q2: 4, q3: 7, q4: 10 };
const QUARTER_END_MONTHS: Record<string, number> = { q1: 3, q2: 6, q3: 9, q4: 12 };

const SEASONS: Record<string, number> = {
  winter: 1, spring: 4, summer: 7, fall: 10, autumn: 10,
};

const ONGOING_TOKENS = new Set([
  "present", "current", "now", "today", "ongoing", "till date", "till now",
  "to date", "to present",
]);

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function clampYear(y: number): number | null {
  // Sanity bounds. Anything outside 1950..2099 is almost certainly an OCR error.
  return y >= 1950 && y < 2100 ? y : null;
}

/**
 * Parse a free-text date. Returns null for unparseable and for "present" /
 * ongoing markers (caller convention: null end date = currently held).
 */
export function parseResumeDate(input: string | null | undefined): NormalizedDate | null {
  if (!input) return null;
  const raw = input.trim();
  const lower = raw.toLowerCase();

  // Ongoing markers — caller treats as null
  if (ONGOING_TOKENS.has(lower)) return null;

  // ISO already — 2020-03-15 / 2020-03 / 2020
  {
    const m = raw.match(/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/);
    if (m) {
      const y = clampYear(Number(m[1]));
      if (y === null) return null;
      const mo = m[2] ? Math.min(12, Math.max(1, Number(m[2]))) : null;
      const d  = m[3] ? Math.min(31, Math.max(1, Number(m[3]))) : null;
      if (d != null && mo != null) return { iso: `${y}-${pad(mo)}-${pad(d)}`, precision: "day", confidence: 0.98, original: raw };
      if (mo != null) return { iso: `${y}-${pad(mo)}`, precision: "month", confidence: 0.98, original: raw };
      return { iso: String(y), precision: "year", confidence: 0.98, original: raw };
    }
  }

  // "Mar 2020" / "March 2020" / "March, 2020" / "Mar. 2020"
  {
    const m = lower.match(/^([a-z]+)\.?,?\s+(\d{4})$/);
    if (m && m[1] && m[2]) {
      const mo = MONTHS[m[1]];
      const y = clampYear(Number(m[2]));
      if (mo && y !== null) {
        return { iso: `${y}-${pad(mo)}`, precision: "month", confidence: 0.95, original: raw };
      }
    }
  }

  // "March 15, 2020" / "Mar 15, 2020"
  {
    const m = lower.match(/^([a-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/);
    if (m && m[1] && m[2] && m[3]) {
      const mo = MONTHS[m[1]];
      const d = Number(m[2]);
      const y = clampYear(Number(m[3]));
      if (mo && y !== null && d >= 1 && d <= 31) {
        return { iso: `${y}-${pad(mo)}-${pad(d)}`, precision: "day", confidence: 0.95, original: raw };
      }
    }
  }

  // "03/2020" / "3/2020" / "03-2020"
  {
    const m = raw.match(/^(\d{1,2})[\/\-](\d{4})$/);
    if (m && m[1] && m[2]) {
      const mo = Number(m[1]);
      const y = clampYear(Number(m[2]));
      if (mo >= 1 && mo <= 12 && y !== null) {
        return { iso: `${y}-${pad(mo)}`, precision: "month", confidence: 0.9, original: raw };
      }
    }
  }

  // "03/15/2020" or "15/03/2020" — ambiguous. Try US order first; if the
  // first number > 12 and second <= 12, flip. Resume parsers commonly
  // see US format; non-US dates get cleaned up by the LLM upstream.
  {
    const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m && m[1] && m[2] && m[3]) {
      let mo = Number(m[1]), d = Number(m[2]);
      const y = clampYear(Number(m[3]));
      if (y !== null) {
        if (mo > 12 && d <= 12) { [mo, d] = [d, mo]; }
        if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
          return { iso: `${y}-${pad(mo)}-${pad(d)}`, precision: "day", confidence: 0.85, original: raw };
        }
      }
    }
  }

  // "Q1 2020" / "Q1 '20"
  {
    const m = lower.match(/^(q[1-4])\s+(?:'?(\d{2,4}))$/);
    if (m && m[1] && m[2]) {
      const qStart = QUARTERS[m[1]];
      let y = Number(m[2]);
      if (y < 100) y = y >= 50 ? 1900 + y : 2000 + y;
      const yy = clampYear(y);
      if (qStart && yy !== null) {
        return { iso: `${yy}-${pad(qStart)}`, precision: "month", confidence: 0.85, original: raw };
      }
    }
  }

  // "Spring 2020" / "Fall '20"
  {
    const m = lower.match(/^(winter|spring|summer|fall|autumn)\s+(?:'?(\d{2,4}))$/);
    if (m && m[1] && m[2]) {
      const s = SEASONS[m[1]];
      let y = Number(m[2]);
      if (y < 100) y = y >= 50 ? 1900 + y : 2000 + y;
      const yy = clampYear(y);
      if (s && yy !== null) {
        return { iso: `${yy}-${pad(s)}`, precision: "month", confidence: 0.7, original: raw };
      }
    }
  }

  // Bare year — "2020" / "'20"
  {
    const m = lower.match(/^'?(\d{2,4})$/);
    if (m && m[1]) {
      let y = Number(m[1]);
      if (y < 100) y = y >= 50 ? 1900 + y : 2000 + y;
      const yy = clampYear(y);
      if (yy !== null) return { iso: String(yy), precision: "year", confidence: 0.8, original: raw };
    }
  }

  return null;
}

/**
 * Months between two NormalizedDates. End-inclusive. Returns 0 for inverted.
 * Year-precision dates expand to {Jan or Dec} to bound the range pessimistically.
 */
export function monthsBetween(start: NormalizedDate, end: NormalizedDate | null): number {
  const startParts = start.iso.split("-").map(Number);
  const endIsNow = end === null;
  const endParts = endIsNow
    ? [new Date().getUTCFullYear(), new Date().getUTCMonth() + 1]
    : end!.iso.split("-").map(Number);

  const sY = startParts[0]!;
  const sM = startParts[1] ?? 1;
  const eY = endParts[0]!;
  const eM = endParts[1] ?? (endIsNow ? endParts[1]! : 12);
  const diff = (eY - sY) * 12 + (eM - sM) + 1;
  return Math.max(0, diff);
}

/** Round 13 months → "1 year 1 month" style display.  */
export function formatTenure(months: number): string {
  if (months <= 0) return "—";
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${y} yr${y === 1 ? "" : "s"}`;
  return `${y} yr${y === 1 ? "" : "s"} ${m} mo`;
}
