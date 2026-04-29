import { prisma } from '../utils/prisma';
import logger from '../lib/logger';

export interface CreateCheckpointParams {
  tenantId: string;
  agentRunId: string;
  type: 'approval' | 'review' | 'override' | 'rejection_review';
  action: string;
  payload: Record<string, unknown>;
  assignedTo?: string;
  slaMinutes?: number;
}

export interface ResolveCheckpointParams {
  checkpointId: string;
  resolvedBy: string;
  status: 'APPROVED' | 'REJECTED';
  resolution?: Record<string, unknown>;
}

/**
 * Create a HITL checkpoint — pauses agent execution until human resolves.
 */
export async function createHITLCheckpoint(params: CreateCheckpointParams): Promise<string> {
  const checkpoint = await prisma.hITLCheckpoint.create({
    data: {
      tenantId: params.tenantId,
      agentRunId: params.agentRunId,
      type: params.type,
      action: params.action,
      payload: params.payload as any,
      assignedTo: params.assignedTo || null,
      slaMinutes: params.slaMinutes || 240, // 4 hours default
      status: 'PENDING',
    },
  });

  // Update AgentRun status to HITL_PENDING
  await prisma.agentRun.update({
    where: { id: params.agentRunId },
    data: { status: 'HITL_PENDING', hitlStatus: 'PENDING' },
  }).catch(err => logger.error({ err }, 'Failed to update AgentRun HITL status'));

  logger.info({
    checkpointId: checkpoint.id,
    agentRunId: params.agentRunId,
    type: params.type,
    action: params.action,
  }, 'HITL checkpoint created');

  return checkpoint.id;
}

/**
 * Resolve a HITL checkpoint — human approves or rejects.
 */
export async function resolveHITLCheckpoint(params: ResolveCheckpointParams): Promise<void> {
  const checkpoint = await prisma.hITLCheckpoint.findUnique({
    where: { id: params.checkpointId },
  });

  if (!checkpoint) throw new Error('Checkpoint not found');
  if (checkpoint.status !== 'PENDING') throw new Error(`Checkpoint already resolved: ${checkpoint.status}`);

  await prisma.hITLCheckpoint.update({
    where: { id: params.checkpointId },
    data: {
      status: params.status,
      resolvedBy: params.resolvedBy,
      resolution: params.resolution ? (params.resolution as any) : undefined,
      resolvedAt: new Date(),
    },
  });

  // Update AgentRun status
  await prisma.agentRun.update({
    where: { id: checkpoint.agentRunId },
    data: {
      status: 'HITL_RESOLVED',
      hitlStatus: params.status,
    },
  }).catch(err => logger.error({ err }, 'Failed to update AgentRun after HITL resolution'));

  logger.info({
    checkpointId: params.checkpointId,
    status: params.status,
    resolvedBy: params.resolvedBy,
  }, 'HITL checkpoint resolved');
}

/**
 * Get pending HITL checkpoints for a user or tenant.
 */
export async function getPendingCheckpoints(
  tenantId: string,
  assignedTo?: string,
) {
  return prisma.hITLCheckpoint.findMany({
    where: {
      tenantId,
      status: 'PENDING',
      ...(assignedTo ? { assignedTo } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Check for SLA breaches and escalate.
 */
export async function checkSLABreaches(tenantId: string): Promise<number> {
  const now = new Date();
  const breached = await prisma.hITLCheckpoint.findMany({
    where: {
      tenantId,
      status: 'PENDING',
      escalatedAt: null,
    },
  });

  let escalatedCount = 0;
  for (const cp of breached) {
    const createdAt = new Date(cp.createdAt);
    const slaMs = (cp.slaMinutes || 240) * 60 * 1000;
    if (now.getTime() - createdAt.getTime() > slaMs) {
      await prisma.hITLCheckpoint.update({
        where: { id: cp.id },
        data: { escalatedAt: now },
      });
      escalatedCount++;
      logger.warn({ checkpointId: cp.id, agentRunId: cp.agentRunId }, 'HITL SLA breached — escalating');
    }
  }

  return escalatedCount;
}
