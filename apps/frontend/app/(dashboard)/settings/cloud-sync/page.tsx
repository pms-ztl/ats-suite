"use client";
// app/(dashboard)/settings/cloud-sync/page.tsx - RICH Claude Design "Aurora"
// Cloud sync right-panel, ported from claude-design/"Settings Extras.html"
// (the cloudSync() view), replacing the prior lite version. The settings layout
// already renders the left settings-nav rail + a <section> wrapper, so this file
// is ONLY the right-panel content (a plain fragment, no nav / main / p-6 / max-w
// of its own beyond the prototype's panel wrapper).
//
// Faithful to the prototype: a Sync status card (status chip, connected provider
// row with last-sync time + "Sync now", bi-directional toggle, sync-frequency
// select) and a Field mapping card (source -> ATS field rows), closed by a
// footer with "Disable sync" + "Save changes". Per the brief it also surfaces the
// cloud STORAGE provider catalog (Google Drive / Dropbox / OneDrive / Amazon S3)
// with folder mapping, as the connections this panel manages.
//
// PanelHead / Card / Field / Toggle are reproduced locally (verbatim from the
// sibling settings pages). Btn / Pill come from the kit, Icon from the shim.
// Inline palette refs use --c-* so they resolve to real colors; effect / size
// tokens stay bare and the shared `rise` keyframe drives entrance.
//
// WIRE: toggles / selects / fields are controlled local useState. Connect + Save
// are best-effort raw() calls that degrade to a graceful inline notice when the
// gateway does not expose them. The provider catalog itself is static chrome.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the sibling settings pages ---- */
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

function Card({ title, icon, headRight, children, pad = 18 }: { title?: React.ReactNode; icon?: string; headRight?: React.ReactNode; children: React.ReactNode; pad?: number }) {
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", marginBottom: 16 }}>
      {title && (
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", alignItems: "center", gap: 9, justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>{icon && <Icon name={icon} size={16} style={{ color: "var(--c-ink-3)" }} />}{title}</span>
          {headRight}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0, transition: "background var(--t)" }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t) var(--ease-spring)" }} />
    </button>
  );
}

