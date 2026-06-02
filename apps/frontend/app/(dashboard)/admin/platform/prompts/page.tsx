"use client";
// app/(dashboard)/admin/platform/prompts/page.tsx - EXACT Claude Design "Aurora"
// PromptsScreen (the system-prompt registry / version control plane). Left aside
// lists agents + their version history; the right pane is the prompt editor with
// an advisory banner and a Save / Rollback header. Ported from
// claude-design/screen-platform.jsx (PromptsScreen) and wired to the real gateway
// via GET /platform/prompts (the agent + active-override registry) and
// GET /platform/prompts/:type (active text + version history). Nothing is
// fabricated: when the platform service is unreachable or returns 404/empty the
// exact layout still renders with EmptyState, and the editor text comes straight
// from the active override (empty when the agent uses its hardcoded default).
import { useEffect, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";

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

// Coerce the {data:...} | ... envelope the gateway may or may not wrap responses in.
const unwrap = (res: any) => (res && typeof res === "object" && "data" in res ? res.data : res);

// One agent row in the left rail. `version`/`status`/`updatedAt` come from the
// active override when one exists; otherwise the agent is on its hardcoded default.
type PromptAgent = {
  key: string;
  agent: string;
  version: string | null;
  status: "live" | "default";
  updatedAt: string;
};

// One historical (or active) override version for the version-history list.
type PromptVersion = {
  id: string;
  v: string;
  date: string;
  author: string;
  note: string;
  live: boolean;
  text: string;
  modelName: string | null;
  temperature: number | null;
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const labelStyle: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)",
};

// GET /platform/prompts -> { prompts: [{ agentType, override|null }] }. Map each
// agent to a rail row, defensively reading whatever field names the row uses.
function mapAgents(res: any): PromptAgent[] {
  const body = unwrap(res);
  const arr: any[] = Array.isArray(body?.prompts) ? body.prompts
    : Array.isArray(body) ? body
    : Array.isArray(body?.agents) ? body.agents : [];
  return arr.map((row: any, i: number) => {
    const ov = row?.override ?? row?.active ?? null;
    const key = String(row?.agentType ?? row?.key ?? row?.name ?? ov?.agentType ?? `agent-${i}`);
    const version = ov?.version != null ? `v${ov.version}` : (row?.version != null ? String(row.version) : null);
    return {
      key,
      agent: String(row?.agent ?? row?.name ?? key),
      version,
      status: ov ? ("live" as const) : ("default" as const),
      updatedAt: fmtDate(ov?.createdAt ?? ov?.updatedAt ?? row?.updatedAt),
    };
  });
}

// One override -> a PromptVersion. Used for both the active row and the history.
function mapVersion(ov: any, i: number, live: boolean): PromptVersion {
  return {
    id: String(ov?.id ?? `${ov?.version ?? i}`),
    v: ov?.version != null ? `v${ov.version}` : String(ov?.v ?? `v${i + 1}`),
    date: fmtDate(ov?.createdAt ?? ov?.updatedAt ?? ov?.date),
    author: String(
      ov?.author ??
      (ov?.createdByUserId ? `${String(ov.createdByUserId).slice(0, 8)}@cdc` : "platform@cdc"),
    ),
    note: String(ov?.notes ?? ov?.note ?? "No changelog note."),
    live,
    text: String(ov?.systemPrompt ?? ov?.text ?? ""),
    modelName: ov?.modelName ?? null,
    temperature: ov?.temperature ?? null,
  };
}

// GET /platform/prompts/:type -> { active, history }. Active first (live), then
// the historical versions, newest first.
function mapDetail(res: any): PromptVersion[] {
  const body = unwrap(res);
  const out: PromptVersion[] = [];
  if (body?.active) out.push(mapVersion(body.active, 0, true));
  const hist: any[] = Array.isArray(body?.history) ? body.history
    : Array.isArray(body?.versions) ? body.versions : [];
  hist.forEach((h, i) => out.push(mapVersion(h, i + 1, false)));
  return out;
}

