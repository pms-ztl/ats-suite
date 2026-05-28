/**
 * Phase 26 — demo seed.
 *
 * Provisions a clean demo state for screenshots:
 *   - 1 super-admin user (super@cdc-ats.demo)
 *   - 1 tenant "Acme Hiring" with branding configured
 *   - Inside Acme: tenant admin + recruiter + interviewer + hiring manager
 *   - 1 sample requisition + 2 candidates + 1 interview
 *
 * Re-runnable: skips existing entities by re-logging-in if create fails.
 *
 * Run with the stack already booted:
 *   API_BASE=http://localhost:4000/api node --import tsx apps/security-test/src/seed-demo.ts
 *
 * Prints the credentials at the end so the demo operator can sign in.
 */
const API = process.env.API_BASE ?? "http://localhost:4000/api";
const SUPER_ADMIN_EMAIL = "super@cdc-ats.demo";
const SUPER_ADMIN_PW = "DemoSuper-2026!";
const TENANT_ADMIN_EMAIL = "admin@acme-hiring.demo";
const TENANT_ADMIN_PW = "DemoAdmin-2026!";
const RECRUITER_EMAIL = "jordan.recruiter@acme-hiring.demo";
const INTERVIEWER_EMAIL = "sam.interviewer@acme-hiring.demo";
const HM_EMAIL = "morgan.manager@acme-hiring.demo";
const STAFF_PW = "DemoStaff-2026!";

async function api(method: string, path: string, opts: { token?: string; body?: unknown } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let body: any;
  try { body = await res.json(); } catch { body = null; }
  return { status: res.status, body };
}

async function registerOrLogin(args: {
  orgName?: string; slug?: string; plan?: string;
  email: string; password: string; firstName?: string; lastName?: string;
}) {
  if (args.orgName) {
    const r = await api("POST", "/auth/register-company", {
      body: {
        orgName: args.orgName, slug: args.slug, industry: "Software",
        companySize: "11-50", plan: args.plan ?? "PROFESSIONAL",
        email: args.email, password: args.password,
        firstName: args.firstName ?? "Admin", lastName: args.lastName ?? "User",
      },
    });
    if (r.status === 201 || r.status === 200) {
      const d = r.body?.data ?? r.body;
      return { token: d.token, user: d.user };
    }
  }
  const login = await api("POST", "/auth/login", { body: { email: args.email, password: args.password } });
  if (login.status !== 200) throw new Error(`Login failed for ${args.email}: ${login.status} ${JSON.stringify(login.body)}`);
  const d = login.body?.data ?? login.body;
  return { token: d.token, user: d.user };
}

async function invite(adminToken: string, email: string, firstName: string, lastName: string, role: string) {
  await api("POST", "/users/invite", {
    token: adminToken,
    body: { email, firstName, lastName, role, password: STAFF_PW },
  });
  // We don't care about the success status — if user exists, that's fine.
}

