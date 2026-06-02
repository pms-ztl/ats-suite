"use client";
// app/pricing/page.tsx
// EXACT port of claude-design/Pricing.html: the full pricing marketing page with
// CloudFront background video + aurora blobs + veil, hero, monthly/annual billing
// toggle, the 4-tier liquid-glass pricing grid (Free / Starter / Professional /
// Enterprise), trust chips, the rich DM Sans footer (video card, lucky cube,
// nav columns, subscribe, watermark) and the "Routing securely" page-transition
// overlay. All CSS is scoped under .pricingx and every @keyframes is renamed with
// a price- prefix to avoid colliding with globals.css. Links wired to real routes.
import { useState, useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');
.pricingx{
  --font:'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --mono:'Geist Mono', ui-monospace, monospace;
  --brand:oklch(0.76 0.13 162);--brand-deep:oklch(0.64 0.13 162);
  --ai:oklch(0.76 0.15 292);
  --ease:cubic-bezier(.22, 1, .36, 1);
  min-height:100vh;background:#05080b;color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased;
}
.pricingx *{box-sizing:border-box;}
.pricingx *{font-family:var(--font);}
.pricingx a{color:inherit;text-decoration:none;}.pricingx button{font-family:inherit;cursor:pointer;}
.pricingx .mono{font-family:var(--mono);font-variant-numeric:tabular-nums;}
.pricingx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(255, 255, 255, .35);border-radius:12px;}
/* bg */
.pricingx .bg-aurora{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:
  radial-gradient(60% 50% at 18% 16%, oklch(0.34 0.09 162/.5), transparent 70%),
  radial-gradient(55% 50% at 86% 84%, oklch(0.32 0.10 292/.5), transparent 70%), #05080b;}
.pricingx .bg-aurora i{position:absolute;border-radius:50%;filter:blur(90px);}
.pricingx .bg-aurora .a{width:46vw;height:46vw;left:-12vw;top:-14vw;background:radial-gradient(circle, var(--brand), transparent 66%);opacity:.14;animation:price-drift 24s var(--ease) infinite;}
.pricingx .bg-aurora .b{width:42vw;height:42vw;right:-12vw;bottom:-16vw;background:radial-gradient(circle, var(--ai), transparent 66%);opacity:.15;animation:price-drift 30s var(--ease) infinite reverse;}
@keyframes price-drift{0%, 100%{transform:translate(0, 0) scale(1);}50%{transform:translate(4%, -5%) scale(1.12);}}
.pricingx #bgv{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;opacity:0;transition:opacity 1.2s var(--ease);pointer-events:none;}
.pricingx #bgv.in{opacity:.82;}
.pricingx .veil{position:fixed;inset:0;z-index:2;pointer-events:none;background:
  linear-gradient(180deg, rgba(5, 8, 11, .42), rgba(5, 8, 11, .18) 38%, rgba(5, 8, 11, .5));}
.pricingx .page{position:relative;z-index:10;}
/* liquid glass */
.pricingx .lg{background:rgba(255, 255, 255, 0.012);background-blend-mode:luminosity;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border:none;box-shadow:inset 0 1px 1px rgba(255, 255, 255, .1), 0 18px 50px -22px rgba(0, 0, 0, .6);position:relative;overflow:hidden;}
.pricingx .lg::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.4px;background:linear-gradient(180deg, rgba(255, 255, 255, .45) 0%, rgba(255, 255, 255, .15) 20%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, .15) 80%, rgba(255, 255, 255, .45) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
/* nav */
.pricingx nav{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px clamp(20px, 4vw, 40px);max-width:1280px;margin:0 auto;}
.pricingx .logo{display:flex;align-items:center;gap:10px;font-weight:600;font-size:16px;}
.pricingx .logo svg{height:26px;}
.pricingx .logo span.sub{color:rgba(255, 255, 255, .5);font-weight:500;}
.pricingx .navpill{display:flex;align-items:center;gap:2px;border-radius:14px;padding:6px;}
.pricingx .navpill a{padding:7px 14px;border-radius:9px;font-size:13.5px;color:rgba(255, 255, 255, .7);transition:background .2s, color .2s;display:inline-flex;align-items:center;gap:4px;}
.pricingx .navpill a:hover{color:#fff;}
.pricingx .navpill a.on{background:rgba(255, 255, 255, .14);color:#fff;}
.pricingx .navcta{display:flex;align-items:center;gap:12px;}
.pricingx .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13.5px;font-weight:500;border:none;border-radius:999px;padding:10px 18px;transition:transform .15s var(--ease), box-shadow .25s, filter .2s, background .2s;white-space:nowrap;}
.pricingx .btn:active{transform:scale(.97);}
.pricingx .btn-glass{color:#fff;}.pricingx .btn-glass:hover{background:rgba(255, 255, 255, .06);}
.pricingx .btn-white{background:#fff;color:#0a0d12;}.pricingx .btn-white:hover{background:rgba(255, 255, 255, .9);}
.pricingx .btn-emerald{background:linear-gradient(180deg, var(--brand), var(--brand-deep));color:#05120c;font-weight:600;box-shadow:0 8px 26px -8px oklch(0.64 0.13 162/.6), inset 0 1px 0 rgba(255, 255, 255, .4);}
.pricingx .btn-emerald:hover{filter:brightness(1.06);}
.pricingx .burger{display:none;color:#fff;padding:9px;border-radius:11px;}
@media(max-width:920px){.pricingx .navpill{display:none;}.pricingx .navcta .btn{display:none;}.pricingx .burger{display:inline-flex;}}
.pricingx .mobile{display:none;position:absolute;top:70px;left:16px;right:16px;z-index:30;border-radius:18px;padding:14px;flex-direction:column;gap:4px;}
.pricingx .mobile.open{display:flex;}
.pricingx .mobile a{padding:12px 14px;border-radius:10px;font-size:14px;color:rgba(255, 255, 255, .82);}
.pricingx .mobile a:hover{background:rgba(255, 255, 255, .06);}
.pricingx .mobile .row{display:flex;gap:8px;margin-top:8px;padding-top:12px;border-top:1px solid rgba(255, 255, 255, .1);}
.pricingx .mobile .row .btn{flex:1;}
/* hero */
.pricingx .hero{text-align:center;max-width:760px;margin:0 auto;padding:clamp(28px, 5vw, 56px) 22px 8px;}
.pricingx .eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600;color:rgba(255, 255, 255, .9);margin-bottom:18px;}
.pricingx .eyebrow .dot{width:7px;height:7px;border-radius:99px;background:var(--brand);box-shadow:0 0 10px var(--brand);}
.pricingx .hero h1{font-size:clamp(34px, 5.4vw, 56px);font-weight:600;letter-spacing:-0.03em;line-height:1.05;margin:0 0 14px;}
.pricingx .hero h1 em{font-style:normal;color:transparent;background:linear-gradient(110deg, var(--brand), #fff 60%, var(--ai));-webkit-background-clip:text;background-clip:text;}
.pricingx .hero p{font-size:clamp(14.5px, 1.6vw, 16.5px);color:rgba(255, 255, 255, .66);line-height:1.6;max-width:52ch;margin:0 auto 24px;}
/* toggle */
.pricingx .toggle{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:5px;}
.pricingx .toggle button{border:none;background:transparent;color:rgba(255, 255, 255, .7);font-size:13px;font-weight:600;padding:8px 16px;border-radius:999px;transition:background .2s, color .2s;}
.pricingx .toggle button.on{background:#fff;color:#0a0d12;}
.pricingx .toggle .save{font-size:11px;color:var(--brand);font-weight:700;padding-right:10px;}
/* pricing grid */
.pricingx .tiers{max-width:1240px;margin:0 auto;padding:30px clamp(16px, 3vw, 28px) 40px;display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;align-items:stretch;}
@media(max-width:1080px){.pricingx .tiers{grid-template-columns:repeat(2, 1fr);}}
@media(max-width:560px){.pricingx .tiers{grid-template-columns:1fr;}}
.pricingx .tier{border-radius:22px;padding:24px 22px;display:flex;flex-direction:column;}
.pricingx .tier.pop{box-shadow:inset 0 1px 1px rgba(255, 255, 255, .12), 0 0 0 1.4px oklch(0.76 0.13 162/.55), 0 24px 60px -24px oklch(0.64 0.13 162/.5);}
.pricingx .tier .badge{position:absolute;top:14px;right:14px;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#05120c;background:var(--brand);padding:4px 10px;border-radius:999px;}
.pricingx .tier .tname{font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:rgba(255, 255, 255, .7);}
.pricingx .tier .price{display:flex;align-items:flex-end;gap:3px;margin:14px 0 2px;}
.pricingx .tier .price .amt{font-size:42px;font-weight:600;letter-spacing:-0.03em;line-height:1;}
.pricingx .tier .price .cur{font-size:22px;font-weight:600;margin-bottom:4px;color:rgba(255, 255, 255, .8);}
.pricingx .tier .price .per{font-size:13px;color:rgba(255, 255, 255, .5);margin-bottom:6px;}
.pricingx .tier .billed{font-size:12px;color:rgba(255, 255, 255, .45);min-height:16px;}
.pricingx .tier .desc{font-size:13px;color:rgba(255, 255, 255, .6);line-height:1.5;margin:12px 0 16px;}
.pricingx .tier .btn{width:100%;margin-bottom:18px;}
.pricingx .tier .feats{display:flex;flex-direction:column;gap:10px;}
.pricingx .tier .feats .h{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:rgba(255, 255, 255, .4);margin-bottom:2px;}
.pricingx .tier .feat{display:flex;gap:9px;align-items:flex-start;font-size:13px;color:rgba(255, 255, 255, .82);line-height:1.4;}
.pricingx .tier .feat svg{flex-shrink:0;margin-top:1px;color:var(--brand);}
.pricingx .tier .feat.ai svg{color:var(--ai);}
/* trust + footer */
.pricingx .trust{max-width:1000px;margin:0 auto;padding:6px 22px 40px;display:flex;flex-wrap:wrap;justify-content:center;gap:10px;}
.pricingx .chip{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:9px 16px;font-size:12.5px;color:rgba(255, 255, 255, .78);}
.pricingx .chip svg{color:var(--brand);}
.pricingx .foot{text-align:center;padding:24px 22px 40px;font-size:12px;color:rgba(255, 255, 255, .4);font-family:var(--mono);}
@media(prefers-reduced-motion:reduce){.pricingx .bg-aurora .a, .pricingx .bg-aurora .b{animation:none;}.pricingx #bgv{transition:none;}}

/* ===== footer ===== */
.pricingx .footer-section{position:relative;z-index:5;background:transparent;padding:48px 24px 52px;color:#fff;border-top:1px solid rgba(255, 255, 255, .08);font-family:"DM Sans", sans-serif;}
.pricingx .footer-section *{box-sizing:border-box;}
.pricingx .footer-wrapper{max-width:1150px;margin:0 auto;display:grid;grid-template-columns:350px 1fr;gap:16px;align-items:stretch;}
/* left */
.pricingx .footer-left{position:relative;min-height:340px;border-radius:28px;padding:32px;overflow:hidden;box-shadow:0 12px 40px rgba(15, 125, 89, .28);background:#0f7d59;display:flex;flex-direction:column;justify-content:space-between;}
.pricingx .footer-left-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;}
.pricingx .footer-logo{display:flex;align-items:center;gap:10px;position:relative;z-index:1;}
.pricingx .footer-logo-mark{width:32px;height:32px;border-radius:8px;background:rgba(255, 255, 255, .15);border:1.5px solid rgba(255, 255, 255, .85);display:grid;place-items:center;}
.pricingx .footer-logo-mark svg{width:20px;height:20px;}
.pricingx .footer-logo-name{font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.02em;}
.pricingx .footer-tagline-container{margin-top:auto;margin-bottom:28px;position:relative;z-index:1;}
.pricingx .footer-tagline{font-size:19px;font-weight:400;color:#fff;line-height:1.45;text-shadow:0 1px 16px rgba(8, 40, 28, .5);}
.pricingx .footer-tagline span{color:rgba(255, 255, 255, .68);}
.pricingx .footer-social-row{display:flex;justify-content:space-between;align-items:center;gap:12px;position:relative;z-index:1;}
.pricingx .footer-social-label{font-family:'Caveat', cursive;font-size:17px;font-weight:600;color:rgba(255, 255, 255, .92);letter-spacing:.3px;}
.pricingx .footer-social-icons{display:flex;gap:7px;}
.pricingx .social-icon{width:36px;height:36px;border-radius:9px;background:#0e1014;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0, 0, 0, .35), 0 2px 6px rgba(0, 0, 0, .2);transition:background .2s, transform .15s, box-shadow .2s;cursor:pointer;}
.pricingx .social-icon svg{width:15px;height:15px;fill:#fff;}
.pricingx .social-icon:hover{background:#000;transform:translateY(-2px);box-shadow:0 10px 26px rgba(0, 0, 0, .45), 0 3px 9px rgba(0, 0, 0, .3);}
/* right */
.pricingx .footer-right{background:linear-gradient(155deg, rgba(255, 255, 255, .09), rgba(255, 255, 255, .03));-webkit-backdrop-filter:blur(30px) saturate(170%);backdrop-filter:blur(30px) saturate(170%);border:1px solid rgba(255, 255, 255, .16);border-radius:28px;padding:40px;overflow:visible;box-shadow:0 28px 80px -34px rgba(0, 0, 0, .7), inset 0 1px 0 rgba(255, 255, 255, .22);display:flex;flex-direction:column;justify-content:space-between;position:relative;}
.pricingx .footer-lucky-graphic{position:absolute;top:-36px;right:40px;z-index:10;display:flex;flex-direction:column;align-items:flex-start;gap:6px;}
.pricingx .lucky-cube{width:96px;height:96px;border-radius:22px;transform:rotate(-10deg);background:linear-gradient(135deg, #4fd9a6 0%, #16916a 55%, #0f7d59 100%);display:grid;place-items:center;box-shadow:inset 3px 3px 8px rgba(255, 255, 255, .35), inset -3px -3px 12px rgba(0, 0, 0, .18), 8px 14px 28px rgba(15, 125, 89, .35);}
.pricingx .lucky-cube-mark{font-size:42px;font-weight:700;color:#fff;letter-spacing:-0.04em;transform:rotate(10deg);text-shadow:0 3px 6px rgba(0, 0, 0, .25);line-height:1;}
.pricingx .lucky-text-row{display:flex;gap:6px;align-items:center;transform:rotate(-4deg);margin-top:4px;}
.pricingx .lucky-arrow{width:22px;height:22px;color:#9ca3af;}
.pricingx .lucky-arrow svg{width:100%;height:100%;}
.pricingx .lucky-arrow path{stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.pricingx .lucky-text{font-family:'Caveat', cursive;font-size:20px;font-weight:600;color:rgba(255, 255, 255, .5);white-space:nowrap;}
.pricingx .footer-right-top{padding-top:8px;}
.pricingx .footer-nav-cols{display:flex;gap:72px;}
.pricingx .footer-col-title{font-family:'Caveat', cursive;font-size:24px;font-weight:600;font-style:italic;color:rgba(255, 255, 255, .5);margin-bottom:18px;}
.pricingx .footer-col a{display:block;font-size:14px;font-weight:600;color:rgba(255, 255, 255, .86);margin-bottom:14px;transition:color .2s;}
.pricingx .footer-col a:hover{color:#5fe3b8;}
.pricingx .footer-bottom{display:flex;align-items:flex-end;justify-content:space-between;margin-top:48px;gap:24px;flex-wrap:wrap;}
.pricingx .footer-copyright{font-size:12.5px;font-weight:500;color:rgba(255, 255, 255, .55);}
.pricingx .footer-copyright a{color:rgba(255, 255, 255, .7);}
.pricingx .footer-cta-mini{display:flex;flex-direction:column;gap:14px;}
.pricingx .footer-cta-mini h4{font-size:15px;font-weight:400;color:rgba(255, 255, 255, .6);line-height:1.45;}
.pricingx .footer-cta-mini h4 strong{display:block;font-size:19px;font-weight:700;color:#fff;}
.pricingx .footer-subscribe-row{display:flex;width:310px;max-width:100%;background:rgba(255, 255, 255, .08);border:1px solid rgba(255, 255, 255, .18);border-radius:12px;padding:5px;box-shadow:0 2px 10px rgba(0, 0, 0, .04);align-items:center;gap:6px;flex-wrap:nowrap;}
.pricingx .footer-subscribe-row input{flex:1;min-width:0;padding:11px 14px;background:transparent;border:none;outline:none;font-family:'DM Sans', sans-serif;font-size:13.5px;color:#fff;}
.pricingx .footer-subscribe-row input::placeholder{color:rgba(255, 255, 255, .5);}
.pricingx .footer-subscribe-row button{padding:11px 22px;background:linear-gradient(180deg, #4fd9a6, #0f7d59);color:#06160e;font-family:'DM Sans', sans-serif;font-size:13.5px;font-weight:600;border:none;border-radius:8px;cursor:pointer;box-shadow:0 6px 20px rgba(0, 0, 0, .28), 0 2px 8px rgba(0, 0, 0, .15);transition:background .2s, box-shadow .2s, transform .15s;white-space:nowrap;flex-shrink:0;}
.pricingx .footer-subscribe-row button:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(0, 0, 0, .36);}
/* watermark */
.pricingx .footer-watermark{max-width:1150px;margin:-60px auto 0;pointer-events:none;user-select:none;position:relative;z-index:0;line-height:0;}
.pricingx .footer-watermark svg{display:block;width:100%;height:auto;overflow:visible;}
.pricingx .footer-watermark text{font-family:'DM Sans', sans-serif;font-weight:700;letter-spacing:-0.03em;fill:rgba(255, 255, 255, .05);}
@media(max-width:860px){.pricingx .footer-wrapper{grid-template-columns:1fr;}.pricingx .footer-left{min-height:auto;gap:40px;}}
@media(max-width:560px){.pricingx .footer-right{padding:24px;}.pricingx .footer-nav-cols{gap:40px;}.pricingx .footer-bottom{flex-direction:column;align-items:flex-start;gap:24px;}.pricingx .footer-subscribe-row{width:100%;}.pricingx .footer-lucky-graphic{right:12px;top:-28px;}.pricingx .lucky-cube{width:72px;height:72px;}.pricingx .lucky-cube-mark{font-size:32px;}}
@media(max-width:420px){.pricingx .footer-subscribe-row{flex-wrap:wrap;}.pricingx .footer-subscribe-row button{width:100%;}}

/* ===== page-transition overlay ===== */
.pricingx #pgxn{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;background:rgba(10, 16, 13, .22);-webkit-backdrop-filter:blur(2px) saturate(120%);backdrop-filter:blur(2px) saturate(120%);transition:opacity .42s cubic-bezier(.4, 0, .2, 1), backdrop-filter .42s cubic-bezier(.4, 0, .2, 1), -webkit-backdrop-filter .42s cubic-bezier(.4, 0, .2, 1);}
.pricingx #pgxn.show{opacity:1;-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);}
.pricingx #pgxn.cover{pointer-events:auto;}
.pricingx .pgx-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 46px 28px;border-radius:28px;background:linear-gradient(150deg, rgba(13, 46, 34, .64), rgba(7, 22, 16, .56));-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);border:1px solid rgba(255, 255, 255, .24);box-shadow:0 30px 90px -32px rgba(0, 30, 18, .6), inset 0 1px 0 rgba(255, 255, 255, .35);transform:scale(.9) translateY(8px);opacity:0;transition:transform .5s cubic-bezier(.22, 1, .36, 1), opacity .4s;}
.pricingx #pgxn.show .pgx-card{transform:none;opacity:1;}
.pricingx .pgx-svg{width:96px;height:96px;display:block;filter:drop-shadow(0 6px 18px rgba(22, 145, 106, .35));}
.pricingx .pgx-ring{transform-box:fill-box;transform-origin:center;animation:price-pgrot 7s linear infinite;}
.pricingx .pgx-ring2{transform-box:fill-box;transform-origin:center;animation:price-pgrot 5s linear infinite reverse;}
.pricingx .pgx-orbit{transform-box:fill-box;transform-origin:center;animation:price-pgrot 3.4s linear infinite;}
.pricingx .pgx-core{transform-box:fill-box;transform-origin:center;animation:price-pgpulse 1.8s ease-in-out infinite;}
.pricingx .pgx-scan{animation:price-pgscan 1.7s cubic-bezier(.5, 0, .5, 1) infinite;}
.pricingx .pgx-spark{animation:price-pgspark 1.8s ease-in-out infinite;}
@keyframes price-pgrot{to{transform:rotate(360deg);}}
@keyframes price-pgpulse{0%, 100%{transform:scale(1);}50%{transform:scale(1.06);}}
@keyframes price-pgscan{0%{transform:translateY(0);opacity:0;}15%{opacity:.95;}85%{opacity:.95;}100%{transform:translateY(34px);opacity:0;}}
@keyframes price-pgspark{0%, 100%{opacity:.2;}50%{opacity:.9;}}
.pricingx .pgx-label{font-family:inherit;font-size:14px;font-weight:600;color:#eafff5;letter-spacing:.01em;text-shadow:0 1px 8px rgba(0, 20, 12, .5);}
.pricingx .pgx-dots::after{content:"";animation:price-pgdots 1.4s steps(4, end) infinite;}
@keyframes price-pgdots{0%{content:"";}25%{content:"\\2009.";}50%{content:"\\2009..";}75%{content:"\\2009...";}}
.pricingx .pgx-sub{font-family:inherit;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(234, 255, 245, .55);}
@media(prefers-reduced-motion:reduce){.pricingx #pgxn{transition:opacity .14s;}.pricingx .pgx-ring, .pricingx .pgx-ring2, .pricingx .pgx-orbit, .pricingx .pgx-core, .pricingx .pgx-scan, .pricingx .pgx-spark{animation:none;}.pricingx .pgx-card{transition:none;}}
`;

type Feat = [string, number?];
type Tier = {
  name: string;
  m?: number;
  a?: number;
  custom?: boolean;
  billed: string;
  desc: string;
  cta: string;
  href: string;
  ctaClass: string;
  pop?: boolean;
  hdr: string;
  feats: Feat[];
};

const TIERS: Tier[] = [
  {
    name: "Free", m: 0, a: 0, billed: "Free forever", desc: "For trying ATS on a single role.",
    cta: "Get started", href: "/get-started", ctaClass: "btn-glass lg",
    hdr: "Includes",
    feats: [["1 active requisition"], ["Up to 50 candidates / mo"], ["AI screening (10 / mo)", 1], ["Email support"]],
  },
  {
    name: "Starter", m: 149, a: 119, billed: "per month", desc: "For small teams hiring steadily.",
    cta: "Start free trial", href: "/get-started", ctaClass: "btn-glass lg",
    hdr: "Everything in Free, plus",
    feats: [["Up to 5 requisitions"], ["500 candidates / mo"], ["Full AI screening + evidence", 1], ["Custom screening fields"], ["Core integrations"]],
  },
  {
    name: "Professional", m: 399, a: 319, billed: "per month", desc: "For scaling teams that need fairness at scale.",
    cta: "Start free trial", href: "/get-started", ctaClass: "btn-emerald", pop: 1 as unknown as undefined,
    hdr: "Everything in Starter, plus",
    feats: [["Unlimited requisitions"], ["Adverse-impact bias auditing", 1], ["Agent reasoning + Copilot", 1], ["Advanced analytics & API"], ["Priority support"]],
  },
  {
    name: "Enterprise", custom: true, billed: "Annual contract", desc: "For organizations with security and scale needs.",
    cta: "Contact sales", href: "/contact", ctaClass: "btn-white",
    hdr: "Everything in Pro, plus",
    feats: [["SSO / SAML & SCIM"], ["Unlimited seats & workspaces"], ["Dedicated success manager"], ["Custom data retention & SLA"], ["Audit, security & DPA review"]],
  },
];

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const Spark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" /></svg>
);

function money(n: number) {
  return n.toLocaleString();
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vidIn, setVidIn] = useState(false);
  const [subDone, setSubDone] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subErr, setSubErr] = useState(false);
  const vid = useRef<HTMLVideoElement>(null);
  const watermarkSvg = useRef<SVGSVGElement>(null);
  const watermarkText = useRef<SVGTextElement>(null);

  // video fade-in (mirror loadeddata + play().then(go))
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    const go = () => setVidIn(true);
    const onLoaded = () => {
      const p = v.play();
      if (p && typeof p.then === "function") p.then(go).catch(() => {});
      else go();
    };
    v.addEventListener("loadeddata", onLoaded);
    if (v.readyState >= 2) onLoaded();
    return () => v.removeEventListener("loadeddata", onLoaded);
  }, []);

  // watermark: fit the viewBox to the rendered text bbox once fonts are ready
  useEffect(() => {
    const fit = () => {
      const svg = watermarkSvg.current;
      const text = watermarkText.current;
      if (!svg || !text) return;
      try {
        const b = text.getBBox();
        svg.setAttribute("viewBox", `${b.x} ${b.y} ${b.width} ${b.height}`);
      } catch {}
    };
    const anyDoc = document as unknown as { fonts?: { ready?: Promise<unknown> } };
    if (anyDoc.fonts && anyDoc.fonts.ready) anyDoc.fonts.ready.then(fit);
    else window.addEventListener("load", fit);
    window.addEventListener("resize", fit);
    const t = setTimeout(fit, 400);
    return () => {
      window.removeEventListener("load", fit);
      window.removeEventListener("resize", fit);
      clearTimeout(t);
    };
  }, []);

  function onSubscribe() {
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(subEmail)) {
      setSubDone(true);
      setSubEmail("");
      setSubErr(false);
      setTimeout(() => setSubDone(false), 1800);
    } else {
      setSubErr(true);
      setTimeout(() => setSubErr(false), 1200);
    }
  }

  const go = (href: string) => () => {
    window.location.href = href;
  };

  return (
    <div className="pricingx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bg-aurora" aria-hidden="true"><i className="a" /><i className="b" /></div>
      <video ref={vid} id="bgv" className={vidIn ? "in" : ""} muted autoPlay loop playsInline preload="auto" aria-hidden="true"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4" />
      <div className="veil" aria-hidden="true" />

      <div className="page">
        <nav>
          <a className="logo" href="/welcome"><img src="/assets/logo-dark.png" alt="TalentFlow ATS" style={{ height: 30, width: "auto", display: "block" }} /></a>
          <div className="navpill lg">
            <a href="/welcome">Product</a>
            <a href="/pricing" className="on">Pricing</a>
            <a href="/welcome">Customers</a>
            <a href="/support">Help</a>
          </div>
          <div className="navcta">
            <a href="/login"><button className="btn btn-glass lg">Sign in</button></a>
            <a href="/get-started"><button className="btn btn-white">Start free</button></a>
            <button className="btn btn-glass lg burger" aria-label="Menu" onClick={() => setMobileOpen((o) => !o)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
          </div>
          <div className={"mobile lg" + (mobileOpen ? " open" : "")}>
            <a href="/welcome" onClick={() => setMobileOpen(false)}>Product</a><a href="/pricing" onClick={() => setMobileOpen(false)}>Pricing</a><a href="/welcome" onClick={() => setMobileOpen(false)}>Customers</a><a href="/support" onClick={() => setMobileOpen(false)}>Help</a>
            <div className="row"><a href="/login" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}><button className="btn btn-glass lg" style={{ width: "100%" }}>Sign in</button></a><a href="/get-started" style={{ flex: 1 }} onClick={() => setMobileOpen(false)}><button className="btn btn-white" style={{ width: "100%" }}>Start free</button></a></div>
          </div>
        </nav>

        <header className="hero">
          <span className="eyebrow lg"><span className="dot" /> Simple, transparent pricing</span>
          <h1>Pricing that scales with <em>how you hire.</em></h1>
          <p>Start free, upgrade when you&apos;re ready. Every plan includes evidence-backed AI screening, human-in-the-loop controls, and candidate transparency, because trust isn&apos;t a premium add-on.</p>
          <div className="toggle lg">
            <button className={cycle === "monthly" ? "on" : ""} onClick={() => setCycle("monthly")}>Monthly</button>
            <button className={cycle === "annual" ? "on" : ""} onClick={() => setCycle("annual")}>Annual</button>
            <span className="save">Save 20%</span>
          </div>
        </header>

        <section className="tiers">
          {TIERS.map((t) => {
            let price: React.ReactNode;
            if (t.custom) {
              price = <div className="price"><span className="amt" style={{ fontSize: 34 }}>Custom</span></div>;
            } else if (t.m === 0) {
              price = <div className="price"><span className="cur">$</span><span className="amt">0</span></div>;
            } else {
              const v = cycle === "annual" ? (t.a as number) : (t.m as number);
              price = <div className="price"><span className="cur">$</span><span className="amt">{money(v)}</span><span className="per">/ mo</span></div>;
            }
            const billed = t.custom || t.m === 0 ? t.billed : cycle === "annual" ? "billed yearly" : "billed monthly";
            return (
              <div className={"tier lg" + (t.pop ? " pop" : "")} key={t.name}>
                {t.pop && <span className="badge">Most popular</span>}
                <div className="tname">{t.name}</div>
                {price}
                <div className="billed">{billed}</div>
                <div className="desc">{t.desc}</div>
                <button className={"btn " + t.ctaClass} onClick={go(t.href)}>{t.cta}</button>
                <div className="feats">
                  <div className="h">{t.hdr}</div>
                  {t.feats.map((f, i) => (
                    <div className={"feat" + (f[1] ? " ai" : "")} key={i}>{f[1] ? <Spark /> : <Check />}<span>{f[0]}</span></div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <div className="trust">
          <span className="chip lg"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" /><path d="M9 12l2 2 4-4" /></svg> EEOC-ready compliance on every plan</span>
          <span className="chip lg"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" /></svg> AI is advisory, a human always decides</span>
          <span className="chip lg"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Cancel anytime, no lock-in</span>
        </div>
        <div className="foot">ATS · Prices in USD. Annual plans billed yearly at a 20% discount.</div>
      </div>

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
                  <a href="/welcome">How it works</a><a href="/welcome">AI Agents</a><a href="/pricing">Pricing</a><a href="/welcome">Customers</a><a href="/support">Help &amp; FAQ</a>
                </div>
                <div className="footer-col">
                  <div className="footer-col-title">Company</div>
                  <a href="/welcome">Careers</a><a href="/welcome">About</a><a href="/support">Terms &amp; Conditions</a><a href="/support">Privacy Policy</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-copyright">© 2026 TalentFlow. All rights reserved.<br /><span style={{ opacity: 0.9, display: "inline-flex", gap: 7, flexWrap: "wrap", marginTop: 6 }}><span>SOC 2 Type II</span> · <span>GDPR</span> · <span>EEOC-ready</span> · <a href="#" style={{ color: "#9ca3af", textDecoration: "underline" }}>System status</a></span></div>
              <div className="footer-cta-mini">
                <h4>AI moves fast.<br /><strong>Hire ahead with TalentFlow.</strong></h4>
                <div className="footer-subscribe-row">
                  <input type="email" placeholder="Enter email address" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} style={subErr ? { boxShadow: "0 0 0 2px #ef6b5e" } : undefined} />
                  <button type="button" onClick={onSubscribe}>{subDone ? "Subscribed ✓" : "Subscribe"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-watermark" aria-hidden="true">
          <svg ref={watermarkSvg} viewBox="62 95 876 175" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <text ref={watermarkText} x="500" y="240" textAnchor="middle" fontSize="320">TalentFlow</text>
          </svg>
        </div>
      </section>
    </div>
  );
}
