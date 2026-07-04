export const meta = {
  name: 'rbac-hardening-all-roles',
  description: 'Tighten RBAC to best-practice least-privilege across EVERY role and EVERY route: audit each service route for missing authorization (authenticated-but-not-role-gated), then add server-side role enforcement per a central permission matrix, plus per-role tests. Conservative + additive - never breaks legitimate flows or pre-auth/public/internal-token routes.',
  phases: [
    { title: 'Audit', detail: '3 read-only lanes map every route -> current enforcement -> intended role(s)' },
    { title: 'Enforce', detail: 'disjoint service-group lanes add role gates to under-protected routes + tests' },
  ],
}

const AUDIT = { type: "object", additionalProperties: false, properties: {
  area: { type: "string" },
  routes: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    service: { type: "string" }, route: { type: "string", description: "METHOD /path (file:line)" },
    currentGuard: { type: "string", description: "readAuthHeaders-only | requireRole([...]) | requireModule | requireAgentPlan | internal-token | public/pre-auth | none" },
    intendedRoles: { type: "string", description: "the least-privilege role set that SHOULD be allowed per the matrix" },
    gap: { type: "boolean", description: "true if under-protected (a sensitive/mutating route reachable by roles that should not, or no role gate where one is needed)" },
    fix: { type: "string", description: "if gap: the exact guard to add (e.g. requireAnyRole(['ADMIN','RECRUITER','HR_MANAGER'])) + where" },
  }, required: ["service", "route", "currentGuard", "intendedRoles", "gap", "fix"] } },
  helpers: { type: "string", description: "the EXISTING role-guard middleware/helpers found in packages/common (exact names/signatures) so the fix lanes reuse them" },
  notes: { type: "string" },
}, required: ["area", "routes", "helpers", "notes"] };

const REPORT = { type: "object", additionalProperties: false, properties: {
  files: { type: "array", items: { type: "string" } }, summary: { type: "string" }, guardsAdded: { type: "number" }, testsAdded: { type: "number" }, notes: { type: "string" },
}, required: ["files", "summary", "guardsAdded", "testsAdded", "notes"] };

const MATRIX = "LEAST-PRIVILEGE ROLE MATRIX (the intended authorization model; enforce server-side, never widen beyond this, never break these):\n- SUPER_ADMIN: platform + cross-tenant super-admin routes ONLY they may hit; also may do anything within a tenant context.\n- ADMIN (tenant admin): everything within their OWN tenant (settings, users, branding, billing view, all hiring actions).\n- RECRUITER: full hiring lifecycle within tenant - jobs/requisitions CRUD, candidates + pipeline (advance stage), interviews (schedule), assessments (invite), offers (create), messaging. NOT tenant settings/user-management/billing/super-admin.\n- HR_MANAGER: RECRUITER scope + HR: offers/onboarding, compensation visibility, approvals.\n- HIRING_MANAGER: view candidates + pipeline for reqs they own/are assigned, submit interview feedback, participate in decisions/approvals, request interviews. LIMITED create; NOT settings/billing/bulk-delete.\n- INTERVIEWER: view ONLY assigned interviews + the candidate basics for them, submit their OWN scorecard/feedback. NOT salaries, NOT other interviewers' notes, NOT pipeline management, NOT candidate lists at large.\n- DEPARTMENT_HEAD: analytics/reports/dashboards + decisions/approvals for their scope; read candidate/pipeline data; NOT raw interviewer notes, NOT settings/billing.\n- EXECUTIVE: analytics/reports/dashboards (read-mostly) + high-level approvals; NOT operational CRUD, NOT settings/billing writes.\n- COMPLIANCE_OFFICER: audit/compliance/GDPR/bias/EEOC routes, read candidate data for compliance, export/DSAR; NOT hiring actions (no advance/offer/hire).\n- CANDIDATE: ONLY their own candidate-portal/application/onboarding-by-token routes (these are public/token or candidate-scoped, NOT the internal dashboard).\nGENERAL: mutating routes (POST/PUT/PATCH/DELETE) MUST have an explicit role gate; sensitive reads (salaries, notes, analytics, other users' data) gated per above; super-admin/platform routes SUPER_ADMIN only; billing writes ADMIN only.";

const CTX = "Repo D:/CDC/ATS - a SHIPPED multi-tenant ATS. Roles (identity UserRole + contracts): SUPER_ADMIN, ADMIN, RECRUITER, HR_MANAGER, HIRING_MANAGER, COMPLIANCE_OFFICER, INTERVIEWER, DEPARTMENT_HEAD, EXECUTIVE, CANDIDATE. Auth flow: the gateway verifies the JWT and stamps X-User-Id/X-Tenant-Id/X-User-Role; services read them via readAuthHeaders (packages/common) - getUserId/getTenantId/getUserRole. There is already a role-guard helper in packages/common (requireRole / requireAnyRole - the audit will confirm the exact name) and a server-side field-visibility matrix (filterVisibleFields/canViewField/RBAC_ROLES). \n\n" + MATRIX + "\n\nCRITICAL SAFETY (do NOT break these): pre-auth routes (login, register-saga, SSO, password) must stay open; PUBLIC routes (/public/*, candidate-portal apply/status, onboarding-by-token, provider webhooks) must NOT get a dashboard role gate; INTERNAL service-to-service routes guarded by the internal-service-token stay as-is; the readAuthHeaders MOUNT-ORDER gotcha (a non-optional guard at a shared prefix breaks sibling pre-auth routes) must be respected - add role guards PER-ROUTE or per-router, never at a prefix that also serves pre-auth/public routes. Prefer ADD a guard over CHANGE a flow; when unsure whether a role should have access, follow the matrix (least privilege) but do NOT block a role the matrix grants.";

