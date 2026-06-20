/**
 * NATS subscribers that translate domain events into Notifications.
 *
 *   platform.tenant.created             → NEW_TENANT_SIGNUP   (super-admins)
 *   tenant.{*}.plan-change.requested    → PLAN_CHANGE_REQUESTED (super-admins)
 *   tenant.{*}.tenant.plan-changed      → PLAN_CHANGE_APPROVED  (tenant broadcast)
 *   tenant.{*}.bulk-upload.completed    → BULK_UPLOAD_COMPLETED (uploader)
 *   tenant.{*}.interview.feedback.submitted → INTERVIEW_FEEDBACK_NEW (tenant broadcast)
 */
import { subscribeToEvents } from "@cdc-ats/nats-client";
import { z } from "zod";
// Subscribers run cross-tenant in-process (no HTTP request context), so they use
// the default/admin client + an explicit tenantId, like the candidate subscriber.
import { prisma } from "./prisma.js";
import { auditAndDeliver } from "./webhooks.js";
import {
  TenantCreatedPayloadSchema,
  TenantPlanChangedPayloadSchema,
  PlanChangeRequestedPayloadSchema,
  BulkUploadCompletedPayloadSchema,
  FeedbackSubmittedPayloadSchema,
} from "@cdc-ats/contracts";
import { emitNotification } from "./emit.js";
import type { Logger } from "pino";

