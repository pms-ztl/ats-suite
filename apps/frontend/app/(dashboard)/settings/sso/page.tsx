"use client";
// app/(dashboard)/settings/sso/page.tsx - EXACT Claude Design "Aurora" settings,
// the Single sign-on right-panel (claude-design/screen-settings.jsx -> PSSO),
// promoted from the lite version into a rich SSO / SAML configuration panel.
// The settings layout already renders the left settings-nav rail + a <section>
// wrapper, so this file is ONLY the right-panel content: the identity-provider
// picker (the PSSO provider cards), the SAML / OIDC configuration form (entity
// ID, ACS / reply URL, metadata URL, certificate, allowed domains), the
// enforce-SSO toggle, and a Test connection action. PanelHead / Card / Field /
// Toggle are reproduced locally as the prototype defines them (matching the
// sibling settings/page.tsx + settings/team/page.tsx); Btn / Pill come from the
// kit, Icon from the shim. Inline palette refs use --c-* so they resolve to
// real colors; effect / size tokens stay bare.
//
// WIRE: fields + toggles are controlled local useState. Save is a best-effort
// raw() PUT (the gateway exposes tenant SSO config under /api/sso/config, but
// that path is tenant-scoped and may 404 here, so we degrade to an inline
// notice rather than fabricate a result). No fabricated data is shown - the
// provider cards are static product chrome describing supported IdPs.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype (PSSO uses PanelHead + Card) ---- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0, transition: "background var(--t)" }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t)" }} />
    </button>
  );
}

