"use client";
// components/screens/Offers.tsx
// Offers list + offer-letter composer (AI-drafted, human-approved), ported pixel-exact
// from screen-offers.jsx. Comp breakdown, band positioning, approval chain, live letter
// preview. Data via props; status changes are optimistic and call onStatus.
import * as React from "react";
import { useState } from "react";
import { Icon, type IconName } from "../icon";
import { Logo } from "../icon";
import { Btn, EmptyHint } from "../aurora-ui";
import { Pill } from "../aurora-kit";
import { useTableSort, SortHead } from "@/components/shared/sortable";
import { toTitleCase } from "@/lib/utils";
import type { OffersData, OfferDetail, OfferStatusKey } from "../types";
import { ChartCard, EmptyChart } from "@/components/shared/charts";
import { SectionCard, Reveal } from "../aurora-kit";
import { FlowRibbon, BeadStream, StepCascade } from "@/components/shared/ribbon";

// ----- Offer lifecycle (ribbon) -----
// The screen's row type folds EXPIRED into "declined" (it has no "expired" key), so the
// live wrapper threads real per-raw-status counts via the optional `lifecycle` prop.
// Without it (sample-data callers) the counts fall back to the rows themselves.
export type OfferLifecycleKey = OfferStatusKey | "expired";
export type OfferLifecycleCounts = Record<OfferLifecycleKey, number>;
const LIFECYCLE_ORDER: OfferLifecycleKey[] = ["draft", "pending", "approved", "sent", "accepted", "declined", "expired"];
const LIFECYCLE_LABEL: Record<OfferLifecycleKey, string> = {
  draft: "Draft", pending: "Pending approval", approved: "Approved", sent: "Sent",
  accepted: "Accepted", declined: "Declined", expired: "Expired",
};
const LIFECYCLE_BEAD_COLOR: Record<OfferLifecycleKey, string> = {
  draft: "var(--ink-3)", pending: "var(--warn)", approved: "var(--info)", sent: "var(--ai)",
  accepted: "var(--ok)", declined: "var(--danger)", expired: "var(--danger)",
};

const money = (n: number) => "₹" + n.toLocaleString("en-IN");
const LABEL: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" };
const OFFER_STATUS: Record<OfferStatusKey, { label: string; tone: string; bg: string; icon: IconName }> = {
  draft: { label: "Draft", tone: "var(--ink-3)", bg: "var(--surface-3)", icon: "dot" },
  pending: { label: "Pending approval", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "clock" },
  approved: { label: "Approved", tone: "var(--brand)", bg: "var(--brand-tint)", icon: "check" },
  sent: { label: "Sent", tone: "var(--info)", bg: "var(--info-tint)", icon: "arrowUpRight" },
  accepted: { label: "Accepted", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
  declined: { label: "Declined", tone: "var(--ink-2)", bg: "var(--surface-3)", icon: "x" },
};

function CompRow({ k, v, sub, big }: { k: string; v: string; sub?: string; big?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: big ? "12px 0" : "8px 0", borderTop: "1px solid var(--line)" }}>
      <span style={{ fontSize: big ? "var(--fs-sm)" : 12.5, fontWeight: big ? 700 : 500, color: big ? "var(--ink)" : "var(--ink-2)" }}>{k}{sub && <span style={{ fontWeight: 400, color: "var(--ink-3)" }}> · {sub}</span>}</span>
      <span className="mono tnum" style={{ fontSize: big ? 18 : 13, fontWeight: big ? 700 : 600, color: big ? "var(--brand)" : "var(--ink)" }}>{v}</span>
    </div>
  );
}

