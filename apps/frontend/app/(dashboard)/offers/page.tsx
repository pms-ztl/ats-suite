"use client";
// app/(dashboard)/offers/page.tsx - VERBATIM port of claude-design/screen-offers.jsx.
// An offers list plus the offer-letter composer (AI-drafted, human-approved): comp
// breakdown, band positioning, justification, approval chain, and letter preview.
// The list is wired to the real gateway via useData + listOffers(); the human
// approve action calls approveOffer(id). The composer's rich letter/comp example
// content has no API endpoint, so it stays as the prototype's decorative content
// and remains functional client-side (the status progression is local state).
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon, Logo } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listOffers, approveOffer } from "@/lib/api";
import type { Offer, OfferStatus } from "@/lib/types";

const money = (n: number) => "$" + n.toLocaleString();

/* presentation map for the real OfferStatus contract (drives the list badges) */
const OFFER_STATUS: Record<OfferStatus, { label: string; tone: string; bg: string; icon: string }> = {
  DRAFT:            { label: "Draft",            tone: "var(--c-ink-3)",   bg: "var(--c-surface-3)",    icon: "dot" },
  PENDING_APPROVAL: { label: "Pending approval", tone: "var(--c-warn)",    bg: "var(--c-warn-tint)",    icon: "clock" },
  APPROVED:         { label: "Approved",         tone: "var(--c-brand)",   bg: "var(--c-brand-tint)",   icon: "check" },
  SENT:             { label: "Sent",             tone: "var(--c-info)",    bg: "var(--c-info-tint)",    icon: "arrowUpRight" },
  ACCEPTED:         { label: "Accepted",         tone: "var(--c-ok)",      bg: "var(--c-ok-tint)",      icon: "check" },
  DECLINED:         { label: "Declined",         tone: "var(--c-danger)",  bg: "var(--c-danger-tint)",  icon: "x" },
  EXPIRED:          { label: "Expired",          tone: "var(--c-danger)",  bg: "var(--c-danger-tint)",  icon: "flag" },
};

// The composer drives its own status chip from a local lifecycle (draft .. sent),
// matching the prototype's OFFER_STATUS shape, so the human-approval buttons work.
type ComposerStatus = "draft" | "pending" | "approved" | "sent";
const COMPOSER_STATUS: Record<ComposerStatus, { label: string; tone: string; bg: string; icon: string }> = {
  draft:    { label: "Draft",            tone: "var(--c-ink-3)", bg: "var(--c-surface-3)", icon: "dot" },
  pending:  { label: "Pending approval", tone: "var(--c-warn)",  bg: "var(--c-warn-tint)", icon: "clock" },
  approved: { label: "Approved",         tone: "var(--c-brand)", bg: "var(--c-brand-tint)", icon: "check" },
  sent:     { label: "Sent",             tone: "var(--c-info)",  bg: "var(--c-info-tint)", icon: "arrowUpRight" },
};

// fStyles.label from the kit foundations, reused inline as the prototype did.
const labelStyle = { fontSize: 11, fontWeight: 700 as const, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "var(--c-ink-3)" };

