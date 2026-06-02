"use client";
// app/(dashboard)/admin/platform/audit/page.tsx - EXACT Claude Design "Aurora"
// immutable platform audit log (PlatformAuditScreen). System-wide trail of
// operator actions, deploys, kill-switches, billing changes, and agent alerts
// rendered as a filterable severity/category timeline where each row carries an
// actor, an action, a target, a timestamp, a category marker, and an AI-vs-human
// badge. Ported verbatim from claude-design/screen-platform.jsx
// (PlatformAuditScreen) and wired to the real gateway: it tries the platform
// kill-switch audit (GET /super-admin/platform/audit -> { audit: [...] }) and
// falls back to the system-wide audit event log (GET /super-admin/audit ->
// { data: [...] }). Rows are coerced to an array and mapped defensively
// (actor / action / target / createdAt / severity), so nothing is fabricated.
// Category and AI/human filters are pure local useState. On error or an
// empty/404 response the exact layout still renders with EmptyState.
import { useMemo, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Local raw() helper: unwrap the gateway envelope (res?.data ?? res) and throw
// on non-2xx so useData can surface the error/empty layout.
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const json: any = await res.json();
  return json?.data ?? json;
}

// Category -> dot tone. Full-color --c-* tokens (bare channels are Tailwind-only).
const KIND_TONE: Record<string, string> = {
  impersonation: "var(--c-ai)",
  deploy: "var(--c-info)",
  killswitch: "var(--c-danger)",
  billing: "var(--c-brand)",
  alert: "var(--c-warn)",
};
const KIND_ICON: Record<string, string> = {
  impersonation: "eye",
  deploy: "terminal",
  killswitch: "x",
  billing: "card",
  alert: "flag",
};
const KIND_LABEL: Record<string, string> = {
  impersonation: "Impersonation",
  deploy: "Deploy",
  killswitch: "Kill-switch",
  billing: "Billing",
  alert: "Alert",
};

type AuditRow = {
  who: string;   // actor
  act: string;   // action + target sentence
  kind: keyof typeof KIND_TONE;
  ai: boolean;   // AI vs human marker
  t: string;     // relative timestamp ("2h", "3d")
};

