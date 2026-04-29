import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { ok, created, noContent } from "../lib/response";
import { notifyStageTransition } from "../lib/pipeline-notifications";
import { emitAgentEvent } from "../lib/agent-bus";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const CreateCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  summary: z.string().optional(),
  source: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  requisitionId: z.string().optional(), // if provided, also create an Application
});

const UpdateCandidateSchema = CreateCandidateSchema
  .omit({ requisitionId: true })
  .partial();

const AdvanceStageSchema = z.object({
  stage: z.enum([
    "APPLIED",
    "SCREENED",
    "PHONE_SCREEN",
    "ASSESSMENT",
    "INTERVIEW",
    "FINAL_REVIEW",
    "OFFER",
    "HIRED",
    "REJECTED",
    "WITHDRAWN",
  ]),
  applicationId: z.string().optional(),
});

// ─── Stage Transition Map ───────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<string, string[]> = {
  APPLIED: ['SCREENED', 'REJECTED', 'WITHDRAWN'],
  SCREENED: ['PHONE_SCREEN', 'ASSESSMENT', 'INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  PHONE_SCREEN: ['ASSESSMENT', 'INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  ASSESSMENT: ['INTERVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW: ['FINAL_REVIEW', 'REJECTED', 'WITHDRAWN'],
  FINAL_REVIEW: ['OFFER', 'REJECTED', 'WITHDRAWN'],
  OFFER: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * POST /candidates
 * Creates a new candidate scoped to the authenticated tenant.
 * If requisitionId is provided, also creates an Application at APPLIED stage.
 * Returns 409 if a candidate with the same email already exists in the tenant.
 */
export async function createCandidate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const data = CreateCandidateSchema.parse(req.body);
    const { requisitionId, ...candidateData } = data;

    // Check for duplicate email within tenant (belt-and-suspenders over the DB unique index)
    const existing = await prisma.candidate.findFirst({
      where: { tenantId, email: candidateData.email },
    });
    if (existing) {
      throw new AppError(
        "CONFLICT",
        "A candidate with this email already exists",
        409,
      );
    }

    const candidate = await prisma.candidate.create({
      data: { ...candidateData, tenantId },
    });

    // Optionally link candidate to a requisition via an Application
    if (requisitionId) {
      await prisma.application.create({
        data: {
          tenantId,
          candidateId: candidate.id,
          requisitionId,
          stage: "APPLIED",
          status: "ACTIVE",
        },
      });
    }

    created(res, candidate);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /candidates/:id
 * Partially updates a candidate. All fields are optional.
 * Returns 404 if the candidate does not belong to the tenant.
 */
export async function updateCandidate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const existing = await prisma.candidate.findFirst({
      where: { id, tenantId } as any
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Candidate not found", 404);
    }

    const data = UpdateCandidateSchema.parse(req.body);

    const updated = await prisma.candidate.update({
      where: { id } as any,
      data,
    });

    ok(res, updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /candidates/:id
 * Soft-deletes (anonymises) a candidate for GDPR compliance.
 * PII fields are overwritten; the record is retained for audit trail purposes.
 * Returns 404 if the candidate does not belong to the tenant.
 */
export async function deleteCandidate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const existing = await prisma.candidate.findFirst({
      where: { id, tenantId } as any
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Candidate not found", 404);
    }

    // GDPR soft-delete: anonymise all PII, keep record for referential integrity
    await prisma.candidate.update({
      where: { id } as any,
      data: {
        isAnonymized: true,
        firstName: "REDACTED",
        lastName: "REDACTED",
        email: `redacted-${id}@deleted.invalid`,
        phone: null,
        location: null,
        country: null,
        summary: null,
        resumeUrl: null,
        linkedinUrl: null,
        portfolioUrl: null,
        tags: [],
      },
    });

    noContent(res);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /candidates/:id/stage
 * Advances (or moves) the pipeline stage of the candidate's most recent active
 * Application. Enforces a state-machine transition map — illegal jumps are rejected.
 * If applicationId is supplied, targets that specific application.
 * Creates an audit trail entry on every successful transition.
 * Returns 404 if no active application is found, 400 if the transition is invalid.
 */
export async function advanceStage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const candidateId = req.params.id as string;

    const { stage, applicationId } = AdvanceStageSchema.parse(req.body);

    // Resolve the application to update
    const application = await prisma.application.findFirst({
      where: {
        tenantId,
        candidateId,
        ...(applicationId ? { id: applicationId } : {}),
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!application) {
      throw new AppError(
        "NOT_FOUND",
        "Active application not found for candidate",
        404,
      );
    }

    // ── Validate transition against the state machine ──
    const currentStage = application.stage;
    const allowedNext = VALID_TRANSITIONS[currentStage] || [];
    if (!allowedNext.includes(stage)) {
      throw new AppError(
        "INVALID_TRANSITION",
        `Cannot transition from ${currentStage} to ${stage}. Allowed: ${allowedNext.join(', ') || 'none (terminal state)'}`,
        400,
      );
    }

    // ── Compute status update for terminal stages ──
    const statusUpdate =
      stage === 'REJECTED' ? { status: 'REJECTED' as const }
      : stage === 'WITHDRAWN' ? { status: 'WITHDRAWN' as const }
      : stage === 'HIRED' ? { status: 'HIRED' as const }
      : {};

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        stage,
        stageUpdatedAt: new Date(),
        ...statusUpdate,
      },
    });

    // ── Audit trail entry ──
    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        action: 'STAGE_TRANSITION',
        resourceType: 'Application',
        resourceId: application.id,
        actorId: (req as any).user?.id || null,
        actorType: 'USER',
        before: { stage: currentStage },
        after: { stage },
        metadata: {
          candidateId,
          requisitionId: application.requisitionId,
          fromStage: currentStage,
          toStage: stage,
        },
      },
    });

    // ── Fire-and-forget notifications ──
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { email: true, firstName: true, lastName: true },
    });
    const requisition = await prisma.requisition.findUnique({
      where: { id: application.requisitionId },
      select: { title: true },
    });
    if (candidate && requisition) {
      notifyStageTransition({
        tenantId,
        candidateId,
        candidateEmail: candidate.email,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        requisitionTitle: requisition.title,
        fromStage: currentStage,
        toStage: stage,
        applicationId: application.id,
      }).catch(() => {}); // fire-and-forget

      // Emit inter-agent event for downstream agent triggers
      emitAgentEvent({
        type: 'stage.changed',
        tenantId,
        candidateId,
        fromStage: currentStage,
        toStage: stage,
        applicationId: application.id,
      }).catch(() => {});
    }

    ok(res, {
      application: updated,
      candidateId,
      transition: { from: currentStage, to: stage },
    });
  } catch (err) {
    next(err);
  }
}
