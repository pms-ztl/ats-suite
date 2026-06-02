"use client";
// app/(candidate-portal)/profile/page.tsx
// VERBATIM port of claude-design/Candidate Profile.html, the candidate's own
// account space: cinematic Mux/HLS video hero with the floating glass "gcard"
// AI-match score overlay, gradient eyebrow + big welcome headline, nav tabs,
// the application stage tracker (Applied -> Screening -> Interview -> Offer ->
// Decision), upcoming interviews, resume file, the offer banner, and the
// assistive-AI transparency note. This route is full-bleed (CandidateLayout
// renders /profile bare), so the WHOLE page is ported here.
//
// Method matches app/(auth)/login/page.tsx: the prototype's entire <style> is
// copied verbatim into `const CSS`, scoped under `.cprofx`, every @keyframes
// renamed with a `cprofx-` prefix; the entire <body> is copied element-for-
// element as JSX; the <script> behavior (theme toggle, list rendering, HLS
// video, smooth-scroll, entrance settle, the "Routing securely" overlay) is
// reproduced with useState/useEffect/useRef.
//
// DATA WIRING: this is the candidate's own profile. When a logged-in CANDIDATE
// exists we fill their first name where the prototype hardcodes "Priya";
// otherwise the prototype's example values stand (this is a candidate-facing
// demo surface). Layout and copy are unchanged.
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

