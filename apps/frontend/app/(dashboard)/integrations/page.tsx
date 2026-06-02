"use client";
// app/(dashboard)/integrations/page.tsx - EXACT Claude Design "Aurora"
// Integrations marketplace. Ported from claude-design/screen-settings.jsx
// (PIntegrations panel) and screen-extra.jsx (IntegrationsScreen), reshaped
// into a connected vs available grid with category labels and per-integration
// cards (logo, name, description). Connect/Manage toggles local connected
// state, with a best-effort POST to /integrations and a graceful fallback.
import { useState } from "react";
import { Greeting, SectionCard, Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

// Inline gateway helper (DO NOT edit lib/api.ts). Best-effort; failures are
// swallowed so the local connected-state toggle still works offline.
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
  return res.json();
}

type Integration = {
  key: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  connected: boolean;
};

// Static product chrome, from the prototype's window.INTEGRATIONS catalog,
// enriched with a one-line description per tool.
const CATALOG: Integration[] = [
  { key: "slack", name: "Slack", category: "Notifications", icon: "bolt", connected: true, description: "Post pipeline updates and review nudges to a channel." },
  { key: "workday", name: "Workday", category: "HRIS", icon: "building", connected: true, description: "Sync hires and headcount with your system of record." },
  { key: "google-calendar", name: "Google Calendar", category: "Scheduling", icon: "calendar", connected: true, description: "Book interviews and hold rooms without leaving the ATS." },
  { key: "linkedin", name: "LinkedIn", category: "Sourcing", icon: "radar", connected: false, description: "Source passive candidates and import profiles in one click." },
  { key: "greenhouse", name: "Greenhouse", category: "ATS sync", icon: "briefcase", connected: false, description: "Two-way sync of requisitions and candidate stages." },
  { key: "checkr", name: "Checkr", category: "Background check", icon: "shield", connected: false, description: "Trigger background checks once an offer is accepted." },
];

function Logo({ it }: { it: Integration }) {
  return (
    <span
      style={{
        width: 42,
        height: 42,
        borderRadius: 11,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        background: it.connected ? "var(--c-brand-tint)" : "var(--c-surface-2)",
        color: it.connected ? "var(--c-brand)" : "var(--c-ink-2)",
      }}
    >
      <Icon name={it.icon} size={20} />
    </span>
  );
}

export default function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>(CATALOG);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(key: string) {
    const cur = items.find((i) => i.key === key);
    if (!cur) return;
    const next = !cur.connected;
    // Optimistic local toggle (the catalog is product chrome).
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, connected: next } : i)));
    setBusy(key);
    try {
      await raw("/integrations", {
        method: "POST",
        body: JSON.stringify({ provider: key, connected: next }),
      });
    } catch {
      // Gateway not wired for this provider, keep the optimistic local state.
    } finally {
      setBusy(null);
    }
  }

  const connected = items.filter((i) => i.connected);
  const available = items.filter((i) => !i.connected);

  const card = (it: Integration) => (
    <div
      key={it.key}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "15px 16px",
        borderRadius: "var(--r-lg)",
        border: "1px solid var(--c-line)",
        background: "var(--c-surface)",
      }}
    >
      <Logo it={it} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{it.name}</span>
          <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{it.category}</Pill>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 3, lineHeight: 1.45 }}>{it.description}</div>
      </div>
      {it.connected ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">on</Pill>
          <Btn variant="soft" size="sm" onClick={() => toggle(it.key)}>
            {busy === it.key ? "Saving..." : "Manage"}
          </Btn>
        </div>
      ) : (
        <Btn variant="primary" size="sm" icon="plus" onClick={() => toggle(it.key)} style={{ flexShrink: 0 }}>
          {busy === it.key ? "Connecting..." : "Connect"}
        </Btn>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Greeting title="Integrations" sub="Connect ATS to the tools your team already uses.">
        <Pill icon="plug" tone="var(--c-brand)" bg="var(--c-brand-tint)">
          {connected.length} connected
        </Pill>
      </Greeting>

      <div className="flex flex-col gap-4">
        <SectionCard title="Connected" icon="check">
          {connected.length === 0 ? (
            <div style={{ padding: "26px 8px", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>
              Nothing is connected yet. Pick a tool below to get started.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {connected.map(card)}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Available" icon="grid">
          {available.length === 0 ? (
            <div style={{ padding: "26px 8px", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>
              Every available integration is connected. Nice.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {available.map(card)}
            </div>
          )}
        </SectionCard>
      </div>

      <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--c-ink-3)", display: "flex", gap: 7, alignItems: "center" }}>
        <Icon name="shield" size={14} style={{ color: "var(--c-ok)" }} />
        Connections are scoped to this workspace and can be revoked at any time.
      </div>
    </div>
  );
}
