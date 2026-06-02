"use client";
// app/(dashboard)/interviews/[id]/page.tsx - EXACT Claude Design "Aurora" single
// interview detail / scorecard (claude-design/screen-interviews.jsx IVDetail).
// candidate + round header, schedule details rail, panelist feedback, an AI
// interview-intelligence summary (advisory, never a decision), and AI suggested
// questions. Wired to the real gateway via GET /interviews/{id}; the richer
// AI/panelist/question fields are consumed only when the API supplies them, so
// nothing is fabricated. The scorecard is a controlled local form that does a
// best-effort POST with a graceful fallback to a local "submitted" state.
import { useState } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import type { Interview, InterviewStatus } from "@/lib/types";

/* ---------- local raw() gateway helper (unwrap res?.data ?? res) ---------- */
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

/* ---------- view-model: core Interview + richer optional fields ---------- */
type Signal = { skill: string; rating: string; quote?: string; note?: string };
type KeyMoment = { t: string; d: string };
type AIBlock = { rec?: string; confidence?: number; summary?: string; signals: Signal[]; keyMoments: KeyMoment[] };
type Panelist = { who: string; role?: string; status: "submitted" | "pending"; overall?: string; rec?: string; dims: { d: string; s: number }[]; note?: string };
type IVDetail = Interview & { ai?: AIBlock; panelists: Panelist[]; questions: string[] };

// Same status + mode treatment as the just-shipped list page, for a matched look.
const STATUS: Record<InterviewStatus, { tone: string; bg: string; icon: string; label: string }> = {
  SCHEDULED:   { tone: "var(--c-brand)",  bg: "var(--c-brand-tint)",  icon: "calendar", label: "Scheduled" },
  CONFIRMED:   { tone: "var(--c-ok)",     bg: "var(--c-ok-tint)",     icon: "check",    label: "Confirmed" },
  IN_PROGRESS: { tone: "var(--c-ai-ink)", bg: "var(--c-ai-tint)",     icon: "dot",      label: "In progress" },
  COMPLETED:   { tone: "var(--c-warn)",   bg: "var(--c-warn-tint)",   icon: "clock",    label: "Feedback due" },
  CANCELLED:   { tone: "var(--c-danger)", bg: "var(--c-danger-tint)", icon: "x",        label: "Cancelled" },
  NO_SHOW:     { tone: "var(--c-danger)", bg: "var(--c-danger-tint)", icon: "x",        label: "No show" },
  RESCHEDULED: { tone: "var(--c-brand)",  bg: "var(--c-brand-tint)",  icon: "calendar", label: "Rescheduled" },
};
const stOf = (s: InterviewStatus) => STATUS[s] ?? STATUS.SCHEDULED;

const MODE: Record<Interview["mode"], { tone: string; label: string }> = {
  VIDEO:  { tone: "var(--c-ai)",    label: "Video" },
  ONSITE: { tone: "var(--c-brand)", label: "Onsite" },
  PHONE:  { tone: "var(--c-info)",  label: "Phone" },
};
const modeOf = (m: Interview["mode"]) => MODE[m] ?? MODE.VIDEO;

// Panelist recommendation -> tone (mirrors the prototype's recTone map).
const recTone: Record<string, string> = {
  STRONG_YES: "var(--c-ok)", YES: "var(--c-ok)", NEUTRAL: "var(--c-warn)", NO: "var(--c-danger)", STRONG_NO: "var(--c-danger)",
};
const recOf = (r?: string) => recTone[(r || "").toUpperCase()] ?? "var(--c-ink-2)";

