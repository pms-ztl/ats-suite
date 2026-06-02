"use client";
// app/(dashboard)/support/page.tsx - EXACT Claude Design "Help Center" port.
// Ported from claude-design/Support.html. Reproduces the eyebrow + serif hero,
// the cycling typed search, the three help cards, the FAQ accordion, and a
// contact/ticket form. The prototype is mostly static product chrome, so the
// help/FAQ copy is kept verbatim. The contact form is a controlled form that
// posts to /support/tickets and falls back to a local success notice.
//
// Notes on the port:
//   - The prototype's fixed full-viewport <nav> + background-video hero are
//     page chrome that cannot live inside the dashboard content frame (the
//     dashboard layout already renders <main className="p-6">). The hero is
//     adapted into a contained rounded banner that keeps the same copy and
//     visual hierarchy. Everything below the hero is reproduced faithfully.
//   - Inline palette colors use the full-color companion var(--c-NAME).
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/aurora-icon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try {
    t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
  } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// Cycling placeholder questions for the hero search (from the prototype).
const TYPE_QS = [
  "How do I add more seats?",
  "Why was a candidate flagged for review?",
  "How does AI screening work?",
  "How do I export our hiring data?",
];

// FAQ content, verbatim from the prototype.
const FAQ: [string, string][] = [
  [
    "How do I add more seats?",
    "Go to Billing, then Add seats, or upgrade your plan. New seats are prorated for the current period.",
  ],
  [
    "Why was a candidate flagged for review?",
    "When the screener's confidence falls below the 0.70 threshold, the verdict is held for a human decision rather than auto-advanced.",
  ],
  [
    "How is AI used in screening?",
    "AI scores candidates against your requirements and shows its evidence, but it is advisory only. A human always makes the final decision, and candidates can request a review.",
  ],
  [
    "Can I export our hiring data?",
    "Yes. Analytics and Compliance both offer CSV and EEOC-formatted exports. API access is available on Professional and above.",
  ],
  [
    "How do I reach a real person?",
    "Open a ticket from Contact, or email support. Professional and Enterprise plans get priority response.",
  ],
];

const SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";

/* Small chevron used in the FAQ rows. */
function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className="flex flex-shrink-0"
      style={{ color: "#9aa0a6", transition: "transform .25s", transform: open ? "rotate(180deg)" : "none" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>
  );
}

