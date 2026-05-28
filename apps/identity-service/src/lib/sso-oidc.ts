/**
 * Phase 28 — OIDC wrapper around openid-client v6.
 *
 * v6 changed the API from a class-based Issuer/Client model to flat
 * function exports. We discover the IdP's metadata once per (issuerUrl,
 * clientId) tuple and cache the Configuration for 24 hours.
 *
 * Three operations:
 *   1. buildAuthUrl(config, state) → URL to redirect the browser to
 *   2. exchangeCode(config, currentUrl) → ID token claims
 *   3. discoverIdp(...) cached helper
 *
 * Claims always include `sub` (the stable user identifier) and usually
 * `email`. Group/role claims vary by IdP — caller resolves via TenantSso.attrGroups.
 */
import * as oidc from "openid-client";
import { AppError } from "@cdc-ats/common";
import type { TenantSso } from "../generated/prisma/index.js";
import type { SsoAssertion } from "./sso-jit.js";

interface CacheEntry {
  config: oidc.Configuration;
  fetchedAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function cacheKey(issuerUrl: string, clientId: string): string {
  return `${issuerUrl}::${clientId}`;
}

async function getConfiguration(tenantConfig: TenantSso): Promise<oidc.Configuration> {
  if (!tenantConfig.oidcIssuerUrl || !tenantConfig.oidcClientId || !tenantConfig.oidcClientSecret) {
    throw new AppError("BAD_REQUEST", "Tenant OIDC config is incomplete (issuerUrl/clientId/clientSecret required)", 400);
  }
  const key = cacheKey(tenantConfig.oidcIssuerUrl, tenantConfig.oidcClientId);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.config;

  const config = await oidc.discovery(
    new URL(tenantConfig.oidcIssuerUrl),
    tenantConfig.oidcClientId,
    tenantConfig.oidcClientSecret,
  );
  cache.set(key, { config, fetchedAt: Date.now() });
  return config;
}

/** Build the IdP authorization URL the browser should be redirected to. */
export async function buildAuthUrl(
  tenantConfig: TenantSso,
  redirectUri: string,
  state: string,
  codeChallenge?: string,
): Promise<URL> {
  const config = await getConfiguration(tenantConfig);
  const params: Record<string, string> = {
    redirect_uri: redirectUri,
    scope: "openid email profile",
    state,
  };
  if (codeChallenge) {
    params["code_challenge"] = codeChallenge;
    params["code_challenge_method"] = "S256";
  }
  return oidc.buildAuthorizationUrl(config, params);
}

/**
 * Validate the IdP callback (code + state) by exchanging the code for
 * tokens, then return the canonical SsoAssertion claims.
 */
export async function exchangeCode(
  tenantConfig: TenantSso,
  callbackUrl: URL,
  expectedState: string,
  codeVerifier?: string,
): Promise<SsoAssertion> {
  const config = await getConfiguration(tenantConfig);
  let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
  try {
    tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
      expectedState,
      ...(codeVerifier ? { pkceCodeVerifier: codeVerifier } : {}),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new AppError("UNAUTHORIZED", `OIDC code exchange failed: ${msg}`, 401);
  }

  const claims = tokens.claims();
  if (!claims) {
    throw new AppError("UNAUTHORIZED", "OIDC token endpoint returned no ID token claims", 401);
  }
  const externalId = String(claims.sub);
  const email = claims[tenantConfig.attrEmail] as string | undefined;
  if (!email) {
    throw new AppError("UNAUTHORIZED", `OIDC ID token missing email claim (attr: ${tenantConfig.attrEmail})`, 401);
  }
  const groupsRaw = claims[tenantConfig.attrGroups];
  let groups: string[] = [];
  if (Array.isArray(groupsRaw)) groups = groupsRaw.map(String);
  else if (typeof groupsRaw === "string") groups = [groupsRaw];

  return {
    externalId,
    email: String(email),
    firstName: claims[tenantConfig.attrFirstName] as string | undefined,
    lastName: claims[tenantConfig.attrLastName] as string | undefined,
    groups,
  };
}

/** Test seam — clear discovery cache (used by /sso/test endpoint to retry IdP). */
export function clearOidcCache(): void {
  cache.clear();
}
