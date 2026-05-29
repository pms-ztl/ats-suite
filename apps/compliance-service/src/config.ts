/** Centralized, typed configuration — the single place env is read. */
export const config = {
  serviceName: "compliance-service",
  port: Number(process.env["PORT"] ?? 4013),
  defaultRetention: {
    candidateDays: Number(process.env["RETENTION_CANDIDATE_DAYS"] ?? 365),
    auditDays: Number(process.env["RETENTION_AUDIT_DAYS"] ?? 2555), // ~7 years
  },
} as const;
