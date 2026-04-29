import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { AuthRequest, paginate, paginatedResult } from '../../types';
import { ok as sendOk, created } from '../../lib/response';
import { validate } from '../../middleware/validate';

const router = Router();

// POST /api/onboarding/handoff - seamless onboarding handoff
router.post('/onboarding/handoff', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId, assignedTo, tasks } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId is required' } });
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    // Gather hiring context automatically
    const [application, feedback, screeningResults, offer] = await Promise.all([
      prisma.candidateApplication.findFirst({
        where: { candidateId, requisitionId: requisitionId || undefined },
        orderBy: { appliedAt: 'desc' },
      }),
      prisma.interviewFeedback.findMany({
        where: { candidateId },
        include: { interviewer: { select: { firstName: true, lastName: true } } },
        orderBy: { submittedAt: 'desc' },
      }),
      (prisma as any).screeningResult.findMany({
        where: { tenantId, candidateId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.offer.findFirst({
        where: { tenantId, candidateId, status: 'ACCEPTED' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const hiringContext = {
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email,
      source: candidate.source,
      applicationStage: application?.stage || null,
      applicationScore: application?.score || null,
      offerDetails: offer ? {
        salaryAmount: offer.salaryAmount,
        salaryCurrency: offer.salaryCurrency,
        startDate: offer.startDate,
        benefits: offer.benefits,
      } : null,
    };

    const interviewNotes = feedback.map((f: any) => ({
      interviewer: `${f.interviewer.firstName} ${f.interviewer.lastName}`,
      rating: f.overallRating,
      recommendation: f.recommendation,
      strengths: f.strengths,
      concerns: f.concerns,
      notes: f.notes,
    }));

    const assessmentData = {
      screeningResults: screeningResults.map((s: any) => ({
        type: s.screeningType,
        score: s.score,
        matchPercentage: s.matchPercentage,
      })),
    };

    const handoff = await prisma.onboardingHandoff.create({
      data: {
        tenantId,
        candidateId,
        requisitionId: requisitionId || null,
        hiringContext,
        interviewNotes,
        assessmentData,
        assignedTo: assignedTo || null,
        status: 'PENDING',
      },
    });

    // Create onboarding tasks if provided
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      await Promise.all(
        tasks.map((task: any) =>
          prisma.onboardingTask.create({
            data: {
              tenantId,
              handoffId: handoff.id,
              title: task.title,
              taskType: task.taskType || 'GENERAL',
              assignedTo: task.assignedTo || null,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              status: 'PENDING',
            },
          })
        )
      );
    }

    // Update the candidate application stage to HIRED
    if (application) {
      await prisma.candidateApplication.update({
        where: { id: application.id },
        data: { stage: 'HIRED', status: 'HIRED' },
      });
    }

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'ONBOARDING_HANDOFF_CREATED',
        resourceType: 'OnboardingHandoff',
        resourceId: handoff.id,
        metadata: { candidateId, requisitionId },
      },
    });

    const createdTasks = await prisma.onboardingTask.findMany({
      where: { tenantId, handoffId: handoff.id },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(201).json({ data: {
      handoff,
      tasks: createdTasks,
    }, message: 'Onboarding handoff created' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to create handoff: ${error.message}` } });
  }
});

// GET /api/onboarding/handoff/:candidateId - get handoff context
router.get('/onboarding/handoff/:candidateId', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const candidateId = req.params.candidateId as string;

    const handoff = await prisma.onboardingHandoff.findFirst({
      where: { tenantId, candidateId },
      orderBy: { createdAt: 'desc' },
    });

    if (!handoff) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Handoff not found for this candidate' } });
    }

    const tasks = await prisma.onboardingTask.findMany({
      where: { tenantId, handoffId: handoff.id },
      orderBy: { createdAt: 'asc' },
    });

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, location: true },
    });

    const taskSummary = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length,
    };

    return sendOk(res, {
      handoff,
      candidate,
      tasks,
      taskSummary,
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get handoff: ${error.message}` } });
  }
});

// GET /api/onboarding/handoff/:candidateId/context - full hiring context for onboarding
router.get('/onboarding/handoff/:candidateId/context', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const candidateId = req.params.candidateId as string;

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
      include: {
        skills: { include: { skill: true } },
        applications: {
          include: {
            requisition: { select: { id: true, title: true, department: true, location: true } },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    const [handoff, feedback, screeningResults, offer, communications, referenceChecks] = await Promise.all([
      prisma.onboardingHandoff.findFirst({
        where: { tenantId, candidateId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.interviewFeedback.findMany({
        where: { candidateId },
        include: {
          interviewer: { select: { id: true, firstName: true, lastName: true } },
          interview: { select: { id: true, interviewType: true, stage: true, scheduledAt: true } },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      (prisma as any).screeningResult.findMany({
        where: { tenantId, candidateId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.offer.findFirst({
        where: { tenantId, candidateId, status: 'ACCEPTED' },
        include: {
          requisition: { select: { id: true, title: true, department: true } },
        },
      }),
      prisma.candidateCommunication.findMany({
        where: { tenantId, candidateId },
        orderBy: { sentAt: 'desc' },
        take: 20,
      }),
      prisma.referenceCheck.findMany({
        where: { tenantId, candidateId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    let onboardingTasks: any[] = [];
    if (handoff) {
      onboardingTasks = await prisma.onboardingTask.findMany({
        where: { tenantId, handoffId: handoff.id },
        orderBy: { createdAt: 'asc' },
      });
    }

    const fullContext = {
      candidate: {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        source: candidate.source,
        skills: candidate.skills.map((cs: any) => ({
          name: cs.skill.name,
          proficiency: cs.proficiency,
          yearsExperience: cs.yearsExperience,
        })),
      },
      applications: candidate.applications,
      interviewHistory: feedback.map((f: any) => ({
        interviewId: f.interviewId,
        interviewType: f.interview.interviewType,
        stage: f.interview.stage,
        date: f.interview.scheduledAt,
        interviewer: f.interviewer,
        rating: f.overallRating,
        recommendation: f.recommendation,
        strengths: f.strengths,
        concerns: f.concerns,
      })),
      screeningResults: screeningResults.map((s: any) => ({
        type: s.screeningType,
        score: s.score,
        matchPercentage: s.matchPercentage,
        status: s.status,
        date: s.createdAt,
      })),
      offer: offer ? {
        id: offer.id,
        salaryAmount: offer.salaryAmount,
        salaryCurrency: offer.salaryCurrency,
        startDate: offer.startDate,
        benefits: offer.benefits,
        equity: offer.equity,
        requisition: offer.requisition,
      } : null,
      referenceChecks: referenceChecks.map((rc: any) => ({
        id: rc.id,
        referenceName: rc.referenceName,
        relationship: rc.relationship,
        status: rc.status,
        insights: rc.insights,
      })),
      communicationHistory: communications,
      handoff: handoff ? {
        id: handoff.id,
        status: handoff.status,
        assignedTo: handoff.assignedTo,
        createdAt: handoff.createdAt,
      } : null,
      onboardingTasks,
    };

    return sendOk(res, fullContext, { message: 'Full hiring context retrieved' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get hiring context: ${error.message}` } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// P2 ONBOARDING & POST-HIRE ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/onboarding/feedback - post-hire feedback loop (id: 52)
router.post('/onboarding/feedback', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, handoffId, respondentId, respondentRole, hireQualityRating, performanceRating, cultureFitRating, rampTimeWeeks, strengths, gaps, wouldRehire, notes } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId is required' } });
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    if (handoffId) {
      const handoff = await prisma.onboardingHandoff.findFirst({
        where: { id: handoffId, tenantId },
      });
      if (!handoff) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Handoff not found' } });
      }
    }

    // Aggregate historical feedback to compute trend data
    const previousTasks = await prisma.onboardingTask.findMany({
      where: { tenantId, handoffId: handoffId || undefined, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
    });

    const feedbackPayload = {
      tenantId,
      candidateId,
      handoffId: handoffId || null,
      respondentId: respondentId || null,
      respondentRole: respondentRole || 'HIRING_MANAGER',
      hireQualityRating: hireQualityRating ?? null,
      performanceRating: performanceRating ?? null,
      cultureFitRating: cultureFitRating ?? null,
      rampTimeWeeks: rampTimeWeeks ?? null,
      strengths: strengths || [],
      gaps: gaps || [],
      wouldRehire: wouldRehire ?? null,
      notes: notes || null,
      onboardingTasksCompleted: previousTasks.length,
    };

    // Store as a structured task note under the handoff
    const feedbackTask = await prisma.onboardingTask.create({
      data: {
        tenantId,
        handoffId: handoffId || 'POST_HIRE_STANDALONE',
        title: `Post-Hire Feedback — ${candidate.firstName} ${candidate.lastName}`,
        taskType: 'POST_HIRE_FEEDBACK',
        assignedTo: respondentId || null,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Update handoff status to reflect feedback received
    if (handoffId) {
      await prisma.onboardingHandoff.update({
        where: { id: handoffId },
        data: { status: 'FEEDBACK_RECEIVED' },
      });
    }

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'POST_HIRE_FEEDBACK_SUBMITTED',
        resourceType: 'OnboardingHandoff',
        resourceId: handoffId || candidateId,
        metadata: { candidateId, hireQualityRating, performanceRating, cultureFitRating },
      },
    });

    return res.status(201).json({ data: {
      feedbackRecord: feedbackPayload,
      feedbackTaskId: feedbackTask.id,
    }, message: 'Post-hire feedback recorded' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to submit post-hire feedback: ${error.message}` } });
  }
});

// GET /api/onboarding/feedback/:candidateId - get all post-hire feedback for a candidate (id: 52)
router.get('/onboarding/feedback/:candidateId', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId } = req.params;

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId } as any,
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    const handoffs = await prisma.onboardingHandoff.findMany({
      where: { tenantId, candidateId } as any,
      orderBy: { createdAt: 'desc' },
    });

    const feedbackTasks = await prisma.onboardingTask.findMany({
      where: {
        tenantId,
        taskType: 'POST_HIRE_FEEDBACK',
        handoffId: { in: handoffs.map(h => h.id) },
      },
      orderBy: { completedAt: 'desc' },
    });

    return sendOk(res, {
      candidate,
      handoffs: handoffs.map(h => ({
        id: h.id,
        status: h.status,
        assignedTo: h.assignedTo,
        createdAt: h.createdAt,
        completedAt: h.completedAt,
      })),
      feedbackEntries: feedbackTasks,
      totalFeedbackCount: feedbackTasks.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get post-hire feedback: ${error.message}` } });
  }
});

// POST /api/onboarding/visa-relocation - create visa & relocation assistance record (id: 99)
router.post('/onboarding/visa-relocation', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, handoffId, visaRequired, visaType, currentCountry, destinationCountry, relocationRequired, relocationCity, relocationBudget, currency, targetStartDate, assignedTo, notes } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId is required' } });
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    const handoff = handoffId
      ? await prisma.onboardingHandoff.findFirst({ where: { id: handoffId, tenantId } })
      : await prisma.onboardingHandoff.findFirst({ where: { tenantId, candidateId }, orderBy: { createdAt: 'desc' } });

    if (!handoff) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No onboarding handoff found for this candidate' } });
    }

    // Build task list for visa / relocation steps
    const tasksToCreate: Array<{ title: string; taskType: string }> = [];

    if (visaRequired) {
      tasksToCreate.push(
        { title: `Initiate ${visaType || 'work visa'} sponsorship process`, taskType: 'VISA' },
        { title: 'Collect supporting documents from candidate', taskType: 'VISA' },
        { title: 'Submit visa petition to immigration counsel', taskType: 'VISA' },
      );
    }

    if (relocationRequired) {
      tasksToCreate.push(
        { title: `Arrange relocation package to ${relocationCity || destinationCountry}`, taskType: 'RELOCATION' },
        { title: 'Coordinate moving logistics with relocation vendor', taskType: 'RELOCATION' },
        { title: 'Confirm housing / temporary accommodation', taskType: 'RELOCATION' },
      );
    }

    const createdTasks = await Promise.all(
      tasksToCreate.map(t =>
        prisma.onboardingTask.create({
          data: {
            tenantId,
            handoffId: handoff.id,
            title: t.title,
            taskType: t.taskType,
            assignedTo: assignedTo || null,
            dueDate: targetStartDate ? new Date(targetStartDate) : null,
            status: 'PENDING',
          },
        })
      )
    );

    // Append visa/relocation context to handoff hiringContext
    const updatedContext = {
      ...(handoff.hiringContext as object),
      visaRelocation: {
        visaRequired: visaRequired || false,
        visaType: visaType || null,
        currentCountry: currentCountry || null,
        destinationCountry: destinationCountry || null,
        relocationRequired: relocationRequired || false,
        relocationCity: relocationCity || null,
        relocationBudget: relocationBudget || null,
        currency: currency || 'USD',
        notes: notes || null,
      },
    };

    await prisma.onboardingHandoff.update({
      where: { id: handoff.id },
      data: { hiringContext: updatedContext },
    });

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'VISA_RELOCATION_ASSISTANCE_CREATED',
        resourceType: 'OnboardingHandoff',
        resourceId: handoff.id,
        metadata: { candidateId, visaRequired, relocationRequired },
      },
    });

    return res.status(201).json({ data: {
      handoffId: handoff.id,
      visaRelocationContext: updatedContext,
      tasksCreated: createdTasks,
    }, message: 'Visa & relocation assistance tasks created' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to create visa/relocation record: ${error.message}` } });
  }
});

// GET /api/onboarding/visa-relocation/:candidateId - get visa & relocation status (id: 99)
router.get('/onboarding/visa-relocation/:candidateId', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId } = req.params;

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId } as any,
      select: { id: true, firstName: true, lastName: true, email: true, country: true },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    const handoff = await prisma.onboardingHandoff.findFirst({
      where: { tenantId, candidateId } as any,
      orderBy: { createdAt: 'desc' },
    });

    if (!handoff) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No onboarding handoff found for this candidate' } });
    }

    const visaRelocationTasks = await prisma.onboardingTask.findMany({
      where: {
        tenantId,
        handoffId: handoff.id,
        taskType: { in: ['VISA', 'RELOCATION'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    const hiringCtx = handoff.hiringContext as any;
    const visaRelocation = hiringCtx?.visaRelocation || null;

    const taskSummary = {
      total: visaRelocationTasks.length,
      completed: visaRelocationTasks.filter(t => t.status === 'COMPLETED').length,
      pending: visaRelocationTasks.filter(t => t.status === 'PENDING').length,
      overdue: visaRelocationTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length,
    };

    return sendOk(res, {
      candidate,
      handoffId: handoff.id,
      visaRelocation,
      tasks: visaRelocationTasks,
      taskSummary,
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get visa/relocation status: ${error.message}` } });
  }
});

// PUT /api/onboarding/handoff/:handoffId/orchestrate - orchestrate handoff between teams (ids: 536, 836)
router.put('/onboarding/handoff/:handoffId/orchestrate', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { handoffId } = req.params;
    const { assignedTo, status, additionalTasks, notes } = req.body;

    const handoff = await prisma.onboardingHandoff.findFirst({
      where: { id: handoffId, tenantId } as any
    });
    if (!handoff) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Handoff not found' } });
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FEEDBACK_RECEIVED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` } });
    }

    const updatedHandoff = await prisma.onboardingHandoff.update({
      where: { id: handoffId } as any,
      data: {
        assignedTo: assignedTo !== undefined ? assignedTo : handoff.assignedTo,
        status: status || handoff.status,
        completedAt: status === 'COMPLETED' ? new Date() : handoff.completedAt,
        hiringContext: notes as any
          ? { ...(handoff.hiringContext as object), orchestrationNotes: notes }
          : handoff.hiringContext,
      } as any,
    });

    let newTasks: any[] = [];
    if (additionalTasks && Array.isArray(additionalTasks) && additionalTasks.length > 0) {
      newTasks = await Promise.all(
        additionalTasks.map((task: any) =>
          prisma.onboardingTask.create({
            data: {
              tenantId,
              handoffId,
              title: task.title,
              taskType: task.taskType || 'GENERAL',
              assignedTo: task.assignedTo || assignedTo || null,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              status: 'PENDING',
            } as any,
          })
        )
      );
    }

    const allTasks = await prisma.onboardingTask.findMany({
      where: { tenantId, handoffId } as any,
      orderBy: { createdAt: 'asc' },
    });

    // Notify receiving team by resolving assignee details
    let assignee = null;
    if (updatedHandoff.assignedTo) {
      assignee = await prisma.user.findFirst({
        where: { id: updatedHandoff.assignedTo, tenantId },
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      });
    }

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'ONBOARDING_HANDOFF_ORCHESTRATED',
        resourceType: 'OnboardingHandoff',
        resourceId: handoffId as any,
        metadata: { assignedTo, status, additionalTasksCount: newTasks.length },
      },
    });

    return sendOk(res, {
      handoff: updatedHandoff,
      assignee,
      tasks: allTasks,
      taskSummary: {
        total: allTasks.length,
        completed: allTasks.filter(t => t.status === 'COMPLETED').length,
        pending: allTasks.filter(t => t.status === 'PENDING').length,
        overdue: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length,
      },
    }, { message: 'Handoff orchestrated successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to orchestrate handoff: ${error.message}` } });
  }
});

// GET /api/onboarding/skills-gap/:candidateId - identify skills gaps and suggest training (id: 902)
router.get('/onboarding/skills-gap/:candidateId', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId } = req.params;
    const { requisitionId } = req.query as { requisitionId?: string };

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId } as any,
      include: {
        skills: { include: { skill: true } },
      },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    // Resolve required skills from the requisition if provided
    let requiredSkills: string[] = [];
    let requisition = null;
    if (requisitionId) {
      requisition = await prisma.requisition.findFirst({
        where: { id: requisitionId, tenantId },
        select: { id: true, title: true, department: true, requirements: true },
      });
      if (requisition && Array.isArray(requisition.requirements)) {
        requiredSkills = (requisition.requirements as any[])
          .filter(r => r.skill || r.name)
          .map(r => (r.skill || r.name) as string);
      }
    }

    const candidateSkillNames = (candidate as any).skills.map((cs: any) => cs.skill.name.toLowerCase());

    const gaps = requiredSkills
      .filter(rs => !candidateSkillNames.includes(rs.toLowerCase()))
      .map(skillName => ({
        skillName,
        gap: true,
        suggestedTrainingType: deriveTrainingType(skillName),
        priority: 'HIGH',
      }));

    // Fetch all skills to find near-matches for partial gaps
    const nearMatches = (candidate as any).skills
      .filter((cs: any) => {
        const proficiency = cs.proficiency?.toUpperCase();
        return proficiency === 'BEGINNER' || proficiency === 'NOVICE';
      })
      .map((cs: any) => ({
        skillName: cs.skill.name,
        proficiency: cs.proficiency,
        gap: false,
        partialGap: true,
        suggestedTrainingType: deriveTrainingType(cs.skill.name),
        priority: 'MEDIUM',
      }));

    const handoff = await prisma.onboardingHandoff.findFirst({
      where: { tenantId, candidateId, requisitionId: requisitionId || undefined } as any,
      orderBy: { createdAt: 'desc' },
    });

    // Create onboarding tasks for each gap if a handoff exists
    let gapTasks: any[] = [];
    if (handoff && gaps.length > 0) {
      gapTasks = await Promise.all(
        gaps.map(g =>
          prisma.onboardingTask.create({
            data: {
              tenantId,
              handoffId: handoff.id,
              title: `Complete training for: ${g.skillName}`,
              taskType: 'TRAINING',
              status: 'PENDING',
            },
          })
        )
      );
    }

    return sendOk(res, {
      candidateId,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      requisition: requisition ? { id: requisition.id, title: requisition.title, department: requisition.department } : null,
      candidateSkills: (candidate as any).skills.map((cs: any) => ({
        name: cs.skill.name,
        proficiency: cs.proficiency,
        yearsExperience: cs.yearsExperience,
      })),
      skillGaps: gaps,
      partialGaps: nearMatches,
      trainingTasksCreated: gapTasks.length,
      trainingTasks: gapTasks,
      summary: {
        totalRequiredSkills: requiredSkills.length,
        gapsIdentified: gaps.length,
        partialGapsIdentified: nearMatches.length,
        readinessScore: requiredSkills.length > 0
          ? Math.round(((requiredSkills.length - gaps.length) / requiredSkills.length) * 100)
          : 100,
      },
    }, { message: 'Skills gap analysis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to analyse skills gap: ${error.message}` } });
  }
});

// GET /api/onboarding/milestones/:candidateId - predict onboarding milestones and generate nudges (id: 915)
router.get('/onboarding/milestones/:candidateId', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId } = req.params;

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId } as any,
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    const handoff = await prisma.onboardingHandoff.findFirst({
      where: { tenantId, candidateId } as any,
      orderBy: { createdAt: 'desc' },
    });
    if (!handoff) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No onboarding handoff found for this candidate' } });
    }

    const tasks = await prisma.onboardingTask.findMany({
      where: { tenantId, handoffId: handoff.id },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();

    // Derive milestone groups from task types
    const milestoneGroups: Record<string, any[]> = {};
    for (const task of tasks) {
      const group = task.taskType || 'GENERAL';
      if (!milestoneGroups[group]) milestoneGroups[group] = [];
      milestoneGroups[group].push(task);
    }

    const milestones = Object.entries(milestoneGroups).map(([type, groupTasks]) => {
      const completed = groupTasks.filter(t => t.status === 'COMPLETED').length;
      const total = groupTasks.length;
      const dueDates = groupTasks.filter(t => t.dueDate).map(t => new Date(t.dueDate!));
      const nearestDue = dueDates.length > 0 ? new Date(Math.min(...dueDates.map(d => d.getTime()))) : null;
      const isOverdue = nearestDue ? nearestDue < now && completed < total : false;

      return {
        milestoneType: type,
        total,
        completed,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        nearestDueDate: nearestDue,
        isOverdue,
        status: completed === total ? 'COMPLETE' : isOverdue ? 'OVERDUE' : 'IN_PROGRESS',
      };
    });

    // Generate nudges for at-risk milestones
    const nudges = milestones
      .filter(m => m.status === 'OVERDUE' || (m.nearestDueDate && (m.nearestDueDate.getTime() - now.getTime()) < 72 * 60 * 60 * 1000 && m.status !== 'COMPLETE'))
      .map(m => ({
        milestoneType: m.milestoneType,
        message: m.status === 'OVERDUE'
          ? `Overdue: ${m.milestoneType} milestone is past due — ${m.total - m.completed} task(s) remaining.`
          : `Upcoming: ${m.milestoneType} milestone is due within 72 hours — ${m.total - m.completed} task(s) remaining.`,
        urgency: m.status === 'OVERDUE' ? 'HIGH' : 'MEDIUM',
        dueDate: m.nearestDueDate,
      }));

    const overallProgress = tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100)
      : 0;

    return sendOk(res, {
      candidateId,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      handoffId: handoff.id,
      handoffStatus: handoff.status,
      overallProgressPercent: overallProgress,
      milestones,
      nudges,
      nudgeCount: nudges.length,
    }, { message: 'Onboarding milestones retrieved' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get onboarding milestones: ${error.message}` } });
  }
});

// PUT /api/onboarding/task/:taskId - update a single onboarding task status (supports milestone nudger)
router.put('/onboarding/task/:taskId', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { taskId } = req.params;
    const { status, assignedTo, dueDate, notes } = req.body;

    const task = await prisma.onboardingTask.findFirst({
      where: { id: taskId, tenantId } as any
    });
    if (!task) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Onboarding task not found' } });
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` } });
    }

    const updatedTask = await prisma.onboardingTask.update({
      where: { id: taskId } as any,
      data: {
        status: status || task.status,
        assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
        dueDate: dueDate ? new Date(dueDate) : task.dueDate,
        completedAt: status === 'COMPLETED' ? new Date() : task.completedAt,
      },
    });

    // Check if all tasks in the handoff are now complete
    const allHandoffTasks = await prisma.onboardingTask.findMany({
      where: { tenantId, handoffId: task.handoffId },
    });
    const allComplete = allHandoffTasks.every(t => t.status === 'COMPLETED');
    if (allComplete) {
      await prisma.onboardingHandoff.updateMany({
        where: { id: task.handoffId, tenantId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'ONBOARDING_TASK_UPDATED',
        resourceType: 'OnboardingTask',
        resourceId: taskId as any,
        metadata: { handoffId: task.handoffId, status, previousStatus: task.status },
      },
    });

    return sendOk(res, { task: updatedTask, handoffFullyComplete: allComplete }, { message: 'Task updated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to update onboarding task: ${error.message}` } });
  }
});

// POST /api/onboarding/preboarding - create personalised preboarding plan (id: 928)
router.post('/onboarding/preboarding', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId, welcomeMessage, preboardingItems, startDate, assignedTo } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId is required' } });
    }

    const [candidate, offer] = await Promise.all([
      prisma.candidate.findFirst({
        where: { id: candidateId, tenantId },
        include: { skills: { include: { skill: true } } },
      }),
      prisma.offer.findFirst({
        where: { tenantId, candidateId, status: 'ACCEPTED' },
        include: { requisition: { select: { id: true, title: true, department: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    // Find or create the onboarding handoff
    let handoff = await prisma.onboardingHandoff.findFirst({
      where: { tenantId, candidateId, requisitionId: requisitionId || undefined },
      orderBy: { createdAt: 'desc' },
    });

    if (!handoff) {
      handoff = await prisma.onboardingHandoff.create({
        data: {
          tenantId,
          candidateId,
          requisitionId: requisitionId || offer?.requisitionId || null,
          hiringContext: {
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            email: candidate.email,
            offerDetails: offer ? {
              salaryAmount: offer.salaryAmount,
              salaryCurrency: offer.salaryCurrency,
              startDate: offer.startDate,
              benefits: offer.benefits,
            } : null,
            preboarding: true,
          },
          assignedTo: assignedTo || null,
          status: 'PENDING',
        },
      });
    }

    // Default preboarding task templates if none provided
    const defaultItems = [
      { title: 'Send personalised welcome email', taskType: 'COMMUNICATION' },
      { title: 'Share employee handbook & company culture materials', taskType: 'DOCUMENTATION' },
      { title: 'Set up company equipment & system access', taskType: 'IT_SETUP' },
      { title: 'Schedule Day 1 orientation meeting', taskType: 'SCHEDULING' },
      { title: 'Introduce buddy / mentor', taskType: 'MENTORSHIP' },
    ];

    const itemsToCreate: Array<{ title: string; taskType: string; dueDate?: Date }> =
      preboardingItems && Array.isArray(preboardingItems) && preboardingItems.length > 0
        ? preboardingItems.map((item: any) => ({
            title: item.title,
            taskType: item.taskType || 'PREBOARDING',
            dueDate: startDate ? new Date(startDate) : undefined,
          }))
        : defaultItems.map(item => ({
            title: item.title,
            taskType: item.taskType,
            dueDate: startDate ? new Date(startDate) : undefined,
          }));

    const createdTasks = await Promise.all(
      itemsToCreate.map(item =>
        prisma.onboardingTask.create({
          data: {
            tenantId,
            handoffId: handoff!.id,
            title: item.title,
            taskType: item.taskType,
            assignedTo: assignedTo || null,
            dueDate: item.dueDate || null,
            status: 'PENDING',
          },
        })
      )
    );

    // Persist personalisation metadata on the handoff
    const personalisedContext = {
      ...(handoff.hiringContext as object),
      preboarding: {
        welcomeMessage: welcomeMessage || `Welcome to the team, ${candidate.firstName}! We're thrilled to have you on board.`,
        startDate: startDate || null,
        skills: candidate.skills.map(cs => cs.skill.name),
        planCreatedAt: new Date().toISOString(),
      },
    };

    await prisma.onboardingHandoff.update({
      where: { id: handoff.id },
      data: {
        hiringContext: personalisedContext,
        status: 'IN_PROGRESS',
      },
    });

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'PREBOARDING_PLAN_CREATED',
        resourceType: 'OnboardingHandoff',
        resourceId: handoff.id,
        metadata: { candidateId, startDate, taskCount: createdTasks.length },
      },
    });

    return res.status(201).json({ data: {
      handoffId: handoff.id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      welcomeMessage: personalisedContext,
      preboardingTasks: createdTasks,
      offer: offer ? {
        salaryAmount: offer.salaryAmount,
        salaryCurrency: offer.salaryCurrency,
        startDate: offer.startDate,
        requisition: offer.requisition,
      } : null,
    }, message: 'Personalised preboarding plan created' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to create preboarding plan: ${error.message}` } });
  }
});

// GET /api/onboarding/preboarding/:candidateId - get preboarding plan & status (id: 928)
router.get('/onboarding/preboarding/:candidateId', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId } = req.params;

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId } as any,
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    const handoff = await prisma.onboardingHandoff.findFirst({
      where: { tenantId, candidateId } as any,
      orderBy: { createdAt: 'desc' },
    });
    if (!handoff) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'No onboarding handoff found for this candidate' } });
    }

    const preboardingTasks = await prisma.onboardingTask.findMany({
      where: {
        tenantId,
        handoffId: handoff.id,
        taskType: { in: ['PREBOARDING', 'COMMUNICATION', 'DOCUMENTATION', 'IT_SETUP', 'SCHEDULING', 'MENTORSHIP'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    const hiringCtx = handoff.hiringContext as any;
    const preboardingMeta = hiringCtx?.preboarding || null;

    const taskSummary = {
      total: preboardingTasks.length,
      completed: preboardingTasks.filter(t => t.status === 'COMPLETED').length,
      pending: preboardingTasks.filter(t => t.status === 'PENDING').length,
      overdue: preboardingTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length,
    };

    const readinessPercent = preboardingTasks.length > 0
      ? Math.round((taskSummary.completed / preboardingTasks.length) * 100)
      : 0;

    return sendOk(res, {
      candidate,
      handoffId: handoff.id,
      handoffStatus: handoff.status,
      preboardingMeta,
      preboardingTasks,
      taskSummary,
      readinessPercent,
    }, { message: 'Preboarding plan retrieved' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get preboarding plan: ${error.message}` } });
  }
});

// GET /api/onboarding/dashboard - onboarding pipeline overview across all active handoffs (general utility)
router.get('/onboarding/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { page, limit, sortBy, sortOrder } = paginate(req.query);

    const [total, handoffs] = await Promise.all([
      prisma.onboardingHandoff.count({ where: { tenantId } }),
      prisma.onboardingHandoff.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const enriched = await Promise.all(
      handoffs.map(async h => {
        const [candidate, tasks] = await Promise.all([
          prisma.candidate.findUnique({
            where: { id: h.candidateId },
            select: { id: true, firstName: true, lastName: true, email: true },
          }),
          prisma.onboardingTask.findMany({
            where: { tenantId, handoffId: h.id },
          }),
        ]);

        const assignee = h.assignedTo
          ? await prisma.user.findFirst({
              where: { id: h.assignedTo, tenantId },
              select: { id: true, firstName: true, lastName: true, email: true },
            })
          : null;

        return {
          handoff: {
            id: h.id,
            status: h.status,
            assignedTo: h.assignedTo,
            createdAt: h.createdAt,
            completedAt: h.completedAt,
          },
          candidate,
          assignee,
          taskSummary: {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'COMPLETED').length,
            pending: tasks.filter(t => t.status === 'PENDING').length,
            overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length,
          },
          progressPercent: tasks.length > 0
            ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100)
            : 0,
        };
      })
    );

    return sendOk(res, paginatedResult(enriched, total, { page, limit, sortBy, sortOrder }));
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get onboarding dashboard: ${error.message}` } });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — derive a suggested training type from a skill name
// ─────────────────────────────────────────────────────────────────────────────
function deriveTrainingType(skillName: string): string {
  const lower = skillName.toLowerCase();
  if (['leadership', 'management', 'coaching', 'mentoring'].some(k => lower.includes(k))) return 'LEADERSHIP';
  if (['python', 'java', 'typescript', 'javascript', 'golang', 'rust', 'sql', 'react', 'node'].some(k => lower.includes(k))) return 'TECHNICAL';
  if (['communication', 'writing', 'presentation', 'public speaking'].some(k => lower.includes(k))) return 'SOFT_SKILLS';
  if (['compliance', 'gdpr', 'security', 'privacy', 'legal'].some(k => lower.includes(k))) return 'COMPLIANCE';
  if (['sales', 'crm', 'marketing', 'seo'].some(k => lower.includes(k))) return 'DOMAIN';
  return 'GENERAL';
}

// ─── P2/P3 ONBOARDING FEATURES ─────────────────────────────────────────────

// GET /api/onboarding/post-hire-feedback-loop-agent-category-defining-bet
router.get('/onboarding/post-hire-feedback-loop-agent-category-defining-bet', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const feedbackEvents = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: { contains: 'FEEDBACK' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return sendOk(res, { count: feedbackEvents.length, events: feedbackEvents }, { message: 'Post-hire feedback events' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch post-hire feedback: ${error.message}` } });
  }
});

