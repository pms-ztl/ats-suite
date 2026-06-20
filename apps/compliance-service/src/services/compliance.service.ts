/** Compliance/audit logic — append-only audit store + screening-audit pull. */
import { Errors } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import {
  fetchScreeningAudit,
  fetchAssessmentExport,
  eraseAssessmentData,
} from "../lib/service-client.js";
import { config } from "../config.js";
import type { LogInput } from "../schemas/compliance.schemas.js";

export async function log(tenantId: string, actorUserId: string, b: LogInput) {
  const rec = await prisma.auditRecord.create({
    data: {
      tenantId, actorUserId, kind: b.kind, subjectType: b.subjectType,
      subjectId: b.subjectId, summary: b.summary, payload: b.payload as any,
    },
  });
  return { logged: true, id: rec.id, createdAt: rec.createdAt };
}

export async function list(tenantId: string, kind?: string) {
  const where: { tenantId: string; kind?: string } = { tenantId };
  if (kind) where.kind = kind;
  return prisma.auditRecord.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
}

export async function forSubject(tenantId: string, subjectId: string) {
  return prisma.auditRecord.findMany({ where: { tenantId, subjectId }, orderBy: { createdAt: "desc" } });
}

export async function retentionPolicy(tenantId: string) {
  const policy = await prisma.retentionPolicy.findUnique({ where: { tenantId } });
  return policy ?? { tenantId, ...config.defaultRetention, default: true };
}

/**
 * WF10/J1 - the OA leg of a candidate data-subject request (DSR). compliance is
 * the system of record for the request; it calls assessment-service so the DSR
 * export ALSO covers the Online Assessment rows
 * (Attempt/Answer/AssessmentResult/ProctorEvent/Invite) keyed by candidateId, and
 * writes an append-only audit record of the access. assessment-service strips the
 * answer key + hidden test cases from the export (the subject gets their data, not
 * the grading key). Returns the OA bundle (null section if assessment-service is
 * unreachable, so a single outage degrades gracefully rather than failing the DSR).
 */
export async function dsrAssessmentExport(tenantId: string, actorUserId: string, candidateId: string) {
  const oa = await fetchAssessmentExport(candidateId, tenantId, actorUserId);
  await prisma.auditRecord.create({
    data: {
      tenantId,
      actorUserId,
      kind: "DSR_EXPORT",
      subjectType: "candidate",
      subjectId: candidateId,
      summary: oa
        ? `DSR export: OA data assembled (${oa?.counts?.attempts ?? 0} attempts, ${oa?.counts?.invites ?? 0} invites)`
        : "DSR export: assessment-service unreachable, OA section omitted (partial export)",
      payload: { gdprArticle: "Article 15 + Article 20", service: "assessment", reachable: oa != null } as any,
    },
  });
  return {
    candidateId,
    gdprArticle: "Article 15 (access) + Article 20 (portability)",
    assessment: oa,
    _partial: { assessment: oa != null },
  };
}

/**
 * WF10/J1 - the OA leg of a candidate erasure (Article 17). compliance calls
 * assessment-service to delete/anonymize the candidate's OA rows and audits the
 * erasure. NO solely-automated adverse action is taken here; this only removes
 * the data subject's data on request.
 */
export async function dsrAssessmentErase(tenantId: string, actorUserId: string, candidateId: string) {
  const result = await eraseAssessmentData(candidateId, tenantId, actorUserId);
  await prisma.auditRecord.create({
    data: {
      tenantId,
      actorUserId,
      kind: "DSR_ERASURE",
      subjectType: "candidate",
      subjectId: candidateId,
      summary: result
        ? "DSR erasure: OA rows erased/anonymized (answers, proctoring, results deleted; attempts + invites anonymized)"
        : "DSR erasure: assessment-service unreachable, OA rows NOT erased (manual follow-up required)",
      payload: { gdprArticle: "Article 17", service: "assessment", erased: result ?? null } as any,
    },
  });
  return {
    candidateId,
    gdprArticle: "Article 17 (right to erasure)",
    assessment: result ? "erased" : "failed-or-skipped",
    detail: result,
  };
}

export async function biasAudit(tenantId: string, actorUserId: string, requisitionId: string) {
  const audit = await fetchScreeningAudit(requisitionId, tenantId);
  if (!audit) {
    throw Errors.notFound("Screening audit for requisition (screening-service unreachable or no screenings)");
  }
  const rec = await prisma.auditRecord.create({
    data: {
      tenantId, actorUserId, kind: "BIAS_AUDIT", subjectType: "requisition", subjectId: requisitionId,
      summary: `Adverse-impact / decision-distribution audit: ${audit.total ?? 0} screenings, pass rate ${audit.passRate ?? 0}`,
      payload: audit as any,
    },
  });
  return { auditRecordId: rec.id, audit };
}
