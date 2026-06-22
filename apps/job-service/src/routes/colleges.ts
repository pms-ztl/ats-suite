/**
 * Module A — College / CDC partner routes (authenticated, recruiter/admin).
 * Mounted at /internal/colleges (gateway: /api/colleges). A partner yields a
 * public share link (/cdc/<shareToken>) the CDC distributes to candidates; every
 * application made through it is stamped with the college name.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole } from "@cdc-ats/common";
import { CreateCollegePartnerSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";

const router = Router();
const requireCdcEditor = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120) || "college";
}

// GET /internal/colleges — list the tenant's CDC partners.
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    getTenantId(req); // ensure tenant context (RLS-scoped client)
    const rows = await prisma.collegePartner.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    ok(res, rows);
  } catch (err) { next(err); }
});

// POST /internal/colleges — create a CDC partner + mint its share token.
router.post("/", requireCdcEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateCollegePartnerSchema.parse(req.body);
    // Unique slug within the tenant (append a short suffix on collision).
    let slug = slugify(body.name);
    const exists = await prisma.collegePartner.findFirst({ where: { tenantId, slug }, select: { id: true } });
    if (exists) slug = `${slug}-${randomBytes(2).toString("hex")}`;
    const shareToken = randomBytes(18).toString("base64url");
    const row = await prisma.collegePartner.create({
      data: {
        tenantId,
        name: body.name,
        slug,
        shareToken,
        contactEmail: body.contactEmail ?? null,
        requisitionIds: body.requisitionIds ?? [],
      },
    });
    created(res, row);
  } catch (err) { next(err); }
});

const UpdateCollegeSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contactEmail: z.string().email().nullable().optional(),
  requisitionIds: z.array(z.string().uuid()).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /internal/colleges/:id — edit a partner.
router.patch("/:id", requireCdcEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    getTenantId(req);
    const id = req.params["id"] as string;
    const body = UpdateCollegeSchema.parse(req.body);
    const existing = await prisma.collegePartner.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw Errors.notFound("College partner");
    const row = await prisma.collegePartner.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.contactEmail !== undefined ? { contactEmail: body.contactEmail } : {}),
        ...(body.requisitionIds !== undefined ? { requisitionIds: body.requisitionIds } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
    });
    ok(res, row);
  } catch (err) { next(err); }
});

// DELETE /internal/colleges/:id — remove a partner (revokes its link).
router.delete("/:id", requireCdcEditor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    getTenantId(req);
    const id = req.params["id"] as string;
    await prisma.collegePartner.delete({ where: { id } }).catch(() => { throw Errors.notFound("College partner"); });
    ok(res, { id });
  } catch (err) { next(err); }
});

export default router;
