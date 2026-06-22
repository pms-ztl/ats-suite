"use client";
// components/screens/RequisitionDetail.tsx
// Requisition detail (header, status, tabbed body: overview / pipeline / rounds /
// form / activity), ported pixel-exact from req-detail.jsx. Data via props. The
// rounds and form tabs render slots the app supplies (RoundsConfig / FormBuilder).
import * as React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "../icon";
import { Btn } from "../aurora-ui";
import { Pill, CountUp, Timeline } from "../aurora-kit";
import { Slot } from "@/lib/registry/slots";
import { useUiConfig } from "@/lib/config/ui-config-provider";
import { useFieldVisibility } from "@/lib/visibility";
import type { ReqDetailData, ReqStatusMeta } from "../types";

const LABEL: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" };

function Fact({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid var(--line)" }}>
      <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{k}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: 12.5, fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function PipelineFlow({ stages }: { stages: { stage: string; n: number; color: string }[] }) {
  const max = stages[0].n;
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
      {stages.map((s, i) => (
        <React.Fragment key={s.stage}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", padding: "16px 8px", position: "relative", overflow: "hidden", boxShadow: "var(--e1)" }}>
              <div style={{ position: "absolute", left: 0, bottom: 0, right: 0, height: 3, background: s.color, opacity: 0.5 }} />
              <div className="mono tnum" style={{ fontSize: 26, fontWeight: 700, color: s.color }}><CountUp to={s.n} /></div>
              <div style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600, marginTop: 2 }}>{s.stage}</div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: (s.n / max) * 100 + "%", background: s.color, borderRadius: 99, animation: "growx 1s var(--ease-out) both", animationDelay: i * 90 + "ms" }} />
              </div>
            </div>
          </div>
          {i < stages.length - 1 && (() => {
            const convNext = Math.round((stages[i + 1].n / s.n) * 100);
            return (
              <div style={{ width: 46, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <Icon name="chevR" size={16} style={{ color: "var(--ink-3)" }} />
                <span className="mono" style={{ fontSize: 10, color: convNext >= 50 ? "var(--ok)" : "var(--ink-3)", fontWeight: 600 }}>{convNext}%</span>
              </div>
            );
          })()}
        </React.Fragment>
      ))}
    </div>
  );
}

