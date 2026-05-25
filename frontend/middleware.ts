import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth-flow routes + the entire anonymous candidate portal.
// `/jobs`, `/status`, `/transparency`, `/appeal`, `/profile` belong to the
// (candidate-portal) route group — anonymous applicants browse jobs, apply,
// check status, etc. without a recruiter login.
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
  // Candidate portal (no auth required)
  "/jobs",
  "/status",
  "/transparency",
  "/appeal",
  "/profile",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = request.cookies.get("ats-token")?.value;
  if (!token && !pathname.startsWith("/api")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
