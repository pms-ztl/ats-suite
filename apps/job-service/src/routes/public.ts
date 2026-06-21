/**
 * Public (unauthenticated) routes — candidate-facing.
 *
 *   GET /public/jobs                 — published listings
 *   GET /public/jobs/:slug           — single job
 *   GET /public/jobs/:slug/form      — form schema for this job
 *   POST /public/jobs/:slug/apply    — submit application (creates Candidate
 *                                       via candidate-service + Application)
 *
 * These are public because the gateway forwards /api/public/* without auth.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { createHash } from "node:crypto";
import multer from "multer";
import { z } from "zod";
import { ok, Errors, createLogger } from "@cdc-ats/common";
// Public (unauthenticated) routes look up postings/forms by slug with no tenant
// in context, so they use the admin (non-RLS) client.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import {
  callCandidateService,
  forwardResumeUpload,
  getResumeParseStatus,
  getScreeningStatus,
} from "../lib/service-client.js";
import {
  isIncomingStorageConfigured,
  createUploadTicket,
  extForContentType,
  statIncomingObject,
} from "../lib/incoming-storage.js";
import { enqueueApplyIngest } from "../lib/apply-ingest-queue.js";

const logger = createLogger({ serviceName: "job-service:public-apply" });

const router = Router();

// In-memory upload for the public custom-form apply (resume + fields).
const applyUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/jobs", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const postings = await prisma.jobPosting.findMany({
      where: { isPublished: true },
      include: { requisition: { select: { id: true, title: true, department: true, location: true, salaryMin: true, salaryMax: true, salaryCurrency: true } } },
      orderBy: { publishedAt: "desc" },
      take: 100,
    });
    ok(res, postings);
  } catch (err) { next(err); }
});

router.get("/jobs/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params["slug"] as string;
    const posting = await prisma.jobPosting.findFirst({
      where: { slug, isPublished: true },
      include: {
        requisition: {
          select: {
            id: true, title: true, department: true, location: true,
            description: true, requirements: true,
            salaryMin: true, salaryMax: true, salaryCurrency: true,
          },
        },
      },
    });
    if (!posting) throw Errors.notFound("Job posting");
    // Increment views (best-effort, don't block response)
    prisma.jobPosting.update({ where: { id: posting.id }, data: { views: { increment: 1 } } }).catch(() => {});
    ok(res, posting);
  } catch (err) { next(err); }
});

router.get("/jobs/:slug/form", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params["slug"] as string;
    const posting = await prisma.jobPosting.findFirst({
      where: { slug, isPublished: true },
      select: { requisitionId: true, title: true },
    });
    if (!posting) throw Errors.notFound("Job posting");
    const schema = await prisma.applicationFormSchema.findUnique({
      where: { requisitionId: posting.requisitionId },
    });
    ok(res, {
      slug, title: posting.title,
      name: schema?.name ?? "Default",
      fields: schema?.fields ?? DEFAULT_FIELDS,
      isDefault: !schema,
    });
  } catch (err) { next(err); }
});

// ── GET /public/jobs/:slug/upload-ticket?type=application/pdf ────────────────
// WF-I / I1 — presigned POST upload ticket for the apply FAST PATH. Returns a
// short-lived, server-signed MinIO/S3 POST policy so the candidate's browser
// uploads the resume DIRECTLY to the incoming bucket (off the gateway hot path),
// then the new frontend calls the accept-fast apply path with the returned
// objectKey. Public (no auth) — the gateway forwards /api/public/* unauthed and
// the tenant is resolved from the job slug here, exactly like the other /public
// by-slug routes. NO gateway edit: this mounts under the existing /api/public
// proxy (/api/public/jobs/:slug/upload-ticket -> /public/jobs/:slug/upload-ticket).
//
// Backward-compat: this is purely ADDITIVE. If object storage is NOT configured
// (no MinIO/S3 env) we return a clear 503 with code STORAGE_UNAVAILABLE so the
// frontend falls back to the EXISTING multipart apply (POST .../apply-custom),
// which is unchanged. Old frontends never call this route and keep working.
//
// Response 200: { postURL, formData, objectKey, expiresAt }
//   - postURL:  the bucket URL the browser POSTs the multipart form to
//   - formData: form fields to send BEFORE the file (file MUST be the LAST part)
//   - objectKey: incoming/<tenantId>/<jobId>/<uuid>.<ext> — passed to the accept step
//   - expiresAt: ISO 8601; the policy is valid for 5 minutes
const ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
router.get("/jobs/:slug/upload-ticket", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params["slug"] as string;
    const contentType = (typeof req.query["type"] === "string" ? req.query["type"] : "").trim().toLowerCase();
    if (!contentType) {
      return res.status(400).json({ success: false, error: { code: "TYPE_REQUIRED", message: "A content type query param (?type=) is required" } });
    }
    if (!ALLOWED_UPLOAD_TYPES.has(contentType)) {
      return res.status(415).json({
        success: false,
        error: { code: "UNSUPPORTED_TYPE", message: "Only PDF, DOC, DOCX, or TXT resumes are accepted" },
      });
    }

    // Resolve the tenant + job from the public slug (admin client, no tenant ctx).
    const posting = await prisma.jobPosting.findFirst({
      where: { slug, isPublished: true },
      select: { id: true, tenantId: true },
    });
    if (!posting) throw Errors.notFound("Job posting");

    // Storage off → 503 so the frontend falls back to the multipart apply.
    if (!isIncomingStorageConfigured()) {
      return res.status(503).json({
        success: false,
        error: {
          code: "STORAGE_UNAVAILABLE",
          message: "Direct upload is not available; submit the resume with the application form instead",
        },
      });
    }

    const ext = extForContentType(contentType) ?? "bin";
    const ticket = createUploadTicket({
      tenantId: posting.tenantId,
      jobId: posting.id,
      contentType,
      ext,
    });
    // Defensive: createUploadTicket only returns null when storage is unconfigured
    // (already handled above), but treat a null as the same 503 fallback signal.
    if (!ticket) {
      return res.status(503).json({
        success: false,
        error: { code: "STORAGE_UNAVAILABLE", message: "Direct upload is not available; submit the resume with the application form instead" },
      });
    }

    ok(res, ticket);
  } catch (err) { next(err); }
});

const ApplySchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  coverLetter: z.string().optional(),
  formResponses: z.record(z.string(), z.unknown()).optional(),
});

router.post("/jobs/:slug/apply", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params["slug"] as string;
    const body = ApplySchema.parse(req.body);
    const posting = await prisma.jobPosting.findFirst({
      where: { slug, isPublished: true },
      select: { id: true, requisitionId: true, tenantId: true, title: true },
    });
    if (!posting) throw Errors.notFound("Job posting");

    // 1. Upsert candidate in candidate-service
    const candidate = await callCandidateService<{ id: string; email: string }>({
      method: "POST",
      path: "/internal/candidates/upsert-from-application",
      tenantId: posting.tenantId,
      body: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        linkedinUrl: body.linkedinUrl || undefined,
        source: "PUBLIC_APPLY",
      },
    });

    // 2. Create application in candidate-service.
    // role:"RECRUITER" — /internal/applications is recruiter/admin-gated, but
    // this is a trusted internal call from the public-apply handler (the
    // applicant is anonymous / role CANDIDATE, which the endpoint rejects).
    // Same pattern as forwardResumeUpload's X-User-Role:"ADMIN".
    const application = await callCandidateService<{ id: string }>({
      method: "POST",
      path: "/internal/applications",
      tenantId: posting.tenantId,
      role: "RECRUITER",
      body: {
        candidateId: candidate.id,
        requisitionId: posting.requisitionId,
        notes: body.coverLetter ?? null,
        formResponses: body.formResponses ?? {},
      },
    });

    // 3. Bump application count (best-effort)
    prisma.jobPosting.update({
      where: { id: posting.id },
      data: { applicationCount: { increment: 1 } },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: {
        applicationId: application.id,
        candidateId: candidate.id,
        message: "Application submitted successfully",
      },
    });
  } catch (err) { next(err); }
});

// ── POST /public/jobs/:slug/apply-custom ────────────────────────────────
// DUAL-PATH public apply (WF-I / I2). No auth (public). The SAME endpoint serves
// both the legacy multipart upload AND the new accept-fast JSON path so the
// frozen v1 + current v2 frontends keep working byte-for-byte while the new v2
// frontend opts into the scalable presigned flow.
//
//   PATH DETECTION (mutually exclusive, decided per request):
//     - ACCEPT-FAST  : Content-Type application/json AND body.resume.objectKey is
//                      a non-empty string (the browser already uploaded the resume
//                      DIRECTLY to the incoming bucket via the I1 presigned ticket).
//                      -> the new 202 flow below.
//     - MULTIPART    : everything else (multipart/form-data with a resume file, or
//                      any non-accept-fast JSON). -> the EXISTING behavior, response
//                      contract UNCHANGED (201 { applicationId, candidateId,
//                      resumeForwarded, message }).
//   multer().any() is a no-op for a non-multipart request, so it is safe to leave
//   it on the route and branch after it: a JSON accept-fast body is left intact in
//   req.body by the global express.json parser; a multipart body is parsed by
//   multer as before.
const STD_FIELDS = new Set(["firstName", "lastName", "email", "phone", "linkedinUrl", "coverLetter"]);

router.post("/jobs/:slug/apply-custom", applyUpload.any(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params["slug"] as string;
    const posting = await prisma.jobPosting.findFirst({
      where: { slug, isPublished: true },
      select: { id: true, requisitionId: true, tenantId: true },
    });
    if (!posting) throw Errors.notFound("Job posting");

    const body = (req.body ?? {}) as Record<string, unknown>;
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const isAcceptFast =
      files.length === 0 &&
      typeof body["resume"] === "object" &&
      body["resume"] !== null &&
      typeof (body["resume"] as Record<string, unknown>)["objectKey"] === "string" &&
      ((body["resume"] as Record<string, unknown>)["objectKey"] as string).length > 0;

    if (isAcceptFast) {
      return await handleAcceptFastApply(req, res, slug, posting);
    }
    return await handleMultipartApply(req, res, posting, body, files);
  } catch (err) { next(err); }
});

// ── EXISTING multipart apply — response contract UNCHANGED ───────────────────
// Multipart apply for the candidate portal's custom form: arbitrary fields + a
// resume file. Creates Candidate + Application (tenant resolved from slug) AND
// forwards the resume to resume-service for parsing. Kept verbatim so the frozen
// v1 + current v2 frontends are UNAFFECTED.
async function handleMultipartApply(
  _req: Request,
  res: Response,
  posting: { id: string; requisitionId: string; tenantId: string },
  fields: Record<string, unknown>,
  files: Express.Multer.File[],
): Promise<void> {
  const str = (k: string) => (typeof fields[k] === "string" ? (fields[k] as string).trim() : undefined);
  const email = str("email");
  const firstName = str("firstName") ?? "Applicant";
  const lastName = str("lastName") ?? "";
  if (!email) {
    res.status(400).json({ success: false, error: { code: "EMAIL_REQUIRED", message: "Email is required" } });
    return;
  }
  // Everything that isn't a standard field becomes a custom form response.
  const formResponses: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) if (!STD_FIELDS.has(k)) formResponses[k] = v;

  const candidate = await callCandidateService<{ id: string }>({
    method: "POST",
    path: "/internal/candidates/upsert-from-application",
    tenantId: posting.tenantId,
    body: { firstName, lastName, email, phone: str("phone"), linkedinUrl: str("linkedinUrl") || undefined, source: "PUBLIC_APPLY" },
  });
  const application = await callCandidateService<{ id: string }>({
    method: "POST",
    path: "/internal/applications",
    tenantId: posting.tenantId,
    role: "RECRUITER", // trusted internal call; endpoint is recruiter/admin-gated
    body: { candidateId: candidate.id, requisitionId: posting.requisitionId, notes: str("coverLetter") ?? null, formResponses },
  });

  // Forward the resume (field "resume", else the first file) for parsing.
  const resumeFile = files.find((f) => f.fieldname === "resume") ?? files[0];
  let resumeForwarded = false;
  if (resumeFile) {
    resumeForwarded = await forwardResumeUpload({
      tenantId: posting.tenantId,
      candidateId: candidate.id,
      file: { buffer: resumeFile.buffer, originalname: resumeFile.originalname, mimetype: resumeFile.mimetype },
    });
  }

  prisma.jobPosting.update({ where: { id: posting.id }, data: { applicationCount: { increment: 1 } } }).catch(() => {});
  res.status(201).json({
    success: true,
    data: { applicationId: application.id, candidateId: candidate.id, resumeForwarded, message: "Application submitted successfully" },
  });
}

// ── NEW accept-fast apply (presigned objectKey -> 202) ───────────────────────
// The browser already uploaded the resume DIRECTLY to the incoming bucket via the
// I1 presigned ticket, so this path NEVER touches the resume bytes: it verifies
// the upload server-side (statObject), records ONE minimal Candidate + Application
// inside an idempotency-guarded transaction, enqueues the staged ingest job (parse
// + screen run async in the I3 worker), and returns 202 the instant the rows are
// real. No fabricated data: the 202 is emitted only after the Application row
// exists, and the pipeline stage reflects the real ingest progress.
const AcceptFastSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80).or(z.literal("")).optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  coverLetter: z.string().max(20_000).optional(),
  formResponses: z.record(z.string(), z.unknown()).optional(),
  // The presigned upload the browser completed against the incoming bucket. size
  // is the client's claim only - it is RE-VERIFIED via statObject below.
  resume: z.object({
    objectKey: z.string().min(1).max(512),
    filename: z.string().trim().min(1).max(255),
    contentType: z.string().trim().min(1).max(120),
    size: z.number().int().nonnegative().optional(),
  }),
  // Optional Turnstile / hCaptcha token. Verified only when a secret is configured
  // (TURNSTILE_SECRET); absent secret -> not enforced (dev/demo), so the demo is
  // never blocked by an unconfigured captcha.
  turnstileToken: z.string().optional(),
});

const MAX_RESUME_BYTES = Number(process.env["PUBLIC_APPLY_MAX_RESUME_BYTES"] ?? 10 * 1024 * 1024);

async function handleAcceptFastApply(
  req: Request,
  res: Response,
  slug: string,
  posting: { id: string; requisitionId: string; tenantId: string },
): Promise<void> {
  // Storage MUST be configured for this path (the browser uploaded to the bucket).
  // If it is not, signal the client to fall back to the multipart apply (503),
  // exactly like the I1 upload-ticket route.
  if (!isIncomingStorageConfigured()) {
    res.status(503).json({
      success: false,
      error: { code: "STORAGE_UNAVAILABLE", message: "Direct upload is not available; submit the resume with the application form instead" },
    });
    return;
  }

  const parsed = AcceptFastSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: "VALIDATION", message: "Invalid application", details: parsed.error.flatten() },
    });
    return;
  }
  const data = parsed.data;
  const email = data.email.toLowerCase();

  // The objectKey MUST belong to THIS tenant + job (the presigned key layout is
  // incoming/<tenantId>/<jobId>/<uuid>.<ext>). Reject a key that does not match
  // so a caller cannot point the apply at another tenant's upload.
  const expectedPrefix = `incoming/${posting.tenantId}/${posting.id}/`;
  if (!data.resume.objectKey.startsWith(expectedPrefix)) {
    res.status(400).json({
      success: false,
      error: { code: "OBJECT_KEY_MISMATCH", message: "The uploaded file does not belong to this job application" },
    });
    return;
  }

  // Optional captcha (Turnstile). Enforced only when a secret is set.
  const captchaOk = await verifyTurnstile(data.turnstileToken, req.ip);
  if (!captchaOk) {
    res.status(400).json({
      success: false,
      error: { code: "CAPTCHA_FAILED", message: "Could not verify you are human; please retry." },
    });
    return;
  }

  // NEVER trust the client size: HEAD the object for its REAL size + existence.
  const stat = await statIncomingObject(data.resume.objectKey);
  if (stat === null) {
    // statObject only returns null when storage is unconfigured (handled above);
    // treat defensively as a fallback signal.
    res.status(503).json({
      success: false,
      error: { code: "STORAGE_UNAVAILABLE", message: "Direct upload is not available; submit the resume with the application form instead" },
    });
    return;
  }
  if (!stat.exists) {
    res.status(400).json({
      success: false,
      error: { code: "UPLOAD_NOT_FOUND", message: "The uploaded resume was not found; please upload again." },
    });
    return;
  }
  const realSize = stat.size ?? 0;
  if (realSize <= 0 || realSize > MAX_RESUME_BYTES) {
    res.status(400).json({
      success: false,
      error: { code: "FILE_TOO_LARGE", message: `Resume must be between 1 byte and ${Math.floor(MAX_RESUME_BYTES / (1024 * 1024))}MB` },
    });
    return;
  }

  // ── Idempotency key: the Idempotency-Key header wins; else a stable hash of the
  // request identity so a naive retry (no header) still coalesces. ─────────────
  const headerKey = (req.headers["idempotency-key"] as string | undefined)?.trim();
  const idempotencyKey =
    headerKey && headerKey.length > 0 && headerKey.length <= 200
      ? headerKey
      : createHash("sha256")
          .update(`${posting.tenantId}|${slug}|${email}|${data.resume.objectKey}`)
          .digest("hex");

  // ── Idempotency ledger: ATOMICALLY claim the key. A concurrent in-flight claim
  // -> 409; an already-finished claim -> replay the cached 202. Stays on
  // prismaAdmin (public, no request tenant context). The claim is race-safe: we
  // first try to INSERT the row (the UNIQUE(tenantId, idempotencyKey) makes a
  // duplicate insert fail), and only if that collides do we read the existing row
  // and try a CONDITIONAL update that grabs the lock ONLY when it is free or stale.
  // Losing either race -> the other request owns the accept -> replay or 409.
  const LOCK_STALE_MS = Number(process.env["APPLY_IDEMPOTENCY_LOCK_STALE_MS"] ?? 30_000);
  const now = new Date();
  const staleBefore = new Date(now.getTime() - LOCK_STALE_MS);

  let claimed = false;
  try {
    await prisma.applicationIdempotency.create({
      data: {
        tenantId: posting.tenantId,
        idempotencyKey,
        requestMethod: "POST",
        requestPath: `/public/jobs/${slug}/apply-custom`,
        recoveryPoint: "started",
        lockedAt: now,
        lastRunAt: now,
      },
    });
    claimed = true; // we inserted the row -> we own the accept.
  } catch {
    // Unique collision -> a row already exists. Either it finished (replay) or it
    // is locked (concurrent / stale).
    const existing = await prisma.applicationIdempotency.findUnique({
      where: { tenantId_idempotencyKey: { tenantId: posting.tenantId, idempotencyKey } },
      select: { responseCode: true, responseBody: true },
    });
    if (existing?.responseCode && existing.responseBody) {
      // Accept step finished -> replay the cached 202 verbatim (true idempotency).
      res.status(existing.responseCode).json(existing.responseBody);
      return;
    }
    // Not finished: try to STEAL the lock only if it is unclaimed or stale. The
    // conditional WHERE makes this atomic across replicas (count===1 -> we won).
    const stolen = await prisma.applicationIdempotency.updateMany({
      where: {
        tenantId: posting.tenantId,
        idempotencyKey,
        responseCode: null,
        OR: [{ lockedAt: null }, { lockedAt: { lt: staleBefore } }],
      },
      data: { lockedAt: now, lastRunAt: now, recoveryPoint: "started" },
    });
    if (stolen.count === 1) {
      claimed = true;
    } else {
      // Someone else holds a fresh lock -> they will produce the row. Back off.
      res.status(409).json({
        success: false,
        error: { code: "APPLY_IN_PROGRESS", message: "This application is already being processed; please wait a moment." },
      });
      return;
    }
  }
  if (!claimed) {
    res.status(409).json({
      success: false,
      error: { code: "APPLY_IN_PROGRESS", message: "This application is already being processed; please wait a moment." },
    });
    return;
  }

  // ── ONE minimal Candidate + Application write. The candidate-service owns those
  // rows + their RLS, so we create them via its internal API (same trusted-call
  // posture as the multipart path). This is the "interactive transaction" boundary
  // for the accept step: candidate upsert then application create; a failure here
  // releases the lock (recoveryPoint stays "started" + lockedAt cleared) so a
  // retry can re-run. We do NOT forward the resume here - the I3 ingest worker does
  // that async. ───────────────────────────────────────────────────────────────
  let candidateId: string;
  let applicationId: string;
  try {
    const formResponses = data.formResponses ?? {};
    const candidate = await callCandidateService<{ id: string }>({
      method: "POST",
      path: "/internal/candidates/upsert-from-application",
      tenantId: posting.tenantId,
      body: {
        firstName: data.firstName,
        lastName: data.lastName ?? "",
        email,
        phone: data.phone,
        linkedinUrl: data.linkedinUrl || undefined,
        source: "PUBLIC_APPLY",
      },
    });
    candidateId = candidate.id;
    const application = await callCandidateService<{ id: string }>({
      method: "POST",
      path: "/internal/applications",
      tenantId: posting.tenantId,
      role: "RECRUITER",
      body: {
        candidateId,
        requisitionId: posting.requisitionId,
        notes: data.coverLetter ?? null,
        formResponses,
      },
    });
    applicationId = application.id;
  } catch (err) {
    // Release the lock so a retry can proceed; surface the upstream error.
    await prisma.applicationIdempotency
      .update({
        where: { tenantId_idempotencyKey: { tenantId: posting.tenantId, idempotencyKey } },
        data: { lockedAt: null, recoveryPoint: "started" },
      })
      .catch(() => {});
    throw err;
  }

  // ── Persist the pipeline stage + the cached 202 on the ledger row, then enqueue
  // the staged ingest. The status route (I4) reads ingestStage (by applicationId)
  // for the live stage; here we set the first stage PENDING_INGEST. responseBody is
  // the exact 202 payload so a replay is byte-identical. ───────────────────────
  const statusPath = `/api/public/applications/${applicationId}/status`;
  const responseBody = {
    success: true,
    data: {
      applicationId,
      candidateId,
      status: "PENDING_INGEST",
      statusUrl: statusPath,
      message: "Application received; processing your resume.",
    },
  };

  // Persist the cached 202 + the created applicationId + the FIRST real pipeline
  // stage. responseCode/responseBody mark the accept step finished (so a replay is
  // byte-identical and re-creates nothing). ingestStage = PENDING_INGEST is the
  // live stage the I3 worker advances and the I4 status route reads by
  // applicationId; recoveryPoint = finished records the accept step is complete.
  await prisma.applicationIdempotency.update({
    where: { tenantId_idempotencyKey: { tenantId: posting.tenantId, idempotencyKey } },
    data: {
      recoveryPoint: "finished",
      responseCode: 202,
      responseBody: responseBody as unknown as object,
      applicationId,
      // Correlation keys so the I3 apply-ingest NATS subscriber can resolve THIS
      // ledger row from the resume.parsed / screening.completed events (which carry
      // candidateId + requisitionId, not applicationId) and advance ingestStage to
      // PARSED / SCREENED.
      candidateId,
      requisitionId: posting.requisitionId,
      ingestStage: "PENDING_INGEST",
      lockedAt: null,
      lastRunAt: new Date(),
    },
  });

  // De-hot-spot: the per-apply applicationCount UPDATE is REMOVED from the request
  // path (it was a row-level write lock on the JobPosting under an apply spike, a
  // top contention point). The accurate count is derived on read from the
  // candidate-service applications, and/or refreshed by a periodic rollup; we no
  // longer take a write lock on every single apply.

  // Enqueue the staged ingest (parse + screen happen async in the I3 worker). When
  // REDIS_URL is unset the queue cannot enqueue; the row still exists + the status
  // route reports PENDING_INGEST honestly (no fabricated progress).
  try {
    await enqueueApplyIngest({
      tenantId: posting.tenantId,
      applicationId,
      candidateId,
      requisitionId: posting.requisitionId,
      objectKey: data.resume.objectKey,
      filename: data.resume.filename,
      contentType: data.resume.contentType,
      size: realSize,
    });
  } catch (err) {
    // The application is already real + accepted; a queue blip must not 500 the
    // applicant. The ingest can be re-driven (the row + objectKey persist).
    logger.warn({ err: err instanceof Error ? err.message : String(err), applicationId }, "apply-ingest enqueue failed; application accepted, ingest deferred");
  }

  res.status(202).json(responseBody);
}

// ── Turnstile (optional) ─────────────────────────────────────────────────────
// Verify a Cloudflare Turnstile token when TURNSTILE_SECRET is configured.
// Absent secret -> not enforced (returns true), so the demo + dev are not blocked
// by an unconfigured captcha. A configured-but-missing/invalid token -> false.
async function verifyTurnstile(token: string | undefined, ip: string | undefined): Promise<boolean> {
  const secret = process.env["TURNSTILE_SECRET"];
  if (!secret) return true; // not enforced
  if (!token) return false;
  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (ip) form.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(Number(process.env["TURNSTILE_TIMEOUT_MS"] ?? 3000)),
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { success?: boolean };
    return body.success === true;
  } catch {
    return false;
  }
}

// ── GET /public/applications/:id/status ──────────────────────────────────────
// WF-I / I4 — the public application status poll. The accept-fast 202 response
// hands the client a statusUrl here (/api/public/applications/:id/status via the
// existing /api/public gateway proxy -> /public/applications/:id/status); the
// candidate-portal apply page polls it to show real progress.
//
// REAL-data-or-honest discipline: every value reflects an ACTUAL pipeline stage,
// never an optimistic/fabricated one. The status enum returned is exactly one of:
//   PENDING_INGEST | SCANNED | PARSED | SCREENED | REJECTED | RECEIVED
//
// Resolution (admin client — public route has no tenant context):
//   1. Find the accept-fast ApplicationIdempotency ledger row by applicationId
//      (the accept step stamped applicationId + candidateId + ingestStage on it).
//        - no ledger row             -> RECEIVED  (e.g. a legacy multipart apply,
//                                       which never touches this ledger but the
//                                       Application row genuinely exists)
//   2. The ledger ingestStage is the worker/subscriber's recorded stage. A terminal
//      REJECTED/FAILED (e.g. malware quarantine at ingest) -> REJECTED.
//   3. For non-terminal stages we ALSO read the REAL downstream state cross-service
//      (resume parse + screening verdict) and take the FURTHEST-ALONG stage, so the
//      poll reflects ground truth even if the ledger stage lags the events:
//        screening COMPLETED / has a verdict -> SCREENED  (a FAIL verdict is still
//                                       SCREENED — the AI verdict is assistive and a
//                                       human owns any reject decision; GDPR Art. 22)
//        resume parseStatus PARSED           -> PARSED
//        resume row exists (EXTRACTED / any) -> SCANNED
//        otherwise                            -> the ledger stage, else PENDING_INGEST
const PUBLIC_STATUSES = ["PENDING_INGEST", "SCANNED", "PARSED", "SCREENED", "REJECTED", "RECEIVED"] as const;
type PublicApplicationStatus = (typeof PUBLIC_STATUSES)[number];

// Order of progress for "furthest-along wins" (terminal states handled separately).
const STAGE_ORDER: Record<string, number> = {
  PENDING_INGEST: 0,
  SCANNED: 1,
  FORWARDED: 1, // worker's internal FORWARDED maps to the public SCANNED tier
  PARSED: 2,
  SCREENED: 3,
};

/** Map an internal ledger ingestStage to a PUBLIC status. Unknown/empty -> null. */
function normalizeIngestStage(stage: string | null | undefined): PublicApplicationStatus | null {
  if (!stage) return null;
  const s = stage.toUpperCase();
  if (s === "REJECTED" || s === "FAILED") return "REJECTED";
  if (s === "SCREENED") return "SCREENED";
  if (s === "PARSED") return "PARSED";
  if (s === "SCANNED" || s === "FORWARDED") return "SCANNED";
  if (s === "PENDING_INGEST" || s === "STARTED" || s === "ACCEPTED") return "PENDING_INGEST";
  return null;
}

