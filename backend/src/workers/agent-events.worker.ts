import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../lib/queue';
import { AgentEvent } from '../lib/agent-bus';
import { isAgentEnabled, checkTenantBudget } from '../lib/billing';
import logger from '../lib/logger';

// Lazy imports to avoid circular dependencies
async function getAgentFunctions() {
  const { generateInterviewKit } = await import('../agents/interview-kit-agent');
  const { generateInsights } = await import('../agents/analytics-agent');
  const { runComplianceAudit } = await import('../agents/bias-auditor-agent');
  return { generateInterviewKit, generateInsights, runComplianceAudit };
}

export function startAgentEventsWorker(): Worker {
  const worker = new Worker<AgentEvent>(
    'agent-events',
    async (job: Job<AgentEvent>) => {
      const event = job.data;
      logger.info({ type: event.type, tenantId: event.tenantId }, 'Processing agent event');

      // Budget gate — don't trigger downstream agents if tenant is over budget
      const budget = await checkTenantBudget(event.tenantId);
      if (!budget.allowed) {
        logger.warn({ tenantId: event.tenantId }, 'Agent event skipped — tenant over budget');
        return { skipped: true, reason: 'budget_exceeded' };
      }

      switch (event.type) {
        case 'screening.completed': {
          // When screening completes with "advance", auto-generate interview kit
          if (event.recommendation === 'advance') {
            const enabled = await isAgentEnabled(event.tenantId, 'interview-kit-generator');
            if (enabled) {
              const { generateInterviewKit } = await getAgentFunctions();
              // Find the requisition for this candidate
              const { prisma } = await import('../utils/prisma');
              const app = await prisma.application.findFirst({
                where: { candidateId: event.candidateId, requisitionId: event.requisitionId, tenantId: event.tenantId },
              });
              if (app) {
                await generateInterviewKit({
                  requisitionId: event.requisitionId,
                  candidateId: event.candidateId,
                  interviewType: 'technical',
                  interviewerRole: 'Hiring Manager',
                  durationMinutes: 45,
                  tenantId: event.tenantId,
                  userId: 'system',
                }).catch(err => logger.error({ err }, 'Auto interview kit generation failed'));
                logger.info({ candidateId: event.candidateId }, 'Interview kit auto-generated after screening advance');
              }
            }
          }
          break;
        }

        case 'stage.changed': {
          // When candidate advances to INTERVIEW, trigger scheduling suggestions
          if (event.toStage === 'INTERVIEW') {
            logger.info({ candidateId: event.candidateId }, 'Candidate advanced to INTERVIEW — scheduling agent can be triggered from UI');
            // Note: scheduling agent requires participant list from the recruiter,
            // so we log the event rather than auto-triggering
          }
          break;
        }

        case 'compliance.audit.due': {
          // Cron-triggered weekly compliance audit
          const enabled = await isAgentEnabled(event.tenantId, 'bias-auditor');
          if (enabled) {
            const { runComplianceAudit } = await getAgentFunctions();
            await runComplianceAudit({
              tenantId: event.tenantId,
              userId: 'system-cron',
              timeRange: {
                start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
                end: new Date(),
              },
              attributes: ['source'],
            }).catch(err => logger.error({ err }, 'Cron compliance audit failed'));
            logger.info({ tenantId: event.tenantId }, 'Weekly compliance audit completed');
          }
          break;
        }

        case 'analytics.digest.due': {
          // Cron-triggered daily analytics digest
          const enabled = await isAgentEnabled(event.tenantId, 'analytics-insights');
          if (enabled) {
            const { generateInsights } = await getAgentFunctions();
            await generateInsights({
              tenantId: event.tenantId,
              userId: 'system-cron',
              query: 'Generate a daily hiring pipeline summary with key metrics, bottlenecks, and recommended actions.',
            }).catch(err => logger.error({ err }, 'Cron analytics digest failed'));
            logger.info({ tenantId: event.tenantId }, 'Daily analytics digest completed');
          }
          break;
        }

        case 'resume.parsed': {
          // After resume is parsed, notify the recruiter and log for audit
          logger.info({ candidateId: event.candidateId, runId: event.runId, tenantId: event.tenantId }, 'Resume parsed — ready for screening');
          // Audit trail
          const { prisma } = await import('../utils/prisma');
          await prisma.auditTrailEntry.create({
            data: {
              tenantId: event.tenantId,
              action: 'RESUME_PARSED',
              resourceType: 'Candidate',
              resourceId: event.candidateId,
              actorId: null,
              actorType: 'AGENT',
              after: { runId: event.runId },
            },
          }).catch(() => {});
          break;
        }

        case 'interview.analyzed': {
          logger.info({ interviewId: event.interviewId, runId: event.runId, tenantId: event.tenantId }, 'Interview analyzed — scorecard ready for review');
          break;
        }

        case 'offer.drafted': {
          logger.info({ offerId: event.offerId, candidateId: event.candidateId, tenantId: event.tenantId }, 'Offer drafted — awaiting approval');
          break;
        }

        default:
          logger.debug({ type: (event as AgentEvent).type }, 'Unhandled agent event type');
      }

      return { processed: true, type: event.type };
    },
    {
      connection: getRedisConnection(),
      concurrency: 2,
      limiter: { max: 10, duration: 60000 },
    }
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, type: job?.data?.type, error: err.message }, 'Agent event processing failed');
  });

  return worker;
}
