import { sendEmail } from './mailer';
import { dispatchWebhook } from './webhooks';
import { sendSlackNotification, formatPipelineSlackMessage } from './slack';
import logger from './logger';

function useQueue(): boolean {
  return !!process.env.REDIS_URL;
}

async function getEnqueueNotification() {
  const { enqueueNotification } = await import('./queue');
  return enqueueNotification;
}

export interface TransitionEvent {
  tenantId: string;
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
  requisitionTitle: string;
  fromStage: string;
  toStage: string;
  applicationId: string;
}

/**
 * Send notifications based on pipeline stage transitions.
 * Fire-and-forget — does not block the stage transition.
 *
 * Usage (from candidates-write.ts advanceStage):
 *   import { notifyStageTransition } from '../lib/pipeline-notifications';
 *   // After a successful stage transition:
 *   notifyStageTransition({ tenantId, candidateId, candidateEmail, ... }).catch(() => {});
 */
export async function notifyStageTransition(event: TransitionEvent): Promise<void> {
  try {
    // 1. Candidate-facing emails — build the email content
    const emailTemplates: Record<string, { subject: string; html: string } | undefined> = {
      SCREENED: {
        subject: `Application Update — ${event.requisitionTitle}`,
        html: `<p>Dear ${event.candidateName},</p>
          <p>Your application for <strong>${event.requisitionTitle}</strong> has been reviewed and moved to screening.</p>
          <p>We'll be in touch with next steps soon.</p>
          <p>Best regards,<br/>The Hiring Team</p>`,
      },
      INTERVIEW: {
        subject: `Interview Invitation — ${event.requisitionTitle}`,
        html: `<p>Dear ${event.candidateName},</p>
          <p>Congratulations! You've been selected for an interview for <strong>${event.requisitionTitle}</strong>.</p>
          <p>Our team will reach out shortly to schedule a time that works for you.</p>
          <p>Best regards,<br/>The Hiring Team</p>`,
      },
      OFFER: {
        subject: `Great News — Offer for ${event.requisitionTitle}`,
        html: `<p>Dear ${event.candidateName},</p>
          <p>We're excited to let you know that we'd like to extend an offer for the <strong>${event.requisitionTitle}</strong> position.</p>
          <p>Details will follow shortly. Please don't hesitate to reach out with questions.</p>
          <p>Best regards,<br/>The Hiring Team</p>`,
      },
      HIRED: {
        subject: `Welcome Aboard! — ${event.requisitionTitle}`,
        html: `<p>Dear ${event.candidateName},</p>
          <p>We're thrilled to officially welcome you to the team as our new <strong>${event.requisitionTitle}</strong>!</p>
          <p>Our onboarding team will be in touch with next steps.</p>
          <p>Best regards,<br/>The Hiring Team</p>`,
      },
      REJECTED: {
        subject: `Application Update — ${event.requisitionTitle}`,
        html: `<p>Dear ${event.candidateName},</p>
          <p>Thank you for your interest in the <strong>${event.requisitionTitle}</strong> position.</p>
          <p>After careful consideration, we've decided to move forward with other candidates at this time.</p>
          <p>We appreciate the time you invested in the process and encourage you to apply for future openings.</p>
          <p>Best regards,<br/>The Hiring Team</p>`,
      },
    };

    const template = emailTemplates[event.toStage];
    if (template) {
      if (useQueue()) {
        const enqueue = await getEnqueueNotification();
        await enqueue({
          type: 'email',
          tenantId: event.tenantId,
          payload: { to: event.candidateEmail, subject: template.subject, html: template.html },
        }).catch(err => logger.error({ err, event }, 'Failed to enqueue email notification'));
      } else {
        await sendEmail({
          to: event.candidateEmail,
          subject: template.subject,
          html: template.html,
        }).catch(err => logger.error({ err, event }, `Failed to send ${event.toStage} notification`));
      }
    }

    // 2. Webhook dispatch
    const webhookEvent = event.toStage === 'HIRED' ? 'hire.completed'
      : event.toStage === 'INTERVIEW' ? 'interview.scheduled'
      : event.toStage === 'OFFER' ? 'offer.created'
      : 'application.stage_changed';

    const webhookData = {
      candidateId: event.candidateId,
      applicationId: event.applicationId,
      fromStage: event.fromStage,
      toStage: event.toStage,
      requisitionTitle: event.requisitionTitle,
    };

    if (useQueue()) {
      const enqueue = await getEnqueueNotification();
      await enqueue({
        type: 'webhook',
        tenantId: event.tenantId,
        payload: { event: webhookEvent, data: webhookData },
      }).catch(err => logger.error({ err }, 'Failed to enqueue webhook'));
    } else {
      await dispatchWebhook(event.tenantId, webhookEvent as any, webhookData)
        .catch(err => logger.error({ err }, 'Webhook dispatch failed'));
    }

    // 3. Slack notification
    const slackMsg = formatPipelineSlackMessage({
      candidateName: event.candidateName,
      requisitionTitle: event.requisitionTitle,
      fromStage: event.fromStage,
      toStage: event.toStage,
    });

    if (useQueue()) {
      const enqueue = await getEnqueueNotification();
      await enqueue({
        type: 'slack',
        tenantId: event.tenantId,
        payload: { text: slackMsg.text, blocks: slackMsg.blocks },
      }).catch(err => logger.error({ err }, 'Failed to enqueue Slack notification'));
    } else {
      await sendSlackNotification(event.tenantId, slackMsg)
        .catch(err => logger.error({ err }, 'Slack notification failed'));
    }

  } catch (err) {
    // Never let notification failures block the pipeline
    logger.error({ err, event }, 'Pipeline notification error');
  }
}
