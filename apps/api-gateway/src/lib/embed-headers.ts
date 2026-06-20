/**
 * WF2 — embed framing headers (scoped, fail-closed).
 *
 * The global helmet() frameguard stamps `X-Frame-Options: SAMEORIGIN` on EVERY
 * response so the app can never be framed by a third party. That posture is
 * correct everywhere EXCEPT the embeddable surface (WF9), which is DESIGNED to
 * be iframed into a customer's site.
 *
 * This middleware is the ONE place that relaxes framing, and only for paths
 * under /embed/ and /api/embed/. For those paths it:
 *
 *   1. removes the inherited X-Frame-Options (X-Frame-Options cannot express an
 *      allowlist — it is all-or-SAMEORIGIN — so the only way to allow specific
 *      third-party origins is to drop it and use CSP frame-ancestors instead);
 *   2. sets Content-Security-Policy: frame-ancestors <allowlist>, where the
 *      allowlist is the verified embed token's allowedOrigins.
 *
 * It FAILS CLOSED at every branch:
 *   - non-embed path        -> middleware does nothing (global X-Frame-Options stays);
 *   - embed path, no token  -> frame-ancestors 'none' (no origin may frame);
 *   - embed path, bad token -> frame-ancestors 'none';
 *   - embed path, empty list-> frame-ancestors 'none'.
 *
 * It NEVER emits a wildcard. Only clean origins from the verified token reach
 * the directive, and they are themselves validated upstream (tenant branding
 * normalizes each entry to a bare https origin before it is ever baked into a
 * token).
 *
 * Because this runs AFTER helmet() in the middleware chain, helmet has already
 * stamped X-Frame-Options on the response; we remove + override it here only on
 * the embed paths, leaving helmet's output on every other route byte-identical.
 */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyEmbedToken } from "./embed-token.js";

/** True for the embeddable surface only: /embed and /embed/*, /api/embed and /api/embed/*. */
export function isEmbedPath(path: string): boolean {
  return (
    path === "/embed" ||
    path.startsWith("/embed/") ||
    path === "/api/embed" ||
    path.startsWith("/api/embed/")
  );
}

/**
 * Pull the embed token from the request, checking (in order) the `token` query
 * param (an iframe src can only carry the token in the URL), the
 * `x-embed-token` header, and a `Bearer` Authorization header. Returns
 * undefined when none is present.
 */
function extractEmbedToken(req: Request): string | undefined {
  const q = req.query["token"];
  if (typeof q === "string" && q.length > 0) return q;
  const h = req.headers["x-embed-token"];
  if (typeof h === "string" && h.length > 0) return h;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    const t = auth.slice(7);
    if (t.length > 0) return t;
  }
  return undefined;
}

/**
 * Serialize a CSP `frame-ancestors` directive from an allowlist, failing closed
 * to 'none' when the list is empty or absent. Origins are emitted verbatim
 * (they are already validated clean https origins); a wildcard can never appear
 * because the upstream validator rejects wildcards before they are stored.
 */
function frameAncestorsDirective(allowedOrigins: string[] | undefined): string {
  const origins = Array.isArray(allowedOrigins)
    ? allowedOrigins.filter((o) => typeof o === "string" && o.length > 0)
    : [];
  if (origins.length === 0) return "frame-ancestors 'none'";
  return `frame-ancestors ${origins.join(" ")}`;
}

/**
 * Scoped embed-framing middleware. Mount it on the app BEFORE the proxy chain;
 * it short-circuits to next() for every non-embed path so the global frameguard
 * is untouched outside the embed surface.
 */
export function embedFramingHeaders(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only the embed surface is ever relaxed. Everything else keeps helmet's
    // global X-Frame-Options exactly as it was.
    if (!isEmbedPath(req.path)) {
      return next();
    }

    // Resolve the allowlist from the verified token. Any failure (missing,
    // expired, tampered, wrong audience) falls through to the empty list, which
    // serializes to frame-ancestors 'none' — fail closed.
    let allowedOrigins: string[] = [];
    const token = extractEmbedToken(req);
    if (token) {
      try {
        const claims = verifyEmbedToken(token);
        allowedOrigins = claims.allowedOrigins;
      } catch {
        allowedOrigins = [];
      }
    }

    // X-Frame-Options cannot express an allowlist, so it must be removed for the
    // embed surface; CSP frame-ancestors takes over. Removing it here (not
    // globally) keeps every non-embed route's header identical.
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", frameAncestorsDirective(allowedOrigins));
    return next();
  };
}
