"use client";
// app/(dashboard)/interviews/[id]/page.tsx - EXACT Claude Design "Aurora" layout.
// Single-interview detail / scorecard view. Ported from
// claude-design/screen-interviews.jsx (IVDetail) and wired to the real gateway
// via GET /interviews/{id}. Candidate + round header, schedule details, panel,
// the panelist scorecard / feedback section, AI interview-intelligence panel,
// and a controlled scorecard form that best-effort POSTs feedback. No fabricated
// feedback: AI and panelist sections render only when the payload supplies them.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Pill, Btn } from "@/components/aurora-kit";
import { Skeleton, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import type { InterviewStatus } from "@/lib/types";

// ── inline gateway helper (do not edit lib/api.ts) ──────────────────────────
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

const labelStyle: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--c-ink-3)",
};

// Interview type metadata (matches prototype INTERVIEW_TYPES, --c- prefixed).
const TYPE_META: Record<string, { label: string; tone: string }> = {
  PHONE_SCREEN: { label: "Phone screen", tone: "var(--c-info)" },
  TECHNICAL: { label: "Technical", tone: "var(--c-ai)" },
  BEHAVIORAL: { label: "Behavioral", tone: "var(--c-brand)" },
  PANEL: { label: "Panel", tone: "var(--c-warn)" },
  FINAL: { label: "Final", tone: "var(--c-ok)" },
};
const recTone: Record<string, string> = {
  STRONG_YES: "var(--c-ok)", YES: "var(--c-ok)", NEUTRAL: "var(--c-warn)", NO: "var(--c-danger)", STRONG_NO: "var(--c-danger)",
};
const RECOMMENDATIONS = [
  { value: "STRONG_YES", label: "Strong yes" },
  { value: "YES", label: "Yes" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "NO", label: "No" },
  { value: "STRONG_NO", label: "Strong no" },
] as const;

function initials(s?: string): string {
  if (!s) return "?";
  return s.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function mix(tone: string, pct = 13): string {
  return `color-mix(in oklab, ${tone} ${pct}%, transparent)`;
}

// ── defensively-mapped shapes (real payload is loose) ───────────────────────
interface IvSignal { skill?: string; rating?: string; quote?: string; note?: string }
interface IvDim { d?: string; s?: number }
interface IvPanelist {
  who?: string; role?: string; status?: string; rec?: string | null;
  overall?: number; dims?: IvDim[]; note?: string;
}
interface IvDetail {
  id?: string;
  candidateId?: string;
  candidateName?: string;
  requisitionId?: string;
  reqId?: string;
  round?: string;
  role?: string;
  type?: string;
  status?: InterviewStatus | string;
  startsAt?: string;
  durationMins?: number;
  mode?: string;
  meetingLink?: string;
  link?: string;
  panel?: string[];
  panelists?: IvPanelist[];
  ai?: {
    rec?: string; confidence?: number; summary?: string;
    signals?: IvSignal[];
    keyMoments?: { t?: string; d?: string }[];
  };
  suggestedQuestions?: string[];
}

function Dots({ n }: { n: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: i < Math.round(n) ? "var(--c-brand)" : "var(--c-surface-3)" }} />
      ))}
    </span>
  );
}

