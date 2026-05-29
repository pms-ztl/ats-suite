/**
 * Real ML candidate↔job matching — embeddings + cosine similarity.
 *
 * This replaces "single LLM call" matching with genuine vector retrieval:
 *   1. Each candidate's parsed profile is embedded on ingest (jsonb column).
 *   2. To find candidates for a job, we embed the JOB text live and rank all
 *      candidate vectors by cosine similarity (same technique class as the
 *      talent-intelligence incumbents; corpus size is the only difference).
 *
 * Cosine is computed in-process (portable, no extension). For ANN-at-scale,
 * swap the jsonb column for pgvector + `<=>` — only matchCandidates() changes.
 *
 * Degrades gracefully: with no embeddings key, embedText() returns null and
 * callers fall back to keyword search.
 */
import { embedText } from "@cdc-ats/ai-engine";
import type { Logger } from "pino";
import { prisma } from "./prisma.js";

/** A compact, signal-dense text representation of a candidate for embedding. */
export function buildCandidateProfileText(c: {
  firstName?: string | null; lastName?: string | null; summary?: string | null;
  tags?: string[]; parsedSummary?: any;
}): string {
  const p = c.parsedSummary ?? {};
  const skills = Array.isArray(p.skills)
    ? p.skills.map((s: any) => (typeof s === "string" ? s : s.label ?? s.raw)).filter(Boolean)
    : (c.tags ?? []);
  const exp = Array.isArray(p.experience)
    ? p.experience.map((e: any) => `${e.raw?.title ?? e.title ?? ""} ${e.companyLabel ?? e.raw?.company ?? ""}`.trim()).filter(Boolean)
    : [];
  const parts = [
    p.headline ?? "",
    c.summary ?? p.summary ?? "",
    skills.length ? `Skills: ${skills.slice(0, 40).join(", ")}` : "",
    exp.length ? `Experience: ${exp.slice(0, 12).join("; ")}` : "",
    typeof p.totalYearsExperience === "number" ? `${p.totalYearsExperience} years total experience` : "",
  ];
  return parts.filter(Boolean).join("\n").trim();
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i]! * b[i]!; na += a[i]! * a[i]!; nb += b[i]! * b[i]!; }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/** Embed one candidate and persist the vector. No-op without an embeddings key. */
export async function embedCandidate(candidateId: string, tenantId: string, logger?: Logger): Promise<boolean> {
  const c = await prisma.candidate.findFirst({ where: { id: candidateId, tenantId } });
  if (!c) return false;
  const text = buildCandidateProfileText(c as any);
  if (!text) return false;
  const vec = await embedText(text);
  if (!vec) return false;
  try {
    await prisma.$executeRaw`UPDATE "Candidate" SET "embedding" = ${JSON.stringify(vec)}::jsonb, "embeddedAt" = now() WHERE "id" = ${candidateId} AND "tenantId" = ${tenantId}`;
    return true;
  } catch (err) {
    logger?.warn({ err, candidateId }, "embedCandidate persist failed");
    return false;
  }
}

export interface VectorMatch {
  id: string; name: string; score: number; skills: string[];
}

/**
 * Rank this tenant's embedded candidates by cosine similarity to a query text
 * (typically a job description / requirements). Returns top `limit`.
 */
export async function matchCandidates(opts: {
  tenantId: string; queryText: string; limit?: number; logger?: Logger;
}): Promise<{ available: boolean; matches: VectorMatch[]; scanned: number }> {
  const qvec = await embedText(opts.queryText);
  if (!qvec) return { available: false, matches: [], scanned: 0 };

  const rows = await prisma.$queryRaw<Array<{ id: string; firstName: string; lastName: string; tags: string[]; embedding: number[] }>>`
    SELECT "id", "firstName", "lastName", "tags", "embedding"
    FROM "Candidate"
    WHERE "tenantId" = ${opts.tenantId} AND "embedding" IS NOT NULL
    LIMIT 5000
  `;
  const scored = rows
    .map((r) => {
      const vec = Array.isArray(r.embedding) ? r.embedding : [];
      return {
        id: r.id,
        name: `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim(),
        skills: (r.tags ?? []).slice(0, 12),
        score: Number(cosine(qvec, vec).toFixed(4)),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit ?? 25);

  return { available: true, matches: scored, scanned: rows.length };
}
