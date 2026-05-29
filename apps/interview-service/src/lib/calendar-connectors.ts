/**
 * Google + Microsoft calendar OAuth connectors — the real two-way layer on top
 * of calendar.ts. All via fetch (no SDK deps). They ACTIVATE when OAuth tokens
 * are configured and no-op otherwise, so the system degrades gracefully.
 *
 *   fetchExternalBusy()   → real free/busy from the participant's calendar (eyes)
 *   createExternalEvent() → real calendar event + provider-sent invites (hands)
 *   getAuthUrl()/exchangeCode() → the consent flow helpers
 *
 * Token source (the seam): CALENDAR_OAUTH_TOKENS env, a JSON map
 *   { "person@co.com": { "provider": "google"|"microsoft", "refreshToken": "…" } }
 * In production back this with a per-user CalendarConnection table; the resolver
 * below is the single place to swap. App creds come from
 *   GOOGLE_OAUTH_CLIENT_ID / _SECRET  and  MS_OAUTH_CLIENT_ID / _SECRET / _TENANT.
 */
import type { Logger } from "pino";
import type { BusyWindow } from "./calendar.js";

type Provider = "google" | "microsoft";
interface StoredToken { provider: Provider; refreshToken?: string; accessToken?: string; expiresAt?: number }

function tokenMap(): Record<string, StoredToken> {
  try { return JSON.parse(process.env["CALENDAR_OAUTH_TOKENS"] ?? "{}"); } catch { return {}; }
}
export function resolveConnection(email: string): StoredToken | null {
  return tokenMap()[email.toLowerCase()] ?? null;
}
export function connectorsConfigured(): boolean {
  return !!(process.env["GOOGLE_OAUTH_CLIENT_ID"] || process.env["MS_OAUTH_CLIENT_ID"]);
}

// ── Access-token acquisition (refresh) ───────────────────────────────────────
const _accessCache = new Map<string, { token: string; exp: number }>();

async function googleAccessToken(refreshToken: string): Promise<string | null> {
  const cached = _accessCache.get(refreshToken);
  if (cached && cached.exp > Date.now() + 30_000) return cached.token;
  const body = new URLSearchParams({
    client_id: process.env["GOOGLE_OAUTH_CLIENT_ID"] ?? "",
    client_secret: process.env["GOOGLE_OAUTH_CLIENT_SECRET"] ?? "",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body });
  if (!res.ok) return null;
  const j: any = await res.json();
  if (!j.access_token) return null;
  _accessCache.set(refreshToken, { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 });
  return j.access_token;
}

async function msAccessToken(refreshToken: string): Promise<string | null> {
  const cached = _accessCache.get(refreshToken);
  if (cached && cached.exp > Date.now() + 30_000) return cached.token;
  const tenant = process.env["MS_OAUTH_TENANT"] ?? "common";
  const body = new URLSearchParams({
    client_id: process.env["MS_OAUTH_CLIENT_ID"] ?? "",
    client_secret: process.env["MS_OAUTH_CLIENT_SECRET"] ?? "",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    scope: "https://graph.microsoft.com/Calendars.ReadWrite offline_access",
  });
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, { method: "POST", body });
  if (!res.ok) return null;
  const j: any = await res.json();
  if (!j.access_token) return null;
  _accessCache.set(refreshToken, { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 });
  return j.access_token;
}

async function accessTokenFor(conn: StoredToken): Promise<string | null> {
  if (conn.accessToken && (conn.expiresAt ?? 0) > Date.now() + 30_000) return conn.accessToken;
  if (!conn.refreshToken) return conn.accessToken ?? null;
  return conn.provider === "google" ? googleAccessToken(conn.refreshToken) : msAccessToken(conn.refreshToken);
}

// ── Eyes: real free/busy ─────────────────────────────────────────────────────
export async function fetchExternalBusy(
  email: string, rangeStart: string, rangeEnd: string, logger: Logger,
): Promise<BusyWindow[] | null> {
  const conn = resolveConnection(email);
  if (!conn) return null;
  try {
    const token = await accessTokenFor(conn);
    if (!token) return null;
    if (conn.provider === "google") {
      const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ timeMin: rangeStart, timeMax: rangeEnd, items: [{ id: "primary" }] }),
      });
      if (!res.ok) return null;
      const j: any = await res.json();
      const busy = j.calendars?.primary?.busy ?? [];
      return busy.map((b: any) => ({ start: b.start, end: b.end }));
    }
    // microsoft
    const res = await fetch("https://graph.microsoft.com/v1.0/me/calendar/getSchedule", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        schedules: [email],
        startTime: { dateTime: rangeStart, timeZone: "UTC" },
        endTime: { dateTime: rangeEnd, timeZone: "UTC" },
        availabilityViewInterval: 30,
      }),
    });
    if (!res.ok) return null;
    const j: any = await res.json();
    const items = j.value?.[0]?.scheduleItems ?? [];
    return items
      .filter((s: any) => s.status !== "free")
      .map((s: any) => ({ start: s.start?.dateTime, end: s.end?.dateTime }))
      .filter((w: BusyWindow) => w.start && w.end);
  } catch (err) {
    logger.warn({ err, email }, "external free/busy fetch failed");
    return null;
  }
}