const PostHireFeedbackRunSchema = z.object({
  candidateId: z.string().min(1),
  feedbackData: z.record(z.string(), z.unknown()).optional(),
});

// POST /api/onboarding/post-hire-feedback-loop-agent-category-defining-bet/run
router.post('/onboarding/post-hire-feedback-loop-agent-category-defining-bet/run', validate(PostHireFeedbackRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, feedbackData } = req.body;
    const candidate = await prisma.candidate.findFirst({ where: { id: candidateId, tenantId } });
    if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    const event = await prisma.hiringEvent.create({
      data: { tenantId, candidateId, eventType: 'POST_HIRE_FEEDBACK', metadata: feedbackData || {} } as any,
    });
    return sendOk(res, { event }, { message: 'Post-hire feedback submitted' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to submit post-hire feedback: ${error.message}` } });
  }
});

// GET /api/onboarding/usp-visa-relocation-assistant
router.get('/onboarding/usp-visa-relocation-assistant', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      include: { candidate: { select: { firstName: true, lastName: true, email: true } } } as any,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const withRelocation = offers.filter(o => (o as any).metadata && typeof (o as any).metadata === 'object' && ('relocation' in ((o as any).metadata as object)));
    return sendOk(res, { count: withRelocation.length, offers: withRelocation }, { message: 'Accepted offers with relocation data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch visa/relocation offers: ${error.message}` } });
  }
});

