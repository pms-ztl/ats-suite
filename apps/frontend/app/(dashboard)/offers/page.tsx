"use client";
// app/(dashboard)/offers/page.tsx - EXACT Claude Design "Aurora" offers screen
// (claude-design/screen-offers.jsx): an offers list plus an offer-letter composer
// (AI-drafted, human-approved). The offer agent drafts every field; a human
// approves the comp and the approval chain before anything is sent. Wired to the
// real gateway via listOffers + approveOffer. OfferStatus drives the badges.
// No fabricated comp numbers - placeholders show where a value is absent.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon, Logo } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listOffers, approveOffer } from "@/lib/api";
import type { Offer, OfferStatus } from "@/lib/types";

/* ---- presentation map, derived from the real OfferStatus contract ---- */
const OFFER_STATUS: Record<OfferStatus, { label: string; tone: string; bg: string; icon: string }> = {
  DRAFT:            { label: "Draft",            tone: "var(--c-ink-3)", bg: "var(--c-surface-3)", icon: "dot" },
  PENDING_APPROVAL: { label: "Pending approval", tone: "var(--c-warn)",  bg: "var(--c-warn-tint)", icon: "clock" },
  APPROVED:         { label: "Approved",         tone: "var(--c-ok)",    bg: "var(--c-ok-tint)",   icon: "check" },
  SENT:             { label: "Sent",             tone: "var(--c-info)",  bg: "var(--c-info-tint)", icon: "arrowUpRight" },
  ACCEPTED:         { label: "Accepted",         tone: "var(--c-ok)",    bg: "var(--c-ok-tint)",   icon: "check" },
  DECLINED:         { label: "Declined",         tone: "var(--c-ink-2)", bg: "var(--c-surface-3)", icon: "x" },
  EXPIRED:          { label: "Expired",          tone: "var(--c-danger)", bg: "var(--c-danger-tint)", icon: "flag" },
};

const LABEL = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "var(--c-ink-3)" };

const money = (n: number) => "$" + n.toLocaleString();
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function fmtDate(iso?: string): string {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ---- a comp line; shows a placeholder when the value is absent ---- */
function CompRow({ k, v, sub, big, placeholder }: { k: string; v?: string; sub?: string; big?: boolean; placeholder?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: big ? "12px 0" : "8px 0", borderTop: "1px solid var(--c-line)" }}>
      <span style={{ fontSize: big ? "var(--fs-sm)" : 12.5, fontWeight: big ? 700 : 500, color: big ? "var(--c-ink)" : "var(--c-ink-2)" }}>
        {k}{sub && <span style={{ fontWeight: 400, color: "var(--c-ink-3)" }}> · {sub}</span>}
      </span>
      <span className="mono tnum" style={{ fontSize: big ? 18 : 13, fontWeight: big ? 700 : 600, color: placeholder ? "var(--c-ink-3)" : big ? "var(--c-brand)" : "var(--c-ink)" }}>
        {placeholder ? "Not set" : v}
      </span>
    </div>
  );
}