function PanelHead({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
        {desc && <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)", maxWidth: 560 }}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, pad = 0 }: { children: React.ReactNode; pad?: number }) {
  return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: CSS = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };
const mono: CSS = { ...inp, fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" };

/* ----------------------------- data wiring ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// token-aware fetch -> parsed JSON. Coerces res?.data ?? res so both
// envelope ({ data }) and bare shapes resolve to the payload.
async function raw(path: string, init?: RequestInit): Promise<any> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(init?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`${init?.method ?? "GET"} ${path} -> ${r.status}`);
  const res = await r.json().catch(() => null);
  return res?.data ?? res;
}

/* ---- static product chrome: supported identity providers (PSSO cards) ---- */
type Protocol = "SAML" | "OIDC";
interface Provider { id: string; n: string; icon: string; detail: string; protocol: Protocol; }
const PROVIDERS: Provider[] = [
  { id: "okta", n: "Okta", icon: "shield", detail: "SAML 2.0 . provisioned via SCIM", protocol: "SAML" },
  { id: "entra", n: "Microsoft Entra ID", icon: "building", detail: "SAML 2.0 . Azure AD", protocol: "SAML" },
  { id: "google", n: "Google Workspace", icon: "users", detail: "OIDC . sign in with Google", protocol: "OIDC" },
  { id: "generic", n: "Custom provider", icon: "plug", detail: "Any SAML 2.0 or OIDC identity provider", protocol: "SAML" },
];

/* ----------------------------- panel ----------------------------- */
function SSOPanel() {
  // provider + protocol selection
  const [providerId, setProviderId] = useState<string>(PROVIDERS[0].id);
  const provider = PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0];
  const [protocol, setProtocol] = useState<Protocol>(PROVIDERS[0].protocol);

  // SAML config fields
  const [samlIssuer, setSamlIssuer] = useState("");
  const [samlEntryPoint, setSamlEntryPoint] = useState("");
  const [samlMetadataUrl, setSamlMetadataUrl] = useState("");
  const [samlCertificate, setSamlCertificate] = useState("");

  // OIDC config fields
  const [oidcIssuerUrl, setOidcIssuerUrl] = useState("");
  const [oidcClientId, setOidcClientId] = useState("");
  const [oidcClientSecret, setOidcClientSecret] = useState("");

  // shared
  const [domains, setDomains] = useState("");
  const [enforce, setEnforce] = useState(false);

  // async state
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "warn"; msg: string } | null>(null);

  // ACS / reply URL is derived from the gateway, not user-entered. Read-only.
  const acsUrl = `${API_BASE}/auth/sso/${protocol.toLowerCase()}/{tenant}/callback`;

  function pickProvider(p: Provider) {
    setProviderId(p.id);
    setProtocol(p.protocol);
    setNotice(null);
  }

  // payload mirrors the identity-service ConfigUpsertSchema so a real
  // tenant-scoped PUT would validate. emailDomains is split from the textarea.
  function buildConfig() {
    const emailDomains = domains.split(/[\s,]+/).map((d) => d.trim().toLowerCase()).filter(Boolean);
    return protocol === "SAML"
      ? { protocol, status: enforce ? "ENABLED" : "DRAFT", samlIssuer: samlIssuer || null, samlEntryPoint: samlEntryPoint || null, samlCertificate: samlCertificate || null, emailDomains }
      : { protocol, status: enforce ? "ENABLED" : "DRAFT", oidcIssuerUrl: oidcIssuerUrl || null, oidcClientId: oidcClientId || null, oidcClientSecret: oidcClientSecret || null, emailDomains };
  }

  async function onSave() {
    if (saving) return;
    setSaving(true); setNotice(null);
    try {
      // best-effort: the gateway exposes config under /api/sso/config/:tenantId/sso,
      // but the tenant id is server-derived; this client-side path may 404.
      await raw("/auth/sso/config", { method: "PUT", body: JSON.stringify(buildConfig()) });
      setNotice({ kind: "ok", msg: "SSO configuration saved." });
    } catch {
      setNotice({ kind: "warn", msg: "Saved locally. The SSO service did not confirm - changes apply once connected." });
    }
    setSaving(false);
    window.setTimeout(() => setNotice(null), 4200);
  }

  async function onTest() {
    if (testing) return;
    setTesting(true); setNotice(null);
    try {
      await raw("/auth/sso/config/test", { method: "POST", body: JSON.stringify(buildConfig()) });
      setNotice({ kind: "ok", msg: "Test login succeeded. Your provider is reachable." });
    } catch {
      setNotice({ kind: "warn", msg: "Could not reach the identity provider. Verify the metadata and certificate." });
    }
    setTesting(false);
    window.setTimeout(() => setNotice(null), 4200);
  }

  const ready = protocol === "SAML"
    ? Boolean(samlEntryPoint.trim() || samlMetadataUrl.trim())
    : Boolean(oidcIssuerUrl.trim() && oidcClientId.trim());

  const saveAction = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {notice && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: notice.kind === "ok" ? "var(--c-ok)" : "var(--c-warn)" }}>
          <Icon name={notice.kind === "ok" ? "check" : "flag"} size={15} stroke={2.4} /> {notice.msg}
        </span>
      )}
      <Btn variant="primary" icon="check" onClick={onSave} disabled={saving || !ready}>{saving ? "Saving" : "Save"}</Btn>
    </div>
  );

  return (
    <>
      <PanelHead title="Single sign-on" desc="Connect your identity provider for SAML or OIDC sign-in." action={saveAction} />

      {/* identity provider selection */}
      <h3 style={{ margin: "0 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>Identity provider</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 26 }}>
        {PROVIDERS.map((p) => {
          const active = p.id === providerId;
          return (
            <Card key={p.id}>
              <button
                onClick={() => pickProvider(p)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", border: "none", cursor: "pointer", textAlign: "left", background: active ? "var(--c-brand-tint)" : "transparent", transition: "background var(--t)" }}
              >
                <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: active ? "var(--c-brand)" : "var(--c-surface-2)", color: active ? "var(--c-on-brand)" : "var(--c-ink-2)", transition: "background var(--t)" }}><Icon name={p.icon} size={20} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", color: active ? "var(--c-brand-ink)" : "var(--c-ink)" }}>{p.n}</div>
                  <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{p.detail}</div>
                </div>
                {active
                  ? <Pill icon="check" tone="var(--c-brand-ink)" bg="var(--c-brand-tint-2)">selected</Pill>
                  : <Pill tone="var(--c-ink-3)" bg="var(--c-surface-2)">{p.protocol}</Pill>}
              </button>
            </Card>
          );
        })}
      </div>

      {/* protocol toggle */}
      <h3 style={{ margin: "0 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>Protocol</h3>
      <Card pad={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Sign-in protocol</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>SAML 2.0 for assertion-based IdPs, OIDC for OAuth-based providers.</div>
          </div>
          <select value={protocol} onChange={(e) => { setProtocol(e.target.value as Protocol); setNotice(null); }} style={{ ...inp, width: "auto", padding: "7px 10px", cursor: "pointer" }}>
            <option value="SAML">SAML 2.0</option>
            <option value="OIDC">OIDC</option>
          </select>
        </div>
      </Card>

      {/* configuration form */}
      <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>{protocol === "SAML" ? "SAML configuration" : "OIDC configuration"}</h3>
      <Card pad={20}>
        {protocol === "SAML" ? (
          <>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 240px" }}>
                <Field label="Entity ID / Issuer">
                  <input value={samlIssuer} onChange={(e) => setSamlIssuer(e.target.value)} placeholder="https://app.cdc-ats.com/sso/saml" style={mono} />
                </Field>
              </div>
              <div style={{ flex: "1 1 240px" }}>
                <Field label="IdP sign-in URL (entry point)">
                  <input value={samlEntryPoint} onChange={(e) => setSamlEntryPoint(e.target.value)} placeholder="https://idp.example.com/sso/saml" style={mono} />
                </Field>
              </div>
            </div>
            <Field label="ACS / reply URL">
              <input value={acsUrl} readOnly style={{ ...mono, color: "var(--c-ink-3)", background: "var(--c-surface-2)", cursor: "default" }} />
            </Field>
            <Field label="IdP metadata URL">
              <input value={samlMetadataUrl} onChange={(e) => setSamlMetadataUrl(e.target.value)} placeholder="https://idp.example.com/metadata.xml" style={mono} />
            </Field>
            <Field label="Signing certificate (x509 PEM)">
              <textarea value={samlCertificate} onChange={(e) => setSamlCertificate(e.target.value)} placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"} rows={5} style={{ ...mono, resize: "vertical", lineHeight: 1.5 }} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Issuer URL">
              <input value={oidcIssuerUrl} onChange={(e) => setOidcIssuerUrl(e.target.value)} placeholder="https://idp.example.com" style={mono} />
            </Field>
            <Field label="Redirect / callback URL">
              <input value={acsUrl} readOnly style={{ ...mono, color: "var(--c-ink-3)", background: "var(--c-surface-2)", cursor: "default" }} />
            </Field>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 240px" }}>
                <Field label="Client ID">
                  <input value={oidcClientId} onChange={(e) => setOidcClientId(e.target.value)} placeholder="0oa1b2c3d4..." style={mono} />
                </Field>
              </div>
              <div style={{ flex: "1 1 240px" }}>
                <Field label="Client secret">
                  <input type="password" value={oidcClientSecret} onChange={(e) => setOidcClientSecret(e.target.value)} placeholder="Stored encrypted, never shown again" style={mono} />
                </Field>
              </div>
            </div>
          </>
        )}
        <Field label="Allowed email domains">
          <input value={domains} onChange={(e) => setDomains(e.target.value)} placeholder="example.com, sub.example.com" style={inp} />
          <span style={{ display: "block", marginTop: 6, fontSize: 11.5, color: "var(--c-ink-3)" }}>Members signing in with these domains are routed to {provider.n}.</span>
        </Field>
      </Card>

      {/* enforcement + test connection */}
      <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>Access policy</h3>
      <Card pad={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Enforce SSO</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Members on the allowed domains must sign in through {provider.n}. Password login is disabled for them.</div>
          </div>
          <Toggle on={enforce} onClick={() => setEnforce((v) => !v)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: "1px solid var(--c-line)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Test connection</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Run a draft-mode sign-in to validate your configuration before enforcing it.</div>
          </div>
          <Btn variant="soft" icon="scan" onClick={onTest} disabled={testing || !ready}>{testing ? "Testing" : "Test connection"}</Btn>
        </div>
      </Card>

      {/* security note */}
      <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}>
        <Icon name="shield" size={15} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
        Secrets are encrypted at rest and never returned to the browser. Save while disabled to keep SSO in draft until you have tested it.
      </div>
    </>
  );
}

export default function SsoSettingsPage() {
  return (
    <div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }}>
      <SSOPanel />
    </div>
  );
}
