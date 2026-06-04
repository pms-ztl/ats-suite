import { PrismaClient } from "../generated/prisma/index.js";
import { rlsExtend } from "@cdc-ats/common";

const logLevels = (process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"]) as ("warn" | "error")[];
const globalFor = globalThis as unknown as { prisma?: PrismaClient; prismaRls?: unknown };

// Default client. notification-service is predominantly cross-tenant (platform
// notifications with NULL tenantId, the delivery worker, NATS subscribers and
// provider webhooks), so the default stays the standard/admin connection. RLS is
// opt-in: only the pure per-tenant routers import prismaRls below.
export const prisma: PrismaClient =
  globalFor.prisma ?? new PrismaClient({ log: logLevels });

// RLS client for the per-tenant routers (hitl, email-templates, integrations,
// webhooks). With NOTIFICATION_APP_DATABASE_URL pointing at the non-superuser
// ats_app role, the extension stamps the request tenant onto the DB session so
// those tables are tenant-isolated. Unset → falls back to the default client.
const appUrl = process.env["NOTIFICATION_APP_DATABASE_URL"];
export const prismaRls = (globalFor.prismaRls
  ?? (appUrl ? rlsExtend(new PrismaClient({ log: logLevels, datasources: { db: { url: appUrl } } })) : prisma)) as PrismaClient;

if (process.env["NODE_ENV"] !== "production") {
  globalFor.prisma = prisma;
  globalFor.prismaRls = prismaRls;
}