const CSS = `
.cprofx{
  --font-sans:"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;--font-mono:"Geist Mono", ui-monospace, monospace;
  --fs-xs:12px;--fs-sm:13px;--fs-base:15px;--fs-md:16px;--fs-lg:18px;--fs-xl:22px;--fs-2xl:28px;--fs-3xl:38px;
  --r-sm:9px;--r:13px;--r-lg:17px;--r-xl:22px;--r-2xl:30px;--r-pill:999px;
  --ease-out:cubic-bezier(.22, 1, .36, 1);--ease-spring:cubic-bezier(.34, 1.4, .5, 1);--t:.24s;
  --brand:oklch(0.585 0.122 162);--brand-2:oklch(0.515 0.118 162);--brand-ink:oklch(0.40 0.10 162);--brand-tint:oklch(0.955 0.028 162);--brand-tint-2:oklch(0.925 0.05 162);--on-brand:oklch(0.99 0.01 162);
  --ai:oklch(0.555 0.185 292);--ai-ink:oklch(0.44 0.16 292);--ai-tint:oklch(0.955 0.03 292);--ai-tint-2:oklch(0.92 0.05 292);
  --ok:oklch(0.60 0.13 152);--ok-tint:oklch(0.95 0.04 152);--warn:oklch(0.69 0.135 73);--warn-tint:oklch(0.955 0.05 80);--info:oklch(0.585 0.13 245);--info-tint:oklch(0.95 0.04 245);
  --bg:oklch(0.985 0.008 76);--bg-2:oklch(0.972 0.012 76);--surface:oklch(0.998 0.004 76);--surface-2:oklch(0.972 0.009 76);--surface-3:oklch(0.95 0.012 76);
  --ink:oklch(0.27 0.018 70);--ink-2:oklch(0.46 0.014 70);--ink-3:oklch(0.60 0.012 70);--line:oklch(0.91 0.012 76);--line-2:oklch(0.86 0.014 76);--line-strong:oklch(0.80 0.016 76);
  --e1:0 1px 2px oklch(0.5 0.05 70/.06), 0 1px 1px oklch(0.5 0.05 70/.04);--e2:0 8px 20px -8px oklch(0.45 0.06 70/.14), 0 3px 8px -4px oklch(0.45 0.06 70/.08);--e3:0 26px 54px -18px oklch(0.4 0.07 70/.24);--ring:0 0 0 3px oklch(0.585 0.122 162/.25);
  font-family:var(--font-sans);font-size:var(--fs-base);line-height:1.55;color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased;min-height:100vh;
}
.cprofx[data-theme="dark"]{
  --brand:oklch(0.78 0.13 162);--brand-2:oklch(0.84 0.13 162);--brand-ink:oklch(0.86 0.10 162);--brand-tint:oklch(0.32 0.05 162);--brand-tint-2:oklch(0.38 0.07 162);--on-brand:oklch(0.18 0.04 162);
  --ai:oklch(0.72 0.155 292);--ai-ink:oklch(0.83 0.12 292);--ai-tint:oklch(0.32 0.07 292);--ai-tint-2:oklch(0.38 0.09 292);
  --ok:oklch(0.75 0.14 152);--ok-tint:oklch(0.32 0.06 152);--warn:oklch(0.81 0.135 80);--warn-tint:oklch(0.34 0.06 80);--info:oklch(0.72 0.12 245);--info-tint:oklch(0.32 0.06 245);
  --bg:oklch(0.20 0.012 70);--bg-2:oklch(0.17 0.012 70);--surface:oklch(0.245 0.014 70);--surface-2:oklch(0.28 0.014 70);--surface-3:oklch(0.32 0.015 70);
  --ink:oklch(0.96 0.006 76);--ink-2:oklch(0.76 0.012 76);--ink-3:oklch(0.62 0.013 76);--line:oklch(0.34 0.014 70);--line-2:oklch(0.40 0.015 70);--line-strong:oklch(0.48 0.016 70);
  --e1:0 1px 2px oklch(0 0 0/.4);--e2:0 8px 20px -8px oklch(0 0 0/.6);--e3:0 26px 54px -18px oklch(0 0 0/.7);
}
.cprofx *{box-sizing:border-box;}.cprofx{margin:0;}
.cprofx .mono{font-family:var(--font-mono);font-feature-settings:"tnum" 1;letter-spacing:-0.01em;}.cprofx a{color:inherit;text-decoration:none;}.cprofx h1, .cprofx h2, .cprofx h3, .cprofx p{margin:0;}
.cprofx button{font-family:inherit;}.cprofx ::selection{background:var(--brand-tint-2);}
.cprofx ::-webkit-scrollbar{width:11px;}.cprofx ::-webkit-scrollbar-thumb{background:var(--line-2);border-radius:99px;border:3px solid transparent;background-clip:content-box;}
.cprofx .aurora{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;}.cprofx .aurora i{position:absolute;display:block;border-radius:50%;filter:blur(75px);}
.cprofx .aurora .b1{width:44vw;height:44vw;left:-8vw;top:-14vw;background:radial-gradient(circle, var(--brand) 0%, transparent 68%);opacity:.16;animation:cprofx-drift1 28s var(--ease-out) infinite alternate;}
.cprofx .aurora .b2{width:38vw;height:38vw;right:-10vw;top:-6vw;background:radial-gradient(circle, oklch(0.8 0.1 76) 0%, transparent 66%);opacity:.26;animation:cprofx-drift2 32s var(--ease-out) infinite alternate;}
.cprofx[data-theme="dark"] .aurora .b2{background:radial-gradient(circle, var(--ai) 0%, transparent 66%);opacity:.16;}
@keyframes cprofx-drift1{to{transform:translate(6vw, 5vw) scale(1.12);}}@keyframes cprofx-drift2{to{transform:translate(-5vw, 7vw) scale(1.08);}}
.cprofx .grain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.4;mix-blend-mode:soft-light;background-image:url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
.cprofx[data-theme="dark"] .grain{opacity:.25;}
.cprofx .clay{background:linear-gradient(180deg, color-mix(in oklab, var(--surface) 96%, white), var(--surface));border:1px solid var(--line);box-shadow:var(--e2), inset 0 1px 0 oklch(1 0 0/.6);}
.cprofx[data-theme="dark"] .clay{background:linear-gradient(180deg, var(--surface-2), var(--surface));box-shadow:var(--e2), inset 0 1px 0 oklch(1 0 0/.05);}
.cprofx .page{position:relative;z-index:2;max-width:1000px;margin:0 auto;padding:0 22px 70px;}
.cprofx .scene{animation:cprofx-rise .45s var(--ease-out) both;}@keyframes cprofx-rise{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
/* header */
.cprofx .top{display:flex;align-items:center;gap:14px;padding:20px 0;}
.cprofx .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:17px;letter-spacing:-0.02em;}
.cprofx .tbtn{width:38px;height:38px;border-radius:var(--r-pill);border:1px solid var(--line);background:var(--surface);color:var(--ink-2);display:grid;place-items:center;cursor:pointer;}
.cprofx .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 18px;border-radius:var(--r-pill);font-weight:600;font-size:14px;font-family:var(--font-sans);cursor:pointer;border:1px solid transparent;transition:all .18s var(--ease-out);}
.cprofx .btn-primary{background:var(--brand);color:var(--on-brand);box-shadow:var(--e1);}.cprofx .btn-primary:hover{box-shadow:var(--e2);}
.cprofx .btn-soft{background:var(--surface);color:var(--ink);border-color:var(--line-2);}.cprofx .btn-soft:hover{border-color:var(--line-strong);}
.cprofx .btn-sm{padding:8px 14px;font-size:13px;}
.cprofx .chip{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:var(--r-pill);font-size:12px;font-weight:700;}
.cprofx .chip-brand{background:var(--brand-tint);color:var(--brand-ink);}.cprofx .chip-ai{background:var(--ai-tint);color:var(--ai-ink);}.cprofx .chip-ok{background:var(--ok-tint);color:var(--ok);}.cprofx .chip-warn{background:var(--warn-tint);color:var(--warn);}.cprofx .chip-info{background:var(--info-tint);color:var(--info);}
/* hero */
.cprofx .hero{border-radius:var(--r-2xl);padding:26px 28px;display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:20px;}
.cprofx .hero .av{width:68px;height:68px;border-radius:20px;background:linear-gradient(135deg, var(--brand), var(--ai));color:white;display:grid;place-items:center;font-weight:800;font-size:24px;flex-shrink:0;}
.cprofx .hero h1{font-size:var(--fs-2xl);font-weight:800;letter-spacing:-0.03em;}
.cprofx .hero .meta{font-size:var(--fs-sm);color:var(--ink-2);margin-top:4px;display:flex;gap:14px;flex-wrap:wrap;}
.cprofx .hero .meta span{display:inline-flex;gap:6px;align-items:center;}
.cprofx .grid{display:grid;grid-template-columns:1.6fr 1fr;gap:18px;align-items:start;}@media(max-width:820px){.cprofx .grid{grid-template-columns:1fr;}}
.cprofx .card{border-radius:var(--r-xl);border:1px solid var(--line);background:var(--surface);box-shadow:var(--e1);overflow:hidden;margin-bottom:18px;}
.cprofx .card-h{display:flex;align-items:center;justify-content:space-between;padding:15px 20px;border-bottom:1px solid var(--line);}
.cprofx .card-h .t{font-weight:700;font-size:var(--fs-md);display:inline-flex;gap:9px;align-items:center;}
.cprofx .card-h a{font-size:13px;color:var(--brand);font-weight:600;}
.cprofx .card-b{padding:18px 20px;}
/* application history with stage tracker */
.cprofx .appli{padding:16px 0;border-top:1px solid var(--line);}.cprofx .appli:first-child{border-top:none;}
.cprofx .appli .row1{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
.cprofx .appli .jt{font-weight:700;font-size:var(--fs-md);}.cprofx .appli .jm{font-size:12.5px;color:var(--ink-3);margin-top:2px;}
.cprofx .track{display:flex;align-items:center;margin-top:16px;}
.cprofx .track .st{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;position:relative;}
.cprofx .track .dot{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:11px;background:var(--surface-3);color:var(--ink-3);border:1px solid var(--line);z-index:2;}
.cprofx .track .st.done .dot{background:var(--brand);color:var(--on-brand);border-color:var(--brand);}
.cprofx .track .st.cur .dot{background:var(--brand-tint);color:var(--brand-ink);border:1px solid var(--brand);box-shadow:0 0 0 4px var(--brand-tint-2);}
.cprofx .track .lbl{font-size:10.5px;font-weight:600;color:var(--ink-3);white-space:nowrap;}
.cprofx .track .st.done .lbl, .cprofx .track .st.cur .lbl{color:var(--ink);}
.cprofx .track .bar{position:absolute;top:12px;left:50%;width:100%;height:2px;background:var(--line);z-index:1;}
.cprofx .track .st.done .bar{background:var(--brand);}
/* resume drop */
.cprofx .resume{display:flex;gap:13px;align-items:center;padding:14px;border-radius:var(--r-lg);border:1px solid var(--line);background:var(--surface-2);}
.cprofx .resume .fi{width:42px;height:42px;border-radius:11px;background:var(--brand-tint);color:var(--brand);display:grid;place-items:center;flex-shrink:0;}
/* schedule + offer */
.cprofx .li{display:flex;gap:12px;align-items:center;padding:12px 0;border-top:1px solid var(--line);}.cprofx .li:first-child{border-top:none;}
.cprofx .li .ic{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;flex-shrink:0;}.cprofx .li .tx{flex:1;min-width:0;}.cprofx .li .tt{font-size:13.5px;font-weight:600;}.cprofx .li .td{font-size:12px;color:var(--ink-3);margin-top:1px;}
.cprofx .offer-banner{border-radius:var(--r-lg);padding:16px;background:linear-gradient(135deg, var(--brand-tint), transparent 70%);border:1px solid color-mix(in oklab, var(--brand) 24%, transparent);}
.cprofx .kv{display:flex;justify-content:space-between;padding:7px 0;border-top:1px solid var(--line);font-size:13px;}.cprofx .kv:first-child{border-top:none;}.cprofx .kv b{font-weight:700;}
.cprofx .navtabs{display:flex;gap:5px;margin-bottom:18px;flex-wrap:wrap;}
.cprofx .navtabs a{padding:8px 15px;border-radius:var(--r-pill);font-size:13.5px;font-weight:600;color:var(--ink-2);background:var(--surface);border:1px solid var(--line);}
.cprofx .navtabs a.on{background:var(--brand-tint);color:var(--brand-ink);border-color:transparent;}
.cprofx .ai-note{display:flex;gap:10px;align-items:flex-start;padding:13px 15px;border-radius:var(--r-lg);background:var(--ai-tint);border:1px solid color-mix(in oklab, var(--ai) 20%, transparent);}
.cprofx .ai-note .x{color:var(--ai);flex-shrink:0;margin-top:1px;}.cprofx .ai-note p{font-size:12.5px;color:var(--ink-2);line-height:1.5;}.cprofx .ai-note b{color:var(--ai-ink);}
@media(prefers-reduced-motion:reduce){.cprofx .aurora i{animation:none!important;}.cprofx .scene{animation:none!important;}}

/* ===== cinematic candidate hero (CodeNest-style, tuned to ATS) ===== */
.cprofx .phero{position:relative;border-radius:var(--r-2xl);overflow:hidden;margin-bottom:20px;min-height:clamp(440px, 56vh, 580px);display:flex;align-items:flex-end;isolation:isolate;background:#070b0a;border:1px solid var(--line);box-shadow:var(--e2);}
.cprofx .phero video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.6;z-index:0;}
.cprofx .phero .glow{position:absolute;top:-8%;left:50%;transform:translateX(-50%);width:78%;height:46%;z-index:0;pointer-events:none;}
.cprofx .phero .vlines{position:absolute;inset:0;z-index:1;pointer-events:none;}
.cprofx .phero .vlines i{position:absolute;top:0;bottom:0;width:1px;background:rgba(255, 255, 255, .08);}
.cprofx .phero .vlines i:nth-child(1){left:25%;}.cprofx .phero .vlines i:nth-child(2){left:50%;}.cprofx .phero .vlines i:nth-child(3){left:75%;}
@media(max-width:680px){.cprofx .phero .vlines{display:none;}}
.cprofx .phero .ov{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg, #070b0a 0%, rgba(7, 11, 10, .45) 44%, transparent 74%), linear-gradient(0deg, #070b0a 3%, rgba(7, 11, 10, .2) 42%, transparent 72%);}
.cprofx .phero .inner{position:relative;z-index:3;padding:clamp(24px, 4vw, 42px);width:100%;animation:cprofx-rise .6s var(--ease-out) both;}
.cprofx .gcard{position:absolute;top:clamp(20px, 4vw, 34px);right:clamp(20px, 4vw, 40px);width:210px;border-radius:20px;padding:18px;z-index:3;background:rgba(255, 255, 255, 0.012);background-blend-mode:luminosity;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);box-shadow:inset 0 1px 1px rgba(255, 255, 255, .1);animation:cprofx-floaty 6s var(--ease-out) infinite;}
.cprofx .gcard::before{content:"";position:absolute;inset:0;border-radius:20px;padding:1.4px;background:linear-gradient(180deg, rgba(255, 255, 255, .5), rgba(255, 255, 255, .05) 42%, rgba(255, 255, 255, .05) 58%, rgba(255, 255, 255, .42));-webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
@keyframes cprofx-floaty{0%, 100%{transform:translateY(0);}50%{transform:translateY(-7px);}}
@media(max-width:760px){.cprofx .gcard{display:none;}}
.cprofx .gcard .gtag{font-family:'Plus Jakarta Sans', sans-serif;font-size:11px;letter-spacing:.18em;color:rgba(255, 255, 255, .6);}
.cprofx .gcard h4{font-family:'Inter', sans-serif;font-size:17px;font-weight:700;color:#fff;margin:9px 0 6px;line-height:1.22;}
.cprofx .gcard h4 em{font-family:'Instrument Serif', serif;font-style:italic;font-weight:400;color:#5ed29c;}
.cprofx .gcard .gp{font-size:11px;color:rgba(255, 255, 255, .55);line-height:1.5;}
.cprofx .gcard .score{display:flex;align-items:center;gap:10px;margin-top:13px;padding-top:12px;border-top:1px solid rgba(255, 255, 255, .12);}
.cprofx .gcard .score .rv{font-family:'Inter';font-weight:800;font-size:27px;color:#fff;letter-spacing:-.02em;}
.cprofx .gcard .score .rl{font-size:10.5px;color:rgba(255, 255, 255, .62);line-height:1.35;}
.cprofx .phero .eyebrow{font-family:'Plus Jakarta Sans', sans-serif;font-weight:700;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5ed29c;display:inline-flex;align-items:center;gap:8px;}
.cprofx .phero .eyebrow .d{width:6px;height:6px;border-radius:50%;background:#5ed29c;box-shadow:0 0 9px #5ed29c;animation:cprofx-bpulse 2.4s infinite;}
@keyframes cprofx-bpulse{0%, 100%{opacity:1;}50%{opacity:.4;}}
.cprofx .phero h1.big{font-family:'Inter', sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:-0.03em;line-height:.92;color:#fff;font-size:clamp(34px, 6.4vw, 64px);margin:16px 0 0;}
.cprofx .phero h1.big .gdot{color:#5ed29c;}
.cprofx .phero .lede2{font-family:'Inter', sans-serif;font-size:14px;color:rgba(255, 255, 255, .72);max-width:512px;line-height:1.6;margin:16px 0 0;}
.cprofx .phero .ctas{display:flex;gap:12px;margin-top:22px;flex-wrap:wrap;align-items:center;}
.cprofx .phero .cta-g{display:inline-flex;align-items:center;gap:9px;background:#5ed29c;color:#070b0a;font-family:'Inter';font-weight:700;text-transform:uppercase;font-size:13px;letter-spacing:.02em;border:none;border-radius:999px;padding:13px 22px;cursor:pointer;transition:transform .15s var(--ease-out), box-shadow .2s;}
.cprofx .phero .cta-g:hover{transform:translateY(-2px);box-shadow:0 14px 32px -10px rgba(94, 210, 156, .6);}
.cprofx .phero .cta-ghost{display:inline-flex;align-items:center;gap:8px;color:#fff;font-family:'Inter';font-weight:600;font-size:13px;border:1px solid rgba(255, 255, 255, .2);border-radius:999px;padding:12px 18px;transition:background .2s;}
.cprofx .phero .cta-ghost:hover{background:rgba(255, 255, 255, .08);}
.cprofx .phero .pmeta{display:flex;gap:16px;margin-top:18px;flex-wrap:wrap;font-size:12px;color:rgba(255, 255, 255, .5);}
.cprofx .phero .pmeta span{display:inline-flex;gap:6px;align-items:center;}
@media(prefers-reduced-motion:reduce){.cprofx .phero video{display:none;}.cprofx .gcard, .cprofx .phero .eyebrow .d{animation:none;}}

/* responsive overflow guard (added globally) */
.cprofx *, .cprofx *::before, .cprofx *::after{min-width:0;}
.cprofx{max-width:100%;overflow-x:hidden;}
.cprofx img, .cprofx svg, .cprofx video, .cprofx canvas{max-width:100%;}

.cprofx .brandlogo-d{display:none;}
.cprofx[data-theme="dark"] .brandlogo-l{display:none!important;}
.cprofx[data-theme="dark"] .brandlogo-d{display:block!important;}

/* "Routing securely" page-transition overlay */
.cprofx #pgxn{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;background:rgba(10, 16, 13, .22);-webkit-backdrop-filter:blur(2px) saturate(120%);backdrop-filter:blur(2px) saturate(120%);transition:opacity .42s cubic-bezier(.4, 0, .2, 1), backdrop-filter .42s cubic-bezier(.4, 0, .2, 1), -webkit-backdrop-filter .42s cubic-bezier(.4, 0, .2, 1);}.cprofx #pgxn.show{opacity:1;-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);}.cprofx #pgxn.cover{pointer-events:auto;}.cprofx .pgx-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 46px 28px;border-radius:28px;background:linear-gradient(150deg, rgba(13, 46, 34, .64), rgba(7, 22, 16, .56));-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);border:1px solid rgba(255, 255, 255, .24);box-shadow:0 30px 90px -32px rgba(0, 30, 18, .6), inset 0 1px 0 rgba(255, 255, 255, .35);transform:scale(.9) translateY(8px);opacity:0;transition:transform .5s cubic-bezier(.22, 1, .36, 1), opacity .4s;}.cprofx #pgxn.show .pgx-card{transform:none;opacity:1;}.cprofx .pgx-svg{width:96px;height:96px;display:block;filter:drop-shadow(0 6px 18px rgba(22, 145, 106, .35));}.cprofx .pgx-ring{transform-box:fill-box;transform-origin:center;animation:cprofx-pgrot 7s linear infinite;}.cprofx .pgx-ring2{transform-box:fill-box;transform-origin:center;animation:cprofx-pgrot 5s linear infinite reverse;}.cprofx .pgx-orbit{transform-box:fill-box;transform-origin:center;animation:cprofx-pgrot 3.4s linear infinite;}.cprofx .pgx-core{transform-box:fill-box;transform-origin:center;animation:cprofx-pgpulse 1.8s ease-in-out infinite;}.cprofx .pgx-scan{animation:cprofx-pgscan 1.7s cubic-bezier(.5, 0, .5, 1) infinite;}.cprofx .pgx-spark{animation:cprofx-pgspark 1.8s ease-in-out infinite;}@keyframes cprofx-pgrot{to{transform:rotate(360deg);}}@keyframes cprofx-pgpulse{0%, 100%{transform:scale(1);}50%{transform:scale(1.06);}}@keyframes cprofx-pgscan{0%{transform:translateY(0);opacity:0;}15%{opacity:.95;}85%{opacity:.95;}100%{transform:translateY(34px);opacity:0;}}@keyframes cprofx-pgspark{0%, 100%{opacity:.2;}50%{opacity:.9;}}.cprofx .pgx-label{font-family:inherit;font-size:14px;font-weight:600;color:#eafff5;letter-spacing:.01em;text-shadow:0 1px 8px rgba(0, 20, 12, .5);}.cprofx .pgx-dots::after{content:"";animation:cprofx-pgdots 1.4s steps(4, end) infinite;}@keyframes cprofx-pgdots{0%{content:"";}25%{content:"\\2009.";}50%{content:"\\2009..";}75%{content:"\\2009...";}}.cprofx .pgx-sub{font-family:inherit;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(234, 255, 245, .55);}@media(prefers-reduced-motion:reduce){.cprofx #pgxn{transition:opacity .14s;}.cprofx .pgx-ring, .cprofx .pgx-ring2, .cprofx .pgx-orbit, .cprofx .pgx-core, .cprofx .pgx-scan, .cprofx .pgx-spark{animation:none;}.cprofx .pgx-card{transition:none;}}
`;