export async function startNotificationSubscribers(logger: Logger) {
  // ── platform.tenant.created ───────────────────────────────────────────
  await subscribeToEvents({
    stream: "TENANT_EVENTS",
    subject: "platform.tenant.created",
    durable: "notification-service:tenant-created",
    logger,
    handler: async (envelope) => {
      const p = TenantCreatedPayloadSchema.parse(envelope.payload);
      await emitNotification({
        tenantId: null,           // platform-wide → super-admins
        userId: null,
        type: "NEW_TENANT_SIGNUP",
        title: `New tenant signed up: ${p.name}`,
        body: `Plan: ${p.plan}${p.industry ? ` · ${p.industry}` : ""}${p.companySize ? ` · ${p.companySize}` : ""}`,
        link: `/admin?tenant=${p.tenantId}`,
        metadata: { tenantId: p.tenantId, plan: p.plan },
        channels: ["in_app", "email", "slack"],
      });
    },
  });

  // ── tenant.{*}.plan-change.requested ──────────────────────────────────
  await subscribeToEvents({
    stream: "PLAN_CHANGE_EVENTS",
    subject: "tenant.*.plan-change.requested",
    durable: "notification-service:plan-requested",
    logger,
    handler: async (envelope) => {
      const p = PlanChangeRequestedPayloadSchema.parse(envelope.payload);
      await emitNotification({
        tenantId: null,
        userId: null,
        type: "PLAN_CHANGE_REQUESTED",
        title: `${p.tenantName} requested upgrade: ${p.fromPlan} → ${p.toPlan}`,
        body: p.reason ?? undefined,
        link: "/admin/plan-requests",
        metadata: { tenantId: p.tenantId, requestId: p.requestId },
        channels: ["in_app", "email", "slack"],
      });
    },
  });

  // ── tenant.{*}.tenant.plan-changed ────────────────────────────────────
  await subscribeToEvents({
    stream: "TENANT_EVENTS",
    subject: "tenant.*.tenant.plan-changed",
    durable: "notification-service:plan-changed",
    logger,
    handler: async (envelope) => {
      const p = TenantPlanChangedPayloadSchema.parse(envelope.payload);
      // Phase 33a — source flag distinguishes Stripe activation from manual
      // ENTERPRISE/FREE flip. Treated as optional for backward compat with
      // pre-33a payloads.
      const source = (envelope.payload as any).source as string | undefined;
      const isStripeActivation = source === "stripe";

      // Notify the tenant — they see the plan in /billing.
      await emitNotification({
        tenantId: p.tenantId,
        userId: null,                       // broadcast to tenant
        type: "PLAN_CHANGE_APPROVED",
        title: `Plan upgraded to ${p.toPlan}!`,
        body: isStripeActivation
          ? `Payment received — your tenant is now on the ${p.toPlan} plan.`
          : `Your tenant is now on the ${p.toPlan} plan.`,
        link: "/billing",
        metadata: { fromPlan: p.fromPlan, toPlan: p.toPlan, requestId: p.requestId, source: source ?? "manual" },
        channels: ["in_app", "email", "slack"],
      });

      // Phase 33b — also notify super-admins. They approved the request hours
      // or days ago; for Stripe activations this is "the customer actually
      // paid". For manual ENTERPRISE/FREE flips they triggered it themselves
      // — second notification is informational/audit.
      await emitNotification({
        tenantId: null,                     // null + null userId → SUPER_ADMIN broadcast
        userId: null,
        type: "PLAN_CHANGE_APPROVED",
        title: isStripeActivation
          ? `💳 ${p.toPlan} payment received from tenant ${p.tenantId.slice(0, 8)}`
          : `Plan flipped to ${p.toPlan} for tenant ${p.tenantId.slice(0, 8)}`,
        body: `Plan changed from ${p.fromPlan} to ${p.toPlan}${isStripeActivation ? " via Stripe Checkout" : ""}.`,
        link: "/admin/plan-requests",
        metadata: { tenantId: p.tenantId, fromPlan: p.fromPlan, toPlan: p.toPlan, requestId: p.requestId, source: source ?? "manual" },
        channels: ["in_app", "email"],      // skip slack here — too noisy for super-admins
      });
    },
  });

  // ── tenant.{*}.bulk-upload.completed ──────────────────────────────────
  await subscribeToEvents({
    stream: "RESUME_EVENTS",
    subject: "tenant.*.bulk-upload.completed",
    durable: "notification-service:bulk-upload",
    logger,
    handler: async (envelope) => {
      const p = BulkUploadCompletedPayloadSchema.parse(envelope.payload);
      await emitNotification({
        tenantId: p.tenantId,
        userId: p.userId,                   // direct push to uploader
        type: "BULK_UPLOAD_COMPLETED",
        title: `Bulk upload finished: ${p.processedFiles}/${p.totalFiles} parsed`,
        body: p.failedFiles > 0 ? `${p.failedFiles} files failed.` : "All resumes parsed successfully.",
        link: `/candidates?bulkUploadId=${p.bulkUploadId}`,
        metadata: {
          bulkUploadId: p.bulkUploadId, total: p.totalFiles,
          processed: p.processedFiles, failed: p.failedFiles, status: p.status,
        },
        channels: ["in_app", "email"],
      });
      await auditAndDeliver("bulk-upload.completed", p as any, { logger });
    },
  });

  // ── tenant.{*}.interview.feedback.submitted ───────────────────────────
  await subscribeToEvents({
    stream: "INTERVIEW_EVENTS",
    subject: "tenant.*.interview.feedback.submitted",
    durable: "notification-service:interview-feedback",
    logger,
    handler: async (envelope) => {
      const p = FeedbackSubmittedPayloadSchema.parse(envelope.payload);
      await emitNotification({
        tenantId: p.tenantId,
        userId: null,                       // broadcast to tenant
        type: "INTERVIEW_FEEDBACK_NEW",
        title: `New interview feedback submitted`,
        body: `Recommendation: ${p.recommendation}${p.roundNumber ? ` (Round ${p.roundNumber})` : ""}`,
        link: `/interviews/${p.interviewId}`,
        metadata: {
          interviewId: p.interviewId, candidateId: p.candidateId,
          recommendation: p.recommendation, roundNumber: p.roundNumber,
        },
        channels: ["in_app", "slack"],
      });
      await auditAndDeliver("interview.feedback.submitted", p as any, { logger });
    },
  });

  // ── tenant.{*}.interview.scheduled ────────────────────────────────────
  // Phase 38 — the scheduling agent (or manual create) booked an interview.
  // Send the candidate + panel a real invite with the meeting link + ICS.
  await subscribeToEvents({
    stream: "INTERVIEW_EVENTS",
    subject: "tenant.*.interview.scheduled",
    durable: "notification-service:interview-scheduled",
    logger,
    handler: async (envelope) => {
      const p = envelope.payload as any;
      const when = p.scheduledAt ? new Date(p.scheduledAt).toUTCString() : "soon";
      await emitNotification({
        tenantId: p.tenantId,
        userId: null,                       // broadcast to the tenant
        // Reuses SYSTEM type (NotificationType is a DB enum; a dedicated
        // INTERVIEW_SCHEDULED value would need an enum migration). The
        // metadata + title/link carry the full invite context.
        type: "SYSTEM",
        title: "Interview scheduled",
        body: `${when}${p.meetingUrl ? ` · Join: ${p.meetingUrl}` : ""}`,
        link: p.interviewId ? `/interviews/${p.interviewId}` : "/interviews",
        metadata: {
          interviewId: p.interviewId, candidateId: p.candidateId,
          scheduledAt: p.scheduledAt, endAt: p.endAt, meetingUrl: p.meetingUrl,
          attendees: p.attendees ?? [], organizer: p.organizer ?? null,
          ics: p.ics ?? null,               // email channel can attach this
          bookedByAgent: !!p.bookedByAgent,
        },
        channels: ["in_app", "email"],
      });
      await auditAndDeliver("interview.scheduled", p, { logger });
    },
  });

  // Phase 22 — platform.agent.kill-switch.toggled
  // Fires when super-admin flips a kill switch on /admin/platform/agents.
  // Notifies all SUPER_ADMINs via in-app + slack so an incident has a
  // visible audit trail outside the dashboard.
  await subscribeToEvents({
    stream: "PLATFORM_EVENTS",
    subject: "platform.agent.kill-switch.toggled",
    durable: "notification-service:platform-kill-switch",
    logger,
    handler: async (envelope) => {
      const p = envelope.payload as {
        agentType: string;
        disabled: boolean;
        reason: string | null;
        actorUserId: string | null;
        toggledAt: string;
      };
      const verb = p.disabled ? "killed" : "re-enabled";
      const emoji = p.disabled ? ":no_entry:" : ":white_check_mark:";
      await emitNotification({
        tenantId: null,            // platform-wide → super-admins only
        userId: null,
        type: "SYSTEM",
        title: `${emoji} Agent ${verb} platform-wide: ${p.agentType}`,
        body: p.disabled
          ? (p.reason ?? "No reason provided.")
          : "Agent is live again across all tenants.",
        link: "/admin/platform/agents",
        metadata: {
          agentType: p.agentType,
          disabled: p.disabled,
          actorUserId: p.actorUserId,
          toggledAt: p.toggledAt,
        },
        channels: ["in_app", "slack"],
      });
    },
  });

  // ── tenant.{*}.assessment.completed ───────────────────────────────────────
  // WF10/J1 - when an Online Assessment is graded, route it to the EXISTING HITL
  // review queue with NO solely-automated reject (GDPR Art.22 / EU AI Act). We
  // raise a HitlCheckpoint (the same queue the /hitl page reads) whenever the
  // grade needs a human look - open-ended items pending a grade, a low-confidence
  // AI essay grade, OR a marginal numeric result. The checkpoint is a REVIEW
  // request only; it never rejects the candidate. We also notify tenant admins.
  // A clean, comfortably-passing/failing auto-grade does NOT create a checkpoint
  // (no needless queue noise) and STILL takes no adverse action.
  await subscribeToEvents({
    stream: "ASSESSMENT_EVENTS",
    subject: "tenant.*.assessment.completed",
    durable: "notification-service:assessment-completed",
    logger,
    handler: async (envelope) => {
      const p = AssessmentCompletedPayload.parse(envelope.payload);

      // Only enqueue a human review when the grade is actually flagged. needsReview
      // is true for pending open-ended items, low-confidence AI grades, or marginal
      // scores (the grading worker sets it). passed===null is the same signal
      // (verdict held for a human). Either way we route to HITL, never auto-reject.
      const flagged = p.needsReview === true || p.passed === null;
      if (!flagged) {
        await auditAndDeliver("assessment.completed", p as any, { logger });
        return;
      }

      // Idempotency: the durable consumer can redeliver; key the checkpoint to the
      // attempt so a redelivery does not create a duplicate review item.
      const agentRunId = `assessment-completed:${p.attemptId}`;
      const existing = await prisma.hitlCheckpoint.findFirst({
        where: { tenantId: p.tenantId, agentRunId },
        select: { id: true },
      });

      let checkpointId = existing?.id ?? null;
      if (!existing) {
        const checkpoint = await prisma.hitlCheckpoint.create({
          data: {
            tenantId: p.tenantId,
            agentRunId,
            agentType: "oa-grader",
            // low_confidence is the closest existing HITL type for an OA result
            // that needs a human grade/confirmation (the enum is shared across
            // agents). The payload carries the full OA context.
            type: "low_confidence",
            action: "Review assessment result",
            payload: {
              source: "assessment.completed",
              assessmentId: p.assessmentId,
              attemptId: p.attemptId,
              candidateId: p.candidateId,
              applicationId: p.applicationId ?? null,
              score: p.score ?? null,
              // passed is null while the verdict is held for a human (no auto-reject).
              passed: p.passed ?? null,
              needsReview: p.needsReview ?? null,
            } as any,
            slaMinutes: 240,
          },
        });
        checkpointId = checkpoint.id;
      }

      // Notify tenant admins that a result is waiting for review (in-app + slack),
      // exactly like the HITL create route does.
      await emitNotification({
        tenantId: p.tenantId,
        userId: null,
        type: "SYSTEM",
        title: "Assessment result needs review",
        body: "An online assessment was graded and needs a human review. A person makes the final decision.",
        link: checkpointId ? `/hitl?id=${checkpointId}` : "/hitl",
        metadata: {
          hitlId: checkpointId,
          assessmentId: p.assessmentId,
          attemptId: p.attemptId,
          candidateId: p.candidateId,
        },
        channels: ["in_app", "slack"],
      }).catch(() => { /* non-fatal */ });

      await auditAndDeliver("assessment.completed", p as any, { logger });
    },
  });

  logger.info("notification-service NATS subscribers started (7 subjects)");
}

// WF10/J1 - assessment.completed payload (grading worker). passed is null while a
// human review is pending; applicationId may be null for a standalone assessment.
const AssessmentCompletedPayload = z.object({
  tenantId: z.string(),
  assessmentId: z.string(),
  attemptId: z.string(),
  candidateId: z.string(),
  applicationId: z.string().nullable().optional(),
  passed: z.boolean().nullable().optional(),
  score: z.number().nullable().optional(),
  needsReview: z.boolean().optional(),
}).passthrough();
