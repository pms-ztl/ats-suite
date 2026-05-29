/**
 * Resume routes — single upload + bulk upload + status polling.
 *
 *   POST /internal/resume/upload         — single resume upload + enqueue parse
 *   POST /internal/resume/bulk           — bulk multi-file upload + bulk record
 *   GET  /internal/resume/bulk/:id       — poll bulk progress
 *   GET  /internal/resume/:candidateId   — fetch latest resume for candidate
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId, requireRole, createLogger } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: resume upload (single + bulk) is admin/recruiter.
const requireUploader = requireRole("ADMIN", "RECRUITER");
import { prisma } from "../lib/prisma.js";
import { enqueueResumeParse } from "../lib/queue.js";
import { runParsePipeline } from "../lib/parse-pipeline.js";

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

const UploadBodySchema = z.object({
  candidateId: z.string().uuid(),
});

// ── POST /internal/resume/upload ────────────────────────────────────────
router.post(
  "/upload",
  requireUploader,
  singleUpload.single("resume"),
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
      totalFiles: row.totalFiles,
      processedFiles: row.processedFiles,
      failedFiles: row.failedFiles,
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

export default router;
