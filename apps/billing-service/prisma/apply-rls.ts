/**
 * Postgres Row-Level Security for billing-service (tenant isolation backstop).
 * Idempotent. Run as the migration/superuser role:
 *   node --import tsx --env-file=../../.env prisma/apply-rls.ts
 * See apps/candidate-service/prisma/apply-rls.ts for the full rationale.
 *
 * RLS'd: the tenant-scoped tables read on request paths. Left un-RLS'd:
 * StripeWebhookEvent (nullable tenant, written by the no-tenant webhook),
 * PlatformAgentKillSwitch / PlatformKillAudit / PromptOverride (platform-wide,
 * no tenantId). The NATS subscribers, the SUPER_ADMIN platform routes and the
 * Stripe webhook use the admin (non-RLS) client.
 */
import { prisma } from "../src/lib/prisma.js";

const ROLE = "ats_app";
const PASSWORD = process.env["RLS_APP_DB_PASSWORD"] ?? "ats_app_dev_pw";
const TENANT_TABLES = ["TenantPlanCache", "AgentKillSwitch", "AgentRunCost", "FeatureFlag", "StripeSubscription"];

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
