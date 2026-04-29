import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, created, paginated } from "../lib/response";
import { hashPassword } from "../lib/password";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

// GET /
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const tenants = await prisma.tenant.findMany({ where: { id: tenantId } });
    return ok(res, tenants);
  } catch (err) { return next(err); }
});

// GET /:id
router.get("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    if (req.params.id !== tenantId) throw new AppError("FORBIDDEN", "Access denied", 403);
    const tenant = await prisma.tenant.findUnique({ where: { id: req.params.id } });
    if (!tenant) throw new AppError("NOT_FOUND", "Tenant not found", 404);
    return ok(res, tenant);
  } catch (err) { return next(err); }
});

// POST /
const CreateTenantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  dataRegion: z.string().optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const body = CreateTenantSchema.parse(req.body);
    const existing = await prisma.tenant.findUnique({ where: { slug: body.slug } });
    if (existing) throw new AppError("CONFLICT", "Slug already in use", 409);
    const tenant = await prisma.tenant.create({
      data: { name: body.name, slug: body.slug, dataRegion: body.dataRegion ?? "us-east-1" },
    });
    return created(res, tenant);
  } catch (err) { return next(err); }
});

// PATCH /:id
const UpdateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  dataRegion: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  isolationConfig: z.record(z.string(), z.unknown()).optional(),
});

router.patch("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    if (req.params.id !== tenantId) throw new AppError("FORBIDDEN", "Access denied", 403);
    const body = UpdateTenantSchema.parse(req.body);
    const tenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: {
        ...body,
        settings: body.settings as any,
        isolationConfig: body.isolationConfig as any,
      },
    });
    return ok(res, tenant);
  } catch (err) { return next(err); }
});

// GET /:id/users
router.get("/:id/users", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    if (req.params.id !== tenantId) throw new AppError("FORBIDDEN", "Access denied", 403);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const where = { tenantId };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    return paginated(res, { data: users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

// POST /:id/users
const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER"]),
  password: z.string().min(8),
});

router.post("/:id/users", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    if (req.params.id !== tenantId) throw new AppError("FORBIDDEN", "Access denied", 403);
    const body = CreateUserSchema.parse(req.body);
    const existing = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: body.email } },
    });
    if (existing) throw new AppError("CONFLICT", "Email already in use in this tenant", 409);
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        tenantId,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role as any,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return created(res, user);
  } catch (err) { return next(err); }
});

export default router;
