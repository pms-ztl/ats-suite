/**
 * NATS event publishing for assessment-service.
 *
 * Re-exports the shared @cdc-ats/nats-client publish/subscribe helpers + the
 * tenant-scoped subject builder, so later slices (invite-sent, attempt-submitted,
 * result-graded events) import event plumbing from one place instead of reaching
 * into the package directly. The connection itself is established once in
 * index.ts via connectNats() (screening-service idiom).
 *
 * Subject convention: tenant.{tenantId}.assessment.{event}
 *   - assessment.invited     (invite sent to a candidate)
 *   - assessment.started     (candidate opened/started an attempt)
 *   - assessment.submitted   (attempt submitted)
 *   - assessment.graded      (result produced — interview/HITL services consume)
 */
import { publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject } from "@cdc-ats/contracts";

export { publishEvent, tenantSubject };

/** Build a tenant-scoped assessment subject: tenant.{tenantId}.assessment.{event} */
export function assessmentSubject(tenantId: string, event: string): string {
  return tenantSubject(tenantId, "assessment", event);
}
