/** Search business logic + data access — pure of HTTP concerns, unit-testable. */
import { prisma } from "../lib/prisma.js";
import { rankDocs, type Doc, type RankedResult } from "../lib/search.js";
import { config } from "../config.js";
import type { IndexInput, RankInput } from "../schemas/search.schemas.js";

export type DocKind = "CANDIDATE" | "JOB";

async function loadDocs(tenantId: string, kind: DocKind): Promise<Doc[]> {
  const rows = await prisma.searchDocument.findMany({ where: { tenantId, kind }, take: config.scanLimit });
  return rows.map((r) => ({
    refId: r.refId,
    title: r.title,
    text: r.text,
    skills: (r.skills ?? []) as string[],
    embedding: (r.embedding ?? []) as number[],
    metadata: r.metadata,
  }));
}

export async function search(tenantId: string, kind: DocKind, query: string, limit: number): Promise<RankedResult[]> {
  return rankDocs(query, null, await loadDocs(tenantId, kind), limit);
}

export async function rankCandidates(tenantId: string, input: RankInput): Promise<RankedResult[]> {
  let query = input.query ?? "";
  if (input.requisitionId) {
    const job = await prisma.searchDocument.findFirst({ where: { tenantId, kind: "JOB", refId: input.requisitionId } });
    if (job) query = [job.title, job.text, ((job.skills ?? []) as string[]).join(" ")].filter(Boolean).join(" ");
  }
  return rankDocs(query, null, await loadDocs(tenantId, "CANDIDATE"), input.limit);
}

export async function indexDocument(tenantId: string, input: IndexInput): Promise<{ id: string }> {
  const doc = await prisma.searchDocument.upsert({
    where: { tenantId_kind_refId: { tenantId, kind: input.kind, refId: input.refId } },
    create: {
      tenantId, kind: input.kind, refId: input.refId, title: input.title, text: input.text,
      skills: input.skills, embedding: input.embedding, metadata: input.metadata as any,
    },
    update: {
      title: input.title, text: input.text, skills: input.skills, embedding: input.embedding, metadata: input.metadata as any,
    },
  });
  return { id: doc.id };
}