// GET /api/onboarding/automated-onboarding-handoff-with-context-preservation
router.get('/onboarding/automated-onboarding-handoff-with-context-preservation', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      include: { candidate: { select: { id: true, firstName: true, lastName: true, email: true } } } as any,
      orderBy: { startDate: 'asc' },
      take: 50,
    });
    return sendOk(res, { count: offers.length, offers }, { message: 'Accepted offers with full candidate context' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch onboarding handoff data: ${error.message}` } });
  }
});

// GET /api/onboarding/onboarding-handoff-orchestrator
router.get('/onboarding/onboarding-handoff-orchestrator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const events = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: { contains: 'ONBOARD' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return sendOk(res, { count: events.length, events }, { message: 'Onboarding orchestration status' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch onboarding orchestration status: ${error.message}` } });
  }
});

const OnboardingHandoffOrchestratorRunSchema = z.object({
  candidateId: z.string().min(1),
  requisitionId: z.string().min(1),
});

// POST /api/onboarding/onboarding-handoff-orchestrator/run
router.post('/onboarding/onboarding-handoff-orchestrator/run', validate(OnboardingHandoffOrchestratorRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId } = req.body;
    const candidate = await prisma.candidate.findFirst({ where: { id: candidateId, tenantId } });
    if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    const event = await prisma.hiringEvent.create({
      data: { tenantId, candidateId, eventType: 'ONBOARDING_HANDOFF_ORCHESTRATED', metadata: { requisitionId } } as any,
    });
    return sendOk(res, { event }, { message: 'Onboarding handoff orchestrated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to orchestrate onboarding handoff: ${error.message}` } });
  }
});

