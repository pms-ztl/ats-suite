/**
 * Postgres Row-Level Security for notification-service (tenant isolation backstop).
 * Idempotent. Run as the migration/superuser role:
 *   node --import tsx --env-file=../../.env prisma/apply-rls.ts
 * See apps/candidate-service/prisma/apply-rls.ts for the full rationale.
 *
 * Scope: notification-service is predominantly cross-tenant (platform-wide
 * notifications with NULL tenantId, provider webhooks, the delivery worker and
 * NATS subscribers). RLS is applied to the tables served by the pure per-tenant
 * routers (hitl, email-templates, integrations, webhooks), which opt into the
 * RLS client (prismaRls). The nullable-tenant Notification/NotificationDelivery
 * tables and the super-admin support/compliance paths stay on the admin client.
 */
import { prisma } from "../src/lib/prisma.js";

const ROLE = "ats_app";
const PASSWORD = process.env["RLS_APP_DB_PASSWORD"] ?? "ats_app_dev_pw";
const TENANT_TABLES = ["HitlCheckpoint", "EmailTemplate", "TenantIntegration", "Webhook", "Conversation", "ConversationParticipant", "Message"];

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
