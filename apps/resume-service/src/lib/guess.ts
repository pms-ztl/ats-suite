/**
 * Best-effort name/email derivation for archive ingest staging rows.
 *
 * Detection order:
 *   - email: first plausible address in the extracted text
 *   - name:  first text line that looks like a person name, else the filename
 *
 * These are STAGING guesses a recruiter reviews/edits before commit — we never
 * fabricate data, we surface our best guess and let a human correct it.
 */

// Conservative email matcher (good enough for resume text; the recruiter edits
// anything wrong before commit).
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/** Derive a human-ish name from a résumé filename (mirrors the loose-file bulk route). */
export function nameFromFileName(originalName: string): { firstName: string; lastName: string; full: string } {
  const baseName = originalName
    .replace(/\.[a-z0-9]+$/i, "")            // strip extension (any)
    .replace(/[-_]+/g, " ")
    // Strip common résumé-filename noise so "resume_12_Harsh_Gupta.pdf"
    // yields a usable placeholder ("Harsh Gupta"), not "resume"/"12".
    .replace(/^\s*(resume|cv|curriculum vitae)\b\s*/i, "")
    .replace(/^\s*\d+\s*/, "")
    .trim();
  const parts = baseName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName, full: baseName };
}

/** First plausible email address found in extracted text, or null. */
export function emailFromText(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(EMAIL_RE);
  return m ? m[0].toLowerCase() : null;
}

/**
 * Best-effort full name from the top of the resume text. Looks at the first few
 * non-empty lines for a short line of 2-4 capitalized-ish words with no digits
 * or @ — the classic résumé header. Returns null when nothing looks like a name.
 */
export function nameFromText(text: string | null | undefined): string | null {
  if (!text) return null;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 6);
  for (const line of lines) {
    if (line.length > 60) continue;
    if (/[@\d]/.test(line)) continue;
    if (/(resume|curriculum vitae|\bcv\b)/i.test(line)) continue;
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length < 2 || words.length > 4) continue;
    // Each word should start with a letter (allow mixed case names).
    if (words.every((w) => /^[A-Za-z][A-Za-z'.-]*$/.test(w))) {
      return words.join(" ");
    }
  }
  return null;
}

/**
 * Combine text + filename signals into a detected name/email pair for a staging
 * row. Prefers in-document signal; falls back to the filename for the name.
 */
export function guessIdentity(
  text: string | null | undefined,
  fileName: string,
): { detectedName: string | null; detectedEmail: string | null } {
  const detectedEmail = emailFromText(text);
  const detectedName = nameFromText(text) || nameFromFileName(fileName).full || null;
  return { detectedName: detectedName || null, detectedEmail };
}
