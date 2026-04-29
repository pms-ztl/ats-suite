import { prisma } from '../utils/prisma';
import { deleteEmbeddings } from './embeddings';
import logger from './logger';

export interface GDPRAccessResult {
  candidate: Record<string, unknown>;
  applications: Record<string, unknown>[];
  interviews: Record<string, unknown>[];
  notes: Record<string, unknown>[];
  resume: Record<string, unknown> | null;
  agentRuns: Record<string, unknown>[];
  consentRecords: Record<string, unknown>[];
  exportedAt: string;
}

/**
 * GDPR Article 15: Right of Access
 * Export all personal data for a candidate.
 */
export async function gdprAccess(candidateId: string, tenantId: string): Promise<GDPRAccessResult> {
  const [candidate, applications, interviews, notes, resume, agentRuns, consentRecords] = await Promise.all([
    prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        location: true, country: true, source: true, summary: true,
        linkedinUrl: true, portfolioUrl: true, tags: true,
        createdAt: true, updatedAt: true,
      },
    }),
    prisma.application.findMany({
      where: { candidateId, tenantId },
      select: {
        id: true, requisitionId: true, stage: true, status: true,
        appliedAt: true, stageUpdatedAt: true, notes: true,
      },
    }),
    prisma.interview.findMany({
      where: { tenantId, candidateId },
      select: {
        id: true, type: true, status: true, scheduledAt: true,
        location: true, duration: true,
      },
    }),
    prisma.candidateNote.findMany({
      where: { candidateId, tenantId },
      select: { id: true, content: true, authorId: true, createdAt: true },
    }),
    prisma.resume.findFirst({
      where: { candidateId, tenantId },
      select: {
        id: true, originalFilename: true, mimeType: true, fileSize: true,
        parseStatus: true, createdAt: true,
      },
    }),
    prisma.agentRun.findMany({
      where: { tenantId, inputJson: { path: ['candidateId'], equals: candidateId } },
      select: {
        id: true, agentType: true, status: true, createdAt: true, completedAt: true,
      },
    }).catch(() => []),
    prisma.consentRecord.findMany({
      where: { candidateId, tenantId },
      select: { id: true, purpose: true, grantedAt: true, revokedAt: true },
    }).catch(() => []),
  ]);

  if (!candidate) throw new Error('Candidate not found');

  return {
    candidate: candidate as Record<string, unknown>,
    applications: applications as Record<string, unknown>[],
    interviews: interviews as Record<string, unknown>[],
    notes: notes as Record<string, unknown>[],
    resume: resume as Record<string, unknown> | null,
    agentRuns: agentRuns as Record<string, unknown>[],
    consentRecords: consentRecords as Record<string, unknown>[],
    exportedAt: new Date().toISOString(),
  };
}

/**
 * GDPR Article 17: Right to Erasure
 * Delete all personal data for a candidate, including vector embeddings.
 */
export async function gdprErase(candidateId: string, tenantId: string, requestedBy: string): Promise<{
  deletedRecords: Record<string, number>;
  embeddingsDeleted: number;
}> {
  logger.warn({ candidateId, tenantId, requestedBy }, 'GDPR erasure initiated');

  const deletedRecords: Record<string, number> = {};

  // 1. Delete vector embeddings FIRST (hardest to recover)
  let embeddingsDeleted = 0;
  try {
    embeddingsDeleted = await deleteEmbeddings(candidateId, tenantId);
    deletedRecords.embeddings = embeddingsDeleted;
  } catch (err) {
    logger.error({ err, candidateId }, 'Failed to delete embeddings during erasure');
  }

  // 2. Delete related records (order matters for FK constraints)
  try {
    const noteCount = await prisma.candidateNote.deleteMany({ where: { candidateId, tenantId } });
    deletedRecords.notes = noteCount.count;
  } catch (err) { logger.error({ err }, 'Failed to delete notes'); }

  try {
    // Delete interviews linked to candidate's applications
    const apps = await prisma.application.findMany({ where: { candidateId, tenantId }, select: { id: true } });
    const appIds = apps.map(a => a.id);
    if (appIds.length > 0) {
      const interviewCount = await prisma.interview.deleteMany({ where: { applicationId: { in: appIds }, tenantId } });
      deletedRecords.interviews = interviewCount.count;
    }
  } catch (err) { logger.error({ err }, 'Failed to delete interviews'); }

  try {
    const appCount = await prisma.application.deleteMany({ where: { candidateId, tenantId } });
    deletedRecords.applications = appCount.count;
  } catch (err) { logger.error({ err }, 'Failed to delete applications'); }

  try {
    const candidateAppCount = await prisma.candidateApplication.deleteMany({ where: { candidateId } });
    deletedRecords.candidateApplications = candidateAppCount.count;
  } catch (err) { logger.error({ err }, 'Failed to delete candidateApplications'); }

  try {
    const resumeCount = await prisma.resume.deleteMany({ where: { candidateId, tenantId } });
    deletedRecords.resumes = resumeCount.count;
  } catch (err) { logger.error({ err }, 'Failed to delete resume'); }

  // 3. Anonymize the candidate record (don't hard-delete -- keep for audit trail)
  try {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        firstName: '[ERASED]',
        lastName: '[ERASED]',
        email: `erased-${candidateId}@erased.invalid`,
        phone: null,
        location: null,
        country: null,
        summary: null,
        resumeUrl: null,
        linkedinUrl: null,
        portfolioUrl: null,
        tags: [],
        isAnonymized: true,
      },
    });
    deletedRecords.candidateAnonymized = 1;
  } catch (err) { logger.error({ err }, 'Failed to anonymize candidate'); }

  // 4. Create audit trail entry for the erasure
  await prisma.auditTrailEntry.create({
    data: {
      tenantId,
      action: 'GDPR_ERASURE',
      resourceType: 'Candidate',
      resourceId: candidateId,
      actorId: requestedBy,
      actorType: 'USER',
      metadata: { deletedRecords, embeddingsDeleted },
    },
  }).catch(err => logger.error({ err }, 'Failed to create erasure audit trail'));

  // 5. If there's an ErasureRequest record, mark it complete
  await prisma.erasureRequest.updateMany({
    where: { candidateId, tenantId, status: 'PENDING' },
    data: { status: 'COMPLETED', completedAt: new Date() },
  }).catch(() => {});

  logger.info({ candidateId, deletedRecords, embeddingsDeleted }, 'GDPR erasure completed');

  return { deletedRecords, embeddingsDeleted };
}

/**
 * GDPR Article 16: Right to Rectification
 * Update candidate personal data.
 */
export async function gdprRectify(candidateId: string, tenantId: string, updates: Record<string, unknown>): Promise<void> {
  // Only allow updating PII fields
  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'country', 'linkedinUrl', 'portfolioUrl'];
  const filteredUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = value;
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }

  await prisma.candidate.update({
    where: { id: candidateId },
    data: filteredUpdates as any,
  });

  await prisma.auditTrailEntry.create({
    data: {
      tenantId,
      action: 'GDPR_RECTIFICATION',
      resourceType: 'Candidate',
      resourceId: candidateId,
      actorId: null,
      actorType: 'USER',
      metadata: { updatedFields: Object.keys(filteredUpdates) },
    },
  }).catch(() => {});
}

/**
 * GDPR Article 20: Right to Data Portability
 * Export candidate data as JSON (same as access but downloadable format).
 */
export async function gdprPortability(candidateId: string, tenantId: string): Promise<string> {
  const data = await gdprAccess(candidateId, tenantId);
  return JSON.stringify(data, null, 2);
}
