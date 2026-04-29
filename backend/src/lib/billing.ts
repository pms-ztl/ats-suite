import { prisma } from '../utils/prisma';
import logger from './logger';

interface TenantCostSummary {
  tenantId: string;
  period: string;
  totalRuns: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
  byAgent: Array<{
    agentType: string;
    runs: number;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
  }>;
  dailyCeiling: number;
  ceilingUtilization: number;
  isOverBudget: boolean;
}

const DEFAULT_DAILY_CEILING_USD = 50;

/**
 * Get the daily cost ceiling for a tenant.
 * Configurable per tenant via IntegrationConfig or defaults to $50.
 */
export async function getDailyCeiling(tenantId: string): Promise<number> {
  try {
    const config = await prisma.integrationConfig.findFirst({
      where: { tenantId, provider: 'BILLING', status: 'ACTIVE' },
    });
    if (config?.config && typeof (config.config as any).dailyCeilingUsd === 'number') {
      return (config.config as any).dailyCeilingUsd;
    }
  } catch {}
  return DEFAULT_DAILY_CEILING_USD;
}

/**
 * Check if a tenant has budget remaining for an agent run.
 * Returns { allowed: true } or { allowed: false, reason: string }.
 */
export async function checkTenantBudget(tenantId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCostUsd: number;
  ceilingUsd: number;
}> {
  const ceiling = await getDailyCeiling(tenantId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.agentRun.aggregate({
    where: {
      tenantId,
      createdAt: { gte: today },
    },
    _sum: { costUsd: true },
  });

  const currentCost = Number(result._sum.costUsd || 0);

  if (currentCost >= ceiling) {
    logger.warn({ tenantId, currentCost, ceiling }, 'Tenant daily cost ceiling reached');
    return {
      allowed: false,
      reason: `Daily cost ceiling of $${ceiling} reached. Current: $${currentCost.toFixed(2)}. Agent runs are paused until tomorrow.`,
      currentCostUsd: currentCost,
      ceilingUsd: ceiling,
    };
  }

  return { allowed: true, currentCostUsd: currentCost, ceilingUsd: ceiling };
}

/**
 * Get per-tenant per-agent cost summary for a time period.
 */
export async function getTenantCostSummary(tenantId: string, days: number = 1): Promise<TenantCostSummary> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const runs = await prisma.agentRun.findMany({
    where: { tenantId, createdAt: { gte: since } },
    select: {
      agentType: true,
      tokensIn: true,
      tokensOut: true,
      costUsd: true,
      status: true,
    },
  });

  const byAgent: Record<string, { runs: number; tokensIn: number; tokensOut: number; costUsd: number }> = {};

  for (const run of runs) {
    const key = run.agentType;
    if (!byAgent[key]) byAgent[key] = { runs: 0, tokensIn: 0, tokensOut: 0, costUsd: 0 };
    byAgent[key].runs++;
    byAgent[key].tokensIn += run.tokensIn;
    byAgent[key].tokensOut += run.tokensOut;
    byAgent[key].costUsd += Number(run.costUsd);
  }

  const totalCost = runs.reduce((s, r) => s + Number(r.costUsd), 0);
  const ceiling = await getDailyCeiling(tenantId);

  return {
    tenantId,
    period: `${days}d`,
    totalRuns: runs.length,
    totalTokensIn: runs.reduce((s, r) => s + r.tokensIn, 0),
    totalTokensOut: runs.reduce((s, r) => s + r.tokensOut, 0),
    totalCostUsd: totalCost,
    byAgent: Object.entries(byAgent).map(([agentType, data]) => ({ agentType, ...data })),
    dailyCeiling: ceiling,
    ceilingUtilization: ceiling > 0 ? (totalCost / ceiling) * 100 : 0,
    isOverBudget: totalCost >= ceiling,
  };
}

/**
 * Check if a specific agent type is disabled (kill switch).
 */
export async function isAgentEnabled(tenantId: string, agentType: string): Promise<boolean> {
  try {
    const config = await prisma.integrationConfig.findFirst({
      where: { tenantId, provider: 'AGENT_KILL_SWITCH' },
    });
    if (config?.config) {
      const disabled = (config.config as any).disabledAgents || [];
      return !disabled.includes(agentType);
    }
  } catch {}
  return true; // Default: enabled
}

/**
 * Enable/disable an agent type for a tenant (kill switch).
 */
export async function setAgentEnabled(tenantId: string, agentType: string, enabled: boolean): Promise<void> {
  const existing = await prisma.integrationConfig.findFirst({
    where: { tenantId, provider: 'AGENT_KILL_SWITCH' },
  });

  const currentDisabled: string[] = existing?.config
    ? (existing.config as any).disabledAgents || []
    : [];

  const newDisabled = enabled
    ? currentDisabled.filter((a: string) => a !== agentType)
    : [...new Set([...currentDisabled, agentType])];

  if (existing) {
    await prisma.integrationConfig.update({
      where: { id: existing.id },
      data: { config: { disabledAgents: newDisabled } },
    });
  } else {
    await prisma.integrationConfig.create({
      data: {
        tenantId,
        provider: 'AGENT_KILL_SWITCH',
        config: { disabledAgents: newDisabled },
        integrationType: 'INTERNAL',
        status: 'ACTIVE',
      },
    });
  }

  logger.info({ tenantId, agentType, enabled }, 'Agent kill switch toggled');
}
