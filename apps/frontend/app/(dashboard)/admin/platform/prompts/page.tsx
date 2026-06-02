"use client";
// app/(dashboard)/admin/platform/prompts/page.tsx
// EXACT Claude Design "Aurora" PromptsScreen port (claude-design/screen-platform.jsx):
// the system-prompt registry + versioned editor. Two-pane layout: left rail with an
// agent <select> + version-history timeline; right editor with version/deployed pills,
// roll-back + save-and-deploy, the AI-advisory banner, and the mono textarea editor.
// Wired to the real gateway: GET /platform/prompts (registry), GET /platform/prompts/:type
// (text + history). Save = best-effort PUT, Rollback = best-effort POST.
import { useEffect, useMemo, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";

/* ------------------------------- wiring ------------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function raw(method: string, path: string, body?: unknown): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return json?.data ?? json;
}

/* ------------------------------- types -------------------------------- */
type Override = {
  id: string; agentType: string; systemPrompt: string | null; modelName: string | null;
  temperature: number | null; version: number; isActive: boolean; notes: string | null;
  createdByUserId: string | null; createdAt: string;
};
type RegistryRow = { agentType: string; override: Override | null };
type Registry = { prompts: RegistryRow[] };
type Detail = { agentType: string; active: Override | null; history: Override[] };

/* a single timeline entry, normalized from an Override row */
type VersionView = { id: string; v: string; note: string; date: string; author: string; live: boolean; text: string };

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function shortAuthor(id?: string | null): string {
  if (!id) return "system";
  return id.length > 10 ? id.slice(0, 8) : id;
}
function toVersions(d?: Detail): VersionView[] {
  if (!d) return [];
  const all = [...(d.active ? [d.active] : []), ...(d.history ?? [])];
  return all.map((o) => ({
    id: o.id, v: `v${o.version}`, note: o.notes || "No changelog note.",
    date: fmtDate(o.createdAt), author: shortAuthor(o.createdByUserId),
    live: !!o.isActive, text: o.systemPrompt ?? "",
  }));
}

/* shared label style (prototype used PL.fStyles.label) */
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)",
};

