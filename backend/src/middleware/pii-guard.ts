import { redactPII, RedactionResult } from '../agents/pii-redactor';
import logger from '../lib/logger';
import { prisma } from '../utils/prisma';

interface PIIAuditEntry {
  tenantId: string;
  agentRunId: string;
  agentType: string;
  piiDetected: boolean;
  redactionCount: number;
  redactionTypes: string[];
}

/**
 * Audit PII handling for an agent run.
 * Call AFTER PII redaction to verify and log what was redacted.
 */
export async function auditPIIRedaction(
  entry: PIIAuditEntry
): Promise<void> {
  await prisma.auditTrailEntry.create({
    data: {
      tenantId: entry.tenantId,
      action: 'PII_REDACTION_AUDIT',
      resourceType: 'AgentRun',
      resourceId: entry.agentRunId,
      actorId: null,
      actorType: 'SYSTEM',
      metadata: {
        agentType: entry.agentType,
        piiDetected: entry.piiDetected,
        redactionCount: entry.redactionCount,
        redactionTypes: entry.redactionTypes,
      },
    },
  }).catch(err => logger.error({ err }, 'PII audit log failed'));
}

/**
 * Enforce PII redaction on text before sending to LLM.
 * Returns redacted text and logs the redaction event.
 */
export function enforcePIIRedaction(
  text: string,
  context: { tenantId: string; agentRunId: string; agentType: string },
  options?: { keepEmail?: boolean }
): { text: string; redactions: RedactionResult['redactions'] } {
  const result = redactPII(text, options);

  if (result.redactions.length > 0) {
    logger.warn({
      agentRunId: context.agentRunId,
      agentType: context.agentType,
      redactionCount: result.redactions.length,
      types: [...new Set(result.redactions.map(r => r.type))],
    }, 'PII detected and redacted before LLM call');

    // Fire-and-forget audit
    auditPIIRedaction({
      tenantId: context.tenantId,
      agentRunId: context.agentRunId,
      agentType: context.agentType,
      piiDetected: true,
      redactionCount: result.redactions.length,
      redactionTypes: [...new Set(result.redactions.map(r => r.type))],
    }).catch(() => {});
  }

  return result;
}
