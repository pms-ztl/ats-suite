import logger from './logger';
import { prisma } from '../utils/prisma';

interface SlackMessage {
  text: string;
  blocks?: Array<Record<string, unknown>>;
  channel?: string;
}

/**
 * Send a notification to Slack via incoming webhook.
 * Looks up the tenant's Slack webhook URL from IntegrationConfig.
 */
export async function sendSlackNotification(
  tenantId: string,
  message: SlackMessage
): Promise<boolean> {
  try {
    const integration = await prisma.integrationConfig.findFirst({
      where: { tenantId, provider: 'SLACK', status: 'ACTIVE' },
    });

    if (!integration) return false;

    const config = integration.config as Record<string, any>;
    const webhookUrl = config?.webhookUrl;
    if (!webhookUrl) return false;

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      logger.error({ status: res.status, tenantId }, 'Slack webhook failed');
      return false;
    }

    logger.info({ tenantId }, 'Slack notification sent');
    return true;
  } catch (err) {
    logger.error({ err, tenantId }, 'Slack notification error');
    return false;
  }
}

/**
 * Format a pipeline stage transition as a Slack block message.
 */
export function formatPipelineSlackMessage(data: {
  candidateName: string;
  requisitionTitle: string;
  fromStage: string;
  toStage: string;
  actorName?: string;
}): SlackMessage {
  const emoji = data.toStage === 'HIRED' ? '\u{1F389}'
    : data.toStage === 'OFFER' ? '\u{1F4BC}'
    : data.toStage === 'INTERVIEW' ? '\u{1F4C5}'
    : data.toStage === 'REJECTED' ? '\u274C'
    : '\u{1F4CB}';

  return {
    text: `${emoji} ${data.candidateName} moved from ${data.fromStage} \u2192 ${data.toStage} for ${data.requisitionTitle}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *Pipeline Update*\n*${data.candidateName}* moved from \`${data.fromStage}\` \u2192 \`${data.toStage}\`\n\u{1F4CB} *Role:* ${data.requisitionTitle}${data.actorName ? `\n\u{1F464} *By:* ${data.actorName}` : ''}`,
        },
      },
    ],
  };
}
