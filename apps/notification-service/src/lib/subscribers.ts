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
      await emitNotification({
        tenantId: p.tenantId,
        userId: null,                       // broadcast to tenant
        type: "PLAN_CHANGE_APPROVED",
        title: `Plan upgraded to ${p.toPlan}!`,
        body: `Your tenant is now on the ${p.toPlan} plan.`,
        link: "/billing",
        metadata: { fromPlan: p.fromPlan, toPlan: p.toPlan, requestId: p.requestId },
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
      });
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
      });
    },
  });

  logger.info("notification-service NATS subscribers started (5 subjects)");
}
