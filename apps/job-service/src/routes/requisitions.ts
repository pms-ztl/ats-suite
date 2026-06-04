/**
 * Requisition + JobPosting + ApplicationFormSchema routes (authenticated).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: requisitions are admin/recruiter/hiring-manager managed.
const requireReqEditor = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
import { RequisitionStatusSchema, FormFieldSchema } from "@cdc-ats/contracts";
import { prisma, prismaAdmin } from "../lib/prisma.js";

const router = Router();

// Phase 3 — admin-defined custom screening fields (label + value), passed to
// the AI screener as additional criteria so screening is tuned to this job.
const CustomFieldSchema = z.object({
  label: z.string().min(1).max(120),
  value: z.string().max(2000).default(""),
  importance: z.enum(["must", "nice", "info"]).optional(),
});

const CreateReqSchema = z.object({
  title: z.string().min(1).max(200),
  department: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  country: z.string().default("US"),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  customFields: z.array(CustomFieldSchema).max(30).optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().default("USD"),
  status: RequisitionStatusSchema.optional(),
  headcount: z.number().int().min(1).default(1),
});

// Phase 5 — pay-transparency publish gate (advisory, non-blocking). Many US
// jurisdictions require a posted salary range for public OPEN roles.
function complianceWarnings(r: { status?: string | null; salaryMin?: number | null; salaryMax?: number | null }): string[] {
  const w: string[] = [];
  if (r.status === "OPEN" && (r.salaryMin == null || r.salaryMax == null)) {
    w.push("Pay transparency: add a salary range (min & max) before posting publicly — required in CA, CO, CT, IL, MD, MN, NV, NY, WA and more.");
  }
  return w;
}

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const status = req.query["status"] as string | undefined;
    // Phase 23 — tier-3 staff filtering.
    //   ?hiringManagerId=me  → only requisitions where the caller is HM
    //   ?recruiterId=me      → only requisitions where the caller is recruiter
    // Both resolve "me" to the X-User-Id header forwarded by the gateway.
    const hmRaw = req.query["hiringManagerId"] as string | undefined;
    const recRaw = req.query["recruiterId"] as string | undefined;
    const callerId = req.headers["x-user-id"] as string | undefined;
    const hiringManagerId = hmRaw === "me" ? callerId : hmRaw;
    const recruiterId = recRaw === "me" ? callerId : recRaw;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (hiringManagerId) where.hiringManagerId = hiringManagerId;
    if (recruiterId) where.recruiterId = recruiterId;
    const requisitions = await prisma.requisition.findMany({
      where, orderBy: { createdAt: "desc" }, take: 100,
    });
    ok(res, requisitions);
  } catch (err) { next(err); }
});

/**
 * Lightweight tenant overview — counts requisitions by status.
 * Used by gateway's /api/platform/unified-overview aggregator.
 */
router.get("/overview", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const grouped = await prisma.requisition.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { _all: true },
    });
    const byStatus: Record<string, number> = {};
    for (const row of grouped) byStatus[row.status] = row._count._all;
    const openRequisitions =
      (byStatus["OPEN"] ?? 0) +
      (byStatus["INTERVIEWING"] ?? 0) +
      (byStatus["DRAFT"] ?? 0);
    const totalRequisitions = grouped.reduce((s, r) => s + r._count._all, 0);
    ok(res, { openRequisitions, totalRequisitions, byStatus });
  } catch (err) { next(err); }
});

// GET /internal/requisitions/platform-stats — SUPER_ADMIN cross-tenant counts.
// Returns { total, byTenant } for the super-admin dashboard. Declared before
// /:id so the literal path isn't captured as a requisition id.
router.get("/platform-stats", requireRole("SUPER_ADMIN"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const grouped = await prismaAdmin.requisition.groupBy({ by: ["tenantId"], _count: { _all: true } });
    const byTenant: Record<string, number> = {};
    let total = 0;
    for (const r of grouped) {
      byTenant[r.tenantId] = r._count._all;
      total += r._count._all;
    }
    ok(res, { total, byTenant });
  } catch (err) { next(err); }
});

router.post("/", requireReqEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateReqSchema.parse(req.body);
    const requisition = await prisma.requisition.create({
      data: {
        tenantId, ...body,
        requirements: (body.requirements ?? []) as any,
        customFields: (body.customFields ?? []) as any,
      },
    });
    created(res, { ...requisition, complianceWarnings: complianceWarnings(requisition as any) });
  } catch (err) { next(err); }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const r = await prisma.requisition.findFirst({
      where: { id, tenantId },
      include: { jobPostings: true, formSchema: true },
    });
    if (!r) throw Errors.notFound("Requisition");
    ok(res, r);
  } catch (err) { next(err); }
});

// Phase 27 F-027-micro-f + F-028-micro-P1: gate + scope mutation by tenantId.
router.patch("/:id", requireReqEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = CreateReqSchema.partial().parse(req.body);
    const existing = await prisma.requisition.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Requisition");
    const data: any = { ...body };
    if (body.requirements) data.requirements = body.requirements;
    if (body.customFields) data.customFields = body.customFields;
    const { count } = await prisma.requisition.updateMany({ where: { id, tenantId }, data });
    if (count === 0) throw Errors.notFound("Requisition");
    const updated = await prisma.requisition.findUnique({ where: { id } });
    ok(res, { ...updated, complianceWarnings: complianceWarnings(updated as any) });
  } catch (err) { next(err); }
});

// ── Form schema sub-resource ─────────────────────────────────────────
const SaveFormSchema = z.object({
  name: z.string().min(1).max(80).default("Default"),
  fields: z.array(FormFieldSchema).max(100),
});

router.get("/:id/form", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const req2 = await prisma.requisition.findFirst({ where: { id, tenantId } });
    if (!req2) throw Errors.notFound("Requisition");
    const schema = await prisma.applicationFormSchema.findUnique({ where: { requisitionId: id } });
    ok(res, {
      requisitionId: id,
      name: schema?.name ?? "Default (no custom form)",
      fields: schema?.fields ?? DEFAULT_FIELDS,
      isDefault: !schema,
    });
  } catch (err) { next(err); }
});

router.put("/:id/form", requireReqEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = SaveFormSchema.parse(req.body);
    const r = await prisma.requisition.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!r) throw Errors.notFound("Requisition");
    const saved = await prisma.applicationFormSchema.upsert({
      where: { requisitionId: id },
      create: { tenantId, requisitionId: id, name: body.name, fields: body.fields as any },
      update: { name: body.name, fields: body.fields as any },
    });
    ok(res, saved);
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
