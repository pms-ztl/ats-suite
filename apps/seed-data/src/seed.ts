/**
 * Seed-data script — drives the full stack via gateway APIs to populate
 * the system with realistic demo data.
 *
 * Idempotent: detects the marker tenant ("Pinnacle Tech") and skips if
 * already present. Pass --reset to delete + re-create (DESTRUCTIVE).
 * Pass --full to also run real AI agents (costs ~$0.10 OpenRouter).
 *
 *   npm run seed --workspace=@cdc-ats/seed-data
 *   npm run seed:full --workspace=@cdc-ats/seed-data
 *
 * What it creates:
 *   - 3 demo tenants (Pinnacle Tech, Apex Manufacturing, Wavelength Studios)
 *   - 8 users across tenants (1 admin + 1-3 staff each)
 *   - 12 requisitions spread across statuses
 *   - 50 candidates (realistic names + skills)
 *   - 80 applications across pipeline stages
 *   - Optional: 3-5 real Claude agent runs to populate the AI Ops dashboard
 */

const API = process.env["API_URL"] ?? "http://localhost:4000/api";
const FULL = process.argv.includes("--full");
const RESET = process.argv.includes("--reset");

// ── HTTP helper ──────────────────────────────────────────────────────────────
async function api<T = any>(
  method: string,
  path: string,
  opts: { token?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });
  const text = await res.text();
  let body: any = {};
  try { body = JSON.parse(text); } catch { /* leave empty */ }
  if (!res.ok || body?.success === false) {
    throw new Error(
      `${method} ${path} → ${res.status}: ${body?.error?.message ?? text.slice(0, 200)}`,
    );
  }
  return (body?.data ?? body) as T;
}

// ── Data tables ──────────────────────────────────────────────────────────────
// WF10 / J4 - `tier` marks which demo tenants stay paid (ENTERPRISE) vs which one
// is held at FREE as the gating control. seed.sh reads NOTHING from this array;
// it keys the plan-upgrade + entitlement steps off the tenant NAME (idempotent
// SQL), so this field is purely documentation of the intended end state:
//   - "enterprise" tenants are upgraded to ENTERPRISE by seed.sh, and Pinnacle
//     (the canonical demo tenant) additionally gets the new modules turned ON via
//     REAL TenantModule rows + a tenant-default dashboard + theme.
//   - the single "free" tenant is LEFT at FREE so a reviewer can prove the
//     module/plan gates still 402 (enable a PROFESSIONAL/ENTERPRISE module) and
//     404/empty (no oa-assessments surface) for an unentitled tenant.
const TENANTS = [
  {
    orgName: "Pinnacle Tech",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya@pinnacle.demo",
    password: "PinnacleDemo123!",
    requisitionCount: 6,
    candidateCount: 30,
    tier: "enterprise" as const,
  },
  {
    orgName: "Apex Manufacturing",
    firstName: "Alex",
    lastName: "Mendez",
    email: "alex@apex.demo",
    password: "ApexDemo123!",
    requisitionCount: 4,
    candidateCount: 15,
    tier: "enterprise" as const,
  },
  {
    orgName: "Wavelength Studios",
    firstName: "Wren",
    lastName: "Yamamoto",
    email: "wren@wavelength.demo",
    password: "WavelengthDemo123!",
    requisitionCount: 2,
    candidateCount: 5,
    tier: "enterprise" as const,
  },
  // WF10 / J4 - the FREE gating-control tenant. Created like any other tenant,
  // given a little real data so its dashboards render honestly, but DELIBERATELY
  // left on the FREE plan (seed.sh excludes it from the ENTERPRISE upgrade) and
  // given NO TenantModule overrides. The new modules (oa-assessments,
  // custom-dashboards, white-label-embed) therefore resolve OFF for it, which is
  // exactly what proves the gates still bite: enabling such a module 402s, and
  // the assessment/embed surfaces 404 / empty. Do not "upgrade" this tenant.
  {
    orgName: "Northwind Staffing",
    firstName: "Nora",
    lastName: "Webb",
    email: "nora@northwind.demo",
    password: "NorthwindDemo123!",
    requisitionCount: 2,
    candidateCount: 5,
    tier: "free" as const,
  },
];

