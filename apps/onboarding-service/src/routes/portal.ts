/**
 * Module F — PUBLIC candidate onboarding portal (no JWT). Mounted at
 * /public/onboarding (gateway: /api/public/onboarding). The opaque portalToken in
 * the path IS the credential; the tenant is resolved from the case row via the
 * admin client. The candidate submits their profile, documents, PAN, and bank
 * details; verifications run through the pluggable KYC provider (stub by default,
 * which records an honest NEEDS_PROVIDER result — never a fabricated pass).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { ok, Errors, createLogger } from "@cdc-ats/common";
import { SubmitPanSchema, SubmitBankAccountSchema } from "@cdc-ats/contracts";
import { prismaAdmin } from "../lib/prisma.js";
import { getKycProvider } from "../lib/kyc.js";
import { recomputeStatus } from "../lib/case-service.js";
import { buildKey, putObject, getPresignedDownloadUrl, isStorageConfigured } from "../lib/storage.js";

const router = Router();
const logger = createLogger({ serviceName: "onboarding-service:portal" });

// Document uploads accepted from the (unauthenticated) candidate portal. Common
// onboarding paperwork: signed offer, PAN card, government photo ID, bank proof.
// In-memory storage — these are small single files; the size ceiling is enforced
// by multer AND re-checked server-side from the actual buffer (never trust the
// client-supplied Content-Length).
const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_DOC_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/tiff",
]);
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOC_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED_DOC_MIMES.has(file.mimetype));
  },
});

async function loadCaseByToken(token: string) {
  const c = await prismaAdmin.onboardingCase.findUnique({
    where: { portalToken: token },
    include: { tasks: { orderBy: { order: "asc" } }, documents: true, verifications: true },
  });
  if (!c) throw Errors.notFound("Onboarding link");
  return c;
}

// Strip internal fields before returning to the (unauthenticated) candidate.
function publicView(c: Awaited<ReturnType<typeof loadCaseByToken>>) {
  return {
    id: c.id,
    candidateName: c.candidateName,
    jobTitle: c.jobTitle,
    status: c.status,
    startDate: c.startDate,
    tasks: c.tasks.map((t) => ({
      id: t.id, kind: t.kind, title: t.title, description: t.description, required: t.required, status: t.status, order: t.order,
      // Document upload surface for DOCUMENT-kind tasks (null on every other task).
      documentFileName: t.documentFileName, documentUploadedAt: t.documentUploadedAt,
    })),
    documents: c.documents.map((d) => ({ id: d.id, label: d.label, fileName: d.fileName, uploadedAt: d.uploadedAt })),
    verifications: c.verifications.map((v) => ({ type: v.type, status: v.status, provider: v.provider, maskedValue: v.maskedValue, message: v.message, verifiedAt: v.verifiedAt })),
  };
}

// GET /public/onboarding/:token — the candidate's onboarding case.
router.get("/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await loadCaseByToken(req.params["token"] as string);
    ok(res, publicView(c));
  } catch (err) { next(err); }
});

// POST /public/onboarding/:token/pan — submit + verify PAN.
router.post("/:token/pan", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await loadCaseByToken(req.params["token"] as string);
    const body = SubmitPanSchema.parse(req.body);
    const provider = getKycProvider();
    const result = await provider.verify({ type: "PAN", pan: body.pan, nameOnPan: body.nameOnPan });
    await prismaAdmin.verification.upsert({
      where: { caseId_type: { caseId: c.id, type: "PAN" } },
      create: { tenantId: c.tenantId, caseId: c.id, type: "PAN", status: result.status, provider: result.provider, providerRef: result.providerRef, maskedValue: result.maskedValue, message: result.message, verifiedAt: result.status === "VERIFIED" ? new Date() : null },
      update: { status: result.status, provider: result.provider, providerRef: result.providerRef, maskedValue: result.maskedValue, message: result.message, verifiedAt: result.status === "VERIFIED" ? new Date() : null },
    });
    await markVerificationTaskDone(c.id, "Verify your PAN");
    await recomputeStatus(c.id);
    ok(res, publicView(await loadCaseByToken(req.params["token"] as string)));
  } catch (err) { next(err); }
});

// POST /public/onboarding/:token/bank — submit + verify bank account.
router.post("/:token/bank", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await loadCaseByToken(req.params["token"] as string);
    const body = SubmitBankAccountSchema.parse(req.body);
    const provider = getKycProvider();
    const result = await provider.verify({ type: "BANK_ACCOUNT", accountNumber: body.accountNumber, ifsc: body.ifsc, accountHolder: body.accountHolder });
    await prismaAdmin.verification.upsert({
      where: { caseId_type: { caseId: c.id, type: "BANK_ACCOUNT" } },
      create: { tenantId: c.tenantId, caseId: c.id, type: "BANK_ACCOUNT", status: result.status, provider: result.provider, providerRef: result.providerRef, maskedValue: result.maskedValue, message: result.message, verifiedAt: result.status === "VERIFIED" ? new Date() : null },
      update: { status: result.status, provider: result.provider, providerRef: result.providerRef, maskedValue: result.maskedValue, message: result.message, verifiedAt: result.status === "VERIFIED" ? new Date() : null },
    });
    await markVerificationTaskDone(c.id, "Add your bank account");
    await recomputeStatus(c.id);
    ok(res, publicView(await loadCaseByToken(req.params["token"] as string)));
  } catch (err) { next(err); }
});

// POST /public/onboarding/:token/tasks/:taskId/complete — mark a task submitted/done.
router.post("/:token/tasks/:taskId/complete", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await loadCaseByToken(req.params["token"] as string);
    const taskId = req.params["taskId"] as string;
    const task = c.tasks.find((t) => t.id === taskId);
    if (!task) throw Errors.notFound("Task");
    await prismaAdmin.onboardingTask.update({
      where: { id: taskId },
      data: { status: "DONE", completedAt: new Date() },
    });
    await recomputeStatus(c.id);
    ok(res, publicView(await loadCaseByToken(req.params["token"] as string)));
  } catch (err) { next(err); }
});

// POST /public/onboarding/:token/tasks/:taskId/document — upload a document for a
// DOCUMENT-kind task (e.g. signed offer, PAN card, government photo ID). Multipart
// field name: "document". Token-authenticated (no login); the case row resolves the
// tenant, so the admin client is correct here — the portal never runs on the RLS
// client, so there is no post-multer tenantContext to re-apply.
router.post(
  "/:token/tasks/:taskId/document",
  documentUpload.single("document"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const c = await loadCaseByToken(req.params["token"] as string);
      const taskId = req.params["taskId"] as string;
      const task = c.tasks.find((t) => t.id === taskId);
      if (!task) throw Errors.notFound("Task");
      if (task.kind !== "DOCUMENT") throw Errors.validation("This task does not accept a document upload");
      if (!req.file) throw Errors.validation("A document file is required (field name 'document')");

      // Server-side size check from the actual buffer — never trust client size.
      // multer's fileSize limit already caps it, but re-verify defensively.
      const size = req.file.buffer.length;
      if (size === 0) throw Errors.validation("The uploaded file is empty");
      if (size > MAX_DOC_BYTES) throw Errors.validation("The file exceeds the 10MB limit");
      if (!ALLOWED_DOC_MIMES.has(req.file.mimetype)) {
        throw Errors.validation("Unsupported file type. Upload a PDF, Word document, or image (PNG/JPG/WebP/TIFF).");
      }

      const fileName = req.file.originalname || "document";
      const contentType = req.file.mimetype;

      // Store to object storage when configured. If it is not, we record an honest
      // SUBMITTED state (received but not yet persisted to storage) rather than
      // faking a completed upload.
      let storageKey: string | null = null;
      if (isStorageConfigured()) {
        const key = buildKey({ tenantId: c.tenantId, caseId: c.id, taskId, fileName });
        storageKey = await putObject({ key, body: req.file.buffer, contentType });
      } else {
        logger.warn({ caseId: c.id, taskId }, "onboarding document received but object storage is not configured");
      }

      const now = new Date();
      const stored = storageKey !== null;

      // Record the doc on the task (DONE only when actually persisted; otherwise
      // SUBMITTED so the recruiter can see it arrived but needs storage attention).
      await prismaAdmin.onboardingTask.update({
        where: { id: taskId },
        data: {
          documentStorageKey: storageKey,
          documentFileName: fileName,
          documentContentType: contentType,
          documentSize: size,
          documentUploadedAt: now,
          status: stored ? "DONE" : "SUBMITTED",
          completedAt: stored ? now : null,
        },
      });

      // Also append to the document ledger (idempotent per task — replace prior).
      await prismaAdmin.onboardingDocument.deleteMany({ where: { caseId: c.id, taskId } });
      await prismaAdmin.onboardingDocument.create({
        data: {
          tenantId: c.tenantId,
          caseId: c.id,
          taskId,
          label: task.title,
          storageKey,
          fileName,
          contentType,
          size,
          uploadedAt: now,
        },
      });

      await recomputeStatus(c.id);
      const view = publicView(await loadCaseByToken(req.params["token"] as string));
      ok(res, { ...view, upload: { stored, fileName } });
    } catch (err) { next(err); }
  },
);

// GET /public/onboarding/:token/tasks/:taskId/document — presigned download URL for
// a previously uploaded document (so the candidate can re-view what they sent).
router.get("/:token/tasks/:taskId/document", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const c = await loadCaseByToken(req.params["token"] as string);
    const taskId = req.params["taskId"] as string;
    const task = c.tasks.find((t) => t.id === taskId);
    if (!task) throw Errors.notFound("Task");
    if (!task.documentStorageKey) throw Errors.notFound("Uploaded document");
    const url = await getPresignedDownloadUrl(task.documentStorageKey);
    if (!url) throw Errors.notFound("Document storage is not available");
    ok(res, { url, fileName: task.documentFileName });
  } catch (err) { next(err); }
});

// Mark the VERIFICATION task with the given title as DONE (best-effort).
async function markVerificationTaskDone(caseId: string, title: string): Promise<void> {
  await prismaAdmin.onboardingTask.updateMany({
    where: { caseId, title, kind: "VERIFICATION" },
    data: { status: "DONE", completedAt: new Date() },
  });
}

export default router;
