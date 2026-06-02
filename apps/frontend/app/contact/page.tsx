"use client";
// app/contact/page.tsx
// EXACT port of claude-design/Contact.html, the full-bleed "Contact Sales" page:
// CloudFront background video with a RAF-based fade-loop, aurora-blob fallback,
// legibility veil + film grain, liquid-glass nav/card/chips/footer, the serif
// "Let's talk hiring." hero, and the demo-request form with inline validation +
// a success state. Wired to the real backend: the form does a best-effort POST
// to /support/tickets and always acknowledges the visitor (graceful on failure).
// The whole prototype is scoped under `.contactx`; its :root vars, body styles
// and @keyframes are namespaced so it cannot leak into the rest of the app.
import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
.contactx{
  --serif:"Instrument Serif", serif;
  --sans:"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;
  --mono:"Geist Mono", ui-monospace, monospace;
  --brand:oklch(0.74 0.13 162);      /* emerald, lifted for dark */
  --brand-deep:oklch(0.62 0.13 162);
  --ai:oklch(0.74 0.15 292);         /* violet AI accent */
  --ease:cubic-bezier(.22, 1, .36, 1);
  position:relative;
  min-height:100svh;
  background:#05080a;
  overflow-x:hidden;
  font-family:var(--sans);
  color:#fff;
  -webkit-font-smoothing:antialiased;
}
.contactx *{box-sizing:border-box;}
.contactx a{color:inherit;text-decoration:none;}
.contactx button{font-family:inherit;cursor:pointer;}
.contactx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(255, 255, 255, .35);border-radius:999px;}

/* ---------- cinematic background ---------- */
.contactx .bg-aurora{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:
  radial-gradient(60% 50% at 22% 40%, oklch(0.34 0.09 162/.34), transparent 70%),
  radial-gradient(55% 50% at 85% 80%, oklch(0.32 0.10 292/.5), transparent 70%),
  radial-gradient(80% 70% at 50% 120%, oklch(0.30 0.07 200/.35), transparent 70%),
  #05080a;}
.contactx .bg-aurora i{position:absolute;border-radius:50%;filter:blur(90px);display:block;}
.contactx .bg-aurora .a{width:46vw;height:46vw;left:-16vw;top:6vh;background:radial-gradient(circle, var(--brand), transparent 66%);opacity:.10;animation:cont-drift 22s var(--ease) infinite;}
.contactx .bg-aurora .b{width:42vw;height:42vw;right:-12vw;bottom:-16vw;background:radial-gradient(circle, var(--ai), transparent 66%);opacity:.16;animation:cont-drift 28s var(--ease) infinite reverse;}
@keyframes cont-drift{0%, 100%{transform:translate(0, 0) scale(1);}50%{transform:translate(4%, -5%) scale(1.12);}}

.contactx #bgv{
  position:fixed;inset:0;width:100%;height:100%;
  object-fit:cover;object-position:center;
  transform:translateY(17%) scale(1.0);
  z-index:1;opacity:0;pointer-events:none;
  will-change:opacity;
}
/* legibility veil over the video */
.contactx .veil{position:fixed;inset:0;z-index:2;pointer-events:none;background:
  linear-gradient(180deg, rgba(3, 6, 8, .9) 0%, rgba(3, 6, 8, .5) 16%, rgba(3, 6, 8, .28) 34%, rgba(3, 6, 8, .42) 70%, rgba(3, 6, 8, .78) 100%),
  radial-gradient(120% 90% at 50% 40%, transparent 40%, rgba(3, 6, 8, .55) 100%);}
.contactx .grain{position:fixed;inset:0;z-index:3;pointer-events:none;opacity:.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}

/* ---------- liquid glass ---------- */
.contactx .liquid-glass{
  background:rgba(255, 255, 255, 0.01);
  background-blend-mode:luminosity;
  -webkit-backdrop-filter:blur(8px);
  backdrop-filter:blur(8px);
  border:none;
  box-shadow:inset 0 1px 1px rgba(255, 255, 255, 0.10), 0 18px 50px -20px rgba(0, 0, 0, .55);
  position:relative;
  overflow:hidden;
}
.contactx .liquid-glass::before{
  content:"";
  position:absolute;inset:0;border-radius:inherit;padding:1.4px;
  background:linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.15) 20%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0.15) 80%, rgba(255, 255, 255, 0.45) 100%);
  -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  pointer-events:none;
}