const fmtDate = (iso?: string): string => {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// The composer's rich comp/band/justification/letter has no API endpoint yet, so
// it stays as the prototype's example content (decorative, fully functional).
const OFFER_DETAIL = {
  id: "of1", name: "Sofia Karim", ini: "SK", role: "Platform Engineer", level: "Senior (L5)", reqId: "REQ-4799", start: "Jul 14, 2026", expiresInDays: 10,
  ai: { confidence: 0.9, bandPosition: "75th percentile", signal: "STRONG_HIRE" },
  comp: { base: 182000, signing: 20000, annualBonus: 0.15, equity: "0.08% / 4yr", total: 230900 },
  band: { min: 160000, mid: 185000, max: 215000, market: { p25: 168000, p50: 188000, p75: 208000 } },
  justification: "Interview signal was STRONG_HIRE across the loop; positioning base near the 75th percentile of the band reflects the team's strong conviction and competing-offer risk. Signing bonus offsets unvested equity at current employer.",
  approvalChain: [
    { role: "Recruiter", who: "Avery Chen", status: "done" },
    { role: "Hiring Manager", who: "Jordan Lee", status: "current" },
    { role: "Finance", who: "Comp committee", status: "pending" },
  ],
  benefits: ["Full medical / dental / vision", "401(k) 4% match", "Unlimited PTO", "$2,000 learning budget", "Remote-first"],
};

function OffersList({ offers, onOpen }: { offers: Offer[]; onOpen: (o: Offer) => void }) {
  const drafts = offers.filter((o) => o.status === "DRAFT").length;
  const pending = offers.filter((o) => o.status === "PENDING_APPROVAL").length;
  const sent = offers.filter((o) => o.status === "SENT").length;
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Offers</h1>
            <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>{drafts} drafts · {pending} awaiting approval · {sent} sent.</p></div>
          <Btn variant="primary" icon="plus" onClick={() => onOpen(offers[0])}>Create offer</Btn>
        </div>
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 130px 100px", gap: 12, padding: "11px 18px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
            <span>Candidate</span><span>Requisition</span><span>Base salary</span><span>Status</span><span style={{ textAlign: "right" }}>Expires</span>
          </div>
          {offers.map((o, i) => {
            const st = OFFER_STATUS[o.status];
            return (
              <div key={o.id} onClick={() => onOpen(o)} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 130px 100px", gap: 12, padding: "13px 18px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", cursor: "pointer", transition: "background var(--t-fast)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                  <span className="mono" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{initials(o.candidateId)}</span>
                  <div><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{o.candidateId}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{o.aiDrafted ? "AI-drafted" : "manual"}</div></div>
                </div>
                <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{o.requisitionId || "unassigned"}</span>
                <span className="mono tnum" style={{ fontSize: 13.5, fontWeight: 600 }}>{money(o.baseSalary)}</span>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 11, fontWeight: 700, color: st.tone, background: st.bg, padding: "3px 10px", borderRadius: 99, justifySelf: "start" }}><Icon name={st.icon} size={11} />{st.label}</span>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-3)", textAlign: "right" }}>{fmtDate(o.startDate)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompRow({ k, v, sub, big }: { k: string; v: string; sub?: string; big?: boolean }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: big ? "12px 0" : "8px 0", borderTop: "1px solid var(--c-line)" }}>
    <span style={{ fontSize: big ? "var(--fs-sm)" : 12.5, fontWeight: big ? 700 : 500, color: big ? "var(--c-ink)" : "var(--c-ink-2)" }}>{k}{sub && <span style={{ fontWeight: 400, color: "var(--c-ink-3)" }}> · {sub}</span>}</span>
    <span className="mono tnum" style={{ fontSize: big ? 18 : 13, fontWeight: big ? 700 : 600, color: big ? "var(--c-brand)" : "var(--c-ink)" }}>{v}</span>
  </div>;
}

function Composer({ offer, onBack, onApprove }: { offer: Offer | null; onBack: () => void; onApprove: (o: Offer) => void }) {
  const d = OFFER_DETAIL;
  // Seed the local lifecycle from the real offer when one is selected.
  const seed: ComposerStatus = offer?.status === "PENDING_APPROVAL" ? "pending" : offer?.status === "APPROVED" ? "approved" : offer?.status === "SENT" ? "sent" : "draft";
  const [status, setStatus] = useState<ComposerStatus>(seed);
  const name = offer?.candidateId || d.name;
  const reqId = offer?.requisitionId || d.reqId;
  const c = d.comp, b = d.band;
  const bandPct = (v: number) => ((v - b.min) / (b.max - b.min)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 28px", borderBottom: "1px solid var(--c-line)" }}>
        <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevsL" size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Offer · {name}</h1>
            <Pill icon={COMPOSER_STATUS[status].icon} tone={COMPOSER_STATUS[status].tone} bg={COMPOSER_STATUS[status].bg}>{COMPOSER_STATUS[status].label}</Pill></div>
          <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{d.role} · {d.level} · <span className="mono">{reqId}</span></div>
        </div>
        <Btn variant="ghost">Save draft</Btn>
        {status === "draft" && <Btn variant="primary" icon="check" onClick={() => setStatus("pending")}>Submit for approval</Btn>}
        {status === "pending" && <Btn variant="primary" icon="check" onClick={() => { if (offer) onApprove(offer); setStatus("approved"); }}>Approve</Btn>}
        {status === "approved" && <Btn variant="primary" icon="arrowUpRight" onClick={() => { if (offer) onApprove(offer); setStatus("sent"); }}>Send to candidate</Btn>}
        {status === "sent" && <Pill icon="clock" tone="var(--c-info)" bg="var(--c-info-tint)">awaiting candidate</Pill>}
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.15fr 0.85fr", minHeight: 0 }}>
        {/* editor */}
        <div style={{ overflowY: "auto", padding: "22px 28px 50px", borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* AI draft banner */}
          <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "12px 15px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)" }}>
            <Icon name="sparkles" size={18} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>Drafted by the offer agent · positioned at the {d.ai.bandPosition}</div><div style={{ fontSize: 12, color: "var(--c-ink-2)" }}>Every field is editable. A human approves before anything is sent.</div></div>
            <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">conf {d.ai.confidence.toFixed(2)}</Pill>
          </div>

          {/* comp breakdown */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Compensation</h3><Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check">within band</Pill></div>
            <CompRow k="Base salary" v={money(c.base)} big />
            <CompRow k="Signing bonus" v={money(c.signing)} />
            <CompRow k="Annual bonus target" v={Math.round(c.annualBonus*100) + "%"} sub={money(c.base*c.annualBonus)} />
            <CompRow k="Equity" v={c.equity} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 2px", marginTop: 6, borderTop: "2px solid var(--c-line-strong)" }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Year-one total</span><span className="mono tnum" style={{ fontSize: 22, fontWeight: 700, color: "var(--c-brand)" }}>{money(c.total)}</span>
            </div>

            {/* band positioning */}
            <div style={{ marginTop: 18 }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>Base vs band &amp; market</div>
              <div style={{ position: "relative", height: 10, borderRadius: 99, background: "linear-gradient(90deg, var(--c-surface-3), var(--c-brand-tint-2))", marginBottom: 6 }}>
                <div style={{ position: "absolute", left: bandPct(b.market.p50) + "%", top: -3, bottom: -3, width: 1.5, background: "var(--c-ink-3)" }} title="Market p50" />
                <div style={{ position: "absolute", left: "calc(" + bandPct(c.base) + "% - 8px)", top: -3, width: 16, height: 16, borderRadius: 99, background: "var(--c-brand)", border: "2px solid var(--c-surface)", boxShadow: "var(--e1)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--c-ink-3)" }} className="mono"><span>{money(b.min)}</span><span>mid {money(b.mid)}</span><span>{money(b.max)}</span></div>
            </div>
          </div>

          {/* justification */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...labelStyle, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="sparkles" size={13} style={{ color: "var(--c-ai)" }} /> Justification · editable</div>
            <textarea defaultValue={d.justification} rows={4} style={{ width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", color: "var(--c-ink)", fontSize: 12.5, fontFamily: "var(--font-sans)", lineHeight: 1.55, resize: "vertical", outline: "none" }} />
          </div>
        </div>

        {/* approval + preview rail */}
        <div style={{ overflowY: "auto", padding: "22px 22px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* approval chain */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...labelStyle, marginBottom: 12 }}>Approval chain</div>
            {d.approvalChain.map((a, i) => {
              const eff = status === "approved" || status === "sent" ? "done" : status === "pending" && i === 1 ? "current" : a.status;
              const tone = eff === "done" ? "var(--c-ok)" : eff === "current" ? "var(--c-warn)" : "var(--c-ink-3)";
              return (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", paddingBottom: i < d.approvalChain.length - 1 ? 14 : 0, position: "relative" }}>
                  {i < d.approvalChain.length - 1 && <span style={{ position: "absolute", left: 13, top: 28, height: "calc(100% - 24px)", width: 2, background: "var(--c-line)" }} />}
                  <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", zIndex: 1, background: eff === "pending" ? "var(--c-surface-2)" : "color-mix(in oklab," + tone + " 14%, transparent)", color: tone, border: "1px solid " + (eff === "pending" ? "var(--c-line)" : "transparent") }}><Icon name={eff === "done" ? "check" : eff === "current" ? "clock" : "dot"} size={14} stroke={2.3} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.role}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{a.who}</div></div>
                  <Pill tone={tone} bg={eff === "pending" ? "var(--c-surface-2)" : "color-mix(in oklab," + tone + " 13%, transparent)"} style={{ fontSize: 10 }}>{eff === "current" ? "needs review" : eff}</Pill>
                </div>
              );
            })}
          </div>

          {/* letter preview */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ ...labelStyle, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Letter preview</span><Pill mono tone="var(--c-ink-3)">PDF</Pill></div>
            <div style={{ padding: "20px 22px", fontSize: 12.5, lineHeight: 1.65, color: "var(--c-ink-2)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}><Logo size={22} /><b style={{ color: "var(--c-ink)" }}>Northwind Talent</b></div>
              <p style={{ margin: "0 0 12px" }}>Dear {name},</p>
              <p style={{ margin: "0 0 12px" }}>We are delighted to offer you the role of <b style={{ color: "var(--c-ink)" }}>{d.role}</b> ({d.level}) on the Payments Platform team, starting <b style={{ color: "var(--c-ink)" }}>{d.start}</b>.</p>
              <div style={{ padding: "12px 14px", borderRadius: "var(--r)", background: "var(--c-surface-2)", margin: "0 0 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "var(--c-ink)" }}><span>Base salary</span><span className="mono">{money(c.base)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Signing bonus</span><span className="mono">{money(c.signing)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Equity</span><span className="mono">{c.equity}</span></div>
              </div>
              <p style={{ margin: "0 0 6px" }}>This offer expires in {d.expiresInDays} days. We cannot wait to build with you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OffersScreen() {
  const { data, loading, error, reload } = useData<Offer[]>(listOffers);
  const [view, setView] = useState<"list" | "composer">("list");
  const [sel, setSel] = useState<Offer | null>(null);

  const offers = data ?? [];

  // The human approve/send action. The AI never calls this; only the button does.
  async function approve(o: Offer) {
    try { await approveOffer(o.id); reload(); } catch { /* surfaced via toast when wired */ }
  }

  // The composer is always the prototype's rich screen; opening a row seeds it.
  if (view === "composer") {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <Composer offer={sel} onBack={() => setView("list")} onApprove={approve} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* loading / error / empty inside the prototype's list container */}
      {loading && (
        <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
              <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Offers</h1>
                <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Loading offers...</p></div>
            </div>
            <div style={{ display: "grid", gap: 2 }} aria-busy="true">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          </div>
        </div>
      )}
      {error && (
        <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <ErrorState title="Could not load offers" body="The offers service did not respond." code="GET /api/offers" onRetry={reload} />
          </div>
        </div>
      )}
      {data && offers.length === 0 && (
        <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
              <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Offers</h1>
                <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>AI drafts the letter; a human approves the comp and the chain before anything sends.</p></div>
              <Btn variant="primary" icon="plus" onClick={() => { setSel(null); setView("composer"); }}>Create offer</Btn>
            </div>
            <EmptyState title="No offers yet" body="When a candidate reaches the offer stage, the offer agent drafts a letter here for your approval." />
          </div>
        </div>
      )}
      {data && offers.length > 0 && (
        <OffersList offers={offers} onOpen={(o) => { setSel(o ?? null); setView("composer"); }} />
      )}
    </div>
  );
}
