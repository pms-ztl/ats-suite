import { Worker, Job } from 'bullmq';
import { getRedisConnection, ScreeningJobData } from '../lib/queue';
import { screenCandidate } from '../agents/screening-agent';
import { emitAgentEvent } from '../lib/agent-bus';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';

export function startScreeningWorker(): Worker {
  const worker = new Worker<ScreeningJobData>(
    'ai-screening',
    async (job: Job<ScreeningJobData>) => {
      const { candidateId, requisitionId, tenantId, userId } = job.data;

      logger.info({ jobId: job.id, candidateId, requisitionId }, 'Processing screening job');

      // 1. Fetch resume text
      const resume = await prisma.resume.findFirst({
        where: { candidateId, tenantId },
      });

      if (!resume?.extractedText) {
        throw new Error(`No resume found for candidate ${candidateId}`);
      }

      // 2. Get parsed data if available
      let parsedResume;
      if (resume.parsedData && typeof resume.parsedData === 'object') {
        const pd = resume.parsedData as any;
        parsedResume = {
          skills: pd.skills || [],
          experience: pd.experience || [],
          education: pd.education || [],
          totalYearsExperience: pd.totalYearsExperience || 0,
        };
      }

      // 3. Run AI screening
      const result = await screenCandidate({
        candidateId,
        requisitionId,
        tenantId,
        userId,
        resumeText: resume.extractedText,
        parsedResume,
      });

      logger.info({
        jobId: job.id,
        candidateId,
        recommendation: result.screening.recommendation,
        score: result.screening.overallScore,
        hitlRequired: result.hitlRequired,
        cost: result.costUsd,
      }, 'Screening completed');

      // Emit inter-agent event for downstream processing
      await emitAgentEvent({
        type: 'screening.completed',
        tenantId,
        candidateId,
        requisitionId,
        recommendation: result.screening.recommendation,
        runId: result.runId,
      });

      return {
        runId: result.runId,
        recommendation: result.screening.recommendation,
        overallScore: result.screening.overallScore,
        hitlRequired: result.hitlRequired,
      };
    },
    {
      connection: getRedisConnection(),
      concurrency: 2,
      limiter: { max: 5, duration: 60000 }, // Max 5 screenings per minute
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Screening job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message, attempts: job?.attemptsMade }, 'Screening job failed');
  });

  return worker;
}
