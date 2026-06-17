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
import { useMemo, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

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

export default function IntegrationsSettingsPage() {
  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      <MarketplacePanel />
    </div>
  );
}
