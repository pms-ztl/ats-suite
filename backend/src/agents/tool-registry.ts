import { z } from 'zod';
import type { AgentTool } from './runtime';
import { searchSemanticMemory } from './memory';

class ToolRegistry {
  private tools: Map<string, AgentTool> = new Map();

  register(tool: AgentTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  getAll(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  getForAgent(toolNames: string[]): AgentTool[] {
    return toolNames.map((name) => {
      const tool = this.tools.get(name);
      if (!tool) throw new Error(`Tool not found in registry: ${name}`);
      return tool;
    });
  }

  /**
   * Get tool descriptions formatted for LLM system prompt.
   */
  describeTools(toolNames: string[]): string {
    return this.getForAgent(toolNames)
      .map((t) => `- ${t.name}: ${t.description} [${t.sideEffect}]`)
      .join('\n');
  }

  /**
   * Clear all registered tools. Useful for testing.
   */
  clear(): void {
    this.tools.clear();
  }
}

export const toolRegistry = new ToolRegistry();

// ── Pre-registered Tools ──────────────────────────────────────────────

toolRegistry.register({
  name: 'search_semantic_memory',
  description:
    'Search for similar content in the tenant knowledge base (resumes, JDs, past decisions)',
  parameters: z.object({
    query: z.string().min(1).describe('Natural language search query'),
    entityType: z
      .string()
      .optional()
      .describe('Filter by type: candidate_resume, requisition_jd'),
    topK: z.number().min(1).max(50).default(10),
  }),
  returns: z.object({
    results: z.array(
      z.object({
        entityId: z.string(),
        entityType: z.string(),
        snippet: z.string(),
        similarity: z.number(),
      }),
    ),
  }),
  sideEffect: 'read',
  rateLimit: { maxPerMinute: 20, maxPerRun: 5 },
  costTag: 'low',
  requiredScope: ['embeddings:read'],
  execute: async (params: any, ctx) => {
    const results = await searchSemanticMemory(
      ctx.tenantId,
      params.query,
      params.entityType,
      params.topK,
    );
    return { results };
  },
});
