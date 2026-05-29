/** Centralized, typed configuration — the single place env is read. */
export const config = {
  serviceName: "analytics-service",
  port: Number(process.env["PORT"] ?? 4012),
} as const;
