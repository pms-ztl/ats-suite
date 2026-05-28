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
import { ok, created, Errors, getTenantId, getUserId, requireRole } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: resume upload (single + bulk) is admin/recruiter.
const requireUploader = requireRole("ADMIN", "RECRUITER");
import { prisma } from "../lib/prisma.js";
import { enqueueResumeParse } from "../lib/queue.js";
import { upsertCandidate } from "../lib/service-client.js";

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

      const extractedText = req.file.buffer.toString("utf-8").slice(0, 50000);

      const resume = await prisma.resume.upsert({
        where: { candidateId: body.candidateId },
        update: {
          tenantId,
          fileName: req.file.originalname,
          originalFilename: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          extractedText,
          parseStatus: "EXTRACTED",
        },
        create: {
          tenantId,
          candidateId: body.candidateId,
          fileName: req.file.originalname,
          originalFilename: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          extractedText,
          parseStatus: "EXTRACTED",
        },
      });

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
          const extractedText = buf.toString("utf-8").slice(0, 50000);

          // Derive placeholder candidate details from filename
          const baseName = file.originalname.replace(/\.(pdf|docx?|txt)$/i, "")
            .replace(/[-_]+/g, " ").trim();
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

export default router;
