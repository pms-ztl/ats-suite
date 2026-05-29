/**
 * Calendar OAuth connect flow (Google / Microsoft).
 *
 *   GET /internal/calendar/connect/:provider?redirectUri=...
 *        → { authUrl } to send the user to the provider's consent screen.
 *   GET /internal/calendar/callback/:provider?code=...&redirectUri=...
 *        → exchanges the code for tokens.
 *
 * NOTE: in production the callback should PERSIST the returned refreshToken in a
 * per-user CalendarConnection row (keyed by the user's email) so getBusyWindows
 * / createExternalEvent pick it up. Until that table exists, the tokens are
 * returned to the caller (and can be dropped into CALENDAR_OAUTH_TOKENS).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getUserId } from "@cdc-ats/common";
import { getAuthUrl, exchangeCode, connectorsConfigured } from "../lib/calendar-connectors.js";

const router = Router();

function provider(req: Request): "google" | "microsoft" | null {
  const p = String(req.params["provider"] ?? "").toLowerCase();
  return p === "google" || p === "microsoft" ? p : null;
}
function badProvider(res: Response) {
  return res.status(400).json({ success: false, error: { code: "BAD_PROVIDER", message: "Unsupported provider (use google|microsoft)" } });
}

router.get("/connect/:provider", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!connectorsConfigured()) {
      return res.status(400).json({ success: false, error: { code: "NOT_CONFIGURED", message: "No calendar OAuth app credentials configured (GOOGLE_OAUTH_* / MS_OAUTH_*)." } });
    }
    const p = provider(req);
    if (!p) return badProvider(res);
    const redirectUri = (req.query["redirectUri"] as string) ?? "";
    if (!redirectUri) return res.status(400).json({ success: false, error: { code: "NO_REDIRECT", message: "redirectUri required" } });
    const state = `${getUserId(req) ?? "anon"}:${p}`;
    const authUrl = getAuthUrl(p, redirectUri, state);
    if (!authUrl) return res.status(400).json({ success: false, error: { code: "NO_AUTH_URL", message: `${p} OAuth not configured` } });
    ok(res, { authUrl, provider: p });
  } catch (err) { next(err); }
});

router.get("/callback/:provider", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = provider(req);
    if (!p) return badProvider(res);
    const code = req.query["code"] as string;
    const redirectUri = (req.query["redirectUri"] as string) ?? "";
    if (!code) return res.status(400).json({ success: false, error: { code: "NO_CODE", message: "Authorization code required" } });
    const tokens = await exchangeCode(p, code, redirectUri);
    if (!tokens) return res.status(502).json({ success: false, error: { code: "EXCHANGE_FAILED", message: "Token exchange failed" } });
    ok(res, {
      connected: true,
      provider: p,
      // The refreshToken is what to persist (per-user) for ongoing access.
      tokens,
      note: "Persist refreshToken in a per-user CalendarConnection store (or CALENDAR_OAUTH_TOKENS) to activate free/busy + event creation.",
    });
  } catch (err) { next(err); }
});

export default router;
