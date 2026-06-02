// app/offline/page.tsx, offline state (also served by the service worker fallback).
// EXACT port of claude-design/Offline.html: CloudFront background video + light veil,
// centered pill nav, bottom-left hero ("You're offline right now."), and the glass
// "Routing securely" overlay that animates out on mount. CSS scoped under `.offx`,
// keyframes prefixed `off-`. The primary "Retry connection" button reloads the page.
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CSS = `
.offx{--acc:#16916a;--acc-strong:#1f9e74;--ease:cubic-bezier(.22,1,.36,1);position:relative;min-height:100vh;overflow:hidden;background:#f0f0ee;}
.offx *{box-sizing:border-box;}
.offx{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
.offx a{text-decoration:none;}
.offx button{font-family:inherit;cursor:pointer;}
.offx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(31,158,116,.4);border-radius:999px;}
.offx .bgv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1s var(--ease);}
.offx .bgv.in{opacity:1;}
.offx .veil{position:absolute;inset:0;background:
  linear-gradient(60deg, rgba(240,240,238,.92) 0%, rgba(240,240,238,.5) 34%, rgba(240,240,238,0) 60%),
  linear-gradient(0deg, rgba(240,240,238,.55) 0%, transparent 40%);pointer-events:none;}
.offx .fg{position:relative;z-index:10;display:flex;flex-direction:column;min-height:100vh;}
.offx nav{display:flex;align-items:center;justify-content:center;gap:12px;padding:18px 16px 0;}
.offx .logo-pill{display:flex;align-items:center;justify-content:center;border-radius:999px;width:44px;height:44px;flex-shrink:0;background:#EDEDED;box-shadow:0 1px 2px rgba(0,0,0,.06);}
.offx .logo-pill svg{width:22px;height:22px;}
.offx .links{display:flex;align-items:center;gap:clamp(16px,4vw,40px);border-radius:14px;padding:13px clamp(18px,4vw,32px);background:#EDEDED;box-shadow:0 1px 2px rgba(0,0,0,.06);}
.offx .links a{font-size:clamp(12px,1.4vw,14px);font-weight:500;color:#3f3f46;transition:color .2s;}
.offx .links a:hover{color:#18181b;}
.offx .hero{flex:1;display:flex;align-items:flex-end;padding:0 clamp(24px,7vw,112px) clamp(40px,7vw,80px);}
.offx .hero .inner{max-width:440px;}
.offx .badge{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;font-weight:600;color:var(--acc);margin-bottom:14px;transition:color .2s;letter-spacing:.01em;}
.offx .badge:hover{color:var(--acc-strong);}
.offx .badge .ar{display:inline-block;transition:transform .2s var(--ease);}
.offx .badge:hover .ar{transform:translateX(2px);}
.offx .dot{display:inline-block;width:6px;height:6px;border-radius:99px;background:var(--acc);}
.offx h1{font-size:clamp(26px,3vw,34px);line-height:1.14;font-weight:600;color:#18181b;letter-spacing:-0.025em;margin:0 0 12px;}
.offx .sub{font-size:13.5px;color:#71717a;font-weight:400;margin:0 0 22px;line-height:1.55;max-width:38ch;}
.offx .cta-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;}
.offx .cta{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--acc);border:1px solid #8fd3bd;border-radius:999px;padding:11px 22px;background:rgba(255,255,255,.4);transition:all .2s var(--ease);}
.offx .cta:hover{background:var(--acc-strong);color:#fff;border-color:var(--acc-strong);box-shadow:0 8px 22px -8px rgba(31,158,116,.6);}
.offx .cta .ar{display:inline-block;transition:transform .2s var(--ease);}
.offx .cta:hover .ar{transform:translateX(2px);}
.offx .link2{font-size:13px;font-weight:500;color:#52525b;transition:color .2s;}
.offx .link2:hover{color:#18181b;}
@media(prefers-reduced-motion:reduce){.offx .bgv{transition:none;}}

.offx .pgxn{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;background:rgba(10,16,13,.22);-webkit-backdrop-filter:blur(2px) saturate(120%);backdrop-filter:blur(2px) saturate(120%);transition:opacity .42s cubic-bezier(.4,0,.2,1),backdrop-filter .42s cubic-bezier(.4,0,.2,1),-webkit-backdrop-filter .42s cubic-bezier(.4,0,.2,1);}
.offx .pgxn.show{opacity:1;-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);}
.offx .pgxn.cover{pointer-events:auto;}
.offx .pgx-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 46px 28px;border-radius:28px;background:linear-gradient(150deg,rgba(13,46,34,.64),rgba(7,22,16,.56));-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);border:1px solid rgba(255,255,255,.24);box-shadow:0 30px 90px -32px rgba(0,30,18,.6),inset 0 1px 0 rgba(255,255,255,.35);transform:scale(.9) translateY(8px);opacity:0;transition:transform .5s cubic-bezier(.22,1,.36,1),opacity .4s;}
.offx .pgxn.show .pgx-card{transform:none;opacity:1;}
.offx .pgx-svg{width:96px;height:96px;display:block;filter:drop-shadow(0 6px 18px rgba(22,145,106,.35));}
.offx .pgx-ring{transform-box:fill-box;transform-origin:center;animation:off-rot 7s linear infinite;}
.offx .pgx-ring2{transform-box:fill-box;transform-origin:center;animation:off-rot 5s linear infinite reverse;}
.offx .pgx-orbit{transform-box:fill-box;transform-origin:center;animation:off-rot 3.4s linear infinite;}
.offx .pgx-core{transform-box:fill-box;transform-origin:center;animation:off-pulse 1.8s ease-in-out infinite;}
.offx .pgx-scan{animation:off-scan 1.7s cubic-bezier(.5,0,.5,1) infinite;}
.offx .pgx-spark{animation:off-spark 1.8s ease-in-out infinite;}
@keyframes off-rot{to{transform:rotate(360deg);}}
@keyframes off-pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}
@keyframes off-scan{0%{transform:translateY(0);opacity:0;}15%{opacity:.95;}85%{opacity:.95;}100%{transform:translateY(34px);opacity:0;}}
@keyframes off-spark{0%,100%{opacity:.2;}50%{opacity:.9;}}
.offx .pgx-label{font-family:inherit;font-size:14px;font-weight:600;color:#eafff5;letter-spacing:.01em;text-shadow:0 1px 8px rgba(0,20,12,.5);}
.offx .pgx-dots::after{content:"";animation:off-dots 1.4s steps(4,end) infinite;}
@keyframes off-dots{0%{content:"";}25%{content:"\\2009.";}50%{content:"\\2009..";}75%{content:"\\2009...";}}
.offx .pgx-sub{font-family:inherit;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(234,255,245,.55);}
@media(prefers-reduced-motion:reduce){.offx .pgxn{transition:opacity .14s;}.offx .pgx-ring,.offx .pgx-ring2,.offx .pgx-orbit,.offx .pgx-core,.offx .pgx-scan,.offx .pgx-spark{animation:none;}.offx .pgx-card{transition:none;}}
`;