const PublicStatusParam = z.object({ id: z.string().min(1).max(64) });

router.get("/applications/:id/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: applicationId } = PublicStatusParam.parse({ id: req.params["id"] });

    // Locate the accept-fast ledger row for this applicationId (indexed on
    // (tenantId, applicationId); we have no tenant here so query by applicationId).
    const ledger = await prisma.applicationIdempotency.findFirst({
      where: { applicationId },
      orderBy: { createdAt: "desc" },
      select: { tenantId: true, candidateId: true, ingestStage: true },
    });

    // No fast-path ledger row. The Application may still exist (legacy multipart
    // apply): answer the honest, terminal-neutral RECEIVED rather than a 404 (a 404
    // here would also leak whether an id exists). found:false marks the difference.
    if (!ledger) {
      respondStatus(res, applicationId, "RECEIVED", false);
      return;
    }

    // Terminal stage from the worker (e.g. malware quarantine) wins immediately.
    const ledgerStatus = normalizeIngestStage(ledger.ingestStage);
    if (ledgerStatus === "REJECTED") {
      respondStatus(res, applicationId, "REJECTED", true);
      return;
    }

    // Read the REAL downstream state and take the furthest-along stage. Best-effort:
    // a peer-service blip simply falls back to the recorded ledger stage.
    let best: PublicApplicationStatus = ledgerStatus ?? "PENDING_INGEST";
    if (ledger.candidateId) {
      const [resumeState, screeningState] = await Promise.all([
        getResumeParseStatus(ledger.tenantId, ledger.candidateId),
        getScreeningStatus(ledger.tenantId, ledger.candidateId),
      ]);
      const candidates: PublicApplicationStatus[] = [best];
      if (resumeState) {
        candidates.push(resumeState.parseStatus === "PARSED" || resumeState.hasParsedData ? "PARSED" : "SCANNED");
      }
      if (screeningState && (screeningState.status === "COMPLETED" || screeningState.result != null)) {
        candidates.push("SCREENED");
      }
      // Pick the furthest-along non-terminal stage by STAGE_ORDER.
      best = candidates.reduce((a, b) => ((STAGE_ORDER[b] ?? -1) > (STAGE_ORDER[a] ?? -1) ? b : a), best);
    }

    respondStatus(res, applicationId, best, true);
  } catch (err) { next(err); }
});

/** Shared honest status envelope. `found` distinguishes a real fast-path
 *  application from the RECEIVED fallback for an id with no fast-path ledger. */
function respondStatus(res: Response, applicationId: string, status: PublicApplicationStatus, found: boolean): void {
  res.json({ success: true, data: { applicationId, status, found } });
}

const DEFAULT_FIELDS = [
  { id: "firstName", type: "text", label: "First name", required: true, order: 0 },
  { id: "lastName", type: "text", label: "Last name", required: true, order: 1 },
  { id: "email", type: "email", label: "Email", required: true, order: 2 },
  { id: "phone", type: "phone", label: "Phone", required: false, order: 3 },
  { id: "linkedinUrl", type: "url", label: "LinkedIn URL", required: false, order: 4 },
  { id: "coverLetter", type: "textarea", label: "Cover letter", required: false, order: 5 },
  { id: "resume", type: "file", label: "Resume", required: true, fileTypes: [".pdf", ".doc", ".docx"], maxSizeMb: 10, order: 6 },
];

export default router;
