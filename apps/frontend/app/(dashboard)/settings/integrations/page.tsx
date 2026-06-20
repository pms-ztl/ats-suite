"use client";
// app/(dashboard)/settings/integrations/page.tsx - EXACT Claude Design "Aurora"
// settings, the Integrations marketplace right-panel (claude-design/"Settings
// Extras.html" -> marketplace()). The settings layout already renders the left
// settings-nav rail + a <section> wrapper, so this file is ONLY the right-panel
// content: the marketplace header (with a "Request integration" action), a
// search box, category filter pills, and the grid of connector cards (logo
// badge / name / category / blurb + Connect or Configure by connection status,
// grouped by category). PanelHead / Card are reproduced locally as the sibling
// settings pages define them; Btn / Pill come from the kit, Icon from the shim.
// Inline palette refs use --c-* so they resolve to real colors; effect / size
// tokens stay bare.
//
// WIRE: the connector catalog is static product chrome (the marketplace lists
// the supported tools). Connect / Configure flips local connected-state and
// fires a best-effort raw() POST to /integrations that degrades gracefully when
// the gateway does not expose it. The category filter + search are client-only.
//
// WF8 (Slice H6): the "Assessment providers" panel BELOW the marketplace is REAL
// and wired to the live /api/integrations CRUD (notification-service
// TenantIntegration store). It lets a tenant ADMIN add/configure online-
// assessment (OA) vendor credentials for the five WF8 kinds (hackerrank,
// codility, hackerearth, imocha, testgorilla). It is shown ONLY when the
// `oa-assessments` module is enabled for the tenant (useModules), and config is
// only editable by ADMIN (useIsAdmin), mirroring the requireTenantAdmin gate on
// the PUT/DELETE routes. Secret fields are WRITE-ONLY: the redacted GET returns
// at most a "…1234" hint (never the real value), the input always renders empty,
// and an empty secret field is OMITTED from the PUT so the saved secret is
// preserved untouched. Honest empty state when nothing is configured yet.
import { useEffect, useMemo, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { useModules } from "@/hooks/use-modules";
import { useIsAdmin } from "@/hooks/use-current-user";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the sibling settings panels ---- */
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

/* ----------------------------- data wiring ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// token-aware fetch -> parsed JSON. Best-effort: callers wrap this so a missing
// gateway endpoint degrades gracefully (the marketplace stays interactive).
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

/* ---- static product chrome: the connector catalog (prototype) ---- */
const CATEGORIES = ["All", "Job boards", "HRIS", "Background checks", "Communication", "Calendar"] as const;

interface Connector { key: string; name: string; abbr: string; color: string; category: string; blurb: string; connected: boolean; }

// color refs use --c-* so they resolve to real palette colors.
const CONNECTORS: Connector[] = [
  { key: "slack", name: "Slack", abbr: "SL", color: "var(--c-ai)", category: "Communication", blurb: "Real-time hiring alerts and approvals in your channels.", connected: true },
  { key: "workday", name: "Workday", abbr: "WD", color: "var(--c-info)", category: "HRIS", blurb: "Bi-directional sync of workers, positions, and hires.", connected: true },
  { key: "google-calendar", name: "Google Calendar", abbr: "GC", color: "var(--c-brand)", category: "Calendar", blurb: "Two-way interview scheduling and availability.", connected: true },
  { key: "checkr", name: "Checkr", abbr: "CK", color: "var(--c-ok)", category: "Background checks", blurb: "Automated, FCRA-compliant background screening.", connected: true },
  { key: "linkedin", name: "LinkedIn", abbr: "LI", color: "var(--c-info)", category: "Job boards", blurb: "Post jobs and source candidates from LinkedIn.", connected: false },
  { key: "indeed", name: "Indeed", abbr: "IN", color: "var(--c-info)", category: "Job boards", blurb: "Sponsored and organic postings to Indeed.", connected: false },
  { key: "greenhouse", name: "Greenhouse", abbr: "GH", color: "var(--c-brand)", category: "HRIS", blurb: "Migrate or sync data with Greenhouse ATS.", connected: false },
  { key: "successfactors", name: "SuccessFactors", abbr: "SF", color: "var(--c-info)", category: "HRIS", blurb: "SAP SuccessFactors employee-data sync.", connected: false },
  { key: "twilio", name: "Twilio", abbr: "TW", color: "var(--c-danger)", category: "Communication", blurb: "SMS reminders and candidate notifications.", connected: true },
];

const searchBox: CSS = { display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 38, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", marginBottom: 14 };

/* =====================================================================
 * WF8 (H6): live assessment-provider (OA) credential configuration
 * =====================================================================
 * The five OA vendor kinds, with the exact config fields the
 * notification-service AssessmentConfigSchema accepts. Each field is marked
 * `secret` (must NEVER be echoed back; write-only / masked) or non-secret
 * routing config (subdomain / region / baseUrl, safe to display + edit).
 *
 * The kind values match INTEGRATION_KINDS in
 * notification-service/src/lib/integration-config.ts; the secret-field sets
 * match SECRET_FIELDS there so the masked GET hint lines up with the inputs. */
const OA_MODULE_KEY = "oa-assessments";

interface ProviderField {
  key: string;
  label: string;
  /** Write-only: never pre-filled, empty value is omitted from the save. */
  secret: boolean;
  placeholder: string;
  help?: string;
}

interface AssessmentProvider {
  kind: string;
  name: string;
  abbr: string;
  color: string;
  blurb: string;
  fields: ProviderField[];
}

// One credential field set per vendor, derived from the real adapter auth shapes
// (HackerEarth client_id/secret; Codility Bearer token; iMocha x-api-key;
// TestGorilla Token; HackerRank Basic/Bearer v3). `subdomain` / `region` /
// `baseUrl` are non-secret routing config; everything else is a secret.
const ASSESSMENT_PROVIDERS: AssessmentProvider[] = [
  {
    kind: "hackerrank", name: "HackerRank", abbr: "HR", color: "var(--c-ok)",
    blurb: "Technical coding assessments. Results sync via polling (no per-invite webhook).",
    fields: [
      { key: "apiKey", label: "API key", secret: true, placeholder: "Paste your HackerRank API key", help: "HackerRank for Work → Settings → API. Stored encrypted." },
      { key: "apiToken", label: "API token (optional)", secret: true, placeholder: "Bearer token, if your account uses one" },
      { key: "baseUrl", label: "Base URL (optional)", secret: false, placeholder: "https://www.hackerrank.com/x/api/v3" },
    ],
  },
  {
    kind: "codility", name: "Codility", abbr: "CO", color: "var(--c-info)",
    blurb: "Coding tests with event callbacks. Bearer-token authenticated.",
    fields: [
      { key: "apiToken", label: "API token", secret: true, placeholder: "Paste your Codility Bearer token", help: "Codility → Account → API tokens. Stored encrypted." },
      { key: "webhookSecret", label: "Webhook secret (optional)", secret: true, placeholder: "Signing secret for event callbacks" },
      { key: "baseUrl", label: "Base URL (optional)", secret: false, placeholder: "https://app.codility.com/api" },
    ],
  },
  {
    kind: "hackerearth", name: "HackerEarth", abbr: "HE", color: "var(--c-brand)",
    blurb: "Developer assessments. Authenticates with a client ID + secret pair.",
    fields: [
      { key: "apiKey", label: "Client ID", secret: true, placeholder: "Paste your HackerEarth client_id", help: "HackerEarth Assessment → Integrations. Stored encrypted." },
      { key: "clientSecret", label: "Client secret", secret: true, placeholder: "Paste your HackerEarth secret" },
      { key: "webhookSecret", label: "Webhook secret (optional)", secret: true, placeholder: "Report-callback signing secret" },
    ],
  },
  {
    kind: "imocha", name: "iMocha", abbr: "IM", color: "var(--c-ai)",
    blurb: "Skills assessments across roles. Authenticates with an x-api-key.",
    fields: [
      { key: "apiKey", label: "API key", secret: true, placeholder: "Paste your iMocha x-api-key", help: "iMocha → Settings → API key. Stored encrypted." },
      { key: "webhookSecret", label: "Webhook secret (optional)", secret: true, placeholder: "Callback signing secret" },
      { key: "region", label: "Region (optional)", secret: false, placeholder: "e.g. us, eu" },
    ],
  },
  {
    kind: "testgorilla", name: "TestGorilla", abbr: "TG", color: "var(--c-warn)",
    blurb: "Pre-employment screening assessments. Token-authenticated.",
    fields: [
      { key: "apiKey", label: "API token", secret: true, placeholder: "Paste your TestGorilla token", help: "TestGorilla → Settings → API. Stored encrypted." },
      { key: "webhookSecret", label: "Webhook secret (optional)", secret: true, placeholder: "Callback signing secret" },
      { key: "subdomain", label: "Subdomain (optional)", secret: false, placeholder: "your-org" },
    ],
  },
];

// A redacted integration row as returned by GET /api/integrations: secret fields
// are already masked server-side (e.g. "…1234" or "set"); non-secret fields are
// the real saved values. We NEVER receive the real secret here.
interface IntegrationRow { kind: string; enabled: boolean; config: Record<string, unknown>; }

/* ----------------------------- one card ----------------------------- */
function ConnectorCard({ c, connected, busy, onToggle }: { c: Connector; connected: boolean; busy: boolean; onToggle: () => void }) {
  return (
    <div
      style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", padding: 16, transition: "transform var(--t), box-shadow var(--t), border-color var(--t)" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--e3)"; e.currentTarget.style.borderColor = "var(--c-line-strong)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--e1)"; e.currentTarget.style.borderColor = "var(--c-line)"; }}
    >
      <div style={{ display: "flex", gap: 11, alignItems: "center", marginBottom: 11 }}>
        <span className="mono" style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0, fontWeight: 800, fontSize: 14, background: `color-mix(in oklab, ${c.color} 16%, var(--c-surface))`, color: c.color }}>{c.abbr}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700 }}>{c.name}</div>
          <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{c.category}</div>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45, minHeight: 51 }}>{c.blurb}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        {connected ? (
          <>
            <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">Connected</Pill>
            <Btn variant="ghost" size="sm" onClick={onToggle} disabled={busy}>{busy ? "Working" : "Configure"}</Btn>
          </>
        ) : (
          <>
            <span />
            <Btn variant="primary" size="sm" onClick={onToggle} disabled={busy}>{busy ? "Connecting" : "Connect"}</Btn>
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- panel ----------------------------- */
function MarketplacePanel() {
  // connected-state lives locally, seeded from the catalog; Connect/Configure flips it.
  const [connected, setConnected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CONNECTORS.map((c) => [c.key, c.connected]))
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");

  async function onToggle(c: Connector) {
    if (busy) return;
    const next = !connected[c.key];
    setBusy(c.key);
    try {
      // best-effort: the gateway may not expose connector management yet.
      await raw("/integrations", { method: "POST", body: JSON.stringify({ provider: c.key, action: next ? "connect" : "disconnect" }) });
    } catch {
      // graceful: flip the local state regardless so the marketplace stays usable.
    }
    setConnected((prev) => ({ ...prev, [c.key]: next }));
    setBusy(null);
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONNECTORS.filter((c) => (cat === "All" || c.category === cat) && (!q || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.blurb.toLowerCase().includes(q)));
  }, [cat, query]);

  return (
    <>
      <PanelHead
        title="Integrations marketplace"
        desc="Connect TalentFlow to the tools your team already uses. 40+ integrations and counting."
        action={<Btn variant="soft" size="sm" icon="plus">Request integration</Btn>}
      />

      {/* search */}
      <div style={searchBox}>
        <Icon name="search" size={16} style={{ color: "var(--c-ink-3)", flexShrink: 0 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search integrations..."
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }}
        />
      </div>

      {/* category filter pills */}
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
        {CATEGORIES.map((c) => {
          const on = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{ padding: "6px 13px", borderRadius: "var(--r-pill)", border: on ? "1px solid transparent" : "1px solid var(--c-line-2)", background: on ? "var(--c-brand-tint)" : "var(--c-surface)", fontSize: 12.5, fontWeight: 600, color: on ? "var(--c-brand-ink)" : "var(--c-ink-2)", cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* connector grid */}
      {visible.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {visible.map((c) => (
            <ConnectorCard key={c.key} c={c} connected={!!connected[c.key]} busy={busy === c.key} onToggle={() => onToggle(c)} />
          ))}
        </div>
      ) : (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>
          No integrations match your search.
        </div>
      )}
    </>
  );
}

/* ============================================================
 * WF8 (H6): one assessment-provider configuration card (live)
 * ============================================================ */
function ProviderCard({
  provider, row, canEdit, onSaved,
}: {
  provider: AssessmentProvider;
  row?: IntegrationRow;
  canEdit: boolean;
  onSaved: () => void;
}) {
  const configured = !!row;
  const [open, setOpen] = useState(false);
  // Draft starts EMPTY for secrets (write-only) and seeded from the saved
  // NON-SECRET routing fields so admins can edit them without retyping. A secret
  // input left blank means "keep the existing saved secret".
  const initialDraft = () => {
    const d: Record<string, string> = {};
    for (const f of provider.fields) {
      if (f.secret) { d[f.key] = ""; continue; }
      const v = row?.config?.[f.key];
      d[f.key] = typeof v === "string" ? v : "";
    }
    return d;
  };
  const [draft, setDraft] = useState<Record<string, string>>(initialDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setDraft(initialDraft());
    setError(null);
    setOpen(true);
  }

  // The masked hint the server returned for a saved secret (e.g. "…1234"), shown
  // as the placeholder so the admin can confirm a key is set without ever seeing
  // it. Never the real value.
  function savedHint(f: ProviderField): string | null {
    if (!f.secret) return null;
    const v = row?.config?.[f.key];
    return typeof v === "string" && v.length > 0 ? v : null;
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    setError(null);
    // Build the config payload. Non-secret fields always go through (so they can
    // be cleared/updated). Secret fields go through ONLY when the admin typed a
    // new value. A blank secret is omitted so the stored secret is preserved.
    const config: Record<string, string> = {};
    for (const f of provider.fields) {
      const val = (draft[f.key] ?? "").trim();
      if (f.secret) { if (val) config[f.key] = val; }
      else if (val) config[f.key] = val;
    }
    // On first-time setup the schema requires at least one credential.
    if (!configured) {
      const hasCred = ["apiKey", "apiToken", "clientSecret"].some((k) => config[k]);
      if (!hasCred) {
        setError("Enter at least one credential to connect this provider.");
        setBusy(false);
        return;
      }
    }
    try {
      await raw(`/integrations/${provider.kind}`, {
        method: "PUT",
        body: JSON.stringify({ config, enabled: true }),
      });
      setOpen(false);
      onSaved();
    } catch (e: any) {
      setError(e?.message?.includes("403") ? "You do not have permission to change integrations." : "Could not save. Check the credentials and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await raw(`/integrations/${provider.kind}`, { method: "DELETE" });
      setOpen(false);
      onSaved();
    } catch (e: any) {
      setError("Could not remove this integration.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", padding: 16 }}>
      <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
        <span className="mono" style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0, fontWeight: 800, fontSize: 14, background: `color-mix(in oklab, ${provider.color} 16%, var(--c-surface))`, color: provider.color }}>{provider.abbr}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700 }}>{provider.name}</div>
          <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>Assessment provider</div>
        </div>
        {configured
          ? <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">Configured</Pill>
          : <Pill tone="var(--c-ink-3)" bg="var(--c-surface-3)">Not connected</Pill>}
      </div>
      <p style={{ margin: "11px 0 0", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45 }}>{provider.blurb}</p>

      {!open ? (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          {canEdit ? (
            <Btn variant={configured ? "ghost" : "primary"} size="sm" icon={configured ? "settings" : "plug"} onClick={startEdit}>
              {configured ? "Configure" : "Connect"}
            </Btn>
          ) : (
            <span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>Admin only</span>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gap: 11 }}>
          {provider.fields.map((f) => {
            const hint = savedHint(f);
            return (
              <label key={f.key} style={{ display: "grid", gap: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)" }}>{f.label}</span>
                <input
                  type={f.secret ? "password" : "text"}
                  autoComplete="off"
                  value={draft[f.key] ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={hint ? `Saved (${hint}), leave blank to keep` : f.placeholder}
                  style={{ height: 36, padding: "0 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)", outline: "none" }}
                />
                {f.help && <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{f.help}</span>}
              </label>
            );
          })}

          {error && (
            <div role="alert" style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 11px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: 12 }}>
              <Icon name="x" size={14} />{error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 2 }}>
            <div>
              {configured && (
                <Btn variant="ghost" size="sm" icon="x" onClick={remove} disabled={busy} style={{ color: "var(--c-danger)" }}>Remove</Btn>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" size="sm" onClick={() => { setOpen(false); setError(null); }} disabled={busy}>Cancel</Btn>
              <Btn variant="primary" size="sm" icon="check" onClick={save} disabled={busy}>{busy ? "Saving" : "Save"}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * WF8 (H6): the live "Assessment providers" panel
 * ============================================================ */
function AssessmentProvidersPanel() {
  const isAdmin = useIsAdmin();
  const [rows, setRows] = useState<IntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await raw("/integrations");
      const list: IntegrationRow[] = Array.isArray(data) ? data : [];
      setRows(list);
    } catch (e: any) {
      setLoadError("Could not load integrations.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Index saved rows for just the assessment kinds.
  const byKind = useMemo(() => {
    const m: Record<string, IntegrationRow> = {};
    for (const r of rows) {
      if (ASSESSMENT_PROVIDERS.some((p) => p.kind === r.kind)) m[r.kind] = r;
    }
    return m;
  }, [rows]);

  const configuredCount = Object.keys(byKind).length;

  return (
    <div style={{ marginTop: 36, paddingTop: 28, borderTop: "1px solid var(--c-line)" }}>
      <PanelHead
        title="Assessment providers"
        desc="Connect an online-assessment vendor so candidates can be invited to coding and skills tests. Credentials are encrypted at rest and never shown again after saving."
      />

      {!isAdmin && (
        <div role="note" style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-surface-2)", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)", marginBottom: 16, border: "1px solid var(--c-line-2)" }}>
          <Icon name="shield" size={15} />Only workspace admins can add or change assessment-provider credentials.
        </div>
      )}

      {loadError && (
        <div role="alert" style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: "var(--fs-sm)", marginBottom: 16 }}>
          <Icon name="x" size={15} />{loadError}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>Loading providers…</div>
      ) : (
        <>
          {configuredCount === 0 && (
            <div style={{ padding: "16px 18px", marginBottom: 16, borderRadius: "var(--r-lg)", border: "1px dashed var(--c-line-2)", background: "var(--c-surface-2)", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>
              No assessment provider is configured yet.{isAdmin ? " Choose a provider below and add its credentials to start inviting candidates to tests." : " Ask a workspace admin to connect one."}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {ASSESSMENT_PROVIDERS.map((p) => (
              <ProviderCard key={p.kind} provider={p} row={byKind[p.kind]} canEdit={isAdmin} onSaved={load} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function IntegrationsSettingsPage() {
  // Surface the assessment-provider panel ONLY when the oa-assessments module is
  // enabled for this tenant. useModules fails SOFT (allEnabled=true) when the
  // gating route is absent, so the panel still appears in environments where
  // module resolution is not deployed, matching the gateway's fail-soft posture.
  const { enabledKeys, allEnabled } = useModules();
  const oaEnabled = allEnabled || (enabledKeys?.includes(OA_MODULE_KEY) ?? false);

  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      <MarketplacePanel />
      {oaEnabled && <AssessmentProvidersPanel />}
    </div>
  );
}