export default function OfflinePage() {
  const vid = useRef<HTMLVideoElement>(null);
  const [vidIn, setVidIn] = useState(false);
  const [overlay, setOverlay] = useState(true);

  // background video: fade in once the first frame is ready, mirroring the
  // original loadeddata + play().then() handshake.
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const go = () => setVidIn(true);
    if (v.readyState >= 2) go();
    const onData = () => { const p = v.play(); if (p && p.then) p.then(go).catch(go); else go(); };
    v.addEventListener("loadeddata", onData);
    return () => v.removeEventListener("loadeddata", onData);
  }, []);

  // "Routing securely" overlay shows on first paint, then animates out across
  // two animation frames (matches the original requestAnimationFrame chain).
  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setOverlay(false)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, []);

  function retry() { if (typeof window !== "undefined") window.location.reload(); }

  return (
    <div className="offx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="root">
        <video ref={vid} className={"bgv" + (vidIn ? " in" : "")} muted autoPlay loop playsInline preload="auto" aria-hidden="true"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4" />
        <div className="veil" aria-hidden="true" />

        <div className="fg">
          <nav>
            <Link className="logo-pill" href="/welcome" aria-label="TalentFlow ATS home" style={{ width: "auto", height: "auto", background: "none", boxShadow: "none", border: "none" }}>
              <img src="/assets/logo-light.png" alt="TalentFlow ATS" style={{ height: 30, width: "auto", display: "block" }} />
            </Link>
            <div className="links">
              <Link href="/welcome">Product</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/support">Help</Link>
              <Link href="/support">Support</Link>
            </div>
          </nav>

          <main className="hero">
            <div className="inner">
              <Link className="badge" href="/support"><span className="dot" /> Offline · No connection <span className="ar">&#8594;</span></Link>
              <h1>You are offline right now.</h1>
              <p className="sub">We cannot reach the network. Check your connection, and we will reconnect you the moment you are back online.</p>
              <div className="cta-row">
                <button className="cta" type="button" onClick={retry}>Retry connection <span className="ar">&#8594;</span></button>
                <Link className="link2" href="/">Back to dashboard</Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className={"pgxn" + (overlay ? " show" : "")} aria-hidden="true">
        <div className="pgx-card">
          <svg className="pgx-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <defs><linearGradient id="offpgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5fe3b8" /><stop offset="1" stopColor="#16916a" /></linearGradient></defs>
            <circle className="pgx-ring" cx="60" cy="60" r="50" stroke="url(#offpgg)" strokeWidth="1.6" strokeDasharray="4 9" opacity=".55" />
            <circle className="pgx-ring2" cx="60" cy="60" r="40" stroke="#7c5cff" strokeWidth="1.2" strokeDasharray="2 7" opacity=".4" />
            <g className="pgx-orbit"><circle cx="60" cy="10" r="4.2" fill="#5fe3b8" /><circle className="pgx-n2" cx="103" cy="78" r="3.6" fill="#7c5cff" /><circle className="pgx-n3" cx="17" cy="78" r="3.6" fill="#5fe3b8" /></g>
            <rect className="pgx-core" x="38" y="38" width="44" height="44" rx="13" fill="url(#offpgg)" />
            <g stroke="#eafff5" strokeWidth="2.6" strokeLinecap="round" opacity=".92"><line x1="48" y1="52" x2="72" y2="52" /><line x1="48" y1="60" x2="67" y2="60" /><line x1="48" y1="68" x2="70" y2="68" /></g>
            <rect className="pgx-scan" x="40" y="44" width="40" height="3" rx="1.5" fill="#fff" opacity=".95" />
            <circle className="pgx-spark" cx="60" cy="60" r="3" fill="#fff" />
          </svg>
          <div className="pgx-label">Routing securely<span className="pgx-dots" /></div>
          <div className="pgx-sub">TalentFlow ATS</div>
        </div>
      </div>
    </div>
  );
}