// ── Hands: real event + provider-sent invites ────────────────────────────────
export async function createExternalEvent(
  organizerEmail: string,
  ev: { title: string; start: string; end: string; attendees: string[]; meetingUrl: string; description?: string },
  logger: Logger,
): Promise<{ ok: boolean; provider?: Provider; htmlLink?: string }> {
  const conn = resolveConnection(organizerEmail);
  if (!conn) return { ok: false };
  try {
    const token = await accessTokenFor(conn);
    if (!token) return { ok: false };
    if (conn.provider === "google") {
      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: ev.title,
          description: `${ev.description ?? "Interview"}\nJoin: ${ev.meetingUrl}`,
          start: { dateTime: ev.start },
          end: { dateTime: ev.end },
          attendees: ev.attendees.map((email) => ({ email })),
          location: ev.meetingUrl,
        }),
      });
      if (!res.ok) return { ok: false };
      const j: any = await res.json();
      return { ok: true, provider: "google", htmlLink: j.htmlLink };
    }
    const res = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: ev.title,
        body: { contentType: "HTML", content: `${ev.description ?? "Interview"}<br>Join: <a href="${ev.meetingUrl}">${ev.meetingUrl}</a>` },
        start: { dateTime: ev.start, timeZone: "UTC" },
        end: { dateTime: ev.end, timeZone: "UTC" },
        location: { displayName: ev.meetingUrl },
        attendees: ev.attendees.map((address) => ({ emailAddress: { address }, type: "required" })),
      }),
    });
    if (!res.ok) return { ok: false };
    const j: any = await res.json();
    return { ok: true, provider: "microsoft", htmlLink: j.webLink };
  } catch (err) {
    logger.warn({ err, organizerEmail }, "external calendar event creation failed");
    return { ok: false };
  }
}

// ── Consent-flow helpers (wire to routes + a per-user token store) ───────────
export function getAuthUrl(provider: Provider, redirectUri: string, state: string): string | null {
  if (provider === "google") {
    const id = process.env["GOOGLE_OAUTH_CLIENT_ID"];
    if (!id) return null;
    const q = new URLSearchParams({
      client_id: id, redirect_uri: redirectUri, response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar", access_type: "offline", prompt: "consent", state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
  }
  const id = process.env["MS_OAUTH_CLIENT_ID"];
  if (!id) return null;
  const tenant = process.env["MS_OAUTH_TENANT"] ?? "common";
  const q = new URLSearchParams({
    client_id: id, redirect_uri: redirectUri, response_type: "code",
    scope: "https://graph.microsoft.com/Calendars.ReadWrite offline_access", state,
  });
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${q}`;
}

export async function exchangeCode(
  provider: Provider, code: string, redirectUri: string,
): Promise<{ refreshToken?: string; accessToken: string; expiresAt: number } | null> {
  try {
    if (provider === "google") {
      const body = new URLSearchParams({
        client_id: process.env["GOOGLE_OAUTH_CLIENT_ID"] ?? "",
        client_secret: process.env["GOOGLE_OAUTH_CLIENT_SECRET"] ?? "",
        code, redirect_uri: redirectUri, grant_type: "authorization_code",
      });
      const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body });
      if (!res.ok) return null;
      const j: any = await res.json();
      return { refreshToken: j.refresh_token, accessToken: j.access_token, expiresAt: Date.now() + (j.expires_in ?? 3600) * 1000 };
    }
    const tenant = process.env["MS_OAUTH_TENANT"] ?? "common";
    const body = new URLSearchParams({
      client_id: process.env["MS_OAUTH_CLIENT_ID"] ?? "",
      client_secret: process.env["MS_OAUTH_CLIENT_SECRET"] ?? "",
      code, redirect_uri: redirectUri, grant_type: "authorization_code",
      scope: "https://graph.microsoft.com/Calendars.ReadWrite offline_access",
    });
    const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, { method: "POST", body });
    if (!res.ok) return null;
    const j: any = await res.json();
    return { refreshToken: j.refresh_token, accessToken: j.access_token, expiresAt: Date.now() + (j.expires_in ?? 3600) * 1000 };
  } catch {
    return null;
  }
}
