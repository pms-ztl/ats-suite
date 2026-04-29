import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, created, paginated } from "../lib/response";

const router = Router();
router.use(requireAuth);

// GET /ontology
router.get("/ontology", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 50);
    const skip = (page - 1) * pageSize;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {
      isActive: true,
      ...(category ? { category } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: "asc" },
        include: { _count: { select: { children: true } } },
      }),
      prisma.skill.count({ where }),
    ]);

    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

// GET /ontology/:id
router.get("/ontology/:id", async (req, res, next) => {
  try {
    const skill = await prisma.skill.findUnique({
      where: { id: req.params.id },
      include: { children: { select: { id: true, name: true, level: true } } },
    });
    if (!skill) throw new AppError("NOT_FOUND", "Skill not found", 404);
    return ok(res, skill);
  } catch (err) { return next(err); }
});

// POST /ontology (ADMIN only)
const CreateSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  parentId: z.string().optional(),
});

router.post("/ontology", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const body = CreateSkillSchema.parse(req.body);
    const existing = await prisma.skill.findUnique({ where: { name: body.name } });
    if (existing) throw new AppError("CONFLICT", "Skill already exists", 409);
    const skill = await prisma.skill.create({
      data: {
        name: body.name,
        category: body.category,
        aliases: body.aliases ?? [],
        parentId: body.parentId,
      },
    });
    return created(res, skill);
  } catch (err) { return next(err); }
});

// GET /suggestions
router.get("/suggestions", async (req, res, next) => {
  try {
    const q = req.query.q as string;
    if (!q || q.trim().length === 0) throw new AppError("VALIDATION_ERROR", "Query param 'q' is required", 400);
    const skills = await prisma.skill.findMany({
      where: { isActive: true, name: { contains: q.trim(), mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: 10,
      select: { id: true, name: true, category: true, level: true },
    });
    return ok(res, skills);
  } catch (err) { return next(err); }
});

// POST /extract
const ExtractSchema = z.object({ text: z.string().min(1) });

router.post("/extract", async (req, res, next) => {
  try {
    const { text } = ExtractSchema.parse(req.body);
    const allSkills = await prisma.skill.findMany({
      where: { isActive: true },
      select: { id: true, name: true, category: true },
    });
    const lower = text.toLowerCase();
    const matched = allSkills.filter((s: { id: string; name: string; category: string | null }) =>
      lower.includes(s.name.toLowerCase())
    );
    return ok(res, { extractedSkills: matched, count: matched.length });
  } catch (err) { return next(err); }
});

export default router;
