import { createLogger } from "@cdc-ats/common";

// Shared service logger. Re-exported so route/worker modules import a single
// configured instance instead of re-calling createLogger everywhere.
export const logger = createLogger({ serviceName: "assessment-service" });
