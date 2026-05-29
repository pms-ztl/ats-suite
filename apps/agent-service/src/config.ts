/** Centralized, typed configuration — the single place env is read. */
export const config = {
  serviceName: "agent-service",
  port: Number(process.env["PORT"] ?? 4011),
} as const;