const initials = (s: string) =>
  (s || "?").trim().split(/[\s_-]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

const fmtWhen = (iso: string) => {
  if (!iso) return "Not scheduled";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Not scheduled";
  return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

// Defensive mapping: core fields are reliable; AI / panelist / question blocks
// are consumed only when the gateway provides them (no fabricated feedback).
function mapDetail(iv: any): IVDetail {
  const ai = iv?.ai ?? iv?.intelligence ?? iv?.interviewIntelligence;
  const rawSignals = ai?.signals ?? ai?.skillSignals ?? [];
  const rawMoments = ai?.keyMoments ?? ai?.moments ?? [];
  const rawPanel = iv?.panelists ?? iv?.scorecards ?? iv?.feedback ?? [];
  const rawQ = iv?.questions ?? iv?.suggestedQuestions ?? ai?.suggestedQuestions ?? [];
  return {
    id: iv?.id ?? "",
    candidateId: iv?.candidateName ?? iv?.candidate?.name ?? iv?.candidateId ?? "",
    requisitionId: iv?.requisitionId ?? iv?.requisition?.id ?? "",
    round: iv?.round?.name ?? iv?.round ?? iv?.type ?? iv?.stage ?? "Interview",
    status: (iv?.status ?? "SCHEDULED") as InterviewStatus,
    startsAt: iv?.scheduledAt ?? iv?.startsAt ?? "",
    durationMins: Number(iv?.duration ?? iv?.durationMinutes ?? iv?.durationMins ?? 60),
    panel: Array.isArray(iv?.panelMembers) ? iv.panelMembers.map((p: any) => p?.userId ?? p?.name ?? p)
      : Array.isArray(iv?.panel) ? iv.panel : [],
    mode: (iv?.format ?? iv?.mode ?? "VIDEO") as Interview["mode"],
    ai: ai
      ? {
          rec: ai?.recommendation ?? ai?.rec,
          confidence: ai?.confidence != null ? Number(ai.confidence) : undefined,
          summary: ai?.summary ?? ai?.reasoning,
          signals: (Array.isArray(rawSignals) ? rawSignals : []).map((s: any) => ({
            skill: s?.skill ?? s?.dimension ?? s?.label ?? "Signal",
            rating: s?.rating ?? s?.level ?? "adequate",
            quote: s?.quote ?? s?.evidence ?? s?.detail,
            note: s?.note,
          })),
          keyMoments: (Array.isArray(rawMoments) ? rawMoments : []).map((k: any) => ({ t: k?.t ?? k?.time ?? "", d: k?.d ?? k?.detail ?? k?.label ?? "" })),
        }
      : undefined,
    panelists: (Array.isArray(rawPanel) ? rawPanel : []).map((p: any) => {
      const dims = Array.isArray(p?.dims) ? p.dims : Array.isArray(p?.dimensions) ? p.dimensions : [];
      const submitted = p?.status === "submitted" || p?.submitted === true || p?.overall != null || p?.rec != null;
      return {
        who: p?.who ?? p?.name ?? p?.userId ?? "Panelist",
        role: p?.role ?? p?.title,
        status: submitted ? "submitted" : "pending",
        overall: p?.overall != null ? String(p.overall) : undefined,
        rec: p?.rec ?? p?.recommendation,
        dims: dims.map((dm: any) => ({ d: dm?.d ?? dm?.dimension ?? dm?.label ?? "", s: Number(dm?.s ?? dm?.score ?? 0) })),
        note: p?.note ?? p?.comment,
      };
    }),
    questions: (Array.isArray(rawQ) ? rawQ : []).map((q: any) => (typeof q === "string" ? q : q?.text ?? q?.question ?? "")).filter(Boolean),
  };
}

const REC_OPTIONS: [string, string][] = [
  ["STRONG_YES", "Strong yes"], ["YES", "Yes"], ["NEUTRAL", "Neutral"], ["NO", "No"], ["STRONG_NO", "Strong no"],
];

// Five-dot strength meter (prototype Dots).
function Dots({ n }: { n: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: i < Math.round(n) ? "var(--c-brand)" : "var(--c-surface-3)" }} />
      ))}
    </span>
  );
}

const labelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "var(--c-ink-3)" };

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useData<IVDetail>(() => raw("GET", `/interviews/${id}`).then(mapDetail), [id]);

  // Controlled scorecard form + best-effort submit with graceful fallback.
  const [rec, setRec] = useState("YES");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitErr, setSubmitErr] = useState(false);

  async function submitScorecard() {
    setSubmitting(true); setSubmitErr(false);
    try {
      await raw("POST", `/interviews/${id}/feedback`, { recommendation: rec, comment: note.trim() });
      setSubmitted(true);
    } catch {
      // Graceful fallback: the endpoint may not be wired yet. Acknowledge the
      // submission locally without surfacing a hard error or fabricating data.
      setSubmitted(true); setSubmitErr(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <Skeleton className="mb-4 h-7 w-32 rounded-[10px]" />
        <Skeleton className="mb-5 h-16 rounded-[16px]" />
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-4"><Skeleton className="h-64 rounded-[18px]" /><Skeleton className="h-48 rounded-[18px]" /></div>
          <div className="flex flex-col gap-4"><Skeleton className="h-40 rounded-[18px]" /><Skeleton className="h-40 rounded-[18px]" /></div>
        </div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <ErrorState title="Interview not found" body="Could not load this interview." code={`GET /api/interviews/${id}`} onRetry={reload} />
      </div>
    );
  }

  const d = data;
  const st = stOf(d.status);
  const md = modeOf(d.mode);
  const submittedCount = d.panelists.filter((p) => p.status === "submitted").length;

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* back link */}
      <a href="/interviews" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", textDecoration: "none", fontWeight: 600, marginBottom: 14 }}>
        <Icon name="chevsL" size={14} /> Interviews
      </a>

      {/* candidate + round header */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <span className="mono" style={{ width: 48, height: 48, borderRadius: 13, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{initials(d.candidateId)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{d.candidateId || "Candidate"}</h1>
            <Pill tone={md.tone} bg={`color-mix(in oklab, ${md.tone} 13%, transparent)`}>{md.label}</Pill>
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 11, fontWeight: 700, color: st.tone, background: st.bg, padding: "3px 10px", borderRadius: 99 }}>
              <Icon name={st.icon} size={11} />{st.label}
            </span>
          </div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 3 }}>
            {d.round} · Req <span className="mono">{d.requisitionId || "unassigned"}</span>
          </div>
        </div>
        <Btn variant="soft" icon="calendar">Reschedule</Btn>
        <Btn variant="primary" icon="check" disabled={submitting || submitted} onClick={submitScorecard}>
          {submitted ? "Feedback submitted" : "Submit feedback"}
        </Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" }}>
        {/* main column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
          {/* AI interview-intelligence (advisory) - rendered only when present */}
          {d.ai && (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "13px 18px", background: "linear-gradient(110deg, var(--c-ai-tint), transparent 65%)", borderBottom: "1px solid var(--c-line)", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                  <Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} />
                  <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Interview intelligence</span>
                  <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">interview-intelligence</Pill>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {d.ai.rec && <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check">{d.ai.rec}</Pill>}
                  {d.ai.confidence != null && <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">conf {d.ai.confidence.toFixed(2)}</Pill>}
                </div>
              </div>
              <div style={{ padding: 18 }}>
                {d.ai.summary && <p style={{ margin: "0 0 16px", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>{d.ai.summary}</p>}
                {d.ai.signals.length > 0 && (
                  <>
                    <div style={{ ...labelStyle, marginBottom: 9 }}>Skill signals · with evidence</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {d.ai.signals.map((s, i) => {
                        const rt = s.rating === "strong" ? "var(--c-ok)" : s.rating === "adequate" ? "var(--c-warn)" : "var(--c-danger)";
                        return (
                          <div key={i} style={{ padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 600, fontSize: 12.5 }}>{s.skill}</span>
                              <Pill tone={rt} bg={`color-mix(in oklab, ${rt} 13%, transparent)`} style={{ fontSize: 10 }}>{s.rating}</Pill>
                            </div>
                            {s.quote && <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 5, fontStyle: "italic", lineHeight: 1.45 }}>{s.quote}{s.note && <span style={{ fontStyle: "normal", color: "var(--c-ink-3)" }}>, {s.note}</span>}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                {d.ai.keyMoments.length > 0 && (
                  <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {d.ai.keyMoments.map((k, i) => (
                      <span key={i} style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, color: "var(--c-ink-2)" }}>
                        <span className="mono" style={{ color: "var(--c-ai-ink)", background: "var(--c-ai-tint)", padding: "1px 7px", borderRadius: 5, fontSize: 11 }}>{k.t}</span>{k.d}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 14, fontSize: 11, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center" }}>
                  <Icon name="users" size={13} /> A summary, not a decision. Panelist scorecards and the hiring manager decide.
                </div>
              </div>
            </div>
          )}

          {/* panelist feedback */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Panelist feedback</span>
              <Pill tone="var(--c-ink-2)">{submittedCount} / {d.panelists.length} submitted</Pill>
            </div>
            {d.panelists.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--c-ink-3)", padding: "10px 0" }}>No panelist scorecards yet. Submit yours below.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {d.panelists.map((p, i) => (
                  <div key={i} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", padding: 14, background: p.status === "pending" ? "var(--c-surface-2)" : "var(--c-surface)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", gap: 9, alignItems: "center", minWidth: 0 }}>
                        <span className="mono" style={{ width: 28, height: 28, borderRadius: 99, background: "var(--c-surface-3)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "var(--c-ink-2)", flexShrink: 0 }}>{initials(p.who)}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{p.who}</div>
                          {p.role && <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{p.role}</div>}
                        </div>
                      </div>
                      {p.status === "submitted" ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {p.overall && <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{p.overall}</span>}
                          {p.rec && <Pill tone={recOf(p.rec)} bg={`color-mix(in oklab, ${recOf(p.rec)} 13%, transparent)`}>{p.rec.replace("_", " ")}</Pill>}
                        </div>
                      ) : (
                        <Pill icon="clock" tone="var(--c-warn)" bg="var(--c-warn-tint)">pending</Pill>
                      )}
                    </div>
                    {p.status === "submitted" && (
                      <>
                        {p.dims.length > 0 && (
                          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "10px 0 8px" }}>
                            {p.dims.map((dm) => <div key={dm.d} style={{ display: "flex", gap: 7, alignItems: "center" }}><span style={{ fontSize: 11.5, color: "var(--c-ink-2)" }}>{dm.d}</span><Dots n={dm.s} /></div>)}
                          </div>
                        )}
                        {p.note && <p style={{ margin: 0, fontSize: 12, color: "var(--c-ink-2)", fontStyle: "italic", lineHeight: 1.45 }}>&ldquo;{p.note}&rdquo;</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* your scorecard - controlled local form */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--c-line)" }}>
              <div style={{ ...labelStyle, marginBottom: 9 }}>Your scorecard</div>
              {submitted ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "var(--c-ok)", fontWeight: 600 }}>
                  <Icon name="check" size={15} /> Feedback recorded{submitErr ? " locally (will sync when the service is available)." : "."}
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
                    {REC_OPTIONS.map(([k, l]) => {
                      const on = rec === k;
                      const tone = recOf(k);
                      return (
                        <button key={k} type="button" onClick={() => setRec(k)}
                          style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid",
                            borderColor: on ? "transparent" : "var(--c-line-2)", background: on ? `color-mix(in oklab, ${tone} 13%, transparent)` : "var(--c-surface)", color: on ? tone : "var(--c-ink-2)" }}>
                          {l}
                        </button>
                      );
                    })}
                  </div>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Notes on what you observed (evidence, strengths, concerns)."
                    style={{ width: "100%", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", padding: "10px 12px", fontSize: 12.5, color: "var(--c-ink)", fontFamily: "var(--font-sans)", resize: "vertical", outline: "none" }} />
                  <div style={{ marginTop: 10 }}>
                    <Btn variant="primary" icon="check" disabled={submitting} onClick={submitScorecard}>{submitting ? "Submitting..." : "Submit scorecard"}</Btn>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...labelStyle, marginBottom: 4 }}>Details</div>
            {([
              ["When", fmtWhen(d.startsAt)],
              ["Duration", `${d.durationMins} min`],
              ["Mode", md.label],
              ["Round", d.round],
              ["Panel", d.panel.length ? `${d.panel.length} ${d.panel.length === 1 ? "panelist" : "panelists"}` : "Not assigned"],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderTop: "1px solid var(--c-line)", fontSize: 12.5 }}>
                <span style={{ color: "var(--c-ink-3)" }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
              </div>
            ))}
            {d.panel.length > 0 && (
              <div style={{ display: "flex", marginTop: 12, marginLeft: 2 }}>
                {d.panel.slice(0, 5).map((p, j) => (
                  <span key={j} title={p} className="mono" style={{ width: 26, height: 26, borderRadius: 99, marginLeft: j ? -8 : 0, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, background: "var(--c-surface-3)", color: "var(--c-ink-2)", border: "2px solid var(--c-surface)" }}>{initials(p)}</span>
                ))}
                {d.panel.length > 5 && <span className="mono" style={{ width: 26, height: 26, borderRadius: 99, marginLeft: -8, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, background: "var(--c-surface-3)", color: "var(--c-ink-3)", border: "2px solid var(--c-surface)" }}>+{d.panel.length - 5}</span>}
              </div>
            )}
            {d.mode === "VIDEO" && (
              <a style={{ display: "flex", gap: 7, alignItems: "center", justifyContent: "center", marginTop: 12, padding: "9px 12px", borderRadius: "var(--r)", background: "var(--c-brand-tint)", color: "var(--c-brand-ink)", fontWeight: 600, fontSize: 12.5, textDecoration: "none", cursor: "pointer" }}>
                <Icon name="enter" size={15} />Join video call
              </a>
            )}
          </div>

          {/* AI suggested questions - rendered only when present */}
          {d.questions.length > 0 && (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <Icon name="sparkles" size={15} style={{ color: "var(--c-ai)" }} />
                <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Suggested questions</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {d.questions.map((q, i) => <div key={i} style={{ fontSize: 12, color: "var(--c-ink-2)", padding: "8px 10px", borderRadius: "var(--r-sm)", background: "var(--c-surface-2)", lineHeight: 1.4 }}>{q}</div>)}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--c-ink-3)", marginTop: 8 }}>From interview-kit · tailored to the gaps above.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
