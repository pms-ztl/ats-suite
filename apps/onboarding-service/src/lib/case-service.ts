import { randomBytes } from "node:crypto";
import { prismaAdmin } from "./prisma.js";
import { buildSeed } from "./case-seed.js";

export interface OpenCaseInput {
  tenantId: string;
  candidateId: string;
  applicationId?: string | null;
  offerId?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  jobTitle?: string | null;
  startDate?: Date | null;
}

/**
 * Open (or return the existing) onboarding case for a hired candidate. Idempotent
 * per (tenantId, candidateId): a duplicate offer.accepted / application.hired
 * event re-uses the open case instead of creating a second one. Seeds the default
 * task checklist + the PAN/bank verification rows. Uses the admin client (called
 * from a NATS subscriber that has no request tenant context).
 */
export async function openCase(input: OpenCaseInput) {
  const existing = await prismaAdmin.onboardingCase.findFirst({
    where: { tenantId: input.tenantId, candidateId: input.candidateId, status: { not: "CANCELLED" } },
    include: { tasks: true, documents: true, verifications: true },
  });
  if (existing) return { created: false, case: existing };

  const seed = buildSeed(input.tenantId);
  const created = await prismaAdmin.onboardingCase.create({
    data: {
      tenantId: input.tenantId,
      candidateId: input.candidateId,
      applicationId: input.applicationId ?? null,
      offerId: input.offerId ?? null,
      candidateName: input.candidateName ?? null,
      candidateEmail: input.candidateEmail ?? null,
      jobTitle: input.jobTitle ?? null,
      status: "PENDING",
      portalToken: randomBytes(20).toString("base64url"),
      startDate: input.startDate ?? null,
      tasks: { create: seed.tasks },
      verifications: { create: seed.verifications },
    },
    include: { tasks: true, documents: true, verifications: true },
  });
  return { created: true, case: created };
}

/** Recompute + persist the case status from its tasks/verifications. */
export async function recomputeStatus(caseId: string): Promise<void> {
  const c = await prismaAdmin.onboardingCase.findUnique({
    where: { id: caseId },
    include: { tasks: true, verifications: true },
  });
  if (!c) return;
  const requiredTasks = c.tasks.filter((t) => t.required);
  const allTasksDone = requiredTasks.every((t) => t.status === "DONE" || t.status === "WAIVED");
  const anyFailed = c.verifications.some((v) => v.status === "FAILED");
  const allVerified = c.verifications.every((v) => v.status === "VERIFIED" || v.status === "NOT_STARTED");
  const anyActivity =
    c.tasks.some((t) => t.status !== "TODO") || c.verifications.some((v) => v.status !== "NOT_STARTED");

  let status: "PENDING" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" = "PENDING";
  if (anyFailed) status = "BLOCKED";
  else if (allTasksDone && allVerified && c.verifications.every((v) => v.status === "VERIFIED")) status = "COMPLETED";
  else if (anyActivity) status = "IN_PROGRESS";

  if (status !== c.status) {
    await prismaAdmin.onboardingCase.update({ where: { id: caseId }, data: { status } });
  }
}
