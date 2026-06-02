"use client";
// app/(dashboard)/offers/[id]/page.tsx - EXACT Claude Design "Aurora" single-offer
// detail (ported from claude-design/screen-offers.jsx Composer). The offer-agent
// drafts the letter and comp; a human approves the comp + the chain before send.
// OfferStatus drives the badge. Wired to the gateway via GET /offers/{id} and
// approveOffer(id). No fabricated comp numbers, placeholders when absent.
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill, Confidence } from "@/components/aurora-kit";
import { Skeleton, ErrorState } from "@/components/aurora";
import { Icon, Logo } from "@/components/aurora-icon";
import { approveOffer } from "@/lib/api";
import type { OfferStatus } from "@/lib/types";

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

// Status -> Pill chrome. Mirrors the prototype's OFFER_STATUS map, extended to
// the real OfferStatus union.
const STATUS_PILL: Record<OfferStatus, { label: string; icon: string; tone: string; bg: string }> = {
  DRAFT:            { label: "draft",             icon: "dot",          tone: "var(--c-ink-3)",  bg: "var(--c-surface-3)" },
  PENDING_APPROVAL: { label: "awaiting approval", icon: "clock",        tone: "var(--c-warn)",   bg: "var(--c-warn-tint)" },
  APPROVED:         { label: "approved",          icon: "check",        tone: "var(--c-ok)",     bg: "var(--c-ok-tint)" },
  SENT:             { label: "awaiting candidate", icon: "clock",       tone: "var(--c-info)",   bg: "var(--c-info-tint)" },
  ACCEPTED:         { label: "accepted",          icon: "check",        tone: "var(--c-ok)",     bg: "var(--c-ok-tint)" },
  DECLINED:         { label: "declined",          icon: "x",            tone: "var(--c-danger)", bg: "var(--c-danger-tint)" },
  EXPIRED:          { label: "expired",           icon: "clock",        tone: "var(--c-danger)", bg: "var(--c-danger-tint)" },
};

interface ApprovalStep { name?: string; who?: string; role?: string; state?: "done" | "current" | "wait" | "pending" }
interface OfferDetail {
  id?: string;
  candidateId?: string;
  candidateName?: string;
  role?: string;
  level?: string;
  requisitionId?: string;
  status?: OfferStatus | string;
  baseSalary?: number;
  signingBonus?: number;
  annualBonus?: number;
  equity?: string;
  totalComp?: number;
  startDate?: string;
  expiresAt?: string;
  expiresInDays?: number;
  justification?: string;
  letterBody?: string;
  aiDrafted?: boolean;
  aiConfidence?: number;
  bandPosition?: string;
  approvalChain?: ApprovalStep[];
  // tolerant nested shapes
  candidate?: { firstName?: string; lastName?: string };
  requisition?: { title?: string; level?: string };
}

const money = (n?: number | null) =>
  typeof n === "number" && isFinite(n) ? "$" + Math.round(n).toLocaleString() : "—missing—".replace("—missing—", "Not set");

const LABEL: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em",
  textTransform: "uppercase", color: "var(--c-ink-3)",
};

/* one comp line, base vs. detail rows */
function CompRow({ k, v, sub, big }: { k: string; v: string; sub?: string; big?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: big ? "12px 0" : "8px 0", borderTop: "1px solid var(--c-line)" }}>
      <span style={{ fontSize: big ? "var(--fs-sm)" : 12.5, fontWeight: big ? 700 : 500, color: big ? "var(--c-ink)" : "var(--c-ink-2)" }}>
        {k}{sub && <span style={{ fontWeight: 400, color: "var(--c-ink-3)" }}> · {sub}</span>}
      </span>
      <span className="mono tnum" style={{ fontSize: big ? 18 : 13, fontWeight: big ? 700 : 600, color: big ? "var(--c-brand)" : "var(--c-ink)" }}>{v}</span>
    </div>
  );
}