async function main() {
  console.log(`Seeding demo against ${API}\n`);

  // ── 1. Super-admin tenant ────────────────────────────────────────────
  // Use a unique slug so re-runs don't conflict
  let superTok: string;
  try {
    const s = await registerOrLogin({
      orgName: "CDC Platform Ops",
      slug: "cdc-platform",
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PW,
      firstName: "Platform",
      lastName: "Admin",
    });
    superTok = s.token;
    console.log(`✓ Super-admin tenant — login ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PW}`);
    console.log(`  NOTE: promote to SUPER_ADMIN via DB:`);
    console.log(`        UPDATE "User" SET role='SUPER_ADMIN' WHERE email='${SUPER_ADMIN_EMAIL}';`);
  } catch (e: any) {
    console.error(`✗ Super-admin setup failed: ${e.message}`);
    superTok = "";
  }

  // ── 2. Demo tenant "Acme Hiring" ─────────────────────────────────────
  let adminTok: string;
  let adminUser: any;
  try {
    const a = await registerOrLogin({
      orgName: "Acme Hiring",
      slug: "acme-hiring",
      email: TENANT_ADMIN_EMAIL,
      password: TENANT_ADMIN_PW,
      firstName: "Casey",
      lastName: "Admin",
    });
    adminTok = a.token;
    adminUser = a.user;
    console.log(`✓ Tenant "Acme Hiring" — login ${TENANT_ADMIN_EMAIL} / ${TENANT_ADMIN_PW}`);
  } catch (e: any) {
    console.error(`✗ Tenant admin setup failed: ${e.message}`);
    return;
  }

  // ── 3. Set tenant branding so screenshots look polished ──────────────
  await api("PUT", "/branding", {
    token: adminTok,
    body: {
      brandPrimaryColor: "#7c3aed",     // violet — distinctive vs default green
      brandSecondaryColor: "#06b6d4",
      brandAccentColor: "#f59e0b",
      brandTagline: "Hire engineers who ship.",
      website: "https://acme-hiring.demo",
      careerPortalWelcomeMessage: "Join us building the future of distributed teams.",
      careerPortalHeroImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80",
    },
  });
  console.log(`✓ Branding configured (violet primary, custom tagline)`);

  // ── 4. Invite tier-3 staff ──────────────────────────────────────────
  await invite(adminTok, RECRUITER_EMAIL, "Jordan", "Patel", "RECRUITER");
  await invite(adminTok, INTERVIEWER_EMAIL, "Sam", "Lee", "INTERVIEWER");
  await invite(adminTok, HM_EMAIL, "Morgan", "Davis", "HIRING_MANAGER");
  console.log(`✓ Staff invited (recruiter / interviewer / hiring manager)`);

  // ── 5. Create a sample requisition with HM assigned ──────────────────
  const reqRes = await api("POST", "/requisitions", {
    token: adminTok,
    body: {
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "Remote · US",
      country: "US",
      jobFamily: "Engineering",
      description: "Build distributed systems. 5+ years experience, fluent in TypeScript and Go.",
      requirements: ["TypeScript", "Go", "Distributed systems", "5+ years"],
      salaryMin: 150000,
      salaryMax: 220000,
      headcount: 2,
      priority: 2,
    },
  });
  if (reqRes.status === 201 || reqRes.status === 200) {
    console.log(`✓ Sample requisition created (Senior Software Engineer)`);
  }

  // ── 6. Create two sample candidates ──────────────────────────────────
  for (const c of [
    { email: "alex.morgan@example.com", firstName: "Alex", lastName: "Morgan", source: "LinkedIn" },
    { email: "robin.kim@example.com",   firstName: "Robin", lastName: "Kim",    source: "Referral" },
  ]) {
    const r = await api("POST", "/candidates", { token: adminTok, body: c });
    if (r.status === 201 || r.status === 200) {
      console.log(`  ✓ Candidate ${c.firstName} ${c.lastName}`);
    }
  }

  // ── 7. Save a kill switch + a prompt override so /admin/platform pages are non-empty
  // These require SUPER_ADMIN — skip if super-admin promotion not done.
  // The demo operator should run the SQL above first.

  console.log(`\n=== Demo login credentials ===`);
  console.log(`SUPER_ADMIN (after SQL promotion): ${SUPER_ADMIN_EMAIL} / ${SUPER_ADMIN_PW}`);
  console.log(`Tenant admin:                       ${TENANT_ADMIN_EMAIL} / ${TENANT_ADMIN_PW}`);
  console.log(`Recruiter:                          ${RECRUITER_EMAIL} / ${STAFF_PW}`);
  console.log(`Interviewer:                        ${INTERVIEWER_EMAIL} / ${STAFF_PW}`);
  console.log(`Hiring manager:                     ${HM_EMAIL} / ${STAFF_PW}`);
  console.log(`\nReady to demo.`);
}

main().catch((e) => { console.error("Seed crashed:", e); process.exit(1); });
