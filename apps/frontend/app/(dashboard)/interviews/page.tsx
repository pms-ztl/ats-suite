"use client";
// app/(dashboard)/interviews/page.tsx - VERBATIM port of the Claude Design
// "Aurora" Interviews screen (claude-design/screen-interviews.jsx): an interview
// list (IVList) + an inline detail (IVDetail) with panelist scorecards, panelist
// feedback, AI interview-intelligence, details rail and AI suggested questions.
// The two views switch via useState (InterviewsScreen). The list is wired to the
// real gateway (listInterviews); the rich detail header is filled from the chosen
// interview where possible, while the panelist scorecards / AI insight blocks
// (which the API does not yet provide) keep the prototype's example content, per
// the port guide. Palette var(--x) tokens are converted to their --c-* full-color
// companions; effect/size tokens (--r*, --e1, --t*, --fs-*) stay bare.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listInterviews } from "@/lib/api";
import type { Interview, InterviewStatus } from "@/lib/types";

// fStyles.label from the prototype's foundations (inlined, --c-* converted).
const fLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)" };

const recTone: Record<string, string> = { STRONG_YES: "var(--c-ok)", YES: "var(--c-ok)", NEUTRAL: "var(--c-warn)", NO: "var(--c-danger)", STRONG_NO: "var(--c-danger)" };

// Prototype's interview-type lookup (label + tone), keyed by an uppercase type.
const INTERVIEW_TYPES: Record<string, { label: string; tone: string }> = {
  PHONE_SCREEN: { label: "Phone screen", tone: "var(--c-info)" },
  TECHNICAL:    { label: "Technical",    tone: "var(--c-ai)" },
  BEHAVIORAL:   { label: "Behavioral",   tone: "var(--c-brand)" },
  PANEL:        { label: "Panel",        tone: "var(--c-warn)" },
  FINAL:        { label: "Final",        tone: "var(--c-ok)" },
};
// Prototype's 4 status buckets (label + tone + bg + icon).
const IV_STATUS: Record<string, { label: string; tone: string; bg: string; icon: string }> = {
  scheduled: { label: "Scheduled", tone: "var(--c-info)", bg: "var(--c-info-tint)", icon: "calendar" },
  completed: { label: "Completed", tone: "var(--c-ok)", bg: "var(--c-ok-tint)", icon: "check" },
  awaiting:  { label: "Feedback due", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", icon: "clock" },
  cancelled: { label: "Cancelled", tone: "var(--c-ink-2)", bg: "var(--c-surface-3)", icon: "x" },
};

// ---- real-data adapters: shape an Interview into the prototype's row model ----
const initials = (s: string) =>
  (s || "?").trim().split(/[\s_-]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

// Map the real 7-value InterviewStatus enum to the prototype's 4 buckets.
const bucketOf = (s: InterviewStatus): "scheduled" | "completed" | "awaiting" | "cancelled" =>
  s === "COMPLETED" || s === "IN_PROGRESS" ? "awaiting"
    : s === "CANCELLED" || s === "NO_SHOW" ? "cancelled"
      : s === "SCHEDULED" || s === "CONFIRMED" || s === "RESCHEDULED" ? "scheduled"
        : "scheduled";

// Derive the prototype's interview "type" key from the round + mode.
const typeOf = (r: Interview): string => {
  const round = (r.round || "").toLowerCase();
  if (r.mode === "PHONE" || round.includes("phone") || round.includes("recruiter") || round.includes("screen")) return "PHONE_SCREEN";
  if (round.includes("final")) return "FINAL";
  if (round.includes("panel") || round.includes("portfolio")) return "PANEL";
  if (round.includes("behav") || round.includes("culture")) return "BEHAVIORAL";
  return "TECHNICAL";
};

const MODE_LABEL: Record<Interview["mode"], string> = { VIDEO: "Video", ONSITE: "Onsite", PHONE: "Phone" };

const fmtWhen = (iso: string) => {
  if (!iso) return "Not scheduled";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Not scheduled";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

// A list row in the prototype's shape, derived from a real Interview.
type Row = {
  id: string; name: string; ini: string; role: string; reqId: string;
  type: string; round: string; status: "scheduled" | "completed" | "awaiting" | "cancelled";
  when: string; dur: number; mode: string; panel: string[];
};
const toRow = (r: Interview): Row => ({
  id: r.id,
  name: r.candidateId || "Candidate",
  ini: initials(r.candidateId || "Candidate"),
  role: r.requisitionId ? `Req ${r.requisitionId}` : "Unassigned",
  reqId: r.requisitionId || "unassigned",
  type: typeOf(r),
  round: r.round,
  status: bucketOf(r.status),
  when: fmtWhen(r.startsAt),
  dur: r.durationMins,
  mode: MODE_LABEL[r.mode] ?? "Video",
  panel: r.panel ?? [],
});

function Dots({ n }: { n: number }) {
  return <span style={{ display: "inline-flex", gap: 3 }}>{Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: i < Math.round(n) ? "var(--c-brand)" : "var(--c-surface-3)" }} />)}</span>;
}

