/**
 * Postgres Row-Level Security for tenant-service (PARTIAL — Tenant table only).
 * Idempotent. Run as the migration/superuser role:
 *   node --import tsx --env-file=../../.env prisma/apply-rls.ts
 *
 * tenant-service is mostly cross-tenant: tenants.ts serves the registry BY ID to
 * super-admin / the register-company saga / internal callers (zero getTenantId),
 * and plan-changes.ts is super-admin + a $transaction. RLS is OPT-IN (prismaRls)
 * on only the per-tenant self-service routers (branding + onboarding), which
 * read/update the caller's OWN Tenant row. The Tenant policy keys on "id" (the
 * tenant id IS the row id) so those handlers can only touch the caller's tenant.
 */
import { prisma } from "../src/lib/prisma.js";

const ROLE = "ats_app";
const PASSWORD = process.env["RLS_APP_DB_PASSWORD"] ?? "ats_app_dev_pw";

const run = (sql: string) => prisma.$executeRawUnsafe(sql);

async function main() {
  await run(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${ROLE}') THEN
      CREATE ROLE ${ROLE} LOGIN PASSWORD '${PASSWORD}';
    END IF;
  END $$;`);
  await run(`GRANT USAGE ON SCHEMA public TO ${ROLE};`);
  await run(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${ROLE};`);
  await run(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${ROLE};`);
  await run(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${ROLE};`);
  await run(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${ROLE};`);

  // Tenant policy keys on "id" (the row IS the tenant), not a tenantId column.
  await run(`ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;`);
  await run(`ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;`);
  await run(`DROP POLICY IF EXISTS tenant_isolation ON "Tenant";`);
  await run(`CREATE POLICY tenant_isolation ON "Tenant"
    USING ("id" = current_setting('app.current_tenant_id', true))
    WITH CHECK ("id" = current_setting('app.current_tenant_id', true));`);

  console.log(JSON.stringify({ role: ROLE, tables: ["Tenant (id-keyed)"], status: "rls applied" }));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
