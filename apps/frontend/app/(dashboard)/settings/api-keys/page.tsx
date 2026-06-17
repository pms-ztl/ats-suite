"use client";
// app/(dashboard)/settings/api-keys/page.tsx - EXACT Claude Design "Aurora"
// settings, the API keys right-panel (claude-design/screen-settings.jsx -> PApiKeys
// + set-data.jsx API_KEYS shape). The settings layout already renders the left
// settings-nav rail + a <section> wrapper, so this file is ONLY the right-panel
// content: the keys list (name / scopes / masked prefix / created / last-used /
// revoke) plus a "Generate key" action that reveals a freshly-minted secret
// exactly once. PanelHead / Card are reproduced locally as the prototype defines
// them (matching the sibling settings/page.tsx + team/page.tsx); Btn / Pill come
// from the kit, Icon from the shim. Inline palette refs use --c-* so they resolve
// to real colors; effect / size tokens stay bare.
//
// WIRE: real tenant keys are fetched via a local raw() helper (GET /api-keys,
// forwarded by the gateway to identity-service), coerced (res?.data ?? res) and
// mapped defensively. Create is a best-effort raw() POST that returns the
// plaintext ONCE (shown in a reveal modal); revoke is a best-effort raw() DELETE.
// Both degrade gracefully. No fabricated keys: real list or empty state only.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { Skeleton, ErrorState, EmptyState } from "@/components/aurora";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype (PApiKeys uses PanelHead + Card) ---- */
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

const inp: CSS = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };
const codeBox: CSS = { fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--c-ink-2)", background: "var(--c-surface-2)", padding: "4px 8px", borderRadius: 6 };

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

interface Key { id: string; name: string; prefix: string; scopes: string; created: string; last: string; }

// Format a backend timestamp into the prototype's compact "Mar 2026" label.
function fmtCreated(v: unknown): string {
  if (!v) return "";
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

// Relative "2m ago" / "1d ago" / "never" for last-used, like the prototype.
function fmtLastUsed(v: unknown): string {
  if (!v) return "never used";
  const d = new Date(v as string);
  if (isNaN(d.getTime())) return String(v);
  const secs = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtCreated(v);
}

// scopes may arrive as a string[] (identity-service) or a comma string.
function fmtScopes(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  return v ? String(v) : "";
}

// GET /api-keys (tenant keys, gateway-forwarded), mapped defensively. Revoked
// keys are filtered out of the active list. No fabricated keys.
async function getKeys(): Promise<Key[]> {
  const res = await raw("/api-keys");
  const rows: any[] = Array.isArray(res) ? res : res?.keys ?? res?.items ?? [];
  return rows
    .filter((k: any) => !k.revokedAt && !k.revoked)
    .map((k: any): Key => ({
      id: String(k.id ?? k.keyId ?? k._id ?? k.keyPrefix ?? k.name),
      name: k.name ?? "API key",
      prefix: `${k.keyPrefix ?? k.prefix ?? "ats_"}${"•".repeat(8)}`,
      scopes: fmtScopes(k.scopes) || "read",
      created: fmtCreated(k.createdAt ?? k.created),
      last: fmtLastUsed(k.lastUsedAt ?? k.last),
    }));
}

// best-effort create; returns the plaintext ONCE (shown in the reveal modal).
async function createKey(name: string): Promise<string | null> {
  const res = await raw("/api-keys", { method: "POST", body: JSON.stringify({ name }) });
  return res?.plaintext ?? res?.key ?? res?.secret ?? null;
}

// best-effort revoke; the gateway may not expose it, so we degrade gracefully.
async function revokeKey(id: string): Promise<void> {
  await raw(`/api-keys/${id}`, { method: "DELETE" });
}

/* ----------------------------- reveal modal ----------------------------- */
// Shown once after a successful create. Copy-to-clipboard, dismiss-only; the
// plaintext is never re-derivable from the list, so we make that explicit.
function RevealModal({ name, secret, onClose }: { name: string; secret: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(secret); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch {}
  }
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: 20, background: "color-mix(in oklab, var(--c-ink) 38%, transparent)", backdropFilter: "blur(2px)", animation: "fadein .2s var(--ease-out)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, borderRadius: "var(--r-2xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e3)", overflow: "hidden", animation: "rise .3s var(--ease-out)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", borderBottom: "1px solid var(--c-line)" }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--c-ok-tint)", color: "var(--c-ok)", flexShrink: 0 }}><Icon name="check" size={20} stroke={2.2} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "var(--fs-md)", fontWeight: 700 }}>Key created</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{name}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: "var(--c-ink-3)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="x" size={17} /></button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ marginBottom: 14, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--c-warn-tint)", border: "1px solid color-mix(in oklab, var(--c-warn) 30%, transparent)", fontSize: 12.5, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}>
            <Icon name="shield" size={16} style={{ color: "var(--c-warn)", flexShrink: 0 }} />
            Copy this secret now. For your security it will not be shown again.
          </div>
          <code className="mono" style={{ display: "block", wordBreak: "break-all", padding: "12px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line-strong)", background: "var(--c-surface-2)", fontSize: 13, color: "var(--c-ink)" }}>{secret}</code>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <Btn variant="soft" icon={copied ? "check" : "copy"} onClick={copy}>{copied ? "Copied" : "Copy key"}</Btn>
            <Btn variant="primary" icon="check" onClick={onClose}>Done</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- panel ----------------------------- */