const REQ_TEMPLATES = [
  { title: "Senior Backend Engineer", department: "Engineering", level: "Senior", skills: ["Go", "Postgres", "Kubernetes", "Distributed systems"], salary: [180000, 240000] },
  { title: "Staff ML Engineer", department: "Applied AI", level: "Staff", skills: ["PyTorch", "MLOps", "Distributed training", "Python"], salary: [220000, 300000] },
  { title: "Product Manager — Growth", department: "Product", level: "Senior", skills: ["A/B testing", "SQL", "Analytics", "User research"], salary: [150000, 200000] },
  { title: "Senior Designer", department: "Design", level: "Senior", skills: ["Figma", "Design systems", "Prototyping"], salary: [140000, 190000] },
  { title: "DevOps Engineer", department: "Platform", level: "Mid", skills: ["Terraform", "AWS", "Kubernetes", "Observability"], salary: [140000, 190000] },
  { title: "Customer Success Manager", department: "Success", level: "Senior", skills: ["B2B SaaS", "Account management", "Renewals"], salary: [120000, 160000] },
  { title: "Account Executive — Enterprise", department: "Sales", level: "Senior", skills: ["Enterprise sales", "MEDDIC", "B2B"], salary: [160000, 220000] },
  { title: "Marketing Director", department: "Marketing", level: "Director", skills: ["Demand gen", "Content", "Brand"], salary: [180000, 250000] },
];

const FIRST_NAMES = [
  "Aarav", "Amara", "Ana", "Anish", "Asha", "Ben", "Bianca", "Carmen", "Chen", "Diego",
  "Elena", "Emeka", "Fatima", "Gabriel", "Hana", "Ibrahim", "Ines", "Jamal", "Kai", "Liana",
  "Maya", "Niko", "Olu", "Priya", "Quinn", "Ravi", "Sana", "Tomas", "Uma", "Vikram",
  "Wei", "Xochitl", "Yusuf", "Zara",
];
const LAST_NAMES = [
  "Aamir", "Bauer", "Chen", "Diallo", "Estrada", "Foster", "Garcia", "Huang", "Ibekwe",
  "Jensen", "Kumar", "Lopez", "Mwangi", "Nakamura", "Okafor", "Patel", "Quinn", "Reyes",
  "Singh", "Tanaka", "Ueda", "Vega", "Williams", "Xu", "Yamamoto", "Zhao",
];

const SKILL_BANK = [
  "Python", "TypeScript", "Go", "Rust", "Java", "React", "Node.js", "PostgreSQL", "MongoDB",
  "Kubernetes", "Docker", "Terraform", "AWS", "GCP", "PyTorch", "TensorFlow", "scikit-learn",
  "Distributed systems", "Microservices", "gRPC", "GraphQL", "Redis", "Kafka", "Prometheus",
  "Grafana", "Figma", "Sketch", "SQL", "Snowflake", "dbt", "Airflow", "Spark",
];

const STAGES = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER"];

// Deterministic but varied pseudo-random — using a seed so re-runs produce
// the same data shape (helps verify idempotency).
let _rngState = 42;
function rand(): number {
  _rngState = (_rngState * 9301 + 49297) % 233280;
  return _rngState / 233280;
}
function pick<T>(arr: readonly T[]): T { return arr[Math.floor(rand() * arr.length)]!; }
function sample<T>(arr: readonly T[], n: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  while (out.length < n && used.size < arr.length) {
    const i = Math.floor(rand() * arr.length);
    if (!used.has(i)) { used.add(i); out.push(arr[i]!); }
  }
  return out;
}

