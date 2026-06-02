"use client";
// app/(candidate-portal)/jobs/page.tsx
// EXACT port of claude-design/Candidate Portal.html, the public candidate job
// board for "Northwind Talent, powered by TalentFlow": CloudFront background
// video + aurora blobs + veil, liquid-glass hero with search/chips/AI-note,
// the open-roles grid, a two-part footer (links + DM Sans subscribe card with
// the floating "lucky cube" + watermark), and the route-transition overlay.
//
// Faithful reproduction, not a simplification. The entire inline <style> is
// reproduced verbatim under a `.portalx` scope (body/`*`/element selectors are
// prefixed; :root vars live on `.portalx`), @keyframes are renamed with a
// `portal-` prefix and their animation refs updated, and every inline <script>
// (bg-video fade-in, subscribe button, watermark fit, the page-transition
// overlay) is reimplemented with React state/effects.
//
// Open roles are best-effort fetched from /api/public/jobs and rendered when
// available; on any failure we gracefully fall back to the design's three
// static example cards. Apply / role links go to /jobs/{id}/apply, the brand /
// "Your applications" go to /welcome and /status, and "FAQ"/help to /transparency.
import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ---- real jobs (best-effort) ------------------------------------------------
interface PortalJob {
  id: string;
  title: string;
  department: string;
  location: string;
}

async function fetchJobs(): Promise<PortalJob[]> {
  const r = await fetch(`${API_BASE}/public/jobs`, { credentials: "include" });
  if (!r.ok) throw new Error(`GET /public/jobs -> ${r.status}`);
  const res: unknown = await r.json();
  const rows: any[] = Array.isArray(res)
    ? res
    : ((res as any)?.data ?? (res as any)?.jobs ?? (res as any) ?? []);
  const arr = Array.isArray(rows) ? rows : [];
  return arr.map((j: any): PortalJob => ({
    id: String(j.id ?? j.slug ?? ""),
    title: j.title ?? "Role",
    department: j.department ?? "",
    location: j.location ?? "",
  }));
}

