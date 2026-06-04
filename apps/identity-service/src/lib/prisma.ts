import { PrismaClient } from "../generated/prisma/index.js";
import { rlsExtend } from "@cdc-ats/common";

const logLevels = (process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"]) as ("warn" | "error")[];
const globalFor = globalThis as unknown as { prisma?: PrismaClient; prismaRls?: unknown };

// Default client. identity is an auth service whose paths are mostly
// cross-tenant / pre-context (login, register saga, SUPER_ADMIN, invite
// $transaction), so the default stays the standard/admin connection.
export const prisma: PrismaClient =
  globalFor.prisma ?? new PrismaClient({ log: logLevels });

// RLS client, opt-in for the pure per-tenant user-management handlers only.
// With IDENTITY_APP_DATABASE_URL pointing at the non-superuser ats_app role the
// User policy applies; unset → falls back to the default client.
const appUrl = process.env["IDENTITY_APP_DATABASE_URL"];
export const prismaRls = (globalFor.prismaRls
  ?? (appUrl ? rlsExtend(new PrismaClient({ log: logLevels, datasources: { db: { url: appUrl } } })) : prisma)) as PrismaClient;

if (process.env["NODE_ENV"] !== "production") {
  globalFor.prisma = prisma;
  globalFor.prismaRls = prismaRls;
}
