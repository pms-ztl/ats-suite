import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, getTenantId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { rankDocs, type Doc } from "../lib/search.js";

const router = Router();

const SearchBody = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(100).default(20),
});

async function loadDocs(tenantId: string, kind: "CANDIDATE" | "JOB"): Promise<Doc[]> {
  const rows = await prisma.searchDocument.findMany({ where: { tenantId, kind }, take: 5000 });
  return rows.map((r) => ({
    refId: r.refId,
    title: r.title,
    text: r.text,
    skills: (r.skills ?? []) as string[],
    embedding: (r.embedding ?? []) as number[],
    metadata: r.metadata,
  }));
}

// POST /internal/search/candidates  { query, limit? }
router.post("/candidates", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { query, limit } = SearchBody.parse(req.body);
    const results = rankDocs(query, null, await loadDocs(tenantId, "CANDIDATE"), limit);
    ok(res, { query, kind: "candidate", count: results.length, results });
  } catch (err) { next(err); }
});

// POST /internal/search/jobs  { query, limit? }
router.post("/jobs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { query, limit } = SearchBody.parse(req.body);
    const results = rankDocs(query, null, await loadDocs(tenantId, "JOB"), limit);
    ok(res, { query, kind: "job", count: results.length, results });
  } catch (err) { next(err); }
});

// POST /internal/search/match/rank  { requisitionId? | query?, limit? }
// Ranks indexed candidates against a job (by the requisition's indexed text) or
// an explicit free-text query.
const RankBody = z
  .object({
    requisitionId: z.string().optional(),
    query: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(20),
  })
  .refine((b) => Boolean(b.requisitionId || b.query), { message: "requisitionId or query is required" });

router.post("/match/rank", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = RankBody.parse(req.body);
    let query = body.query ?? "";
    if (body.requisitionId) {
      const job = await prisma.searchDocument.findFirst({
        where: { tenantId, kind: "JOB", refId: body.requisitionId },
      });
      if (job) query = [job.title, job.text, ((job.skills ?? []) as string[]).join(" ")].filter(Boolean).join(" ");
    }
    const results = rankDocs(query, null, await loadDocs(tenantId, "CANDIDATE"), body.limit);
    ok(res, { requisitionId: body.requisitionId ?? null, count: results.length, results });
  } catch (err) { next(err); }
});

// POST /internal/search/index  — upsert a searchable document (used by the
// indexing subscribers and any reindex job).
const IndexBody = z.object({
  kind: z.enum(["CANDIDATE", "JOB"]),
  refId: z.string().min(1),
  title: z.string().default(""),
  text: z.string().default(""),
  skills: z.array(z.string()).default([]),
  embedding: z.array(z.number()).default([]),
  metadata: z.record(z.any()).default({}),
});

router.post("/index", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const b = IndexBody.parse(req.body);
    const doc = await prisma.searchDocument.upsert({
      where: { tenantId_kind_refId: { tenantId, kind: b.kind, refId: b.refId } },
      create: { tenantId, kind: b.kind, refId: b.refId, title: b.title, text: b.text, skills: b.skills, embedding: b.embedding, metadata: b.metadata as any },
      update: { title: b.title, text: b.text, skills: b.skills, embedding: b.embedding, metadata: b.metadata as any },
    });
    ok(res, { indexed: true, id: doc.id });
  } catch (err) { next(err); }
});

export default router;