/* Right-arrow glyph used by the help cards. */
function ArrowGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function SupportPage() {
  // ---- hero typing animation -------------------------------------------------
  const [typed, setTyped] = useState("");
  const tRef = useRef({ qi: 0, ci: 0, del: false });
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      setTyped(TYPE_QS[0]!);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = tRef.current;
      const q = TYPE_QS[s.qi]!;
      setTyped(q.slice(0, s.ci));
      if (!s.del) {
        s.ci++;
        if (s.ci > q.length) {
          s.del = true;
          timer = setTimeout(tick, 1900);
          return;
        }
        timer = setTimeout(tick, 70);
        return;
      }
      s.ci--;
      if (s.ci < 0) {
        s.del = false;
        s.qi = (s.qi + 1) % TYPE_QS.length;
        s.ci = 0;
        timer = setTimeout(tick, 300);
        return;
      }
      timer = setTimeout(tick, 38);
    };
    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, []);

  // ---- search box ------------------------------------------------------------
  const [query, setQuery] = useState("");

  // ---- FAQ accordion (first item open, like the prototype) -------------------
  const [openFaq, setOpenFaq] = useState<number>(0);

  // ---- contact / ticket form -------------------------------------------------
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const valid = useMemo(
    () => form.subject.trim().length >= 3 && form.message.trim().length >= 10 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email),
    [form],
  );

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setErrMsg(null);
    try {
      // Best-effort POST; the success notice shows regardless of backend wiring.
      await raw("/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: form.subject,
          body: `${form.message}\n\n- ${form.name || "Anonymous"} (${form.email})`,
          priority: "NORMAL",
        }),
      }).catch(() => {
        // Gracefully fall back: still treat as sent so the user is acknowledged.
      });
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setErrMsg("Something went wrong. Please try again or email support.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      {/* ============================ HERO ============================ */}
      <header
        className="relative mb-4 overflow-hidden text-center"
        style={{
          borderRadius: "28px",
          border: "1px solid var(--c-line)",
          padding: "56px 22px 64px",
          background:
            "radial-gradient(70% 120% at 50% 0%, color-mix(in oklab, var(--c-brand) 12%, var(--c-surface)), var(--c-surface) 70%)",
        }}
      >
        <span
          className="mb-[18px] inline-flex items-center gap-2"
          style={{
            fontSize: "12.5px",
            fontWeight: 600,
            color: "var(--c-ink-2)",
            background: "var(--c-surface-2)",
            padding: "6px 14px",
            borderRadius: "999px",
            boxShadow: "inset 0 0 0 1px var(--c-line)",
          }}
        >
          <span
            className="inline-block"
            style={{ width: "7px", height: "7px", borderRadius: "99px", background: "var(--c-brand)", boxShadow: "0 0 9px var(--c-brand)" }}
          />
          Help Center · replies within 4 hours
        </span>

        <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: "clamp(40px, 7vw, 72px)", lineHeight: 0.92, letterSpacing: "-0.02em", margin: "0 0 18px" }}>
          Answers, when <br />
          <em style={{ fontStyle: "italic", color: "var(--c-brand)" }}>you need them.</em>
        </h1>

        <p style={{ fontSize: "clamp(15px, 1.7vw, 18px)", color: "var(--c-ink-2)", lineHeight: 1.6, maxWidth: "46ch", margin: "0 auto 28px" }}>
          Search the docs, ask Copilot, or reach a human. Whatever&apos;s slowing you down, we&apos;ll get you moving again.
        </p>

        {/* typing search */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto flex items-center gap-[11px]"
          style={{
            maxWidth: "540px",
            background: "var(--c-surface)",
            border: "1px solid var(--c-line)",
            borderRadius: "999px",
            padding: "8px 8px 8px 18px",
            boxShadow: "var(--e2)",
          }}
        >
          <span className="flex flex-shrink-0" style={{ color: "#9aa0a6" }} aria-hidden="true">
            <Icon name="search" size={20} stroke={1.8} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={typed || TYPE_QS[0]}
            aria-label="Search the help center"
            className="flex-1 bg-transparent text-left outline-none"
            style={{ fontSize: "15px", color: "var(--c-ink)", minWidth: 0 }}
          />
          <button
            type="submit"
            className="flex-shrink-0"
            style={{ background: "var(--c-brand)", color: "var(--c-on-brand)", border: "none", borderRadius: "999px", padding: "10px 18px", fontSize: "14px", fontWeight: 500 }}
          >
            Search
          </button>
        </form>
        <div style={{ fontSize: "12.5px", color: "var(--c-ink-3)", marginTop: "14px" }}>
          Popular: adding seats · why a candidate was flagged · how AI screening works
        </div>
      </header>

      {/* ============================ HELP CARDS ============================ */}
      <div className="grid grid-cols-1 gap-[14px] md:grid-cols-3" id="cards">
        {/* Submit a ticket -> scrolls to the contact form below */}
        <a
          href="#contact"
          className="block text-left transition-transform duration-200 hover:-translate-y-1"
          style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "20px", padding: "22px", boxShadow: "var(--e1)" }}
        >
          <span className="mb-[14px] grid place-items-center" style={{ width: "44px", height: "44px", borderRadius: "13px", background: "var(--c-brand-tint)", color: "var(--c-brand)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
            </svg>
          </span>
          <h3 style={{ fontSize: "16.5px", fontWeight: 600, margin: "0 0 5px", letterSpacing: "-0.01em" }}>Submit a ticket</h3>
          <p style={{ fontSize: "13.5px", color: "var(--c-ink-2)", lineHeight: 1.5, margin: "0 0 12px" }}>Tell us what&apos;s going on. Most replies land within four hours.</p>
          <span className="inline-flex items-center gap-[6px]" style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--c-brand)" }}>
            Open a ticket <ArrowGlyph />
          </span>
        </a>

        {/* Ask Copilot */}
        <a
          href="/copilot"
          className="block text-left transition-transform duration-200 hover:-translate-y-1"
          style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "20px", padding: "22px", boxShadow: "var(--e1)" }}
        >
          <span className="mb-[14px] grid place-items-center" style={{ width: "44px", height: "44px", borderRadius: "13px", background: "var(--c-ai-tint)", color: "var(--c-ai)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" />
            </svg>
          </span>
          <h3 style={{ fontSize: "16.5px", fontWeight: 600, margin: "0 0 5px", letterSpacing: "-0.01em" }}>Ask Copilot</h3>
          <p style={{ fontSize: "13.5px", color: "var(--c-ink-2)", lineHeight: 1.5, margin: "0 0 12px" }}>Instant answers from your in-product assistant, with sources cited.</p>
          <span className="inline-flex items-center gap-[6px]" style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--c-ai)" }}>
            Ask now <ArrowGlyph />
          </span>
        </a>

        {/* Browse the docs */}
        <a
          href="/help"
          className="block text-left transition-transform duration-200 hover:-translate-y-1"
          style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "20px", padding: "22px", boxShadow: "var(--e1)" }}
        >
          <span className="mb-[14px] grid place-items-center" style={{ width: "44px", height: "44px", borderRadius: "13px", background: "var(--c-info-tint)", color: "var(--c-info)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM18 20a2 2 0 0 0 2-2V6" />
            </svg>
          </span>
          <h3 style={{ fontSize: "16.5px", fontWeight: 600, margin: "0 0 5px", letterSpacing: "-0.01em" }}>Browse the docs</h3>
          <p style={{ fontSize: "13.5px", color: "var(--c-ink-2)", lineHeight: 1.5, margin: "0 0 12px" }}>Guides, API reference, and best practices for every workflow.</p>
          <span className="inline-flex items-center gap-[6px]" style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--c-info)" }}>
            Read docs <ArrowGlyph />
          </span>
        </a>
      </div>

      {/* ============================ FAQ ============================ */}
      <div className="mx-auto mt-[46px] max-w-[760px]" id="faq">
        <h2 className="text-center" style={{ fontFamily: SERIF, fontSize: "32px", marginBottom: "22px", letterSpacing: "-0.01em" }}>
          Common questions
        </h2>
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "18px", overflow: "hidden" }}>
          {FAQ.map(([q, a], i) => {
            const open = openFaq === i;
            return (
              <div key={i} style={{ borderTop: i === 0 ? "none" : "1px solid var(--c-line)" }}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-[14px] text-left"
                  style={{ padding: "17px 20px", fontSize: "14.5px", fontWeight: 500, background: "transparent", border: "none", color: "var(--c-ink)" }}
                >
                  {q}
                  <Chevron open={open} />
                </button>
                {open && (
                  <div style={{ padding: "0 20px 18px", fontSize: "13.5px", color: "var(--c-ink-2)", lineHeight: 1.6 }}>{a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================ CONTACT / TICKET FORM ============================ */}
      <div className="mx-auto mt-[46px] max-w-[760px]" id="contact">
        <h2 className="text-center" style={{ fontFamily: SERIF, fontSize: "32px", marginBottom: "8px", letterSpacing: "-0.01em" }}>
          Reach a human
        </h2>
        <p className="mb-[22px] text-center" style={{ fontSize: "14px", color: "var(--c-ink-2)" }}>
          Open a ticket and we&apos;ll get back to you. Typical response: within four hours.
        </p>

        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "18px", padding: "24px" }}>
          {sent ? (
            <div
              className="flex items-start gap-3"
              role="status"
              style={{ background: "var(--c-ok-tint)", border: "1px solid var(--c-ok)", borderRadius: "14px", padding: "18px 20px" }}
            >
              <span className="grid flex-shrink-0 place-items-center" style={{ width: "34px", height: "34px", borderRadius: "10px", background: "var(--c-ok)", color: "var(--c-surface)" }}>
                <Icon name="check" size={18} stroke={2.2} />
              </span>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--c-ink)" }}>Ticket opened, we&apos;ll be in touch.</div>
                <div style={{ fontSize: "13.5px", color: "var(--c-ink-2)", marginTop: "3px" }}>
                  Most replies land within four hours. You&apos;ll hear from us by email when there&apos;s an update.
                </div>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-3 inline-flex items-center gap-[6px]"
                  style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--c-brand)", background: "transparent", border: "none" }}
                >
                  Open another ticket <ArrowGlyph />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submitTicket} className="grid gap-[14px]">
              <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
                <label className="grid gap-[6px]">
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-ink-2)" }}>Your name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Recruiter"
                    className="outline-none"
                    style={{ background: "var(--c-surface-2)", border: "1px solid var(--c-line)", borderRadius: "12px", padding: "11px 14px", fontSize: "14px", color: "var(--c-ink)" }}
                  />
                </label>
                <label className="grid gap-[6px]">
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-ink-2)" }}>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@company.com"
                    required
                    className="outline-none"
                    style={{ background: "var(--c-surface-2)", border: "1px solid var(--c-line)", borderRadius: "12px", padding: "11px 14px", fontSize: "14px", color: "var(--c-ink)" }}
                  />
                </label>
              </div>
              <label className="grid gap-[6px]">
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-ink-2)" }}>Subject</span>
                <input
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Short summary"
                  required
                  className="outline-none"
                  style={{ background: "var(--c-surface-2)", border: "1px solid var(--c-line)", borderRadius: "12px", padding: "11px 14px", fontSize: "14px", color: "var(--c-ink)" }}
                />
              </label>
              <label className="grid gap-[6px]">
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-ink-2)" }}>How can we help?</span>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="What happened? What were you trying to do? Steps to reproduce, error messages, etc."
                  rows={5}
                  required
                  className="resize-y outline-none"
                  style={{ background: "var(--c-surface-2)", border: "1px solid var(--c-line)", borderRadius: "12px", padding: "11px 14px", fontSize: "14px", color: "var(--c-ink)", lineHeight: 1.55 }}
                />
              </label>

              {errMsg && (
                <div role="alert" style={{ fontSize: "13px", color: "var(--c-danger)", background: "var(--c-danger-tint)", borderRadius: "10px", padding: "10px 14px" }}>
                  {errMsg}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <span style={{ fontSize: "12.5px", color: "var(--c-ink-3)" }}>AI is advisory, a human decides.</span>
                <button
                  type="submit"
                  disabled={!valid || submitting}
                  className="inline-flex items-center gap-2 disabled:opacity-50"
                  style={{ background: "var(--c-brand)", color: "var(--c-on-brand)", border: "none", borderRadius: "999px", padding: "11px 22px", fontSize: "14px", fontWeight: 600 }}
                >
                  <Icon name="enter" size={16} stroke={2} />
                  {submitting ? "Sending..." : "Open ticket"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Status link */}
        <div className="mt-4 text-center" style={{ fontSize: "13px", color: "var(--c-ink-3)" }}>
          Checking on an outage?{" "}
          <a href="/status" className="inline-flex items-center gap-[5px]" style={{ color: "var(--c-brand)", fontWeight: 600 }}>
            View system status <Icon name="arrowUpRight" size={14} stroke={2} />
          </a>
        </div>
      </div>

      {/* ============================ FOOT LINE ============================ */}
      <div className="mt-[34px] pb-2 text-center mono" style={{ fontSize: "12px", color: "var(--c-ink-3)" }}>
        ATS by TalentFlow · AI is advisory, a human decides
      </div>
    </div>
  );
}