/* ---- the rich composer for the selected offer (AI-drafted, human-approved) ---- */
function Composer({ offer, onApprove, action }: { offer: Offer; onApprove: () => void; action: ActionState }) {
  const st = OFFER_STATUS[offer.status];
  const hasSigning = typeof offer.signingBonus === "number";
  const hasEquity = !!offer.equity;
  // Year-one total is only honest when we know the base; never invent the rest.
  const total = offer.baseSalary + (hasSigning ? offer.signingBonus! : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* composer header + the human action */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid var(--c-line)" }}>
        <span className="mono" style={{ width: 40, height: 40, borderRadius: "var(--r)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{initials(offer.candidateId)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Offer · {offer.candidateId}</h2>
            <Pill icon={st.icon} tone={st.tone} bg={st.bg}>{st.label}</Pill>
          </div>
          <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>Requisition <span className="mono">{offer.requisitionId || "unassigned"}</span></div>
        </div>
        <a href={`/offers/${offer.id}`}><Btn variant="ghost" trailIcon="arrowUpRight">Open</Btn></a>
        {offer.status === "PENDING_APPROVAL" && (
          <Btn variant="primary" icon="check" onClick={onApprove}>{action.busy ? "Approving..." : "Approve & send"}</Btn>
        )}
        {offer.status === "APPROVED" && (
          <Btn variant="primary" icon="arrowUpRight" onClick={onApprove}>{action.busy ? "Sending..." : "Send to candidate"}</Btn>
        )}
        {offer.status === "SENT" && <Pill icon="clock" tone="var(--c-info)" bg="var(--c-info-tint)">awaiting candidate</Pill>}
      </div>

      {action.error && (
        <div style={{ margin: "14px 20px 0", padding: "11px 13px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)", fontSize: 12, color: "var(--c-danger)", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.45 }}>
          <Icon name="flag" size={14} style={{ flexShrink: 0, marginTop: 1 }} /><span>{action.error}</span>
        </div>
      )}
      {action.done && (
        <div style={{ margin: "14px 20px 0", padding: "11px 13px", borderRadius: "var(--r)", background: "var(--c-ok-tint)", border: "1px solid color-mix(in oklab, var(--c-ok) 28%, transparent)", fontSize: 12, color: "var(--c-ok)", display: "flex", gap: 8, alignItems: "center", lineHeight: 1.45 }}>
          <Icon name="check" size={14} style={{ flexShrink: 0 }} /><span>Approval recorded. Refreshing the offer.</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,0.85fr)", minHeight: 0 }}>
        {/* editor column */}
        <div style={{ padding: "20px 20px 28px", borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* AI draft banner */}
          <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "12px 15px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)" }}>
            <Icon name="sparkles" size={18} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>{offer.aiDrafted ? "Drafted by the offer agent" : "Drafted by a recruiter"}</div>
              <div style={{ fontSize: 12, color: "var(--c-ink-2)" }}>Every field is editable. A human approves before anything is sent.</div>
            </div>
            <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">{offer.aiDrafted ? "AI draft" : "manual"}</Pill>
          </div>

          {/* comp breakdown - real fields only, placeholders where absent */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Compensation</h3>
              <Pill tone="var(--c-ink-3)" bg="var(--c-surface-2)" icon="briefcase">starts {fmtDate(offer.startDate)}</Pill>
            </div>
            <CompRow k="Base salary" v={money(offer.baseSalary)} big />
            <CompRow k="Signing bonus" v={hasSigning ? money(offer.signingBonus!) : undefined} placeholder={!hasSigning} />
            <CompRow k="Equity" v={hasEquity ? offer.equity : undefined} placeholder={!hasEquity} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 2px", marginTop: 6, borderTop: "2px solid var(--c-line-strong)" }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Year-one cash total</span>
              <span className="mono tnum" style={{ fontSize: 22, fontWeight: 700, color: "var(--c-brand)" }}>{money(total)}</span>
            </div>

            {/* band positioning - no market band in the contract yet; honest note */}
            <div style={{ marginTop: 18 }}>
              <div style={{ ...LABEL, marginBottom: 10 }}>Base vs band &amp; market</div>
              <div style={{ position: "relative", height: 10, borderRadius: 99, background: "linear-gradient(90deg, var(--c-surface-3), var(--c-brand-tint-2))", marginBottom: 6 }}>
                <div style={{ position: "absolute", left: "calc(50% - 8px)", top: -3, width: 16, height: 16, borderRadius: 99, background: "var(--c-brand)", border: "2px solid var(--c-surface)", boxShadow: "var(--e1)" }} />
              </div>
              <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--c-ink-3)" }}>
                <span>band min</span><span>market data not connected</span><span>band max</span>
              </div>
            </div>
          </div>

          {/* justification - editable */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...LABEL, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <Icon name="sparkles" size={13} style={{ color: "var(--c-ai)" }} /> Justification · editable
            </div>
            <textarea rows={4} placeholder="Why this offer, why this number. The offer agent drafts a rationale here; a human edits and owns it before approval."
              style={{ width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", color: "var(--c-ink)", fontSize: 12.5, fontFamily: "var(--font-sans)", lineHeight: 1.55, resize: "vertical", outline: "none" }} />
          </div>
        </div>

        {/* approval + preview rail */}
        <div style={{ padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* approval chain - real chain from the contract */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...LABEL, marginBottom: 12 }}>Approval chain</div>
            {offer.approvalChain.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>No approvers assigned yet.</div>
            ) : offer.approvalChain.map((a, i) => {
              const eff = a.state;
              const tone = eff === "done" ? "var(--c-ok)" : eff === "current" ? "var(--c-warn)" : "var(--c-ink-3)";
              const last = i === offer.approvalChain.length - 1;
              return (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", paddingBottom: last ? 0 : 14, position: "relative" }}>
                  {!last && <span style={{ position: "absolute", left: 13, top: 28, height: "calc(100% - 24px)", width: 2, background: "var(--c-line)" }} />}
                  <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", zIndex: 1, background: eff === "wait" ? "var(--c-surface-2)" : `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone, border: eff === "wait" ? "1px solid var(--c-line)" : "1px solid transparent" }}>
                    <Icon name={eff === "done" ? "check" : eff === "current" ? "clock" : "dot"} size={14} stroke={2.3} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{a.role}</div>
                  </div>
                  <Pill tone={tone} bg={eff === "wait" ? "var(--c-surface-2)" : `color-mix(in oklab, ${tone} 13%, transparent)`} style={{ fontSize: 10 }}>{eff === "current" ? "needs review" : eff === "done" ? "approved" : "waiting"}</Pill>
                </div>
              );
            })}
          </div>

          {/* letter preview */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...LABEL, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Letter preview</span>
              <Pill mono tone="var(--c-ink-3)">PDF</Pill>
            </div>
            <div style={{ padding: "20px 22px", fontSize: 12.5, lineHeight: 1.65, color: "var(--c-ink-2)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}><Logo size={22} /><b style={{ color: "var(--c-ink)" }}>Northwind Talent</b></div>
              <p style={{ margin: "0 0 12px" }}>Dear {offer.candidateId},</p>
              <p style={{ margin: "0 0 12px" }}>We are delighted to offer you a role on the team, starting <b style={{ color: "var(--c-ink)" }}>{fmtDate(offer.startDate)}</b>.</p>
              <div style={{ padding: "12px 14px", borderRadius: "var(--r)", background: "var(--c-surface-2)", margin: "0 0 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "var(--c-ink)" }}><span>Base salary</span><span className="mono">{money(offer.baseSalary)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Signing bonus</span><span className="mono">{hasSigning ? money(offer.signingBonus!) : "Not set"}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Equity</span><span className="mono">{hasEquity ? offer.equity : "Not set"}</span></div>
              </div>
              <p style={{ margin: "0 0 6px" }}>We cannot wait to build with you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ActionState = { busy?: boolean; error?: string; done?: boolean };

export default function OffersPage() {
  const { data, loading, error, reload } = useData<Offer[]>(listOffers);
  const [selId, setSelId] = useState<string | null>(null);
  const [act, setAct] = useState<Record<string, ActionState>>({});

  const offers = data ?? [];
  const cur = offers.find((o) => o.id === (selId ?? offers[0]?.id)) ?? null;
  const drafts = offers.filter((o) => o.status === "DRAFT").length;
  const pending = offers.filter((o) => o.status === "PENDING_APPROVAL").length;
  const sent = offers.filter((o) => o.status === "SENT").length;

  // The human approve/send action. The AI never calls this; only this button does.
  async function approve(o: Offer) {
    setAct((p) => ({ ...p, [o.id]: { busy: true } }));
    try {
      await approveOffer(o.id);
      setAct((p) => ({ ...p, [o.id]: { done: true } }));
      reload();
    } catch (e) {
      setAct((p) => ({ ...p, [o.id]: { error: e instanceof Error ? e.message : "Could not record your approval." } }));
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Offers</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>
            {data ? `${drafts} drafts · ${pending} awaiting approval · ${sent} sent.` : "AI drafts the letter; a human approves the comp and the chain before anything sends."}
          </p>
        </div>
        <a href="/offers/new"><Btn variant="primary" icon="plus">Create offer</Btn></a>
      </div>

      {/* loading / error / empty */}
      {loading && (
        <div style={{ display: "grid", gap: 2 }} aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      )}
      {error && <ErrorState title="Could not load offers" body="The offers service did not respond." code="GET /api/offers" onRetry={reload} />}
      {data && offers.length === 0 && (
        <EmptyState title="No offers yet" body="When a candidate reaches the offer stage, the offer agent drafts a letter here for your approval." />
      )}

      {data && offers.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 18 }}>
          {/* offers list */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 150px 110px", gap: 12, padding: "11px 18px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
              <span>Candidate</span><span>Requisition</span><span>Base salary</span><span>Status</span><span style={{ textAlign: "right" }}>Starts</span>
            </div>
            {offers.map((o, i) => {
              const st = OFFER_STATUS[o.status];
              const active = cur?.id === o.id;
              return (
                <div key={o.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 150px 110px", gap: 12, padding: "13px 18px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", cursor: "pointer", position: "relative", background: active ? "var(--c-brand-tint)" : "transparent", transition: "background var(--t-fast)" }}
                  onClick={() => setSelId(o.id)}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--c-surface-2)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  {active && <span style={{ position: "absolute", left: 0, top: 10, bottom: 10, width: 3, background: "var(--c-brand)", borderRadius: "0 3px 3px 0" }} />}
                  <a href={`/offers/${o.id}`} onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 11, alignItems: "center", textDecoration: "none", color: "inherit", minWidth: 0 }}>
                    <span className="mono" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{initials(o.candidateId)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.candidateId}</div>
                      <div style={{ fontSize: 11, color: "var(--c-ink-3)", display: "inline-flex", gap: 5, alignItems: "center" }}>{o.aiDrafted && <Icon name="sparkles" size={10} style={{ color: "var(--c-ai)" }} />}{o.aiDrafted ? "AI-drafted" : "manual"}</div>
                    </div>
                  </a>
                  <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.requisitionId || "unassigned"}</span>
                  <span className="mono tnum" style={{ fontSize: 13.5, fontWeight: 600 }}>{money(o.baseSalary)}</span>
                  <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 11, fontWeight: 700, color: st.tone, background: st.bg, padding: "3px 10px", borderRadius: 99, justifySelf: "start" }}><Icon name={st.icon} size={11} />{st.label}</span>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-3)", textAlign: "right" }}>{fmtDate(o.startDate)}</span>
                </div>
              );
            })}
          </div>

          {/* selected offer composer */}
          {cur && (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
              <Composer offer={cur} action={act[cur.id] ?? {}} onApprove={() => approve(cur)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