function IVList({ rows, onOpen }: { rows: Row[]; onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState("all");
  const view = rows.filter((r) => filter === "all" || r.status === filter);
  return (
    <div>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Interviews</h1>
            <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>{rows.filter((r) => r.status === "awaiting").length} awaiting feedback · {rows.filter((r) => r.status === "scheduled").length} upcoming.</p></div>
          <Btn variant="primary" icon="plus">Schedule interview</Btn>
        </div>
        <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
          {[["all", "All"], ["scheduled", "Scheduled"], ["awaiting", "Feedback due"], ["completed", "Completed"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid", borderColor: filter === k ? "transparent" : "var(--c-line-2)", background: filter === k ? "var(--c-brand-tint)" : "var(--c-surface)", color: filter === k ? "var(--c-brand-ink)" : "var(--c-ink-2)" }}>{l}</button>
          ))}
        </div>
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
          {view.map((r, i) => {
            const t = INTERVIEW_TYPES[r.type], st = IV_STATUS[r.status];
            return (
              <div key={r.id} onClick={() => onOpen(r.id)} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 130px 120px", gap: 12, padding: "13px 18px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", cursor: "pointer", transition: "background var(--t-fast)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--c-surface-2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <div style={{ display: "flex", gap: 11, alignItems: "center", minWidth: 0 }}>
                  <span className="mono" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{r.ini}</span>
                  <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.name}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{r.role} · <span className="mono">{r.reqId}</span></div></div>
                </div>
                <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.round}</div><Pill tone={t.tone} bg={"color-mix(in oklab," + t.tone + " 13%, transparent)"} style={{ fontSize: 10, marginTop: 2 }}>{t.label}</Pill></div>
                <div style={{ fontSize: 12.5, color: "var(--c-ink-2)" }}>{r.when}<div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{r.dur}m · {r.mode}</div></div>
                <div style={{ display: "flex", marginLeft: 2 }}>{r.panel.slice(0, 3).map((p, j) => <span key={j} title={p} className="mono" style={{ width: 26, height: 26, borderRadius: 99, marginLeft: j ? -8 : 0, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, background: "var(--c-surface-3)", color: "var(--c-ink-2)", border: "2px solid var(--c-surface)" }}>{p.split(" ").map((w) => w[0]).join("")}</span>)}</div>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center", justifySelf: "end", fontSize: 11, fontWeight: 700, color: st.tone, background: st.bg, padding: "3px 10px", borderRadius: 99 }}><Icon name={st.icon} size={11} />{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Prototype's focal-interview detail model (panelist scorecards + AI intelligence).
// The API does not provide these rich fields, so the panelist/AI blocks keep the
// prototype's example content; the header (name, round, when, etc.) is filled from
// the chosen interview row where available.
type Detail = {
  id: string; name: string; ini: string; role: string; reqId: string; type: string; round: string;
  when: string; dur: number; mode: string;
  panelists: { who: string; role: string; status: string; rec: string | null; overall?: number; dims?: { d: string; s: number }[]; note?: string }[];
  ai: { rec: string; confidence: number; summary: string; signals: { skill: string; rating: string; quote: string; note?: string }[]; keyMoments: { t: string; d: string }[] };
};
const buildDetail = (row?: Row): Detail => ({
  id: row?.id ?? "iv1",
  name: row?.name ?? "Dana Osei",
  ini: row?.ini ?? "DO",
  role: row?.role ?? "Platform Engineer",
  reqId: row?.reqId ?? "REQ-4799",
  type: row?.type ?? "TECHNICAL",
  round: row?.round ?? "System design",
  when: row?.when ?? "Today · 11:00 AM",
  dur: row?.dur ?? 60,
  mode: row?.mode ?? "Video",
  panelists: [
    { who: "Sam Okafor", role: "Staff Engineer", status: "submitted", rec: "STRONG_YES", overall: 4.6, dims: [{ d: "Systems design", s: 5 }, { d: "Trade-offs", s: 5 }, { d: "Communication", s: 4 }], note: "Excellent ledger design; reasoned about consistency vs availability without prompting." },
    { who: "Yuki Tanaka", role: "Senior Engineer", status: "submitted", rec: "YES", overall: 4.1, dims: [{ d: "Systems design", s: 4 }, { d: "Trade-offs", s: 4 }, { d: "Communication", s: 4 }], note: "Strong fundamentals; could push harder on failure modes." },
    { who: "Avery Chen", role: "Recruiter", status: "pending", rec: null },
  ],
  ai: {
    rec: "YES", confidence: 0.86,
    summary: "Dana demonstrated senior-level systems-design ability, designing a sharded payments ledger with clear consistency trade-offs. Communication was structured and collaborative. The only softer area was depth on failure-mode recovery.",
    signals: [
      { skill: "Distributed systems", rating: "strong", quote: "“I'd shard by account-id and use a write-ahead log per shard to keep the ledger append-only.”" },
      { skill: "Trade-off reasoning", rating: "strong", quote: "“Eventual consistency is fine for analytics, but the balance read must be strongly consistent.”" },
      { skill: "Failure handling", rating: "adequate", quote: "“We'd retry with idempotency keys…”", note: "less depth on partial-failure recovery" },
    ],
    keyMoments: [
      { t: "00:14", d: "Proposed the sharding scheme unprompted" },
      { t: "00:38", d: "Identified the dual-write problem and resolved with an outbox" },
    ],
  },
});

function IVDetail({ d, onBack }: { d: Detail; onBack: () => void }) {
  const t = INTERVIEW_TYPES[d.type] ?? INTERVIEW_TYPES.TECHNICAL;
  return (
    <div>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 14 }}><Icon name="chevsL" size={14} /> Interviews</button>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <span className="mono" style={{ width: 48, height: 48, borderRadius: 13, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", fontWeight: 700, fontSize: 16 }}>{d.ini}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}><h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{d.name}</h1><Pill tone={t.tone} bg={"color-mix(in oklab," + t.tone + " 13%, transparent)"}>{t.label}</Pill></div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>{d.round} · {d.role} · <span className="mono">{d.reqId}</span></div>
          </div>
          <Btn variant="soft" icon="calendar">Reschedule</Btn>
          <Btn variant="primary" icon="check">Submit feedback</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* AI interview-intelligence */}
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", background: "linear-gradient(110deg, var(--c-ai-tint), transparent 65%)", borderBottom: "1px solid var(--c-line)" }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Interview intelligence</span><Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">interview-intelligence</Pill></div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check">{d.ai.rec}</Pill><Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">conf {d.ai.confidence.toFixed(2)}</Pill></div>
              </div>
              <div style={{ padding: 18 }}>
                <p style={{ margin: "0 0 16px", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>{d.ai.summary}</p>
                <div style={{ ...fLabel, marginBottom: 9 }}>Skill signals · with evidence</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {d.ai.signals.map((s, i) => {
                    const rt = s.rating === "strong" ? "var(--c-ok)" : s.rating === "adequate" ? "var(--c-warn)" : "var(--c-danger)";
                    return (
                      <div key={i} style={{ padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 600, fontSize: 12.5 }}>{s.skill}</span><Pill tone={rt} bg={"color-mix(in oklab," + rt + " 13%, transparent)"} style={{ fontSize: 10 }}>{s.rating}</Pill></div>
                        <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 5, fontStyle: "italic", lineHeight: 1.45 }}>{s.quote}{s.note && <span style={{ fontStyle: "normal", color: "var(--c-ink-3)" }}>, {s.note}</span>}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {d.ai.keyMoments.map((k, i) => <span key={i} style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, color: "var(--c-ink-2)" }}><span className="mono" style={{ color: "var(--c-ai-ink)", background: "var(--c-ai-tint)", padding: "1px 7px", borderRadius: 5, fontSize: 11 }}>{k.t}</span>{k.d}</span>)}
                </div>
                <div style={{ marginTop: 14, fontSize: 11, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="users" size={13} /> A summary, not a decision, panelist scorecards and the hiring manager decide.</div>
              </div>
            </div>

            {/* panelist feedback */}
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Panelist feedback</span><Pill tone="var(--c-ink-2)">{d.panelists.filter((p) => p.status === "submitted").length} / {d.panelists.length} submitted</Pill></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {d.panelists.map((p, i) => (
                  <div key={i} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", padding: 14, background: p.status === "pending" ? "var(--c-surface-2)" : "var(--c-surface)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 9, alignItems: "center" }}><span className="mono" style={{ width: 28, height: 28, borderRadius: 99, background: "var(--c-surface-3)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "var(--c-ink-2)" }}>{p.who.split(" ").map((w) => w[0]).join("")}</span><div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{p.who}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{p.role}</div></div></div>
                      {p.status === "submitted" ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{p.overall}</span><Pill tone={recTone[p.rec ?? ""]} bg={"color-mix(in oklab," + recTone[p.rec ?? ""] + " 13%, transparent)"}>{(p.rec ?? "").replace("_", " ")}</Pill></div>
                        : <Pill icon="clock" tone="var(--c-warn)" bg="var(--c-warn-tint)">pending</Pill>}
                    </div>
                    {p.status === "submitted" && <>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "10px 0 8px" }}>{(p.dims ?? []).map((dm) => <div key={dm.d} style={{ display: "flex", gap: 7, alignItems: "center" }}><span style={{ fontSize: 11.5, color: "var(--c-ink-2)" }}>{dm.d}</span><Dots n={dm.s} /></div>)}</div>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--c-ink-2)", fontStyle: "italic", lineHeight: 1.45 }}>“{p.note}”</p>
                    </>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* right rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ ...fLabel, marginBottom: 4 }}>Details</div>
              {[["When", d.when], ["Duration", d.dur + " min"], ["Mode", d.mode], ["Round", d.round]].map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid var(--c-line)", fontSize: 12.5 }}><span style={{ color: "var(--c-ink-3)" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>)}
              <a style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 12, padding: "9px 12px", borderRadius: "var(--r)", background: "var(--c-brand-tint)", color: "var(--c-brand-ink)", fontWeight: 600, fontSize: 12.5, textDecoration: "none", cursor: "pointer" }}><Icon name="enter" size={15} />Join video call</a>
            </div>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><Icon name="sparkles" size={15} style={{ color: "var(--c-ai)" }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Suggested questions</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {["Walk through how you'd recover from a partial shard failure.", "How would you test the ledger's consistency guarantees?"].map((q, i) => <div key={i} style={{ fontSize: 12, color: "var(--c-ink-2)", padding: "8px 10px", borderRadius: "var(--r-sm)", background: "var(--c-surface-2)", lineHeight: 1.4 }}>{q}</div>)}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--c-ink-3)", marginTop: 8 }}>From interview-kit · tailored to the gaps above.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, loading, error, reload } = useData<Interview[]>(listInterviews);

  const rows = (data ?? []).map(toRow);
  const openRow = openId ? rows.find((r) => r.id === openId) : undefined;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* loading / error / empty rendered inside the page container, layout preserved */}
      {loading && (
        <div style={{ maxWidth: 1100, margin: "0 auto" }} aria-busy="true">
          <Skeleton className="h-10 w-64 rounded-[12px]" />
          <div className="mt-4 grid gap-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[16px]" />)}</div>
        </div>
      )}
      {!loading && error && (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <ErrorState title="Could not load interviews" body="The interviews service did not respond." code="GET /api/interviews" onRetry={reload} />
        </div>
      )}
      {!loading && !error && data && rows.length === 0 && (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <EmptyState title="No interviews scheduled" body="When you schedule a round it appears here with the panel and the AI-proposed times." />
        </div>
      )}
      {!loading && !error && data && rows.length > 0 && (
        openRow
          ? <IVDetail d={buildDetail(openRow)} onBack={() => setOpenId(null)} />
          : <IVList rows={rows} onOpen={(id) => setOpenId(id)} />
      )}
    </div>
  );
}