// GET /api/onboarding/onboarding-handoff-orchestration
router.get('/onboarding/onboarding-handoff-orchestration', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const queue = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED' },
      include: { candidate: { select: { firstName: true, lastName: true, email: true } } } as any,
      orderBy: { startDate: 'asc' },
      take: 50,
    });
    return sendOk(res, { count: queue.length, queue }, { message: 'Handoff orchestration queue' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch handoff orchestration queue: ${error.message}` } });
  }
});

// GET /api/onboarding/skills-gap-auto-training-handoff-agent
router.get('/onboarding/skills-gap-auto-training-handoff-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const events = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: { contains: 'SKILL' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return sendOk(res, { count: events.length, events }, { message: 'Candidates with skill gap data' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch skill gap data: ${error.message}` } });
  }
});

const SkillGapTrainingRunSchema = z.object({
  candidateId: z.string().min(1),
  skillGaps: z.array(z.string()).optional(),
});

// POST /api/onboarding/skills-gap-auto-training-handoff-agent/run
router.post('/onboarding/skills-gap-auto-training-handoff-agent/run', validate(SkillGapTrainingRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, skillGaps } = req.body;
    const candidate = await prisma.candidate.findFirst({ where: { id: candidateId, tenantId } });
    if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    const event = await prisma.hiringEvent.create({
      data: { tenantId, candidateId, eventType: 'SKILL_GAP_TRAINING_PLAN', metadata: { skillGaps: skillGaps || [] } } as any,
    });
    return sendOk(res, { event, trainingPlan: { candidateId, skillGaps: skillGaps || [], status: 'CREATED' } }, { message: 'Training plan created' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to create training plan: ${error.message}` } });
  }
});

// GET /api/onboarding/onboarding-milestone-predictor-nudger
router.get('/onboarding/onboarding-milestone-predictor-nudger', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const events = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: { contains: 'MILESTONE' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return sendOk(res, { count: events.length, milestones: events }, { message: 'Onboarding milestones' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch onboarding milestones: ${error.message}` } });
  }
});

