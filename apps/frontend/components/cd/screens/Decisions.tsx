"use client";
// components/screens/Decisions.tsx
// Decisions queue (human-approval-gated; AI advisory), ported pixel-exact from
// screen-decisions.jsx. Two-pane: list + detail with the status flow, the advisory
// AI recommendation, and the human approval gate with the anti-rubber-stamp confirm.
// Data via props. Status changes are optimistic and call onDecision.
import * as React from "react";
import { useState } from "react";
import { Icon, type IconName } from "../icon";
import { Btn, EmptyHint } from "../aurora-ui";
import { Pill } from "../aurora-kit";
import type { Decision, DecisionsData, DecStatus } from "../types";
import { ChartCard, DonutChart, EmptyChart, CHART_COLORS } from "@/components/shared/charts";

const DEC_STATUS: Record<string, { label: string; tone: string; bg: string; icon: IconName }> = {
  pending: { label: "Pending approval", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "clock" },
  approved: { label: "Approved", tone: "var(--brand)", bg: "var(--brand-tint)", icon: "check" },
  sent: { label: "Offer sent", tone: "var(--info)", bg: "var(--info-tint)", icon: "arrowUpRight" },
  accepted: { label: "Accepted", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
  declined: { label: "Declined", tone: "var(--ink-2)", bg: "var(--surface-3)", icon: "x" },
};
const AI_REC: Record<string, { label: string; tone: string; bg: string; icon: IconName }> = {
  hire: { label: "Hire", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
  reject: { label: "Reject", tone: "var(--danger)", bg: "var(--danger-tint)", icon: "x" },
  hold: { label: "Hold", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "eye" },
};

function StatusFlow({ status }: { status: string }) {
  const order = ["pending", "approved", "sent", "accepted"];
  const idx = status === "declined" ? -1 : order.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {order.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 11, background: i <= idx ? "var(--brand)" : "var(--surface-2)", color: i <= idx ? "var(--on-brand)" : "var(--ink-3)", border: i <= idx ? "none" : "1px solid var(--line)" }}>{i <= idx ? <Icon name="check" size={12} stroke={3} /> : i + 1}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: i <= idx ? "var(--ink)" : "var(--ink-3)", textTransform: "capitalize" }}>{s}</span>
          </div>
          {i < order.length - 1 && <div style={{ height: 2, flex: 1, background: i < idx ? "var(--brand)" : "var(--line)", marginBottom: 16 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Decisions({ data, onDecision }: { data: DecisionsData; onDecision?: (id: string, status: string) => void }) {
  const [items, setItems] = useState<Decision[]>(data.decisions ?? []);
  const [selId, setSelId] = useState<string | null>(items[0]?.id ?? null);
  const [confirm, setConfirm] = useState(false);
  const [filter, setFilter] = useState("all");
  const cur = items.find((d) => d.id === selId);
  const list = items.filter((d) => filter === "all" || (filter === "pending" ? d.status === "pending" : d.status !== "pending"));

  // ----- Real-data summary: count by AI recommendation across the real decision rows -----
  const recCounts = items.reduce(
    (acc, d) => { acc[d.aiRec] = (acc[d.aiRec] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  );
  const recSplit = [
    { name: "Hire", value: recCounts.hire ?? 0, fill: CHART_COLORS.ok },
    { name: "Hold", value: recCounts.hold ?? 0, fill: CHART_COLORS.warn },
    { name: "Reject", value: recCounts.reject ?? 0, fill: CHART_COLORS.danger },
  ].filter((d) => d.value > 0);
  const setStatus = (st: DecStatus) => { if (!cur) return; setItems(items.map((d) => (d.id === selId ? { ...d, status: st, by: "You" } : d))); setConfirm(false); onDecision?.(cur.id, st); };

  if (items.length === 0) {
    return <div style={{ display: "grid", placeItems: "center", height: "100%" }}><EmptyHint icon="gavel" text="No decisions to review right now." /></div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", height: "100%", minHeight: 0 }}>
      <aside style={{ borderRight: "1px solid var(--line)", overflowY: "auto", background: "color-mix(in oklab, var(--surface) 50%, transparent)" }}>
        <div style={{ padding: "18px 18px 12px", position: "sticky", top: 0, background: "var(--bg)", zIndex: 2, borderBottom: "1px solid var(--line)" }}>
          <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Decisions</h1>
          <p style={{ margin: "4px 0 10px", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.4 }}>{items.filter((d) => d.status === "pending").length} awaiting your approval. The AI recommends, a human approves.</p>
          <div style={{ display: "flex", gap: 6 }}>
            {[["all", "All"], ["pending", "Pending"], ["resolved", "Resolved"]].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid", borderColor: filter === k ? "transparent" : "var(--line-2)", background: filter === k ? "var(--brand-tint)" : "var(--surface)", color: filter === k ? "var(--brand-ink)" : "var(--ink-2)" }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
          <ChartCard title="AI recommendation split" subtitle={`${items.length} decisions`} height={170}>
            {recSplit.length ? (
              <DonutChart
                data={recSplit}
                colors={recSplit.map((d) => d.fill)}
                centerLabel={items.length}
                centerSub="decisions"
                valueFormatter={(v) => `${v}`}
              />
            ) : <EmptyChart label="No recommendations yet" />}
          </ChartCard>
        </div>
        {list.map((d) => {
          const rec = AI_REC[d.aiRec], st = DEC_STATUS[d.status];
          return (
            <button key={d.id} onClick={() => { setSelId(d.id); setConfirm(false); }} style={{ width: "100%", textAlign: "left", display: "block", padding: "13px 18px", border: "none", borderBottom: "1px solid var(--line)", cursor: "pointer", background: selId === d.id ? "var(--brand-tint)" : "transparent", position: "relative" }}
              onMouseEnter={(e) => { if (selId !== d.id) e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={(e) => { if (selId !== d.id) e.currentTarget.style.background = "transparent"; }}>
              {selId === d.id && <span style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "var(--brand)", borderRadius: "0 3px 3px 0" }} />}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="mono" style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "var(--on-brand)" }}>{d.ini}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.role}</div>
                </div>
                <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 10, fontWeight: 700, color: st.tone, background: st.bg, padding: "2px 7px", borderRadius: 99 }}><Icon name={st.icon} size={10} />{st.label}</span>
              </div>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 9 }}>
                <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 10, fontWeight: 700, color: rec.tone, background: rec.bg, padding: "2px 7px 2px 6px", borderRadius: 99 }}><Icon name="sparkles" size={10} />AI: {rec.label}</span>
                <span className="mono" style={{ fontSize: 10, color: d.aiConf < 0.7 ? "var(--warn)" : "var(--ink-3)" }}>conf {d.aiConf.toFixed(2)}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginLeft: "auto" }}>{d.when} ago</span>
              </div>
            </button>
          );
        })}
      </aside>

      <div style={{ overflowY: "auto" }}>
        {cur && (
          <div className="cd-page">
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
              <span className="mono" style={{ width: 48, height: 48, borderRadius: "var(--r)", display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "var(--on-brand)", fontWeight: 700, fontSize: 16 }}>{cur.ini}</span>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{cur.name}</h2>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>{cur.role} · <span className="mono">{cur.reqId}</span></div>
              </div>
            </div>

            <div style={{ padding: "18px 22px", borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", marginBottom: 18, boxShadow: "var(--e1)" }}>
              <StatusFlow status={cur.status} />
            </div>

            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--ai) 22%, var(--line))", background: "linear-gradient(120deg, var(--ai-tint), transparent 70%)", padding: 18, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Pill icon="sparkles" tone="var(--on-ai)" bg="var(--ai)">AI recommendation · advisory</Pill>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 13, fontWeight: 700, color: AI_REC[cur.aiRec].tone }}><Icon name={AI_REC[cur.aiRec].icon} size={15} />{AI_REC[cur.aiRec].label}</span>
                  <Pill mono tone={cur.aiConf < 0.7 ? "var(--warn)" : "var(--ai-ink)"} bg={cur.aiConf < 0.7 ? "var(--warn-tint)" : "var(--ai-tint)"}>conf {cur.aiConf.toFixed(2)}</Pill>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.55 }}>{cur.rationale}</p>
              <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
                {([["Screening score", String(cur.screenScore), "var(--ai-ink)"], ["Interview avg", cur.interviewAvg.toFixed(1) + " / 5", "var(--brand)"]] as [string, string, string][]).map(([l, v, c]) => (
                  <div key={l} style={{ flex: 1, padding: "10px 13px", borderRadius: "var(--r)", background: "var(--surface)", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>{l}</div>
                    <div className="mono tnum" style={{ fontSize: 19, fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {cur.status === "pending" ? (
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 99, background: "var(--brand-tint)", color: "var(--brand)", display: "grid", placeItems: "center" }}><Icon name="users" size={15} /></span>
                  <div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Your approval is required</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>The decision is yours, the AI cannot approve, send, or reject on its own.</div></div>
                </div>
                {cur.aiRec === "reject" && cur.lowConf && (
                  <div style={{ margin: "12px 0", padding: "11px 13px", borderRadius: "var(--r)", background: "var(--warn-tint)", border: "1px solid color-mix(in oklab, var(--warn) 28%, transparent)", fontSize: 12, color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.45 }}>
                    <Icon name="flag" size={14} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} /><span><b style={{ color: "var(--ink)" }}>Resist rubber-stamping.</b> The model is only {Math.round(cur.aiConf * 100)}% confident on a reject. Review the portfolio yourself before upholding it.</span>
                  </div>
                )}
                {confirm ? (
                  <div style={{ marginTop: 14, padding: 14, borderRadius: "var(--r-lg)", background: "var(--danger-tint)", border: "1px solid color-mix(in oklab, var(--danger) 28%, transparent)" }}>
                    <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>Confirm: uphold the AI&apos;s reject for {cur.name}?</div>
                    <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink-2)" }}>You&apos;re recording a human rejection. This is final and logged to the audit trail with your name.</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="ghost" onClick={() => setConfirm(false)}>Go back &amp; review</Btn>
                      <Btn variant="danger" icon="x" onClick={() => setStatus("declined")}>Yes, I reviewed, reject</Btn>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
                    <Btn variant="primary" icon="check" onClick={() => setStatus("approved")}>Approve {cur.aiRec === "hire" ? "hire" : "decision"}</Btn>
                    <Btn variant="danger" icon="x" onClick={() => (cur.aiRec === "reject" ? setConfirm(true) : setStatus("declined"))}>Reject</Btn>
                    <Btn variant="soft" icon="eye">Add comment</Btn>
                    <Btn variant="ghost" icon="arrowUpRight" style={{ marginLeft: "auto" }}>Reassign</Btn>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--e1)" }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", color: DEC_STATUS[cur.status].tone, background: DEC_STATUS[cur.status].bg }}><Icon name={DEC_STATUS[cur.status].icon} size={18} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{DEC_STATUS[cur.status].label} by {cur.by}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{cur.when} ago · recorded to audit trail</div>
                </div>
                {cur.status === "approved" && cur.aiRec === "hire" && <Btn variant="primary" icon="fileText" onClick={() => setStatus("sent")}>Send offer</Btn>}
                {cur.status === "sent" && <Pill icon="clock" tone="var(--info)" bg="var(--info-tint)">awaiting candidate</Pill>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
