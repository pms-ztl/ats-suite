/**
 * @cdc-ats/embed-sdk — host origin resolution.
 *
 * The SDK is configured with a `host` (e.g. "https://app.cdc-ats.com"). Every
 * security check in the SDK pivots on the EXACT origin derived from that host:
 * iframe src is built from it, outbound postMessages target it, and inbound
 * messages are accepted only when event.origin equals it. We resolve it ONCE,
 * fail closed on anything that is not a clean http(s) origin, and never accept a
 * wildcard.
 */

/**
 * Parse a configured host into a clean origin string (scheme://host[:port]).
 * Throws on a malformed host, a non-http(s) scheme, or a wildcard, so a
 * misconfiguration surfaces immediately instead of silently weakening the
 * origin checks. http is permitted only for localhost-style dev hosts; every
 * other host must be https.
 */
export function resolveHostOrigin(host: string): string {
  if (typeof host !== "string" || host.trim().length === 0) {
    throw new Error("[cdc-ats embed] host is required");
  }
  let u: URL;
  try {
    u = new URL(host.trim());
  } catch {
    throw new Error(`[cdc-ats embed] host is not a valid URL: ${host}`);
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    throw new Error(`[cdc-ats embed] host must be http(s): ${host}`);
  }
  if (!u.hostname || u.hostname.includes("*")) {
    throw new Error(`[cdc-ats embed] host may not contain a wildcard: ${host}`);
  }
  const isLocal =
    u.hostname === "localhost" ||
    u.hostname === "127.0.0.1" ||
    u.hostname.endsWith(".localhost");
  if (u.protocol === "http:" && !isLocal) {
    throw new Error(`[cdc-ats embed] host must use https (http allowed only for localhost): ${host}`);
  }
  // URL.origin already strips path/query/hash/credentials and normalizes the port.
  return u.origin;
}
