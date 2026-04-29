import { Router } from "express";
import { z } from "zod";
import { requireAuth, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, paginated, created, noContent } from "../lib/response";
import { sourceCandidates } from "../agents/sourcing-agent";

const router = Router();
router.use(requireAuth);

// ── Talent Pool CRUD ──────────────────────────────────────────────────────────

// GET / — list talent pools
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const includeInactive = req.query.includeInactive === "true";

    const where: any = {
      tenantId,
      ...(includeInactive ? {} : { isActive: true }),
    };

    const [data, total] = await Promise.all([
      prisma.talentPool.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { members: true } } },
      }),
      prisma.talentPool.count({ where }),
    ]);

    paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }
});

// POST /pools — create talent pool
const CreatePoolSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  criteria: z.record(z.string(), z.unknown()).optional(),
});

router.post("/pools", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreatePoolSchema.parse(req.body);
    const pool = await prisma.talentPool.create({
      data: {
        tenantId,
        name: body.name,
        description: body.description,
        criteria: body.criteria ?? {} as any
      },
    });
    created(res, pool);
  } catch (err) {
    next(err);
  }
});

// GET /pools/:id — get pool with members (candidate data enriched manually)
router.get("/pools/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const pool = await prisma.talentPool.findFirst({
      where: { id: req.params.id, tenantId },
      include: {
        members: {
          orderBy: { addedAt: "desc" },
        },
      },
    });
    if (!pool) throw new AppError("NOT_FOUND", "Talent pool not found", 404);

    // Enrich members with candidate data (no direct relation in schema)
    const candidateIds = pool.members.map((m: any) => m.candidateId);
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds }, tenantId },
      select: { id: true, firstName: true, lastName: true, email: true, source: true },
    });
    const candidateMap: Record<string, any> = Object.fromEntries(
      candidates.map((c: any) => [c.id, c]),
    );
    const enrichedMembers = pool.members.map((m: any) => ({
      ...m,
      candidate: candidateMap[m.candidateId] ?? null,
    }));

    ok(res, { ...pool, members: enrichedMembers });
  } catch (err) {
    next(err);
  }
});

// PATCH /pools/:id — update pool
const UpdatePoolSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  criteria: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

router.patch("/pools/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.talentPool.findFirst({
      where: { id: req.params.id, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Talent pool not found", 404);

    const body = UpdatePoolSchema.parse(req.body);

    // Recalculate memberCount when changing active state
    let memberCount: number | undefined;
    if (body.isActive !== undefined) {
      memberCount = await prisma.talentPoolMember.count({
        where: { poolId: req.params.id },
      });
    }

    const pool = await prisma.talentPool.update({
      where: { id: req.params.id },
      data: {
        ...body,
        ...(memberCount !== undefined ? { memberCount } : {}),
      } as any,
    });
    ok(res, pool);
  } catch (err) {
    next(err);
  }
});

// DELETE /pools/:id — soft delete (set isActive=false)
router.delete("/pools/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.talentPool.findFirst({
      where: { id: req.params.id, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Talent pool not found", 404);

    await prisma.talentPool.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    noContent(res);
  } catch (err) {
    next(err);
  }
});

// ── Search ────────────────────────────────────────────────────────────────────

const SearchSchema = z.object({
  query: z.string().min(1),
  booleanString: z.string().optional(),
  filters: z
    .object({
      location: z.string().optional(),
      source: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
});

// POST /search — search candidates + log the search
router.post("/search", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = SearchSchema.parse(req.body);
    const { query, booleanString, filters } = body;

    const where: any = {
      tenantId,
      isAnonymized: false,
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
      ],
    };

    if (filters?.location) {
      where.location = { contains: filters.location, mode: "insensitive" };
    }
    if (filters?.source) {
      where.source = filters.source;
    }
    if (filters?.tags?.length) {
      where.tags = { hasSome: filters.tags };
    }

    const candidates = await prisma.candidate.findMany({
      where,
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        location: true,
        source: true,
        tags: true,
        createdAt: true,
      },
    });

    // Log the search
    const user = (req as any).user as { id?: string } | undefined;
    const searchLog = await prisma.sourcingSearch.create({
      data: {
        tenantId,
        query,
        booleanString,
        filters: (filters ?? {}) as object,
        resultCount: candidates.length,
        createdBy: user?.id ?? null,
      },
    });

    ok(res, { data: candidates, total: candidates.length, searchId: searchLog.id });
  } catch (err) {
    next(err);
  }
});

