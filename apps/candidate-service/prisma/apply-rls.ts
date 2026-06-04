/**
 * Postgres Row-Level Security for candidate-service (tenant isolation backstop).
 *
 * Idempotent. Run as the DB owner/superuser (the migration role):
 *   node --import tsx --env-file=../../.env prisma/apply-rls.ts
 *
 * What it does:
 *  1. Ensures a NON-superuser runtime role `ats_app` exists (superusers bypass
 *     RLS, so the app must connect as a non-superuser for policies to apply).
 *  2. Grants it CRUD on current + future tables/sequences.
 *  3. Enables + FORCEs RLS on every tenant-scoped table and installs a policy
 *     that only exposes rows whose "tenantId" equals the per-request session var
 *     `app.current_tenant_id` (set by the Prisma RLS extension). With no var set,
 *     current_setting(..., true) is NULL and zero rows are visible — fail closed.
 *
 * After running this, point CANDIDATE_DATABASE_URL at the ats_app role so the
 * runtime is actually subject to the policies (dev: password below; prod: set
 * RLS_APP_DB_PASSWORD and manage the role/credential via your secrets store).
 */
import { prisma } from "../src/lib/prisma.js";

const ROLE = "ats_app";
const PASSWORD = process.env["RLS_APP_DB_PASSWORD"] ?? "ats_app_dev_pw";
const TENANT_TABLES = ["Candidate", "Application", "ApplicationAttachment", "CandidateNote"];

async function run(sql: string) {
  await prisma.$executeRawUnsafe(sql);
}

async function main() {
  // 1. Non-superuser runtime role (idempotent).
  await run(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${ROLE}') THEN
      CREATE ROLE ${ROLE} LOGIN PASSWORD '${PASSWORD}';
    END IF;
  END $$;`);

  // 2. Grants (existing + future objects created by the migration role).
  await run(`GRANT USAGE ON SCHEMA public TO ${ROLE};`);
  await run(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${ROLE};`);
  await run(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${ROLE};`);
  await run(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${ROLE};`);
  await run(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${ROLE};`);

  // 3. RLS + per-table tenant policy.
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
