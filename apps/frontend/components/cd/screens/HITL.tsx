"use client";
// components/screens/HITL.tsx
// Human-in-the-loop review queue + detail (evidence packs, reason codes, SLAs,
// reasoning trace, anti-rubber-stamp gate), ported pixel-exact from screen-hitl.jsx.
// Data via props; resolutions are optimistic and call onResolve.
import * as React from "react";
import { useState, useEffect } from "react";
import { Icon } from "../icon";
import { Btn } from "../aurora-ui";
import { Pill } from "../aurora-kit";
import type { HitlData, TraceStep } from "../types";

export function HITL({ data, onResolve }: { data: HitlData; onResolve?: (id: string, verb: string, reasonCode: string | null) => void }) {
  const { items = [], reasonCodes = [], trace = [] } = data;
  const [sel, setSel] = useState<string | null>(items[0]?.id ?? null);
  const [code, setCode] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [showTrace, setShowTrace] = useState(false);
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState(false);
  const cur = items.find((i) => i.id === sel);
  const slaTone: Record<string, [string, string]> = { ok: ["var(--ok)", "var(--ok-tint)"], warn: ["var(--warn)", "var(--warn-tint)"], danger: ["var(--danger)", "var(--danger-tint)"] };
  useEffect(() => { setCode(null); setShowTrace(false); setConfirm(false); }, [sel]);
  if (!cur) return null;
  const isDecline = /reject|escalation/i.test(cur.kind);
  const resolve = (verb: string) => { setDone((d) => ({ ...d, [sel as string]: verb })); setConfirm(false); onResolve?.(sel as string, verb, code); };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "100%", minHeight: 0 }}>
      <aside style={{ borderRight: "1px solid var(--line)", overflowY: "auto", background: "color-mix(in oklab, var(--surface) 50%, transparent)" }}>
        <div style={{ padding: "18px 18px 12px", position: "sticky", top: 0, background: "var(--bg)", zIndex: 2, borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Review queue</h1>
            <Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">AI checkpoints</Pill>
          </div>
          <p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.4 }}>Every machine decision that needs a human passes through here. Resolve fast, but never rubber-stamp.</p>
        </div>
        {items.map((it) => {
          const [tc, tb] = slaTone[it.slaTone];
          const isDone = done[it.id];
          return (
            <button key={it.id} onClick={() => setSel(it.id)} style={{ width: "100%", textAlign: "left", display: "block", padding: "13px 18px", border: "none", borderBottom: "1px solid var(--line)", cursor: "pointer", background: sel === it.id ? "var(--brand-tint)" : "transparent", transition: "background var(--t-fast)", position: "relative", opacity: isDone ? 0.6 : 1 }}
              onMouseEnter={(e) => { if (sel !== it.id) e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={(e) => { if (sel !== it.id) e.currentTarget.style.background = "transparent"; }}>
              {sel === it.id && <span style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "var(--brand)", borderRadius: "0 3px 3px 0" }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 11, fontWeight: 700, color: it.priority === "High" ? "var(--danger)" : "var(--ink-3)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: it.priority === "High" ? "var(--danger)" : "var(--ink-3)" }} />{it.priority}
                </span>
                <Pill mono tone={tc} bg={tb} icon="clock">{it.sla}</Pill>
              </div>
              <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", marginTop: 7 }}>{it.kind}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 1 }}>{it.who} · {it.role}</div>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 8 }}>
                <Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 10 }}>{it.agent}</Pill>
                {isDone ? <Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)" style={{ fontSize: 10 }}>{isDone}</Pill>
                  : <span className="mono" style={{ fontSize: 10.5, color: it.conf < 0.7 ? "var(--warn)" : "var(--ink-3)" }}>conf {it.conf.toFixed(2)}</span>}
              </div>
            </button>
          );
        })}
      </aside>

      <div style={{ overflowY: "auto", padding: "26px 30px 40px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <Pill mono>{cur.id}</Pill>
            <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{cur.kind}</h2>
          </div>
          <div style={{ fontSize: "var(--fs-md)", color: "var(--ink-2)" }}>{cur.who} · {cur.role}</div>

          <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 24%, transparent)", display: "flex", gap: 11, alignItems: "center" }}>
            <Icon name="shield" size={18} style={{ color: "var(--ai)", flexShrink: 0 }} />
            <div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--ai-ink)" }}>{cur.risk}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 1 }}>This checkpoint exists because a human, not the model, must make this call.</div></div>
          </div>

          <div style={{ marginTop: 18, borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center" }}><Icon name="scroll" size={15} /> Evidence pack</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {([["Agent output", cur.why], ["Why it was flagged", "Confidence " + cur.conf.toFixed(2) + (cur.conf < 0.7 ? ", below the 0.70 auto-advance threshold." : ", exception rule triggered.")]] as [string, string][]).map(([t, b], i) => (
                <div key={t} style={{ padding: "14px 18px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6 }}>{t}</div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink)", lineHeight: 1.55 }}>{b}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
              <Btn variant="soft" size="sm" icon="eye" onClick={() => setReviewed((r) => ({ ...r, [sel as string]: true }))}>Open full verdict</Btn>
              <Btn variant="soft" size="sm" icon="cpu" onClick={() => { setShowTrace((t) => !t); setReviewed((r) => ({ ...r, [sel as string]: true })); }}>{showTrace ? "Hide" : "View"} reasoning trace</Btn>
              {reviewed[sel as string] && <Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)" style={{ marginLeft: "auto", alignSelf: "center" }}>evidence reviewed</Pill>}
            </div>
            {showTrace && (
              <div style={{ padding: "8px 18px 16px", borderTop: "1px solid var(--line)", background: "var(--ai-tint)", animation: "rise .25s var(--ease-out)" }}>
                {trace.map((st: TraceStep & { d?: string }, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderTop: i ? "1px solid color-mix(in oklab, var(--ai) 12%, transparent)" : "none" }}>
                    <Icon name={st.status === "review" ? "eye" : st.status === "fail" ? "x" : "check"} size={13} style={{ color: st.status === "review" ? "var(--warn)" : st.status === "fail" ? "var(--danger)" : "var(--ai)" }} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{st.t}</span>
                    {st.d && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>· {st.d}</span>}
                    <span className="mono" style={{ fontSize: 10, color: "var(--ai-ink)", marginLeft: "auto" }}>{st.tool}()</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Your decision</span>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Pick a structured reason, it&apos;s logged to the audit trail</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {reasonCodes.map((rc) => (
                <button key={rc} onClick={() => setCode(rc)} style={{ fontSize: 12, fontWeight: 600, padding: "6px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid", borderColor: code === rc ? "transparent" : "var(--line-2)", background: code === rc ? "var(--brand-tint)" : "var(--surface)", color: code === rc ? "var(--brand-ink)" : "var(--ink-2)", transition: "all var(--t-fast)" }}>{rc}</button>
              ))}
            </div>
            {done[sel as string] ? (
              <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--ok-tint)", border: "1px solid color-mix(in oklab, var(--ok) 30%, transparent)", display: "flex", gap: 10, alignItems: "center" }}>
                <Icon name="check" size={18} style={{ color: "var(--ok)" }} />
                <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Resolved, <b>{done[sel as string]}</b>{code ? " · " + code : ""}. Logged to audit trail.</span>
              </div>
            ) : confirm ? (
              <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--danger-tint)", border: "1px solid color-mix(in oklab, var(--danger) 28%, transparent)" }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4, display: "flex", gap: 7, alignItems: "center" }}><Icon name="flag" size={15} style={{ color: "var(--danger)" }} /> Uphold the AI&apos;s call for {cur.who}?</div>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.45 }}>You&apos;re recording a human decision that ends this candidate&apos;s path. Confirm you reviewed the evidence and reasoning, not just the AI&apos;s summary.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" onClick={() => setConfirm(false)}>Go back</Btn>
                  <Btn variant="danger" icon="check" onClick={() => resolve("Approved (reviewed)")}>I reviewed, confirm</Btn>
                </div>
              </div>
            ) : (
              <div>
                {isDecline && (
                  <div style={{ marginBottom: 11, padding: "10px 13px", borderRadius: "var(--r)", background: reviewed[sel as string] && code ? "var(--ok-tint)" : "var(--warn-tint)", border: "1px solid color-mix(in oklab, " + (reviewed[sel as string] && code ? "var(--ok)" : "var(--warn)") + " 26%, transparent)", fontSize: 12, color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "center" }}>
                    <Icon name={reviewed[sel as string] && code ? "check" : "flag"} size={14} style={{ color: reviewed[sel as string] && code ? "var(--ok)" : "var(--warn)", flexShrink: 0 }} />
                    {reviewed[sel as string] && code ? "Evidence reviewed and a reason is set, you can resolve." : "Anti-rubber-stamp: open the evidence/trace and pick a reason before resolving an AI-driven decline."}
                  </div>
                )}
                <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                  {(() => { const gated = isDecline && !(reviewed[sel as string] && code); return (<>
                    <Btn variant="primary" icon="check" onClick={() => (gated ? undefined : (isDecline ? setConfirm(true) : resolve("Approved")))} style={{ opacity: gated ? 0.45 : 1, pointerEvents: gated ? "none" : "auto" }}>Approve <kbd className="mono" style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>A</kbd></Btn>
                    <Btn variant="soft" icon="copy" onClick={() => resolve("Edited & approved")}>Edit <kbd className="mono" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>E</kbd></Btn>
                    <Btn variant="danger" icon="x" onClick={() => resolve("Rejected")}>Reject <kbd className="mono" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>R</kbd></Btn>
                    <Btn variant="outlineAi" icon="arrowUpRight" onClick={() => resolve("Escalated")}>Escalate <kbd className="mono" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>X</kbd></Btn>
                  </>); })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
