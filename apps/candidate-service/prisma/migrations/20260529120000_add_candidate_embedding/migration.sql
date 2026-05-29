-- Phase 39 — real ML matching: candidate embeddings for vector similarity.
--
-- Stored as jsonb (a float array) so this runs on stock Postgres with no
-- extension. Cosine similarity is computed in the service. For ANN-at-scale,
-- swap this column to pgvector `vector(1536)` + an ivfflat index and change
-- matchCandidatesByVector() to use the `<=>` operator — a localized upgrade.
--
-- The column is managed via raw SQL; the Prisma schema is left unchanged.

ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "embedding" jsonb;
ALTER TABLE "Candidate" ADD COLUMN IF NOT EXISTS "embeddedAt" timestamptz;
