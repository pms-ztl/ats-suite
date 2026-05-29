/** Centralized, typed configuration — the single place env is read. */
export const config = {
  serviceName: "search-service",
  port: Number(process.env["PORT"] ?? 4010),
  /** Max documents scanned per query before ranking (guards memory). */
  scanLimit: Number(process.env["SEARCH_SCAN_LIMIT"] ?? 5000),
} as const;
