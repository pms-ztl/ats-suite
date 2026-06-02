"use client";
// app/(dashboard)/integrations/page.tsx - EXACT Claude Design "Aurora" integrations
// marketplace (IntegrationsScreen). Ported from claude-design/screen-extra.jsx +
// screen-settings.jsx (the PIntegrations connector grid + INTEGRATIONS catalog),
// enriched into the full marketplace: a connected band, a connected-integrations
// grid (Manage), and the available catalog grouped into category sections with
// per-integration cards (logo tile + name + description + Connect/Manage).
//
// Built from the aurora kit (Btn / Pill / SectionCard / Reveal) + aurora
// components; Icon from the aurora shim. Inline-styled with the --c-* palette
// tokens; effect/size tokens (--r-*, --e*, --t*) are used bare.
//
// The catalog (names, categories, descriptions, icons) is static product chrome
// kept verbatim from the prototype. Connect / Manage toggle a local connected
// state via useState. Connecting also makes a best-effort POST to /integrations
// through the gateway; on any failure the local toggle still applies so the UI
// never gets stuck (graceful fallback).
import { useState } from "react";
import { Btn, Pill, SectionCard, Reveal, Greeting } from "@/components/aurora-kit";
import { EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const body: any = await res.json();
  return body?.data ?? body;
}

/* ------------------------------- catalog ------------------------------- */
// Verbatim from the prototype INTEGRATIONS, plus a one-line description per
// connector (static chrome). `st` is the seed state; live state lives in React.
type Integration = { id: string; n: string; cat: string; icon: string; desc: string; st: "connected" | "available" };
const INTEGRATIONS: Integration[] = [
  { id: "slack", n: "Slack", cat: "Notifications", icon: "bolt", st: "connected", desc: "Post hiring updates and decision alerts to your channels." },
  { id: "workday", n: "Workday", cat: "HRIS", icon: "building", st: "connected", desc: "Sync new hires and offers straight into your HRIS." },
  { id: "gcal", n: "Google Calendar", cat: "Scheduling", icon: "calendar", st: "connected", desc: "Book interviews and find times across panel calendars." },
  { id: "linkedin", n: "LinkedIn", cat: "Sourcing", icon: "radar", st: "available", desc: "Source passive talent and post open roles to your network." },
  { id: "greenhouse", n: "Greenhouse", cat: "ATS sync", icon: "briefcase", st: "available", desc: "Import candidates and keep pipelines in step across systems." },
  { id: "checkr", n: "Checkr", cat: "Background check", icon: "shield", st: "available", desc: "Run compliant background checks at the offer stage." },
];

// Category accent palette for the section headers and logo tiles.
const CAT_ACCENT: Record<string, [string, string]> = {
  Notifications: ["var(--c-ai)", "var(--c-ai-tint)"],
  HRIS: ["var(--c-info)", "var(--c-info-tint)"],
  Scheduling: ["var(--c-brand)", "var(--c-brand-tint)"],
  Sourcing: ["var(--c-ai)", "var(--c-ai-tint)"],
  "ATS sync": ["var(--c-info)", "var(--c-info-tint)"],
  "Background check": ["var(--c-warn)", "var(--c-warn-tint)"],
};

