/**
 * Resume routes — single upload + bulk upload + status polling.
 *
 *   POST /internal/resume/upload         — single resume upload + enqueue parse
 *   POST /internal/resume/bulk           — bulk multi-file upload + bulk record
 *   GET  /internal/resume/bulk/:id       — poll bulk progress
 *   GET  /internal/resume/:candidateId   — fetch latest resume for candidate
 */
import express, { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId, requireRole, createLogger, tenantContext } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: resume upload (single + bulk) is admin/recruiter.
const requireUploader = requireRole("ADMIN", "RECRUITER");
import { prisma } from "../lib/prisma.js";
import { enqueueResumeParse, enqueueBulkArchiveExtract } from "../lib/queue.js";
import { runParsePipeline } from "../lib/parse-pipeline.js";
import { nameFromFileName } from "../lib/guess.js";

const reparseLogger = createLogger({ serviceName: "resume-service:reparse" });
import { upsertCandidate, checkResumeQuota } from "../lib/service-client.js";
import { extractResumeText } from "../lib/extract.js";
import { buildKey, putObject, getPresignedDownloadUrl, isStorageConfigured } from "../lib/storage.js";

const router = Router();

// Single upload — in-memory (small files OK)
const singleUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      // Image resumes (extracted via OCR when ENABLE_OCR=true)
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/tiff",
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Bulk upload — disk storage (avoids OOM with 1000 × 10MB)
const bulkUpload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_req, file, cb) =>
      cb(null, `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.originalname}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Bulk ARCHIVE upload — a single .zip streamed to disk (up to 300MB), unzipped
// async in the bulk-archive-extract worker (the request just hands off the path).
const ZIP_MIMES = new Set(["application/zip", "application/x-zip-compressed"]);
const archiveUpload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_req, file, cb) =>
      cb(null, `archive-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.zip`),
  }),
  limits: { fileSize: 314_572_800 }, // 300MB
  fileFilter: (_req, file, cb) => {
    const isZipExt = /\.zip$/i.test(file.originalname);
    cb(null, ZIP_MIMES.has(file.mimetype) || isZipExt);
  },
});

const UploadBodySchema = z.object({
  candidateId: z.string().uuid(),
});

// ── POST /internal/resume/upload ────────────────────────────────────────
router.post(
  "/upload",
  requireUploader,
  singleUpload.single("resume"),
  tenantContext, // re-bind tenant after multer drops the async-local context
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const body = UploadBodySchema.parse(req.body);
      if (!req.file) throw Errors.validation("Resume file is required");

      // Phase 35a — real text extraction (was: buffer.toString("utf-8") giving
      // garbage for PDFs). PDFs go through pdf-parse, DOCX through mammoth,
      // legacy .doc best-effort via mammoth fallback, TXT direct UTF-8.
      const extraction = await extractResumeText(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
      );

      // Create the row first so we have an id to put in the S3 key.
      const resume = await prisma.resume.upsert({
        where: { candidateId: body.candidateId },
        update: {
          tenantId,
          fileName: req.file.originalname,
          originalFilename: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          extractedText: extraction.text,
          parseStatus: "EXTRACTED",
        },
        create: {
          tenantId,
          candidateId: body.candidateId,
          fileName: req.file.originalname,
          originalFilename: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          extractedText: extraction.text,
          parseStatus: "EXTRACTED",
        },
      });

      // Phase 35b — persist binary to S3 (or MinIO in dev). When storage
      // isn't configured we skip; the extracted text is still in DB so
      // parsing + screening still work. We just can't offer downloads.
      if (isStorageConfigured()) {
        const key = buildKey({ tenantId, resumeId: resume.id, fileName: req.file.originalname });
        const stored = await putObject({
          key,
          body: req.file.buffer,
          contentType: req.file.mimetype,
        });
        if (stored) {
          await prisma.resume.update({
            where: { id: resume.id },
            data: { storageKey: stored },
          });
        }
      }

      await enqueueResumeParse({
        candidateId: body.candidateId,
        tenantId,
        userId,
        resumeId: resume.id,
      });

      created(res, { id: resume.id, parseStatus: resume.parseStatus });
    } catch (err) { next(err); }
  }
);

// ── POST /internal/resume/bulk ───────────────────────────────────────────
router.post(
  "/bulk",
  requireUploader,
  bulkUpload.array("resumes", 1000),
  tenantContext, // re-bind tenant after multer drops the async-local context
  async (req: Request, res: Response, next: NextFunction) => {
    const cleanupPaths: string[] = [];
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const files = (req.files ?? []) as Express.Multer.File[];
      cleanupPaths.push(...files.map((f) => f.path));
      if (files.length === 0) throw Errors.validation("At least one file is required");

      // Plan gate: enforce the tenant's monthly resume-parse quota before we
      // create any candidates. Fail-open (billing down ⇒ allow) so an outage
      // never blocks hiring; FREE/STARTER over-quota uploads are rejected up
      // front instead of silently consuming files.
      const quota = await checkResumeQuota(files.length, tenantId, userId);
      if (!quota.allowed) {
        throw Errors.planLimit(
          `Your ${quota.plan} plan allows ${quota.limit} resume parses per month (used ${quota.used}). ` +
          `This upload of ${files.length} would exceed it — upgrade your plan to import more.`
        );
      }

      const requisitionId =
        typeof req.body.requisitionId === "string" ? req.body.requisitionId : null;

      const bulk = await prisma.bulkUpload.create({
        data: {
          tenantId, userId, requisitionId,
          status: "QUEUED", totalFiles: files.length,
        },
      });

      // Phase 6b: for each file, create a REAL candidate via candidate-service
      // /upsert-from-application. Email + name are derived from the filename
      // as a deterministic placeholder until the parsed resume can backfill.
      // (Real flow: file upload → parse → resume-parser agent extracts email →
      // a follow-up event updates candidate row with parsed details.)
      let enqueued = 0, failed = 0;
      const errors: Array<{ filename: string; error: string }> = [];
      for (const file of files) {
        try {
          const buf = await fs.readFile(file.path);
          // Phase 35a — real extraction (was: buffer.toString("utf-8"))
          const extraction = await extractResumeText(buf, file.mimetype, file.originalname);
          const extractedText = extraction.text;

          // Derive placeholder candidate details from filename
          const baseName = file.originalname
            .replace(/\.(pdf|docx?|txt)$/i, "")
            .replace(/[-_]+/g, " ")
            // Strip common résumé-filename noise so "resume_12_Harsh_Gupta.pdf"
            // yields a usable placeholder ("Harsh Gupta"), not "resume"/"12".
            .replace(/^\s*(resume|cv|curriculum vitae)\b\s*/i, "")
            .replace(/^\s*\d+\s*/, "")
            .trim();
          const firstName = baseName.split(" ")[0] || "Pending";
          const lastName = baseName.split(" ").slice(1).join(" ") || `Bulk ${enqueued + 1}`;
          const placeholderEmail = `bulk-${bulk.id.slice(0, 8)}-${enqueued}@pending.placeholder`;

          // Upsert real candidate via candidate-service (idempotent on tenant+email)
          const candidate = await upsertCandidate(
            { email: placeholderEmail, firstName, lastName, source: "BULK_UPLOAD" },
            tenantId,
            userId
          );

          if (!candidate) {
            throw new Error("candidate-service unreachable — could not create candidate");
          }

          const resume = await prisma.resume.create({
            data: {
              tenantId,
              candidateId: candidate.id,
              fileName: file.originalname,
              originalFilename: file.originalname,
              fileSize: file.size,
              mimeType: file.mimetype,
              extractedText,
              parseStatus: "EXTRACTED",
              bulkUploadId: bulk.id,
            },
          });
          // Phase 35b — persist the binary to S3 for bulk uploads too.
          // Best-effort: failure here doesn't fail the whole row.
          if (isStorageConfigured()) {
            const key = buildKey({ tenantId, resumeId: resume.id, fileName: file.originalname });
            const stored = await putObject({
              key, body: buf, contentType: file.mimetype,
            }).catch(() => null);
            if (stored) {
              await prisma.resume.update({ where: { id: resume.id }, data: { storageKey: stored } });
            }
          }
          await enqueueResumeParse({
            candidateId: candidate.id,
            tenantId, userId,
            resumeId: resume.id,
            bulkUploadId: bulk.id,
          });
          enqueued += 1;
        } catch (err) {
          failed += 1;
          errors.push({ filename: file.originalname, error: err instanceof Error ? err.message : String(err) });
        }
      }

      await prisma.bulkUpload.update({
        where: { id: bulk.id },
        data: {
          status: enqueued > 0 ? "PROCESSING" : "FAILED",
          failedFiles: failed,
          errors: errors as any,
        },
      });

      res.status(202).json({
        success: true,
        data: {
          bulkUploadId: bulk.id,
          totalFiles: files.length,
          enqueued,
          failed,
          statusUrl: `/api/resume/bulk/${bulk.id}`,
        },
      });
    } catch (err) {
      next(err);
    } finally {
      for (const p of cleanupPaths) {
        fs.unlink(p).catch(() => {});
      }
    }
  }
);

// ── POST /internal/resume/bulk-archive ──────────────────────────────────
// Upload ONE .zip of mixed resumes (PDF/DOC/DOCX/TXT + images). The zip is
// streamed to disk; we create a BulkUpload (phase='extracting') and hand the
// path to the bulk-archive-extract worker, then return 202 immediately so a
// 10k-file archive never hits the 30s request timeout. The quota check is
// DEFERRED to commit (we don't know the approved count until review).
router.post(
  "/bulk-archive",
  requireUploader,
  archiveUpload.single("archive"),
  tenantContext, // re-bind tenant after multer drops the async-local context
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      if (!req.file) throw Errors.validation("A .zip archive (field 'archive') is required");

      const requisitionId =
        typeof req.body.requisitionId === "string" ? req.body.requisitionId : null;

      const bulk = await prisma.bulkUpload.create({
        data: {
          tenantId, userId, requisitionId,
          status: "QUEUED",
          phase: "extracting",
          archiveName: req.file.originalname,
          totalFiles: 0,
        },
      });

      await enqueueBulkArchiveExtract({
        bulkUploadId: bulk.id,
        zipPath: req.file.path,
        tenantId,
      });

      res.status(202).json({
        success: true,
        data: {
          bulkUploadId: bulk.id,
          statusUrl: `/internal/resume/bulk/${bulk.id}`,
        },
      });
    } catch (err) {
      // On failure before hand-off, remove the temp zip so it doesn't leak.
      if (req.file?.path) fs.unlink(req.file.path).catch(() => {});
      next(err);
    }
  }
);

// ── GET /internal/resume/bulk/:id — poll ────────────────────────────────
router.get("/bulk/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const row = await prisma.bulkUpload.findFirst({ where: { id, tenantId } });
    if (!row) throw Errors.notFound("Bulk upload");
    ok(res, {
      id: row.id,
      status: row.status,
      // Archive-ingest lifecycle fields (additive; loose-file bulk leaves
      // phase at its 'extracting' default and these counters at 0).
      phase: row.phase,
      archiveName: row.archiveName,
      totalFiles: row.totalFiles,
      processedFiles: row.processedFiles,
      failedFiles: row.failedFiles,
      // Staging counters
      extractedCount: row.extractedCount,
      pendingCount: row.pendingCount,
      approvedCount: row.approvedCount,
      rejectedCount: row.rejectedCount,
      committedCount: row.committedCount,
      // parse/screen progress (reuses the resume-parse worker's tick)
      parsedFiles: row.processedFiles,
      progress: row.totalFiles > 0
        ? Math.round(((row.processedFiles + row.failedFiles) / row.totalFiles) * 100)
        : 0,
      errors: row.errors,
      requisitionId: row.requisitionId,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    });
  } catch (err) { next(err); }
});

// ── GET /internal/resume/bulk/:id/items — paginated staging list ─────────
router.get("/bulk/:id/items", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const bulk = await prisma.bulkUpload.findFirst({ where: { id, tenantId } });
    if (!bulk) throw Errors.notFound("Bulk upload");

    const limit = Math.min(200, Math.max(1, Number(req.query["limit"]) || 50));
    const cursor = typeof req.query["cursor"] === "string" ? req.query["cursor"] : undefined;

    // sort=score → rank by ATS score DESC so the frontend renders the ranked
    // list (score 100 first); nulls/unscored sink to the bottom. `id` is the
    // deterministic tiebreaker so keyset (cursor) pagination is stable even
    // when many rows share a score. Default stays createdAt asc (import order).
    const sortByScore = req.query["sort"] === "score";
    const orderBy = sortByScore
      ? ([{ score: { sort: "desc", nulls: "last" } }, { id: "asc" }] as const)
      : ([{ createdAt: "asc" }, { id: "asc" }] as const);

    const rows = await prisma.bulkImportItem.findMany({
      where: { bulkUploadId: id, tenantId },
      orderBy: orderBy as any,
      take: limit + 1, // fetch one extra to compute nextCursor
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    ok(res, {
      items: items.map((it) => ({
        id: it.id,
        fileName: it.fileName,
        mimeType: it.mimeType,
        sizeBytes: it.sizeBytes,
        detectedName: it.detectedName,
        detectedEmail: it.detectedEmail,
        textSnippet: it.textSnippet,
        extractStatus: it.extractStatus,
        quarantineReason: it.quarantineReason,
        reviewStatus: it.reviewStatus,
        score: it.score,
        scoreStatus: it.scoreStatus,
        candidateId: it.candidateId,
        createdAt: it.createdAt,
      })),
      nextCursor,
    });
  } catch (err) { next(err); }
});

// ── PATCH /internal/resume/bulk/:id/items/:itemId — edit/approve a row ───
const PatchItemSchema = z.object({
  reviewStatus: z.enum(["approved", "rejected"]).optional(),
  detectedName: z.string().max(200).nullable().optional(),
  detectedEmail: z.string().max(320).nullable().optional(),
});
router.patch("/bulk/:id/items/:itemId", requireUploader, express.json({ limit: "1mb" }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const itemId = req.params["itemId"] as string;
    const body = PatchItemSchema.parse(req.body);

    const existing = await prisma.bulkImportItem.findFirst({ where: { id: itemId, bulkUploadId: id, tenantId } });
    if (!existing) throw Errors.notFound("Bulk import item");

    const data: Record<string, unknown> = {};
    if (body.reviewStatus !== undefined) data["reviewStatus"] = body.reviewStatus;
    if (body.detectedName !== undefined) data["detectedName"] = body.detectedName;
    if (body.detectedEmail !== undefined) data["detectedEmail"] = body.detectedEmail;

    const updated = await prisma.bulkImportItem.update({ where: { id: itemId }, data });
    await recomputeReviewCounters(id, tenantId);

    ok(res, {
      id: updated.id,
      reviewStatus: updated.reviewStatus,
      detectedName: updated.detectedName,
      detectedEmail: updated.detectedEmail,
    });
  } catch (err) { next(err); }
});

// ── POST /internal/resume/bulk/:id/review-all — bulk approve/reject ──────
const ReviewAllSchema = z.object({
  action: z.enum(["approve-nonempty", "reject-empty", "approve-all"]),
});
router.post("/bulk/:id/review-all", requireUploader, express.json({ limit: "1mb" }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const { action } = ReviewAllSchema.parse(req.body);

    const bulk = await prisma.bulkUpload.findFirst({ where: { id, tenantId } });
    if (!bulk) throw Errors.notFound("Bulk upload");

    if (action === "approve-all") {
      await prisma.bulkImportItem.updateMany({
        where: { bulkUploadId: id, tenantId },
        data: { reviewStatus: "approved" },
      });
    } else if (action === "approve-nonempty") {
      // Approve the rows that actually extracted text; reject everything else
      // (ocr_empty / failed / unsupported) so nothing empty is committed.
      await prisma.bulkImportItem.updateMany({
        where: { bulkUploadId: id, tenantId, extractStatus: "extracted" },
        data: { reviewStatus: "approved" },
      });
      await prisma.bulkImportItem.updateMany({
        where: { bulkUploadId: id, tenantId, extractStatus: { not: "extracted" } },
        data: { reviewStatus: "rejected" },
      });
    } else {
      // reject-empty: reject anything that didn't yield text (leave the rest).
      await prisma.bulkImportItem.updateMany({
        where: { bulkUploadId: id, tenantId, extractStatus: { not: "extracted" } },
        data: { reviewStatus: "rejected" },
      });
    }

    const counters = await recomputeReviewCounters(id, tenantId);
    ok(res, counters);
  } catch (err) { next(err); }
});

// ── POST /internal/resume/bulk/:id/commit — create candidates + parse ────
// Enforces the monthly resume quota NOW (over the approved count). For each
// approved staging item: upsert a real Candidate, create a Resume row (text
// already extracted — no re-extract), enqueue parse (which auto-screens).
router.post("/bulk/:id/commit", requireUploader, express.json({ limit: "1mb" }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const id = req.params["id"] as string;

    const bulk = await prisma.bulkUpload.findFirst({ where: { id, tenantId } });
    if (!bulk) throw Errors.notFound("Bulk upload");

    const approved = await prisma.bulkImportItem.findMany({
      where: { bulkUploadId: id, tenantId, reviewStatus: "approved", candidateId: null },
      orderBy: { createdAt: "asc" },
    });

    if (approved.length === 0) {
      // Nothing to do — still mark done so the UI doesn't spin forever.
      await prisma.bulkUpload.update({ where: { id }, data: { phase: "done", status: "COMPLETED", completedAt: new Date() } });
      return res.status(200).json({ success: true, data: { committed: 0, skipped: 0 } });
    }

    // Enforce the monthly resume-parse quota over the approved count. Fail-open
    // (billing down ⇒ allow) so an outage never blocks hiring.
    const quota = await checkResumeQuota(approved.length, tenantId, userId);
    if (!quota.allowed) {
      throw Errors.planLimit(
        `Your ${quota.plan} plan allows ${quota.limit} resume parses per month (used ${quota.used}). ` +
        `Committing ${approved.length} approved candidates would exceed it — upgrade your plan or reject some.`
      );
    }

    await prisma.bulkUpload.update({
      where: { id },
      data: { phase: "committing", status: "PROCESSING" },
    });

    let committed = 0, skipped = 0;
    const errors: Array<{ filename: string; error: string }> = [];
    for (const item of approved) {
      try {
        // Name/email: prefer the recruiter-reviewed values, fall back to the
        // filename for the name and a deterministic placeholder for the email.
        const fromFile = nameFromFileName(item.fileName);
        let firstName = "Pending";
        let lastName = `Bulk ${committed + 1}`;
        if (item.detectedName && item.detectedName.trim()) {
          const parts = item.detectedName.trim().split(/\s+/);
          firstName = parts[0] || "Pending";
          lastName = parts.slice(1).join(" ") || `Bulk ${committed + 1}`;
        } else if (fromFile.firstName) {
          firstName = fromFile.firstName;
          lastName = fromFile.lastName || `Bulk ${committed + 1}`;
        }
        const email =
          item.detectedEmail && item.detectedEmail.includes("@")
            ? item.detectedEmail.trim().toLowerCase()
            : `bulk-${bulk.id.slice(0, 8)}-${committed}@pending.placeholder`;

        const candidate = await upsertCandidate(
          { email, firstName, lastName, source: "BULK_UPLOAD" },
          tenantId,
          userId
        );
        if (!candidate) throw new Error("candidate-service unreachable — could not create candidate");

        const resume = await prisma.resume.create({
          data: {
            tenantId,
            candidateId: candidate.id,
            fileName: item.fileName,
            originalFilename: item.fileName,
            fileSize: item.sizeBytes,
            mimeType: item.mimeType,
            extractedText: item.extractedText ?? "",
            parseStatus: "EXTRACTED",
            bulkUploadId: bulk.id,
          },
        });

        await prisma.bulkImportItem.update({
          where: { id: item.id },
          data: { candidateId: candidate.id },
        });

        await enqueueResumeParse({
          candidateId: candidate.id,
          tenantId, userId,
          resumeId: resume.id,
          bulkUploadId: bulk.id,
        });
        committed += 1;
      } catch (err) {
        skipped += 1;
        errors.push({ filename: item.fileName, error: err instanceof Error ? err.message : String(err) });
      }
    }

    await prisma.bulkUpload.update({
      where: { id },
      data: {
        phase: "done",
        // Parse/screen progress is tracked separately via processedFiles; the
        // committed count is the number of parse jobs we enqueued.
        committedCount: { increment: committed },
        ...(errors.length ? { errors: errors as any } : {}),
      },
    });

    res.status(200).json({ success: true, data: { committed, skipped } });
  } catch (err) { next(err); }
});

// ── GET /internal/resume/:candidateId ───────────────────────────────────
router.get("/:candidateId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const candidateId = req.params["candidateId"] as string;
    const r = await prisma.resume.findFirst({ where: { candidateId, tenantId } });
    if (!r) throw Errors.notFound("Resume");
    ok(res, r);
  } catch (err) { next(err); }
});

// ── GET /internal/resume/:resumeId/download-url ─────────────────────────
// Phase 35b — generate a 10-minute presigned URL for the resume binary.
// Recruiter clicks "Download original" in /candidates; we hand them a
// short-lived signed URL so the file isn't served through the gateway
// (saves bandwidth + simplifies CORS).
router.get("/:resumeId/download-url", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const resumeId = req.params["resumeId"] as string;
    const r = await prisma.resume.findFirst({ where: { id: resumeId, tenantId } });
    if (!r) throw Errors.notFound("Resume");
    if (!r.storageKey) throw Errors.notFound("Resume binary (storage not configured at upload time)");
    const url = await getPresignedDownloadUrl(r.storageKey);
    if (!url) throw Errors.unavailable("Storage not configured");
    ok(res, { url, expiresInSeconds: 600, fileName: r.originalFilename ?? r.fileName });
  } catch (err) { next(err); }
});

// ── POST /internal/resume/reparse/:candidateId ──────────────────────────
// Re-run the full parse → enrich → semantic-match → verify pipeline on the
// candidate's stored resume text (no re-upload needed). Used to backfill old
// candidates after the engine improves (the path referenced in DEPLOY.md).
router.post("/reparse/:candidateId", requireRole("ADMIN", "RECRUITER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const candidateId = req.params["candidateId"] as string;
    const r = await prisma.resume.findFirst({ where: { candidateId, tenantId }, orderBy: { createdAt: "desc" } });
    if (!r) throw Errors.notFound("Resume");
    if (!r.extractedText) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_EXTRACTED_TEXT", message: "Stored resume has no extracted text to re-parse; re-upload the file." },
      });
    }
    const out = await runParsePipeline({
      resumeId: r.id,
      candidateId,
      tenantId,
      userId,
      resumeText: r.extractedText,
      logger: reparseLogger,
      reparse: true,
    });
    ok(res, { reparsed: true, resumeId: r.id, ...out });
  } catch (err) { next(err); }
});

/**
 * Recompute the BulkUpload's pending/approved/rejected counters from the actual
 * BulkImportItem rows (authoritative — avoids drift from concurrent edits).
 */
async function recomputeReviewCounters(bulkUploadId: string, tenantId: string) {
  const grouped = await prisma.bulkImportItem.groupBy({
    by: ["reviewStatus"],
    where: { bulkUploadId, tenantId },
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.reviewStatus] = g._count._all;
  const pendingCount = counts["pending"] ?? 0;
  const approvedCount = counts["approved"] ?? 0;
  const rejectedCount = counts["rejected"] ?? 0;
  await prisma.bulkUpload.update({
    where: { id: bulkUploadId },
    data: { pendingCount, approvedCount, rejectedCount },
  });
  return { pendingCount, approvedCount, rejectedCount };
}

export default router;