// The design's static example cards, used verbatim as the graceful fallback.
const FALLBACK_ROLES: { meta: string; title: string; tags: string[] }[] = [
  { meta: "Engineering · Remote", title: "Senior Backend Engineer", tags: ["Full-time", "$160k, 200k"] },
  { meta: "Design · Austin, TX", title: "Staff Product Designer", tags: ["Full-time", "Hybrid"] },
  { meta: "Data · Remote", title: "Machine Learning Engineer", tags: ["Full-time", "$170k, 220k"] },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Caveat:wght@500;600;700&display=swap');
@font-face{font-family:"Helvetica Regular";src:url("https://db.onlinewebfonts.com/t/a64ff11d2c24584c767f6257e880dc65.woff2")format("woff2"), url("https://db.onlinewebfonts.com/t/a64ff11d2c24584c767f6257e880dc65.woff")format("woff");font-display:swap;}
.portalx{--font:"Helvetica Regular", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif;
  --br:oklch(0.78 0.13 162);--br-deep:oklch(0.66 0.13 162);--ai:#9b8cff;--ease:cubic-bezier(.22, 1, .36, 1);
  position:relative;min-height:100vh;background:#05080b;color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
.portalx *{box-sizing:border-box;}.portalx *{font-family:var(--font);}
.portalx ::selection{background:rgba(255, 255, 255, .2);color:#fff;}
.portalx a{color:inherit;text-decoration:none;}.portalx button{font-family:inherit;cursor:pointer;}
.portalx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(155, 140, 255, .45);border-radius:10px;}
.portalx .up{text-transform:uppercase;letter-spacing:.12em;}
/* bg */
.portalx .aurora{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:
  radial-gradient(55% 50% at 15% 14%, oklch(0.34 0.09 162/.45), transparent 70%),
  radial-gradient(55% 50% at 88% 86%, rgba(155, 140, 255, .22), transparent 70%), #05080b;}
.portalx .aurora i{position:absolute;border-radius:50%;filter:blur(90px);}
.portalx .aurora .a{width:46vw;height:46vw;left:-12vw;top:-16vw;background:radial-gradient(circle, var(--br), transparent 66%);opacity:.15;animation:portal-drift 26s var(--ease) infinite;}
.portalx .aurora .b{width:42vw;height:42vw;right:-12vw;bottom:-16vw;background:radial-gradient(circle, var(--ai), transparent 66%);opacity:.16;animation:portal-drift 32s var(--ease) infinite reverse;}
@keyframes portal-drift{0%, 100%{transform:translate(0, 0) scale(1);}50%{transform:translate(4%, -5%) scale(1.12);}}
.portalx #bgv{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:0;transition:opacity 1.1s var(--ease);}
.portalx #bgv.in{opacity:.5;}
.portalx .veil{position:fixed;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg, rgba(5, 8, 11, .6), rgba(5, 8, 11, .3) 35%, rgba(5, 8, 11, .72));}
/* liquid glass */
.portalx .liquid-glass{background:rgba(255, 255, 255, 0.01);background-blend-mode:luminosity;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:none;box-shadow:inset 0 1px 1px rgba(255, 255, 255, .1), 0 18px 50px -22px rgba(0, 0, 0, .6);position:relative;overflow:hidden;}
.portalx .liquid-glass::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.4px;background:linear-gradient(180deg, rgba(255, 255, 255, .45) 0%, rgba(255, 255, 255, .15) 20%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, .15) 80%, rgba(255, 255, 255, .45) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
/* layout */
.portalx main{position:relative;z-index:10;width:100%;min-height:115vh;overflow-x:hidden;display:flex;flex-direction:column;align-items:center;}
.portalx .wrap{width:100%;max-width:1200px;padding:0 clamp(18px, 4vw, 40px);display:flex;flex-direction:column;flex:1;}
/* nav */
.portalx nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 0;}
.portalx .brand{display:flex;align-items:center;gap:11px;}
.portalx .brand svg{height:34px;width:34px;}
.portalx .brand .t{font-size:15px;font-weight:500;line-height:1.1;}
.portalx .brand .t i{display:block;font-style:normal;font-size:11px;color:rgba(255, 255, 255, .5);letter-spacing:.04em;}
.portalx .nlinks{display:flex;align-items:center;gap:28px;}
.portalx .nlinks a{font-size:13px;color:rgba(255, 255, 255, .78);transition:color .2s;}
.portalx .nlinks a:hover{color:#fff;}
.portalx .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:999px;font-size:13.5px;font-weight:500;padding:10px 18px;transition:transform .15s var(--ease), box-shadow .25s, filter .2s, background .2s;white-space:nowrap;}
.portalx .btn:active{transform:scale(.97);}
.portalx .btn-em{background:linear-gradient(180deg, var(--br), var(--br-deep));color:#05120c;font-weight:600;box-shadow:0 8px 24px -8px oklch(0.66 0.13 162/.6), inset 0 1px 0 rgba(255, 255, 255, .4);}
.portalx .btn-em:hover{filter:brightness(1.06);}
.portalx .btn-glass{color:#fff;}.portalx .btn-glass:hover{background:rgba(255, 255, 255, .07);}
@media(max-width:760px){.portalx .nlinks{display:none;}}
/* hero */
.portalx .hero{padding:clamp(40px, 9vw, 110px) 0 30px;max-width:760px;}
.portalx .eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:11.5px;font-weight:600;color:rgba(255, 255, 255, .9);margin-bottom:20px;}
.portalx .eyebrow .dot{width:7px;height:7px;border-radius:99px;background:var(--ai);box-shadow:0 0 10px var(--ai);}
.portalx .hero h1{font-size:clamp(36px, 6vw, 68px);font-weight:500;letter-spacing:-0.03em;line-height:1.04;margin:0 0 16px;}
.portalx .hero h1 em{font-style:normal;color:transparent;background:linear-gradient(110deg, var(--br), #fff 58%, var(--ai));-webkit-background-clip:text;background-clip:text;}
.portalx .hero p{font-size:clamp(14.5px, 1.6vw, 17px);color:rgba(255, 255, 255, .7);line-height:1.6;max-width:54ch;margin:0 0 26px;}
.portalx .search{display:flex;gap:10px;align-items:center;border-radius:999px;padding:7px 7px 7px 18px;max-width:560px;}
.portalx .search svg{color:rgba(255, 255, 255, .5);flex-shrink:0;}
.portalx .search input{flex:1;border:none;outline:none;background:transparent;color:#fff;font-size:15px;min-width:0;}
.portalx .search input::placeholder{color:rgba(255, 255, 255, .4);}
.portalx .chips{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px;}
.portalx .chip{padding:7px 14px;border-radius:999px;font-size:12.5px;color:rgba(255, 255, 255, .8);}
.portalx .ai-note{display:inline-flex;align-items:center;gap:9px;margin-top:24px;font-size:12.5px;color:rgba(255, 255, 255, .66);border-radius:999px;padding:9px 16px;}
.portalx .ai-note svg{color:var(--ai);flex-shrink:0;}
/* roles */
.portalx .roles{display:grid;grid-template-columns:repeat(3, 1fr);gap:14px;margin:36px 0 0;}
@media(max-width:860px){.portalx .roles{grid-template-columns:1fr;}}
.portalx .role{border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:9px;transition:transform .25s var(--ease);}
.portalx .role:hover{transform:translateY(-4px);}
.portalx .role .meta{font-size:11.5px;color:rgba(255, 255, 255, .55);}
.portalx .role .rt{font-size:16px;font-weight:600;}
.portalx .role .tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:2px;}
.portalx .role .tag{font-size:11px;color:rgba(255, 255, 255, .7);background:rgba(255, 255, 255, .08);border-radius:99px;padding:3px 10px;}
.portalx .role .apply{margin-top:8px;display:inline-flex;align-items:center;gap:6px;color:var(--br);font-size:13px;font-weight:600;}
/* footer */
.portalx footer{width:100%;max-width:1200px;border-radius:28px;padding:clamp(24px, 4vw, 40px);color:rgba(255, 255, 255, .7);margin:clamp(80px, 16vw, 240px) auto 28px;opacity:0;animation:portal-rise 1s var(--ease) .4s forwards;}
@keyframes portal-rise{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:none;}}
.portalx .f-top{display:grid;grid-template-columns:5fr 7fr;gap:clamp(28px, 4vw, 48px);margin-bottom:38px;}
@media(max-width:820px){.portalx .f-top{grid-template-columns:1fr;gap:32px;}}
.portalx .f-brand{display:flex;align-items:center;gap:11px;color:#fff;margin-bottom:14px;}
.portalx .f-brand svg{width:30px;height:30px;}
.portalx .f-brand .nm{font-size:20px;font-weight:500;}
.portalx .f-desc{font-size:13.5px;line-height:1.6;max-width:38ch;}
.portalx .f-links{display:grid;grid-template-columns:repeat(3, 1fr);gap:24px;}
@media(max-width:520px){.portalx .f-links{grid-template-columns:1fr 1fr;}}
.portalx .f-col h4{font-size:12.5px;color:#fff;font-weight:500;margin:0 0 14px;}
.portalx .f-col a{display:block;font-size:12.5px;color:rgba(255, 255, 255, .6);margin-bottom:9px;transition:color .2s;}
.portalx .f-col a:hover{color:#fff;}
.portalx .f-bottom{padding-top:24px;border-top:1px solid rgba(255, 255, 255, .12);display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;}
.portalx .f-bottom .by{font-size:10px;opacity:.5;}
.portalx .f-social{display:flex;align-items:center;gap:14px;}
.portalx .f-social .lbl{font-size:10px;opacity:.5;}
.portalx .f-social a{color:rgba(255, 255, 255, .7);opacity:.8;transition:opacity .2s, color .2s;display:flex;}
.portalx .f-social a:hover{opacity:1;color:#fff;}
@media(prefers-reduced-motion:reduce){.portalx .aurora i{animation:none;}.portalx #bgv{transition:none;}.portalx footer{animation:none;opacity:1;}}

/* ===== secondary footer (DM Sans) ===== */
.portalx .footer-section{position:relative;z-index:5;background:transparent;padding:48px 24px 52px;color:#fff;border-top:1px solid rgba(255, 255, 255, .08);font-family:"DM Sans", sans-serif;}
.portalx .footer-section *{box-sizing:border-box;}
.portalx .footer-section a{text-decoration:none;}
.portalx .footer-wrapper{max-width:1150px;margin:0 auto;display:grid;grid-template-columns:350px 1fr;gap:16px;align-items:stretch;}
/* left */
.portalx .footer-left{position:relative;min-height:340px;border-radius:28px;padding:32px;overflow:hidden;box-shadow:0 12px 40px rgba(15, 125, 89, .28);background:#0f7d59;display:flex;flex-direction:column;justify-content:space-between;}
.portalx .footer-left-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;}
.portalx .footer-logo{display:flex;align-items:center;gap:10px;position:relative;z-index:1;}
.portalx .footer-logo-mark{width:32px;height:32px;border-radius:8px;background:rgba(255, 255, 255, .15);border:1.5px solid rgba(255, 255, 255, .85);display:grid;place-items:center;}
.portalx .footer-logo-mark svg{width:20px;height:20px;}
.portalx .footer-logo-name{font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.02em;}
.portalx .footer-tagline-container{margin-top:auto;margin-bottom:28px;position:relative;z-index:1;}
.portalx .footer-tagline{font-size:19px;font-weight:400;color:#fff;line-height:1.45;text-shadow:0 1px 16px rgba(8, 40, 28, .5);}
.portalx .footer-tagline span{color:rgba(255, 255, 255, .68);}
.portalx .footer-social-row{display:flex;justify-content:space-between;align-items:center;gap:12px;position:relative;z-index:1;}
.portalx .footer-social-label{font-family:'Caveat', cursive;font-size:17px;font-weight:600;color:rgba(255, 255, 255, .92);letter-spacing:.3px;}
.portalx .footer-social-icons{display:flex;gap:7px;}
.portalx .social-icon{width:36px;height:36px;border-radius:9px;background:#0e1014;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0, 0, 0, .35), 0 2px 6px rgba(0, 0, 0, .2);transition:background .2s, transform .15s, box-shadow .2s;cursor:pointer;}
.portalx .social-icon svg{width:15px;height:15px;fill:#fff;}
.portalx .social-icon:hover{background:#000;transform:translateY(-2px);box-shadow:0 10px 26px rgba(0, 0, 0, .45), 0 3px 9px rgba(0, 0, 0, .3);}
/* right */
.portalx .footer-right{background:rgba(255, 255, 255, 0.05);-webkit-backdrop-filter:blur(28px) saturate(150%);backdrop-filter:blur(28px) saturate(150%);border:1px solid rgba(255, 255, 255, .13);border-radius:28px;padding:40px;overflow:visible;box-shadow:0 4px 20px rgba(0, 0, 0, .04);display:flex;flex-direction:column;justify-content:space-between;position:relative;}
.portalx .footer-lucky-graphic{position:absolute;top:-36px;right:40px;z-index:10;display:flex;flex-direction:column;align-items:flex-start;gap:6px;}
.portalx .lucky-cube{width:96px;height:96px;border-radius:22px;transform:rotate(-10deg);background:linear-gradient(135deg, #4fd9a6 0%, #16916a 55%, #0f7d59 100%);display:grid;place-items:center;box-shadow:inset 3px 3px 8px rgba(255, 255, 255, .35), inset -3px -3px 12px rgba(0, 0, 0, .18), 8px 14px 28px rgba(15, 125, 89, .35);}
.portalx .lucky-cube-mark{font-size:42px;font-weight:700;color:#fff;letter-spacing:-0.04em;transform:rotate(10deg);text-shadow:0 3px 6px rgba(0, 0, 0, .25);line-height:1;}
.portalx .lucky-text-row{display:flex;gap:6px;align-items:center;transform:rotate(-4deg);margin-top:4px;}
.portalx .lucky-arrow{width:22px;height:22px;color:#9ca3af;}
.portalx .lucky-arrow svg{width:100%;height:100%;}
.portalx .lucky-arrow path{stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.portalx .lucky-text{font-family:'Caveat', cursive;font-size:20px;font-weight:600;color:#9ca3af;white-space:nowrap;}
.portalx .footer-right-top{padding-top:8px;}
.portalx .footer-nav-cols{display:flex;gap:72px;}
.portalx .footer-col-title{font-family:'Caveat', cursive;font-size:24px;font-weight:600;font-style:italic;color:rgba(255, 255, 255, .5);margin-bottom:18px;}
.portalx .footer-col a{display:block;font-size:14px;font-weight:600;color:rgba(255, 255, 255, .86);margin-bottom:14px;transition:color .2s;}
.portalx .footer-col a:hover{color:#1f9e74;}
.portalx .footer-bottom{display:flex;align-items:flex-end;justify-content:space-between;margin-top:48px;gap:24px;flex-wrap:wrap;}
.portalx .footer-copyright{font-size:12.5px;font-weight:500;color:rgba(255, 255, 255, .5);}
.portalx .footer-cta-mini{display:flex;flex-direction:column;gap:14px;}
.portalx .footer-cta-mini h4{font-size:15px;font-weight:400;color:rgba(255, 255, 255, .6);line-height:1.45;}
.portalx .footer-cta-mini h4 strong{display:block;font-size:19px;font-weight:700;color:#fff;}
.portalx .footer-subscribe-row{display:flex;width:310px;max-width:100%;background:rgba(255, 255, 255, .07);border:1px solid rgba(255, 255, 255, .16);border-radius:12px;padding:5px;box-shadow:0 2px 10px rgba(0, 0, 0, .04);}
.portalx .footer-subscribe-row input{flex:1;min-width:0;padding:11px 14px;background:transparent;border:none;outline:none;font-family:'DM Sans', sans-serif;font-size:13.5px;color:#fff;}
.portalx .footer-subscribe-row input::placeholder{color:#9ca3af;}
.portalx .footer-subscribe-row button{padding:11px 22px;background:#111214;color:#fff;font-family:'DM Sans', sans-serif;font-size:13.5px;font-weight:600;border:none;border-radius:8px;cursor:pointer;box-shadow:0 6px 20px rgba(0, 0, 0, .28), 0 2px 8px rgba(0, 0, 0, .15);transition:background .2s, box-shadow .2s, transform .15s;white-space:nowrap;}
.portalx .footer-subscribe-row button:hover{background:#000;transform:translateY(-1px);box-shadow:0 10px 28px rgba(0, 0, 0, .36);}
/* watermark */
.portalx .footer-watermark{max-width:1150px;margin:-60px auto 0;pointer-events:none;user-select:none;position:relative;z-index:0;line-height:0;}
.portalx .footer-watermark svg{display:block;width:100%;height:auto;overflow:visible;}
.portalx .footer-watermark text{font-family:'DM Sans', sans-serif;font-weight:700;letter-spacing:-0.03em;fill:rgba(255, 255, 255, .06);}
@media(max-width:860px){.portalx .footer-wrapper{grid-template-columns:1fr;}.portalx .footer-left{min-height:auto;gap:40px;}}
@media(max-width:560px){.portalx .footer-right{padding:24px;}.portalx .footer-nav-cols{gap:40px;}.portalx .footer-bottom{flex-direction:column;align-items:flex-start;gap:24px;}.portalx .footer-subscribe-row{width:100%;}.portalx .footer-lucky-graphic{right:12px;top:-28px;}.portalx .lucky-cube{width:72px;height:72px;}.portalx .lucky-cube-mark{font-size:32px;}}

/* ===== route-transition overlay ===== */
.portalx #pgxn{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;background:rgba(10, 16, 13, .22);-webkit-backdrop-filter:blur(2px) saturate(120%);backdrop-filter:blur(2px) saturate(120%);transition:opacity .42s cubic-bezier(.4, 0, .2, 1), backdrop-filter .42s cubic-bezier(.4, 0, .2, 1), -webkit-backdrop-filter .42s cubic-bezier(.4, 0, .2, 1);}
.portalx #pgxn.show{opacity:1;-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);}
.portalx #pgxn.cover{pointer-events:auto;}
.portalx .pgx-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 46px 28px;border-radius:28px;background:linear-gradient(150deg, rgba(13, 46, 34, .64), rgba(7, 22, 16, .56));-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);border:1px solid rgba(255, 255, 255, .24);box-shadow:0 30px 90px -32px rgba(0, 30, 18, .6), inset 0 1px 0 rgba(255, 255, 255, .35);transform:scale(.9) translateY(8px);opacity:0;transition:transform .5s cubic-bezier(.22, 1, .36, 1), opacity .4s;}
.portalx #pgxn.show .pgx-card{transform:none;opacity:1;}
.portalx .pgx-svg{width:96px;height:96px;display:block;filter:drop-shadow(0 6px 18px rgba(22, 145, 106, .35));}
.portalx .pgx-ring{transform-box:fill-box;transform-origin:center;animation:portal-pgrot 7s linear infinite;}
.portalx .pgx-ring2{transform-box:fill-box;transform-origin:center;animation:portal-pgrot 5s linear infinite reverse;}
.portalx .pgx-orbit{transform-box:fill-box;transform-origin:center;animation:portal-pgrot 3.4s linear infinite;}
.portalx .pgx-core{transform-box:fill-box;transform-origin:center;animation:portal-pgpulse 1.8s ease-in-out infinite;}
.portalx .pgx-scan{animation:portal-pgscan 1.7s cubic-bezier(.5, 0, .5, 1) infinite;}
.portalx .pgx-spark{animation:portal-pgspark 1.8s ease-in-out infinite;}
@keyframes portal-pgrot{to{transform:rotate(360deg);}}
@keyframes portal-pgpulse{0%, 100%{transform:scale(1);}50%{transform:scale(1.06);}}
@keyframes portal-pgscan{0%{transform:translateY(0);opacity:0;}15%{opacity:.95;}85%{opacity:.95;}100%{transform:translateY(34px);opacity:0;}}
@keyframes portal-pgspark{0%, 100%{opacity:.2;}50%{opacity:.9;}}
.portalx .pgx-label{font-family:inherit;font-size:14px;font-weight:600;color:#eafff5;letter-spacing:.01em;text-shadow:0 1px 8px rgba(0, 20, 12, .5);}
.portalx .pgx-dots::after{content:"";animation:portal-pgdots 1.4s steps(4, end) infinite;}
@keyframes portal-pgdots{0%{content:"";}25%{content:"\\2009.";}50%{content:"\\2009..";}75%{content:"\\2009...";}}
.portalx .pgx-sub{font-family:inherit;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(234, 255, 245, .55);}
@media(prefers-reduced-motion:reduce){.portalx #pgxn{transition:opacity .14s;}.portalx .pgx-ring, .portalx .pgx-ring2, .portalx .pgx-orbit, .portalx .pgx-core, .portalx .pgx-scan, .portalx .pgx-spark{animation:none;}.portalx .pgx-card{transition:none;}}

/* ===== footer glass unify (overrides) ===== */
.portalx .footer-right, .portalx .fr{background:linear-gradient(155deg, rgba(255, 255, 255, .09), rgba(255, 255, 255, .03))!important;-webkit-backdrop-filter:blur(30px) saturate(170%)!important;backdrop-filter:blur(30px) saturate(170%)!important;border:1px solid rgba(255, 255, 255, .16)!important;box-shadow:0 28px 80px -34px rgba(0, 0, 0, .7), inset 0 1px 0 rgba(255, 255, 255, .22)!important;}
.portalx .footer-subscribe-row, .portalx .fsub{background:rgba(255, 255, 255, .1)!important;border:1px solid rgba(255, 255, 255, .2)!important;}
.portalx .footer-subscribe-row button, .portalx .fsub button{background:linear-gradient(180deg, #4fd9a6, #0f7d59)!important;color:#06160e!important;}
.portalx .footer-col a, .portalx .fcol a{color:rgba(255, 255, 255, .86)!important;}
.portalx .footer-col a:hover, .portalx .fcol a:hover{color:#5fe3b8!important;}
.portalx .footer-col-title, .portalx .fcol h4{color:rgba(255, 255, 255, .5)!important;}
.portalx .footer-copyright, .portalx .fcopy{color:rgba(255, 255, 255, .55)!important;}
.portalx .footer-copyright a, .portalx .fcopy a{color:rgba(255, 255, 255, .7)!important;}
.portalx .footer-cta-mini h4, .portalx .fcta h4{color:rgba(255, 255, 255, .6)!important;}
.portalx .footer-cta-mini h4 strong, .portalx .fcta h4 strong{color:#fff!important;}
.portalx .footer-subscribe-row, .portalx .fsub{background:rgba(255, 255, 255, .08)!important;border:1px solid rgba(255, 255, 255, .18)!important;}
.portalx .footer-subscribe-row input, .portalx .fsub input{color:#fff!important;}
.portalx .footer-subscribe-row input::placeholder, .portalx .fsub input::placeholder{color:rgba(255, 255, 255, .5)!important;}
.portalx .footer-watermark text{fill:rgba(255, 255, 255, .05)!important;}
.portalx .lucky .lt span, .portalx .lucky-text{color:rgba(255, 255, 255, .5)!important;}

/* ===== fsub-fix ===== */
.portalx .fsub, .portalx .footer-subscribe-row{align-items:center;gap:6px;flex-wrap:nowrap;}
.portalx .fsub button, .portalx .footer-subscribe-row button{flex-shrink:0;white-space:nowrap;}
.portalx .fsub input, .portalx .footer-subscribe-row input{min-width:0;}
@media(max-width:420px){.portalx .fsub, .portalx .footer-subscribe-row{flex-wrap:wrap;}.portalx .fsub button, .portalx .footer-subscribe-row button{width:100%;}}
`;

export default function JobsPage() {
  // bg video fade-in (replaces the #bgv loadeddata script)
  const vid = useRef<HTMLVideoElement>(null);
  const [vidIn, setVidIn] = useState(false);
  const go = () => setVidIn(true);
  function onLoaded() {
    const v = vid.current;
    if (!v) { go(); return; }
    const p = v.play();
    if (p && (p as Promise<void>).then) (p as Promise<void>).then(go).catch(go);
    else go();
  }

  // subscribe button state (replaces the #subBtn onclick script)
  const [email, setEmail] = useState("");
  const [subLabel, setSubLabel] = useState("Subscribe");
  const [subErr, setSubErr] = useState(false);
  const subTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function onSubscribe() {
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setSubLabel("Subscribed ✓");
      setEmail("");
      setSubErr(false);
      if (subTimer.current) clearTimeout(subTimer.current);
      subTimer.current = setTimeout(() => setSubLabel("Subscribe"), 1800);
    } else {
      setSubErr(true);
      if (subTimer.current) clearTimeout(subTimer.current);
      subTimer.current = setTimeout(() => setSubErr(false), 1200);
    }
  }
  useEffect(() => () => { if (subTimer.current) clearTimeout(subTimer.current); }, []);

  // watermark fit (replaces the fitWatermark script)
  const wmSvg = useRef<SVGSVGElement>(null);
  const wmText = useRef<SVGTextElement>(null);
  useEffect(() => {
    function fit() {
      const svg = wmSvg.current, text = wmText.current;
      if (!svg || !text) return;
      try {
        const b = text.getBBox();
        svg.setAttribute("viewBox", `${b.x} ${b.y} ${b.width} ${b.height}`);
      } catch { /* getBBox can throw before layout */ }
    }
    const anyDoc = document as Document & { fonts?: { ready?: Promise<unknown> } };
    if (anyDoc.fonts && anyDoc.fonts.ready) anyDoc.fonts.ready.then(fit);
    else window.addEventListener("load", fit);
    window.addEventListener("resize", fit);
    const t = setTimeout(fit, 400);
    return () => { window.removeEventListener("resize", fit); window.removeEventListener("load", fit); clearTimeout(t); };
  }, []);

  // route-transition overlay (replaces the #pgxn enter-animation; starts shown,
  // then settles on the next frame, matching the original)
  const [overlayShow, setOverlayShow] = useState(true);
  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setOverlayShow(false));
    });
    return () => { cancelAnimationFrame(r1); if (r2) cancelAnimationFrame(r2); };
  }, []);

  // real jobs, best-effort with graceful fallback to the design's cards
  const [jobs, setJobs] = useState<PortalJob[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchJobs();
        if (!cancelled && rows.length > 0) setJobs(rows);
      } catch { /* keep the static fallback cards */ }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="portalx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="aurora" aria-hidden="true"><i className="a" /><i className="b" /></div>
      <video
        id="bgv"
        ref={vid}
        className={vidIn ? "in" : undefined}
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onLoadedData={onLoaded}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4"
      />
      <div className="veil" aria-hidden="true" />

      <main>
        <div className="wrap">
          <nav>
            <a className="brand" href="/welcome"><img src="/assets/logo-dark.png" alt="TalentFlow ATS" style={{ height: 30, width: "auto", display: "block" }} /></a>
            <div className="nlinks">
              <a href="#roles">Open roles</a><a href="#about">Life here</a><a href="#about">Benefits</a><a href="/transparency">FAQ</a>
            </div>
            <a href="/status"><button className="btn btn-glass liquid-glass">Your applications</button></a>
          </nav>

          <section className="hero">
            <span className="eyebrow liquid-glass"><span className="dot" /> 24 open roles · hiring now</span>
            <h1>Build what's <em>next</em> at Northwind.</h1>
            <p>Join a team reshaping how the world hires. Every application is reviewed with care, scored transparently, and decided by a human, never an algorithm alone.</p>
            <div className="search liquid-glass">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8" /></svg>
              <input placeholder="Search roles, teams, or locations…" />
              <button className="btn btn-em">Search</button>
            </div>
            <div className="chips">
              <span className="chip liquid-glass">Engineering</span><span className="chip liquid-glass">Design</span><span className="chip liquid-glass">Remote</span><span className="chip liquid-glass">Austin, TX</span>
            </div>
            <div className="ai-note liquid-glass">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" /><path d="M9 12l2 2 4-4" /></svg>
              AI is assistive here. A human always makes the final call, and you can ask how your application was reviewed.
            </div>

            <div className="roles" id="roles">
              {jobs && jobs.length > 0
                ? jobs.map((j) => (
                    <a className="role liquid-glass" key={j.id} href={`/jobs/${j.id}/apply`}>
                      <span className="meta up">{[j.department, j.location].filter(Boolean).join(" · ")}</span>
                      <span className="rt">{j.title}</span>
                      <div className="tags"><span className="tag">Full-time</span></div>
                      <span className="apply">Apply <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                  ))
                : FALLBACK_ROLES.map((r) => (
                    <a className="role liquid-glass" key={r.title} href="/status">
                      <span className="meta up">{r.meta}</span>
                      <span className="rt">{r.title}</span>
                      <div className="tags">{r.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                      <span className="apply">Apply <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                    </a>
                  ))}
            </div>
          </section>

          {/* liquid-glass footer */}
          <footer className="liquid-glass">
            <div className="f-top">
              <div>
                <div className="f-brand">
                  <svg viewBox="0 0 32 32" fill="none"><rect x="1" y="1" width="30" height="30" rx="9" fill="var(--br)" /><path d="M8.5 23.5L16 7l7.5 16.5" stroke="#05120c" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 16.5h8" stroke="#05120c" strokeWidth="2.8" strokeLinecap="round" /><circle cx="16" cy="6.2" r="2.2" fill="#9b8cff" /></svg>
                  <span className="nm">TalentFlow</span>
                </div>
                <p className="f-desc">The applicant-tracking platform behind Northwind's hiring. Evidence-backed screening, human-in-the-loop decisions, and transparency for every candidate.</p>
              </div>
              <div className="f-links">
                <div className="f-col"><h4 className="up">For candidates</h4><a href="#roles">Browse roles</a><a href="/status">Check status</a><a href="/transparency">How we use AI</a><a href="/contact">Request a review</a><a href="/transparency">Accessibility</a></div>
                <div className="f-col"><h4 className="up">Company</h4><a href="/welcome">Our story</a><a href="/welcome">Life at Northwind</a><a href="/welcome">Newsroom</a><a href="/welcome">Benefits</a></div>
                <div className="f-col"><h4 className="up">Help</h4><a href="/contact">Get in touch</a><a href="/transparency">Privacy</a><a href="/transparency">Candidate terms</a><a href="/contact">Report a concern</a></div>
              </div>
            </div>
            <div className="f-bottom">
              <p className="by up">Powered by TalentFlow · AI is advisory, a human decides</p>
              <div className="f-social">
                <span className="lbl up">Follow Northwind:</span>
                <a href="/welcome" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 17v-7" /></svg></a>
                <a href="/welcome" aria-label="X"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2.25h3.31l-7.23 8.26L23 21.75h-6.66l-5.21-6.82-5.97 6.82H1.85l7.73-8.84L1 2.25h6.83l4.71 6.23 5.7-6.23z" /></svg></a>
                <a href="/welcome" aria-label="YouTube"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="4" /><path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" /></svg></a>
                <a href="/welcome" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5v.01" /></svg></a>
                <a href="/welcome" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8h2.5V4.5H14a4 4 0 0 0-4 4V11H7.5v3.5H10V21h3.5v-6.5H16L16.5 11H13.5V8.5A.5.5 0 0 1 14 8z" /></svg></a>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* secondary footer (DM Sans) */}
      <section className="footer-section">
        <div className="footer-wrapper">
          <div className="footer-left">
            <video className="footer-left-video" autoPlay muted loop playsInline preload="auto"><source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4" type="video/mp4" /></video>
            <div className="footer-logo">
              <img src="/assets/logo-dark.png" alt="TalentFlow ATS" style={{ height: 26, width: "auto", display: "block" }} />
            </div>
            <div className="footer-tagline-container">
              <div className="footer-tagline">Smarter hiring, <br /><span>powered by AI you can trust.</span></div>
            </div>
            <div className="footer-social-row">
              <span className="footer-social-label">Stay in touch!</span>
              <div className="footer-social-icons">
                <div className="social-icon" title="LinkedIn"><svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4z" /></svg></div>
                <div className="social-icon" title="X"><svg viewBox="0 0 24 24"><path d="M18.24 2.25h3.31l-7.23 8.26L23 21.75h-6.66l-5.21-6.82-5.97 6.82H1.85l7.73-8.84L1 2.25h6.83l4.71 6.23 5.7-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" /></svg></div>
                <div className="social-icon" title="YouTube"><svg viewBox="0 0 24 24"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.5zM9.75 15.02V8.98L15.5 12z" /></svg></div>
                <div className="social-icon" title="GitHub"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85l-.01 2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg></div>
              </div>
            </div>
          </div>
          <div className="footer-right">
            <div className="footer-lucky-graphic">
              <div className="lucky-cube"><span className="lucky-cube-mark">A</span></div>
              <div className="lucky-text-row">
                <span className="lucky-arrow"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 20 C 6 14, 10 9, 18 5" /><path d="M18 5 L 12 5" /><path d="M18 5 L 18 11" /></svg></span>
                <span className="lucky-text">New here?</span>
              </div>
            </div>
            <div className="footer-right-top">
              <div className="footer-nav-cols">
                <div className="footer-col">
                  <div className="footer-col-title">Product</div>
                  <a href="/welcome">How it works</a><a href="/agents">AI Agents</a><a href="/pricing">Pricing</a><a href="/welcome">Customers</a><a href="/transparency">Help &amp; FAQ</a>
                </div>
                <div className="footer-col">
                  <div className="footer-col-title">Company</div>
                  <a href="/jobs">Careers</a><a href="/welcome">About</a><a href="/transparency">Terms &amp; Conditions</a><a href="/transparency">Privacy Policy</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-copyright">© 2026 TalentFlow. All rights reserved.<br /><span style={{ opacity: .9, display: "inline-flex", gap: "7px", flexWrap: "wrap", marginTop: "6px" }}><span>SOC 2 Type II</span> · <span>GDPR</span> · <span>EEOC-ready</span> · <a href="#" style={{ color: "#9ca3af", textDecoration: "underline" }}>System status</a></span></div>
              <div className="footer-cta-mini">
                <h4>AI moves fast.<br /><strong>Hire ahead with TalentFlow.</strong></h4>
                <div className="footer-subscribe-row" style={subErr ? { boxShadow: "0 0 0 2px #ef6b5e" } : undefined}>
                  <input type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button type="button" id="subBtn" onClick={onSubscribe}>{subLabel}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-watermark" aria-hidden="true">
          <svg ref={wmSvg} id="watermarkSvg" viewBox="62 95 876 175" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <text ref={wmText} id="watermarkText" x="500" y="240" textAnchor="middle" fontSize="320">TalentFlow</text>
          </svg>
        </div>
      </section>

      {/* route-transition overlay */}
      <div id="pgxn" className={overlayShow ? "show" : undefined} aria-hidden="true">
        <div className="pgx-card">
          <svg className="pgx-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <defs><linearGradient id="pgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5fe3b8" /><stop offset="1" stopColor="#16916a" /></linearGradient></defs>
            <circle className="pgx-ring" cx="60" cy="60" r="50" stroke="url(#pgg)" strokeWidth="1.6" strokeDasharray="4 9" opacity=".55" />
            <circle className="pgx-ring2" cx="60" cy="60" r="40" stroke="#7c5cff" strokeWidth="1.2" strokeDasharray="2 7" opacity=".4" />
            <g className="pgx-orbit"><circle cx="60" cy="10" r="4.2" fill="#5fe3b8" /><circle className="pgx-n2" cx="103" cy="78" r="3.6" fill="#7c5cff" /><circle className="pgx-n3" cx="17" cy="78" r="3.6" fill="#5fe3b8" /></g>
            <rect className="pgx-core" x="38" y="38" width="44" height="44" rx="13" fill="url(#pgg)" />
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
