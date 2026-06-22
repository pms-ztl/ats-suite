/**
 * Module E - shared offer-approve logic.
 *
 * Factored out of routes/offers.ts so BOTH the explicit Offers "Approve" button
 * and the one-click Hire flow run the SAME approve body: render the offer-letter
 * PDF (storing its key only when object storage is configured, never fabricated),
 * mark the offer APPROVED + approvedBy, and publish offer.approved so
 * notification-service emails the CANDIDATE with the letter reference.
 *
 * Tenant-scoped via explicit where:{tenantId}; cross-service requisition context
 * is best-effort (all-null on failure).
 */
import { Errors } from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./prisma.js";
import { maybeUploadOfferLetter } from "./offer-letter.js";
import { resolveRequisitionContext, publishOfferApproved } from "./decision-events.js";

/**
 * Approve an existing Offer: render its letter PDF, set status APPROVED, and
 * publish offer.approved. Idempotent-friendly: re-running keeps the existing
 * offerLetterKey when storage already produced one. Returns the updated Offer.
 *
 * Throws Errors.notFound when the offer does not exist in the tenant.
 */
export async function approveOfferInternal(
  offerId: string,
  tenantId: string,
  userId: string | null,
  role: string,
  logger: Logger,
) {
  const existing = await prisma.offer.findFirst({ where: { id: offerId, tenantId } });
  if (!existing) throw Errors.notFound("Offer");

  const candidate = await prisma.candidate.findFirst({
    where: { id: existing.candidateId, tenantId },
    select: { firstName: true, lastName: true, email: true },
  });

  // Resolve the job title from the requisition (best-effort, cross-service).
  const ctx = await resolveRequisitionContext({ requisitionId: existing.requisitionId, tenantId, userId, role });

  // Render the offer-letter PDF. Upload + key only when storage is wired up;
  // otherwise offerLetterKey stays null (honest empty, see offer-letter.ts).
  let offerLetterKey: string | null = existing.offerLetterKey ?? null;
  if (candidate) {
    const result = await maybeUploadOfferLetter(
      {
        offer: {
          id: existing.id,
          baseSalary: existing.baseSalary,
          currency: existing.currency,
          bonusPercent: existing.bonusPercent,
          equity: existing.equity,
          startDate: existing.startDate,
          expiresAt: existing.expiresAt,
        },
        candidate,
        jobTitle: ctx.title,
      },
      logger,
    );
    offerLetterKey = result.offerLetterKey;
  } else {
    logger.warn({ offerId, candidateId: existing.candidateId }, "candidate not found, offer letter not rendered");
  }

  const offer = await prisma.offer.update({
    where: { id: offerId },
    data: { status: "APPROVED", approvedBy: userId, offerLetterKey },
  });

  const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}`.trim() : null;
  await publishOfferApproved(
    {
      tenantId,
      offerId: offer.id,
      applicationId: offer.applicationId ?? null,
      candidateId: offer.candidateId,
      candidateName: candidateName || null,
      candidateEmail: candidate?.email ?? null,
      jobTitle: ctx.title,
      offerLetterKey,
      approvedByUserId: userId,
    },
    logger,
  );

  return offer;
}
