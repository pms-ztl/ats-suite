/**
 * Ranking utilities for the search index.
 *  - cosine(): semantic similarity over stored embeddings (when present).
 *  - textScore(): term-overlap baseline so search is useful with no embeddings.
 * rankDocs() blends the two: embeddings dominate when available, else pure text.
 */
const STOP = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "has", "have",
  "this", "that", "from", "will", "a", "an", "of", "to", "in", "on", "or",
]);

export function terms(s: string): string[] {
  return Array.from(
    new Set(
      (s || "")
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP.has(w)),
    ),
  );
}

export function cosine(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

export interface Doc {
  refId: string;
  title: string;
  text: string;
  skills: string[];
  embedding: number[];
  metadata: unknown;
}

export function textScore(queryTerms: string[], doc: Doc): number {
  if (!queryTerms.length) return 0;
  const hay = new Set<string>([
    ...terms(doc.title),
    ...terms(doc.text),
    ...doc.skills.flatMap((s) => terms(s)),
  ]);
  let hits = 0;
  for (const t of queryTerms) if (hay.has(t)) hits++;
  return hits / queryTerms.length;
}

export interface RankedResult {
  refId: string;
  title: string;
  score: number;
  matchedBy: "semantic+text" | "text";
  metadata: unknown;
}

export function rankDocs(
  query: string,
  queryEmbedding: number[] | null,
  docs: Doc[],
  limit = 20,
): RankedResult[] {
  const qt = terms(query);
  return docs
    .map((d): RankedResult => {
      const ts = textScore(qt, d);
      const es = queryEmbedding && d.embedding?.length ? cosine(queryEmbedding, d.embedding) : 0;
      const score = es > 0 ? 0.6 * es + 0.4 * ts : ts;
      return {
        refId: d.refId,
        title: d.title,
        score: Number(score.toFixed(4)),
        matchedBy: es > 0 ? "semantic+text" : "text",
        metadata: d.metadata,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
