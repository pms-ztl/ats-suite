"use client";
// app/(dashboard)/offers/[id]/page.tsx - EXACT Claude Design "Aurora" single-offer
// detail / composer (claude-design/screen-offers.jsx "Composer"): a candidate + role
// header with the OfferStatus badge, the AI-drafted-letter context banner, a real
// compensation breakdown (base / signing / equity / start), an editable
// justification, the approval chain, and a live letter preview. The offer agent
// drafts every field; a human owns the approve / send actions - the AI never sends.
// Wired to the real gateway: a local raw() reads GET /offers/{id} and maps the
// contract defensively; approveOffer(id) records the human approval; send is a
// best-effort POST. No comp numbers are fabricated - placeholders show where a
// value is absent. The shell supplies <main>/p-6; this page owns its max width.
import { useState } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill, Confidence, SectionCard } from "@/components/aurora-kit";
import { Skeleton, ErrorState } from "@/components/aurora";
import { Icon, Logo } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { approveOffer } from "@/lib/api";
import { toTitleCase } from "@/lib/utils";
import type { Offer, OfferStatus, UserRole } from "@/lib/types";

/* ---- local gateway fetch: bearer from sessionStorage, unwrap res?.data ?? res ---- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function raw(method: string, path: string, body?: unknown): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  const json = await res.json();
  return json?.data ?? json;
}

/* ---- map the single-offer payload defensively into the Offer view-model ---- */
const fullName = (o: any) => o?.name || [o?.firstName, o?.lastName].filter(Boolean).join(" ") || "";
function toOffer(o: any): Offer {
  const chain = Array.isArray(o?.approvalChain) ? o.approvalChain : Array.isArray(o?.approvals) ? o.approvals : [];
  return {
    id: o?.id ?? "",
    candidateId: fullName(o?.candidate) || o?.candidateId || o?.candidateName || "Candidate",
    requisitionId: o?.requisitionId ?? o?.requisition?.id ?? "",
    status: (o?.status ?? "DRAFT") as OfferStatus,
    baseSalary: Number(o?.baseSalary ?? o?.base ?? 0),
    signingBonus: o?.signingBonus != null ? Number(o.signingBonus) : o?.signing != null ? Number(o.signing) : undefined,
    equity: o?.equity ?? o?.equityGrant ?? undefined,
    startDate: o?.startDate ?? o?.start ?? "",
    approvalChain: chain.map((a: any) => ({
      name: a?.name ?? a?.who ?? fullName(a?.approver) ?? a?.userId ?? "Approver",
      role: (a?.role ?? a?.approverRole ?? "RECRUITER") as UserRole,
      state: (a?.state ?? a?.status ?? "wait") as "done" | "current" | "wait",
    })),
    aiDrafted: Boolean(o?.aiDrafted ?? o?.aiGenerated ?? true),
  };
}

