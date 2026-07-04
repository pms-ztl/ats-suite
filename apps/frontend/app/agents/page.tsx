"use client";
// app/agents/page.tsx
// EXACT port of claude-design/Agents.html, the standalone public marketing page
// for the AI agents: CloudFront background video + tint, nav (logo + links +
// burger), cinematic hero with the "Screen, draft & audit" heading, the grid of
// 6 advisory agent cards (candidate-screener, jd-author, bias-auditor, copilot,
// offer-agent, scheduler), and the full dark/light footer (social icons, nav
// columns, watermark, email subscribe). No app shell; marketing copy verbatim.
import { useState, useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
.agentsx{
  --font-heading:'Helvetica Now Display Bold', 'Helvetica Neue', Arial, sans-serif;
  --font-body:'Inter', system-ui, sans-serif;
  --text:#192837;--accent:#7342E2;--accent-deep:#5b2fc7;--bg:#F2F2EE;
  --br:#16916a;--ease:cubic-bezier(.22, 1, .36, 1);
  --br-light:#4fd9a6;--br-deep:#0f7d59;--ai:#7c5cff;
  background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100vh;
}
.agentsx *{box-sizing:border-box;}.agentsx *{font-family:var(--font-body);}
.agentsx a{color:inherit;text-decoration:none;}.agentsx button{font-family:inherit;cursor:pointer;}
.agentsx ::selection{background:rgba(115, 66, 226, .18);}
.agentsx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(115, 66, 226, .4);border-radius:12px;}
.agentsx .heading{font-family:var(--font-heading);font-weight:700;}
/* bg video */
.agentsx .root{position:relative;width:100%;min-height:100vh;overflow:hidden;}
.agentsx #bgv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:0;transition:opacity 1.1s var(--ease);}
.agentsx #bgv.in{opacity:1;}
.agentsx .tint{position:absolute;inset:0;z-index:1;pointer-events:none;background:
  radial-gradient(72% 60% at 32% 40%, rgba(242, 242, 238, .86), rgba(242, 242, 238, .4) 60%, transparent 82%),
  linear-gradient(180deg, rgba(242, 242, 238, .55) 0%, rgba(242, 242, 238, .2) 36%, rgba(242, 242, 238, .6) 100%);}
