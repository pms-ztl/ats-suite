import { prisma } from '../utils/prisma';
import logger from './logger';

export interface BGCheckRequest {
  candidateId: string;
  tenantId: string;
  checkType: 'standard' | 'enhanced' | 'basic';
  candidateEmail: string;
  candidateName: string;
}

export interface BGCheckResult {
  checkId: string;
  status: 'initiated' | 'pending' | 'completed' | 'failed';
  provider: 'checkr' | 'stub';
  invitationUrl?: string;
  stubMode?: boolean;
}

/**
 * Initiate a background check.
 * Uses Checkr API when CHECKR_API_KEY is set. Falls back to stub.
 */
export async function initiateBackgroundCheck(request: BGCheckRequest): Promise<BGCheckResult> {
  const apiKey = process.env.CHECKR_API_KEY;
  const baseUrl = process.env.CHECKR_BASE_URL || 'https://api.checkr.com/v1';

  // Create DB record regardless of provider
  const checkId = `bgcheck-${Date.now()}`;

  if (!apiKey) {
    logger.info({ candidateId: request.candidateId }, 'Background check: stub mode (no Checkr API key)');
    await prisma.backgroundCheck.create({
      data: {
        id: checkId,
        tenantId: request.tenantId,
        candidateId: request.candidateId,
        checkType: request.checkType,
        vendor: 'stub',
        status: 'PENDING',
        initiatedAt: new Date(),
      },
    }).catch(err => logger.error({ err }, 'Failed to create BG check record'));

    return { checkId, status: 'initiated', provider: 'stub', stubMode: true };
  }

  // Real Checkr API
  try {
    // Step 1: Create candidate in Checkr
    const candidateRes = await fetch(`${baseUrl}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        first_name: request.candidateName.split(' ')[0],
        last_name: request.candidateName.split(' ').slice(1).join(' ') || request.candidateName,
        email: request.candidateEmail,
      }),
    });

    if (!candidateRes.ok) {
      const errBody = await candidateRes.text();
      logger.error({ status: candidateRes.status, body: errBody }, 'Checkr candidate creation failed');
      return { checkId, status: 'failed', provider: 'checkr' };
    }

    const checkrCandidate = await candidateRes.json() as { id: string };

    // Step 2: Create invitation (sends email to candidate to complete background check)
    const invitationRes = await fetch(`${baseUrl}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
      },
      body: JSON.stringify({
        candidate_id: checkrCandidate.id,
        package: request.checkType === 'enhanced' ? 'driver_pro' : request.checkType === 'basic' ? 'tasker_standard' : 'driver_standard',
      }),
    });

    const invitation = invitationRes.ok ? await invitationRes.json() as { id: string; invitation_url: string } : null;

    // Store in DB — use result JSON field to store the external Checkr candidate ID
    await prisma.backgroundCheck.create({
      data: {
        id: checkId,
        tenantId: request.tenantId,
        candidateId: request.candidateId,
        checkType: request.checkType,
        vendor: 'checkr',
        status: 'PENDING',
        result: { checkrCandidateId: checkrCandidate.id },
        initiatedAt: new Date(),
      },
    }).catch(err => logger.error({ err }, 'Failed to create BG check record'));

    logger.info({ checkId, checkrCandidateId: checkrCandidate.id }, 'Checkr background check initiated');

    return {
      checkId,
      status: 'initiated',
      provider: 'checkr',
      invitationUrl: invitation?.invitation_url,
    };
  } catch (err: any) {
    logger.error({ err }, 'Checkr API error');
    return { checkId, status: 'failed', provider: 'checkr' };
  }
}

/**
 * Check background check status.
 */
export async function checkBGStatus(checkId: string, tenantId: string): Promise<{
  status: string;
  result?: string;
  completedAt?: string;
  provider: string;
}> {
  const check = await prisma.backgroundCheck.findFirst({
    where: { id: checkId, tenantId },
  });

  if (!check) return { status: 'not_found', provider: 'unknown' };

  const vendor = check.vendor || 'stub';

  // If real Checkr and we have an external ID stored in result, poll Checkr for latest status
  const resultData = check.result as Record<string, any> | null;
  const checkrCandidateId = resultData?.checkrCandidateId;

  if (vendor === 'checkr' && checkrCandidateId && process.env.CHECKR_API_KEY) {
    try {
      const apiKey = process.env.CHECKR_API_KEY;
      const baseUrl = process.env.CHECKR_BASE_URL || 'https://api.checkr.com/v1';
      const res = await fetch(`${baseUrl}/candidates/${checkrCandidateId}`, {
        headers: { 'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}` },
      });
      if (res.ok) {
        const data = await res.json() as { adjudication?: string; status: string };
        return { status: data.status, result: data.adjudication, provider: 'checkr' };
      }
    } catch {
      // Fall through to DB status
    }
  }

  return {
    status: check.status || 'pending',
    completedAt: check.completedAt?.toISOString(),
    provider: vendor,
  };
}