const ACTX = CTX + "\n\nEXECUTION: READ-ONLY audit. For every route in your assigned services, record METHOD /path (file:line), the current guard, the intended role set per the matrix, whether it is a gap (under-protected), and the exact fix. ALSO report the EXACT existing role-guard helper(s) in packages/common (name + signature) so the enforce lanes reuse them (do not invent a new one if one exists).";
const FCTX = "Repo D:/CDC/ATS. EXECUTION RULE: write SOURCE ONLY - no npm/npx/tsc/prisma/docker (orchestrator builds/tests). NodeNext ESM (.js specifiers). " + CTX + "\n\nApply ONLY the gap fixes handed to you: add the existing role-guard middleware (requireRole/requireAnyRole from @cdc-ats/common - use the EXACT name the audit reported) to each under-protected route with the matrix's least-privilege role set, PER-ROUTE (never at a prefix serving pre-auth/public routes). Additive + conservative: do not remove existing access the matrix grants, do not touch public/pre-auth/internal-token routes. Add a dedicated per-role vitest suite for your service group proving the matrix (allowed roles pass, disallowed roles get 403) against the guard helper or a representative route. Match idioms; no em/en dashes.";

phase('Audit')
log('3 RBAC audits: core / hiring / platform')
const [a1, a2, a3] = await parallel([
  () => agent(ACTX + "\n\nSERVICES: apps/candidate-service, apps/job-service, apps/resume-service, apps/screening-service, apps/assessment-service. Enumerate every mounted route + its guard + intended roles + gaps. Pay attention to mutating routes (create job, advance stage, invite assessment, bulk import, delete) that may only have readAuthHeaders.", { label: 'au:core', phase: 'Audit', schema: AUDIT }),
  () => agent(ACTX + "\n\nSERVICES: apps/interview-service, apps/collab-service, apps/onboarding-service, apps/notification-service. Enumerate every route + guard + intended roles + gaps. INTERVIEWER should reach only their assigned interviews + own feedback; scheduling/round mutation is RECRUITER/HR/ADMIN; messaging/templates gates; onboarding recruiter routes vs the public token portal.", { label: 'au:hiring', phase: 'Audit', schema: AUDIT }),
  () => agent(ACTX + "\n\nSERVICES: apps/identity-service, apps/tenant-service, apps/billing-service, apps/analytics-service, apps/search-service, apps/api-gateway. Enumerate every route + guard + intended roles + gaps. Super-admin/platform routes MUST be SUPER_ADMIN only; tenant settings/user-management ADMIN; billing writes ADMIN; analytics reads DEPARTMENT_HEAD/EXECUTIVE/ADMIN/RECRUITER per matrix. ALSO confirm the gateway correctly stamps the verified role and cannot be spoofed by a client header, and report the exact packages/common role-guard helper name+signature + the field-visibility exports.", { label: 'au:platform', phase: 'Audit', schema: AUDIT }),
])
const audit = [a1, a2, a3].filter(Boolean)
const gaps = audit.flatMap(a => (a.routes || []).filter(r => r.gap));
log('Audit done: ' + audit.flatMap(a => a.routes || []).length + ' routes, ' + gaps.length + ' under-protected gaps');
const helpers = audit.map(a => a.helpers).filter(Boolean).join(' | ');

phase('Enforce')
const CORE = ['candidate', 'job-service', 'resume', 'screening', 'assessment'];
const HIRING = ['interview', 'collab', 'onboarding', 'notification'];
const bucket = (names) => gaps.filter(g => names.some(n => (g.service || '').includes(n)));
const fmt = (arr) => arr.map((g, i) => `${i + 1}. ${g.service} ${g.route}\n   now: ${g.currentGuard} | allow: ${g.intendedRoles}\n   FIX: ${g.fix}`).join("\n");
const groups = [
  ['core', bucket(CORE)],
  ['hiring', bucket(HIRING)],
  ['platform', gaps.filter(g => !CORE.some(n => (g.service||'').includes(n)) && !HIRING.some(n => (g.service||'').includes(n)))],
].filter(([, arr]) => arr.length > 0);
log('Enforce lanes: ' + groups.map(([k, arr]) => `${k}(${arr.length})`).join(', ') || 'none - RBAC already tight');
let fixes = [];
if (groups.length) {
  fixes = (await parallel(groups.map(([g, arr]) => () =>
    agent(FCTX + `\n\nEXISTING role-guard helpers reported by the audit: ${helpers}\n\n=== ENFORCE LANE: ${g} (${arr.length} gaps) ===\nAdd the least-privilege role guard to each route below + a per-role test suite. Do NOT touch public/pre-auth/internal-token routes.\n\n` + fmt(arr),
      { label: 'rbac:' + g, phase: 'Enforce', schema: REPORT })
  ))).filter(Boolean);
} else {
  log('No RBAC gaps - enforcement already complete.');
}

return {
  totalRoutes: audit.flatMap(a => a.routes || []).length,
  gaps: gaps.length,
  gapList: gaps.map(g => `${g.service} ${g.route} -> allow ${g.intendedRoles}`),
  fixes: fixes.map(f => ({ summary: f.summary, guardsAdded: f.guardsAdded, testsAdded: f.testsAdded })),
};
