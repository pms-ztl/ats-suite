"use client";
// components/screens/Interviews.tsx
// Interviews list + detail (panelist feedback + AI interview-intelligence summary),
// ported pixel-exact from screen-interviews.jsx. Data via props.
import * as React from "react";
import { useState } from "react";
import { Icon } from "../icon";
import { Btn, EmptyHint } from "../aurora-ui";
import { Pill, SectionCard } from "../aurora-kit";
import { FlowRibbon, PulseGrid } from "@/components/shared/ribbon";
import { CalendarHeat } from "@/components/shared/ribbon-ext";
import { useTableSort, SortHead } from "@/components/shared/sortable";
import { toTitleCase } from "@/lib/utils";
import { SceneArt } from "@/components/shared/scene-art";
import type { InterviewsData, InterviewDetail } from "../types";

const recTone: Record<string, string> = { STRONG_YES: "var(--ok)", YES: "var(--ok)", NEUTRAL: "var(--warn)", NO: "var(--danger)", STRONG_NO: "var(--danger)" };
const LABEL: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" };
function Dots({ n }: { n: number }) { return <span style={{ display: "inline-flex", gap: 3 }}>{Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: i < Math.round(n) ? "var(--brand)" : "var(--surface-3)" }} />)}</span>; }

function IVList({ data, weekAhead, densityDays, onOpen, onSchedule }: { data: InterviewsData; weekAhead?: { label: string; n: number; sub?: string }[]; densityDays?: { date: string; n: number }[]; onOpen: (id: string) => void; onSchedule?: () => void }) {
  const [filter, setFilter] = useState("all");
  const all = data.interviews ?? [];
  const filtered = all.filter((r) => filter === "all" || r.status === filter);
  const { sorted: rows, sort, toggle } = useTableSort(filtered, { key: "when", dir: "desc" });
  const headCell: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" };
  return (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <div className="cd-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Interviews</h1>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>{all.filter((r) => r.status === "awaiting").length} awaiting feedback · {all.filter((r) => r.status === "scheduled").length} upcoming.</p></div>
          <Btn variant="primary" icon="plus" onClick={onSchedule}>Schedule interview</Btn>
        </div>
        <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
          {[["all", "All"], ["scheduled", "Scheduled"], ["awaiting", "Feedback due"], ["completed", "Completed"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid", borderColor: filter === k ? "transparent" : "var(--line-2)", background: filter === k ? "var(--brand-tint)" : "var(--surface)", color: filter === k ? "var(--brand-ink)" : "var(--ink-2)" }}>{l}</button>
          ))}
        </div>
        {all.length > 0 && (
          <SectionCard title="Interview flow" icon="calendar" style={{ marginBottom: 16 }}
            headRight={<Pill icon="calendar" tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>ribbon thickness = live interviews by state</Pill>}>
            <FlowRibbon
              points={([["scheduled", "Scheduled"], ["awaiting", "Feedback due"], ["completed", "Completed"]] as const)
                .map(([k, label]) => ({ label, n: all.filter((r) => r.status === k).length }))
                .filter((p) => p.n > 0)}
              showShare
              height={190}
              emptyLabel="The flow appears once interviews are on the calendar." />
          </SectionCard>
        )}
        {/* Next-7-days pulse: per-day interview counts (+ real total hours), supplied
            by interviews-live from the raw startsAt/durationMins data. */}
        {weekAhead && all.length > 0 && (
          <SectionCard title="Next 7 days" icon="clock" style={{ marginBottom: 16 }}
            headRight={<Pill icon="calendar" tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>tile glow = interviews that day</Pill>}>
            <PulseGrid cells={weekAhead} emptyLabel="Nothing scheduled in the coming week." />
          </SectionCard>
        )}
        {/* Interview density: longer-range per-day heatmap from the loaded interviews'
            startsAt span (PulseGrid above is the 7-day glance; this is the trend).
            CalendarHeat renders its own empty state when there is too little data. */}
        {densityDays && all.length > 0 && (
          <SectionCard title="Interview density" icon="calendar" style={{ marginBottom: 16 }}
            headRight={<Pill icon="calendar" tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>cell heat = interviews that day</Pill>}>
            <CalendarHeat days={densityDays} emptyLabel="Density appears once interviews span a few days." />
          </SectionCard>
        )}
        {rows.length === 0 ? (
          all.length === 0 ? (
            <div style={{ padding: "24px 0 6px" }}>
              <SceneArt scene="interview" maxWidth={400}
                title="No interviews scheduled yet"
                body="Schedule a round and it lands here with the panel, timing and the AI interview-intelligence summary alongside every conversation." />
            </div>
          ) : <EmptyHint icon="calendar" text="No interviews in this view." />
        ) : (
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 130px 120px", gap: 12, padding: "11px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", alignItems: "center" }}>
              <SortHead label="Candidate" sortKey="name" sort={sort} onSort={toggle} className="" style={headCell} />
              <SortHead label="Round" sortKey="round" sort={sort} onSort={toggle} className="" style={headCell} />
              <SortHead label="When" sortKey="when" sort={sort} onSort={toggle} className="" style={headCell} />
              <span style={headCell}>Panel</span>
              <SortHead label="Status" sortKey="status" sort={sort} onSort={toggle} className="" style={headCell} align="right" />
            </div>
            {rows.map((r, i) => {
              const t = data.types[r.type], st = data.statusMeta[r.status];
              return (
                <div key={r.id} onClick={() => onOpen(r.id)} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 130px 120px", gap: 12, padding: "13px 18px", alignItems: "center", borderTop: "1px solid var(--line)", cursor: "pointer", transition: "background var(--t-fast)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", gap: 11, alignItems: "center", minWidth: 0 }}>
                    <span className="mono" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "var(--on-brand)" }}>{r.ini}</span>
                    <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.name}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.role} · <span className="mono">{r.reqId}</span></div></div>
                  </div>
                  <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.round}</div><Pill tone={t.tone} bg={"color-mix(in oklab," + t.tone + " 13%, transparent)"} style={{ fontSize: 10, marginTop: 2 }}>{toTitleCase(t.label)}</Pill></div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{r.when}<div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.dur}m · {toTitleCase(r.mode)}</div></div>
                  <div style={{ display: "flex", marginLeft: 2 }}>{r.panel.slice(0, 3).map((p, j) => <span key={j} title={p} className="mono" style={{ width: 26, height: 26, borderRadius: 99, marginLeft: j ? -8 : 0, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, background: "var(--surface-3)", color: "var(--ink-2)", border: "2px solid var(--surface)" }}>{p.split(" ").map((w) => w[0]).join("")}</span>)}</div>
                  <span style={{ display: "inline-flex", gap: 6, alignItems: "center", justifySelf: "end", fontSize: 11, fontWeight: 700, color: st.tone, background: st.bg, padding: "3px 10px", borderRadius: 99 }}><Icon name={st.icon} size={11} />{toTitleCase(st.label)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function IVDetail({ d, types, onBack }: { d: InterviewDetail; types: InterviewsData["types"]; onBack: () => void }) {
  const t = types[d.type];
  return (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <div className="cd-page">
        <button onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 14 }}><Icon name="chevsL" size={14} /> Interviews</button>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <span className="mono" style={{ width: 48, height: 48, borderRadius: 13, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "var(--on-brand)", fontWeight: 700, fontSize: 16 }}>{d.ini}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}><h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{d.name}</h1><Pill tone={t.tone} bg={"color-mix(in oklab," + t.tone + " 13%, transparent)"}>{toTitleCase(t.label)}</Pill></div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>{d.round} · {d.role} · <span className="mono">{d.reqId}</span></div>
          </div>
          <Btn variant="soft" icon="calendar">Reschedule</Btn>
          <Btn variant="primary" icon="check">Submit feedback</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--ai) 22%, var(--line))", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", background: "linear-gradient(110deg, var(--ai-tint), transparent 65%)", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Icon name="sparkles" size={16} style={{ color: "var(--ai)" }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Interview intelligence</span><Pill mono tone="var(--ai-ink)" bg="var(--ai-tint-2)">interview-intelligence</Pill></div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Pill tone="var(--ok)" bg="var(--ok-tint)" icon="check">{toTitleCase(d.ai.rec)}</Pill><Pill mono tone="var(--ai-ink)" bg="var(--ai-tint)">conf {d.ai.confidence.toFixed(2)}</Pill></div>
              </div>
              <div style={{ padding: 18 }}>
                <p style={{ margin: "0 0 16px", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.6 }}>{d.ai.summary}</p>
                <div style={{ ...LABEL, marginBottom: 9 }}>Skill signals · with evidence</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {d.ai.signals.map((s, i) => {
                    const rt = s.rating === "strong" ? "var(--ok)" : s.rating === "adequate" ? "var(--warn)" : "var(--danger)";
                    return (
                      <div key={i} style={{ padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface-2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 600, fontSize: 12.5 }}>{s.skill}</span><Pill tone={rt} bg={"color-mix(in oklab," + rt + " 13%, transparent)"} style={{ fontSize: 10 }}>{toTitleCase(s.rating)}</Pill></div>
                        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 5, fontStyle: "italic", lineHeight: 1.45 }}>{s.quote}{s.note && <span style={{ fontStyle: "normal", color: "var(--ink-3)" }}>, {s.note}</span>}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {d.ai.keyMoments.map((k, i) => <span key={i} style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, color: "var(--ink-2)" }}><span className="mono" style={{ color: "var(--ai-ink)", background: "var(--ai-tint)", padding: "1px 7px", borderRadius: 5, fontSize: 11 }}>{k.t}</span>{k.d}</span>)}
                </div>
                <div style={{ marginTop: 14, fontSize: 11, color: "var(--ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="users" size={13} /> A summary, not a decision, panelist scorecards and the hiring manager decide.</div>
              </div>
            </div>

            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Panelist feedback</span><Pill tone="var(--ink-2)">{d.panelists.filter((p) => p.status === "submitted").length} / {d.panelists.length} submitted</Pill></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {d.panelists.map((p, i) => (
                  <div key={i} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", padding: 14, background: p.status === "pending" ? "var(--surface-2)" : "var(--surface)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 9, alignItems: "center" }}><span className="mono" style={{ width: 28, height: 28, borderRadius: 99, background: "var(--surface-3)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "var(--ink-2)" }}>{p.who.split(" ").map((w) => w[0]).join("")}</span><div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{p.who}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.role}</div></div></div>
                      {p.status === "submitted" ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{p.overall}</span><Pill tone={recTone[p.rec]} bg={"color-mix(in oklab," + recTone[p.rec] + " 13%, transparent)"}>{toTitleCase(p.rec)}</Pill></div>
                        : <Pill icon="clock" tone="var(--warn)" bg="var(--warn-tint)">Pending</Pill>}
                    </div>
                    {p.status === "submitted" && <>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "10px 0 8px" }}>{p.dims.map((dm) => <div key={dm.d} style={{ display: "flex", gap: 7, alignItems: "center" }}><span style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{dm.d}</span><Dots n={dm.s} /></div>)}</div>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--ink-2)", fontStyle: "italic", lineHeight: 1.45 }}>&ldquo;{p.note}&rdquo;</p>
                    </>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ ...LABEL, marginBottom: 4 }}>Details</div>
              {([["When", d.when], ["Duration", d.dur + " min"], ["Mode", toTitleCase(d.mode)], ["Round", d.round]] as [string, string][]).map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid var(--line)", fontSize: 12.5 }}><span style={{ color: "var(--ink-3)" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>)}
              <a style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 12, padding: "9px 12px", borderRadius: "var(--r)", background: "var(--brand-tint)", color: "var(--brand-ink)", fontWeight: 600, fontSize: 12.5, textDecoration: "none", cursor: "pointer" }}><Icon name="enter" size={15} />Join video call</a>
            </div>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><Icon name="sparkles" size={15} style={{ color: "var(--ai)" }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Suggested questions</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {d.suggestedQuestions.map((q, i) => <div key={i} style={{ fontSize: 12, color: "var(--ink-2)", padding: "8px 10px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", lineHeight: 1.4 }}>{q}</div>)}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 8 }}>From interview-kit · tailored to the gaps above.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Interviews({ data, onSchedule, weekAhead, densityDays }: {
  data: InterviewsData; onSchedule?: () => void;
  /** real per-day counts + total hours for the next-7-days pulse; supplied by interviews-live */
  weekAhead?: { label: string; n: number; sub?: string }[];
  /** real per-day interview counts over the loaded span, for the density heatmap; supplied by interviews-live */
  densityDays?: { date: string; n: number }[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (openId && data.detail) return <IVDetail d={data.detail} types={data.types} onBack={() => setOpenId(null)} />;
  return <IVList data={data} weekAhead={weekAhead} densityDays={densityDays} onOpen={(id) => setOpenId(id)} onSchedule={onSchedule} />;
}
