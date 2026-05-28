/**
 * Phase 24 — cross-tenant isolation penetration test.
 *
 * Provisions two tenants (A & B) with admin users, creates resources
 * under each, then attempts every cross-tenant access pattern as Tenant A
 * and verifies each one is rejected.
 *
 * Run with:
 *   API_BASE=http://localhost:4000/api node --import tsx apps/security-test/src/cross-tenant.ts
 *
 * Exit code:
 *   0  → every isolation assertion passed
 *   1  → at least one isolation breach detected (FAIL — read the report)
 *
 * Generates SECURITY_REPORT.md in the repo root summarizing pass/fail.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const API = process.env.API_BASE ?? "http://localhost:4000/api";

// Each call we make is recorded so the final report shows exactly what
// was attempted + the actual response.
interface CheckResult {
  name: string;
  attempt: string;
  expected: string;
  actual: string;
  pass: boolean;
}

const results: CheckResult[] = [];
let failures = 0;

function check(opts: { name: string; attempt: string; expected: string; actualStatus: number; actualBody?: unknown; pass: boolean }): void {
  const r: CheckResult = {
    name: opts.name,
    attempt: opts.attempt,
    expected: opts.expected,
    actual: `${opts.actualStatus}` + (opts.actualBody !== undefined ? ` ${shortJson(opts.actualBody)}` : ""),
    pass: opts.pass,
  };
  results.push(r);
  const tag = r.pass ? "✅ PASS" : "❌ FAIL";
  console.log(`${tag}  ${r.name}\n         expected: ${r.expected}\n         actual:   ${r.actual}\n`);
  if (!r.pass) failures++;
}

function shortJson(o: unknown): string {
  try {
    const s = JSON.stringify(o);
    return s.length > 200 ? s.slice(0, 200) + "…" : s;
  } catch {
    return String(o);
  }
}

async function api(method: string, path: string, opts: { token?: string; body?: unknown; tenantId?: string } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  // ATTACK VECTOR: try to inject a spoofed X-Tenant-Id. The gateway
  // should ignore client-supplied X-Tenant-Id and derive it from the JWT.
  if (opts.tenantId) headers["X-Tenant-Id"] = opts.tenantId;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

// ─── 1. Provision two tenants + admin users ─────────────────────────────────

async function registerTenant(slug: string, label: string) {
  const password = "S3cure-pentest-pw-2026!";
  const email = `admin+${slug}@security-test.local`;
  const r = await api("POST", "/auth/register-company", {
    body: {
      orgName: `Pentest ${label}`,
      slug,
      industry: "Technology",
      companySize: "11-50",
      email,
      firstName: label,
      lastName: "Admin",
      password,
      plan: "PROFESSIONAL",
    },
  });
  if (r.status !== 201 && r.status !== 200) {
    // Already exists — log in instead
    const login = await api("POST", "/auth/login", { body: { email, password } });
    if (login.status === 200) {
      const tok = (login.body as any).data?.token ?? (login.body as any).token;
      const user = (login.body as any).data?.user ?? (login.body as any).user;
      return { token: tok, tenantId: user.tenantId, userId: user.id, email };
    }
    throw new Error(`Tenant ${slug} register/login both failed: ${r.status} / ${login.status}`);
  }
  const data = (r.body as any).data ?? r.body;
  return {
    token: data.token,
    tenantId: data.user?.tenantId ?? data.tenant?.id,
    userId: data.user?.id,
    email,
  };
}

interface Provisioned {
  reqId: string;
  candidateId: string | null;
  branding: { website: string | null } | null;
}

async function provisionResources(token: string, label: string): Promise<Provisioned> {
  // Create a requisition we can later try to read cross-tenant.
  const reqRes = await api("POST", "/requisitions", {
    token,
    body: {
      title: `Pentest ${label} role`,
      department: "Engineering",
      location: "Remote",
      country: "US",
      description: `Confidential ${label} req — should never leak to other tenants.`,
      requirements: ["JS", "TS"],
      headcount: 1,
    },
  });
  const reqId =
    (reqRes.body as any)?.data?.id ??
    (reqRes.body as any)?.id ??
    null;
  if (!reqId) throw new Error(`Could not create requisition for ${label}: ${reqRes.status} ${shortJson(reqRes.body)}`);

  // Create a candidate (best-effort — schema varies by service version).
  let candidateId: string | null = null;
  try {
    const candRes = await api("POST", "/candidates", {
      token,
      body: {
        email: `cand-${label}-${Date.now()}@security-test.local`,
        firstName: `Candidate-${label}`,
        lastName: "Pentest",
        source: "pentest",
      },
    });
    candidateId =
      (candRes.body as any)?.data?.id ??
      (candRes.body as any)?.id ??
      null;
  } catch { /* candidate creation is optional for this test */ }

  // Set unique branding on this tenant so we can verify it doesn't leak.
  await api("PUT", "/branding", {
    token,
    body: {
      brandPrimaryColor: "#ff0099",
      brandTagline: `${label} confidential tagline`,
      website: `https://${label.toLowerCase()}-pentest-only.invalid`,
    },
  });

  return { reqId, candidateId, branding: { website: `https://${label.toLowerCase()}-pentest-only.invalid` } };
}

