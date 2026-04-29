import { Worker, Job } from 'bullmq';
import { getRedisConnection, ResumeParseJobData, enqueueScreening } from '../lib/queue';
import { parseResume } from '../agents/resume-parser';
import { prisma } from '../utils/prisma';
import logger from '../lib/logger';

export function startResumeParseWorker(): Worker {
  const worker = new Worker<ResumeParseJobData>(
    'resume-parse',
    async (job: Job<ResumeParseJobData>) => {
      const { candidateId, tenantId, userId, resumeId } = job.data;

      logger.info({ jobId: job.id, candidateId, resumeId }, 'Processing resume parse job');

      // 1. Fetch the resume text
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, tenantId },
      });

      if (!resume?.extractedText) {
        throw new Error(`Resume ${resumeId} has no extracted text`);
      }

      // 2. Run AI parser
      const result = await parseResume({
        candidateId,
        tenantId,
        userId,
        resumeText: resume.extractedText,
      });

      logger.info({
        jobId: job.id,
        candidateId,
        runId: result.runId,
        skills: result.parsed.skills.length,
        cost: result.costUsd,
      }, 'Resume parsed successfully');

      // 3. Auto-trigger screening for each active application
      const applications = await prisma.application.findMany({
        where: { candidateId, tenantId, status: 'ACTIVE' },
        select: { requisitionId: true },
      });

      for (const app of applications) {
        await enqueueScreening({
          candidateId,
          requisitionId: app.requisitionId,
          tenantId,
          userId,
        });
      }

      return { runId: result.runId, applicationsQueued: applications.length };
    },
    {
      connection: getRedisConnection(),
      concurrency: 3,
      limiter: { max: 10, duration: 60000 }, // Max 10 jobs per minute
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Resume parse job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message, attempts: job?.attemptsMade }, 'Resume parse job failed');
  });

  return worker;
}