export function RequisitionDetail({ data, statusMeta, roundsSlot, formSlot, onBack, onCandidates, onEdit, onPost }: {
  data: ReqDetailData; statusMeta: ReqStatusMeta;
  roundsSlot?: React.ReactNode; formSlot?: React.ReactNode;
  onBack?: () => void; onCandidates?: () => void; onEdit?: () => void; onPost?: () => void;
}) {
  const d = data;
  const g = d.jd;
  const [tab, setTab] = useState("overview");
  const m = statusMeta;
  const tabs: [string, string, IconName][] = [["overview", "Overview", "fileText"], ["pipeline", "Pipeline", "radar"], ["rounds", "Interview rounds", "calendar"], ["form", "Application form", "listChecks"], ["activity", "Activity", "bolt"]];

  // D6 / WF-B slot seam — resolved per-tenant UiConfig (fail-soft) + live route key
  // for the requisition.detail.actions cluster. ctx hands a bound action block the
  // REAL requisition entity (id/title/status). Empty -> nothing (byte-identical).
  const { config: uiConfig } = useUiConfig();
  const { canSee } = useFieldVisibility(); // Module I — gate salary by policy
  const pathname = usePathname() ?? "";
  const slotCtx = { requisitionId: d.id, requisition: d, status: d.status, title: d.title, route: pathname };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ padding: "16px 30px 0" }}>
        <button onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 12 }}><Icon name="chevsL" size={14} /> All requisitions</button>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{d.title}</h1>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px 4px 9px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: m.tone, background: m.bg }}><Icon name={m.icon} size={12} stroke={2.4} />{m.label}</span>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 7, fontSize: 12.5, color: "var(--ink-2)" }}>
              <span className="mono">{d.id}</span><span>·</span><span>{d.dept}</span><span>·</span><span>{d.loc}</span>
              {canSee("salary") && <><span>·</span><span className="mono" style={{ color: "var(--brand)", fontWeight: 600 }}>₹{d.min / 1000}k to ₹{d.max / 1000}k</span></>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <Btn variant="soft" icon="copy" onClick={onEdit}>Edit</Btn>
            <Btn variant="soft" icon="users" onClick={onCandidates}>View candidates</Btn>
            <Btn variant="primary" icon="arrowUpRight" onClick={onPost}>Post job</Btn>
            {/* D6 — requisition.detail.actions: custom action(s) appended to the
                cluster, after Post job. Empty -> nothing. */}
            <Slot id="requisition.detail.actions" config={uiConfig} route="requisition.detail" ctx={slotCtx} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 16, borderBottom: "1px solid var(--line)" }}>
          {tabs.map(([id, label, ic]) => (
            <button key={id} onClick={() => setTab(id)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 600, color: tab === id ? "var(--ink)" : "var(--ink-3)", borderBottom: "2px solid", borderColor: tab === id ? "var(--brand)" : "transparent", marginBottom: -1 }}>
              <Icon name={ic} size={15} />{label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "22px 30px 50px" }}>
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20, alignItems: "start", animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 22, boxShadow: "var(--e1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Job description</h3>
                  <Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">jd-author · {g.inclusivity} inclusivity</Pill>
                </div>
                <p style={{ margin: "0 0 18px", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.6 }}>{g.description}</p>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Required qualifications</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                  {g.required.map((r, i) => <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--ink-2)" }}><Icon name="check" size={14} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />{r}</div>)}
                </div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Nice to have</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{g.niceToHave.map((r, i) => <Pill key={i} tone="var(--ink-2)" bg="var(--surface-2)">{r}</Pill>)}</div>
              </div>

              <div style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--ai) 24%, var(--line))", background: "linear-gradient(180deg, var(--ai-tint) 0%, transparent 38%)", padding: 20 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}><Icon name="sparkles" size={16} style={{ color: "var(--ai)" }} /><h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Custom screening criteria</h3></div>
                <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--ink-2)" }}>These admin-defined criteria are sent to the screener and appear in every verdict.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {d.customFields.map((cf) => (
                    <div key={cf.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r)", background: "var(--surface)", border: "1px solid var(--line)" }}>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{cf.label}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{cf.value}</div></div>
                      <Pill tone={cf.importanceTone} bg={cf.importanceBg}>{cf.importanceLabel}</Pill>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ ...LABEL, marginBottom: 4 }}>Details</div>
                <Fact k="Level" v={d.level} /><Fact k="Job family" v={d.family} /><Fact k="Location" v={d.loc} />
                {canSee("salary") && <Fact k="Salary" v={`₹${d.min / 1000}k to ${d.max / 1000}k`} mono />}<Fact k="Headcount" v={`${d.filled} / ${d.head} filled`} mono />
                <Fact k="Target start" v={d.target} /><Fact k="Posted" v={d.posted} />
              </div>
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ ...LABEL, marginBottom: 12 }}>Owners</div>
                {d.owners.map((o) => (
                  <div key={o.role} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <span className="mono" style={{ width: 32, height: 32, borderRadius: 99, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{o.ini}</span>
                    <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{o.name}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.role}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "pipeline" && (
          <div style={{ animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div><h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Candidate pipeline</h3><p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>{d.pipelineSummary}</p></div>
              <Btn variant="soft" icon="users" onClick={onCandidates}>Open candidates board</Btn>
            </div>
            <PipelineFlow stages={d.pipeline} />
            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {d.pipelineCards.map((card) => (
                <div key={card.label} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", padding: 16, boxShadow: "var(--e1)" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", color: card.color, background: "color-mix(in oklab," + card.color + " 13%, transparent)" }}><Icon name={card.icon} size={16} /></span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}><span className="mono tnum" style={{ fontSize: 24, fontWeight: 700 }}>{card.n}</span><span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>{card.label}</span></div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>{card.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rounds" && <div style={{ animation: "rise .3s var(--ease-out)" }}>{roundsSlot}</div>}
        {tab === "form" && <div style={{ animation: "rise .3s var(--ease-out)" }}>{formSlot}</div>}
        {tab === "activity" && (
          <div style={{ maxWidth: 620, animation: "rise .3s var(--ease-out)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "var(--fs-lg)", fontWeight: 700 }}>Activity</h3>
            <Timeline items={d.activity} />
          </div>
        )}
      </div>
    </div>
  );
}