// ── Phase 35 — org-hierarchy staff (1 hiring manager + 2 recruiters per
// tenant). Idempotent: create-or-skip by email. Each staff user is created
// ACTIVE with a known password (loginable) and attached to a manager via
// managerId, so the 3-level tree (admin -> manager -> recruiter) is real and
// the "add beneath me" flow has live people to demo against. Runs for both
// freshly-created AND already-seeded tenants. ──
async function seedStaff(t: typeof TENANTS[number]): Promise<void> {
  let login: any;
  try {
    login = await api("POST", "/auth/login", { body: { email: t.email, password: t.password } });
  } catch {
    console.log(`  ! staff: could not log in as admin — skipping hierarchy`);
    return;
  }
  const token: string | undefined = login?.token;
  const adminId: string | undefined = login?.user?.id;
  const tenantId: string | undefined = login?.user?.tenantId;
  if (!token || !adminId || !tenantId) {
    console.log(`  ! staff: missing admin context — skipping hierarchy`);
    return;
  }
  const domain = t.email.split("@")[1] ?? "demo";

  // Create the user, or recover its id if it already exists (idempotent re-run).
  async function ensureUser(
    email: string, firstName: string, lastName: string,
    role: string, password: string, managerId: string,
  ): Promise<string | undefined> {
    try {
      const u = await api<{ id: string }>("POST", "/users", {
        token,
        body: { tenantId, email, firstName, lastName, role, password, managerId },
      });
      return u.id;
    } catch {
      try {
        const list = await api<any>("GET", "/users", { token });
        const arr: any[] = Array.isArray(list) ? list : list?.users ?? [];
        const found = arr.find((x) => String(x.email ?? "").toLowerCase() === email.toLowerCase());
        return found?.id;
      } catch {
        return undefined;
      }
    }
  }

  // Level 3: one hiring manager reporting to the tenant admin.
  const hmId = await ensureUser(`manager@${domain}`, "Maya", "Chen", "HIRING_MANAGER", "ManagerDemo123!", adminId);
  // Level 4: two recruiters reporting to the hiring manager.
  if (hmId) {
    await ensureUser(`sam@${domain}`, "Sam", "Rivera", "RECRUITER", "RecruiterDemo123!", hmId);
    await ensureUser(`nina@${domain}`, "Nina", "Park", "RECRUITER", "RecruiterDemo123!", hmId);
    console.log(`  ✓ hierarchy: admin -> Maya Chen (manager) -> Sam Rivera, Nina Park`);
  } else {
    console.log(`  ! staff: hiring manager not created — recruiters skipped`);
  }
}

