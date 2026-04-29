import { prisma } from '../utils/prisma';
import crypto from 'crypto';

/**
 * Get the active prompt for an agent type.
 * Falls back to the system default if no tenant-specific prompt exists.
 */
export async function getActivePrompt(agentType: string, tenantId?: string): Promise<{
  content: string;
  version: number;
  hash: string;
} | null> {
  // Try tenant-specific first
  if (tenantId) {
    const tenantPrompt = await prisma.promptVersion.findFirst({
      where: { agentType, tenantId, isActive: true },
      orderBy: { version: 'desc' },
    });
    if (tenantPrompt) {
      return { content: tenantPrompt.content, version: tenantPrompt.version, hash: tenantPrompt.hash };
    }
  }

  // Fall back to system prompt (tenantId is null)
  const systemPrompt = await prisma.promptVersion.findFirst({
    where: { agentType, tenantId: null, isActive: true },
    orderBy: { version: 'desc' },
  });

  if (systemPrompt) {
    return { content: systemPrompt.content, version: systemPrompt.version, hash: systemPrompt.hash };
  }

  return null;
}

/**
 * Create a new prompt version.
 */
export async function createPromptVersion(params: {
  agentType: string;
  content: string;
  modelTarget: string;
  tenantId?: string;
  createdBy?: string;
}): Promise<{ version: number; hash: string }> {
  const hash = crypto.createHash('sha256').update(params.content).digest('hex').slice(0, 32);

  // Get next version number for this agentType (global, since @@unique is [agentType, version])
  const latest = await prisma.promptVersion.findFirst({
    where: { agentType: params.agentType },
    orderBy: { version: 'desc' },
  });
  const nextVersion = (latest?.version || 0) + 1;

  // Deactivate current active prompt for this agent + tenant scope
  await prisma.promptVersion.updateMany({
    where: { agentType: params.agentType, tenantId: params.tenantId || null, isActive: true },
    data: { isActive: false },
  });

  // Create new active version
  await prisma.promptVersion.create({
    data: {
      agentType: params.agentType,
      version: nextVersion,
      hash,
      content: params.content,
      modelTarget: params.modelTarget,
      tenantId: params.tenantId || null,
      isActive: true,
      createdBy: params.createdBy || null,
    },
  });

  return { version: nextVersion, hash };
}

/**
 * List all prompt versions for an agent type.
 */
export async function listPromptVersions(agentType: string, tenantId?: string) {
  return prisma.promptVersion.findMany({
    where: { agentType, tenantId: tenantId || null },
    orderBy: { version: 'desc' },
    take: 50,
  });
}
