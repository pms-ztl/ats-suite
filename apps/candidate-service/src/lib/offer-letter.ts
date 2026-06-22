/**
 * Offer-letter PDF renderer (Module E).
 *
 * Renders a clean, one-page offer letter from an Offer record + the candidate
 * and (optionally) requisition/comp context into a Buffer with pdfkit. The
 * caller decides what to do with the Buffer — there is intentionally NO storage
 * coupling here.
 *
 * Storage: candidate-service has no object-storage helper wired up (no
 * putObject/buildKey in the service or @cdc-ats/common at the time of writing).
 * `maybeUploadOfferLetter` therefore returns null and logs — it never fabricates
 * a storage key. If/when a storage helper lands, swap the body of
 * `maybeUploadOfferLetter` to upload + return a real key.
 */
import PDFDocument from "pdfkit";
import type { Logger } from "pino";

export interface OfferLetterInput {
  offer: {
    id: string;
    baseSalary: number;
    currency: string;
    bonusPercent: number | null;
    equity: string | null;
    startDate: Date | null;
    expiresAt: Date | null;
  };
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  /** Resolved best-effort from the requisition (cross-service); may be null. */
  jobTitle: string | null;
  /** Tenant display name if known (else a neutral default in the letter). */
  companyName?: string | null;
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    // Unknown/invalid currency code — fall back to a plain number + code.
    return `${amount.toLocaleString("en-US")} ${currency}`;
  }
}

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/**
 * Render the offer letter to a PDF Buffer. Resolves once pdfkit finishes
 * streaming the document into memory.
 */
export function renderOfferLetterPdf(input: OfferLetterInput): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "LETTER", margin: 64 });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const company = input.companyName?.trim() || "the Company";
      const candidateName = `${input.candidate.firstName} ${input.candidate.lastName}`.trim();
      const role = input.jobTitle?.trim() || "the role you interviewed for";
      const today = formatDate(new Date());
      const startDate = formatDate(input.offer.startDate);
      const expiresAt = formatDate(input.offer.expiresAt);
      const base = formatMoney(input.offer.baseSalary, input.offer.currency);

      // ── Header ────────────────────────────────────────────────────────────
      doc.fontSize(20).fillColor("#111827").text(company, { align: "left" });
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor("#6b7280").text("Offer of Employment", { align: "left" });
      if (today) {
        doc.moveDown(0.2);
        doc.fontSize(10).fillColor("#9ca3af").text(today, { align: "left" });
      }
      doc.moveDown(1.2);

      // ── Salutation + intro ────────────────────────────────────────────────
      doc.fontSize(11).fillColor("#1f2937");
      doc.text(`Dear ${candidateName || "Candidate"},`);
      doc.moveDown(0.8);
      doc.text(
        `We are delighted to extend you an offer to join ${company} as ${role}. ` +
          `This letter sets out the principal terms of our offer. We were impressed by you ` +
          `throughout the process and are excited about the contribution you will make.`,
        { lineGap: 2 },
      );
      doc.moveDown(0.8);

      // ── Terms ─────────────────────────────────────────────────────────────
      doc.fontSize(13).fillColor("#111827").text("Compensation & Terms");
      doc.moveDown(0.4);
      doc.fontSize(11).fillColor("#1f2937");

      const lines: Array<[string, string]> = [];
      lines.push(["Position", role]);
      lines.push(["Annual base salary", base]);
      if (input.offer.bonusPercent != null) lines.push(["Target bonus", `${input.offer.bonusPercent}% of base`]);
      if (input.offer.equity) lines.push(["Equity", input.offer.equity]);
      if (startDate) lines.push(["Anticipated start date", startDate]);
      if (expiresAt) lines.push(["This offer is valid until", expiresAt]);

      const labelWidth = 180;
      for (const [label, value] of lines) {
        const y = doc.y;
        doc.fillColor("#6b7280").text(label, doc.x, y, { width: labelWidth, continued: false });
        doc.fillColor("#111827").text(value, doc.x + labelWidth, y, { width: 280 });
        doc.moveDown(0.3);
      }
      doc.moveDown(0.8);

      // ── Closing ───────────────────────────────────────────────────────────
      doc.fontSize(11).fillColor("#1f2937");
      doc.text(
        `This offer is contingent on the standard pre-employment checks and your acceptance ` +
          `of ${company}'s policies. It does not constitute a contract of employment until ` +
          `countersigned. To accept, please confirm through your candidate portal.`,
        { lineGap: 2 },
      );
      doc.moveDown(1.2);
      doc.text(`Warm regards,`);
      doc.moveDown(0.4);
      doc.text(company);

      // ── Footer ────────────────────────────────────────────────────────────
      doc.moveDown(2);
      doc.fontSize(8).fillColor("#9ca3af").text(
        `Offer reference: ${input.offer.id}`,
        { align: "left" },
      );

      doc.end();
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

/**
 * Render the offer letter and, IF an object-storage backend is configured,
 * upload it and return its key. Currently candidate-service has no storage
 * helper, so this honestly returns null (and logs) rather than minting a fake
 * key. The PDF is still rendered (cheap, in-memory) so the caller can attach or
 * inspect it if a storage path is added later.
 *
 * @returns the storage key on success, or null when storage is not configured.
 */
export async function maybeUploadOfferLetter(
  input: OfferLetterInput,
  logger: Logger,
): Promise<{ offerLetterKey: string | null; bytes: number }> {
  let bytes = 0;
  try {
    const pdf = await renderOfferLetterPdf(input);
    bytes = pdf.byteLength;
  } catch (err) {
    logger.warn({ err, offerId: input.offer.id }, "offer-letter PDF render failed");
    return { offerLetterKey: null, bytes: 0 };
  }

  // No object-storage helper is wired into candidate-service / @cdc-ats/common.
  // Be honest: do not fabricate a key. When storage lands, replace this block
  // with putObject(buildKey(...), pdf) and return the real key.
  logger.info(
    { offerId: input.offer.id, bytes },
    "offer-letter PDF rendered; object storage not configured — offerLetterKey is null",
  );
  return { offerLetterKey: null, bytes };
}
