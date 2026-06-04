import { PrismaClient } from "../generated/prisma/index.js";
import { rlsExtend } from "@cdc-ats/common";

const logLevels = (process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"]) as ("warn" | "error")[];
const globalFor = globalThis as unknown as { prismaAdmin?: PrismaClient; prisma?: unknown };

// Trusted system / cross-tenant client (migrations, the NATS subscribers that
// mirror plans + costs across tenants, the SUPER_ADMIN platform routes, and the
// Stripe webhook which derives its tenant from the event). Superuser → not
// subject to RLS. Never use it for a normal tenant request path.
export const prismaAdmin: PrismaClient =
  globalFor.prismaAdmin ?? new PrismaClient({ log: logLevels });

// Request-path client (billing.ts: check-agent, agents list/toggle, usage,
// resume-quota — all with a tenant in context). With BILLING_APP_DATABASE_URL
// pointing at the non-superuser ats_app role, RLS scopes these to the caller's
// tenant. Unset → falls back to admin (RLS inert).
const appUrl = process.env["BILLING_APP_DATABASE_URL"];
export const prisma = (globalFor.prisma
  ?? (appUrl ? rlsExtend(new PrismaClient({ log: logLevels, datasources: { db: { url: appUrl } } })) : prismaAdmin)) as PrismaClient;

if (process.env["NODE_ENV"] !== "production") {
  globalFor.prismaAdmin = prismaAdmin;
  globalFor.prisma = prisma;
}