export default function OfferDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await raw(`/offers/${id}`);
      setOffer((res?.data ?? res) as OfferDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load offer");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (id) load(); }, [id, load]);

  // A human approves the comp + chain before send. Try the typed helper, fall
  // back to a best-effort raw() POST, surface inline feedback either way.
  const handleApprove = useCallback(async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await approveOffer(id);
      setFeedback({ kind: "ok", msg: "Approval recorded. The offer is cleared to send." });
      await load();
    } catch {
      try {
        await raw(`/offers/${id}/approve`, { method: "POST" });
        setFeedback({ kind: "ok", msg: "Approval recorded. The offer is cleared to send." });
        await load();
      } catch (err) {
        setFeedback({ kind: "err", msg: err instanceof Error ? err.message : "Could not record the approval." });
      }
    } finally {
      setBusy(false);
    }
  }, [id, load]);

  const handleSend = useCallback(async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await raw(`/offers/${id}/send`, { method: "POST" });
      setFeedback({ kind: "ok", msg: "Offer sent to the candidate." });
      await load();
    } catch (err) {
      setFeedback({ kind: "err", msg: err instanceof Error ? err.message : "Could not send the offer." });
    } finally {
      setBusy(false);
    }
  }, [id, load]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-[10px]" />
          <Skeleton className="h-7 w-72 rounded-[10px]" />
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-[18px]">
            <Skeleton className="h-16 rounded-[14px]" />
            <Skeleton className="h-64 rounded-[14px]" />
            <Skeleton className="h-40 rounded-[14px]" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-52 rounded-[14px]" />
            <Skeleton className="h-72 rounded-[14px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="grid place-items-center py-16">
          <ErrorState
            title="Could not load this offer"
            body="The offers service did not respond, or the offer does not exist."
            code={`GET /offers/${id}`}
            onRetry={load}
          />
          <a href="/offers" className="mt-4"><Btn variant="ghost" icon="chevsL">Back to offers</Btn></a>
        </div>
      </div>
    );
  }

  // ---- defensive field mapping (no fabricated comp numbers) ----
  const nestedName = offer.candidate ? `${offer.candidate.firstName ?? ""} ${offer.candidate.lastName ?? ""}`.trim() : "";
  const name = offer.candidateName || nestedName || offer.candidateId || "Candidate";
  const role = offer.role ?? offer.requisition?.title ?? "Role";
  const level = offer.level ?? offer.requisition?.level ?? "";
  const reqId = offer.requisitionId ?? "";
  const status = (typeof offer.status === "string" ? offer.status.toUpperCase() : "DRAFT") as OfferStatus;
  const sp = STATUS_PILL[status] ?? STATUS_PILL.DRAFT;

  const base = offer.baseSalary;
  const signing = offer.signingBonus;
  const annualBonus = offer.annualBonus; // fraction, e.g. 0.15
  const equity = offer.equity;
  const total =
    typeof offer.totalComp === "number"
      ? offer.totalComp
      : typeof base === "number"
        ? base + (signing ?? 0) + (typeof annualBonus === "number" ? base * annualBonus : 0)
        : undefined;

  const startDate = offer.startDate;
  const aiDrafted = offer.aiDrafted ?? true;
  const conf = typeof offer.aiConfidence === "number" ? offer.aiConfidence : undefined;
  const bandPosition = offer.bandPosition;
  const justification = offer.justification ?? "";
  const chain: ApprovalStep[] = Array.isArray(offer.approvalChain) ? offer.approvalChain : [];
  const expiresInDays = offer.expiresInDays;

  const fmtDate = (d?: string) => {
    if (!d) return "TBD";
    const dt = new Date(d);
    return isFinite(dt.getTime()) ? dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : d;
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* header: candidate + role + OfferStatus + actions */}
      <div className="mb-[18px] flex flex-wrap items-center gap-3">
        <a href="/offers" aria-label="Back to offers"
          style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center" }}>
          <Icon name="chevsL" size={16} />
        </a>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Offer · {name}</h1>
            <Pill icon={sp.icon} tone={sp.tone} bg={sp.bg}>{sp.label}</Pill>
          </div>
          <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>
            {role}{level ? ` · ${level}` : ""}{reqId ? <> · <span className="mono">{reqId}</span></> : null}
          </div>
        </div>
        {status === "PENDING_APPROVAL" && (
          <Btn variant="primary" icon="check" onClick={handleApprove} style={busy ? { opacity: 0.6, pointerEvents: "none" } : undefined}>
            {busy ? "Approving…" : "Approve comp & chain"}
          </Btn>
        )}
        {status === "APPROVED" && (
          <Btn variant="primary" icon="arrowUpRight" onClick={handleSend} style={busy ? { opacity: 0.6, pointerEvents: "none" } : undefined}>
            {busy ? "Sending…" : "Send to candidate"}
          </Btn>
        )}
        {status === "SENT" && <Pill icon="clock" tone="var(--c-info)" bg="var(--c-info-tint)">awaiting candidate</Pill>}
      </div>

      {/* inline feedback for the approve/send actions */}
      {feedback && (
        <div
          role="status"
          style={{
            display: "flex", gap: 9, alignItems: "center", marginBottom: 16, padding: "10px 14px",
            borderRadius: "var(--r-lg)", fontSize: 12.5, fontWeight: 600,
            color: feedback.kind === "ok" ? "var(--c-ok)" : "var(--c-danger)",
            background: feedback.kind === "ok" ? "var(--c-ok-tint)" : "var(--c-danger-tint)",
          }}
        >
          <Icon name={feedback.kind === "ok" ? "check" : "flag"} size={14} />
          {feedback.msg}
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        {/* ---- editor column ---- */}
        <div className="flex flex-col gap-[18px]">
          {/* AI draft banner */}
          {aiDrafted && (
            <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "12px 15px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)" }}>
              <Icon name="sparkles" size={18} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>
                  Drafted by the offer agent{bandPosition ? ` · positioned at the ${bandPosition}` : ""}
                </div>
                <div style={{ fontSize: 12, color: "var(--c-ink-2)" }}>Every field is editable. A human approves before anything is sent.</div>
              </div>
              {typeof conf === "number" && (
                <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">conf {conf.toFixed(2)}</Pill>
              )}
            </div>
          )}

          {/* compensation breakdown */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Compensation</h3>
              <Pill tone="var(--c-ink-3)" bg="var(--c-surface-2)" icon="shield">human-approved</Pill>
            </div>
            <CompRow k="Base salary" v={money(base)} big />
            <CompRow k="Signing bonus" v={money(signing)} />
            <CompRow
              k="Annual bonus target"
              v={typeof annualBonus === "number" ? `${Math.round(annualBonus * 100)}%` : "Not set"}
              sub={typeof annualBonus === "number" && typeof base === "number" ? money(base * annualBonus) : undefined}
            />
            <CompRow k="Equity" v={equity ?? "Not set"} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 2px", marginTop: 6, borderTop: "2px solid var(--c-line-strong)" }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Year-one total</span>
              <span className="mono tnum" style={{ fontSize: 22, fontWeight: 700, color: "var(--c-brand)" }}>{money(total)}</span>
            </div>

            {/* start date */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--c-line)" }}>
              <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)" }}>
                <Icon name="calendar" size={15} style={{ color: "var(--c-ink-3)" }} /> Start date
              </span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--c-ink)" }}>{fmtDate(startDate)}</span>
            </div>
          </div>

          {/* justification */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...LABEL, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <Icon name="sparkles" size={13} style={{ color: "var(--c-ai)" }} /> Justification · editable
            </div>
            <textarea
              defaultValue={justification || "No justification was drafted for this offer yet."}
              rows={4}
              style={{ width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", color: "var(--c-ink)", fontSize: 12.5, fontFamily: "var(--font-sans)", lineHeight: 1.55, resize: "vertical", outline: "none" }}
            />
          </div>
        </div>

        {/* ---- approval + letter preview rail ---- */}
        <div className="flex flex-col gap-4">
          {/* approval chain */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...LABEL, marginBottom: 12 }}>Approval chain</div>
            {chain.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>No approval chain has been configured for this offer.</div>
            )}
            {chain.map((a, i) => {
              const st = a.state ?? "wait";
              const done = st === "done";
              const current = st === "current";
              const tone = done ? "var(--c-ok)" : current ? "var(--c-warn)" : "var(--c-ink-3)";
              const last = i >= chain.length - 1;
              const who = a.who ?? "";
              const stepRole = a.role ?? a.name ?? `Approver ${i + 1}`;
              return (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", paddingBottom: last ? 0 : 14, position: "relative" }}>
                  {!last && <span style={{ position: "absolute", left: 13, top: 28, height: "calc(100% - 24px)", width: 2, background: "var(--c-line)" }} />}
                  <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, display: "grid", placeItems: "center", zIndex: 1, background: st === "wait" ? "var(--c-surface-2)" : `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone, border: "1px solid " + (st === "wait" ? "var(--c-line)" : "transparent") }}>
                    <Icon name={done ? "check" : current ? "clock" : "dot"} size={14} stroke={2.3} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{stepRole}</div>
                    {who && <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{who}</div>}
                  </div>
                  <Pill tone={tone} bg={st === "wait" ? "var(--c-surface-2)" : `color-mix(in oklab, ${tone} 13%, transparent)`} style={{ fontSize: 10 }}>
                    {current ? "needs review" : done ? "done" : "waiting"}
                  </Pill>
                </div>
              );
            })}
          </div>

          {/* model confidence, honest verify zone */}
          {typeof conf === "number" && (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <Confidence value={conf} />
            </div>
          )}

          {/* AI-drafted letter preview */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...LABEL, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Letter preview</span>
              <Pill mono tone="var(--c-ink-3)">PDF</Pill>
            </div>
            <div style={{ padding: "20px 22px", fontSize: 12.5, lineHeight: 1.65, color: "var(--c-ink-2)" }}>
              {offer.letterBody ? (
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{offer.letterBody}</p>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                    <Logo size={22} /><b style={{ color: "var(--c-ink)" }}>Aurora Talent</b>
                  </div>
                  <p style={{ margin: "0 0 12px" }}>Dear {name},</p>
                  <p style={{ margin: "0 0 12px" }}>
                    We are delighted to offer you the role of <b style={{ color: "var(--c-ink)" }}>{role}</b>
                    {level ? <> ({level})</> : null}, starting <b style={{ color: "var(--c-ink)" }}>{fmtDate(startDate)}</b>.
                  </p>
                  <div style={{ padding: "12px 14px", borderRadius: "var(--r)", background: "var(--c-surface-2)", margin: "0 0 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "var(--c-ink)" }}>
                      <span>Base salary</span><span className="mono">{money(base)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span>Signing bonus</span><span className="mono">{money(signing)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span>Equity</span><span className="mono">{equity ?? "Not set"}</span>
                    </div>
                  </div>
                  <p style={{ margin: "0 0 6px" }}>
                    {typeof expiresInDays === "number"
                      ? `This offer expires in ${expiresInDays} days. We cannot wait to build with you.`
                      : "We cannot wait to build with you."}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