/* ---------- page shell ---------- */
.contactx .page{position:relative;z-index:10;display:flex;flex-direction:column;min-height:100svh;}

/* nav */
.contactx nav{padding:22px 24px;}
.contactx .nav-inner{max-width:1120px;margin:0 auto;border-radius:999px;padding:11px 14px 11px 22px;display:flex;align-items:center;justify-content:space-between;gap:18px;}
.contactx .brand{display:flex;align-items:center;gap:10px;font-weight:600;font-size:17px;letter-spacing:-0.01em;}
.contactx .brand .logo{width:26px;height:26px;flex-shrink:0;}
.contactx .nav-links{display:flex;align-items:center;gap:30px;margin-left:10px;}
.contactx .nav-links a{font-size:13.5px;font-weight:500;color:rgba(255, 255, 255, .78);transition:color .2s var(--ease);}
.contactx .nav-links a:hover{color:#fff;}
.contactx .nav-right{display:flex;align-items:center;gap:14px;}
.contactx .btn-text{background:none;border:none;color:#fff;font-size:13.5px;font-weight:500;padding:6px 4px;opacity:.85;transition:opacity .2s;white-space:nowrap;}
.contactx .btn-text:hover{opacity:1;}
.contactx .btn-glass{border-radius:999px;padding:9px 20px;color:#fff;font-size:13.5px;font-weight:600;white-space:nowrap;transition:background .25s var(--ease), transform .15s var(--ease);}
.contactx .btn-glass:hover{background:rgba(255, 255, 255, .06);}
.contactx .btn-glass:active{transform:scale(.97);}
@media(max-width:760px){.contactx .nav-links{display:none;}}

/* hero */
.contactx main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 22px 8px;}
.contactx .eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:.02em;color:rgba(255, 255, 255, .9);margin-bottom:22px;}
.contactx .eyebrow .dot{width:7px;height:7px;border-radius:99px;background:var(--brand);box-shadow:0 0 10px var(--brand);}
.contactx h1{font-family:var(--serif);font-weight:400;font-size:clamp(40px, 7vw, 74px);line-height:1.02;letter-spacing:-0.02em;margin:0 0 16px;text-shadow:0 2px 30px rgba(0, 0, 0, .55), 0 1px 4px rgba(0, 0, 0, .4);}
.contactx h1 i{font-style:italic;color:transparent;background:linear-gradient(120deg, var(--brand), #fff 60%, var(--ai));-webkit-background-clip:text;background-clip:text;}
.contactx .lede{max-width:46ch;margin:0 auto 30px;font-size:clamp(14.5px, 1.6vw, 16.5px);line-height:1.6;color:rgba(255, 255, 255, .82);text-shadow:0 1px 12px rgba(0, 0, 0, .55);}

/* form card */
.contactx .card{width:100%;max-width:560px;border-radius:26px;padding:24px;text-align:left;}
.contactx .field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
@media(max-width:520px){.contactx .field-grid{grid-template-columns:1fr;}}
.contactx .field{margin-bottom:12px;}
.contactx .field label{display:block;font-size:11.5px;font-weight:600;letter-spacing:.02em;color:rgba(255, 255, 255, .62);margin-bottom:7px;}
.contactx .ctrl{width:100%;border-radius:14px;padding:12px 14px;color:#fff;font-size:14.5px;font-family:var(--sans);
  background:rgba(255, 255, 255, .04);border:1px solid rgba(255, 255, 255, .12);outline:none;transition:border-color .2s var(--ease), background .2s, box-shadow .2s;}
.contactx .ctrl::placeholder{color:rgba(255, 255, 255, .34);}
.contactx .ctrl:focus{border-color:var(--brand);background:rgba(255, 255, 255, .06);box-shadow:0 0 0 3px oklch(0.74 0.13 162/.22);}
.contactx select.ctrl{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff90' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px;}
.contactx select.ctrl option{background:#0b1014;color:#fff;}
.contactx textarea.ctrl{resize:vertical;min-height:92px;line-height:1.5;}
.contactx .submit{margin-top:6px;width:100%;display:flex;align-items:center;justify-content:center;gap:9px;border:none;border-radius:999px;padding:14px 22px;
  font-size:15px;font-weight:700;color:#04120c;
  background:linear-gradient(180deg, var(--brand), var(--brand-deep));
  box-shadow:0 10px 30px -8px oklch(0.62 0.13 162/.6), inset 0 1px 0 rgba(255, 255, 255, .4);
  transition:transform .15s var(--ease), box-shadow .25s var(--ease), filter .2s;}
.contactx .submit:hover{filter:brightness(1.06);box-shadow:0 14px 38px -8px oklch(0.62 0.13 162/.75), inset 0 1px 0 rgba(255, 255, 255, .4);}
.contactx .submit:active{transform:scale(.98);}
.contactx .submit:disabled{filter:saturate(.7) brightness(.9);cursor:default;}
.contactx .assurance{display:flex;align-items:center;gap:8px;justify-content:center;margin-top:14px;font-size:12px;color:rgba(255, 255, 255, .6);}
.contactx .assurance svg{flex-shrink:0;color:var(--brand);}

/* direct contact chips */
.contactx .chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:24px;}
.contactx .chip{display:inline-flex;align-items:center;gap:9px;border-radius:999px;padding:9px 16px;font-size:13px;font-weight:500;color:rgba(255, 255, 255, .86);transition:background .2s var(--ease);}
.contactx .chip:hover{background:rgba(255, 255, 255, .06);}
.contactx .chip svg{color:rgba(255, 255, 255, .7);}
.contactx .chip b{font-weight:600;color:#fff;}

/* success */
.contactx .success{text-align:center;padding:30px 16px;animation:cont-pop .45s var(--ease) both;}
@keyframes cont-pop{from{opacity:0;transform:scale(.96);}to{opacity:1;transform:none;}}
.contactx .success .ok{width:62px;height:62px;border-radius:18px;margin:0 auto 18px;display:grid;place-items:center;
  background:linear-gradient(180deg, var(--brand), var(--brand-deep));color:#04120c;box-shadow:0 12px 34px -10px oklch(0.62 0.13 162/.7);}
.contactx .success h2{font-family:var(--serif);font-weight:400;font-size:30px;margin:0 0 8px;letter-spacing:-0.01em;}
.contactx .success p{font-size:14.5px;color:rgba(255, 255, 255, .76);margin:0 auto;max-width:38ch;line-height:1.55;}

/* footer */
.contactx footer{display:flex;justify-content:center;align-items:center;gap:14px;padding:26px 22px 36px;flex-wrap:wrap;}
.contactx .social{width:50px;height:50px;border-radius:999px;display:grid;place-items:center;color:rgba(255, 255, 255, .8);transition:color .2s, background .2s var(--ease), transform .15s;}
.contactx .social:hover{color:#fff;background:rgba(255, 255, 255, .06);transform:translateY(-2px);}
.contactx .foot-note{width:100%;text-align:center;font-size:11.5px;color:rgba(255, 255, 255, .4);font-family:var(--mono);letter-spacing:.02em;}

@media(prefers-reduced-motion:reduce){
  .contactx .bg-aurora .a, .contactx .bg-aurora .b{animation:none;}
  .contactx #bgv{opacity:.5 !important;}
}

/* ---------- routing-secure loading overlay ---------- */
.contactx #pgxn{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;background:rgba(10, 16, 13, .22);-webkit-backdrop-filter:blur(2px) saturate(120%);backdrop-filter:blur(2px) saturate(120%);transition:opacity .42s cubic-bezier(.4, 0, .2, 1), backdrop-filter .42s cubic-bezier(.4, 0, .2, 1), -webkit-backdrop-filter .42s cubic-bezier(.4, 0, .2, 1);}
.contactx #pgxn.show{opacity:1;-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);}
.contactx #pgxn.cover{pointer-events:auto;}
.contactx .pgx-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 46px 28px;border-radius:28px;background:linear-gradient(150deg, rgba(13, 46, 34, .64), rgba(7, 22, 16, .56));-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);border:1px solid rgba(255, 255, 255, .24);box-shadow:0 30px 90px -32px rgba(0, 30, 18, .6), inset 0 1px 0 rgba(255, 255, 255, .35);transform:scale(.9) translateY(8px);opacity:0;transition:transform .5s cubic-bezier(.22, 1, .36, 1), opacity .4s;}
.contactx #pgxn.show .pgx-card{transform:none;opacity:1;}
.contactx .pgx-svg{width:96px;height:96px;display:block;filter:drop-shadow(0 6px 18px rgba(22, 145, 106, .35));}
.contactx .pgx-ring{transform-box:fill-box;transform-origin:center;animation:cont-pgrot 7s linear infinite;}
.contactx .pgx-ring2{transform-box:fill-box;transform-origin:center;animation:cont-pgrot 5s linear infinite reverse;}
.contactx .pgx-orbit{transform-box:fill-box;transform-origin:center;animation:cont-pgrot 3.4s linear infinite;}
.contactx .pgx-core{transform-box:fill-box;transform-origin:center;animation:cont-pgpulse 1.8s ease-in-out infinite;}
.contactx .pgx-scan{animation:cont-pgscan 1.7s cubic-bezier(.5, 0, .5, 1) infinite;}
.contactx .pgx-spark{animation:cont-pgspark 1.8s ease-in-out infinite;}
@keyframes cont-pgrot{to{transform:rotate(360deg);}}
@keyframes cont-pgpulse{0%, 100%{transform:scale(1);}50%{transform:scale(1.06);}}
@keyframes cont-pgscan{0%{transform:translateY(0);opacity:0;}15%{opacity:.95;}85%{opacity:.95;}100%{transform:translateY(34px);opacity:0;}}
@keyframes cont-pgspark{0%, 100%{opacity:.2;}50%{opacity:.9;}}
.contactx .pgx-label{font-family:inherit;font-size:14px;font-weight:600;color:#eafff5;letter-spacing:.01em;text-shadow:0 1px 8px rgba(0, 20, 12, .5);}
.contactx .pgx-dots::after{content:"";animation:cont-pgdots 1.4s steps(4, end) infinite;}
@keyframes cont-pgdots{0%{content:"";}25%{content:"\\2009.";}50%{content:"\\2009..";}75%{content:"\\2009...";}}
.contactx .pgx-sub{font-family:inherit;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(234, 255, 245, .55);}
@media(prefers-reduced-motion:reduce){
  .contactx #pgxn{transition:opacity .14s;}
  .contactx .pgx-ring, .contactx .pgx-ring2, .contactx .pgx-orbit, .contactx .pgx-core, .contactx .pgx-scan, .contactx .pgx-spark{animation:none;}
  .contactx .pgx-card{transition:none;}
}
`;

const SIZES = ["1 to 10", "11 to 50", "51 to 200", "201 to 1, 000", "1, 000+"];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [size, setSize] = useState("51 to 200");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [badName, setBadName] = useState(false);
  const [badEmail, setBadEmail] = useState(false);
  const [overlay, setOverlay] = useState(true); // routing-secure overlay, fades out on mount

  const vid = useRef<HTMLVideoElement | null>(null);

  const firstName = name.trim().split(" ")[0] || "there";

  // ---------- routing-secure overlay: show on mount, then fade out (two RAFs) ----------
  useEffect(() => {
    let r1 = 0;
    let r2 = 0;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setOverlay(false));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, []);

  // ---------- custom JS video fade system (RAF-based, no CSS transitions) ----------
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    let raf: number | null = null;
    let fadingOut = false;
    const DUR = 500;

    const currentOpacity = () => {
      const o = parseFloat(v.style.opacity);
      return isNaN(o) ? 0 : o;
    };

    const fade = (target: number) => {
      if (raf) cancelAnimationFrame(raf); // cancel any running animation
      const from = currentOpacity(); // resume from current opacity (no snap)
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / DUR);
        v.style.opacity = (from + (target - from) * k).toFixed(4);
        if (k < 1) {
          raf = requestAnimationFrame(step);
        } else {
          raf = null;
        }
      };
      raf = requestAnimationFrame(step);
    };

    const startLoopIn = () => {
      fadingOut = false;
      fade(1);
    }; // 500ms fade-in on load / loop start

    const tryPlay = () => {
      const p = v.play();
      if (p && (p as Promise<void>).then) {
        (p as Promise<void>).then(startLoopIn).catch(() => {
          /* autoplay blocked: aurora fallback shows */
        });
      } else {
        startLoopIn();
      }
    };

    const onLoadedData = () => {
      v.style.opacity = "0";
      tryPlay();
    };

    const onTimeUpdate = () => {
      if (!v.duration || isNaN(v.duration)) return;
      if (!fadingOut && v.duration - v.currentTime <= 0.55) {
        // 0.55s before end
        fadingOut = true;
        fade(0); // 500ms fade-out
      }
    };

    let endTimer: ReturnType<typeof setTimeout> | null = null;
    const onEnded = () => {
      v.style.opacity = "0";
      endTimer = setTimeout(() => {
        v.currentTime = 0;
        tryPlay(); // resets, plays, fades back in
      }, 100);
    };

    v.addEventListener("loadeddata", onLoadedData);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);

    // if it's already buffered by the time we attach
    if (v.readyState >= 2) {
      v.style.opacity = "0";
      tryPlay();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (endTimer) clearTimeout(endTimer);
      v.removeEventListener("loadeddata", onLoadedData);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) && name.trim().length > 0;
    if (!ok) {
      const nameBad = !name.trim();
      setBadName(nameBad);
      setBadEmail(!nameBad);
      return;
    }
    setBadName(false);
    setBadEmail(false);
    setSubmitting(true);
    try {
      // Best-effort POST; the success notice shows regardless of backend wiring.
      let token: string | null = null;
      try {
        token = window.sessionStorage.getItem("ats-access-token");
      } catch {
        /* ignore storage access errors */
      }
      await fetch(`${API_BASE}/support/tickets`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: `Sales enquiry from ${company.trim() || name.trim()}`,
          category: "SALES",
          priority: "NORMAL",
          body:
            `What they are hoping to improve:\n${msg.trim() || "(not specified)"}\n\n` +
            `Name: ${name.trim()}\nWork email: ${email.trim()}\n` +
            `Company: ${company.trim() || "(not specified)"}\nTeam size: ${size}`,
        }),
      }).catch(() => {
        // Gracefully fall back: still treat as sent so the visitor is acknowledged.
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="contactx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* cinematic background: aurora fallback under the looping video */}
      <div className="bg-aurora" aria-hidden="true">
        <i className="a" />
        <i className="b" />
      </div>
      <video
        id="bgv"
        ref={vid}
        muted
        autoPlay
        playsInline
        preload="auto"
        aria-hidden="true"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
      />
      <div className="veil" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <div className="page">
        {/* nav */}
        <nav>
          <div className="nav-inner liquid-glass">
            <div style={{ display: "flex", alignItems: "center" }}>
              <a className="brand" href="/welcome">
                <img
                  src="/assets/logo-dark.png"
                  alt="TalentFlow ATS"
                  style={{ height: 30, width: "auto", display: "block" }}
                />
              </a>
              <div className="nav-links">
                <a href="/welcome">Product</a>
                <a href="/pricing">Pricing</a>
                <a href="/welcome">Customers</a>
              </div>
            </div>
            <div className="nav-right">
              <a href="/login">
                <button className="btn-text" type="button">Sign in</button>
              </a>
              <a href="/welcome">
                <button className="btn-glass liquid-glass" type="button">Back to site</button>
              </a>
            </div>
          </div>
        </nav>

        {/* hero */}
        <main>
          <span className="eyebrow liquid-glass">
            <span className="dot" /> Talk to our team
          </span>
          <h1>
            Let&apos;s talk <i>hiring.</i>
          </h1>
          <p className="lede">
            Tell us about your team and we&apos;ll show you how ATS screens candidates with AI you
            can trust, with a human always making the call.
          </p>

          <div className="card liquid-glass" id="card">
            {sent ? (
              <div className="success">
                <div className="ok">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
              <form id="form" noValidate onSubmit={handleSubmit}>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input
                      className="ctrl"
                      id="name"
                      name="name"
                      placeholder="Avery Chen"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (badName) setBadName(false);
                      }}
                      style={
                        badName
                          ? {
                              borderColor: "oklch(0.70 0.16 25)",
                              boxShadow: "0 0 0 3px oklch(0.70 0.16 25 / .22)",
                            }
                          : undefined
                      }
                      aria-invalid={badName || undefined}
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
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (badEmail) setBadEmail(false);
                      }}
                      style={
                        badEmail
                          ? {
                              borderColor: "oklch(0.70 0.16 25)",
                              boxShadow: "0 0 0 3px oklch(0.70 0.16 25 / .22)",
                            }
                          : undefined
                      }
                      aria-invalid={badEmail || undefined}
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
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <div className="assurance">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  We reply within one business day. No spam, ever.
                </div>
              </form>
            )}
          </div>

          {/* direct contact */}
          <div className="chips">
            <a className="chip liquid-glass" href="mailto:sales@aerofyta.com">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
              </svg>
              <span>
                <b>sales@aerofyta.com</b>
              </span>
            </a>
            <a className="chip liquid-glass" href="tel:+18005550142">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
              <span>
                <b>+1 (800) 555 0142</b>
              </span>
            </a>
            <a className="chip liquid-glass" href="/support">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
          <a className="social liquid-glass" href="#" aria-label="ATS on LinkedIn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" />
            </svg>
          </a>
          <a className="social liquid-glass" href="#" aria-label="ATS on X">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
            </svg>
          </a>
          <a className="social liquid-glass" href="/welcome" aria-label="ATS website">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.6 2.7 4 6 4 9s-1.4 6.3-4 9c-2.6-2.7-4-6-4-9s1.4-6.3 4-9z" />
            </svg>
          </a>
          <div className="foot-note">ATS · AI is advisory, a human decides</div>
        </footer>
      </div>

      {/* routing-secure loading overlay */}
      <div id="pgxn" className={overlay ? "show" : ""} aria-hidden="true">
        <div className="pgx-card">
          <svg className="pgx-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="pgg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5fe3b8" />
                <stop offset="1" stopColor="#16916a" />
              </linearGradient>
            </defs>
            <circle
              className="pgx-ring"
              cx="60"
              cy="60"
              r="50"
              stroke="url(#pgg)"
              strokeWidth="1.6"
              strokeDasharray="4 9"
              opacity=".55"
            />
            <circle
              className="pgx-ring2"
              cx="60"
              cy="60"
              r="40"
              stroke="#7c5cff"
              strokeWidth="1.2"
              strokeDasharray="2 7"
              opacity=".4"
            />
            <g className="pgx-orbit">
              <circle cx="60" cy="10" r="4.2" fill="#5fe3b8" />
              <circle className="pgx-n2" cx="103" cy="78" r="3.6" fill="#7c5cff" />
              <circle className="pgx-n3" cx="17" cy="78" r="3.6" fill="#5fe3b8" />
            </g>
            <rect className="pgx-core" x="38" y="38" width="44" height="44" rx="13" fill="url(#pgg)" />
            <g stroke="#eafff5" strokeWidth="2.6" strokeLinecap="round" opacity=".92">
              <line x1="48" y1="52" x2="72" y2="52" />
              <line x1="48" y1="60" x2="67" y2="60" />
              <line x1="48" y1="68" x2="70" y2="68" />
            </g>
            <rect className="pgx-scan" x="40" y="44" width="40" height="3" rx="1.5" fill="#fff" opacity=".95" />
            <circle className="pgx-spark" cx="60" cy="60" r="3" fill="#fff" />
          </svg>
          <div className="pgx-label">
            Routing securely<span className="pgx-dots" />
          </div>
          <div className="pgx-sub">TalentFlow ATS</div>
        </div>
      </div>
    </div>
  );
}