// inline-SVG helper, mirrors the prototype's I(p,s)
function I(p: React.ReactNode, s?: number) {
  return (
    <svg width={s || 16} height={s || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {p}
    </svg>
  );
}

const STAGES = ["Applied", "Screening", "Interview", "Offer", "Decision"];

type AppItem = { role: string; meta: string; stage: number; chip: [string, string] };
const apps: AppItem[] = [
  { role: "Platform Engineer", meta: "Payments · Remote · applied May 24", stage: 3, chip: ["Offer extended", "chip-ok"] },
  { role: "Senior Backend Engineer", meta: "Payments · Remote · applied May 20", stage: 1, chip: ["Under review", "chip-info"] },
];

type IvItem = { t: string; d: string; ic: React.ReactNode; c: string };
const ivs: IvItem[] = [
  { t: "Technical loop · Platform Engineer", d: "Completed May 28 · feedback in", ic: <path d="M5 12.5l4.5 4.5L19 7.5" />, c: "ok" },
  { t: "Phone screen · Sr. Backend Engineer", d: "Thu Jun 1 · 10:00 AM · video", ic: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2" />, c: "info" },
];

export default function CandidateProfilePage() {
  const { user } = useCurrentUser();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pv = useRef<HTMLVideoElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = useState(true);

  // candidate's own profile, use their first name where the prototype hardcodes
  // "Priya" IF a logged-in CANDIDATE exists; otherwise keep the example value.
  const firstName =
    user && user.role === "CANDIDATE" && user.name
      ? user.name.trim().split(/\s+/)[0]
      : "Priya";

  // theme toggle, scoped to this page (mirrors the prototype's localStorage key)
  useEffect(() => {
    let stored: string | null = null;
    try { stored = window.localStorage.getItem("cdc-theme"); } catch {}
    setTheme(stored === "dark" ? "dark" : "light");
  }, []);
  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try { window.localStorage.setItem("cdc-theme", next); } catch {}
      return next;
    });
  }

  // HLS video, native HLS first, then hls.js loaded from the same CDN the
  // prototype used (<script src="...hls.js@1.5.13...">). We read window.Hls.
  useEffect(() => {
    const v = pv.current;
    if (!v) return;
    const src = "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any = null;
    let script: HTMLScriptElement | null = null;

    const startHls = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Hls = (window as any).Hls;
      if (Hls && Hls.isSupported() && pv.current) {
        const h = new Hls({ enableWorker: false });
        hls = h;
        h.loadSource(src);
        h.attachMedia(pv.current);
        h.on(Hls.Events.MANIFEST_PARSED, play);
      }
    };

    if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = src;
      v.addEventListener("loadedmetadata", play);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } else if ((window as any).Hls) {
      startHls();
    } else {
      script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js";
      script.async = true;
      script.onload = startHls;
      document.head.appendChild(script);
    }
    return () => {
      v.removeEventListener("loadedmetadata", play);
      if (hls) hls.destroy();
      if (script) script.onload = null;
    };
  }, []);

  // "Routing securely" splash, shown on mount then faded out (matches the
  // prototype, which removes .show on the first paint).
  useEffect(() => {
    const r = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOverlay(false));
    });
    return () => cancelAnimationFrame(r);
  }, []);

  // safety net: guarantee content visible even if entrance animations throttle
  useEffect(() => {
    const t = setTimeout(() => {
      [".scene", ".phero .inner"].forEach((s) => {
        const el = document.querySelector(`.cprofx ${s}`) as HTMLElement | null;
        if (el) { el.style.animation = "none"; el.style.opacity = "1"; el.style.transform = "none"; }
      });
    }, 900);
    return () => clearTimeout(t);
  }, []);

  function toApps() {
    const el = appsRef.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 70, behavior: "smooth" });
  }

  return (
    <div className="cprofx" data-theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="aurora" aria-hidden="true"><i className="b1" /><i className="b2" /></div>
      <div className="grain" aria-hidden="true" />
      <div className="page">
        <header className="top">
          <a className="brand" href="/jobs"><img src="/assets/logo-light.png" className="brandlogo brandlogo-l" alt="TalentFlow ATS" style={{ height: 24, width: "auto", display: "block" }} /><img src="/assets/logo-dark.png" className="brandlogo brandlogo-d" alt="TalentFlow ATS" style={{ height: 24, width: "auto", display: "none" }} /> Northwind <span style={{ color: "var(--ink-3)", fontWeight: 600 }}>Talent</span></a>
          <span style={{ flex: 1 }} />
          <a className="btn btn-soft btn-sm" href="/jobs">Browse jobs</a>
          <button className="tbtn" id="theme" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === "dark"
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" /></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>}
          </button>
        </header>

        <div className="scene">
          {/* cinematic candidate hero */}
          <section className="phero">
            <video ref={pv} muted loop playsInline preload="auto" />
            <svg className="glow" viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="gb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="25" /></filter></defs><ellipse cx="300" cy="74" rx="248" ry="74" fill="#1f9a72" opacity=".5" filter="url(#gb)" /></svg>
            <div className="vlines" aria-hidden="true"><i /><i /><i /></div>
            <div className="ov" aria-hidden="true" />
            <div className="gcard">
              <div className="gtag">[ 2026 ]</div>
              <h4>Reviewed by <em>people</em>, not just AI.</h4>
              <p className="gp">Every screening decision on your applications is confirmed by a human.</p>
              <div className="score"><span className="rv">84</span><span className="rl">AI match · advisory<br />confidence 0.88</span></div>
            </div>
            <div className="inner">
              <div className="eyebrow"><span className="d" /> Your candidate space</div>
              <h1 className="big">Welcome back, <br />{firstName}<span className="gdot">.</span></h1>
              <p className="lede2">Track your applications, interviews, and offer in one place, with full transparency into how every decision was made.</p>
              <div className="ctas">
                <button className="cta-g" id="toApps" onClick={toApps}>View my applications <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
                <a className="cta-ghost" href="/jobs">Browse jobs</a>
              </div>
              <div className="pmeta"><span>priya.raman@hey.com</span><span>Austin, TX</span><span className="mono">Member since May 2026</span></div>
            </div>
          </section>

          <div className="navtabs">
            <a className="on" href="#">Overview</a><a href="#">Applications</a><a href="#">Documents</a><a href="/jobs">Job board</a>
          </div>

          <div className="grid">
            {/* left */}
            <div>
              {/* applications */}
              <div className="card">
                <div className="card-h"><span className="t"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5" /></svg> Your applications</span><a href="#">View all</a></div>
                <div className="card-b" id="apps" ref={appsRef}>
                  {apps.map((a, ai) => (
                    <div className="appli" key={ai}>
                      <div className="row1"><div><div className="jt">{a.role}</div><div className="jm">{a.meta}</div></div><span className={"chip " + a.chip[1]}>{a.chip[0]}</span></div>
                      <div className="track">
                        {STAGES.map((s, i) => {
                          const cls = i < a.stage ? "done" : i === a.stage ? "cur" : "";
                          return (
                            <div className={"st " + cls} key={i}>
                              {i > 0 ? <span className="bar" /> : null}
                              <span className="dot">{i < a.stage ? I(<path d="M5 12.5l4.5 4.5L19 7.5" />, 12) : i + 1}</span>
                              <span className="lbl">{s}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* interviews */}
              <div className="card">
                <div className="card-h"><span className="t"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5zM4 9.5h16M8 3.5v3M16 3.5v3" /></svg> Upcoming interviews</span></div>
                <div className="card-b" id="ivs">
                  {ivs.map((v, vi) => (
                    <div className="li" key={vi}>
                      <span className="ic" style={{ background: `var(--${v.c}-tint)`, color: `var(--${v.c})` }}>{I(v.ic, 18)}</span>
                      <div className="tx"><div className="tt">{v.t}</div><div className="td">{v.d}</div></div>
                      {v.c === "info" ? <button className="btn btn-soft btn-sm">Details</button> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* right */}
            <div>
              {/* resume */}
              <div className="card">
                <div className="card-h"><span className="t"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /></svg> Résumé</span></div>
                <div className="card-b">
                  <div className="resume"><span className="fi"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5" /></svg></span>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: "13.5px" }}>priya-raman-resume.pdf</div><div style={{ fontSize: "11.5px", color: "var(--ink-3)" }}>Updated 6 days ago · 248 KB</div></div>
                    <button className="btn btn-soft btn-sm">Replace</button></div>
                  <div style={{ fontSize: "11.5px", color: "var(--ink-3)", marginTop: 10, textAlign: "center" }}>Used across all your applications to Northwind Talent.</div>
                </div>
              </div>
              {/* offer */}
              <div className="card">
                <div className="card-h"><span className="t"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /></svg> Offer</span><span className="chip chip-ok">Action needed</span></div>
                <div className="card-b">
                  <div className="offer-banner">
                    <div style={{ fontWeight: 700, fontSize: "14.5px" }}>Platform Engineer</div>
                    <div style={{ fontSize: "12px", color: "var(--ink-2)", marginBottom: 8 }}>Sent May 30 · expires in 10 days</div>
                    <div className="kv"><span style={{ color: "var(--ink-2)" }}>Base salary</span><b className="mono">$182, 000</b></div>
                    <div className="kv"><span style={{ color: "var(--ink-2)" }}>Signing bonus</span><b className="mono">$20, 000</b></div>
                    <div className="kv"><span style={{ color: "var(--ink-2)" }}>Start date</span><b>Jul 14, 2026</b></div>
                  </div>
                  <div style={{ display: "flex", gap: 9, marginTop: 13 }}><button className="btn btn-soft btn-sm" style={{ flex: 1 }}>Decline</button><button className="btn btn-primary btn-sm" style={{ flex: 1.4 }}>Review &amp; accept</button></div>
                </div>
              </div>
              {/* transparency */}
              <div className="card">
                <div className="card-b">
                  <div className="ai-note"><span className="x"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" /></svg></span><p><b>AI is assistive, a human decides.</b> Curious how your application was reviewed? <a href="/transparency" style={{ color: "var(--ai-ink)", fontWeight: 700 }}>See the transparency report</a> or request a human review.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="pgxn" className={overlay ? "show" : ""} aria-hidden="true"><div className="pgx-card"><svg className="pgx-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true"><defs><linearGradient id="pgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5fe3b8" /><stop offset="1" stopColor="#16916a" /></linearGradient></defs><circle className="pgx-ring" cx="60" cy="60" r="50" stroke="url(#pgg)" strokeWidth="1.6" strokeDasharray="4 9" opacity=".55" /><circle className="pgx-ring2" cx="60" cy="60" r="40" stroke="#7c5cff" strokeWidth="1.2" strokeDasharray="2 7" opacity=".4" /><g className="pgx-orbit"><circle cx="60" cy="10" r="4.2" fill="#5fe3b8" /><circle className="pgx-n2" cx="103" cy="78" r="3.6" fill="#7c5cff" /><circle className="pgx-n3" cx="17" cy="78" r="3.6" fill="#5fe3b8" /></g><rect className="pgx-core" x="38" y="38" width="44" height="44" rx="13" fill="url(#pgg)" /><g stroke="#eafff5" strokeWidth="2.6" strokeLinecap="round" opacity=".92"><line x1="48" y1="52" x2="72" y2="52" /><line x1="48" y1="60" x2="67" y2="60" /><line x1="48" y1="68" x2="70" y2="68" /></g><rect className="pgx-scan" x="40" y="44" width="40" height="3" rx="1.5" fill="#fff" opacity=".95" /><circle className="pgx-spark" cx="60" cy="60" r="3" fill="#fff" /></svg><div className="pgx-label">Routing securely<span className="pgx-dots" /></div><div className="pgx-sub">TalentFlow ATS</div></div></div>
    </div>
  );
}