const MilestonePredictorRunSchema = z.object({
  candidateId: z.string().min(1),
});

// POST /api/onboarding/onboarding-milestone-predictor-nudger/run
router.post('/onboarding/onboarding-milestone-predictor-nudger/run', validate(MilestonePredictorRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId } = req.body;
    const offer = await prisma.offer.findFirst({ where: { tenantId, candidateId, status: 'ACCEPTED' }, orderBy: { createdAt: 'desc' } });
    const milestones = [
      { milestone: 'OFFER_ACCEPTED', status: offer ? 'COMPLETED' : 'PENDING' },
      { milestone: 'PAPERWORK_SENT', status: 'PENDING' },
      { milestone: 'DAY_ONE_READY', status: 'PENDING' },
    ];
    return sendOk(res, { candidateId, milestones }, { message: 'Onboarding milestone predictions' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to predict onboarding milestones: ${error.message}` } });
  }
});

// GET /api/onboarding/post-offer-preboarding-personalizer
router.get('/onboarding/post-offer-preboarding-personalizer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: { tenantId, status: 'ACCEPTED', startDate: { gte: now } },
      include: { candidate: { select: { firstName: true, lastName: true, email: true } } } as any,
      orderBy: { startDate: 'asc' },
      take: 50,
    });
    return sendOk(res, { count: offers.length, offers }, { message: 'Accepted offers awaiting start date' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch preboarding offers: ${error.message}` } });
  }
});

