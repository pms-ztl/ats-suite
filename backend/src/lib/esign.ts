import logger from './logger';

export interface ESignRequest {
  recipientEmail: string;
  recipientName: string;
  documentTitle: string;
  documentContent: string;
  callbackUrl: string;
  tenantId?: string;
}

export interface ESignResult {
  envelopeId: string;
  status: 'sent' | 'created' | 'error';
  signUrl: string | null;
  provider: 'docusign' | 'stub';
  stubMode?: boolean;
}

/**
 * Send a document for e-signature.
 * Uses DocuSign REST API when DOCUSIGN_INTEGRATION_KEY + DOCUSIGN_USER_ID + DOCUSIGN_ACCOUNT_ID are set.
 * Falls back to stub mode otherwise.
 */
export async function sendForESign(request: ESignRequest): Promise<ESignResult> {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const userId = process.env.DOCUSIGN_USER_ID;
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const baseUrl = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi';

  if (!integrationKey || !userId || !accountId) {
    logger.info({ recipient: request.recipientEmail }, 'E-sign: stub mode (no DocuSign credentials)');
    return {
      envelopeId: `esign-stub-${Date.now()}`,
      status: 'created',
      signUrl: null,
      provider: 'stub',
      stubMode: true,
    };
  }

  // Real DocuSign implementation via REST API (no SDK dependency needed)
  try {
    // Step 1: Create envelope with the document
    const envelopeBody = {
      emailSubject: request.documentTitle,
      documents: [{
        documentBase64: Buffer.from(request.documentContent).toString('base64'),
        name: request.documentTitle,
        fileExtension: 'html',
        documentId: '1',
      }],
      recipients: {
        signers: [{
          email: request.recipientEmail,
          name: request.recipientName,
          recipientId: '1',
          routingOrder: '1',
          tabs: {
            signHereTabs: [{
              anchorString: '/sn1/',
              anchorUnits: 'pixels',
              anchorXOffset: '20',
              anchorYOffset: '10',
            }],
          },
        }],
      },
      status: 'sent',
    };

    const response = await fetch(`${baseUrl}/v2.1/accounts/${accountId}/envelopes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${integrationKey}`, // JWT or OAuth token
        'X-DocuSign-Authentication': JSON.stringify({
          Username: process.env.DOCUSIGN_EMAIL || '',
          Password: '',
          IntegratorKey: integrationKey,
        }),
      },
      body: JSON.stringify(envelopeBody),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error({ status: response.status, body: errBody }, 'DocuSign API error');
      return { envelopeId: '', status: 'error', signUrl: null, provider: 'docusign' };
    }

    const data = await response.json() as { envelopeId: string; uri: string; status: string };
    logger.info({ envelopeId: data.envelopeId, recipient: request.recipientEmail }, 'DocuSign envelope sent');

    return {
      envelopeId: data.envelopeId,
      status: 'sent',
      signUrl: null, // Signer gets email from DocuSign
      provider: 'docusign',
    };
  } catch (err: any) {
    logger.error({ err, recipient: request.recipientEmail }, 'DocuSign send failed');
    return { envelopeId: '', status: 'error', signUrl: null, provider: 'docusign' };
  }
}

/**
 * Check e-signature envelope status.
 */
export async function checkESignStatus(envelopeId: string): Promise<{
  status: 'pending' | 'signed' | 'declined' | 'expired' | 'unknown';
  signedAt?: string;
}> {
  if (envelopeId.startsWith('esign-stub-')) {
    return { status: 'pending' };
  }

  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const baseUrl = process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi';

  if (!accountId || !integrationKey) return { status: 'unknown' };

  try {
    const response = await fetch(`${baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}`, {
      headers: { 'Authorization': `Bearer ${integrationKey}` },
    });
    if (!response.ok) return { status: 'unknown' };
    const data = await response.json() as { status: string; completedDateTime?: string };

    const statusMap: Record<string, 'pending' | 'signed' | 'declined' | 'expired'> = {
      sent: 'pending', delivered: 'pending', completed: 'signed', declined: 'declined', voided: 'expired',
    };
    return {
      status: statusMap[data.status] || 'pending',
      signedAt: data.completedDateTime,
    };
  } catch {
    return { status: 'unknown' };
  }
}
