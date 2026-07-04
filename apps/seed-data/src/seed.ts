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
 *   - 5 demo tenants (Pinnacle Tech, Apex Manufacturing, Wavelength Studios,
 *     Northwind Staffing [FREE gating control], NCR Voyix [client-branded])
 *   - users across tenants (1 admin + a 3-level hierarchy each)
 *   - requisitions spread across statuses
 *   - candidates (realistic names + skills)
 *   - applications across pipeline stages
 *   - NCR Voyix: brand palette (via PUT /api/branding), a "Software Engineer II"
 *     technical requisition with an eligibility rule + an inert HackerRank OA
 *     step, and (with seed.sh) the oa-assessments module ON so the HackerRank +
 *     HackerEarth integration cards show as "Not connected" ready for NCR's keys.
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
  // NCR Voyix - the client's own branded demo tenant. Retail + restaurant
  // commerce technology (NYSE: VYX; Atlanta HQ). This tenant showcases the
  // client's real stack: it is ENTERPRISE-tier (all features on), carries the
  // NCR Voyix brand palette (below), and is pre-wired for the two online-
  // assessment vendors NCR actually uses (HackerRank + HackerEarth).
  //
  // branding: applied idempotently by seedBranding() via PUT /api/branding after
  //   the admin logs in. brandPrimaryColor is NCR Voyix purple; the shell brand
  //   ramp (cd-shell.tsx buildThemeCss/legacyBrandHex) re-skins the whole logged-
  //   in app from this hex. NCR Voyix does NOT publish an exact secondary/accent
  //   in a public brand kit, so those are on-brand choices derived from the
  //   purple + their black wordmark, NOT a claim of pixel-exact brand values.
  //
  // technicalReq: seedTechnicalRequisition() creates a real "Software Engineer II"
  //   requisition with an eligibility rule + an honest HackerRank-OA-step note in
  //   customFields, so the demo shows the technical-hiring flow shape. The OA step
  //   is INERT until NCR pastes its own HackerRank key on Settings -> Integrations
  //   (no fake keys, no fake "connected", no fabricated score).
  {
    orgName: "NCR Voyix",
    firstName: "Dana",
    lastName: "Okafor",
    email: "admin@ncrvoyix.demo",
    password: "NcrVoyixDemo123!",
    requisitionCount: 4,
    candidateCount: 12,
    tier: "enterprise" as const,
    // ENTERPRISE at creation so every feature works immediately. seed.sh Phase 2
    // ALSO upgrades every non-FREE-control tenant to ENTERPRISE + syncs the
    // billing TenantPlanCache, so this is belt-and-braces (both paths agree).
    plan: "ENTERPRISE" as const,
    branding: {
      // NCR Voyix purple. Sourced from brandcolorcode.com/ncr-voyix (their public
      // brand-color reference), which itself notes the values are the closest match
      // to NCR Voyix's brand codes rather than an official spec. On-brand, not a
      // claim of exactness.
      brandPrimaryColor: "#5f249f",
      // Deep violet-ink secondary derived from the primary (a darker shade of the
      // same hue) for chrome/surfaces. On-brand derivative, not an official token.
      brandSecondaryColor: "#3d1766",
      // Accent kept in the same violet family so the AI-accent ramp reads on brand.
      brandAccentColor: "#7c3aed",
      brandTagline: "Run your restaurant and retail teams on one platform.",
      website: "https://www.ncrvoyix.com",
      // Dark chrome by default so the purple ramp reads as it does on NCR's own
      // marketing surfaces. Applied via the same PUT /api/branding payload.
      defaultColorMode: "dark" as const,
      // A small, real flat token map the dashboard renderer applies as CSS custom
      // properties (values are plain strings). Keeps the brand accent consistent
      // on the customizable dashboard surface.
      dashboardThemeTokens: {
        "brand-accent": "#5f249f",
        "brand-accent-fg": "#ffffff",
        "radius-card": "16px",
      } as Record<string, string>,
    },
    technicalReq: true as const,
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

// ── Branded tenant theming (e.g. NCR Voyix). Idempotent: PUT /api/branding is a
// full-payload replace, so re-running always converges to the same brand values.
// Only runs for tenants that declare a `branding` block; a plain demo tenant is
// left with the platform defaults (unchanged). The logged-in app chrome
// (cd-shell.tsx) reads brandPrimaryColor via buildThemeCss to re-skin itself, and
// the candidate portal reads the same values via /api/public/branding, so this
// one PUT themes both surfaces. Requires the caller to be a tenant ADMIN
// (requireTenantAdmin on PUT /internal/branding); the seed logs in as the admin,
// so the token carries the ADMIN role. ──
async function seedBranding(t: typeof TENANTS[number]): Promise<void> {
  const branding = (t as any).branding as
    | {
        brandPrimaryColor?: string;
        brandSecondaryColor?: string;
        brandAccentColor?: string;
        brandTagline?: string;
        website?: string;
        defaultColorMode?: "system" | "light" | "dark";
        dashboardThemeTokens?: Record<string, string>;
      }
    | undefined;
  if (!branding) return;

  let login: any;
  try {
    login = await api("POST", "/auth/login", { body: { email: t.email, password: t.password } });
  } catch {
    console.log(`  ! branding: could not log in as admin — skipping`);
    return;
  }
  const token: string | undefined = login?.token;
  if (!token) {
    console.log(`  ! branding: missing admin token — skipping`);
    return;
  }

  try {
    // PUT /api/branding takes the full brand payload; tenant-service normalizes
    // empty strings to null and validates hex colors + the color mode + theme
    // token map. We send only the fields this tenant declared.
    await api("PUT", "/branding", {
      token,
      body: {
        ...(branding.brandPrimaryColor ? { brandPrimaryColor: branding.brandPrimaryColor } : {}),
        ...(branding.brandSecondaryColor ? { brandSecondaryColor: branding.brandSecondaryColor } : {}),
        ...(branding.brandAccentColor ? { brandAccentColor: branding.brandAccentColor } : {}),
        ...(branding.brandTagline ? { brandTagline: branding.brandTagline } : {}),
        ...(branding.website ? { website: branding.website } : {}),
        ...(branding.defaultColorMode ? { defaultColorMode: branding.defaultColorMode } : {}),
        ...(branding.dashboardThemeTokens ? { dashboardThemeTokens: branding.dashboardThemeTokens } : {}),
      },
    });
    console.log(`  ✓ branding applied (${branding.brandPrimaryColor ?? "custom"} + theme tokens)`);
  } catch (err) {
    console.log(`  ! branding PUT failed: ${(err as Error).message.slice(0, 100)}`);
  }
}

// ── Sample technical requisition for a branded tenant (e.g. NCR Voyix). Creates
// one "Software Engineer II" requisition with:
//   - a real eligibility rule (work authorization) evaluated on the public apply
//     path, so the demo shows a gated requisition, and
//   - an HONEST HackerRank-OA note in customFields describing the intended
//     assessment step. The step is INERT until the tenant pastes its own
//     HackerRank API key on Settings -> Integrations (no fake key, no fake
//     "connected", no fabricated score). We do NOT create an Assessment row here
//     because /api/assessments is module-gated (oa-assessments) and the module is
//     turned on by infra/seed.sh AFTER this script, so an inline note keyed to
//     the requisition is the honest, always-runnable representation of the step.
// Idempotent: skips if a "Software Engineer II" requisition already exists for
// this tenant. Only runs for tenants with technicalReq = true. ──
async function seedTechnicalRequisition(t: typeof TENANTS[number]): Promise<void> {
  if (!(t as any).technicalReq) return;

  let login: any;
  try {
    login = await api("POST", "/auth/login", { body: { email: t.email, password: t.password } });
  } catch {
    console.log(`  ! tech req: could not log in as admin — skipping`);
    return;
  }
  const token: string | undefined = login?.token;
  if (!token) {
    console.log(`  ! tech req: missing admin token — skipping`);
    return;
  }

  const TITLE = "Software Engineer II";

  // Idempotency: don't create a second copy on re-run.
  try {
    const list = await api<any>("GET", "/requisitions", { token });
    const arr: any[] = Array.isArray(list) ? list : list?.requisitions ?? list?.data ?? [];
    if (arr.some((r) => String(r?.title ?? "").toLowerCase() === TITLE.toLowerCase())) {
      console.log(`  ↻ tech req "${TITLE}" already exists — skipping`);
      return;
    }
  } catch {
    // If the list read fails we still try to create; a duplicate is harmless demo
    // data, and the create may still succeed.
  }

  try {
    await api("POST", "/requisitions", {
      token,
      body: {
        title: TITLE,
        department: "Engineering",
        location: "Atlanta, GA (Hybrid)",
        country: "US",
        requirements: ["Java or Go", "REST APIs", "SQL", "CI/CD", "Cloud (AWS/Azure)"],
        salaryMin: 110000,
        salaryMax: 150000,
        status: "OPEN",
        // Ordered eligibility rules (EligibilityRule[]) evaluated against the
        // candidate's submitted answers on the public apply path. This one gates
        // on work authorization; a candidate who answers "no" is short-circuited
        // with this message. Demonstrates the eligibility-gate flow shape.
        eligibilityRules: [
          {
            field: "workAuthorization",
            op: "eq",
            values: ["yes"],
            errorMessage:
              "This role requires existing authorization to work in the United States.",
            label: "US work authorization required",
          },
        ],
        // Honest description of the assessment step. The OA is INERT until NCR
        // connects HackerRank on Settings -> Integrations.
        description:
          "Backend/full-stack engineering role on NCR Voyix commerce platform teams. " +
          "Technical screen: candidates who pass eligibility are invited to a HackerRank " +
          "coding assessment. This step is inactive until a HackerRank API key is connected " +
          "under Settings -> Integrations (no assessment is sent until then).",
        // customFields on a requisition are { label, value(string), importance? }
        // (job-service CustomFieldSchema) and double as extra criteria fed to the
        // AI screener. We record the INTENDED assessment step here as an honest,
        // info-only note (provider + a placeholder test slug the tenant will
        // replace with a real HackerRank test id). It carries no credentials and
        // triggers no send — it documents the flow shape for the demo. The real
        // invite is created later from the assessment surface once HackerRank is
        // connected. importance:"info" keeps it out of pass/fail screening logic.
        customFields: [
          {
            label: "Assessment step (HackerRank OA)",
            value:
              "provider=hackerrank; testSlug=PLACEHOLDER-swe-ii-coding; status=needs_credentials. " +
              "Inert until HackerRank is connected under Settings -> Integrations; replace testSlug " +
              "with a real HackerRank test id to enable invites. No assessment is sent until then.",
            importance: "info" as const,
          },
        ],
      },
    });
    console.log(`  ✓ technical requisition "${TITLE}" created (eligibility rule + inert HackerRank OA step)`);
  } catch (err) {
    console.log(`  ! tech req create failed: ${(err as Error).message.slice(0, 120)}`);
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
    // NCR Voyix - re-apply branding + ensure the technical requisition exists on
    // every run (both idempotent: branding is a full-payload replace, the req
    // create is skipped when it already exists). This is what lets the branded
    // tenant converge on re-run against an already-seeded DB.
    await seedBranding(t);
    await seedTechnicalRequisition(t);
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
        // Most tenants register on FREE (register-company's default) and are
        // upgraded to ENTERPRISE by infra/seed.sh Phase 2. A tenant may opt to be
        // created directly on a plan (e.g. NCR Voyix -> ENTERPRISE) so every
        // feature works even before seed.sh runs. register-company validates this
        // against TenantPlanSchema; omit for the default FREE.
        ...((t as any).plan ? { plan: (t as any).plan } : {}),
      },
    });
    token = reg.token;
    console.log(`  ✓ tenant created${(t as any).plan ? ` (${(t as any).plan})` : ""}`);
  } catch (err) {
    console.log(`  ! tenant creation failed: ${(err as Error).message.slice(0, 100)}`);
    return;
  }

  // Phase 35 — seed the org hierarchy for the freshly-created tenant.
  await seedStaff(t);

  // NCR Voyix - apply the tenant's brand palette right after creation so the very
  // first dashboard load is already themed. No-op for tenants without a `branding`
  // block.
  await seedBranding(t);

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

  // 2b. Sample technical requisition (branded tenants only, e.g. NCR Voyix):
  // "Software Engineer II" with an eligibility rule + an honest, inert HackerRank
  // OA step. No-op for tenants without technicalReq.
  await seedTechnicalRequisition(t);

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
  console.log(`    - Pinnacle/Apex/Wavelength/NCR Voyix -> ENTERPRISE`);
  console.log(`    - Pinnacle + NCR Voyix additionally get oa-assessments (+ custom-`);
  console.log(`      dashboards + white-label-embed) turned ON via real TenantModule rows.`);
  console.log(`    - Northwind Staffing stays FREE (proves gating still 402/404s).`);
  console.log(`\n  NCR Voyix (client-branded demo tenant):`);
  console.log(`    Login:  admin@ncrvoyix.demo  password: NcrVoyixDemo123!  (ADMIN, ENTERPRISE)`);
  console.log(`    Branding: NCR Voyix purple chrome (brandPrimaryColor #5f249f) + dark mode;`);
  console.log(`              the logged-in app + candidate portal both theme from PUT /api/branding.`);
  console.log(`    Assessments: HackerRank + HackerEarth appear on Settings -> Integrations as`);
  console.log(`              "Not connected" (honestly INERT, no keys stored). Paste NCR's own`);
  console.log(`              keys there to activate; nothing is fabricated until then.`);
  console.log(`    Technical req: "Software Engineer II" with an eligibility rule + an inert`);
  console.log(`              HackerRank OA step recorded in customFields (needs_credentials).`);
  console.log(`\n  Visit dashboard: http://localhost:3000/`);
  console.log(`  Visit AI Ops: http://localhost:3001/d/cdc-ats-ai-ops`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
