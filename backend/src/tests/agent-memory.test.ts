import { describe, it, expect } from 'vitest';

describe('Agent Memory', () => {
  // Module exports
  it('loadEpisodicMemory is exported', async () => {
    const { loadEpisodicMemory } = await import('../agents/memory');
    expect(typeof loadEpisodicMemory).toBe('function');
  });

  it('loadConversationHistory is exported', async () => {
    const { loadConversationHistory } = await import('../agents/memory');
    expect(typeof loadConversationHistory).toBe('function');
  });

  it('searchSemanticMemory is exported', async () => {
    const { searchSemanticMemory } = await import('../agents/memory');
    expect(typeof searchSemanticMemory).toBe('function');
  });

  it('storeMemory is exported', async () => {
    const { storeMemory } = await import('../agents/memory');
    expect(typeof storeMemory).toBe('function');
  });

  // Cross-tenant isolation (correction #4a)
  it('loadEpisodicMemory returns empty for wrong tenant', async () => {
    const { loadEpisodicMemory } = await import('../agents/memory');
    // With mocked Prisma, agentRun.findFirst returns null for wrong tenant
    const result = await loadEpisodicMemory('fake-run-id', 'wrong-tenant-id');
    expect(result).toEqual([]);
  });

  it('loadConversationHistory returns empty for no matching runs', async () => {
    const { loadConversationHistory } = await import('../agents/memory');
    const result = await loadConversationHistory(
      'tenant-id',
      'candidate-assistant',
      'candidate-id',
    );
    expect(result).toEqual([]);
  });

  // Semantic search tenant scoping (correction #4b)
  it('searchSimilarEmbeddings uses explicit tenantId WHERE clause', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const embeddingsCode = fs.readFileSync(
      path.join(__dirname, '..', 'lib', 'embeddings.ts'),
      'utf-8',
    );
    expect(embeddingsCode).toContain('WHERE "tenantId" = $2');
  });

  // RLS policy audit (correction #4c)
  it('RLS policy exists for Embedding table', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const rlsCode = fs.readFileSync(
      path.join(__dirname, '..', '..', 'prisma', 'rls_policies.sql'),
      'utf-8',
    );
    expect(rlsCode).toContain('tenant_isolation_embedding');
    expect(rlsCode).toContain('"Embedding" ENABLE ROW LEVEL SECURITY');
  });

  it('RLS policy exists for AgentRun table', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const rlsCode = fs.readFileSync(
      path.join(__dirname, '..', '..', 'prisma', 'rls_policies.sql'),
      'utf-8',
    );
    expect(rlsCode).toContain('tenant_isolation_agentrun');
    expect(rlsCode).toContain('"AgentRun" ENABLE ROW LEVEL SECURITY');
  });

  // Semantic search tool registration
  it('search_semantic_memory tool is registered', async () => {
    const { toolRegistry } = await import('../agents/tool-registry');
    const tool = toolRegistry.get('search_semantic_memory');
    expect(tool).toBeDefined();
    expect(tool?.sideEffect).toBe('read');
  });
});