// ─── 2. Run attacks ─────────────────────────────────────────────────────────

async function runAttacks(A: { token: string; tenantId: string; userId: string }, B: { token: string; tenantId: string; userId: string }, bRes: Provisioned) {
  console.log("\n=== Cross-tenant attacks (as Tenant A, target Tenant B) ===\n");

  // ── ATTACK 1: direct GET of Tenant B's requisition by id ───────────────
  {
    const r = await api("GET", `/requisitions/${bRes.reqId}`, { token: A.token });
    check({
      name: "GET /requisitions/<B's req id> as A",
      attempt: `Use Tenant A's JWT to read Tenant B's requisition (id=${bRes.reqId.slice(0,8)}…)`,
      expected: "404 (not found in A's scope)",
      actualStatus: r.status,
      actualBody: r.body,
      pass: r.status === 404,
    });
  }

  // ── ATTACK 2: GET /requisitions list as A — expect no B rows ───────────
  {
    const r = await api("GET", "/requisitions?limit=100", { token: A.token });
    const list: any[] = (r.body as any)?.data?.requisitions ?? (r.body as any)?.data ?? (r.body as any) ?? [];
    const containsB = Array.isArray(list) && list.some((x: any) => x?.id === bRes.reqId);
    check({
      name: "GET /requisitions list does not contain B's req",
      attempt: "List requisitions as A — verify B's req absent",
      expected: "B's req id NOT in response",
      actualStatus: r.status,
      actualBody: { count: Array.isArray(list) ? list.length : 0, containsBId: containsB },
      pass: r.status === 200 && !containsB,
    });
  }

  // ── ATTACK 3: direct GET of Tenant B's candidate ───────────────────────
  if (bRes.candidateId) {
    const r = await api("GET", `/candidates/${bRes.candidateId}`, { token: A.token });
    check({
      name: "GET /candidates/<B's candidate id> as A",
      attempt: `Read Tenant B's candidate (id=${bRes.candidateId.slice(0,8)}…)`,
      expected: "404",
      actualStatus: r.status,
      actualBody: r.body,
      pass: r.status === 404,
    });
  }

  // ── ATTACK 4: spoof X-Tenant-Id header ─────────────────────────────────
  {
    const r = await api("GET", "/requisitions?limit=100", {
      token: A.token,
      tenantId: B.tenantId,   // attempt to override
    });
    const list: any[] = (r.body as any)?.data?.requisitions ?? (r.body as any)?.data ?? (r.body as any) ?? [];
    const containsB = Array.isArray(list) && list.some((x: any) => x?.id === bRes.reqId);
    check({
      name: "Spoofed X-Tenant-Id is ignored (gateway derives from JWT)",
      attempt: `Send X-Tenant-Id: ${B.tenantId.slice(0,8)}… with A's JWT`,
      expected: "Response only contains A's resources",
      actualStatus: r.status,
      actualBody: { count: Array.isArray(list) ? list.length : 0, containsBId: containsB },
      pass: r.status === 200 && !containsB,
    });
  }

  // ── ATTACK 5: read B's branding via auth'd /api/branding as A ──────────
  {
    const r = await api("GET", "/branding", { token: A.token });
    const data = (r.body as any)?.data ?? r.body;
    const leaked = data?.website === bRes.branding?.website;
    check({
      name: "GET /branding returns ONLY caller's own tenant",
      attempt: "Auth'd branding read as A — must not return B's website",
      expected: `tenantId == A.tenantId; website != B's`,
      actualStatus: r.status,
      actualBody: { id: data?.id, website: data?.website },
      pass: r.status === 200 && data?.id === A.tenantId && !leaked,
    });
  }

  // ── ATTACK 6: try to PATCH B's tenant via super-admin endpoint as A ────
  {
    const r = await api("PATCH", `/super-admin/tenants/${B.tenantId}`, {
      token: A.token,
      body: { name: "PWNED-by-A" },
    });
    check({
      name: "PATCH /super-admin/tenants/<B's id> as A (non-super-admin)",
      attempt: "Tenant-admin token tries super-admin tenant update",
      expected: "403 (SUPER_ADMIN required)",
      actualStatus: r.status,
      actualBody: r.body,
      pass: r.status === 403,
    });
  }

  // ── ATTACK 7: try to read super-admin platform endpoints as A ──────────
  {
    const r = await api("GET", "/super-admin/platform/agents", { token: A.token });
    check({
      name: "GET /super-admin/platform/agents as A (non-super-admin)",
      attempt: "Read platform agent kill switches as a regular tenant admin",
      expected: "403",
      actualStatus: r.status,
      actualBody: r.body,
      pass: r.status === 403,
    });
  }

  // ── ATTACK 8: try to read B's notifications ────────────────────────────
  {
    const r = await api("GET", "/notifications?limit=100", { token: A.token });
    const list: any[] = (r.body as any)?.data?.notifications ?? (r.body as any)?.data ?? (r.body as any) ?? [];
    const leaked = Array.isArray(list) && list.some((n: any) => n?.tenantId && n.tenantId === B.tenantId);
    check({
      name: "GET /notifications excludes B's tenant rows",
      attempt: "List notifications as A — verify none belong to tenant B",
      expected: "No row with tenantId == B.tenantId",
      actualStatus: r.status,
      actualBody: { count: Array.isArray(list) ? list.length : 0, leakedFromB: leaked },
      pass: r.status === 200 && !leaked,
    });
  }

  // ── ATTACK 9: unauthenticated read of internal endpoints ───────────────
  {
    const r = await api("GET", "/branding");
    check({
      name: "GET /branding without JWT",
      attempt: "Hit the protected endpoint with no Authorization header",
      expected: "401",
      actualStatus: r.status,
      actualBody: r.body,
      pass: r.status === 401,
    });
  }

  // ── ATTACK 10: try to delete B's requisition ───────────────────────────
  {
    const r = await api("DELETE", `/requisitions/${bRes.reqId}`, { token: A.token });
    // 404 or 403 are both acceptable — depends on service implementation.
    // 200/204 = isolation breach.
    check({
      name: "DELETE /requisitions/<B's req id> as A",
      attempt: "Attempt to destroy Tenant B's data",
      expected: "404 or 403 or 405 (NOT 200/204)",
      actualStatus: r.status,
      actualBody: r.body,
      pass: r.status === 404 || r.status === 403 || r.status === 405,
    });
  }
}

