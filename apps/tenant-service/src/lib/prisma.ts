import { PrismaClient } from "../generated/prisma/index.js";
import { rlsExtend } from "@cdc-ats/common";

const logLevels = (process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"]) as ("warn" | "error")[];
const globalFor = globalThis as unknown as { prisma?: PrismaClient; prismaRls?: unknown };

// Default client. tenant-service is mostly cross-tenant (the registry served
// by-id to super-admin / the register saga / internal callers, and the
// super-admin plan-change routes), so the default stays the standard/admin
// connection.
export const prisma: PrismaClient =
  globalFor.prisma ?? new PrismaClient({ log: logLevels });

// RLS client, opt-in for the per-tenant self-service routers (branding,
// onboarding) that read/update the caller's OWN Tenant row. With
// TENANT_APP_DATABASE_URL pointing at the non-superuser ats_app role the Tenant
// "id"-keyed policy applies; unset → falls back to the default client.
const appUrl = process.env["TENANT_APP_DATABASE_URL"];
export const prismaRls = (globalFor.prismaRls
  ?? (appUrl ? rlsExtend(new PrismaClient({ log: logLevels, datasources: { db: { url: appUrl } } })) : prisma)) as PrismaClient;

if (process.env["NODE_ENV"] !== "production") {
  globalFor.prisma = prisma;
  globalFor.prismaRls = prismaRls;
}
