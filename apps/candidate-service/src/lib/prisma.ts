import { PrismaClient } from "../generated/prisma/index.js";
import { getCurrentTenantId } from "@cdc-ats/common";

const logLevels = (process.env["NODE_ENV"] === "development" ? ["warn", "error"] : ["error"]) as ("warn" | "error")[];
const globalFor = globalThis as unknown as { prismaAdmin?: PrismaClient; prisma?: unknown };

/**
 * Trusted system client — connects with the migration/superuser credential
 * (CANDIDATE_DATABASE_URL) and is NOT subject to RLS. Used by migrations and by
 * background jobs that legitimately span tenants (the retention-purge tick
 * discovers tenants across the whole table; NATS subscribers and the GDPR purge
 * operate with an explicit tenant filter). Never use it for user request paths.
 */
export const prismaAdmin: PrismaClient =
  globalFor.prismaAdmin ?? new PrismaClient({ log: logLevels });

/**
 * Request-path client. When CANDIDATE_APP_DATABASE_URL points at the non-
 * superuser `ats_app` role, Postgres RLS policies apply and this extension
 * stamps the current request's tenant (from the async-local context) onto the DB
 * session via set_config('app.current_tenant_id'), so a query that forgets its
 * tenant filter still returns only the caller's rows (fail closed). When the env
 * var is unset it falls back to the admin client and RLS is inert — identical to
 * the previous behavior, so environments that have not provisioned the role yet
 * keep working.
 */
const appUrl = process.env["CANDIDATE_APP_DATABASE_URL"];

function makeRlsClient(url: string) {
  const base = new PrismaClient({ log: logLevels, datasources: { db: { url } } });
  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const tid = getCurrentTenantId();
          if (!tid) return query(args);
          const [, result] = await base.$transaction([
            base.$executeRaw`SELECT set_config('app.current_tenant_id', ${tid}, true)`,
            query(args),
          ]);
          return result;
        },
      },
    },
  });
}

export const prisma = (globalFor.prisma ?? (appUrl ? makeRlsClient(appUrl) : prismaAdmin)) as PrismaClient;

if (process.env["NODE_ENV"] !== "production") {
  globalFor.prismaAdmin = prismaAdmin;
  globalFor.prisma = prisma;
}
