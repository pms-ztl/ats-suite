/**
 * Bulk archive extract worker.
 *
 * Consumes 'bulk-archive-extract' jobs ({ bulkUploadId, zipPath, tenantId }):
 *   1. Open the uploaded .zip with `unzipper.Open.file` — random-access over the
 *      central directory so 10k entries are read one-at-a-time (no full-archive
 *      buffering, no OOM).
 *   2. For each FILE entry with a supported extension, read its buffer, run the
 *      existing extractResumeText (OCR for images when enabled), guess
 *      name/email, and create a BulkImportItem STAGING row (no real Candidate
 *      yet — the recruiter reviews/approves first).
 *   3. Increment BulkUpload.extractedCount + pendingCount as we go so the UI
 *      can show live progress.
 *   4. When all entries are processed set phase='review', totalFiles=count and
 *      delete the temp zip.
 *
 * Runs OUTSIDE any HTTP request → uses the admin (non-RLS) client and writes
 * rows with an explicit tenantId (same pattern as the resume-parse worker).
 */
import unzipper from "unzipper";
import fs from "fs/promises";
import path from "path";
import { createWorker } from "@cdc-ats/nats-client";
import { prismaAdmin as prisma } from "../lib/prisma.js";
import { extractResumeText } from "../lib/extract.js";
import { guessIdentity } from "../lib/guess.js";
import type { BulkArchiveExtractJob } from "../lib/queue.js";
import type { Logger } from "pino";

// Supported entry extensions → mime type passed to extractResumeText.
const EXT_MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  tiff: "image/tiff",
};
const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "tiff"]);
const SNIPPET_CHARS = 280;

function extOf(name: string): string {
  const ext = path.extname(name).replace(/^\./, "").toLowerCase();
  return ext;
}

export function startBulkArchiveExtractWorker(logger: Logger) {
  const worker = createWorker<BulkArchiveExtractJob>(
    "bulk-archive-extract",
    async (job) => {
      const { bulkUploadId, zipPath, tenantId } = job.data;
      logger.info({ jobId: job.id, bulkUploadId, zipPath }, "Extracting bulk archive");

      let extractedCount = 0;
      let pendingCount = 0;
      try {
        const directory = await unzipper.Open.file(zipPath);

        // Stream entries one at a time. `directory.files` is the central-
        // directory listing; `.buffer()` seeks + inflates a single entry on
        // demand, so peak memory stays at ~one file regardless of archive size.
        for (const entry of directory.files) {
          // Skip directories and OS junk (e.g. __MACOSX/, .DS_Store).
          if (entry.type !== "File") continue;
          const fileName = entry.path.split("/").pop() || entry.path;
          if (!fileName || fileName.startsWith(".") || entry.path.startsWith("__MACOSX/")) continue;

          const ext = extOf(fileName);
          const mimeType = EXT_MIME[ext];
          const sizeBytes = Number(entry.uncompressedSize ?? 0) || 0;

          // Unsupported type → record a staging row so the recruiter sees the
          // file was present but skipped (no fabricated success).
          if (!mimeType) {
            await prisma.bulkImportItem.create({
              data: {
                tenantId,
                bulkUploadId,
                fileName,
                mimeType: "application/octet-stream",
                sizeBytes,
                extractStatus: "unsupported",
                reviewStatus: "pending",
              },
            });
            extractedCount += 1;
            pendingCount += 1;
            await bumpExtractCounters(bulkUploadId);
            continue;
          }

          let extractStatus: "extracted" | "ocr_empty" | "failed" = "extracted";
          let extractedText = "";
          let detectedName: string | null = null;
          let detectedEmail: string | null = null;
          let textSnippet: string | null = null;

          try {
            const buf = await entry.buffer();
            const extraction = await extractResumeText(buf, mimeType, fileName);
            extractedText = extraction.text ?? "";
            if (extractedText.trim().length > 0) {
              extractStatus = "extracted";
              const ident = guessIdentity(extractedText, fileName);
              detectedName = ident.detectedName;
              detectedEmail = ident.detectedEmail;
              textSnippet = extractedText.slice(0, SNIPPET_CHARS);
            } else if (IMAGE_EXTS.has(ext)) {
              // Image whose OCR produced nothing (blank scan / OCR disabled).
              extractStatus = "ocr_empty";
              detectedName = guessIdentity(null, fileName).detectedName;
            } else {
              // Non-image with no text (e.g. empty/corrupt doc).
              extractStatus = "failed";
              detectedName = guessIdentity(null, fileName).detectedName;
            }
          } catch (err) {
            extractStatus = "failed";
            detectedName = guessIdentity(null, fileName).detectedName;
            logger.warn(
              { err, fileName, bulkUploadId },
              "archive entry extraction failed",
            );
          }

          await prisma.bulkImportItem.create({
            data: {
              tenantId,
              bulkUploadId,
              fileName,
              mimeType,
              sizeBytes,
              detectedName,
              detectedEmail,
              textSnippet,
              extractedText,
              extractStatus,
              reviewStatus: "pending",
            },
          });
          extractedCount += 1;
          pendingCount += 1;
          await bumpExtractCounters(bulkUploadId);
        }

        await prisma.bulkUpload.update({
          where: { id: bulkUploadId },
          data: {
            phase: "review",
            status: "PROCESSING",
            totalFiles: extractedCount,
            // Re-sync counters to the authoritative loop totals (the per-entry
            // increments above are best-effort progress ticks).
            extractedCount,
            pendingCount,
          },
        });
        logger.info({ bulkUploadId, extractedCount }, "Archive extraction complete");
        return { extractedCount };
      } catch (err) {
        logger.error(
          { err, bulkUploadId },
          "bulk archive extraction failed — marking upload failed",
        );
        await prisma.bulkUpload
          .update({
            where: { id: bulkUploadId },
            data: {
              phase: "failed",
              status: "FAILED",
              errors: [
                { archive: true, error: err instanceof Error ? err.message : String(err) },
              ] as any,
            },
          })
          .catch(() => {});
        throw err;
      } finally {
        await fs.unlink(zipPath).catch(() => {});
      }
    },
    {
      // Archives are big + extraction (esp. OCR) is heavy; keep concurrency
      // modest so a single zip doesn't starve the resume-parse worker.
      concurrency: Number(process.env["BULK_ARCHIVE_CONCURRENCY"]) || 2,
    }
  );

  worker.on("completed", (job) => logger.info({ jobId: job.id }, "bulk archive extract done"));
  worker.on("failed", (job, err) =>
    logger.error({ jobId: job?.id, err: err.message }, "bulk archive extract failed"),
  );
  logger.info("bulk-archive-extract worker started");
  return worker;
}

/** Best-effort live progress tick (atomic increment). */
async function bumpExtractCounters(bulkUploadId: string) {
  try {
    await prisma.bulkUpload.update({
      where: { id: bulkUploadId },
      data: { extractedCount: { increment: 1 }, pendingCount: { increment: 1 } },
    });
  } catch {
    /* progress-only; final values are re-synced at end of run */
  }
}
