import { PrismaClient } from "../generated/prisma/index.js";
import { rlsExtend } from "@cdc-ats/common";

const logLevels = (process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"]) as ("warn" | "error")[];
const globalFor = globalThis as unknown as { prismaAdmin?: PrismaClient; prisma?: unknown };

// Trusted system / cross-tenant client (migrations, the outbox worker, the
// SUPER_ADMIN platform-stats rollup, the unauthenticated /public by-slug
// lookups, and GDPR erase). Superuser → not subject to RLS. Never use it for a
// normal tenant request path.
export const prismaAdmin: PrismaClient =
  globalFor.prismaAdmin ?? new PrismaClient({ log: logLevels });

// Request-path client. With JOB_APP_DATABASE_URL pointing at the non-superuser
// ats_app role, RLS policies apply and the extension stamps the per-request
// tenant onto the DB session. Unset → falls back to admin (RLS inert).
const appUrl = process.env["JOB_APP_DATABASE_URL"];
export const prisma = (globalFor.prisma
  ?? (appUrl ? rlsExtend(new PrismaClient({ log: logLevels, datasources: { db: { url: appUrl } } })) : prismaAdmin)) as PrismaClient;

if (process.env["NODE_ENV"] !== "production") {
  globalFor.prismaAdmin = prismaAdmin;
  globalFor.prisma = prisma;
}
