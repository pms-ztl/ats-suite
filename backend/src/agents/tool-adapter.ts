import { tool, type Tool } from 'ai';
import type { AgentTool, AgentContext } from './runtime';

/**
 * Convert an AgentTool to an AI SDK Tool for use with generateText().
 * The AI SDK tool wraps our execute function so the model can call it autonomously.
 *
 * AI SDK v6 `tool()` helper accepts Zod schemas via `parameters` at runtime,
 * even though the type signature expects `inputSchema`. We use a type assertion
 * to bridge this gap.
 */
export function toAISDKTool(agentTool: AgentTool, ctx: AgentContext): Tool<any, any> {
  return tool({
    description: agentTool.description,
    parameters: agentTool.parameters,
    execute: async (params: any) => {
      const result = await agentTool.execute(params, ctx);
      return result;
    },
  } as any);
}

/**
 * Convert a list of AgentTools to a record of AI SDK tools.
 * The record key is the tool name, which the model uses to invoke it.
 */
export function toAISDKTools(
  agentTools: AgentTool[],
  ctx: AgentContext,
): Record<string, Tool<any, any>> {
  const tools: Record<string, Tool<any, any>> = {};
  for (const t of agentTools) {
    tools[t.name] = toAISDKTool(t, ctx);
  }
  return tools;
}
