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
    // Platform tier MUST stay in /admin and /admin sub-tree
    if (role === "SUPER_ADMIN") {
      // Root path → push to platform dashboard
      if (pathname === "/" || pathname === "") {
        return NextResponse.redirect(new URL("/admin", request.url));
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
      if (
        pathname.startsWith("/settings/team") ||
        pathname.startsWith("/billing")
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
