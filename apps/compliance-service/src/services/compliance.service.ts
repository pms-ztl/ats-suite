/** Compliance/audit logic — append-only audit store + screening-audit pull. */
import { Errors } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { fetchScreeningAudit } from "../lib/service-client.js";
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
