import { PrismaClient } from "../generated/prisma/index.js";
import { rlsExtend } from "@cdc-ats/common";

const logLevels = (process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"]) as ("warn" | "error")[];
const globalFor = globalThis as unknown as { prismaAdmin?: PrismaClient; prisma?: unknown };

// Trusted system client (migrations + the background screening worker, which
// runs outside any HTTP request and scopes by the job's tenantId explicitly).
// Superuser → not subject to RLS. Never use for user request paths.
export const prismaAdmin: PrismaClient =
  globalFor.prismaAdmin ?? new PrismaClient({ log: logLevels });

// Request-path client. With SCREENING_APP_DATABASE_URL pointing at the non-
// superuser ats_app role, RLS policies apply and the extension stamps the
// per-request tenant onto the DB session. Unset → falls back to admin (inert).
const appUrl = process.env["SCREENING_APP_DATABASE_URL"];
export const prisma = (globalFor.prisma
  ?? (appUrl ? rlsExtend(new PrismaClient({ log: logLevels, datasources: { db: { url: appUrl } } })) : prismaAdmin)) as PrismaClient;

if (process.env["NODE_ENV"] !== "production") {
  globalFor.prismaAdmin = prismaAdmin;
  globalFor.prisma = prisma;
}