// ─── 3. Generate report ─────────────────────────────────────────────────────

function writeReport(reportPath: string, A: { tenantId: string }, B: { tenantId: string }) {
  const lines: string[] = [
    "# Cross-Tenant Isolation Penetration Test — Report",
    "",
    `Run at: ${new Date().toISOString()}`,
    `Gateway: ${API}`,
    `Tenant A: ${A.tenantId}`,
    `Tenant B: ${B.tenantId}`,
    "",
    `## Summary`,
    "",
    `- **Total checks**: ${results.length}`,
    `- **Passed**: ${results.length - failures}`,
    `- **Failed**: ${failures}`,
    "",
    failures === 0
      ? "✅ **All isolation assertions passed.** Tenant A cannot read or modify Tenant B's data via any tested vector."
      : `❌ **${failures} isolation failure(s)** — see breaches below. Stop reading PII immediately and investigate.`,
    "",
    `## Detailed results`,
    "",
    "| # | Check | Result |",
    "|---|---|---|",
    ...results.map((r, i) => `| ${i + 1} | ${r.name} | ${r.pass ? "✅ PASS" : "❌ FAIL"} |`),
    "",
    `## Per-check attempts`,
    "",
  ];
  for (const r of results) {
    lines.push(`### ${r.pass ? "✅" : "❌"} ${r.name}`);
    lines.push("");
    lines.push(`- **Attempt**: ${r.attempt}`);
    lines.push(`- **Expected**: ${r.expected}`);
    lines.push(`- **Actual**: \`${r.actual}\``);
    lines.push("");
  }
  writeFileSync(reportPath, lines.join("\n"), "utf-8");
  console.log(`\nReport written to ${reportPath}`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nCross-tenant pen test starting against ${API}\n`);

  // 1) Provision A and B
  const slugA = `pentest-a-${Date.now().toString(36).slice(-6)}`;
  const slugB = `pentest-b-${Date.now().toString(36).slice(-6)}`;
  console.log(`Provisioning Tenant A (slug=${slugA})…`);
  const A = await registerTenant(slugA, "A");
  console.log(`  → tenantId=${A.tenantId}`);
  console.log(`Provisioning Tenant B (slug=${slugB})…`);
  const B = await registerTenant(slugB, "B");
  console.log(`  → tenantId=${B.tenantId}`);

  // 2) Create resources under B (and A for completeness — currently unused
  //    but available if we add reverse-direction attacks later).
  console.log(`\nProvisioning resources in B…`);
  const bRes = await provisionResources(B.token, "B");
  console.log(`  → req=${bRes.reqId.slice(0,8)}…  candidate=${bRes.candidateId?.slice(0,8) ?? "(skipped)"}`);
  await provisionResources(A.token, "A"); // populate A so list endpoints are non-empty

  // 3) Run the attack matrix
  await runAttacks(A, B, bRes);

  // 4) Write report
  const reportPath = join(process.cwd(), "SECURITY_REPORT.md");
  writeReport(reportPath, A, B);

  // 5) Exit code
  if (failures > 0) {
    console.error(`\n❌ ${failures} isolation failures detected. See ${reportPath}.`);
    process.exit(1);
  }
  console.log(`\n✅ All ${results.length} isolation assertions passed.`);
}

main().catch((err) => {
  console.error("\n💥 Pen test crashed:", err);
  process.exit(2);
});
