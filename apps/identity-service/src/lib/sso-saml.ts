/**
 * Phase 28 — SAML 2.0 wrapper around @node-saml/passport-saml.
 *
 * We don't use passport's HTTP middleware here — that pattern assumes a
 * single global IdP per app. We have N tenants × N IdPs, so we instantiate
 * the SAML strategy per-request from the tenant's TenantSso config and
 * call its low-level methods directly.
 *
 * Two operations:
 *   1. buildLoginUrl(config, relayState) → URL the browser should be sent to
 *   2. validateAssertion(samlResponseB64, config) → claims or throws
 *
 * SAML quirks intentionally handled:
 *   - InResponseTo validation is NOT enforced because we're stateless
 *     (no SP-side request store). RelayState carries our CSRF token instead.
 *   - signatureAlgorithm pinned to sha256 (default is sha1 — deprecated by Okta).
 *   - audience validation pinned to our samlIssuer so a stolen assertion
 *     from another SP can't be replayed.
 */
import { SAML } from "@node-saml/passport-saml";
import { AppError } from "@cdc-ats/common";
import type { TenantSso } from "../generated/prisma/index.js";
import type { SsoAssertion } from "./sso-jit.js";

/**
 * Construct a SAML instance from the tenant's stored config.
 * Public assets only — IdP cert (we use it to VALIDATE assertions), our
 * issuer URL (we use it as audience), and entry point (we redirect to it).
 */
function buildSaml(config: TenantSso, callbackUrl: string): SAML {
  if (!config.samlEntryPoint || !config.samlIssuer || !config.samlCertificate) {
    throw new AppError("BAD_REQUEST", "Tenant SAML config is incomplete (entryPoint/issuer/certificate required)", 400);
  }
  return new SAML({
    entryPoint: config.samlEntryPoint,
    issuer: config.samlIssuer,
    idpCert: config.samlCertificate,
    callbackUrl,
    signatureAlgorithm: "sha256",
    // wantAssertionsSigned: assertions must be signed by IdP (most IdPs do).
    wantAssertionsSigned: true,
    // disableRequestedAuthnContext: many IdPs reject the SAML AuthnContext
    // we'd otherwise send — safer to leave it open.
    disableRequestedAuthnContext: true,
  });
}

/** Build the IdP login URL the browser should be redirected to. */
export async function buildLoginUrl(
  config: TenantSso,
  callbackUrl: string,
  relayState: string,
): Promise<string> {
  const saml = buildSaml(config, callbackUrl);
  return saml.getAuthorizeUrlAsync(relayState, undefined, {});
}

/**
 * Validate the SAML POST response from the IdP. Returns extracted claims
 * mapped to our internal SsoAssertion shape using the tenant's attr* config.
 *
 * `samlResponse` is the base64-encoded SAMLResponse field from the form post.
 */
export async function validateAssertion(
  samlResponse: string,
  config: TenantSso,
  callbackUrl: string,
): Promise<SsoAssertion> {
  const saml = buildSaml(config, callbackUrl);
  let validated: any;
  try {
    validated = await saml.validatePostResponseAsync({ SAMLResponse: samlResponse });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new AppError("UNAUTHORIZED", `SAML assertion validation failed: ${msg}`, 401);
  }
  // validated.profile contains the attributes
  const profile = validated.profile ?? {};
  const externalId = (profile.nameID as string | undefined) ?? (profile[config.attrEmail] as string | undefined);
  if (!externalId) {
    throw new AppError("UNAUTHORIZED", "SAML response missing nameID and email", 401);
  }
  // Email attribute can come back as `email`, `emailaddress`, or
  // `http://schemas.xmlsoap.org/...` — we let the tenant config name it.
  const email = (profile[config.attrEmail] ?? profile.nameID) as string | undefined;
  if (!email) {
    throw new AppError("UNAUTHORIZED", `SAML response missing email claim (attr: ${config.attrEmail})`, 401);
  }
  // Groups can be a string or an array depending on IdP.
  let groups: string[] = [];
  const groupsRaw = profile[config.attrGroups];
  if (Array.isArray(groupsRaw)) groups = groupsRaw.map(String);
  else if (typeof groupsRaw === "string") groups = [groupsRaw];

  return {
    externalId: String(externalId),
    email: String(email),
    firstName: profile[config.attrFirstName] as string | undefined,
    lastName: profile[config.attrLastName] as string | undefined,
    groups,
  };
}

/**
 * Generate IdP-friendly SP metadata XML so a tenant admin can paste OUR
 * metadata URL into their IdP console rather than typing entityID and
 * callback URL by hand.
 */
export function buildSpMetadata(config: TenantSso, callbackUrl: string): string {
  if (!config.samlIssuer) {
    throw new AppError("BAD_REQUEST", "samlIssuer must be set to generate metadata", 400);
  }
  const saml = buildSaml(config, callbackUrl);
  return saml.generateServiceProviderMetadata(null, null);
}
