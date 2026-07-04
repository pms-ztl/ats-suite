/**
 * Postgres Row-Level Security for job-service (tenant isolation backstop).
 * Idempotent. Run as the migration/superuser role:
 *   node --import tsx --env-file=../../.env prisma/apply-rls.ts
 * See apps/candidate-service/prisma/apply-rls.ts for the full rationale.
 *
 * Notes specific to job-service:
 *  - Skill has global (tenantId IS NULL) rows shared by all tenants, so its
 *    policy also admits NULL-tenant rows.
 *  - Outbox is an internal event queue drained cross-tenant by the outbox
 *    worker (admin client) — left WITHOUT RLS on purpose.
 */
import { prisma } from "../src/lib/prisma.js";

const ROLE = "ats_app";
const PASSWORD = process.env["RLS_APP_DB_PASSWORD"] ?? "ats_app_dev_pw";
const STRICT_TABLES = [
  "Requisition",
  "JobPosting",
  "ApplicationFormSchema",
  "AgentRun",
  // WF-E: job-board distribution axis + public-apply idempotency ledger +
  // per-tenant feed token. All carry a tenantId; the request-path routes use the
  // RLS client. Background/feed resolution by token uses prismaAdmin.
  "JobBoardDistribution",
  "ApplicationIdempotency",
  "JobFeedToken",
  // Module A: CDC / college partner. Non-null tenantId; the authenticated
  // colleges.ts CRUD routes use the RLS client (getTenantId + tenant-scoped
  // queries). Only the public /cdc/:token landing resolves cross-tenant by the
  // opaque shareToken and it uses prismaAdmin (like public-by-slug), so it is
  // unaffected by this strict policy.
  "CollegePartner",
];
const NULLABLE_TABLES = ["Skill"]; // tenant rows isolated; NULL-tenant rows are global

const run = (sql: string) => prisma.$executeRawUnsafe(sql);

async function policy(table: string, allowGlobal: boolean) {
  const cond = allowGlobal
    ? `("tenantId" = current_setting('app.current_tenant_id', true) OR "tenantId" IS NULL)`
    : `("tenantId" = current_setting('app.current_tenant_id', true))`;
  await run(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
  await run(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
  await run(`DROP POLICY IF EXISTS tenant_isolation ON "${table}";`);
  await run(`CREATE POLICY tenant_isolation ON "${table}" USING ${cond} WITH CHECK ${cond};`);
}

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
  for (const t of STRICT_TABLES) await policy(t, false);
  for (const t of NULLABLE_TABLES) await policy(t, true);
  console.log(JSON.stringify({ role: ROLE, strict: STRICT_TABLES, withGlobal: NULLABLE_TABLES, status: "rls applied" }));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
