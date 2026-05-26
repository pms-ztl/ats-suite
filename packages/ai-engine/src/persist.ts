/**
 * Shared persistRun helper — publishes agent.completed to NATS so
 * billing-service aggregates cost across services. Each service can
 * additionally write its own AgentRun row by composing this helper.
 *
 * Usage in a service route:
 *   import { publishAgentCompleted } from "@cdc-ats/ai-engine";
 *   await runAgent({
 *     agentType: "...",
 *     input,
 *     context: { tenantId, userId, persistRun: publishAgentCompleted(logger) },
 *   });
 */
import type { Logger } from "pino";
import type { AgentRunSnapshot } from "./runtime.js";

/**
 * Returns a persistRun callback that publishes tenant.{id}.agent.completed
 * via NATS. Lazy-imports nats-client so ai-engine doesn't directly depend
 * on it (services that already have nats-client provide it transitively).
 *
 * If NATS is not connected the publish silently fails — billing aggregation
 * is best-effort, the agent run itself already succeeded.
 */
export function publishAgentCompleted(logger?: Logger) {
  return async (snapshot: AgentRunSnapshot): Promise<void> => {
    try {
      const { publishEvent } = await import("@cdc-ats/nats-client");
      const { tenantSubject } = await import("@cdc-ats/contracts");
      await publishEvent({
        subject: tenantSubject(snapshot.tenantId, "agent", "completed"),
        type: "agent.completed",
        tenantId: snapshot.tenantId,
        payload: {
          tenantId: snapshot.tenantId,
          agentRunId: snapshot.agentRunId,
          agentType: snapshot.agentType,
          status: snapshot.status,
          tokensIn: snapshot.tokensIn,
          tokensOut: snapshot.tokensOut,
          costUsd: snapshot.costUsd,
          latencyMs: snapshot.latencyMs,
          triggeredByUserId: snapshot.userId,
        },
      });
    } catch (err) {
      logger?.warn(
        { err, agentRunId: snapshot.agentRunId, agentType: snapshot.agentType },
        "publishAgentCompleted failed (cost will not aggregate in billing)",
      );
    }
  };
}
