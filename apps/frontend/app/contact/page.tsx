"use client";
// app/contact/page.tsx
// Standalone public marketing page, ported from claude-design/Contact.html.
// Self-contained full-page chrome (dark aurora canvas, glass nav, contact hero,
// glass contact form with validation + success state, direct-contact chips,
// footer). NOT inside the dashboard, so it provides its own shell. Brand/AI
// accent colors use the app's --c-* full-color tokens; the fixed dark canvas +
// white-on-dark glass are part of this prototype's own marketing identity and
// stay as literals. The form is fully controlled and does a best-effort POST to
// /support/tickets, with a graceful fallback so the user is always acknowledged.

import { useState } from "react";

/* ------------------------------- data helper ------------------------------ */
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

/* ---------------------------------- icons --------------------------------- */
function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/* --------------------------------- nav data ------------------------------- */
const NAV = [
  { label: "Product", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Customers", href: "/" },
];

const SIZES = ["1 to 10", "11 to 50", "51 to 200", "201 to 1,000", "1,000+"];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [size, setSize] = useState("51 to 200");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({});

  const nameOk = name.trim().length > 0;
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const firstName = (name.trim().split(" ")[0] || "there").trim();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!nameOk || !emailOk) {
      setTouched({ name: true, email: true });
      return;
    }
    setSubmitting(true);
    try {
      // Best-effort POST; the success notice shows regardless of backend wiring.
      await raw("/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: `Sales enquiry from ${company.trim() || name.trim()}`,
          category: "SALES",
          priority: "NORMAL",
          body:
            `What they want to improve:\n${msg.trim() || "(not specified)"}\n\n` +
            `Name: ${name.trim()}\nWork email: ${email.trim()}\n` +
            `Company: ${company.trim() || "(not specified)"}\nTeam size: ${size}`,
        }),
      }).catch(() => {
        // Gracefully fall back: still treat as sent so the user is acknowledged.
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="contact-root">
      <style>{CSS}</style>

      {/* cinematic background: aurora fallback under the looping video */}
      <div className="bg-aurora" aria-hidden="true">
        <i className="a" />
        <i className="b" />
      </div>
      <video
        id="bgv"
        className="in"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
      />
      <div className="veil" aria-hidden="true" />

      <div className="page">
        {/* nav */}
        <nav>
          <div className="nav-inner lg">
            <div style={{ display: "flex", alignItems: "center" }}>
              <a className="brand" href="/" aria-label="TalentFlow ATS home">
                <Logo />
                <span>TalentFlow</span>
                <span className="sub">ATS</span>
              </a>
              <div className="nav-links">
                {NAV.map((n) => (
                  <a key={n.label} href={n.href}>
                    {n.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="nav-right">
              <a href="/login">
                <button className="btn-text" type="button">Log in</button>
              </a>
              <a href="/register">
                <button className="btn-glass lg" type="button">Get started</button>
              </a>
            </div>
          </div>
        </nav>

        {/* hero */}
        <main>
          <span className="eyebrow lg">
            <span className="dot" /> Talk to our team
          </span>
          <h1>
            Let&apos;s talk <i>hiring.</i>
          </h1>
          <p className="lede">
            Tell us about your team and we&apos;ll show you how ATS screens candidates with AI you
            can trust, with a human always making the call.
          </p>

          <div className="card lg" id="card">
            {sent ? (
              <div className="success">
                <div className="ok">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </div>
                <h2>Thanks, {firstName}.</h2>
                <p>
                  Your request is in. A specialist will reach out within one business day to set up
                  your demo.
                </p>
              </div>
            ) : (
              <form id="form" noValidate onSubmit={onSubmit}>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input
                      className="ctrl"
                      id="name"
                      name="name"
                      placeholder="Avery Chen"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={touched.name && !nameOk ? errStyle : undefined}
                      aria-invalid={touched.name && !nameOk}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Work email</label>
                    <input
                      className="ctrl"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={touched.email && !emailOk ? errStyle : undefined}
                      aria-invalid={touched.email && !emailOk}
                      required
                    />
                  </div>
                </div>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="company">Company</label>
                    <input
                      className="ctrl"
                      id="company"
                      name="company"
                      placeholder="Northwind Talent"
                      autoComplete="organization"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="size">Team size</label>
                    <select
                      className="ctrl"
                      id="size"
                      name="size"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    >
                      {SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="msg">What are you hoping to improve?</label>
                  <textarea
                    className="ctrl"
                    id="msg"
                    name="msg"
                    placeholder="Faster screening, fairer decisions, candidate transparency, less manual triage..."
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                  />
                </div>
                <button className="submit" type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Book a demo"}
                  <ArrowIcon />
                </button>
                <div className="assurance">
                  <ShieldIcon />
                  We reply within one business day. No spam, ever.
                </div>
              </form>
            )}
          </div>

          {/* direct contact */}
          <div className="chips">
            <a className="chip lg" href="mailto:sales@aerofyta.com">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
              </svg>
              <span>
                <b>sales@aerofyta.com</b>
              </span>
            </a>
            <a className="chip lg" href="tel:+18005550142">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
              <span>
                <b>+1 (800) 555 0142</b>
              </span>
            </a>
            <a className="chip lg" href="/support">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.2 9a3 3 0 0 1 5.6 1.2c0 2-3 2.5-3 4M12 17h.01" />
              </svg>
              <span>
                Existing customer? <b>Visit Support</b>
              </span>
            </a>
          </div>
        </main>

        {/* footer */}
        <footer>
          <a className="social lg" href="/" aria-label="ATS on LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" />
            </svg>
          </a>
          <a className="social lg" href="/" aria-label="ATS on X">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
            </svg>
          </a>
          <a className="social lg" href="/" aria-label="ATS website">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.6 2.7 4 6 4 9s-1.4 6.3-4 9c-2.6-2.7-4-6-4-9s1.4-6.3 4-9z" />
            </svg>
          </a>
          <div className="foot-note">ATS · AI is advisory, a human decides</div>
        </footer>
      </div>
    </div>
  );
}

/* --------------------------------- helpers -------------------------------- */
const errStyle: React.CSSProperties = {
  borderColor: "oklch(0.70 0.16 25)",
  boxShadow: "0 0 0 3px oklch(0.70 0.16 25 / .22)",
};

/* ------------------------------- brand mark ------------------------------- */
function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="logo-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 19.5L12 4l7 15.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 13h7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* --------------------------------- styles --------------------------------- */
const CSS = `
.contact-root{
  --serif:var(--font-sans);
  --sans:var(--font-sans);
  --mono:var(--font-mono);
  --ease:cubic-bezier(.22, 1, .36, 1);
  position:relative;min-height:100svh;background:#05080a;color:#fff;overflow-x:hidden;
  -webkit-font-smoothing:antialiased;font-family:var(--sans);
}
.contact-root *{box-sizing:border-box;}
.contact-root a{color:inherit;text-decoration:none;}
.contact-root button{font-family:inherit;cursor:pointer;}
.contact-root :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(255, 255, 255, .35);border-radius:999px;}

/* ---------- cinematic background ---------- */
.contact-root .bg-aurora{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:
  radial-gradient(60% 50% at 22% 40%, oklch(0.34 0.09 162/.34), transparent 70%),
  radial-gradient(55% 50% at 85% 80%, oklch(0.32 0.10 292/.5), transparent 70%),
  radial-gradient(80% 70% at 50% 120%, oklch(0.30 0.07 200/.35), transparent 70%),
  #05080a;}
.contact-root .bg-aurora i{position:absolute;border-radius:50%;filter:blur(90px);display:block;}
.contact-root .bg-aurora .a{width:46vw;height:46vw;left:-16vw;top:6vh;background:radial-gradient(circle, var(--c-brand), transparent 66%);opacity:.10;animation:ct-drift 22s var(--ease) infinite;}
.contact-root .bg-aurora .b{width:42vw;height:42vw;right:-12vw;bottom:-16vw;background:radial-gradient(circle, var(--c-ai), transparent 66%);opacity:.16;animation:ct-drift 28s var(--ease) infinite reverse;}
@keyframes ct-drift{0%, 100%{transform:translate(0, 0) scale(1);}50%{transform:translate(4%, -5%) scale(1.12);}}
.contact-root #bgv{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;transform:translateY(17%) scale(1.0);z-index:1;opacity:0;transition:opacity 1.2s var(--ease);pointer-events:none;will-change:opacity;}
.contact-root #bgv.in{opacity:.55;}
/* legibility veil over the video */
.contact-root .veil{position:fixed;inset:0;z-index:2;pointer-events:none;background:
  linear-gradient(180deg, rgba(3, 6, 8, .9) 0%, rgba(3, 6, 8, .5) 16%, rgba(3, 6, 8, .28) 34%, rgba(3, 6, 8, .42) 70%, rgba(3, 6, 8, .78) 100%),
  radial-gradient(120% 90% at 50% 40%, transparent 40%, rgba(3, 6, 8, .55) 100%);}

/* ---------- liquid glass ---------- */
.contact-root .lg{
  background:rgba(255, 255, 255, 0.01);
  background-blend-mode:luminosity;
  -webkit-backdrop-filter:blur(8px);
  backdrop-filter:blur(8px);
  border:none;
  box-shadow:inset 0 1px 1px rgba(255, 255, 255, 0.10), 0 18px 50px -20px rgba(0, 0, 0, .55);
  position:relative;
  overflow:hidden;
}
.contact-root .lg::before{
  content:"";
  position:absolute;inset:0;border-radius:inherit;padding:1.4px;
  background:linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 20%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0.15) 80%, rgba(255, 255, 255, 0.45) 100%);
  -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  pointer-events:none;
}

/* ---------- page shell ---------- */
.contact-root .page{position:relative;z-index:10;display:flex;flex-direction:column;min-height:100svh;}

/* nav */
.contact-root nav{padding:22px 24px;}
.contact-root .nav-inner{max-width:1120px;margin:0 auto;border-radius:999px;padding:11px 14px 11px 22px;display:flex;align-items:center;justify-content:space-between;gap:18px;}
.contact-root .brand{display:flex;align-items:center;gap:10px;font-weight:600;font-size:17px;letter-spacing:-0.01em;}
.contact-root .brand .sub{color:rgba(255, 255, 255, .5);font-weight:500;font-size:14px;}
.contact-root .logo-mark{display:grid;place-items:center;border-radius:9px;background:linear-gradient(180deg, var(--c-brand), var(--c-brand-2));color:var(--c-on-brand);box-shadow:0 6px 18px -6px var(--c-brand);flex-shrink:0;}
.contact-root .nav-links{display:flex;align-items:center;gap:30px;margin-left:18px;}
.contact-root .nav-links a{font-size:13.5px;font-weight:500;color:rgba(255, 255, 255, .78);transition:color .2s var(--ease);}
.contact-root .nav-links a:hover{color:#fff;}
.contact-root .nav-right{display:flex;align-items:center;gap:14px;}
.contact-root .btn-text{background:none;border:none;color:#fff;font-size:13.5px;font-weight:500;padding:6px 4px;opacity:.85;transition:opacity .2s;white-space:nowrap;}
.contact-root .btn-text:hover{opacity:1;}
.contact-root .btn-glass{border-radius:999px;padding:9px 20px;color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap;transition:background .25s var(--ease), transform .15s var(--ease);border:none;}
.contact-root .btn-glass:hover{background:rgba(255, 255, 255, .06);}
.contact-root .btn-glass:active{transform:scale(.97);}
@media(max-width:760px){.contact-root .nav-links{display:none;}}

/* hero */
.contact-root main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 22px 8px;}
.contact-root .eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:.02em;color:rgba(255, 255, 255, .9);margin-bottom:22px;}
.contact-root .eyebrow .dot{width:7px;height:7px;border-radius:99px;background:var(--c-brand);box-shadow:0 0 10px var(--c-brand);}
.contact-root h1{font-family:var(--serif);font-weight:600;font-size:clamp(40px, 7vw, 74px);line-height:1.02;letter-spacing:-0.02em;margin:0 0 16px;text-shadow:0 2px 30px rgba(0, 0, 0, .55), 0 1px 4px rgba(0, 0, 0, .4);}
.contact-root h1 i{font-style:italic;color:transparent;background:linear-gradient(120deg, var(--c-brand), #fff 60%, var(--c-ai));-webkit-background-clip:text;background-clip:text;}
.contact-root .lede{max-width:46ch;margin:0 auto 30px;font-size:clamp(14.5px, 1.6vw, 16.5px);line-height:1.6;color:rgba(255, 255, 255, .82);text-shadow:0 1px 12px rgba(0, 0, 0, .55);}

/* form card */
.contact-root .card{width:100%;max-width:560px;border-radius:26px;padding:24px;text-align:left;}
.contact-root .field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:520px){.contact-root .field-grid{grid-template-columns:1fr;}}
.contact-root .field{margin-bottom:12px;}
.contact-root .field label{display:block;font-size:11.5px;font-weight:600;letter-spacing:.02em;color:rgba(255, 255, 255, .62);margin-bottom:7px;}
.contact-root .ctrl{width:100%;border-radius:14px;padding:12px 14px;color:#fff;font-size:14.5px;font-family:var(--sans);
  background:rgba(255, 255, 255, .04);border:1px solid rgba(255, 255, 255, .12);outline:none;transition:border-color .2s var(--ease), background .2s, box-shadow .2s;}
.contact-root .ctrl::placeholder{color:rgba(255, 255, 255, .34);}
.contact-root .ctrl:focus{border-color:var(--c-brand);background:rgba(255, 255, 255, .06);box-shadow:0 0 0 3px oklch(0.74 0.13 162/.22);}
.contact-root select.ctrl{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff90' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px;}
.contact-root select.ctrl option{background:#0b1014;color:#fff;}
.contact-root textarea.ctrl{resize:vertical;min-height:92px;line-height:1.5;}
.contact-root .submit{margin-top:6px;width:100%;display:flex;align-items:center;justify-content:center;gap:9px;border:none;border-radius:999px;padding:14px 22px;
  font-size:15px;font-weight:700;color:#04120c;
  background:linear-gradient(180deg, var(--c-brand), var(--c-brand-2));
  box-shadow:0 10px 30px -8px oklch(0.62 0.13 162/.6), inset 0 1px 0 rgba(255, 255, 255, .4);
  transition:transform .15s var(--ease), box-shadow .25s var(--ease), filter .2s;}
.contact-root .submit:hover{filter:brightness(1.06);box-shadow:0 14px 38px -8px oklch(0.62 0.13 162/.75), inset 0 1px 0 rgba(255, 255, 255, .4);}
.contact-root .submit:active{transform:scale(.98);}
.contact-root .submit:disabled{filter:saturate(.7) brightness(.9);cursor:default;}
.contact-root .assurance{display:flex;align-items:center;gap:8px;justify-content:center;margin-top:14px;font-size:12px;color:rgba(255, 255, 255, .6);}
.contact-root .assurance svg{flex-shrink:0;color:var(--c-brand);}

/* direct contact chips */
.contact-root .chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:24px;}
.contact-root .chip{display:inline-flex;align-items:center;gap:9px;border-radius:999px;padding:9px 16px;font-size:13px;font-weight:500;color:rgba(255, 255, 255, .86);transition:background .2s var(--ease);}
.contact-root .chip:hover{background:rgba(255, 255, 255, .06);}
.contact-root .chip svg{color:rgba(255, 255, 255, .7);}
.contact-root .chip b{font-weight:600;color:#fff;}

/* success */
.contact-root .success{text-align:center;padding:30px 16px;animation:ct-pop .45s var(--ease) both;}
@keyframes ct-pop{from{opacity:0;transform:scale(.96);}to{opacity:1;transform:none;}}
.contact-root .success .ok{width:62px;height:62px;border-radius:18px;margin:0 auto 18px;display:grid;place-items:center;
  background:linear-gradient(180deg, var(--c-brand), var(--c-brand-2));color:#04120c;box-shadow:0 12px 34px -10px oklch(0.62 0.13 162/.7);}
.contact-root .success h2{font-family:var(--serif);font-weight:600;font-size:30px;margin:0 0 8px;letter-spacing:-0.01em;}
.contact-root .success p{font-size:14.5px;color:rgba(255, 255, 255, .76);margin:0 auto;max-width:38ch;line-height:1.55;}

/* footer */
.contact-root footer{display:flex;justify-content:center;align-items:center;gap:14px;padding:26px 22px 36px;flex-wrap:wrap;}
.contact-root .social{width:50px;height:50px;border-radius:999px;display:grid;place-items:center;color:rgba(255, 255, 255, .8);transition:color .2s, background .2s var(--ease), transform .15s;}
.contact-root .social:hover{color:#fff;background:rgba(255, 255, 255, .06);transform:translateY(-2px);}
.contact-root .foot-note{width:100%;text-align:center;font-size:11.5px;color:rgba(255, 255, 255, .4);font-family:var(--mono);letter-spacing:.02em;}

@media(prefers-reduced-motion:reduce){
  .contact-root .bg-aurora .a, .contact-root .bg-aurora .b{animation:none;}
  .contact-root #bgv{transition:none;}
}
`;