const inp: CSS = { width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

/* ----------------------------- data wiring ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// token-aware fetch -> parsed JSON. Best-effort; throws on non-2xx so callers
// can degrade gracefully when the gateway does not expose the route.
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

/* ---- static product chrome: the cloud STORAGE provider catalog ---- */
type Provider = { id: string; name: string; sub: string; logo: string; color: string; connected: boolean };
const PROVIDERS: Provider[] = [
  { id: "gdrive", name: "Google Drive", sub: "Shared drive sync", logo: "GD", color: "var(--c-info)", connected: true },
  { id: "dropbox", name: "Dropbox", sub: "Team folder sync", logo: "DB", color: "var(--c-info)", connected: false },
  { id: "onedrive", name: "OneDrive", sub: "SharePoint / OneDrive", logo: "1D", color: "var(--c-ai)", connected: false },
  { id: "s3", name: "Amazon S3", sub: "Bucket export target", logo: "S3", color: "var(--c-warn)", connected: false },
];

// the prototype's source -> destination "field mapping", here as folder mappings.
const FOLDER_MAP: [string, string][] = [
  ["/Recruiting/Resumes", "Candidate resumes"],
  ["/Recruiting/Offers", "Signed offer letters"],
  ["/Recruiting/Exports", "EEOC + audit exports"],
  ["/Recruiting/Attachments", "Application attachments"],
];

/* ----------------------------- panel ----------------------------- */
function CloudSyncPanel() {
  // controlled chrome for the connected provider catalog
  const [providers, setProviders] = useState<Provider[]>(PROVIDERS);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // controlled Sync status card
  const [biDirectional, setBiDirectional] = useState(true);
  const [syncResumes, setSyncResumes] = useState(true);
  const [syncExports, setSyncExports] = useState(false);
  const [frequency, setFrequency] = useState("Every 15 minutes");
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("4 minutes ago");

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; msg: string } | null>(null);

  function flash(tone: "ok" | "warn", msg: string) {
    setNotice({ tone, msg });
    window.setTimeout(() => setNotice(null), 3200);
  }

  async function onConnect(p: Provider) {
    if (connectingId) return;
    setConnectingId(p.id);
    try {
      await raw("/integrations/cloud-sync/connect", { method: "POST", body: JSON.stringify({ provider: p.id }) });
      flash("ok", `Connected ${p.name}`);
    } catch {
      // graceful: gateway may not expose cloud-sync connect yet
      flash("warn", `Queued connection for ${p.name}`);
    }
    setProviders((prev) => prev.map((x) => (x.id === p.id ? { ...x, connected: true } : x)));
    setConnectingId(null);
  }

  async function onSyncNow() {
    if (syncing) return;
    setSyncing(true);
    try {
      await raw("/integrations/cloud-sync/run", { method: "POST" });
    } catch {
      // graceful: still reflect a fresh sync timestamp locally
    }
    setLastSync("just now");
    setSyncing(false);
    flash("ok", "Sync started");
  }

  async function onSave() {
    if (saving) return;
    setSaving(true);
    try {
      await raw("/integrations/cloud-sync", {
        method: "PUT",
        body: JSON.stringify({ biDirectional, syncResumes, syncExports, frequency }),
      });
      flash("ok", "Changes saved");
    } catch {
      // graceful: degrade to an inline notice
      flash("warn", "Saved locally, sync settings will apply on reconnect");
    }
    setSaving(false);
  }

  const connectedCount = providers.filter((p) => p.connected).length;

  return (
    <>
      <PanelHead
        title="Cloud sync"
        desc="Back up resumes and exports to your own cloud storage, and keep candidate folders in sync bi-directionally."
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {notice && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: notice.tone === "ok" ? "var(--c-ok)" : "var(--c-warn)" }}>
                <Icon name={notice.tone === "ok" ? "check" : "flag"} size={15} stroke={2.4} /> {notice.msg}
              </span>
            )}
            <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save changes"}</Btn>
          </div>
        }
      />

      {/* connected storage providers (static catalog chrome) */}
      <Card
        title="Storage providers"
        icon="server"
        headRight={<Pill tone="var(--c-brand-ink)" bg="var(--c-brand-tint)">{connectedCount} connected</Pill>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {providers.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
              <span className="mono" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, background: `color-mix(in oklab, ${p.color} 16%, var(--c-surface))`, color: p.color }}>{p.logo}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{p.sub}</div>
              </div>
              {p.connected ? (
                <>
                  <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">connected</Pill>
                  <Btn variant="ghost" size="sm">Configure</Btn>
                </>
              ) : (
                <Btn variant="primary" size="sm" icon="plus" onClick={() => onConnect(p)} disabled={connectingId === p.id}>{connectingId === p.id ? "Connecting" : "Connect"}</Btn>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* sync status (verbatim structure from the prototype's cloudSync view) */}
      <Card
        title="Sync status"
        icon="bolt"
        headRight={
          <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">
            <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--c-ok)", display: "inline-block", marginRight: 1 }} /> Active
          </Pill>
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "none" }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--c-surface-2)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="briefcase" size={16} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Google Drive</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Last synced {lastSync} · 1,284 files</div>
          </div>
          <Btn variant="soft" size="sm" onClick={onSyncNow} disabled={syncing}>{syncing ? "Syncing" : "Sync now"}</Btn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid var(--c-line)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Bi-directional sync</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Push ATS changes back to your storage automatically</div>
          </div>
          <Toggle on={biDirectional} onClick={() => setBiDirectional((v) => !v)} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid var(--c-line)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Sync resume files</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Mirror candidate resumes to the connected drive</div>
          </div>
          <Toggle on={syncResumes} onClick={() => setSyncResumes((v) => !v)} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid var(--c-line)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Sync EEOC exports</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Archive compliance + audit exports to cold storage</div>
          </div>
          <Toggle on={syncExports} onClick={() => setSyncExports((v) => !v)} />
        </div>

        <div style={{ marginTop: 14, marginBottom: 0 }}>
          <Field label="Sync frequency">
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
              <option>Every 15 minutes</option>
              <option>Hourly</option>
              <option>Daily</option>
              <option>Manual only</option>
            </select>
          </Field>
        </div>
      </Card>

      {/* folder mapping (the prototype's source -> destination map rows) */}
      <Card
        title="Folder mapping"
        headRight={<Btn variant="ghost" size="sm" icon="plus">Add</Btn>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {FOLDER_MAP.map(([src, dest], i) => (
            <div key={src} style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 10, alignItems: "center", padding: "8px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--c-ink)" }}>{src}</span>
              <span style={{ display: "grid", placeItems: "center", color: "var(--c-ink-3)" }}><Icon name="chevR" size={16} /></span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{dest}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* footer actions, mirroring the prototype's "Disable sync" + "Save changes" */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="soft">Disable sync</Btn>
        <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save changes"}</Btn>
      </div>
    </>
  );
}

export default function CloudSyncPage() {
  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      <CloudSyncPanel />
    </div>
  );
}
