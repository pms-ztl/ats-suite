/**
 * Postgres Row-Level Security for identity-service (PARTIAL — User table only).
 * Idempotent. Run as the migration/superuser role:
 *   node --import tsx --env-file=../../.env prisma/apply-rls.ts
 *
 * identity is an auth service: most paths are cross-tenant by design
 * (verify-credentials/login looks users up by email pre-context, the register
 * saga and DELETE run before a JWT exists, SUPER_ADMIN lists span tenants, the
 * invite uses a $transaction). So RLS is OPT-IN (prismaRls) on only the pure
 * per-tenant user-management handlers (assignable list, role change, deactivate);
 * everything else keeps the admin client. The User policy still gives those
 * handlers a DB-level backstop against a forgotten tenantId filter.
 */
import { prisma } from "../src/lib/prisma.js";

const ROLE = "ats_app";
const PASSWORD = process.env["RLS_APP_DB_PASSWORD"] ?? "ats_app_dev_pw";
const TENANT_TABLES = ["User"];

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
  for (const t of TENANT_TABLES) {
    await run(`ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY;`);
    await run(`ALTER TABLE "${t}" FORCE ROW LEVEL SECURITY;`);
    await run(`DROP POLICY IF EXISTS tenant_isolation ON "${t}";`);
    await run(`CREATE POLICY tenant_isolation ON "${t}"
      USING ("tenantId" = current_setting('app.current_tenant_id', true))
      WITH CHECK ("tenantId" = current_setting('app.current_tenant_id', true));`);
  }
  console.log(JSON.stringify({ role: ROLE, tables: TENANT_TABLES, status: "rls applied" }));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