// Relative "x ago" from an ISO/Date string. Falls back to a passed-through
// string when the value is not parseable (so live data with a pre-formatted
// label still renders).
function relTime(v: any): string {
  if (v == null) return "";
  const d = new Date(v);
  const ms = d.getTime();
  if (Number.isNaN(ms)) return String(v);
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const dys = Math.round(h / 24);
  if (dys < 30) return `${dys}d`;
  const mo = Math.round(dys / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.round(mo / 12)}y`;
}

// Derive the category from the live row. The platform kill-switch audit has a
// `disabled` boolean (true -> killswitch, false -> deploy). The system-wide
// AuditEvent uses free-text action / resourceType / severity, so keyword-match
// into the same five buckets the prototype renders.
function deriveKind(a: any): keyof typeof KIND_TONE {
  if (typeof a?.disabled === "boolean") return a.disabled ? "killswitch" : "deploy";
  const hay = `${a?.kind ?? ""} ${a?.action ?? ""} ${a?.severity ?? ""} ${a?.category ?? ""} ${a?.resourceType ?? a?.resource_type ?? ""}`.toLowerCase();
  if (/(impersonat|assume|sudo|as[-_ ]?user)/.test(hay)) return "impersonation";
  if (/(kill|pause|disable|halt|stop|switch)/.test(hay)) return "killswitch";
  if (/(deploy|prompt|version|rollback|release|publish|model)/.test(hay)) return "deploy";
  if (/(bill|plan|invoice|subscription|payment|upgrade|charge)/.test(hay)) return "billing";
  if (/(alert|error|fail|breach|warn|incident|anomal|critical)/.test(hay)) return "alert";
  return "alert";
}

// Map a raw row to the timeline shape. actor / action / target / createdAt /
// severity are all read defensively across the two backend shapes. No
// fabricated content: if a field is missing it stays blank.
function mapRow(a: any): AuditRow {
  const kind = deriveKind(a);
  const actor = String(
    a?.who ?? a?.actor ?? a?.actorName ?? a?.actorEmail ??
    a?.actorUserId ?? a?.actor_user_id ?? a?.userId ?? a?.user ?? "system"
  );
  // Build the action sentence from action + target when both are present.
  const target = a?.target ?? a?.resourceId ?? a?.resource_id ?? a?.agentType ?? a?.agent_type ?? a?.resourceType ?? a?.resource_type ?? "";
  let act = String(a?.act ?? a?.action ?? a?.message ?? a?.description ?? "");
  if (!act) {
    // Synthesize from the kill-switch shape (disabled + agentType) when there
    // is no free-text action.
    if (typeof a?.disabled === "boolean" && (a?.agentType || a?.agent_type)) {
      act = a.disabled ? "paused the agent" : "resumed the agent";
    } else {
      act = "performed an action";
    }
  }
  if (target && !act.toLowerCase().includes(String(target).toLowerCase())) {
    act = `${act} ${target}`;
  }
  const reason = a?.reason;
  if (reason) act = `${act} (${reason})`;
  // AI vs human: explicit flag, an agent target, or an actor that is not a user.
  const ai = Boolean(
    a?.ai ?? a?.isAi ?? a?.is_ai ?? a?.byAgent ?? a?.agentType ?? a?.agent_type ??
    /agent|system|ai|bot|engine/i.test(actor)
  );
  const t = relTime(a?.t ?? a?.createdAt ?? a?.created_at ?? a?.timestamp ?? a?.at ?? a?.date);
  return { who: actor, act, kind, ai, t };
}

// Coerce either backend envelope into a flat array, then map. Try the platform
// kill-switch audit first; fall back to the system-wide audit event log.
function toRows(res: any): AuditRow[] {
  const arr = Array.isArray(res?.audit) ? res.audit
    : Array.isArray(res?.events) ? res.events
    : Array.isArray(res?.data) ? res.data
    : Array.isArray(res?.items) ? res.items
    : Array.isArray(res) ? res : [];
  return arr.map(mapRow);
}

async function fetchAudit(): Promise<AuditRow[]> {
  try {
    return toRows(await raw("/super-admin/platform/audit"));
  } catch {
    return toRows(await raw("/super-admin/audit"));
  }
}

function OpHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
      <div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</h1>
          <Pill icon="bolt" tone="var(--c-danger)" bg="var(--c-danger-tint)">platform operator</Pill>
        </div>
        <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>{sub}</p>
      </div>
      {right}
    </div>
  );
}

const KINDS: (keyof typeof KIND_TONE)[] = ["impersonation", "deploy", "killswitch", "billing", "alert"];

export default function PlatformAuditPage() {
  const log = useData<AuditRow[]>(fetchAudit);

  // Filters are pure local state (RULES #3). `kind` = "all" or one category;
  // `who` = "all" | "ai" | "human".
  const [kind, setKind] = useState<"all" | keyof typeof KIND_TONE>("all");
  const [who, setWho] = useState<"all" | "ai" | "human">("all");

  const rows = log.data ?? [];
  const filtered = useMemo(
    () => rows.filter((a) =>
      (kind === "all" || a.kind === kind) &&
      (who === "all" || (who === "ai" ? a.ai : !a.ai))
    ),
    [rows, kind, who]
  );

  const sub = log.data
    ? `${rows.length} events · operator actions, deploys, kill-switches, agent alerts.`
    : "System-wide trail, operator actions, deploys, kill-switches, agent alerts.";

  // shared filter-chip style
  const chip = (active: boolean, tone?: string): React.CSSProperties => ({
    display: "inline-flex", gap: 6, alignItems: "center", padding: "5px 11px",
    borderRadius: "var(--r-pill)", border: "1px solid",
    borderColor: active ? (tone ?? "var(--c-ink)") : "var(--c-line-2)",
    background: active ? (tone ? `color-mix(in oklab, ${tone} 13%, transparent)` : "var(--c-surface-2)") : "var(--c-surface)",
    color: active ? (tone ?? "var(--c-ink)") : "var(--c-ink-2)",
    cursor: "pointer", fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
  });

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <OpHead
          title="Platform audit"
          sub={sub}
          right={<Btn variant="soft" icon="arrowUpRight">Export</Btn>}
        />

        {/* Filters: category + AI/human. Pure local state. */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setKind("all")} style={chip(kind === "all")}>All</button>
            {KINDS.map((k) => (
              <button key={k} onClick={() => setKind(k)} style={chip(kind === k, KIND_TONE[k])}>
                <Icon name={KIND_ICON[k]} size={12} />{KIND_LABEL[k]}
              </button>
            ))}
          </div>
          <span style={{ width: 1, height: 18, background: "var(--c-line)" }} />
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <button onClick={() => setWho("all")} style={chip(who === "all")}>Everyone</button>
            <button onClick={() => setWho("ai")} style={chip(who === "ai", "var(--c-ai)")}>
              <Icon name="sparkles" size={12} />AI
            </button>
            <button onClick={() => setWho("human")} style={chip(who === "human")}>
              <Icon name="users" size={12} />Human
            </button>
          </div>
        </div>

        {/* Timeline card */}
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
          {/* loading rows */}
          {log.loading && (
            <div style={{ display: "grid", gap: 14 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr 64px", gap: 12, alignItems: "center" }}>
                  <Skeleton className="h-[26px] w-[26px] rounded-full" />
                  <Skeleton className="h-4 rounded-[6px]" />
                  <Skeleton className="h-3 rounded-[6px]" />
                </div>
              ))}
            </div>
          )}

          {/* error or empty/404 -> exact layout still renders, EmptyState in the body */}
          {!log.loading && filtered.length === 0 && (
            <div style={{ padding: "32px 8px" }}>
              <EmptyState
                title={
                  log.error ? "Could not load the audit trail"
                    : rows.length === 0 ? "No platform events yet"
                    : "No events match these filters"
                }
                body={
                  log.error
                    ? "The platform service did not respond. The immutable audit trail will appear here once it is reachable."
                    : rows.length === 0
                      ? "Operator actions, deploys, kill-switch toggles, billing changes, and agent alerts are recorded here as they happen."
                      : "Try a different category or switch between AI and human actors."
                }
                actions={
                  log.error
                    ? <Btn variant="soft" icon="arrowUpRight" onClick={log.reload}>Try again</Btn>
                    : rows.length > 0 && (kind !== "all" || who !== "all")
                      ? <Btn variant="soft" onClick={() => { setKind("all"); setWho("all"); }}>Clear filters</Btn>
                      : undefined
                }
              />
            </div>
          )}

          {/* data rows */}
          {!log.loading && filtered.map((a, i) => {
            const tone = KIND_TONE[a.kind];
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr 64px", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0, background: `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone }}>
                    <Icon name={KIND_ICON[a.kind]} size={13} />
                  </span>
                  {i < filtered.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--c-line)", minHeight: 12 }} />}
                </div>
                <div style={{ paddingBottom: 16 }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
                    <b className="mono" style={{ fontSize: 12 }}>{a.who}</b>{" "}
                    <span style={{ color: "var(--c-ink-2)" }}>{a.act}</span>
                    {a.ai && <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 9, marginLeft: 6 }}>AI</Pill>}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)", textAlign: "right" }}>{a.t ? `${a.t} ago` : ""}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
