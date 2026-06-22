/**
 * Jetstream definitions — central place that declares every persistent
 * stream the platform uses. Ensure call on service startup (idempotent).
 */
import { JetStreamManager, RetentionPolicy, DiscardPolicy, StorageType } from "nats";
import { getNats } from "./connection.js";

export interface StreamSpec {
  name: string;
  subjects: string[];
  description?: string;
  retentionDays?: number;
  maxBytes?: number;
}

/**
 * The core streams. Adding a new event domain? Append here + redeploy.
 *
 * Subject pattern: `tenant.{tenantId}.{domain}.{event}` and `platform.{...}`
 */
export const CORE_STREAMS: StreamSpec[] = [
  {
    name: "TENANT_EVENTS",
    subjects: ["platform.tenant.>", "tenant.*.tenant.>"],
    description: "Tenant lifecycle: created, plan-changed, suspended",
    retentionDays: 30,
  },
  {
    name: "USER_EVENTS",
    subjects: ["tenant.*.user.>"],
    description: "User invited / deactivated",
    retentionDays: 30,
  },
  {
    name: "PLAN_CHANGE_EVENTS",
    subjects: ["tenant.*.plan-change.>", "platform.plan-change.>"],
    description: "Plan upgrade request submitted/approved/rejected",
    retentionDays: 90,
  },
  {
    name: "RESUME_EVENTS",
    subjects: ["tenant.*.resume.>", "tenant.*.bulk-upload.>"],
    description: "Resume parsed, bulk upload completed",
    retentionDays: 14,
  },
  {
    name: "SCREENING_EVENTS",
    subjects: ["tenant.*.screening.>"],
    description: "Screening completed",
    retentionDays: 14,
  },
  {
    name: "ASSESSMENT_EVENTS",
    subjects: ["tenant.*.assessment.>"],
    description: "Online assessment lifecycle: invited, started, submitted, completed (graded)",
    retentionDays: 30,
  },
  {
    name: "INTERVIEW_EVENTS",
    subjects: ["tenant.*.interview.>"],
    description: "Interview scheduled, feedback submitted",
    retentionDays: 30,
  },
  {
    // Module E — hire/approve/offer/reject lifecycle. notification-service sends
    // the candidate + stakeholder comms; onboarding-service opens a case on
    // offer.accepted / application.hired.
    name: "CANDIDATE_EVENTS",
    subjects: ["tenant.*.application.>", "tenant.*.offer.>"],
    description: "Application hired/rejected, offer approved/accepted",
    retentionDays: 90,
  },
  {
    // Module F — onboarding case lifecycle (opened, task completed, completed).
    name: "ONBOARDING_EVENTS",
    subjects: ["tenant.*.onboarding.>"],
    description: "Onboarding case opened, task completed, case completed",
    retentionDays: 90,
  },
  {
    name: "AGENT_EVENTS",
    subjects: ["tenant.*.agent.>"],
    description: "Agent run completed (cost + outcome) — billing-service consumes",
    retentionDays: 90,
  },
  {
    name: "PLATFORM_EVENTS",
    subjects: ["platform.agent.>", "platform.prompt.>"],
    description: "Platform-wide super-admin actions (kill switch toggled, prompt override saved)",
    retentionDays: 365,
  },
];

/** Create/update all streams. Idempotent — safe to call multiple times. */
export async function ensureStreams(specs: StreamSpec[] = CORE_STREAMS): Promise<void> {
  const nats = getNats();
  const jsm: JetStreamManager = await nats.jetstreamManager();
  for (const spec of specs) {
    try {
      await jsm.streams.info(spec.name);
      // Stream exists — update subjects in case they changed
      await jsm.streams.update(spec.name, {
        subjects: spec.subjects,
        description: spec.description,
        max_age: (spec.retentionDays ?? 14) * 24 * 60 * 60 * 1_000_000_000, // nanoseconds
        max_bytes: spec.maxBytes ?? -1,
      });
    } catch {
      // Stream doesn't exist — create it
      await jsm.streams.add({
        name: spec.name,
        subjects: spec.subjects,
        description: spec.description,
        retention: RetentionPolicy.Limits,
        discard: DiscardPolicy.Old,
        storage: StorageType.File,
        max_age: (spec.retentionDays ?? 14) * 24 * 60 * 60 * 1_000_000_000,
        max_bytes: spec.maxBytes ?? -1,
        num_replicas: 1, // local dev; production = 3
      });
    }
  }
}