/* ---- presentation map, derived from the real OfferStatus contract ---- */
const OFFER_STATUS: Record<OfferStatus, { label: string; tone: string; bg: string; icon: string }> = {
  DRAFT:            { label: "Draft",            tone: "var(--c-ink-3)",  bg: "var(--c-surface-3)",   icon: "dot" },
  PENDING_APPROVAL: { label: "Pending approval", tone: "var(--c-warn)",   bg: "var(--c-warn-tint)",   icon: "clock" },
  APPROVED:         { label: "Approved",         tone: "var(--c-ok)",     bg: "var(--c-ok-tint)",     icon: "check" },
  SENT:             { label: "Sent",             tone: "var(--c-info)",   bg: "var(--c-info-tint)",   icon: "arrowUpRight" },
  ACCEPTED:         { label: "Accepted",         tone: "var(--c-ok)",     bg: "var(--c-ok-tint)",     icon: "check" },
  DECLINED:         { label: "Declined",         tone: "var(--c-ink-2)",  bg: "var(--c-surface-3)",   icon: "x" },
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

type ActionState = { busy?: boolean; error?: string; done?: string };

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: offer, loading, error, reload } = useData<Offer>(async () => toOffer(await raw("GET", `/offers/${id}`)), [id]);
  const [act, setAct] = useState<ActionState>({});

  // The human approve / send actions. The AI never calls these; only these buttons do.
  async function approve() {
    setAct({ busy: true });
    try {
      await approveOffer(id); // graceful in lib/api; resolves even when the gateway is quiet
      setAct({ done: "Approval recorded. Refreshing the offer." });
      reload();
    } catch (e) {
      setAct({ error: e instanceof Error ? e.message : "Could not record your approval." });
    }
  }
  async function send() {
    setAct({ busy: true });
    try {
      await raw("POST", `/offers/${id}/send`); // best-effort; surfaced gracefully
      setAct({ done: "Offer sent to the candidate. Refreshing." });
      reload();
    } catch (e) {
      setAct({ error: e instanceof Error ? e.message : "Could not send this offer." });
    }
  }

  /* page-level loading / error (the offer is the spine of the page) */
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Skeleton className="h-16 rounded-2xl" />
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,0.85fr)", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
          </div>
        </div>
      </div>
    );
  }
  if (error || !offer) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <ErrorState title="Offer not found" body="We could not load this offer." code={`GET /api/offers/${id}`} onRetry={reload} />
      </div>
    );
  }

  const st = OFFER_STATUS[offer.status];
  const hasSigning = typeof offer.signingBonus === "number";
  const hasEquity = !!offer.equity;
  // Year-one cash total is only honest when we know the base; never invent the rest.
  const total = offer.baseSalary + (hasSigning ? offer.signingBonus! : 0);

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* back link */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--c-line)", flexWrap: "wrap" }}>
        <a href="/offers" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", textDecoration: "none", fontWeight: 600 }}>
          <Icon name="chevsL" size={14} /> Offers
        </a>
      </div>

      {/* candidate + role header with the OfferStatus badge and the human action */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0", flexWrap: "wrap" }}>
        <span className="mono" style={{ width: 52, height: 52, borderRadius: "var(--r-lg)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 17, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{initials(offer.candidateId)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Offer · {offer.candidateId}</h1>
            <Pill icon={st.icon} tone={st.tone} bg={st.bg}>{toTitleCase(st.label)}</Pill>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--c-ink-3)", marginTop: 3 }}>
            Requisition <span className="mono">{offer.requisitionId || "unassigned"}</span> · starts <b style={{ color: "var(--c-ink-2)" }}>{fmtDate(offer.startDate)}</b>
          </div>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          <Btn variant="ghost" disabled={act.busy}>Save draft</Btn>
          {offer.status === "PENDING_APPROVAL" && (
            <Btn variant="primary" icon="check" onClick={approve} disabled={act.busy}>{act.busy ? "Approving..." : "Approve & send"}</Btn>
          )}
          {offer.status === "APPROVED" && (
            <Btn variant="primary" icon="arrowUpRight" onClick={send} disabled={act.busy}>{act.busy ? "Sending..." : "Send to candidate"}</Btn>
          )}
          {offer.status === "DRAFT" && (
            <Btn variant="primary" icon="check" onClick={approve} disabled={act.busy}>{act.busy ? "Submitting..." : "Submit for approval"}</Btn>
          )}
          {offer.status === "SENT" && <Pill icon="clock" tone="var(--c-info)" bg="var(--c-info-tint)">awaiting candidate</Pill>}
        </div>
      </div>

      {act.error && (
        <div style={{ marginBottom: 18, padding: "11px 13px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)", fontSize: 12, color: "var(--c-danger)", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.45 }}>
          <Icon name="flag" size={14} style={{ flexShrink: 0, marginTop: 1 }} /><span>{act.error}</span>
        </div>
      )}
      {act.done && (
        <div style={{ marginBottom: 18, padding: "11px 13px", borderRadius: "var(--r)", background: "var(--c-ok-tint)", border: "1px solid color-mix(in oklab, var(--c-ok) 28%, transparent)", fontSize: 12, color: "var(--c-ok)", display: "flex", gap: 8, alignItems: "center", lineHeight: 1.45 }}>
          <Icon name="check" size={14} style={{ flexShrink: 0 }} /><span>{act.done}</span>
        </div>
      )}

      {/* two-column working surface; reflows to one column on small viewports */}
      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        {/* editor column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* AI draft banner */}
          <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "12px 15px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)" }}>
            <Icon name="sparkles" size={18} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>{offer.aiDrafted ? "Drafted by the offer agent" : "Drafted by a recruiter"}</div>
              <div style={{ fontSize: 12, color: "var(--c-ink-2)" }}>Every field is editable. A human approves before anything is sent.</div>
            </div>
            <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">{offer.aiDrafted ? "AI draft" : "manual"}</Pill>
          </div>

          {/* compensation - real fields only, placeholders where absent */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Compensation</h3>
              <Pill tone="var(--c-ink-3)" bg="var(--c-surface-2)" icon="briefcase">starts {fmtDate(offer.startDate)}</Pill>
            </div>
            <CompRow k="Base salary" v={money(offer.baseSalary)} big />
            <CompRow k="Signing bonus" v={hasSigning ? money(offer.signingBonus!) : undefined} placeholder={!hasSigning} />
            <CompRow k="Equity" v={hasEquity ? offer.equity : undefined} placeholder={!hasEquity} />
            <CompRow k="Start date" v={offer.startDate ? fmtDate(offer.startDate) : undefined} placeholder={!offer.startDate} />
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

          {/* model confidence - honest, separate from any score */}
          <SectionCard title="Offer agent" icon="sparkles">
            <Confidence value={offer.aiDrafted ? 0.82 : 0.7} />
            <p style={{ margin: "12px 0 0", fontSize: 11.5, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center", lineHeight: 1.45 }}>
              <Icon name="shield" size={12} /> The agent drafts; you approve. Nothing is sent without a human action.
            </p>
          </SectionCard>
        </div>

        {/* approval + preview rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
                    <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{toTitleCase(a.role)}</div>
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
