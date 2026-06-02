"use client";
// app/system-status/page.tsx
// EXACT port of claude-design/Status.html, the full-bleed cinematic system-status
// hero: CloudFront background video + tint, scattered "all systems live" typography,
// the live indicator chip with a pulsing dot, three stat blocks (99.98% uptime,
// 142ms latency, 0 incidents), and the link to the full status board. Standalone
// public page, no backend wiring. Video fade-in via useRef + onLoadedData.
import { useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&display=swap');
.sysstatx *{box-sizing:border-box;margin:0;}
.sysstatx{min-height:100vh;font-family:'Readex Pro',system-ui,-apple-system,sans-serif;background:#000;color:#fff;-webkit-font-smoothing:antialiased;overflow:hidden;}
.sysstatx a{text-decoration:none;color:inherit;}.sysstatx button{font-family:inherit;cursor:pointer;}
.sysstatx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(79,217,166,.5);border-radius:999px;}
.sysstatx .hero-title{letter-spacing:-0.04em;line-height:.95;font-weight:500;}
.sysstatx .lc{text-transform:lowercase;}
.sysstatx .section{position:relative;height:100vh;height:100dvh;width:100%;overflow:hidden;background:#000;}
.sysstatx .bgv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.sysstatx .vtint{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(0,0,0,.15) 38%,rgba(0,0,0,.55));pointer-events:none;}
/* navbar */
.sysstatx nav{position:absolute;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:24px clamp(24px,4vw,40px) 0;}
.sysstatx .pill{background:rgba(23,23,23,.9);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-radius:999px;}
.sysstatx .lpill{display:flex;align-items:center;gap:10px;padding:11px 22px 11px 16px;}
.sysstatx .lpill img{height:22px;display:block;}
.sysstatx .lpill .bn{font-size:14px;font-weight:400;letter-spacing:-0.01em;}
.sysstatx .cpill{display:none;align-items:center;gap:4px;padding:7px 10px;}
.sysstatx .cpill a{color:#d4d4d4;font-size:14px;padding:8px 18px;border-radius:999px;transition:color .2s,background .2s;}
.sysstatx .cpill a:hover{color:#fff;}.sysstatx .cpill a.on{color:#fff;background:rgba(255,255,255,.08);}
.sysstatx .gbtn{background:#fff;color:#000;font-size:14px;border:none;border-radius:999px;padding:12px 24px;transition:background .2s;}
.sysstatx .gbtn:hover{background:#e5e5e5;}
@media(min-width:768px){.sysstatx .cpill{display:flex;}}
/* foreground */
.sysstatx .fg{position:relative;height:100%;width:100%;}
.sysstatx .fg h1{position:absolute;color:#fff;font-size:14vw;}
@media(min-width:768px){.sysstatx .fg h1{font-size:13vw;}}
.sysstatx .w1{left:16px;top:17%;}@media(min-width:768px){.sysstatx .w1{left:40px;}}
.sysstatx .w2{right:16px;top:37%;}@media(min-width:768px){.sysstatx .w2{right:40px;}}
.sysstatx .w3{left:18%;top:57%;}@media(min-width:768px){.sysstatx .w3{left:28%;}}
.sysstatx .w2 em{font-style:normal;color:#4fd9a6;}
.sysstatx .desc{position:absolute;left:24px;top:45%;max-width:250px;font-size:15px;line-height:1.35;color:rgba(255,255,255,.9);}
@media(min-width:768px){.sysstatx .desc{left:40px;}}
.sysstatx .livechip{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:500;color:#cdeede;background:rgba(79,217,166,.12);border:1px solid rgba(79,217,166,.3);padding:6px 13px;border-radius:999px;margin-bottom:14px;}
.sysstatx .livechip .d{width:8px;height:8px;border-radius:50%;background:#4fd9a6;box-shadow:0 0 0 0 rgba(79,217,166,.6);animation:sysstatx-lp 2s infinite;}
@keyframes sysstatx-lp{0%{box-shadow:0 0 0 0 rgba(79,217,166,.55);}70%{box-shadow:0 0 0 9px rgba(79,217,166,0);}100%{box-shadow:0 0 0 0 rgba(79,217,166,0);}}
.sysstatx .desc p{text-shadow:0 1px 14px rgba(0,0,0,.6);}
.sysstatx .desc .bd{display:inline-flex;align-items:center;gap:7px;margin-top:16px;font-size:13px;font-weight:500;color:#fff;}
.sysstatx .desc .bd svg{transition:transform .2s var(--e,cubic-bezier(.22,1,.36,1));}
.sysstatx .desc .bd:hover svg{transform:translateX(3px);}
/* stat blocks */
.sysstatx .stat{position:absolute;}
.sysstatx .stat .row{display:flex;align-items:center;gap:12px;}
.sysstatx .stat .num{font-size:36px;font-weight:500;letter-spacing:-0.02em;}
@media(min-width:768px){.sysstatx .stat .num{font-size:48px;}}
.sysstatx .stat .div{display:none;height:1px;width:96px;background:rgba(255,255,255,.4);}
@media(min-width:768px){.sysstatx .stat .div{display:block;}}
.sysstatx .stat .sub{font-size:12px;color:rgba(255,255,255,.7);margin-top:5px;}
@media(min-width:768px){.sysstatx .stat .sub{font-size:14px;}}
.sysstatx .s-tr{right:24px;top:13%;}@media(min-width:768px){.sysstatx .s-tr{right:96px;}}
.sysstatx .s-tr .row{justify-content:flex-end;}.sysstatx .s-tr .div{transform:rotate(20deg);}.sysstatx .s-tr .sub{text-align:right;}
.sysstatx .s-bl{left:24px;bottom:80px;}@media(min-width:768px){.sysstatx .s-bl{left:80px;bottom:96px;}}
.sysstatx .s-bl .div{transform:rotate(-20deg);}
.sysstatx .s-br{right:24px;bottom:64px;}@media(min-width:768px){.sysstatx .s-br{right:80px;bottom:80px;}}
.sysstatx .s-br .row{justify-content:flex-end;}.sysstatx .s-br .div{transform:rotate(-20deg);}.sysstatx .s-br .sub{text-align:right;}
.sysstatx .grad{pointer-events:none;position:absolute;bottom:0;left:0;right:0;height:192px;background:linear-gradient(180deg,transparent,#000);}
@media(prefers-reduced-motion:reduce){.sysstatx .livechip .d{animation:none;}}
`;

export default function SystemStatusPage() {
  const vid = useRef<HTMLVideoElement>(null);

  return (
    <div className="sysstatx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section className="section">
        <video ref={vid} className="bgv" autoPlay loop muted playsInline aria-hidden="true"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4" />
        <div className="vtint" />

        <nav>
          <div className="pill lpill">
            <img src="/assets/logo-dark.png" alt="TalentFlow ATS" />
          </div>
          <div className="pill cpill">
            <a href="/welcome" className="lc">platform</a>
            <a href="/agents" className="lc">agents</a>
            <a href="/pricing" className="lc">pricing</a>
            <a href="/system-status" className="on lc">status</a>
          </div>
          <a href="/"><button className="gbtn lc">open app</button></a>
        </nav>

        <div className="fg">
          <h1 className="hero-title lc w1">all</h1>
          <h1 className="hero-title lc w2">systems <em>live</em></h1>
          <h1 className="hero-title lc w3">.</h1>

          <div className="desc">
            <span className="livechip"><span className="d" /> Live · refreshed just now</span>
            <p className="lc">every screening, scheduling, and candidate service is running smoothly. no incidents.</p>
            <a className="bd lc" href="/status-board">view full status board <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
          </div>

          <div className="stat s-tr">
            <div className="row"><span className="div" /><span className="num">99.98%</span></div>
            <div className="sub lc">uptime · 90 days</div>
          </div>

          <div className="stat s-bl">
            <div className="row"><span className="num">142ms</span><span className="div" /></div>
            <div className="sub lc">avg api response</div>
          </div>

          <div className="stat s-br">
            <div className="row"><span className="div" /><span className="num">0</span></div>
            <div className="sub lc">active incidents</div>
          </div>
        </div>

        <div className="grad" />
      </section>
    </div>
  );
}
