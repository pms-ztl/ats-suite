import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth-flow routes + the entire anonymous candidate portal.
// `/jobs`, `/status`, `/transparency`, `/appeal`, `/profile` belong to the
// (candidate-portal) route group, anonymous applicants browse jobs, apply,
// check status, etc. without a recruiter login.
const PUBLIC_PATHS = [
  "/login",
  "/super-admin/login",        // Batch 1: platform tier login
  "/staff/login",              // Batch 1: staff tier login
  "/register",
  "/get-started",              // Self-serve company signup
  "/pricing",                  // Public pricing page
  "/forgot-password",
  "/reset-password",
  "/session-expired",
  "/verify-email",             // email-link landing (user is logged out)
  "/accept-invite",            // invite-link landing
  "/sso-callback",             // SSO return
  // Public marketing
  "/welcome",                  // flagship landing ("/" is the authed dashboard)
  "/contact",
  "/support",                  // public Help / Support / Docs (linked from marketing + error/offline pages)
  "/agents",                   // public AI agents product page
  "/system-status",            // public system status (cinematic hero)
  "/status-board",             // public system status board
  "/system-shell",             // literal "System & Shell.html" design reference (iframe)
  "/design-system",            // the static design files (system-shell.html + .jsx) it loads
  // Candidate portal (no auth required)
  "/jobs",
  "/status",
  "/transparency",
  "/appeal",
  "/profile",
  "/c",                        // tenant-scoped public board: /c/[slug]/jobs
  "/offline",
  // Module D — the tenant's OWN built-in interview room, guest (candidate) join.
  // Contract: ${APP_URL}/interview/room/{interviewId}?t=<joinToken>. The opaque
  // signed join token in the URL is the ONLY credential (validated server-side by
  // Lane 1's /public/interview/join); no recruiter login. NEVER an external tool.
  "/interview/room",
  // WF9 / SLICE I1 — embeddable widget surface (the (embed) route group). These
  // chrome-less pages are framed into a customer site with NO session login; the
  // signed embed token in the URL is the only credential, verified server-side
  // by the gateway (the page fails closed on an invalid/expired token). Adding
  // /embed here lets the iframe reach the page without a /login redirect; it does
  // NOT expose any data without a valid token.
  "/embed",
];

/**
 * Pull the user role from the JWT *without* verifying the signature.
 * Signature verification belongs on the server; here we only need the role
 * claim to make a routing decision. Returns null if anything looks wrong.
 */
function roleFromJwt(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf-8")
    );
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

// WF9 / SLICE I3 — route-prefix -> owning registry module key, for the route
// guard below. ONLY modules that are NOT default-enabled in the @cdc-ats/common
// registry are listed here: a default-enabled module can never end up in the
// `ats-modules-off` disabled-set the guard reads, so listing it would be dead
// weight AND risk a v1 regression. Today the only non-default module that owns a
// standalone gated route is oa-assessments (/assessments); custom-dashboards and
// white-label-embed own no standalone /-route in v1. Keep in sync with the
// registry's defaultEnabled:false modules.
const MODULE_ROUTE_PREFIXES: { prefix: string; module: string }[] = [
  { prefix: "/assessments", module: "oa-assessments" },
];

/**
 * Read the lightweight `ats-modules-off` cookie the cd-shell writes after it
 * resolves GET /api/me/modules: a comma-joined set of NON-default module keys
 * that are explicitly DISABLED (hard-disabled, not plan-locked) for the tenant.
 * Absent / empty cookie => empty set => the guard is a no-op (v1 unaffected).
 */
function disabledModules(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  try {
    return new Set(
      decodeURIComponent(raw)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  } catch {
    return new Set();
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Logged-out visitors to the root see the public welcome landing as the
  // default front door (rewrite, so the URL stays at "/"). Logged-in users
  // fall through to their dashboard at "/" below.
  if (!request.cookies.get("ats-token")?.value && (pathname === "/" || pathname === "")) {
    return NextResponse.rewrite(new URL("/welcome", request.url));
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get("ats-token")?.value;
  if (!token && !pathname.startsWith("/api")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Batch 1: role-based tier routing ────────────────────────────────────
  // Decide where this token's owner is allowed to be.
  const role = roleFromJwt(token);

  if (role) {
    // Platform tier lives in the standalone /super-admin console (served from
    // public/, outside the gated React /admin tree). Route the operator there
    // directly: the React /admin gate resolves the role client-side via /auth/me,
    // which is brittle for the operator account, so the console (cookie-authed) is
    // the reliable surface.
    if (role === "SUPER_ADMIN") {
      if (pathname === "/" || pathname === "" || pathname === "/admin" || pathname.startsWith("/admin/")) {
        return NextResponse.redirect(new URL("/super-admin/index.html", request.url));
      }
    } else {
      // Non-SUPER_ADMIN trying to reach the platform portal → bounce home
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Tier-3 staff cannot access tenant-admin-only pages
    const tier3 = ["RECRUITER", "HIRING_MANAGER", "INTERVIEWER"];
    if (tier3.includes(role)) {
      // Billing stays tenant-admin only.
      if (pathname.startsWith("/billing")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      // Phase 35 — Recruiters and Hiring Managers manage their own team (view
      // their direct reports + add people beneath them) at /settings/team.
      // Interviewers are leaf nodes and have no team to manage.
      if (pathname.startsWith("/settings/team") && role === "INTERVIEWER") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  // ── WF9 / SLICE I3: module-disabled route guard ─────────────────────────
  // 404 a route whose owning module is EXPLICITLY DISABLED for this tenant. The
  // disabled-set comes from the lightweight `ats-modules-off` cookie (written by
  // the cd-shell after it resolves /api/me/modules); only NON-default modules can
  // appear there. A default-enabled module is never in the set, so v1 routes are
  // byte-identical. An absent cookie => empty set => no-op (fail open). A
  // plan-locked module is NOT in the set (it routes to the upgrade path in-app),
  // so this never 404s an upgradeable surface. We rewrite to an unmatched path so
  // Next renders the app's not-found page with a real 404 status.
  if (token) {
    const off = disabledModules(request.cookies.get("ats-modules-off")?.value);
    if (off.size > 0) {
      const hit = MODULE_ROUTE_PREFIXES.find(
        ({ prefix }) => pathname === prefix || pathname.startsWith(prefix + "/"),
      );
      if (hit && off.has(hit.module)) {
        return NextResponse.rewrite(new URL("/_module-disabled", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Exclude the standalone /super-admin static console (its own full-bleed shell,
  // served from public/super-admin) so middleware does not redirect the static
  // asset requests to /login. The console's live data stays API-gated by the
  // gateway's requireSuperAdmin, so the page itself being reachable is harmless.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|super-admin|.*\\.png$).*)"],
};