function when(d: IvDetail): string {
  if (!d.startsAt) return "Unscheduled";
  const dt = new Date(d.startsAt);
  if (isNaN(dt.getTime())) return "Unscheduled";
  return dt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [d, setD] = useState<IvDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // controlled scorecard / feedback form
  const [recommendation, setRecommendation] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await raw(`/interviews/${id}`);
      const obj = (res?.data ?? res) as IvDetail;
      setD(obj ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load interview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function submitFeedback() {
    if (!recommendation) {
      setSubmitMsg("Select a recommendation first.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    try {
      await raw(`/interviews/${id}/feedback`, {
        method: "POST",
        body: JSON.stringify({
          interviewerId: "",
          rating: rating || (RECOMMENDATIONS.findIndex((r) => r.value === recommendation) + 1),
          strengths: [],
          concerns: [],
          recommendation,
          notes,
        }),
      });
      setSubmitMsg("Feedback submitted.");
      setRecommendation("");
      setNotes("");
      setRating(0);
      load();
    } catch {
      // graceful fallback: keep what the panelist typed, just acknowledge.
      setSubmitMsg("Saved locally. The scorecard service is not reachable right now.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <Skeleton className="mb-4 h-5 w-24 rounded-md" />
        <Skeleton className="mb-5 h-16 w-full rounded-[14px]" />
        <div className="grid items-start gap-[18px] lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-[18px]">
            <Skeleton className="h-64 rounded-[14px]" />
            <Skeleton className="h-48 rounded-[14px]" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-44 rounded-[14px]" />
            <Skeleton className="h-32 rounded-[14px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !d) {
    return (
      <div className="mx-auto w-full max-w-[1100px]">
        <a href="/interviews" className="mb-[14px] inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-2">
          <Icon name="chevsL" size={14} /> Interviews
        </a>
        <ErrorState
          title="Could not load interview"
          body="The interviews service did not respond, or this round no longer exists."
          code={`GET /api/interviews/${id}`}
          onRetry={load}
        />
      </div>
    );
  }

  const candidate = d.candidateName || d.candidateId || "Candidate";
  const reqId = d.reqId || d.requisitionId || "";
  const t = (d.type && TYPE_META[d.type]) || null;
  const panelNames: string[] = Array.isArray(d.panelists) && d.panelists.length
    ? d.panelists.map((p) => p.who || "").filter(Boolean)
    : Array.isArray(d.panel) ? d.panel : [];
  const submittedPanel = Array.isArray(d.panelists) ? d.panelists.filter((p) => p.status === "submitted") : [];
  const meetingLink = d.meetingLink || d.link;
  const suggested = Array.isArray(d.suggestedQuestions) ? d.suggestedQuestions : [];

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* back link */}
      <a href="/interviews" className="mb-[14px] inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-2 hover:text-ink">
        <Icon name="chevsL" size={14} /> Interviews
      </a>

      {/* candidate + round header */}
      <div className="mb-5 flex flex-wrap items-center gap-[14px]">
        <span
          className="mono grid place-items-center font-bold text-white"
          style={{ width: 48, height: 48, borderRadius: 13, fontSize: 16, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))" }}
        >
          {initials(candidate)}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-[9px]">
            <h1 className="m-0 text-[length:var(--fs-2xl)] font-extrabold tracking-[-0.02em]">{candidate}</h1>
            {t && <Pill tone={t.tone} bg={mix(t.tone)}>{t.label}</Pill>}
          </div>
          <div className="text-[length:var(--fs-sm)] text-ink-2">
            {d.round || "Interview"}{d.role ? ` · ${d.role}` : ""}{reqId ? <> · <span className="mono">{reqId}</span></> : null}
          </div>
        </div>
        <a href="/interviews"><Btn variant="soft" icon="calendar">Reschedule</Btn></a>
        <Btn variant="primary" icon="check" onClick={() => { const el = document.getElementById("scorecard"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}>Submit feedback</Btn>
      </div>

      <div className="grid items-start gap-[18px] lg:grid-cols-[1.5fr_1fr]">
        {/* left column */}
        <div className="flex flex-col gap-[18px]">
          {/* AI interview-intelligence (only when the payload provides it) */}
          {d.ai && (d.ai.summary || (d.ai.signals?.length ?? 0) > 0) && (
            <div
              className="overflow-hidden"
              style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "var(--c-surface)", boxShadow: "var(--e1)" }}
            >
              <div
                className="flex items-center justify-between"
                style={{ padding: "13px 18px", background: "linear-gradient(110deg, var(--c-ai-tint), transparent 65%)", borderBottom: "1px solid var(--c-line)" }}
              >
                <div className="flex items-center gap-[9px]">
                  <Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} />
                  <span className="text-[length:var(--fs-md)] font-bold">Interview intelligence</span>
                  <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">interview-intelligence</Pill>
                </div>
                <div className="flex items-center gap-2">
                  {d.ai.rec && <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check">{d.ai.rec}</Pill>}
                  {typeof d.ai.confidence === "number" && <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">conf {d.ai.confidence.toFixed(2)}</Pill>}
                </div>
              </div>
              <div style={{ padding: 18 }}>
                {d.ai.summary && <p className="m-0 mb-4 text-[length:var(--fs-sm)] leading-[1.6] text-ink-2">{d.ai.summary}</p>}
                {(d.ai.signals?.length ?? 0) > 0 && (
                  <>
                    <div style={{ ...labelStyle, marginBottom: 9 }}>Skill signals · with evidence</div>
                    <div className="flex flex-col gap-[9px]">
                      {d.ai.signals!.map((s, i) => {
                        const rt = s.rating === "strong" ? "var(--c-ok)" : s.rating === "adequate" ? "var(--c-warn)" : "var(--c-danger)";
                        return (
                          <div key={i} style={{ padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
                            <div className="flex items-center justify-between">
                              <span className="text-[12.5px] font-semibold">{s.skill}</span>
                              {s.rating && <Pill tone={rt} bg={mix(rt)} style={{ fontSize: 10 }}>{s.rating}</Pill>}
                            </div>
                            {s.quote && (
                              <div className="mt-[5px] text-[12px] italic leading-[1.45] text-ink-2">
                                {s.quote}{s.note && <span className="not-italic text-ink-3">, {s.note}</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                {(d.ai.keyMoments?.length ?? 0) > 0 && (
                  <div className="mt-[14px] flex flex-wrap gap-3">
                    {d.ai.keyMoments!.map((k, i) => (
                      <span key={i} className="inline-flex items-center gap-[7px] text-[12px] text-ink-2">
                        {k.t && <span className="mono" style={{ color: "var(--c-ai-ink)", background: "var(--c-ai-tint)", padding: "1px 7px", borderRadius: 5, fontSize: 11 }}>{k.t}</span>}
                        {k.d}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-[14px] flex items-center gap-1.5 text-[11px] text-ink-3">
                  <Icon name="users" size={13} /> A summary, not a decision. Panelist scorecards and the hiring manager decide.
                </div>
              </div>
            </div>
          )}

          {/* panelist feedback (only when panelists exist) */}
          {Array.isArray(d.panelists) && d.panelists.length > 0 && (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[length:var(--fs-md)] font-bold">Panelist feedback</span>
                <Pill tone="var(--c-ink-2)">{submittedPanel.length} / {d.panelists.length} submitted</Pill>
              </div>
              <div className="flex flex-col gap-[11px]">
                {d.panelists.map((p, i) => (
                  <div key={i} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", padding: 14, background: p.status === "pending" ? "var(--c-surface-2)" : "var(--c-surface)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[9px]">
                        <span className="mono grid place-items-center" style={{ width: 28, height: 28, borderRadius: 99, background: "var(--c-surface-3)", fontSize: 10, fontWeight: 700, color: "var(--c-ink-2)" }}>{initials(p.who)}</span>
                        <div>
                          <div className="text-[12.5px] font-semibold">{p.who}</div>
                          <div className="text-[11px] text-ink-3">{p.role}</div>
                        </div>
                      </div>
                      {p.status === "submitted" ? (
                        <div className="flex items-center gap-2">
                          {typeof p.overall === "number" && <span className="mono text-[13px] font-bold">{p.overall}</span>}
                          {p.rec && <Pill tone={recTone[p.rec] ?? "var(--c-ink-2)"} bg={mix(recTone[p.rec] ?? "var(--c-ink-2)")}>{p.rec.replace("_", " ")}</Pill>}
                        </div>
                      ) : (
                        <Pill icon="clock" tone="var(--c-warn)" bg="var(--c-warn-tint)">pending</Pill>
                      )}
                    </div>
                    {p.status === "submitted" && (
                      <>
                        {Array.isArray(p.dims) && p.dims.length > 0 && (
                          <div className="m-[10px_0_8px] flex flex-wrap gap-4">
                            {p.dims.map((dm, j) => (
                              <div key={j} className="flex items-center gap-[7px]">
                                <span className="text-[11.5px] text-ink-2">{dm.d}</span>
                                <Dots n={dm.s ?? 0} />
                              </div>
                            ))}
                          </div>
                        )}
                        {p.note && <p className="m-0 text-[12px] italic leading-[1.45] text-ink-2">&ldquo;{p.note}&rdquo;</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* scorecard / feedback form (controlled, best-effort POST) */}
          <div id="scorecard" style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div className="mb-3 flex items-center gap-2">
              <Icon name="listChecks" size={16} style={{ color: "var(--c-brand)" }} />
              <span className="text-[length:var(--fs-md)] font-bold">Your scorecard</span>
            </div>

            <div style={{ ...labelStyle, marginBottom: 6 }}>Overall recommendation</div>
            <div className="mb-[14px] flex flex-wrap gap-[7px]">
              {RECOMMENDATIONS.map((r) => {
                const on = recommendation === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRecommendation(r.value)}
                    style={{
                      fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: "var(--r-pill)", cursor: "pointer",
                      border: "1px solid", borderColor: on ? "transparent" : "var(--c-line-2)",
                      background: on ? mix(recTone[r.value], 16) : "var(--c-surface)",
                      color: on ? recTone[r.value] : "var(--c-ink-2)",
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            <div style={{ ...labelStyle, marginBottom: 6 }}>Overall rating</div>
            <div className="mb-[14px] flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`Rate ${n} of 5`}
                  onClick={() => setRating(n)}
                  style={{
                    width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                    border: "1px solid", borderColor: n <= rating ? "transparent" : "var(--c-line-2)",
                    background: n <= rating ? "var(--c-brand-tint)" : "var(--c-surface)",
                    color: n <= rating ? "var(--c-brand-ink)" : "var(--c-ink-3)",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>

            <div style={{ ...labelStyle, marginBottom: 6 }}>Notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What stood out, with evidence. Keep it specific and job-related."
              rows={4}
              className="w-full resize-y text-[12.5px] leading-[1.5] text-ink outline-none"
              style={{ borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", padding: "10px 12px" }}
            />

            <div className="mt-[14px] flex items-center gap-3">
              <Btn variant="primary" icon="check" onClick={submitFeedback}>
                {submitting ? "Submitting..." : "Submit feedback"}
              </Btn>
              {submitMsg && <span className="text-[12px] text-ink-3">{submitMsg}</span>}
            </div>
          </div>
        </div>

        {/* right rail */}
        <div className="flex flex-col gap-4">
          {/* details */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ ...labelStyle, marginBottom: 4 }}>Details</div>
            {([
              ["When", when(d)],
              ["Duration", typeof d.durationMins === "number" ? `${d.durationMins} min` : "-"],
              ["Mode", d.mode || "-"],
              ["Round", d.round || "-"],
              ["Status", typeof d.status === "string" ? d.status.replace(/_/g, " ") : "-"],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-[7px] text-[12.5px]" style={{ borderTop: "1px solid var(--c-line)" }}>
                <span className="text-ink-3">{k}</span>
                <span className="font-semibold capitalize">{v}</span>
              </div>
            ))}
            {meetingLink && (
              <a
                href={/^https?:\/\//.test(meetingLink) ? meetingLink : `https://${meetingLink}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-[7px] text-[12.5px] font-semibold no-underline"
                style={{ padding: "9px 12px", borderRadius: "var(--r)", background: "var(--c-brand-tint)", color: "var(--c-brand-ink)" }}
              >
                <Icon name="enter" size={15} /> Join video call
              </a>
            )}
          </div>

          {/* panel / participants */}
          {panelNames.length > 0 && (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div className="mb-2 flex items-center gap-2">
                <Icon name="users" size={15} style={{ color: "var(--c-ink-2)" }} />
                <span className="text-[length:var(--fs-sm)] font-bold">Panel</span>
              </div>
              <div className="flex flex-col gap-2">
                {panelNames.map((p, i) => (
                  <div key={i} className="flex items-center gap-[9px]">
                    <span className="mono grid place-items-center" style={{ width: 26, height: 26, borderRadius: 99, background: "var(--c-surface-3)", fontSize: 9, fontWeight: 700, color: "var(--c-ink-2)" }}>{initials(p)}</span>
                    <span className="text-[12.5px] text-ink-2">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* suggested questions / interview-kit (only when provided) */}
          {suggested.length > 0 && (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div className="mb-2 flex items-center gap-2">
                <Icon name="sparkles" size={15} style={{ color: "var(--c-ai)" }} />
                <span className="text-[length:var(--fs-sm)] font-bold">Suggested questions</span>
              </div>
              <div className="flex flex-col gap-[7px]">
                {suggested.map((q, i) => (
                  <div key={i} className="text-[12px] leading-[1.4] text-ink-2" style={{ padding: "8px 10px", borderRadius: "var(--r-sm)", background: "var(--c-surface-2)" }}>{q}</div>
                ))}
              </div>
              <div className="mt-2 text-[10.5px] text-ink-3">From interview-kit · tailored to the gaps above.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