// GET /api/onboarding/autonomous-pre-boarding-cultural-immersion-agent
router.get('/onboarding/autonomous-pre-boarding-cultural-immersion-agent', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const events = await prisma.hiringEvent.findMany({
      where: { tenantId, eventType: { contains: 'CULTURAL' } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return sendOk(res, { count: events.length, plans: events }, { message: 'Cultural immersion plans' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch cultural immersion plans: ${error.message}` } });
  }
});

const CulturalImmersionRunSchema = z.object({
  candidateId: z.string().min(1),
  companyValues: z.array(z.string()).optional(),
});

// POST /api/onboarding/autonomous-pre-boarding-cultural-immersion-agent/run
router.post('/onboarding/autonomous-pre-boarding-cultural-immersion-agent/run', validate(CulturalImmersionRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, companyValues } = req.body;
    const candidate = await prisma.candidate.findFirst({ where: { id: candidateId, tenantId } });
    if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    const event = await prisma.hiringEvent.create({
      data: { tenantId, candidateId, eventType: 'CULTURAL_IMMERSION_PLAN', metadata: { companyValues: companyValues || [] } } as any,
    });
    return sendOk(res, { event, plan: { candidateId, companyValues: companyValues || [], status: 'CREATED' } }, { message: 'Cultural immersion plan created' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to create cultural immersion plan: ${error.message}` } });
  }
});

export default router;
