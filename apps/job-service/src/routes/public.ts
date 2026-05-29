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
import multer from "multer";
import { z } from "zod";
import { ok, Errors } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { callCandidateService, forwardResumeUpload } from "../lib/service-client.js";

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

    // 2. Create application in candidate-service
    const application = await callCandidateService<{ id: string }>({
      method: "POST",
      path: "/internal/applications",
      tenantId: posting.tenantId,
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
// Multipart apply for the candidate portal's custom form: arbitrary fields +
// a resume file. Creates Candidate + Application (tenant resolved from slug)
// AND forwards the resume to resume-service for parsing. No auth (public).
const STD_FIELDS = new Set(["firstName", "lastName", "email", "phone", "linkedinUrl", "coverLetter"]);
router.post("/jobs/:slug/apply-custom", applyUpload.any(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params["slug"] as string;
    const posting = await prisma.jobPosting.findFirst({
      where: { slug, isPublished: true },
      select: { id: true, requisitionId: true, tenantId: true },
    });
    if (!posting) throw Errors.notFound("Job posting");

    const fields = (req.body ?? {}) as Record<string, unknown>;
    const str = (k: string) => (typeof fields[k] === "string" ? (fields[k] as string).trim() : undefined);
    const email = str("email");
    const firstName = str("firstName") ?? "Applicant";
    const lastName = str("lastName") ?? "";
    if (!email) {
      return res.status(400).json({ success: false, error: { code: "EMAIL_REQUIRED", message: "Email is required" } });
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
      body: { candidateId: candidate.id, requisitionId: posting.requisitionId, notes: str("coverLetter") ?? null, formResponses },
    });

    // Forward the resume (field "resume", else the first file) for parsing.
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
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
  } catch (err) { next(err); }
});

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
