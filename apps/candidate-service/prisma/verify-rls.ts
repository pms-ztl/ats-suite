// Verifies RLS isolation. Superuser (postgres) sees all tenants; ats_app sees
// only the tenant in app.current_tenant_id, and nothing without it.
import { prisma } from "../src/lib/prisma.js";
import { PrismaClient } from "../src/generated/prisma/index.js";

const PW = process.env["RLS_APP_DB_PASSWORD"] ?? "ats_app_dev_pw";
const superUrl = process.env["CANDIDATE_DATABASE_URL"]!;
// swap the user:pass in the URL for ats_app
const appUrl = superUrl.replace(/\/\/[^:]+:[^@]+@/, `//ats_app:${PW}@`);
const app = new PrismaClient({ datasources: { db: { url: appUrl } } });

async function countAs(tenantId: string | null): Promise<number> {
  return app.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true)`, tenantId ?? "");
    return tx.candidate.count();
  });
}

async function main() {
  // superuser view (bypasses RLS) — ground truth per tenant
  const groups = await prisma.$queryRawUnsafe<Array<{ tenantId: string; n: bigint }>>(
    `SELECT "tenantId", count(*)::int AS n FROM "Candidate" GROUP BY "tenantId" ORDER BY n DESC`,
  );
  console.log("SUPERUSER groups:", groups.map((g) => `${g.tenantId.slice(0, 8)}=${g.n}`).join(", "));
  const total = groups.reduce((s, g) => s + Number(g.n), 0);
  console.log("SUPERUSER total =", total);

  const t0 = groups[0]?.tenantId;
  const t1 = groups[1]?.tenantId;
  if (t0) console.log(`ats_app context=${t0.slice(0, 8)} -> count =`, await countAs(t0), `(expected ${groups[0].n})`);
  if (t1) console.log(`ats_app context=${t1.slice(0, 8)} -> count =`, await countAs(t1), `(expected ${groups[1].n})`);
  console.log("ats_app NO context           -> count =", await countAs(null), "(expected 0)");

  // cross-tenant read attempt: try to fetch a t1 candidate while in t0 context
  if (t0 && t1) {
    const victim = await prisma.candidate.findFirst({ where: { tenantId: t1 }, select: { id: true } });
    if (victim) {
      const leaked = await app.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', $1, true)`, t0);
        return tx.candidate.findUnique({ where: { id: victim.id } });
      });
      console.log(`cross-tenant read of ${t1.slice(0, 8)} candidate while in ${t0.slice(0, 8)} ->`, leaked ? "LEAKED!" : "blocked (null)");
    }
  }
}

main().then(async () => { await app.$disconnect(); process.exit(0); }).catch(async (e) => { console.error(e); await app.$disconnect().catch(() => {}); process.exit(1); });
