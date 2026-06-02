"use client";
// app/(dashboard)/admin/platform/audit/page.tsx - EXACT Claude Design "Aurora"
// PlatformAuditScreen. The immutable, system-wide platform trail: a timeline of
// operator actions, deploys, kill-switches, billing, and agent alerts rendered
// as event rows with an actor, an action (against a target), a relative
// timestamp, and a severity-driven icon rail. Ported from
// claude-design/screen-platform.jsx (PlatformAuditScreen) and wired to the real
// gateway: it tries GET /platform/audit, then falls back to GET /audit. The
// response (which may be {data:[...]} or [...]) is coerced to an array and each
// row is mapped defensively (actor, action, target, createdAt, severity). The
// severity / kind filter chips work with local useState. On error, a 404, or an
// empty trail the exact layout still renders with EmptyState, never fabricated
// audit events.
import { useMemo, useState } from "react";
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

// Kind -> accent color (full-color --c-* tokens; the bare channels are
// Tailwind-only and are not valid colors on their own).
const KIND_TONE: Record<string, string> = {
  impersonation: "var(--c-ai)",
  deploy: "var(--c-info)",
  killswitch: "var(--c-danger)",
  billing: "var(--c-brand)",
  alert: "var(--c-warn)",
};
// Kind -> the icon shown in the timeline rail.
const KIND_ICON: Record<string, string> = {
  impersonation: "eye",
  deploy: "terminal",
  killswitch: "x",
  billing: "card",
  alert: "flag",
};
const KIND_ORDER = ["impersonation", "deploy", "killswitch", "billing", "alert"] as const;
type Kind = (typeof KIND_ORDER)[number];

const FILTERS: { id: "all" | Kind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "impersonation", label: "Impersonation" },
  { id: "deploy", label: "Deploys" },
  { id: "killswitch", label: "Kill switches" },
  { id: "billing", label: "Billing" },
  { id: "alert", label: "Alerts" },
];

type AuditRow = {
  id: string;
  who: string;
  act: string;
  kind: Kind;
  ai: boolean;
  ts: number; // epoch ms for "ago" formatting, 0 when unknown
};

// Map an arbitrary severity / category / action string onto one of the five
// prototype kinds so the icon and tint stay faithful to the design.
function toKind(severity: any, action: any, category: any): Kind {
  const hay = `${severity ?? ""} ${action ?? ""} ${category ?? ""}`.toLowerCase();
  if (/(kill|disable|halt|pause|shutdown|critical)/.test(hay)) return "killswitch";
  if (/(impersonat|login|access|view|session)/.test(hay)) return "impersonation";
  if (/(deploy|release|publish|rollback|prompt|version)/.test(hay)) return "deploy";
  if (/(bill|invoice|plan|payment|subscription|upgrade|charge)/.test(hay)) return "billing";
  if (/(alert|warn|error|fail|anomaly|flag)/.test(hay)) return "alert";
  return "deploy";
}

