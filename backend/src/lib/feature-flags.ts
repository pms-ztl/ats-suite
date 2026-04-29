import { prisma } from '../utils/prisma';
import logger from './logger';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
}

// Default flags — new features start disabled
export const DEFAULT_FLAGS: Record<string, boolean> = {
  'agent.resume-parser': true,
  'agent.screening': true,
  'agent.jd-author': true,
  'agent.scheduling': true,
  'agent.candidate-chat': true,
  'agent.sourcing': false,        // v2 agents start disabled
  'agent.interview-kit': false,
  'agent.interview-intelligence': false,
  'agent.offer': false,
  'agent.copilot': false,
  'agent.analytics': false,
  'agent.bias-auditor': false,
  'public-api': true,
  'esign-integration': false,
  'background-check': false,
  'auto-pipeline': true,          // BullMQ auto upload→parse→screen
};

/**
 * Check if a feature is enabled for a tenant.
 * Checks tenant-specific config first, falls back to global defaults.
 */
export async function isFeatureEnabled(tenantId: string, featureName: string): Promise<boolean> {
  try {
    // Check tenant-specific override
    const config = await prisma.integrationConfig.findFirst({
      where: { tenantId, provider: 'FEATURE_FLAGS' } as any,
    });

    if (config?.config) {
      const flags = (config.config as any).flags || {};
      if (featureName in flags) return flags[featureName];
    }
  } catch {}

  // Fall back to global default
  return DEFAULT_FLAGS[featureName] ?? false;
}

/**
 * Set a feature flag for a tenant.
 */
export async function setFeatureFlag(tenantId: string, featureName: string, enabled: boolean): Promise<void> {
  const existing = await prisma.integrationConfig.findFirst({
    where: { tenantId, provider: 'FEATURE_FLAGS' } as any,
  });

  const currentFlags = existing?.config ? ((existing.config as any).flags || {}) : {};
  const newFlags = { ...currentFlags, [featureName]: enabled };

  if (existing) {
    await prisma.integrationConfig.update({
      where: { id: existing.id },
      data: { config: { flags: newFlags } },
    });
  } else {
    await prisma.integrationConfig.create({
      data: {
        tenantId,
        provider: 'FEATURE_FLAGS',
        integrationType: 'INTERNAL',
        status: 'ACTIVE',
        config: { flags: newFlags },
      } as any,
    });
  }

  logger.info({ tenantId, featureName, enabled }, 'Feature flag updated');
}

/**
 * Get all feature flags for a tenant (with defaults).
 */
export async function getAllFeatureFlags(tenantId: string): Promise<FeatureFlag[]> {
  let overrides: Record<string, boolean> = {};
  try {
    const config = await prisma.integrationConfig.findFirst({
      where: { tenantId, provider: 'FEATURE_FLAGS' } as any,
    });
    if (config?.config) overrides = (config.config as any).flags || {};
  } catch {}

  return Object.entries(DEFAULT_FLAGS).map(([name, defaultEnabled]) => ({
    name,
    enabled: name in overrides ? overrides[name] : defaultEnabled,
    description: name.startsWith('agent.') ? `AI Agent: ${name.split('.')[1]}` : name,
  }));
}