.agentsx .fg{position:relative;z-index:10;}
/* navbar */
.agentsx nav{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px clamp(20px, 4vw, 32px);}
.agentsx .logo{display:flex;align-items:center;gap:10px;}
.agentsx .logo svg{width:32px;height:32px;}
.agentsx .logo b{font-family:var(--font-heading);font-size:19px;letter-spacing:-0.01em;}
.agentsx .logo b i{font-style:normal;font-weight:400;font-family:var(--font-body);color:rgba(25, 40, 55, .5);font-size:13px;}
.agentsx .nlinks{display:flex;align-items:center;gap:30px;}
.agentsx .nlinks a{font-size:14px;font-weight:500;color:var(--text);opacity:.72;transition:opacity .2s;}
.agentsx .nlinks a:hover{opacity:1;}
.agentsx .nctas{display:flex;align-items:center;gap:10px;}
.agentsx .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:999px;font-weight:600;font-size:14px;padding:10px 20px;transition:transform .15s var(--ease), filter .2s, box-shadow .25s, background .2s;white-space:nowrap;}
.agentsx .btn:active{transform:scale(.97);}
.agentsx .btn-ac{background:var(--accent);color:#fff;box-shadow:0 4px 20px rgba(115, 66, 226, .28);}
.agentsx .btn-ac:hover{filter:brightness(1.08);transform:scale(1.03);}
.agentsx .btn-soft{background:var(--bg);color:var(--text);box-shadow:inset 0 0 0 1px rgba(25, 40, 55, .12);}
.agentsx .burger{display:none;width:42px;height:42px;border-radius:12px;background:var(--bg);box-shadow:inset 0 0 0 1px rgba(25, 40, 55, .12);color:var(--text);align-items:center;justify-content:center;}
@media(max-width:880px){.agentsx .nlinks, .agentsx .nctas{display:none;}.agentsx .burger{display:flex;}}
/* mobile sheet */
.agentsx .scrim{position:fixed;inset:0;z-index:60;background:rgba(25, 40, 55, .35);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .3s;}
.agentsx .scrim.open{opacity:1;pointer-events:auto;}
.agentsx .sheet{position:fixed;right:0;top:0;height:100dvh;width:min(88vw, 360px);background:#CFC8C5;box-shadow:-12px 0 48px rgba(25, 40, 55, .18);z-index:61;transform:translateX(100%);transition:transform .45s var(--ease);padding:20px 22px;display:flex;flex-direction:column;}
.agentsx .sheet.open{transform:translateX(0);}
.agentsx .sheet .sh{display:flex;align-items:center;justify-content:between;justify-content:space-between;}
.agentsx .sheet .x{width:40px;height:40px;border-radius:11px;background:rgba(255, 255, 255, .5);color:var(--text);display:grid;place-items:center;border:none;}
.agentsx .sheet .div{height:1px;background:rgba(25, 40, 55, .14);margin:18px 0;}
.agentsx .sheet .links{display:flex;flex-direction:column;gap:4px;}
.agentsx .sheet .links a{font-size:20px;font-weight:600;padding:11px 0;}
.agentsx .sheet .bot{margin-top:auto;display:flex;flex-direction:column;gap:10px;}
.agentsx .sheet .bot .btn{width:100%;}
/* hero */
.agentsx .hero{max-width:1280px;margin:0 auto;padding:clamp(40px, 8vw, 76px) clamp(20px, 4vw, 32px) clamp(30px, 5vw, 50px);}
.agentsx .hblock{max-width:620px;}
.agentsx .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;background:rgba(242, 242, 238, .7);padding:6px 14px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(25, 40, 55, .08);margin-bottom:20px;}
.agentsx .eyebrow .dot{width:7px;height:7px;border-radius:99px;background:var(--accent);box-shadow:0 0 9px var(--accent);}
.agentsx h1{font-family:var(--font-heading);font-weight:700;font-size:clamp(1.75rem, 5.2vw, 3.1rem);line-height:1.06;letter-spacing:-0.01em;color:var(--text);margin:0 0 22px;text-shadow:0 1px 1px rgba(255, 255, 255, .7), 0 2px 24px rgba(242, 242, 238, .9);}
.agentsx h1 .ic{display:inline-block;vertical-align:middle;position:relative;top:-2px;margin:0 4px;color:var(--accent);}
.agentsx .sub{font-size:clamp(.92rem, 2.4vw, 1.12rem);line-height:1.65;opacity:.82;max-width:560px;margin:0 0 28px;text-shadow:0 1px 12px rgba(242, 242, 238, .85);}
.agentsx .cta{display:inline-flex;align-items:center;justify-content:space-between;gap:28px;background:var(--accent);color:#fff;border:none;border-radius:50px;padding:16px 24px;font-weight:600;font-size:clamp(.9rem, 2vw, 1rem);box-shadow:0 4px 24px rgba(115, 66, 226, .28);min-width:210px;transition:transform .15s var(--ease), filter .2s;}
.agentsx .cta:hover{transform:scale(1.04);filter:brightness(1.1);}
.agentsx .cta:active{transform:scale(.96);}
/* agent cards */
.agentsx .agents{max-width:1280px;margin:0 auto;padding:8px clamp(20px, 4vw, 32px) 56px;}
.agentsx .grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:14px;}
@media(max-width:900px){.agentsx .grid{grid-template-columns:1fr 1fr;}}
@media(max-width:600px){.agentsx .grid{grid-template-columns:1fr;}}
.agentsx .acard{background:rgba(255, 255, 255, .72);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(25, 40, 55, .08);border-radius:20px;padding:20px;box-shadow:0 14px 40px -22px rgba(25, 40, 55, .3);transition:transform .25s var(--ease), box-shadow .25s;}
.agentsx .acard:hover{transform:translateY(-4px);box-shadow:0 24px 54px -24px rgba(25, 40, 55, .4);}
.agentsx .acard .top{display:flex;align-items:center;gap:11px;margin-bottom:13px;}
.agentsx .acard .ic{width:42px;height:42px;border-radius:12px;background:rgba(115, 66, 226, .12);color:var(--accent);display:grid;place-items:center;flex-shrink:0;}
.agentsx .acard .nm{font-family:var(--font-body);font-weight:700;font-size:14px;}
.agentsx .acard .nm i{display:block;font-style:normal;font-size:11px;font-weight:500;color:rgba(25, 40, 55, .5);margin-top:1px;}
.agentsx .acard p{font-size:13px;line-height:1.55;opacity:.74;margin:0 0 14px;}
.agentsx .acard .foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:13px;border-top:1px solid rgba(25, 40, 55, .1);}
.agentsx .acard .metric{font-weight:700;font-size:13px;}.agentsx .acard .metric span{font-size:11px;font-weight:500;opacity:.55;}
.agentsx .acard .adv{font-size:10.5px;font-weight:600;color:var(--accent);background:rgba(115, 66, 226, .1);padding:4px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:5px;}
.agentsx .foot-note{text-align:center;padding:6px 22px 44px;font-size:12px;opacity:.5;}
/* entrance */
@keyframes agentsx-fu{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:none;}}
.agentsx .fu{opacity:0;animation:agentsx-fu .6s var(--ease) forwards;}
@media(prefers-reduced-motion:reduce){.agentsx #bgv{transition:none;}.agentsx .fu{animation:none;opacity:1;}}

/* ===== footer ===== */
.agentsx .footer-section{position:relative;z-index:5;background:transparent;padding:48px 24px 52px;color:#fff;border-top:1px solid rgba(255, 255, 255, .08);font-family:"DM Sans", sans-serif;}
.agentsx .footer-section *{box-sizing:border-box;}
.agentsx a{text-decoration:none;}
.agentsx .footer-wrapper{max-width:1150px;margin:0 auto;display:grid;grid-template-columns:350px 1fr;gap:16px;align-items:stretch;}
/* left */
.agentsx .footer-left{position:relative;min-height:340px;border-radius:28px;padding:32px;overflow:hidden;box-shadow:0 12px 40px rgba(15, 125, 89, .28);background:var(--br-deep);display:flex;flex-direction:column;justify-content:space-between;}
.agentsx .footer-left-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;}
.agentsx .footer-logo{display:flex;align-items:center;gap:10px;position:relative;z-index:1;}
.agentsx .footer-logo-mark{width:32px;height:32px;border-radius:8px;background:rgba(255, 255, 255, .15);border:1.5px solid rgba(255, 255, 255, .85);display:grid;place-items:center;}
.agentsx .footer-logo-mark svg{width:20px;height:20px;}
.agentsx .footer-logo-name{font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.02em;}
.agentsx .footer-tagline-container{margin-top:auto;margin-bottom:28px;position:relative;z-index:1;}
.agentsx .footer-tagline{font-size:19px;font-weight:400;color:#fff;line-height:1.45;text-shadow:0 1px 16px rgba(8, 40, 28, .5);}
.agentsx .footer-tagline span{color:rgba(255, 255, 255, .68);}
.agentsx .footer-social-row{display:flex;justify-content:space-between;align-items:center;gap:12px;position:relative;z-index:1;}
.agentsx .footer-social-label{font-family:'Caveat', cursive;font-size:17px;font-weight:600;color:rgba(255, 255, 255, .92);letter-spacing:.3px;}
.agentsx .footer-social-icons{display:flex;gap:7px;}
.agentsx .social-icon{width:36px;height:36px;border-radius:9px;background:#0e1014;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0, 0, 0, .35), 0 2px 6px rgba(0, 0, 0, .2);transition:background .2s, transform .15s, box-shadow .2s;cursor:pointer;}
.agentsx .social-icon svg{width:15px;height:15px;fill:#fff;}
.agentsx .social-icon:hover{background:#000;transform:translateY(-2px);box-shadow:0 10px 26px rgba(0, 0, 0, .45), 0 3px 9px rgba(0, 0, 0, .3);}
/* right */
.agentsx .footer-right{background:rgba(255, 255, 255, 0.05);-webkit-backdrop-filter:blur(28px) saturate(150%);backdrop-filter:blur(28px) saturate(150%);border:1px solid rgba(255, 255, 255, .13);border-radius:28px;padding:40px;overflow:visible;box-shadow:0 4px 20px rgba(0, 0, 0, .04);display:flex;flex-direction:column;justify-content:space-between;position:relative;}
.agentsx .footer-lucky-graphic{position:absolute;top:-36px;right:40px;z-index:10;display:flex;flex-direction:column;align-items:flex-start;gap:6px;}
.agentsx .lucky-cube{width:96px;height:96px;border-radius:22px;transform:rotate(-10deg);background:linear-gradient(135deg, var(--br-light) 0%, var(--br) 55%, var(--br-deep) 100%);display:grid;place-items:center;box-shadow:inset 3px 3px 8px rgba(255, 255, 255, .35), inset -3px -3px 12px rgba(0, 0, 0, .18), 8px 14px 28px rgba(15, 125, 89, .35);}
.agentsx .lucky-cube-mark{font-size:42px;font-weight:700;color:#fff;letter-spacing:-0.04em;transform:rotate(10deg);text-shadow:0 3px 6px rgba(0, 0, 0, .25);line-height:1;}
.agentsx .lucky-text-row{display:flex;gap:6px;align-items:center;transform:rotate(-4deg);margin-top:4px;}
.agentsx .lucky-arrow{width:22px;height:22px;color:#9ca3af;}
.agentsx .lucky-arrow svg{width:100%;height:100%;}
.agentsx .lucky-arrow path{stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.agentsx .lucky-text{font-family:'Caveat', cursive;font-size:20px;font-weight:600;color:#9ca3af;white-space:nowrap;}
.agentsx .footer-right-top{padding-top:8px;}
.agentsx .footer-nav-cols{display:flex;gap:72px;}
.agentsx .footer-col-title{font-family:'Caveat', cursive;font-size:24px;font-weight:600;font-style:italic;color:rgba(255, 255, 255, .5);margin-bottom:18px;}
.agentsx .footer-col a{display:block;font-size:14px;font-weight:600;color:rgba(255, 255, 255, .86);margin-bottom:14px;transition:color .2s;}
.agentsx .footer-col a:hover{color:#1f9e74;}
.agentsx .footer-bottom{display:flex;align-items:flex-end;justify-content:space-between;margin-top:48px;gap:24px;flex-wrap:wrap;}
.agentsx .footer-copyright{font-size:12.5px;font-weight:500;color:rgba(255, 255, 255, .5);}
.agentsx .footer-cta-mini{display:flex;flex-direction:column;gap:14px;}
.agentsx .footer-cta-mini h4{font-size:15px;font-weight:400;color:rgba(255, 255, 255, .6);line-height:1.45;}
.agentsx .footer-cta-mini h4 strong{display:block;font-size:19px;font-weight:700;color:#fff;}
.agentsx .footer-subscribe-row{display:flex;width:310px;max-width:100%;background:rgba(255, 255, 255, .07);border:1px solid rgba(255, 255, 255, .16);border-radius:12px;padding:5px;box-shadow:0 2px 10px rgba(0, 0, 0, .04);}
.agentsx .footer-subscribe-row input{flex:1;min-width:0;padding:11px 14px;background:transparent;border:none;outline:none;font-family:'DM Sans', sans-serif;font-size:13.5px;color:#fff;}
.agentsx .footer-subscribe-row input::placeholder{color:#9ca3af;}
.agentsx .footer-subscribe-row button{padding:11px 22px;background:#111214;color:#fff;font-family:'DM Sans', sans-serif;font-size:13.5px;font-weight:600;border:none;border-radius:8px;cursor:pointer;box-shadow:0 6px 20px rgba(0, 0, 0, .28), 0 2px 8px rgba(0, 0, 0, .15);transition:background .2s, box-shadow .2s, transform .15s;white-space:nowrap;}
.agentsx .footer-subscribe-row button:hover{background:#000;transform:translateY(-1px);box-shadow:0 10px 28px rgba(0, 0, 0, .36);}
/* watermark */
.agentsx .footer-watermark{max-width:1150px;margin:-60px auto 0;pointer-events:none;user-select:none;position:relative;z-index:0;line-height:0;}
.agentsx .footer-watermark svg{display:block;width:100%;height:auto;overflow:visible;}
.agentsx .footer-watermark text{font-family:'DM Sans', sans-serif;font-weight:700;letter-spacing:-0.03em;fill:rgba(255, 255, 255, .06);}
@media(max-width:860px){.agentsx .footer-wrapper{grid-template-columns:1fr;}.agentsx .footer-left{min-height:auto;gap:40px;}}
@media(max-width:560px){.agentsx .footer-right{padding:24px;}.agentsx .footer-nav-cols{gap:40px;}.agentsx .footer-bottom{flex-direction:column;align-items:flex-start;gap:24px;}.agentsx .footer-subscribe-row{width:100%;}.agentsx .footer-lucky-graphic{right:12px;top:-28px;}.agentsx .lucky-cube{width:72px;height:72px;}.agentsx .lucky-cube-mark{font-size:32px;}}

/* ===== page-transition overlay ===== */
.agentsx #pgxn{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;background:rgba(10, 16, 13, .22);-webkit-backdrop-filter:blur(2px) saturate(120%);backdrop-filter:blur(2px) saturate(120%);transition:opacity .42s cubic-bezier(.4, 0, .2, 1), backdrop-filter .42s cubic-bezier(.4, 0, .2, 1), -webkit-backdrop-filter .42s cubic-bezier(.4, 0, .2, 1);}
.agentsx #pgxn.show{opacity:1;-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);}
.agentsx #pgxn.cover{pointer-events:auto;}
.agentsx .pgx-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 46px 28px;border-radius:28px;background:linear-gradient(150deg, rgba(13, 46, 34, .64), rgba(7, 22, 16, .56));-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);border:1px solid rgba(255, 255, 255, .24);box-shadow:0 30px 90px -32px rgba(0, 30, 18, .6), inset 0 1px 0 rgba(255, 255, 255, .35);transform:scale(.9) translateY(8px);opacity:0;transition:transform .5s cubic-bezier(.22, 1, .36, 1), opacity .4s;}
.agentsx #pgxn.show .pgx-card{transform:none;opacity:1;}
.agentsx .pgx-svg{width:96px;height:96px;display:block;filter:drop-shadow(0 6px 18px rgba(22, 145, 106, .35));}
.agentsx .pgx-ring{transform-box:fill-box;transform-origin:center;animation:agentsx-pgrot 7s linear infinite;}
.agentsx .pgx-ring2{transform-box:fill-box;transform-origin:center;animation:agentsx-pgrot 5s linear infinite reverse;}
.agentsx .pgx-orbit{transform-box:fill-box;transform-origin:center;animation:agentsx-pgrot 3.4s linear infinite;}
.agentsx .pgx-core{transform-box:fill-box;transform-origin:center;animation:agentsx-pgpulse 1.8s ease-in-out infinite;}
.agentsx .pgx-scan{animation:agentsx-pgscan 1.7s cubic-bezier(.5, 0, .5, 1) infinite;}
.agentsx .pgx-spark{animation:agentsx-pgspark 1.8s ease-in-out infinite;}
@keyframes agentsx-pgrot{to{transform:rotate(360deg);}}
@keyframes agentsx-pgpulse{0%, 100%{transform:scale(1);}50%{transform:scale(1.06);}}
@keyframes agentsx-pgscan{0%{transform:translateY(0);opacity:0;}15%{opacity:.95;}85%{opacity:.95;}100%{transform:translateY(34px);opacity:0;}}
@keyframes agentsx-pgspark{0%, 100%{opacity:.2;}50%{opacity:.9;}}
.agentsx .pgx-label{font-family:inherit;font-size:14px;font-weight:600;color:#eafff5;letter-spacing:.01em;text-shadow:0 1px 8px rgba(0, 20, 12, .5);}
.agentsx .pgx-dots::after{content:"";animation:agentsx-pgdots 1.4s steps(4, end) infinite;}
@keyframes agentsx-pgdots{0%{content:"";}25%{content:"\\2009.";}50%{content:"\\2009..";}75%{content:"\\2009...";}}
.agentsx .pgx-sub{font-family:inherit;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(234, 255, 245, .55);}
@media(prefers-reduced-motion:reduce){.agentsx #pgxn{transition:opacity .14s;}.agentsx .pgx-ring, .agentsx .pgx-ring2, .agentsx .pgx-orbit, .agentsx .pgx-core, .agentsx .pgx-scan, .agentsx .pgx-spark{animation:none;}.agentsx .pgx-card{transition:none;}}

/* ===== footer glass unify ===== */
.agentsx .footer-right, .agentsx .fr{background:linear-gradient(155deg, rgba(255, 255, 255, .09), rgba(255, 255, 255, .03))!important;-webkit-backdrop-filter:blur(30px) saturate(170%)!important;backdrop-filter:blur(30px) saturate(170%)!important;border:1px solid rgba(255, 255, 255, .16)!important;box-shadow:0 28px 80px -34px rgba(0, 0, 0, .7), inset 0 1px 0 rgba(255, 255, 255, .22)!important;}
.agentsx .footer-subscribe-row, .agentsx .fsub{background:rgba(255, 255, 255, .1)!important;border:1px solid rgba(255, 255, 255, .2)!important;}
.agentsx .footer-subscribe-row button, .agentsx .fsub button{background:linear-gradient(180deg, #4fd9a6, #0f7d59)!important;color:#06160e!important;}
.agentsx .footer-col a, .agentsx .fcol a{color:rgba(255, 255, 255, .86)!important;}
.agentsx .footer-col a:hover, .agentsx .fcol a:hover{color:#5fe3b8!important;}
.agentsx .footer-col-title, .agentsx .fcol h4{color:rgba(255, 255, 255, .5)!important;}
.agentsx .footer-copyright, .agentsx .fcopy{color:rgba(255, 255, 255, .55)!important;}
.agentsx .footer-copyright a, .agentsx .fcopy a{color:rgba(255, 255, 255, .7)!important;}
.agentsx .footer-cta-mini h4, .agentsx .fcta h4{color:rgba(255, 255, 255, .6)!important;}
.agentsx .footer-cta-mini h4 strong, .agentsx .fcta h4 strong{color:#fff!important;}
.agentsx .footer-subscribe-row, .agentsx .fsub{background:rgba(255, 255, 255, .08)!important;border:1px solid rgba(255, 255, 255, .18)!important;}
.agentsx .footer-subscribe-row input, .agentsx .fsub input{color:#fff!important;}
.agentsx .footer-subscribe-row input::placeholder, .agentsx .fsub input::placeholder{color:rgba(255, 255, 255, .5)!important;}
.agentsx .footer-watermark text{fill:rgba(255, 255, 255, .05)!important;}
.agentsx .lucky .lt span, .agentsx .lucky-text{color:rgba(255, 255, 255, .5)!important;}

/* fsub fix */
.agentsx .fsub, .agentsx .footer-subscribe-row{align-items:center;gap:6px;flex-wrap:nowrap;}.agentsx .fsub button, .agentsx .footer-subscribe-row button{flex-shrink:0;white-space:nowrap;}.agentsx .fsub input, .agentsx .footer-subscribe-row input{min-width:0;}@media(max-width:420px){.agentsx .fsub, .agentsx .footer-subscribe-row{flex-wrap:wrap;}.agentsx .fsub button, .agentsx .footer-subscribe-row button{width:100%;}}

/* footer light theme */
.agentsx .footer-section, .agentsx .footer-watermark{position:relative;}
.agentsx .footer-right, .agentsx .fr{background:linear-gradient(155deg, rgba(255, 255, 255, .72), rgba(255, 255, 255, .45))!important;-webkit-backdrop-filter:blur(28px) saturate(150%)!important;backdrop-filter:blur(28px) saturate(150%)!important;border:1px solid rgba(0, 0, 0, .06)!important;box-shadow:0 28px 80px -34px rgba(0, 40, 25, .2), inset 0 1px 0 rgba(255, 255, 255, .8)!important;}
.agentsx .footer-col a, .agentsx .fcol a{color:#1b2638!important;}
.agentsx .footer-col a:hover, .agentsx .fcol a:hover{color:#0f7d59!important;}
.agentsx .footer-col-title, .agentsx .fcol h4{color:#8a93a3!important;}
.agentsx .footer-copyright, .agentsx .fcopy{color:#6b7280!important;}
.agentsx .footer-copyright a, .agentsx .fcopy a{color:#0f7d59!important;}
.agentsx .footer-cta-mini h4, .agentsx .fcta h4{color:#6b7280!important;}
.agentsx .footer-cta-mini h4 strong, .agentsx .fcta h4 strong{color:#111827!important;}
.agentsx .footer-subscribe-row, .agentsx .fsub{background:#fff!important;border:1px solid #e5e7eb!important;}
.agentsx .footer-subscribe-row input, .agentsx .fsub input{color:#111827!important;}
.agentsx .footer-subscribe-row input::placeholder, .agentsx .fsub input::placeholder{color:#9ca3af!important;}
.agentsx .footer-subscribe-row button, .agentsx .fsub button{background:#111214!important;color:#fff!important;}
.agentsx .footer-watermark text{fill:rgba(15, 125, 89, .06)!important;}
.agentsx .lucky .lt span, .agentsx .lucky-text{color:#9ca3af!important;}
`;

// the 6 advisory agents (was the inline AG array -> grid.innerHTML)
type Agent = { id: string; tag: string; icon: React.ReactNode; desc: string; metric: string; unit: string };
const AGENTS: Agent[] = [
  {
    id: "candidate-screener",
    tag: "Screening",
    icon: <path d="M5 8V6a1 1 0 0 1 1-1h2M16 5h2a1 1 0 0 1 1 1v2M19 16v2a1 1 0 0 1-1 1h-2M8 19H6a1 1 0 0 1-1-1v-2M8.5 12l2.2 2.2 4.8-4.8" />,
    desc: "Scores each candidate against your requirements and shows the evidence behind every point.",
    metric: "94%",
    unit: "precision",
  },
  {
    id: "jd-author",
    tag: "Authoring",
    icon: <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.4z" />,
    desc: "Drafts inclusive, accurate job descriptions and flags biased language with one-click fixes.",
    metric: "92",
    unit: "inclusivity",
  },
  {
    id: "bias-auditor",
    tag: "Fairness",
    icon: <><path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" /><path d="M9 12l2 2 4-4" /></>,
    desc: "Watches adverse-impact ratios against the 0.80 threshold across every stage, intersectionally.",
    metric: "0.80",
    unit: "threshold",
  },
  {
    id: "copilot",
    tag: "Assistance",
    icon: <path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" />,
    desc: "Answers questions across your pipeline and drafts updates, always citing its sources.",
    metric: "live",
    unit: "sources",
  },
  {
    id: "offer-agent",
    tag: "Offers",
    icon: <path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5" />,
    desc: "Drafts offer letters positioned within band and routes them through your approval chain.",
    metric: "in-band",
    unit: "positioned",
  },
  {
    id: "scheduler",
    tag: "Coordination",
    icon: <path d="M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />,
    desc: "Proposes interview slots that balance panelist load and candidate timezone, you confirm.",
    metric: "adv",
    unit: "proposed",
  },
];

export default function AgentsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overlayShow, setOverlayShow] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState(false);
  const [email, setEmail] = useState("");
  const vid = useRef<HTMLVideoElement>(null);
  const [vidIn, setVidIn] = useState(false);
  const wmSvg = useRef<SVGSVGElement>(null);
  const wmText = useRef<SVGTextElement>(null);

  // video fade-in: play then add the .in class
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const go = () => setVidIn(true);
    const onData = () => { const p = v.play(); if (p && (p as Promise<void>).then) (p as Promise<void>).then(go).catch(go); else go(); };
    v.addEventListener("loadeddata", onData);
    if (v.readyState >= 2) go();
    return () => v.removeEventListener("loadeddata", onData);
  }, []);

  // page-transition overlay: fade it out on mount (double rAF, like the prototype)
  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setOverlayShow(false)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, []);

  // watermark: shrink the viewBox to the rendered text bbox once fonts are ready
  useEffect(() => {
    const fit = () => {
      const svg = wmSvg.current, text = wmText.current;
      if (!svg || !text) return;
      try { const b = text.getBBox(); svg.setAttribute("viewBox", `${b.x} ${b.y} ${b.width} ${b.height}`); } catch { /* getBBox can throw if not laid out yet */ }
    };
    const anyDoc = document as Document & { fonts?: { ready: Promise<unknown> } };
    if (anyDoc.fonts && anyDoc.fonts.ready) anyDoc.fonts.ready.then(fit); else window.addEventListener("load", fit);
    window.addEventListener("resize", fit);
    const t = setTimeout(fit, 400);
    return () => { window.removeEventListener("resize", fit); window.removeEventListener("load", fit); clearTimeout(t); };
  }, []);

  function closeSheet() { setMobileOpen(false); }

  function scrollToAgents(e: React.MouseEvent) {
    e.preventDefault();
    const el = document.getElementById("agents");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" });
  }

  function onSubscribe() {
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setSubscribed(true);
      setEmail("");
      setSubError(false);
      setTimeout(() => setSubscribed(false), 1800);
    } else {
      setSubError(true);
      setTimeout(() => setSubError(false), 1200);
    }
  }

  const ICON_ATTRS = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <div className="agentsx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="root">
        <video ref={vid} id="bgv" className={vidIn ? "in" : undefined} muted autoPlay loop playsInline preload="auto" aria-hidden="true"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260518_003132_8b7edcb6-c64d-4a52-a9ca-879942e122ad.mp4" />
        <div className="tint" aria-hidden="true" />

        <div className="fg">
          <nav>
            <a className="logo" href="/welcome"><img src="/assets/logo-light.png" alt="TalentFlow ATS" style={{ height: 30, width: "auto", display: "block" }} /></a>
            <div className="nlinks">
              <a href="#agents">Agents</a><a href="#">How it works</a><a href="/welcome">Trust</a><a href="/pricing">Pricing</a><a href="/support">Docs</a>
            </div>
            <div className="nctas">
              <a href="/get-started"><button className="btn btn-ac">Start for free</button></a>
              <a href="/login"><button className="btn btn-soft">Sign in</button></a>
            </div>
            <button className="burger" aria-label="Menu" onClick={() => setMobileOpen(true)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
          </nav>

          <header className="hero">
            <div className="hblock">
              <span className="eyebrow fu"><span className="dot" /> 5 agents · advisory, never autonomous</span>
              <h1 className="fu" style={{ animationDelay: "0s" }}>
                <span className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8V6a1 1 0 0 1 1-1h2M16 5h2a1 1 0 0 1 1 1v2M19 16v2a1 1 0 0 1-1 1h-2M8 19H6a1 1 0 0 1-1-1v-2M8.5 12l2.2 2.2 4.8-4.8" /></svg></span>Screen,
                <span className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.4z" /></svg></span>draft &amp;
                <span className="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" /><path d="M9 12l2 2 4-4" /></svg></span>audit. A human always decides.
              </h1>
              <p className="sub fu" style={{ animationDelay: ".15s" }}>Five purpose-built AI agents do the heavy lifting of hiring, scoring candidates with cited evidence, drafting inclusive job posts, and watching for bias, while your team keeps every final decision.</p>
              <a href="#agents" onClick={scrollToAgents}><button className="cta fu" style={{ animationDelay: ".3s" }}>Meet the agents <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9 8l4 4-4 4" /></svg></button></a>
            </div>
          </header>

          <section className="agents" id="agents">
            <div className="grid" id="grid">
              {AGENTS.map((a) => (
                <div className="acard" key={a.id}>
                  <div className="top">
                    <span className="ic"><svg {...ICON_ATTRS}>{a.icon}</svg></span>
                    <span className="nm">{a.id}<i>{a.tag}</i></span>
                  </div>
                  <p>{a.desc}</p>
                  <div className="foot">
                    <span className="metric">{a.metric} <span>{a.unit}</span></span>
                    <span className="adv"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" /></svg> advisory</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="foot-note">ATS by TalentFlow · Every agent is advisory. A human makes the call, and candidates can ask how a decision was made.</div>
        </div>
      </div>

      {/* mobile sheet */}
      <div className={"scrim" + (mobileOpen ? " open" : "")} onClick={closeSheet} />
      <aside className={"sheet" + (mobileOpen ? " open" : "")}>
        <div className="sh">
          <div className="logo"><svg viewBox="0 0 32 32" width="30" height="30" fill="none"><rect x="1" y="1" width="30" height="30" rx="9" fill="var(--br)" /><path d="M16 23.6C11.8 19.9 10.3 14.6 12.1 8.4C16.3 11.8 17.8 17.2 16 23.6Z" fill="#fff" /><path d="M16 23.6C20.2 19.9 21.7 14.6 19.9 8.4C15.7 11.8 14.2 17.2 16 23.6Z" fill="#7342E2" opacity=".9" /><circle cx="16" cy="7.4" r="2.5" fill="#7342E2" /></svg><b style={{ fontFamily: "var(--font-heading)", fontSize: 18 }}>ATS Agents</b></div>
          <button className="x" aria-label="Close" onClick={closeSheet}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
        </div>
        <div className="div" />
        <div className="links"><a href="#agents" onClick={closeSheet}>Agents</a><a href="#" onClick={closeSheet}>How it works</a><a href="/welcome" onClick={closeSheet}>Trust</a><a href="/pricing" onClick={closeSheet}>Pricing</a><a href="/support" onClick={closeSheet}>Docs</a></div>
        <div className="bot"><a href="/get-started" onClick={closeSheet}><button className="btn btn-ac">Start for free</button></a><a href="/login" onClick={closeSheet}><button className="btn btn-soft">Sign in</button></a></div>
      </aside>

      {/* footer */}
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
                  <a href="/welcome">How it works</a><a href="/agents">AI Agents</a><a href="/pricing">Pricing</a><a href="/welcome">Customers</a><a href="/support">Help &amp; FAQ</a>
                </div>
                <div className="footer-col">
                  <div className="footer-col-title">Company</div>
                  <a href="/jobs">Careers</a><a href="/welcome">About</a><a href="/support">Terms &amp; Conditions</a><a href="/support">Privacy Policy</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-copyright">© 2026 TalentFlow. All rights reserved.<br /><span style={{ opacity: .9, display: "inline-flex", gap: 7, flexWrap: "wrap", marginTop: 6 }}><span>SOC 2 Type II</span> · <span>GDPR</span> · <span>EEOC-ready</span> · <a href="#" style={{ color: "#9ca3af", textDecoration: "underline" }}>System status</a></span></div>
              <div className="footer-cta-mini">
                <h4>AI moves fast.<br /><strong>Hire ahead with TalentFlow.</strong></h4>
                <div className="footer-subscribe-row">
                  <input type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} style={subError ? { boxShadow: "0 0 0 2px #ef6b5e" } : undefined} />
                  <button type="button" onClick={onSubscribe}>{subscribed ? "Subscribed ✓" : "Subscribe"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-watermark" aria-hidden="true">
          <svg ref={wmSvg} viewBox="62 95 876 175" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <text ref={wmText} x="500" y="240" textAnchor="middle" fontSize="320">TalentFlow</text>
          </svg>
        </div>
      </section>

      {/* page-transition overlay */}
      <div id="pgxn" className={overlayShow ? "show" : undefined} aria-hidden="true"><div className="pgx-card"><svg className="pgx-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true"><defs><linearGradient id="pgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5fe3b8" /><stop offset="1" stopColor="#16916a" /></linearGradient></defs><circle className="pgx-ring" cx="60" cy="60" r="50" stroke="url(#pgg)" strokeWidth="1.6" strokeDasharray="4 9" opacity=".55" /><circle className="pgx-ring2" cx="60" cy="60" r="40" stroke="#7c5cff" strokeWidth="1.2" strokeDasharray="2 7" opacity=".4" /><g className="pgx-orbit"><circle cx="60" cy="10" r="4.2" fill="#5fe3b8" /><circle className="pgx-n2" cx="103" cy="78" r="3.6" fill="#7c5cff" /><circle className="pgx-n3" cx="17" cy="78" r="3.6" fill="#5fe3b8" /></g><rect className="pgx-core" x="38" y="38" width="44" height="44" rx="13" fill="url(#pgg)" /><g stroke="#eafff5" strokeWidth="2.6" strokeLinecap="round" opacity=".92"><line x1="48" y1="52" x2="72" y2="52" /><line x1="48" y1="60" x2="67" y2="60" /><line x1="48" y1="68" x2="70" y2="68" /></g><rect className="pgx-scan" x="40" y="44" width="40" height="3" rx="1.5" fill="#fff" opacity=".95" /><circle className="pgx-spark" cx="60" cy="60" r="3" fill="#fff" /></svg><div className="pgx-label">Routing securely<span className="pgx-dots" /></div><div className="pgx-sub">TalentFlow ATS</div></div></div>
    </div>
  );
}