export default function PlatformPromptsPage() {
  const list = useData<PromptAgent[]>(() => raw("/platform/prompts").then(mapAgents));
  const [selected, setSelected] = useState<string>("");

  // Pick the first agent once the registry loads (or keep an explicit selection).
  useEffect(() => {
    if (!selected && list.data && list.data.length > 0) setSelected(list.data[0].key);
  }, [list.data, selected]);

  // Per-agent version history + active text. Reloads whenever `selected` changes.
  const detail = useData<PromptVersion[]>(
    () => (selected ? raw(`/platform/prompts/${encodeURIComponent(selected)}`).then(mapDetail) : Promise.resolve([])),
    [selected],
  );

  const versions = detail.data ?? [];
  const [ver, setVer] = useState<string>("");
  const cur = versions.find((v) => v.v === ver) ?? versions[0] ?? null;

  // Controlled editor panel. The text follows the active version; edits are local
  // until Save (best-effort PUT) succeeds.
  const [text, setText] = useState<string>("");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // When the selected agent's history loads, seed the version + editor text from
  // the live version (or the newest one).
  useEffect(() => {
    if (versions.length === 0) { setVer(""); setText(""); return; }
    const live = versions.find((v) => v.live) ?? versions[0];
    setVer(live.v);
    setText(live.text);
    setSaveMsg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.data, selected]);

  const agents = list.data ?? [];
  const selectedAgent = agents.find((a) => a.key === selected) ?? null;
  const cols = "300px 1fr";

  // Best-effort save: PUT a new version, then reload the rail + history. Falls back
  // to an inline message if the platform service rejects or is unreachable.
  async function save() {
    if (!selected) return;
    setBusy(true);
    setSaveMsg(null);
    try {
      await raw(`/platform/prompts/${encodeURIComponent(selected)}`, {
        method: "PUT",
        body: JSON.stringify({ systemPrompt: text.trim().length > 0 ? text : null, notes: "Edited from prompt console" }),
      });
      setSaveMsg("Saved. Applies to new agent runs within ~5 min.");
      list.reload();
      detail.reload();
    } catch {
      setSaveMsg("Could not deploy. The platform service did not accept the change. Your edit is kept locally.");
    } finally {
      setBusy(false);
    }
  }

  // Best-effort rollback: POST to reactivate a historical version.
  async function rollback() {
    if (!selected || !cur || cur.live) return;
    setBusy(true);
    setSaveMsg(null);
    try {
      await raw(`/platform/prompts/${encodeURIComponent(selected)}/rollback/${encodeURIComponent(cur.id)}`, { method: "POST" });
      setSaveMsg(`Rolled back to ${cur.v}. Active version updated.`);
      list.reload();
      detail.reload();
    } catch {
      setSaveMsg("Rollback failed. The platform service did not respond.");
    } finally {
      setBusy(false);
    }
  }

  // Registry empty / unreachable -> render the exact 2-pane shell, EmptyState in
  // the editor side. No fabricated prompts.
  const railEmpty = !list.loading && agents.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "grid", gridTemplateColumns: cols, minHeight: 560, borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        {/* Left rail: agent picker + version history */}
        <aside style={{ borderRight: "1px solid var(--c-line)", overflowY: "auto", padding: "20px 14px", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, padding: "0 4px" }}>
            <Icon name="terminal" size={17} style={{ color: "var(--c-ai)" }} />
            <h1 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Agent prompts</h1>
          </div>

          {/* Agent select, real agent keys from the registry */}
          {list.loading ? (
            <Skeleton className="mb-[14px] h-9 rounded-[8px]" />
          ) : (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              aria-label="Select agent"
              disabled={agents.length === 0}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-mono)", cursor: agents.length ? "pointer" : "default", marginBottom: 14 }}
            >
              {agents.length === 0 && <option value="">No agents</option>}
              {agents.map((a) => (
                <option key={a.key} value={a.key}>{a.agent}</option>
              ))}
            </select>
          )}

          <div style={{ ...labelStyle, marginBottom: 8, padding: "0 4px" }}>Version history</div>

          {(detail.loading || list.loading) && (
            <div style={{ display: "grid", gap: 6 }}>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[60px] rounded-[8px]" />)}
            </div>
          )}

          {!detail.loading && !list.loading && versions.length === 0 && (
            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", padding: "8px 4px", lineHeight: 1.5 }}>
              No versions yet. This agent is running its hardcoded default prompt.
            </div>
          )}

          {!detail.loading && versions.map((v) => (
            <button
              key={v.id}
              onClick={() => { setVer(v.v); setText(v.text); setSaveMsg(null); }}
              style={{ width: "100%", textAlign: "left", display: "block", padding: "11px 12px", borderRadius: "var(--r)", border: "1px solid", borderColor: ver === v.v ? "var(--c-ai)" : "transparent", background: ver === v.v ? "var(--c-ai-tint)" : "transparent", cursor: "pointer", marginBottom: 4 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: ver === v.v ? "var(--c-ai-ink)" : "var(--c-ink)" }}>{v.v}</span>
                {v.live && <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check" style={{ fontSize: 9 }}>live</Pill>}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--c-ink-2)", marginTop: 3 }}>{v.note}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--c-ink-3)", marginTop: 3 }}>{v.date}{v.author ? ` · ${v.author}` : ""}</div>
            </button>
          ))}
        </aside>

        {/* Right pane: editor header + advisory + textarea */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          {railEmpty ? (
            <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "44px 26px" }}>
              <EmptyState
                title={list.error ? "Could not load prompts" : "No agents registered"}
                body={
                  list.error
                    ? "The platform service did not respond. The prompt registry will appear here once it is reachable."
                    : "When agents are registered, their system prompt, version history, and deploy controls appear here."
                }
                actions={list.error ? <Btn variant="soft" icon="arrowUpRight" onClick={list.reload}>Try again</Btn> : undefined}
              />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 26px", borderBottom: "1px solid var(--c-line)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                    <h2 className="mono" style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>{selectedAgent?.agent ?? selected ?? ""}</h2>
                    {cur && <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">{cur.v}</Pill>}
                    {cur?.live && (
                      <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check">deployed</Pill>
                    )}
                    {cur && !cur.live && (
                      <Pill tone="var(--c-ink-3)" bg="var(--c-surface-3)" icon="dot">draft</Pill>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>
                    {cur ? `${cur.date}${cur.author ? ` · ${cur.author}` : ""}` : "Using hardcoded default prompt."}
                  </div>
                </div>
                {cur && !cur.live && (
                  <Btn variant="soft" icon="arrowUpRight" onClick={rollback}>Roll back to {cur.v}</Btn>
                )}
                <Btn variant="primary" icon="check" onClick={save}>Save &amp; deploy</Btn>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>
                <div style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "center", padding: "11px 14px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)" }}>
                  <Icon name="shield" size={15} style={{ color: "var(--c-ai)" }} />
                  <span>Deploying pushes to all subscribed tenants. Changes are versioned and logged to the platform audit trail. Never expose secrets here.</span>
                </div>

                {saveMsg && (
                  <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: "var(--r-lg)", background: "var(--c-surface-2)", border: "1px solid var(--c-line-2)", fontSize: 12, color: "var(--c-ink-2)" }}>
                    {saveMsg}
                  </div>
                )}

                {detail.loading ? (
                  <Skeleton className="h-[360px] rounded-[12px]" />
                ) : (
                  <>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      spellCheck={false}
                      disabled={busy}
                      aria-label="System prompt"
                      placeholder="Empty falls back to the hardcoded prompt baked into the agent."
                      style={{ width: "100%", minHeight: 360, padding: "16px 18px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: 13, fontFamily: "var(--font-mono)", lineHeight: 1.7, resize: "vertical", outline: "none" }}
                    />
                    <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center", fontSize: 11, color: "var(--c-ink-3)" }}>
                      <span className="mono">{text.length} chars</span>
                      <span>Empty falls back to the agent default.</span>
                      {cur?.modelName && <span className="mono">model: {cur.modelName}</span>}
                      {cur?.temperature != null && <span className="mono">temp: {cur.temperature}</span>}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