/* ----------------------------- integration card ----------------------------- */
function Connector({
  it, connected, busy, onConnect, onManage, i,
}: { it: Integration; connected: boolean; busy: boolean; onConnect: () => void; onManage: () => void; i: number }) {
  const [ac, ab] = CAT_ACCENT[it.cat] ?? ["var(--c-ink-2)", "var(--c-surface-2)"];
  return (
    <Reveal i={i}>
      <div
        style={{
          display: "flex", flexDirection: "column", gap: 12, height: "100%",
          background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)",
          boxShadow: "var(--e1)", padding: 16,
          transition: "transform var(--t) var(--ease-out), box-shadow var(--t), border-color var(--t)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--e2)"; e.currentTarget.style.borderColor = `color-mix(in oklab, ${ac} 35%, var(--c-line))`; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--e1)"; e.currentTarget.style.borderColor = "var(--c-line)"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", flexShrink: 0, background: connected ? ab : "var(--c-surface-2)", color: connected ? ac : "var(--c-ink-2)" }}>
            <Icon name={it.icon} size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{it.n}</div>
            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{it.cat}</div>
          </div>
          {connected && <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">Connected</Pill>}
        </div>
        <p style={{ margin: 0, flex: 1, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>{it.desc}</p>
        <div style={{ display: "flex", gap: 8 }}>
          {connected ? (
            <Btn variant="soft" size="sm" icon="settings" onClick={onManage} style={{ flex: 1, justifyContent: "center" }}>Manage</Btn>
          ) : (
            <Btn variant="primary" size="sm" icon="plus" onClick={onConnect} disabled={busy} style={{ flex: 1, justifyContent: "center" }}>
              {busy ? "Connecting..." : "Connect"}
            </Btn>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------- page -------------------------------- */
export default function IntegrationsPage() {
  // Local connected-state, seeded from the catalog. Connect / Manage toggle it.
  const [state, setState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(INTEGRATIONS.map((it) => [it.id, it.st === "connected"]))
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function connect(it: Integration) {
    setBusy(it.id);
    // Best-effort gateway write; the local toggle applies regardless of result.
    try { await raw("/integrations", { method: "POST", body: JSON.stringify({ provider: it.id }) }); } catch {}
    setState((s) => ({ ...s, [it.id]: true }));
    setBusy(null);
  }
  function manage(it: Integration) {
    // Manage disconnects in this demo surface; a real flow would open settings.
    setState((s) => ({ ...s, [it.id]: false }));
  }

  const connected = INTEGRATIONS.filter((it) => state[it.id]);
  const available = INTEGRATIONS.filter((it) => !state[it.id]);

  // Group the available catalog into category sections.
  const categories = Array.from(new Set(available.map((it) => it.cat)));

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Greeting title="Integrations" sub="Connect your ATS to the tools your team already uses.">
          <Pill icon="plug" tone="var(--c-brand-ink)" bg="var(--c-brand-tint)">{connected.length} connected</Pill>
          <Btn variant="soft" icon="search">Browse marketplace</Btn>
        </Greeting>

        {/* Connected */}
        <Reveal i={1}>
          <SectionCard
            title="Connected"
            icon="check"
            headRight={<Pill tone="var(--c-ok)" bg="var(--c-ok-tint)">{connected.length} active</Pill>}
            style={{ marginBottom: 18 }}
          >
            {connected.length === 0 ? (
              <EmptyState title="Nothing connected yet" body="Connect a tool below and it will appear here, ready to manage." />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {connected.map((it, i) => (
                  <Connector key={it.id} it={it} connected busy={busy === it.id} onConnect={() => connect(it)} onManage={() => manage(it)} i={i} />
                ))}
              </div>
            )}
          </SectionCard>
        </Reveal>

        {/* Available, grouped by category */}
        {available.length === 0 ? (
          <Reveal i={2}>
            <SectionCard title="Available" icon="plug">
              <EmptyState title="You are all set" body="Every integration in the marketplace is connected. Nice work." />
            </SectionCard>
          </Reveal>
        ) : (
          categories.map((cat, ci) => {
            const items = available.filter((it) => it.cat === cat);
            const [ac, ab] = CAT_ACCENT[cat] ?? ["var(--c-ink-2)", "var(--c-surface-2)"];
            return (
              <div key={cat} style={{ marginBottom: ci === categories.length - 1 ? 0 : 22 }}>
                <Reveal i={2 + ci}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "0 2px 12px" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", background: ab, color: ac }}>
                      <Icon name={items[0]?.icon ?? "plug"} size={15} />
                    </span>
                    <h2 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700, letterSpacing: "-0.01em" }}>{cat}</h2>
                    <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{items.length} available</span>
                  </div>
                </Reveal>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {items.map((it, i) => (
                    <Connector key={it.id} it={it} connected={false} busy={busy === it.id} onConnect={() => connect(it)} onManage={() => manage(it)} i={i} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