function ApiKeysPanel() {
  const { data, loading, error, reload } = useData<Key[]>(getKeys);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<{ name: string; secret: string } | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function onCreate() {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true); setNote(null);
    try {
      const secret = await createKey(name);
      if (secret) {
        setRevealed({ name, secret });
      } else {
        setNote(`Created "${name}". The secret was not returned by the server.`);
      }
      reload();
    } catch {
      setNote(`Could not create "${name}". Please try again.`);
    }
    setCreating(false);
    setCreateOpen(false);
    setNewName("");
    window.setTimeout(() => setNote(null), 4000);
  }

  async function onRevoke(k: Key) {
    if (revoking) return;
    setRevoking(k.id);
    try { await revokeKey(k.id); } catch { /* graceful: gateway may not expose it */ }
    setRevoking(null);
    reload();
  }

  const createAction = <Btn variant="primary" icon="plus" onClick={() => setCreateOpen((v) => !v)}>Generate key</Btn>;

  return (
    <>
      <PanelHead title="API keys" desc="Programmatic access to the ATS platform API." action={createAction} />

      {/* controlled create row */}
      {createOpen && (
        <div style={{ marginBottom: 14, padding: "14px 16px", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 240px" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 }}>Key name</label>
            <input
              value={newName} placeholder="e.g. Production ingest"
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onCreate(); }}
              style={inp}
            />
          </div>
          <Btn variant="primary" icon="check" onClick={onCreate} disabled={!newName.trim() || creating}>{creating ? "Generating" : "Generate"}</Btn>
          <Btn variant="ghost" onClick={() => { setCreateOpen(false); setNewName(""); }}>Cancel</Btn>
        </div>
      )}

      {note && (
        <div style={{ marginBottom: 14, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--c-surface-2)", border: "1px solid var(--c-line)", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}>
          <Icon name="bolt" size={15} style={{ color: "var(--c-ink-3)" }} /> {note}
        </div>
      )}

      <Card>
        {loading && <div style={{ padding: 18 }}><Skeleton className="h-40 rounded-lg" /></div>}

        {error && (
          <div style={{ padding: 28 }}>
            <ErrorState title="Could not load API keys" body="The keys service did not respond." code="GET /api-keys" onRetry={reload} />
          </div>
        )}

        {data && data.length === 0 && (
          <div style={{ padding: 28 }}>
            <EmptyState
              title="No API keys yet"
              body="Generate a key to grant programmatic access to the platform API."
              actions={<Btn variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>Generate key</Btn>}
            />
          </div>
        )}

        {data && data.length > 0 && data.map((k, i) => (
          <div key={k.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 90px 78px", gap: 12, alignItems: "center", padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, minWidth: 0 }}>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.name}</div>
              <div style={{ fontSize: 11, color: "var(--c-ink-3)", fontWeight: 400 }}>{k.scopes}</div>
            </div>
            <code className="mono" style={{ ...codeBox, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.prefix}</code>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>created {k.created}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{k.last}</span>
            <Btn variant="danger" size="sm" onClick={() => onRevoke(k)} disabled={revoking === k.id}>{revoking === k.id ? "Revoking" : "Revoke"}</Btn>
          </div>
        ))}
      </Card>

      <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}>
        <Icon name="terminal" size={15} style={{ color: "var(--c-ai)" }} />
        Authenticate requests with <code className="mono" style={{ ...codeBox, padding: "2px 6px" }}>Authorization: Bearer ats_...</code> over the versioned API.
      </div>

      {revealed && <RevealModal name={revealed.name} secret={revealed.secret} onClose={() => setRevealed(null)} />}
    </>
  );
}

export default function ApiKeysSettingsPage() {
  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      <ApiKeysPanel />
    </div>
  );
}