// ── Saved (TalentPoolMember) ──────────────────────────────────────────────────

const SaveCandidateSchema = z.object({
  poolId: z.string().min(1),
  candidateId: z.string().min(1),
  source: z.string().optional(),
});

// POST /saved — add candidate to talent pool
router.post("/saved", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = SaveCandidateSchema.parse(req.body);

    const pool = await prisma.talentPool.findFirst({
      where: { id: body.poolId, tenantId },
    });
    if (!pool) throw new AppError("NOT_FOUND", "Talent pool not found", 404);

    const candidate = await prisma.candidate.findFirst({
      where: { id: body.candidateId, tenantId },
    });
    if (!candidate) throw new AppError("NOT_FOUND", "Candidate not found", 404);

    // Create member — handle duplicate via P2002
    let member;
    try {
      member = await prisma.talentPoolMember.create({
        data: {
          poolId: body.poolId,
          candidateId: body.candidateId,
          source: body.source,
        },
      });
      await prisma.talentPool.update({
        where: { id: body.poolId },
        data: { memberCount: { increment: 1 } },
      });
    } catch (e: any) {
      if (e?.code === "P2002") {
        throw new AppError("CONFLICT", "Candidate already in this pool", 409);
      }
      throw e;
    }

    created(res, member);
  } catch (err) {
    next(err);
  }
});

// GET /saved — list saved candidates (talent pool members)
router.get("/saved", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const poolId = req.query.poolId as string | undefined;

    // Resolve pools that belong to this tenant
    const poolWhere: any = { tenantId };
    if (poolId) poolWhere.id = poolId;
    const tenantPools = await prisma.talentPool.findMany({
      where: poolWhere,
      select: { id: true },
    });
    const poolIds = tenantPools.map((p: any) => p.id);

    const where: any = { poolId: { in: poolIds } };

    const [members, total] = await Promise.all([
      prisma.talentPoolMember.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { addedAt: "desc" },
        include: { pool: { select: { id: true, name: true } } },
      }),
      prisma.talentPoolMember.count({ where }),
    ]);

    // Enrich with candidate data (no direct relation in schema)
    const candidateIds = members.map((m: any) => m.candidateId);
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds }, tenantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        location: true,
        source: true,
      },
    });
    const candidateMap: Record<string, any> = Object.fromEntries(
      candidates.map((c: any) => [c.id, c]),
    );
    const enriched = members.map((m: any) => ({
      ...m,
      candidate: candidateMap[m.candidateId] ?? null,
    }));

    paginated(res, {
      data: enriched,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /saved/:id — remove candidate from talent pool
router.delete("/saved/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    const member = await prisma.talentPoolMember.findUnique({
      where: { id: req.params.id },
    });
    if (!member) throw new AppError("NOT_FOUND", "Member not found", 404);

    // Verify the pool belongs to this tenant
    const pool = await prisma.talentPool.findFirst({
      where: { id: member.poolId, tenantId },
    });
    if (!pool) throw new AppError("NOT_FOUND", "Member not found", 404);

    await prisma.talentPoolMember.delete({ where: { id: req.params.id } });

    // Decrement memberCount, floor at 0
    await prisma.talentPool.update({
      where: { id: member.poolId },
      data: { memberCount: Math.max(0, pool.memberCount - 1) },
    });

    noContent(res);
  } catch (err) {
    next(err);
  }
});

// ── AI-Powered Candidate Sourcing ────────────────────────────────────────────

const AiSearchSchema = z.object({
  requisitionId: z.string().min(1),
  maxResults: z.number().min(1).max(50).optional(),
});

// POST /ai-search — AI-powered candidate sourcing
router.post("/ai-search", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const user = (req as any).user as { id: string };
    const body = AiSearchSchema.parse(req.body);

    // Verify requisition exists and belongs to tenant
    const requisition = await prisma.requisition.findFirst({
      where: { id: body.requisitionId, tenantId },
    });
    if (!requisition) throw new AppError("NOT_FOUND", "Requisition not found", 404);

    const result = await sourceCandidates({
      requisitionId: body.requisitionId,
      tenantId,
      userId: user.id,
      maxResults: body.maxResults,
    });

    ok(res, {
      candidates: result.results.candidates,
      searchStrategiesUsed: result.results.searchStrategiesUsed,
      totalScanned: result.results.totalScanned,
      summary: result.results.summary,
      runId: result.runId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