// ── Per-tenant seeding ───────────────────────────────────────────────────────
async function seedTenant(t: typeof TENANTS[number]): Promise<void> {
  console.log(`\n━━━ ${t.orgName} ━━━`);

  // 1. Idempotency guard. We CANNOT rely on register-company throwing on a
  //    duplicate org: email uniqueness is PER-TENANT by design, so the API
  //    happily creates a second "Pinnacle Tech" with its own admin every run.
  //    (That is exactly how this seed once spawned 10 duplicate tenants.)
  //    So probe with a LOGIN first — if it succeeds the tenant is already
  //    seeded and we skip it entirely: no duplicate tenant, no extra reqs.
  let token: string;
  let existing = false;
  try {
    await api<{ token: string }>("POST", "/auth/login", {
      body: { email: t.email, password: t.password },
    });
    existing = true;
    console.log(`  ↻ tenant already exists — refreshing org hierarchy only (idempotent)`);
  } catch {
    // Tenant does not exist yet — create it below.
  }
  if (existing) {
    // Phase 35 — even for an already-seeded tenant, make sure the manager +
    // recruiters exist, then skip the heavy requisition/candidate data.
    await seedStaff(t);
    return;
  }
  try {
    const reg = await api<{ token: string }>("POST", "/auth/register-company", {
      body: {
        orgName: t.orgName,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        password: t.password,
      },
    });
    token = reg.token;
    console.log(`  ✓ tenant created`);
  } catch (err) {
    console.log(`  ! tenant creation failed: ${(err as Error).message.slice(0, 100)}`);
    return;
  }

  // Phase 35 — seed the org hierarchy for the freshly-created tenant.
  await seedStaff(t);

  // 2. Requisitions
  const reqIds: string[] = [];
  const reqTemplates = sample(REQ_TEMPLATES, t.requisitionCount);
  for (const tpl of reqTemplates) {
    try {
      const req = await api<{ id: string }>("POST", "/requisitions", {
        token,
        body: {
          title: tpl.title,
          department: tpl.department,
          location: pick(["Remote", "Hybrid (NYC)", "Hybrid (SF)", "On-site"]),
          requirements: tpl.skills,
          salaryMin: tpl.salary[0],
          salaryMax: tpl.salary[1],
          status: "OPEN",
        },
      });
      reqIds.push(req.id);
    } catch (err) {
      console.log(`  ! requisition "${tpl.title}" failed: ${(err as Error).message.slice(0, 80)}`);
    }
  }
  console.log(`  ✓ ${reqIds.length} requisitions`);

  // 3. Candidates
  const candidateIds: string[] = [];
  for (let i = 0; i < t.candidateCount; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const skills = sample(SKILL_BANK, 4 + Math.floor(rand() * 4));
    try {
      const c = await api<{ id: string }>("POST", "/candidates", {
        token,
        body: {
          email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
          firstName: first,
          lastName: last,
          phone: `+1${String(1000000000 + Math.floor(rand() * 9000000000)).slice(0, 10)}`,
          location: pick(["San Francisco, CA", "New York, NY", "Austin, TX", "Remote", "Berlin, DE", "London, UK"]),
          source: pick(["LinkedIn", "Referral", "Job board", "Company website", "Recruiter outreach"]),
          tags: skills,
        },
      });
      candidateIds.push(c.id);
    } catch (err) {
      // Likely duplicate email (re-run) — skip silently
    }
  }
  console.log(`  ✓ ${candidateIds.length} candidates`);

  // 4. Applications spread across stages
  if (reqIds.length > 0 && candidateIds.length > 0) {
    const appCount = Math.min(candidateIds.length, Math.floor(candidateIds.length * 1.6));
    let created = 0;
    for (let i = 0; i < appCount; i++) {
      const candidateId = candidateIds[i % candidateIds.length]!;
      const requisitionId = pick(reqIds);
      const stage = pick(STAGES);
      try {
        await api("POST", "/applications", {
          token,
          body: { candidateId, requisitionId, stage, status: "ACTIVE" },
        });
        created++;
      } catch {
        // Duplicate or stage transition issue — skip
      }
    }
    console.log(`  ✓ ${created} applications`);
  }

  // 5. Real AI runs (only with --full flag, costs $$)
  if (FULL && reqIds.length > 0) {
    try {
      const r = await api<{ costUsd: number; agentRunId: string }>(
        "POST",
        "/jd-author",
        {
          token,
          body: {
            title: reqTemplates[0]!.title,
            department: reqTemplates[0]!.department,
            skills: reqTemplates[0]!.skills,
            level: reqTemplates[0]!.level,
            location: "Remote (Global)",
            salaryRange: `$${reqTemplates[0]!.salary[0]}-$${reqTemplates[0]!.salary[1]}`,
          },
        },
      );
      console.log(`  ✓ jd-author agent ran — $${r.costUsd}`);
    } catch (err) {
      console.log(`  ! jd-author failed: ${(err as Error).message.slice(0, 80)}`);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Gateway: ${API}`);
  console.log(`Mode: ${FULL ? "FULL (with real agent runs)" : "basic (data only)"}`);

  // Quick health check
  try {
    await fetch(`${API.replace(/\/api$/, "")}/healthz`);
  } catch {
    console.error(`✗ Gateway not reachable at ${API} — start the stack with 'npm run dev'`);
    process.exit(1);
  }

  if (RESET) {
    console.log(`\n⚠️  --reset flag: NOT IMPLEMENTED — manually drop the demo tenants via super-admin if you need a clean slate.`);
    process.exit(0);
  }

  let totalCandidates = 0;
  let totalReqs = 0;
  for (const t of TENANTS) {
    try {
      await seedTenant(t);
      totalCandidates += t.candidateCount;
      totalReqs += t.requisitionCount;
    } catch (err) {
      console.error(`\n✗ ${t.orgName} failed: ${(err as Error).message}`);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ Seed complete`);
  console.log(`  ${TENANTS.length} tenants · ~${totalReqs} requisitions · ~${totalCandidates} candidates`);
  console.log(`\n  Login as any seeded admin (or their hiring manager):`);
  for (const t of TENANTS) {
    const domain = t.email.split("@")[1];
    const tierNote = t.tier === "free" ? "  (Tenant Admin - FREE gating control)" : "  (Tenant Admin)";
    console.log(`    ${t.email}  password: ${t.password}${tierNote}`);
    console.log(`    manager@${domain}  password: ManagerDemo123!  (Hiring Manager)`);
  }
  console.log(`\n  Plan/entitlements are applied by infra/seed.sh AFTER this script:`);
  console.log(`    - Pinnacle/Apex/Wavelength -> ENTERPRISE`);
  console.log(`    - Pinnacle additionally gets oa-assessments + custom-dashboards +`);
  console.log(`      white-label-embed turned ON (real TenantModule rows) + a tenant`);
  console.log(`      dashboard + theme + embed origin.`);
  console.log(`    - Northwind Staffing stays FREE (proves gating still 402/404s).`);
  console.log(`\n  Visit dashboard: http://localhost:3000/`);
  console.log(`  Visit AI Ops: http://localhost:3001/d/cdc-ats-ai-ops`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