// Relative "Nx ago" label, mirroring the prototype's "{t} ago" output.
function agoLabel(ms: number): string {
  if (!ms) return "";
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(mo / 12)}y`;
}

// Defensive mapping: the real payload may be {data:[...]} or [...] and each row
// may use a variety of field names for actor / action / target / time. Coerce
// to the shape the timeline renders. Never fabricate rows.
function mapAudit(res: any): AuditRow[] {
  const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  return arr.map((a: any, i: number) => {
    const actor = String(
      a?.actor ?? a?.who ?? a?.actorName ?? a?.userName ?? a?.user?.name ??
      a?.actorEmail ?? a?.user?.email ?? a?.actorUserId ?? a?.userId ?? "system",
    );
    const action = a?.action ?? a?.act ?? a?.event ?? a?.type ?? a?.message ?? "performed an action";
    const target = a?.target ?? a?.targetName ?? a?.resource ?? a?.entity ?? a?.subject ?? a?.tenant ?? "";
    const severity = a?.severity ?? a?.level ?? a?.status;
    const category = a?.category ?? a?.kind ?? a?.area;
    const act = target ? `${String(action)} ${String(target)}` : String(action);
    const created = a?.createdAt ?? a?.created ?? a?.timestamp ?? a?.time ?? a?.at ?? a?.occurredAt;
    const ts = created ? new Date(created).getTime() : 0;
    return {
      id: String(a?.id ?? a?.eventId ?? a?.uuid ?? i),
      who: actor,
      act,
      kind: toKind(severity, action, category),
      ai: Boolean(a?.ai ?? a?.isAi ?? a?.automated ?? /agent|ai|auto/i.test(`${actor} ${action}`)),
      ts: Number.isFinite(ts) ? ts : 0,
    };
  });
}

// Try the platform-scoped route first, then the plain audit route.
async function loadAudit(): Promise<AuditRow[]> {
  try {
    return mapAudit(await raw("/platform/audit"));
  } catch {
    return mapAudit(await raw("/audit"));
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

export default function PlatformAuditPage() {
  const audit = useData<AuditRow[]>(loadAudit);
  const [filter, setFilter] = useState<"all" | Kind>("all");

  const all = useMemo(() => audit.data ?? [], [audit.data]);
  const rows = useMemo(
    () => (filter === "all" ? all : all.filter((a) => a.kind === filter)),
    [all, filter],
  );

  const subCopy = audit.data
    ? `${all.length} ${all.length === 1 ? "event" : "events"}, operator actions, deploys, kill-switches, agent alerts.`
    : "System-wide trail, operator actions, deploys, kill-switches, agent alerts.";

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <OpHead
        title="Platform audit"
        sub={subCopy}
        right={<Btn variant="soft" icon="arrowUpRight">Export</Btn>}
      />

      {/* Severity / kind filter chips, driven by local useState */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const tone = f.id === "all" ? "var(--c-brand)" : KIND_TONE[f.id] ?? "var(--c-brand)";
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px",
                borderRadius: "var(--r-pill)", border: "1px solid",
                borderColor: active ? tone : "var(--c-line-2)",
                background: active ? `color-mix(in oklab, ${tone} 14%, transparent)` : "var(--c-surface)",
                color: active ? tone : "var(--c-ink-2)", cursor: "pointer",
                fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-sans)",
              }}
            >
              {f.id !== "all" && <Icon name={KIND_ICON[f.id] ?? "dot"} size={12} />}
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
        {/* loading -> skeleton rows in the exact card */}
        {audit.loading && (
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

        {/* error, 404, or empty -> exact card, EmptyState in the body */}
        {!audit.loading && rows.length === 0 && (
          <div style={{ padding: "32px 8px" }}>
            <EmptyState
              title={audit.error ? "Could not load the audit trail" : filter !== "all" ? "No events of this kind" : "No platform events yet"}
              body={
                audit.error
                  ? "The platform audit service did not respond. The system-wide trail will appear here once it is reachable."
                  : filter !== "all"
                    ? "No events match this filter. Try a different category."
                    : "When operators act, agents deploy, or kill-switches fire, the immutable trail appears here."
              }
              actions={audit.error ? <Btn variant="soft" icon="arrowUpRight" onClick={audit.reload}>Try again</Btn> : undefined}
            />
          </div>
        )}

        {/* data -> the faithful timeline of event rows */}
        {!audit.loading && rows.map((a, i) => {
          const tone = KIND_TONE[a.kind] ?? "var(--c-ink-3)";
          const t = agoLabel(a.ts);
          return (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "26px 1fr 64px", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0, background: `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone }}>
                  <Icon name={KIND_ICON[a.kind] ?? "flag"} size={13} />
                </span>
                {i < rows.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--c-line)", minHeight: 12 }} />}
              </div>
              <div style={{ paddingBottom: 16 }}>
                <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
                  <b className="mono" style={{ fontSize: 12 }}>{a.who}</b>{" "}
                  <span style={{ color: "var(--c-ink-2)" }}>{a.act}</span>
                  {a.ai && <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 9, marginLeft: 6 }}>AI</Pill>}
                </div>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)", textAlign: "right" }}>{t ? `${t} ago` : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
