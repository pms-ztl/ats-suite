import crypto from 'crypto';
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { prisma } from '../utils/prisma';
import logger from './logger';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const MAX_CHUNK_LENGTH = 8000; // ~2000 tokens

/**
 * Generate an embedding vector for text using OpenAI's embedding model.
 * Returns null if OpenAI is not configured.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OpenAI API key not configured — embedding generation skipped');
    return null;
  }

  try {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: text.slice(0, MAX_CHUNK_LENGTH),
    });
    return embedding;
  } catch (err) {
    logger.error({ err }, 'Embedding generation failed');
    return null;
  }
}

/**
 * Store an embedding in the database via raw SQL (pgvector).
 * Prisma doesn't natively support the vector type, so we use raw queries.
 */
export async function storeEmbedding(params: {
  tenantId: string;
  entityType: string;
  entityId: string;
  chunkIndex: number;
  chunkText: string;
  embedding: number[];
}): Promise<string> {
  const id = crypto.randomUUID();
  const vectorStr = `[${params.embedding.join(',')}]`;

  await prisma.$executeRawUnsafe(
    `INSERT INTO "Embedding" (id, "tenantId", "entityType", "entityId", "chunkIndex", "chunkText", embedding, "modelName", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8, NOW())`,
    id,
    params.tenantId,
    params.entityType,
    params.entityId,
    params.chunkIndex,
    params.chunkText,
    vectorStr,
    EMBEDDING_MODEL,
  );

  return id;
}

/**
 * Search for similar embeddings using cosine similarity.
 */
export async function searchSimilarEmbeddings(params: {
  tenantId: string;
  entityType: string;
  queryEmbedding: number[];
  topK: number;
}): Promise<Array<{ entityId: string; chunkText: string; similarity: number }>> {
  const vectorStr = `[${params.queryEmbedding.join(',')}]`;

  const results = await prisma.$queryRawUnsafe<
    Array<{ entityId: string; chunkText: string; similarity: number }>
  >(
    `SELECT "entityId", "chunkText",
            1 - (embedding <=> $1::vector) as similarity
     FROM "Embedding"
     WHERE "tenantId" = $2 AND "entityType" = $3
     ORDER BY embedding <=> $1::vector
     LIMIT $4`,
    vectorStr,
    params.tenantId,
    params.entityType,
    params.topK,
  );

  return results;
}

/**
 * Delete all embeddings for an entity (GDPR compliance).
 */
export async function deleteEmbeddings(entityId: string, tenantId: string): Promise<number> {
  const result = await prisma.$executeRawUnsafe(
    `DELETE FROM "Embedding" WHERE "entityId" = $1 AND "tenantId" = $2`,
    entityId,
    tenantId,
  );
  return result;
}