function OffersList({ data, lifecycle, onOpen, onCreate }: { data: OffersData; lifecycle?: OfferLifecycleCounts; onOpen: (id: string) => void; onCreate?: () => void }) {
  const offers = data.offers ?? [];
  const { sorted, sort, toggle } = useTableSort(offers, { key: "base", dir: "desc" });

  // ----- Offer lifecycle ribbon: one point per status, in journey order, from real
  // offer rows (or the threaded raw-status counts, which keep Declined and Expired
  // honest). Every stage stays visible even at 0 so the journey reads left-to-right.
  const lifecycleCounts: OfferLifecycleCounts = lifecycle ?? (() => {
    const c: OfferLifecycleCounts = { draft: 0, pending: 0, approved: 0, sent: 0, accepted: 0, declined: 0, expired: 0 };
    for (const o of offers) c[o.status] += 1;
    return c;
  })();
  const lifecyclePoints = LIFECYCLE_ORDER.map((k) => ({ label: LIFECYCLE_LABEL[k], n: lifecycleCounts[k] }));
  // ----- Bead stream: every bead is one real offer, grouped by the same lifecycle
  // counts the ribbon uses, in the same journey order. -----
  const beadGroups = LIFECYCLE_ORDER.map((k) => ({ label: LIFECYCLE_LABEL[k], n: lifecycleCounts[k], color: LIFECYCLE_BEAD_COLOR[k] }));

  // ----- Real-data funnel: offers by stage, from the real offer statuses -----
  // The offer lifecycle is linear (draft->pending->approved->sent->accepted); an offer
  // in a later status has by definition passed every earlier one, so each stage counts
  // every offer at-or-beyond it. "declined" is terminal/off-path, so it is excluded from
  // the cumulative counts (we cannot know which stage it declined from).
  const STAGE_ORDER: OfferStatusKey[] = ["draft", "pending", "approved", "sent", "accepted"];
  const STAGE_LABEL: Record<string, string> = {
    draft: "Draft", pending: "Pending", approved: "Approved", sent: "Sent", accepted: "Accepted",
  };
  const linearOffers = offers.filter((o) => o.status !== "declined");
  const offerFunnel = STAGE_ORDER.map((stage, i) => ({
    label: STAGE_LABEL[stage],
    n: linearOffers.filter((o) => STAGE_ORDER.indexOf(o.status) >= i).length,
  }));
  const hasFunnel = offerFunnel[0].n > 0;
  return (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <div className="cd-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Offers</h1>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>{offers.filter((o) => o.status === "draft").length} drafts · {offers.filter((o) => o.status === "pending").length} awaiting approval · {offers.filter((o) => o.status === "sent").length} sent.</p></div>
          <Btn variant="primary" icon="plus" onClick={onCreate}>Create offer</Btn>
        </div>
        {/* Offer lifecycle ribbon - real per-status counts as a full-width stream. */}
        <Reveal i={1} style={{ marginBottom: 18 }}>
          <SectionCard title="Offer lifecycle" icon="fileText"
            headRight={<Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ textTransform: "none" }}>ribbon thickness = offers per status</Pill>}>
            <FlowRibbon points={lifecyclePoints} emptyLabel="The lifecycle appears once offers are drafted." />
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <BeadStream groups={beadGroups} emptyLabel="Beads appear as offers are created." />
            </div>
          </SectionCard>
        </Reveal>
        {offers.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <ChartCard title="Offers by stage" subtitle={`${linearOffers.length} active in the approval funnel`} height={220}>
              {hasFunnel ? (
                <StepCascade stages={offerFunnel} height={220}
                  emptyLabel="No active offers in the funnel" />
              ) : <EmptyChart label="No active offers in the funnel" />}
            </ChartCard>
          </div>
        )}
        {offers.length === 0 ? <EmptyHint icon="fileText" text="No offers yet." /> : (
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 130px 100px", gap: 12, padding: "11px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              <SortHead label="Candidate" sortKey="name" sort={sort} onSort={toggle} className="" />
              <SortHead label="Requisition" sortKey="reqId" sort={sort} onSort={toggle} className="" />
              <SortHead label="Base salary" sortKey="base" sort={sort} onSort={toggle} className="" />
              <SortHead label="Status" sortKey="status" sort={sort} onSort={toggle} className="" />
              <SortHead label="Expires" sortKey="expires" sort={sort} onSort={toggle} className="" align="right" />
            </div>
            {sorted.map((o, i) => {
              const st = OFFER_STATUS[o.status];
              return (
                <div key={o.id} onClick={() => onOpen(o.id)} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 130px 100px", gap: 12, padding: "13px 18px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none", cursor: "pointer", transition: "background var(--t-fast)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                    <span className="mono" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "var(--on-brand)" }}>{o.ini}</span>
                    <div><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{o.name}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.role}</div></div>
                  </div>
                  <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{o.reqId}</span>
                  <span className="mono tnum" style={{ fontSize: 13.5, fontWeight: 600 }}>{money(o.base)}</span>
                  <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 11, fontWeight: 700, color: st.tone, background: st.bg, padding: "3px 10px", borderRadius: 99, justifySelf: "start" }}><Icon name={st.icon} size={11} />{toTitleCase(st.label)}</span>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "right" }}>{o.expires}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Composer({ d, onBack, onStatus }: { d: OfferDetail; onBack: () => void; onStatus?: (s: OfferStatusKey) => void }) {
  const [status, setStatus] = useState<OfferStatusKey>("draft");
  const c = d.comp, b = d.band;
  const bandPct = (v: number) => ((v - b.min) / (b.max - b.min)) * 100;
  const set = (s: OfferStatusKey) => { setStatus(s); onStatus?.(s); };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 28px", borderBottom: "1px solid var(--line)" }}>
        <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevsL" size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Offer · {d.name}</h1>
            <Pill icon={OFFER_STATUS[status].icon} tone={OFFER_STATUS[status].tone} bg={OFFER_STATUS[status].bg}>{toTitleCase(OFFER_STATUS[status].label)}</Pill></div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{d.role} · {d.level} · <span className="mono">{d.reqId}</span></div>
        </div>
        <Btn variant="ghost">Save draft</Btn>
        {status === "draft" && <Btn variant="primary" icon="check" onClick={() => set("pending")}>Submit for approval</Btn>}
        {status === "pending" && <Btn variant="primary" icon="check" onClick={() => set("approved")}>Approve</Btn>}
        {status === "approved" && <Btn variant="primary" icon="arrowUpRight" onClick={() => set("sent")}>Send to candidate</Btn>}
        {status === "sent" && <Pill icon="clock" tone="var(--info)" bg="var(--info-tint)">awaiting candidate</Pill>}
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.15fr 0.85fr", minHeight: 0 }}>
        <div style={{ overflowY: "auto", padding: "22px 28px 50px", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "12px 15px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 22%, transparent)" }}>
            <Icon name="sparkles" size={18} style={{ color: "var(--ai)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--ai-ink)" }}>Drafted by the offer agent · positioned at the {d.ai.bandPosition}</div><div style={{ fontSize: 12, color: "var(--ink-2)" }}>Every field is editable. A human approves before anything is sent.</div></div>
            <Pill mono tone="var(--ai-ink)" bg="var(--ai-tint-2)">conf {d.ai.confidence.toFixed(2)}</Pill>
          </div>

          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Compensation</h3><Pill tone="var(--ok)" bg="var(--ok-tint)" icon="check">within band</Pill></div>
            <CompRow k="Base salary" v={money(c.base)} big />
            <CompRow k="Signing bonus" v={money(c.signing)} />
            <CompRow k="Annual bonus target" v={Math.round(c.annualBonus * 100) + "%"} sub={money(c.base * c.annualBonus)} />
            <CompRow k="Equity" v={c.equity} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 2px", marginTop: 6, borderTop: "2px solid var(--line-strong)" }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Year-one total</span><span className="mono tnum" style={{ fontSize: 22, fontWeight: 700, color: "var(--brand)" }}>{money(c.total)}</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={{ ...LABEL, marginBottom: 10 }}>Base vs band &amp; market</div>
              <div style={{ position: "relative", height: 10, borderRadius: 99, background: "linear-gradient(90deg, var(--surface-3), var(--brand-tint-2))", marginBottom: 6 }}>
                <div style={{ position: "absolute", left: bandPct(b.market.p50) + "%", top: -3, bottom: -3, width: 1.5, background: "var(--ink-3)" }} title="Market p50" />
                <div style={{ position: "absolute", left: "calc(" + bandPct(c.base) + "% - 8px)", top: -3, width: 16, height: 16, borderRadius: 99, background: "var(--brand)", border: "2px solid var(--surface)", boxShadow: "var(--e1)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-3)" }} className="mono"><span>{money(b.min)}</span><span>mid {money(b.mid)}</span><span>{money(b.max)}</span></div>
            </div>
          </div>

          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...LABEL, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="sparkles" size={13} style={{ color: "var(--ai)" }} /> Justification · editable</div>
            <textarea defaultValue={d.justification} rows={4} style={{ width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--ink)", fontSize: 12.5, fontFamily: "var(--font-sans)", lineHeight: 1.55, resize: "vertical", outline: "none" }} />
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "22px 22px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...LABEL, marginBottom: 12 }}>Approval chain</div>
            {d.approvalChain.map((a, i) => {
              const eff = status === "approved" || status === "sent" ? "done" : status === "pending" && i === 1 ? "current" : a.status;
              const tone = eff === "done" ? "var(--ok)" : eff === "current" ? "var(--warn)" : "var(--ink-3)";
              return (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", paddingBottom: i < d.approvalChain.length - 1 ? 14 : 0, position: "relative" }}>
                  {i < d.approvalChain.length - 1 && <span style={{ position: "absolute", left: 13, top: 28, height: "calc(100% - 24px)", width: 2, background: "var(--line)" }} />}
                  <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", zIndex: 1, background: eff === "pending" ? "var(--surface-2)" : "color-mix(in oklab," + tone + " 14%, transparent)", color: tone, border: "1px solid " + (eff === "pending" ? "var(--line)" : "transparent") }}><Icon name={eff === "done" ? "check" : eff === "current" ? "clock" : "dot"} size={14} stroke={2.3} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.role}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{a.who}</div></div>
                  <Pill tone={tone} bg={eff === "pending" ? "var(--surface-2)" : "color-mix(in oklab," + tone + " 13%, transparent)"} style={{ fontSize: 10 }}>{eff === "current" ? "Needs review" : toTitleCase(eff)}</Pill>
                </div>
              );
            })}
          </div>

          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ ...LABEL, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Letter preview</span><Pill mono tone="var(--ink-3)">PDF</Pill></div>
            <div style={{ padding: "20px 22px", fontSize: 12.5, lineHeight: 1.65, color: "var(--ink-2)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}><Logo size={22} /><b style={{ color: "var(--ink)" }}>{d.companyName}</b></div>
              <p style={{ margin: "0 0 12px" }}>Dear {d.name},</p>
              <p style={{ margin: "0 0 12px" }}>We&apos;re delighted to offer you the role of <b style={{ color: "var(--ink)" }}>{d.role}</b> ({d.level}) on the {d.team} team, starting <b style={{ color: "var(--ink)" }}>{d.start}</b>.</p>
              <div style={{ padding: "12px 14px", borderRadius: "var(--r)", background: "var(--surface-2)", margin: "0 0 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "var(--ink)" }}><span>Base salary</span><span className="mono">{money(c.base)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Signing bonus</span><span className="mono">{money(c.signing)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Equity</span><span className="mono">{c.equity}</span></div>
              </div>
              <p style={{ margin: "0 0 6px" }}>This offer expires in {d.expiresInDays} days. We can&apos;t wait to build with you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Offers({ data, lifecycle, onStatus, onCreate }: { data: OffersData; lifecycle?: OfferLifecycleCounts; onStatus?: (id: string, status: OfferStatusKey) => void; onCreate?: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (openId && data.detail) {
    return <Composer d={data.detail} onBack={() => setOpenId(null)} onStatus={(s) => onStatus?.(openId, s)} />;
  }
  return <OffersList data={data} lifecycle={lifecycle} onOpen={(id) => setOpenId(id)} onCreate={onCreate} />;
}
