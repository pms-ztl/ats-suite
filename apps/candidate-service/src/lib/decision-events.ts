/**
 * Module E — shared helpers for the hire / approve / offer / reject decision
 * flow: resolve cross-service requisition context (title + stakeholders) and
 * publish the lifecycle events that notification-service / onboarding-service
 * subscribe to.
 *
 * Publishing mirrors the interview-service pattern (publishEvent + tenantSubject
 * from @cdc-ats/contracts, standard envelope built by publishEvent). We do NOT
 * `.parse()` the contract schema before publishing because some ids in this
 * service are cuids (Application.id) while the contract types annotate them as
 * uuid — the type already constrains the shape; a strict runtime parse would
 * reject otherwise-valid cuids. Subscribers parse defensively on receipt.
 */
import { publishEvent } from "@cdc-ats/nats-client";
import {
  tenantSubject,
  type ApplicationHiredPayload,
  type ApplicationRejectedPayload,
  type OfferApprovedPayload,
  type OfferAcceptedPayload,
} from "@cdc-ats/contracts";
import type { Logger } from "pino";

/** Best-effort requisition context resolved from job-service over HTTP. */
export interface RequisitionContext {
  title: string | null;
  hiringManagerId: string | null;
  recruiterId: string | null;
}

/**
 * Fetch the requisition from job-service for title + stakeholder user ids.
 * Cross-service + best-effort: any failure yields all-null context (honest
 * empty) so the decision flow never blocks on job-service being reachable.
 */
export async function resolveRequisitionContext(opts: {
  requisitionId: string;
  tenantId: string;
  userId: string | null;
  role: string;
}): Promise<RequisitionContext> {
  const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
  try {
    const res = await fetch(`${jobUrl}/internal/requisitions/${opts.requisitionId}`, {
      headers: {
        "X-User-Id": opts.userId ?? "",
        "X-Tenant-Id": opts.tenantId,
        "X-User-Role": opts.role || "ADMIN",
      },
    });
    if (!res.ok) return { title: null, hiringManagerId: null, recruiterId: null };
    const body = (await res.json()) as { data?: Record<string, unknown> };
    const r = body.data ?? {};
    return {
      title: typeof r["title"] === "string" ? (r["title"] as string) : null,
      hiringManagerId: typeof r["hiringManagerId"] === "string" ? (r["hiringManagerId"] as string) : null,
      recruiterId: typeof r["recruiterId"] === "string" ? (r["recruiterId"] as string) : null,
    };
  } catch {
    return { title: null, hiringManagerId: null, recruiterId: null };
  }
}

/** Dedup + drop nulls — stakeholder ids for a hire notification. */
export function stakeholderIds(ctx: RequisitionContext): string[] {
  return Array.from(new Set([ctx.hiringManagerId, ctx.recruiterId].filter((x): x is string => !!x)));
}

export async function publishApplicationHired(payload: ApplicationHiredPayload, logger: Logger): Promise<void> {
  await publishEvent({
    subject: tenantSubject(payload.tenantId, "application", "hired"),
    type: "application.hired",
    tenantId: payload.tenantId,
    payload,
  }).catch((err) => logger.warn({ err, applicationId: payload.applicationId }, "application.hired publish failed"));
}

export async function publishApplicationRejected(payload: ApplicationRejectedPayload, logger: Logger): Promise<void> {
  await publishEvent({
    subject: tenantSubject(payload.tenantId, "application", "rejected"),
    type: "application.rejected",
    tenantId: payload.tenantId,
    payload,
  }).catch((err) => logger.warn({ err, applicationId: payload.applicationId }, "application.rejected publish failed"));
}

export async function publishOfferApproved(payload: OfferApprovedPayload, logger: Logger): Promise<void> {
  await publishEvent({
    subject: tenantSubject(payload.tenantId, "offer", "approved"),
    type: "offer.approved",
    tenantId: payload.tenantId,
    payload,
  }).catch((err) => logger.warn({ err, offerId: payload.offerId }, "offer.approved publish failed"));
}

export async function publishOfferAccepted(payload: OfferAcceptedPayload, logger: Logger): Promise<void> {
  await publishEvent({
    subject: tenantSubject(payload.tenantId, "offer", "accepted"),
    type: "offer.accepted",
    tenantId: payload.tenantId,
    payload,
  }).catch((err) => logger.warn({ err, offerId: payload.offerId }, "offer.accepted publish failed"));
}

// ── Rejection reason codes ────────────────────────────────────────────────
// The candidate-facing reason must be a stable LABEL, never raw recruiter notes.
// Callers send a reason CODE; we map it to a courteous label. Unknown/absent
// codes fall back to a neutral default (never echo free text to the candidate).
const REJECTION_REASON_LABELS: Record<string, string> = {
  POSITION_FILLED: "The position has been filled",
  NOT_A_FIT: "Not the right fit at this time",
  EXPERIENCE_MISMATCH: "Experience did not match the role requirements",
  SKILLS_MISMATCH: "Skills did not match the role requirements",
  COMPENSATION_MISALIGNMENT: "Compensation expectations were not aligned",
  WITHDRAWN_BY_CANDIDATE: "Application withdrawn",
  ROLE_CLOSED: "The role is no longer open",
  OTHER: "We have decided to move forward with other candidates",
};

export function rejectionReasonLabel(code: string | null | undefined): string {
  if (!code) return REJECTION_REASON_LABELS["OTHER"]!;
  return REJECTION_REASON_LABELS[code] ?? REJECTION_REASON_LABELS["OTHER"]!;
}
