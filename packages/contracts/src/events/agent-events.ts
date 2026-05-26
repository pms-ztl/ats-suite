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
  triggeredByUserId: z.string().uuid().nullable(),
});
export type AgentRunCompletedPayload = z.infer<typeof AgentRunCompletedPayloadSchema>;
