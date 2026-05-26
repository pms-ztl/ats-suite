import { z } from "zod";

export const AgentRunCompletedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  agentRunId: z.string().uuid(),
  agentType: z.string(),
  status: z.enum(["COMPLETED", "FAILED", "BUDGET_EXCEEDED", "HITL_PENDING"]),
  tokensIn: z.number().int(),
  tokensOut: z.number().int(),
  costUsd: z.number(),
  latencyMs: z.number().int(),
  // Nullable + lax string: accepts UUIDs from user-triggered runs AND
  // sentinel values like "system" / "public" for event-driven runs that
  // weren't initiated by an authenticated user.
  triggeredByUserId: z.string().nullable(),
});
export type AgentRunCompletedPayload = z.infer<typeof AgentRunCompletedPayloadSchema>;
