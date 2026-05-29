/**
 * Semantic skill matching — the fallback when alias matching misses.
 *
 * Alias matching only catches skills the taxonomy already knows a synonym for.
 * This embeds the unmatched raw skill and cosine-matches it against the
 * taxonomy's embeddings, so "k8s" → Kubernetes, "RoR" → Ruby on Rails, etc.
 * even when the alias list doesn't list that exact token.
 *
 * Graceful degradation: if no embeddings provider is configured (no
 * OPENAI_API_KEY / EMBEDDINGS_API_KEY), this is a no-op and the resume keeps
 * its alias-matched results — nothing breaks, you just don't get semantic hits.
 *
 * Taxonomy embeddings are computed once per process and cached.
 */
import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { SKILL_TAXONOMY } from "../taxonomies/skills.js";
import type { EnrichedResume, EnrichedSkill } from "./enrich.js";

const EMBED_MODEL = process.env["EMBEDDINGS_MODEL"] ?? "text-embedding-3-small";
const DEFAULT_THRESHOLD = Number(process.env["SEMANTIC_SKILL_THRESHOLD"]) || 0.6;

export function embeddingsAvailable(): boolean {
  return !!(process.env["EMBEDDINGS_API_KEY"] || process.env["OPENAI_API_KEY"]);
}

let _client: ReturnType<typeof createOpenAI> | null = null;
function client() {
  if (_client) return _client;
  _client = createOpenAI({ apiKey: process.env["EMBEDDINGS_API_KEY"] ?? process.env["OPENAI_API_KEY"] });
  return _client;
}

interface TaxoVec { id: string; label: string; category: string; vec: number[] }
let _taxoVecs: TaxoVec[] | null = null;
let _taxoVecsInit: Promise<TaxoVec[]> | null = null;

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]! * b[i]!; na += a[i]! * a[i]!; nb += b[i]! * b[i]!; }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

async function ensureTaxoVecs(): Promise<TaxoVec[]> {
  if (_taxoVecs) return _taxoVecs;
  if (_taxoVecsInit) return _taxoVecsInit;
  _taxoVecsInit = (async () => {
    const model = client().embedding(EMBED_MODEL);
    // Embed "label + aliases" so the vector captures the whole synonym cluster.
    const values = SKILL_TAXONOMY.map((s) => `${s.label}: ${s.aliases.join(", ")}`);
    const { embeddings } = await embedMany({ model, values });
    _taxoVecs = SKILL_TAXONOMY.map((s, i) => ({ id: s.id, label: s.label, category: s.category, vec: embeddings[i]! }));
    return _taxoVecs;
  })();
  return _taxoVecsInit;
}

/**
 * Fill canonicalId/label/category for skills that alias-matching left null,
 * using embedding cosine similarity. Mutates + returns the same array.
 * Returns the count of newly-matched skills.
 */
export async function semanticMatchSkills(
  enriched: EnrichedResume,
  threshold: number = DEFAULT_THRESHOLD,
): Promise<{ matched: number; attempted: number }> {
  if (!embeddingsAvailable()) return { matched: 0, attempted: 0 };
  const unmatched = enriched.skills.filter((s) => !s.canonicalId && s.raw.trim().length > 0);
  if (unmatched.length === 0) return { matched: 0, attempted: 0 };

  try {
    const taxo = await ensureTaxoVecs();
    const model = client().embedding(EMBED_MODEL);
    const { embeddings } = await embedMany({ model, values: unmatched.map((s) => s.raw) });

    let matched = 0;
    unmatched.forEach((skill: EnrichedSkill, i) => {
      const vec = embeddings[i]!;
      let best: TaxoVec | null = null;
      let bestSim = 0;
      for (const t of taxo) {
        const sim = cosine(vec, t.vec);
        if (sim > bestSim) { bestSim = sim; best = t; }
      }
      if (best && bestSim >= threshold) {
        skill.canonicalId = best.id;
        skill.label = best.label;
        skill.category = best.category;
        skill.matchVia = "semantic";
        // Semantic matches are softer than verbatim alias hits — nudge confidence
        // toward (not past) the model's, scaled by similarity.
        skill.evidenceConfidence = Math.round(Math.min(1, skill.evidenceConfidence + 0.05 * bestSim) * 100) / 100;
        matched++;
      }
    });
    return { matched, attempted: unmatched.length };
  } catch {
    // Embedding outage must never fail a parse — keep alias results.
    return { matched: 0, attempted: unmatched.length };
  }
}