export default function PromptsPage() {
  const registry = useData<Registry>(() => raw("GET", "/platform/prompts"));
  const rows = registry.data?.prompts ?? [];

  // Selected agent: first agent that actually exists in the registry.
  const [agent, setAgent] = useState<string>("");
  useEffect(() => {
    if (!agent && rows.length) setAgent(rows[0].agentType);
  }, [rows, agent]);

  // Per-agent detail (text + version history), reloaded when the agent changes.
  const detail = useData<Detail>(() => raw("GET", `/platform/prompts/${agent}`), [agent]);
  const versions = useMemo(() => toVersions(detail.data), [detail.data]);

  // Selected version in the history rail.
  const [verId, setVerId] = useState<string>("");
  useEffect(() => {
    const live = versions.find((v) => v.live) ?? versions[0];
    if (versions.length && (!verId || !versions.some((v) => v.id === verId))) setVerId(live?.id ?? "");
  }, [versions, verId]);
  const cur = versions.find((v) => v.id === verId);

  // Controlled editor text, seeded from the selected version.
  const [text, setText] = useState<string>("");
  useEffect(() => { setText(cur?.text ?? ""); }, [cur?.id]);

  // Best-effort mutation feedback (graceful, inline).
  const [busy, setBusy] = useState<null | "save" | "rollback">(null);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "danger"; msg: string } | null>(null);

  async function onSave() {
    if (!agent || busy) return;
    setBusy("save"); setFeedback(null);
    try {
      await raw("PUT", `/platform/prompts/${agent}`, { systemPrompt: text, notes: "Edited in console" });
      setFeedback({ tone: "ok", msg: "Saved and deployed. New version is live across subscribed tenants." });
      detail.reload(); registry.reload();
    } catch {
      setFeedback({ tone: "danger", msg: "Could not save. You may not have platform-operator rights, or the service did not respond." });
    } finally { setBusy(null); }
  }
  async function onRollback() {
    if (!agent || !cur || cur.live || busy) return;
    setBusy("rollback"); setFeedback(null);
    try {
      await raw("POST", `/platform/prompts/${agent}/rollback/${cur.id}`);
      setFeedback({ tone: "ok", msg: `Rolled back to ${cur.v}. A new active version was created from it.` });
      detail.reload(); registry.reload();
    } catch {
      setFeedback({ tone: "danger", msg: "Could not roll back. You may not have platform-operator rights, or the service did not respond." });
    } finally { setBusy(null); }
  }

  /* ----------------------------- registry guards ----------------------------- */
  if (registry.loading) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Skeleton className="h-9 rounded-[11px]" />
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[68px] rounded-[11px]" />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Skeleton className="h-12 rounded-[14px]" />
            <Skeleton className="h-[360px] rounded-[14px]" />
          </div>
        </div>
      </div>
    );
  }
  if (registry.error || rows.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <div style={{ display: "grid", placeItems: "center", minHeight: 420 }}>
          <EmptyState
            title="No prompt registry"
            body="The platform prompt registry did not respond, or you do not have platform-operator access. Agent prompts are managed here once available."
            actions={<Btn variant="soft" icon="arrowUpRight" onClick={() => registry.reload()}>Try again</Btn>}
          />
        </div>
      </div>
    );
  }

  /* --------------------------------- screen --------------------------------- */
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", borderRadius: "var(--r-2xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)", minHeight: 560 }}>
        {/* -------- left rail: agent select + version history -------- */}
        <aside style={{ borderRight: "1px solid var(--c-line)", padding: "20px 14px", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
            <Icon name="terminal" size={17} style={{ color: "var(--c-ai)" }} />
            <h1 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Agent prompts</h1>
          </div>
          <select
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-mono)", cursor: "pointer", marginBottom: 14 }}
          >
            {rows.map((r) => <option key={r.agentType} value={r.agentType}>{r.agentType}</option>)}
          </select>
          <div style={{ ...labelStyle, marginBottom: 8, padding: "0 4px" }}>Version history</div>

          {detail.loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[68px] rounded-[11px]" />)}
            </div>
          )}
          {!detail.loading && versions.length === 0 && (
            <div style={{ padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", fontSize: 12, color: "var(--c-ink-3)" }}>
              No saved versions yet. This agent runs on the built-in default prompt. Save below to create the first version.
            </div>
          )}
          {!detail.loading && versions.map((v) => (
            <button
              key={v.id}
              onClick={() => setVerId(v.id)}
              style={{ width: "100%", textAlign: "left", display: "block", padding: "11px 12px", borderRadius: "var(--r)", border: "1px solid", borderColor: verId === v.id ? "var(--c-ai)" : "transparent", background: verId === v.id ? "var(--c-ai-tint)" : "transparent", cursor: "pointer", marginBottom: 4 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: verId === v.id ? "var(--c-ai-ink)" : "var(--c-ink)" }}>{v.v}</span>
                {v.live && <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check" style={{ fontSize: 9 }}>live</Pill>}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--c-ink-2)", marginTop: 3 }}>{v.note}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--c-ink-3)", marginTop: 3 }}>{v.date} · {v.author}</div>
            </button>
          ))}
        </aside>

        {/* -------- right editor -------- */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 26px", borderBottom: "1px solid var(--c-line)", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                <h2 className="mono" style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>{agent}</h2>
                {cur && <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">{cur.v}</Pill>}
                {cur?.live && <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check">deployed</Pill>}
              </div>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>
                {cur ? `${cur.date} · ${cur.author}` : "No version selected"}
              </div>
            </div>
            {cur && !cur.live && (
              <Btn variant="soft" icon="arrowUpRight" onClick={onRollback} disabled={busy !== null}>
                {busy === "rollback" ? "Rolling back…" : `Roll back to ${cur.v}`}
              </Btn>
            )}
            <Btn variant="primary" icon="check" onClick={onSave} disabled={busy !== null || !agent}>
              {busy === "save" ? "Saving…" : "Save & deploy"}
            </Btn>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>
            <div style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "center", padding: "11px 14px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)" }}>
              <Icon name="shield" size={15} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
              <span>Deploying pushes to all subscribed tenants. Changes are versioned and logged to the platform audit trail. Never expose secrets here.</span>
            </div>

            {feedback && (
              <div
                role="status"
                style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "center", padding: "11px 14px", borderRadius: "var(--r-lg)", fontSize: 12.5, fontWeight: 600,
                  color: feedback.tone === "ok" ? "var(--c-ok)" : "var(--c-danger)",
                  background: feedback.tone === "ok" ? "var(--c-ok-tint)" : "var(--c-danger-tint)",
                  border: `1px solid color-mix(in oklab, ${feedback.tone === "ok" ? "var(--c-ok)" : "var(--c-danger)"} 24%, transparent)` }}
              >
                <Icon name={feedback.tone === "ok" ? "check" : "flag"} size={15} style={{ flexShrink: 0 }} />
                <span>{feedback.msg}</span>
              </div>
            )}

            {detail.loading ? (
              <Skeleton className="h-[360px] rounded-[14px]" />
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                placeholder="This agent currently uses the built-in default prompt. Type a system prompt and Save & deploy to create the first override version."
                style={{ width: "100%", minHeight: 360, padding: "16px 18px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: 13, fontFamily: "var(--font-mono)", lineHeight: 1.7, resize: "vertical", outline: "none" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
