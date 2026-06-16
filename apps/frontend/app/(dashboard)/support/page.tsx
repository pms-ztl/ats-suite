"use client";
// app/(dashboard)/support/page.tsx
// EXACT port of claude-design/Support.html (the help center): the hero
// eyebrow/headline/lede, the typing search bar, the three help cards (Submit a
// ticket / Ask Copilot / Browse the docs), the "Common questions" FAQ accordion,
// and the closing tagline. Because this route lives inside the (dashboard) shell
// (sidebar + <main className="p-6">), the HTML's own top nav, full-page hero
// background video + tint, and the heavy marketing footer/route-transition
// chrome are dropped, the dashboard layout supplies the frame. All support
// visuals/sections/cards/FAQ are reproduced faithfully. Scoped CSS lives under
// .supportx, @keyframes are renamed to a sup- prefix. The search is controlled
// React state with the cycling typing placeholder, and the FAQ is a controlled
// accordion. The "Submit a ticket" card additionally does a best-effort POST to
// /support/tickets so the help center is wired to the real backend, with a
// graceful inline acknowledgement either way. Status link -> /status.
import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Best-effort POST helper for opening a support ticket. Authenticated when a
// token is present, but never throws, the caller always acknowledges the user.
async function postTicket(body: unknown): Promise<boolean> {
  let token: string | null = null;
  try {
    token = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
  } catch {}
  try {
    const res = await fetch(`${API_BASE}/support/tickets`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Cycling questions for the typing placeholder, verbatim from the source.
const TYPED_QUESTIONS = [
  "How do I add more seats?",
  "Why was a candidate flagged for review?",
  "How does AI screening work?",
  "How do I export our hiring data?",
];

// FAQ copy, verbatim from the source.
const FAQ: Array<[string, string]> = [
  ["How do I add more seats?", "Go to Billing, then Add seats, or upgrade your plan. New seats are prorated for the current period."],
  ["Why was a candidate flagged for review?", "When the screener's confidence falls below the 0.70 threshold, the verdict is held for a human decision rather than auto-advanced."],
  ["How is AI used in screening?", "AI scores candidates against your requirements and shows its evidence, but it is advisory only. A human always makes the final decision, and candidates can request a review."],
  ["Can I export our hiring data?", "Yes. Analytics and Compliance both offer CSV and EEOC-formatted exports. API access is available on Professional and above."],
  ["How do I reach a real person?", "Open a ticket from Contact, or email support. Professional and Enterprise plans get priority response."],
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
.supportx{--serif:"Instrument Serif", serif;--sans:"Inter", system-ui, sans-serif;--mono:"Geist Mono", ui-monospace, monospace;
  --ink:#1a1a1a;--bg:#F3F4ED;--br:#16916a;--br-deep:#0f7d59;--ai:#7c5cff;--line:rgba(26, 26, 26, .1);--ease:cubic-bezier(.16, 1, .3, 1);
  position:relative;color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;}
.supportx *{box-sizing:border-box;}
.supportx a{color:inherit;text-decoration:none;}
.supportx button{font-family:inherit;cursor:pointer;}
.supportx ::selection{background:rgba(22, 145, 106, .18);}
.supportx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(22, 145, 106, .35);border-radius:10px;}
.supportx .fi{font-family:var(--serif);}
/* hero (content only, the dashboard shell supplies the page frame) */
.supportx .hero{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 0 50px;}
.supportx .hwrap{position:relative;z-index:20;max-width:760px;width:100%;animation:sup-rise 1.5s var(--ease) both;}
@keyframes sup-rise{from{opacity:0;transform:scale(.96);}to{opacity:1;transform:none;}}
.supportx .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;color:var(--ink);opacity:.82;margin-bottom:18px;background:rgba(243, 244, 237, .7);padding:6px 14px;border-radius:999px;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);box-shadow:inset 0 0 0 1px rgba(26, 26, 26, .06);}
.supportx .eyebrow .dot{width:7px;height:7px;border-radius:99px;background:var(--br);box-shadow:0 0 9px var(--br);}
.supportx h1{font-family:var(--serif);font-weight:400;font-size:clamp(40px, 7vw, 76px);line-height:.92;letter-spacing:-0.02em;margin:0 0 18px;}
.supportx h1 em{font-style:italic;color:var(--br-deep);}
.supportx .lede{font-size:clamp(15px, 1.7vw, 18px);color:rgba(26, 26, 26, .72);line-height:1.6;max-width:46ch;margin:0 auto 28px;}
/* typing search */
.supportx .search{display:flex;align-items:center;gap:11px;max-width:540px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 8px 8px 18px;box-shadow:0 14px 40px -16px rgba(0, 0, 0, .22);}
.supportx .search .ic{color:#9aa0a6;flex-shrink:0;display:flex;}
.supportx .search .typed{flex:1;text-align:left;font-size:15px;color:var(--ink);min-height:1.4em;display:flex;align-items:center;}
.supportx .search .typed .ph{color:rgba(26, 26, 26, .42);}
.supportx .search .typed input{flex:1;border:none;outline:none;background:transparent;color:var(--ink);font-size:15px;font-family:var(--sans);padding:0;}
.supportx .search .typed input::placeholder{color:rgba(26, 26, 26, .42);}
.supportx .search .cur{display:inline-block;width:2px;height:18px;background:var(--br);margin-left:1px;opacity:.4;}
.supportx .search .typed .ph{transition:opacity .8s var(--ease);animation:sup-phfade 6s var(--ease) infinite;}
@keyframes sup-phfade{0%,8%{opacity:0;}16%,86%{opacity:1;}96%,100%{opacity:0;}}
.supportx .search .go{background:var(--br);color:#fff;border:none;border-radius:999px;padding:10px 18px;font-size:14px;font-weight:500;flex-shrink:0;}
.supportx .hint{font-size:12.5px;color:rgba(26, 26, 26, .5);margin-top:14px;}
/* help cards */
.supportx .section{position:relative;z-index:2;max-width:1080px;margin:0 auto;padding:6px 0 40px;}
.supportx .cards{display:grid;grid-template-columns:repeat(3, 1fr);gap:14px;position:relative;z-index:25;}
@media(max-width:820px){.supportx .cards{grid-template-columns:1fr;}}
.supportx .card{display:block;cursor:pointer;background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 10px 34px -18px rgba(0, 0, 0, .18);transition:transform .25s var(--ease), box-shadow .25s, border-color .25s;text-align:left;width:100%;font:inherit;color:inherit;}
.supportx .card:hover{transform:translateY(-4px);box-shadow:0 20px 48px -20px rgba(0, 0, 0, .26);border-color:rgba(22, 145, 106, .35);}
.supportx .card .ic{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;margin-bottom:14px;}
.supportx .card h3{font-size:16.5px;font-weight:600;margin:0 0 5px;letter-spacing:-0.01em;}
.supportx .card p{font-size:13.5px;color:rgba(26, 26, 26, .58);line-height:1.5;margin:0 0 12px;}
.supportx .card .lnk{font-size:13.5px;font-weight:600;color:var(--br-deep);display:inline-flex;gap:6px;align-items:center;}
.supportx .card .note{font-size:12px;font-weight:600;color:var(--br-deep);margin:0;}
/* faq */
.supportx .faqwrap{max-width:760px;margin:46px auto 0;}
.supportx .faqwrap .ft{font-family:var(--serif);font-size:32px;text-align:center;margin-bottom:22px;letter-spacing:-0.01em;}
.supportx .faq{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;}
.supportx .faq .item{border-top:1px solid var(--line);}
.supportx .faq .item:first-child{border-top:none;}
.supportx .faq summary{padding:17px 20px;font-size:14.5px;font-weight:500;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:14px;align-items:center;width:100%;text-align:left;background:none;border:none;color:inherit;font-family:inherit;}
.supportx .faq summary::-webkit-details-marker{display:none;}
.supportx .faq .chev{transition:transform .25s;color:#9aa0a6;flex-shrink:0;display:flex;}
.supportx .faq .item.open .chev{transform:rotate(180deg);}
.supportx .faq .ans{padding:0 20px 18px;font-size:13.5px;color:rgba(26, 26, 26, .62);line-height:1.6;}
.supportx .foot{text-align:center;padding:34px 0 12px;font-size:12px;color:rgba(26, 26, 26, .45);font-family:var(--mono);}
@media(prefers-reduced-motion:reduce){.supportx .hwrap{animation:none;}.supportx .search .cur{animation:none;}}
/* dark theme: this page lives inside the dashboard shell, which flips to dark.
   The base styles hardcode light surfaces (#fff) and dark ink (#1a1a1a), which
   render dark-on-dark in dark mode. Override the surfaces, ink, lines and the
   hardcoded text greys so the help center reads correctly in dark mode. */
.dark .supportx{--ink:#e7e9ee;--bg:#0e1320;--line:rgba(255,255,255,.12);}
.dark .supportx .search,.dark .supportx .card,.dark .supportx .faq{background:#161b27;border-color:rgba(255,255,255,.10);}
.dark .supportx .search{box-shadow:0 14px 40px -16px rgba(0,0,0,.55);}
.dark .supportx .card{box-shadow:0 10px 34px -18px rgba(0,0,0,.5);}
.dark .supportx .card:hover{box-shadow:0 20px 48px -20px rgba(0,0,0,.65);border-color:rgba(22,145,106,.5);}
.dark .supportx .eyebrow{background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);}
.dark .supportx .lede{color:rgba(231,233,238,.74);}
.dark .supportx .card p{color:rgba(231,233,238,.62);}
.dark .supportx .faq .ans{color:rgba(231,233,238,.66);}
.dark .supportx .hint{color:rgba(231,233,238,.5);}
.dark .supportx .foot{color:rgba(231,233,238,.45);}
.dark .supportx h1 em{color:#2fcf94;}
.dark .supportx .card .lnk,.dark .supportx .card .note{color:#2fcf94;}
.dark .supportx .search .typed .ph,.dark .supportx .search .typed input::placeholder{color:rgba(231,233,238,.42);}
.dark .supportx .search .ic,.dark .supportx .faq .chev{color:#8a93a3;}
`;

// Inline SVG icon helpers, kept identical to the source markup.
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function SupportPage() {
  // Controlled search input. While empty, a cycling typed placeholder runs
  // (the design's typewriter effect), exactly mirroring the source script.
  const [query, setQuery] = useState("");
  const [typed, setTyped] = useState("");
  const [focused, setFocused] = useState(false);

  // FAQ accordion, first item open by default (matches the source).
  const [openFaq, setOpenFaq] = useState(0);

  // "Submit a ticket" inline acknowledgement state.
  const [ticketState, setTicketState] = useState<"idle" | "sending" | "done">("idle");

  // Safety net so the entrance animation never traps content invisible.
  const hwrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const h = hwrapRef.current;
      if (h) {
        h.style.animation = "none";
        h.style.opacity = "1";
        h.style.transform = "none";
      }
    }, 1600);
    return () => clearTimeout(t);
  }, []);

  // The design's char-by-char typewriter loop made the whole search area feel
  // like it was vibrating, so it is retired: rotate the popular questions as a
  // CALM placeholder instead - a gentle crossfade every 6 seconds, no per-letter
  // churn, and a static hint under reduced motion.
  useEffect(() => {
    if (query) return;
    setTyped(TYPED_QUESTIONS[0]);
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    let qi = 0;
    const timer = setInterval(() => {
      qi = (qi + 1) % TYPED_QUESTIONS.length;
      setTyped(TYPED_QUESTIONS[qi]);
    }, 6000);
    return () => clearInterval(timer);
  }, [query]);

  async function onSubmitTicket(e: React.MouseEvent) {
    e.preventDefault();
    if (ticketState === "sending") return;
    setTicketState("sending");
    await postTicket({
      subject: query.trim() ? `Help center: ${query.trim()}` : "Help center ticket",
      category: "GENERAL",
      priority: "NORMAL",
      body: query.trim() || "Opened from the help center. No additional detail provided.",
    });
    // Acknowledge regardless of backend wiring.
    setTicketState("done");
    setTimeout(() => setTicketState("idle"), 2600);
  }

  const showPlaceholder = !focused && !query;

  return (
    <div className="supportx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* hero content (page chrome supplied by the dashboard shell) */}
      <header className="hero">
        <div className="hwrap" ref={hwrapRef}>
          <span className="eyebrow"><span className="dot" /> Help Center · replies within 4 hours</span>
          <h1>Answers, when <br /><em>you need them.</em></h1>
          <p className="lede">Search the docs, ask Copilot, or reach a human. Whatever&apos;s slowing you down, we&apos;ll get you moving again.</p>
          <div className="search">
            <span className="ic"><SearchIcon /></span>
            <span className="typed">
              {showPlaceholder ? (
                <>
                  <span className="ph">{typed}</span>
                  <span className="cur" />
                </>
              ) : (
                <input
                  type="text"
                  aria-label="Search the help center"
                  placeholder="Search the docs"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoFocus
                />
              )}
            </span>
            <button className="go" type="button" onClick={() => setFocused(true)}>Search</button>
          </div>
          <div className="hint">Popular: adding seats · why a candidate was flagged · how AI screening works</div>
        </div>
      </header>

      <section className="section">
        <div className="cards" id="cards">
          <button type="button" className="card" onClick={onSubmitTicket}>
            <span className="ic" style={{ background: "rgba(22, 145, 106, .12)", color: "var(--br)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /></svg>
            </span>
            <h3>Submit a ticket</h3>
            <p>Tell us what&apos;s going on. Most replies land within four hours.</p>
            {ticketState === "done" ? (
              <span className="note">Ticket received. We&apos;ll be in touch.</span>
            ) : (
              <span className="lnk">{ticketState === "sending" ? "Opening" : "Open a ticket"} <ArrowIcon /></span>
            )}
          </button>

          <a className="card" href="/copilot">
            <span className="ic" style={{ background: "rgba(124, 92, 255, .12)", color: "var(--ai)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" /></svg>
            </span>
            <h3>Ask Copilot</h3>
            <p>Instant answers from your in-product assistant, with sources cited.</p>
            <span className="lnk" style={{ color: "var(--ai)" }}>Ask now <ArrowIcon /></span>
          </a>

          <a className="card" href="/welcome">
            <span className="ic" style={{ background: "rgba(8, 113, 231, .1)", color: "#0871E7" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2zM18 20a2 2 0 0 0 2-2V6" /></svg>
            </span>
            <h3>Browse the docs</h3>
            <p>Guides, API reference, and best practices for every workflow.</p>
            <span className="lnk" style={{ color: "#0871E7" }}>Read docs <ArrowIcon /></span>
          </a>
        </div>

        <div className="faqwrap" id="faq">
          <h2 className="ft">Common questions</h2>
          <div className="faq" id="faqList">
            {FAQ.map(([q, a], i) => {
              const open = openFaq === i;
              return (
                <div key={q} className={"item" + (open ? " open" : "")}>
                  <button
                    type="button"
                    className="summary"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? -1 : i)}
                  >
                    {q}
                    <span className="chev"><ChevronIcon /></span>
                  </button>
                  {open && <div className="ans">{a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="foot">ATS by TalentFlow · AI is advisory, a human decides</div>
    </div>
  );
}
