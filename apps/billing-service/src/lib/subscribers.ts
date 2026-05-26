/**
 * NATS event subscribers for billing-service.
 *
 *   tenant.{*}.tenant.plan-changed  → update TenantPlanCache + auto-disable
 *                                     agents that the new plan no longer allows
 *   platform.tenant.created         → seed TenantPlanCache with new tenant
 *   tenant.{*}.agent.completed      → upsert AgentRunCost (cost projection)
 */
import { subscribeToEvents } from "@cdc-ats/nats-client";
import { TenantCreatedPayloadSchema, TenantPlanChangedPayloadSchema, AgentRunCompletedPayloadSchema } from "@cdc-ats/contracts";
import { prisma } from "./prisma.js";
import { PLAN_LIMITS, ALL_AGENT_TYPES, isPlanAgentEnabled } from "./plan-limits.js";
import type { Logger } from "pino";

export async function startBillingSubscribers(logger: Logger) {
  // ── platform.tenant.created → seed cache ──────────────────────────────
  await subscribeToEvents({
    stream: "TENANT_EVENTS",
    subject: "platform.tenant.created",
    durable: "billing-service:tenant-created",
    logger,
    handler: async (envelope) => {
      const payload = TenantCreatedPayloadSchema.parse(envelope.payload);
      await prisma.tenantPlanCache.upsert({
        where: { tenantId: payload.tenantId },
        create: { tenantId: payload.tenantId, plan: payload.plan },
        update: { plan: payload.plan },
      });
      logger.info({ tenantId: payload.tenantId, plan: payload.plan }, "Tenant plan cached on signup");
    },
  });

  // ── tenant.{*}.tenant.plan-changed → sync cache + auto-disable agents ─
  await subscribeToEvents({
    stream: "TENANT_EVENTS",
    subject: "tenant.*.tenant.plan-changed",
    durable: "billing-service:plan-changed",
    logger,
    handler: async (envelope) => {
      const payload = TenantPlanChangedPayloadSchema.parse(envelope.payload);
      await prisma.tenantPlanCache.upsert({
        where: { tenantId: payload.tenantId },
        create: { tenantId: payload.tenantId, plan: payload.toPlan },
        update: { plan: payload.toPlan },
      });

      // Auto-disable any agents the new plan doesn't include
      const newlyIneligible = ALL_AGENT_TYPES.filter((a) => !isPlanAgentEnabled(payload.toPlan, a));
      if (newlyIneligible.length > 0) {
        for (const agentType of newlyIneligible) {
          await prisma.agentKillSwitch.upsert({
            where: { tenantId_agentType: { tenantId: payload.tenantId, agentType } },
            create: { tenantId: payload.tenantId, agentType, disabled: true, reason: `Auto-disabled on plan change ${payload.fromPlan} → ${payload.toPlan}` },
            update: { disabled: true, reason: `Auto-disabled on plan change ${payload.fromPlan} → ${payload.toPlan}` },
          });
        }
        logger.info({
          tenantId: payload.tenantId, fromPlan: payload.fromPlan, toPlan: payload.toPlan,
          disabledAgents: newlyIneligible,
        }, "Plan downgrade: auto-disabled ineligible agents");
      } else {
        logger.info({
          tenantId: payload.tenantId, fromPlan: payload.fromPlan, toPlan: payload.toPlan,
        }, "Plan changed — no agents need disabling");
      }
    },
  });

  // ── tenant.{*}.agent.completed → cost projection upsert ───────────────
  await subscribeToEvents({
    stream: "AGENT_EVENTS",
    subject: "tenant.*.agent.completed",
    durable: "billing-service:agent-completed",
    logger,
    handler: async (envelope) => {
      const payload = AgentRunCompletedPayloadSchema.parse(envelope.payload);
      await prisma.agentRunCost.upsert({
        where: { agentRunId: payload.agentRunId },
        create: {
          tenantId: payload.tenantId,
          agentRunId: payload.agentRunId,
          agentType: payload.agentType,
          status: payload.status,
          tokensIn: payload.tokensIn,
          tokensOut: payload.tokensOut,
          costUsd: payload.costUsd,
          latencyMs: payload.latencyMs,
          triggeredByUserId: payload.triggeredByUserId,
        },
        update: {
          status: payload.status,
          tokensIn: payload.tokensIn,
          tokensOut: payload.tokensOut,
          costUsd: payload.costUsd,
          latencyMs: payload.latencyMs,
        },
      });
    },
  });

  logger.info("Billing-service NATS subscribers started (3 subjects)");
}
