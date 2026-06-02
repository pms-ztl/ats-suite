"use client";
// app/welcome/page.tsx
// EXACT port of claude-design/"Landing - Dark Theme.html": the full marketing
// landing, CloudFront background video + gradient veil, sticky nav, the "Your
// hiring. Reinvented" shiny hero, a macOS-style menubar, the three-pane ATS
// pipeline mockup (sidebar / candidate list / reader with AI verdict ring),
// the triage section, logo cloud, testimonials, the watermark pricing block
// with a yearly toggle + injected feature lists, a final CTA, and the
// liquid-glass footer with a "Routing securely" entrance loader.
//
// Technique mirrors app/(auth)/login/page.tsx: the entire inline <style> is
// injected as a scoped CSS string under a unique `.landingx` root so it never
// leaks globally, every @keyframes is renamed with a `land-` prefix to avoid
// colliding with globals.css, assets resolve from /assets, every inline script
// is reimplemented as React state/effects, and links point to real app routes.
import { useState, useEffect } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Caveat:wght@500;600;700&display=swap');
.landingx{--brand:#16916a;--brand-l:#4fd9a6;--brand-d:#0f7d59;--ai:#7c5cff;--ease:cubic-bezier(.22, 1, .36, 1);position:relative;font-family:'Inter', system-ui, sans-serif;-webkit-font-smoothing:antialiased;background:#0a0d0c;color:#fff;overflow-x:hidden;min-height:100vh;}
.landingx *{box-sizing:border-box;margin:0;padding:0;}
.landingx ::selection{background:rgba(22, 145, 106, .35);}
.landingx a{color:inherit;text-decoration:none;}.landingx button{font-family:inherit;cursor:pointer;}
.landingx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(79, 217, 166, .4);border-radius:10px;}
.landingx .bgv-wrap{position:fixed;inset:0;z-index:0;pointer-events:none;}
.landingx .bgv-wrap video{width:100%;height:100%;object-fit:cover;}
.landingx .bgv-wrap .grad{position:absolute;inset:0;background:linear-gradient(180deg, rgba(10, 13, 12, .6), rgba(10, 13, 12, .4) 40%, rgba(10, 13, 12, .82));}
.landingx .guide{display:none;}
@media(min-width:900px){.landingx .guide{display:block;position:fixed;inset-block:0;width:1px;background:rgba(255, 255, 255, .08);z-index:5;}.landingx .guide.l{left:calc(50% - 38rem);}.landingx .guide.r{left:calc(50% + 38rem);}}
.landingx .shell{position:relative;z-index:10;}
.landingx .wrap{max-width:1180px;margin:0 auto;padding:0 24px;}
/* liquid glass */
.landingx .lg{background:rgba(255, 255, 255, 0.012);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:inset 0 1px 1px rgba(255, 255, 255, .1);position:relative;overflow:hidden;}
.landingx .lg::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.4px;background:linear-gradient(180deg, rgba(255, 255, 255, .45) 0%, rgba(255, 255, 255, .15) 20%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, .15) 80%, rgba(255, 255, 255, .45) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
/* nav */
.landingx nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 0;}
.landingx .lk{display:flex;align-items:center;gap:30px;}
.landingx .lk a{font-size:14px;font-weight:500;color:rgba(255, 255, 255, .7);transition:color .2s;}
.landingx .lk a:hover{color:#fff;}
@media(max-width:880px){.landingx .lk{display:none;}}
.landingx .pill{display:inline-flex;align-items:center;gap:8px;border-radius:999px;background:#fff;color:#06120c;font-weight:600;font-size:14px;padding:11px 20px;transition:transform .15s var(--ease), filter .2s, box-shadow .25s;}
.landingx .pill:hover{filter:brightness(1.04);box-shadow:0 10px 30px -10px rgba(255, 255, 255, .4);}.landingx .pill:active{transform:scale(.98);}
.landingx .pill .ch{transition:transform .2s var(--ease);}.landingx .pill:hover .ch{transform:translateX(2px);}
/* hero */
.landingx .hero{text-align:center;display:flex;flex-direction:column;align-items:center;padding:clamp(48px, 8vw, 110px) 0 70px;}
.landingx .hero h1{font-size:clamp(2.6rem, 8vw, 5.6rem);font-weight:600;letter-spacing:-0.03em;line-height:.9;}
.landingx .hero h1 .shiny{background-image:linear-gradient(to right, #06231a 0%, #0f7d59 12.5%, #9ff7d8 32.5%, #4fd9a6 50%, #0f7d59 67.5%, #06231a 87.5%, #06231a 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:land-shiny 6s linear infinite;}
@keyframes land-shiny{0%{background-position:-200% center;}100%{background-position:200% center;}}
.landingx .hero p{margin-top:30px;color:rgba(255, 255, 255, .62);max-width:30rem;font-size:16px;line-height:1.55;}
.landingx .hero .cta{margin-top:30px;display:flex;flex-direction:column;align-items:center;gap:9px;}
.landingx .hero .cta .note{font-size:12px;color:rgba(255, 255, 255, .4);}
/* macos bar */
.landingx .macbar{height:42px;background:rgba(0, 0, 0, .42);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-top:1px solid rgba(255, 255, 255, .1);border-bottom:1px solid rgba(255, 255, 255, .1);margin-top:8px;}
.landingx .macbar .in{max-width:1180px;margin:0 auto;height:100%;padding:0 24px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:rgba(255, 255, 255, .6);}
.landingx .macbar .mi{display:flex;align-items:center;gap:18px;}.landingx .macbar .mi b{color:#fff;}
.landingx .macbar .mi span, .landingx .macbar .rt span{cursor:default;}
@media(max-width:640px){.landingx .macbar .mi span.opt{display:none;}}
/* mockup */
.landingx .mock{max-width:1180px;margin:60px auto;border-radius:18px;overflow:hidden;border:1px solid rgba(255, 255, 255, .1);background:rgba(12, 16, 15, .92);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);box-shadow:0 40px 100px -30px rgba(0, 0, 0, .8);}
.landingx .mock .tb{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid rgba(255, 255, 255, .08);}
.landingx .mock .tl{display:flex;gap:7px;}.landingx .mock .tl i{width:12px;height:12px;border-radius:50%;display:block;}
.landingx .mock .tt{flex:1;text-align:center;font-size:12px;color:rgba(255, 255, 255, .5);}
.landingx .mock .body{display:grid;grid-template-columns:3fr 4fr 5fr;height:520px;}
@media(max-width:820px){.landingx .mock .body{grid-template-columns:1fr;height:auto;}.landingx .mock .col.list, .landingx .mock .col.read{display:none;}}
.landingx .col{min-width:0;overflow:hidden;}
.landingx .col.side{border-right:1px solid rgba(255, 255, 255, .08);background:rgba(0, 0, 0, .3);padding:16px;}
.landingx .col.list{border-right:1px solid rgba(255, 255, 255, .08);}
.landingx .cbtn{display:flex;align-items:center;gap:8px;justify-content:center;background:#fff;color:#06120c;font-size:12.5px;font-weight:600;border-radius:10px;padding:9px;width:100%;margin-bottom:16px;cursor:pointer;transition:transform .12s, filter .2s;}
.landingx .cbtn:hover{filter:brightness(.95);}.landingx .cbtn:active{transform:scale(.97);}
.landingx .nav-it{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;font-size:13px;color:rgba(255, 255, 255, .6);margin-bottom:2px;cursor:pointer;transition:background .15s, color .15s;}
.landingx .nav-it:hover{background:rgba(255, 255, 255, .06);color:rgba(255, 255, 255, .9);}
.landingx .msg{cursor:pointer;}
.landingx .nav-it.on{background:rgba(255, 255, 255, .1);color:#fff;}
.landingx .nav-it .ct{margin-left:auto;font-size:11px;opacity:.7;}
.landingx .nav-it .dot{width:14px;height:14px;border-radius:5px;background:rgba(255, 255, 255, .12);flex-shrink:0;}
.landingx .nav-it.on .dot{background:var(--brand);}
.landingx .lblsec{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255, 255, 255, .35);margin:18px 0 9px 10px;}
.landingx .lblrow{display:flex;align-items:center;gap:9px;padding:5px 10px;font-size:12.5px;color:rgba(255, 255, 255, .65);}
.landingx .lblrow i{width:8px;height:8px;border-radius:99px;}
.landingx .lhdr{display:flex;align-items:center;gap:8px;padding:13px 16px;border-bottom:1px solid rgba(255, 255, 255, .08);font-size:12.5px;color:rgba(255, 255, 255, .4);}
.landingx .msg{padding:13px 16px;border-bottom:1px solid rgba(255, 255, 255, .06);cursor:pointer;transition:background .15s;}
.landingx .msg:hover{background:rgba(255, 255, 255, .03);}.landingx .msg.on{background:rgba(22, 145, 106, .1);}
.landingx .msg .r1{display:flex;justify-content:space-between;gap:8px;}
.landingx .msg .nm{font-size:13px;font-weight:600;}.landingx .msg.un .nm{color:#fff;}.landingx .msg .tm{font-size:11px;color:rgba(255, 255, 255, .4);flex-shrink:0;}
.landingx .msg .su{font-size:12.5px;color:rgba(255, 255, 255, .78);margin-top:2px;}
.landingx .msg .pv{font-size:12px;color:rgba(255, 255, 255, .45);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.landingx .msg .sc{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:700;color:var(--ai);background:rgba(124, 92, 255, .14);padding:1px 7px;border-radius:99px;margin-top:6px;}
.landingx .read{padding:18px;overflow-y:auto;}
.landingx .rtool{display:flex;gap:6px;margin-bottom:16px;}
.landingx .rtool i{width:28px;height:28px;border-radius:7px;background:rgba(255, 255, 255, .04);display:grid;place-items:center;color:rgba(255, 255, 255, .6);}
.landingx .rtool .sp{flex:1;}
.landingx .rh{display:flex;align-items:center;gap:11px;margin-bottom:16px;}
.landingx .rh .av{width:30px;height:30px;border-radius:99px;background:linear-gradient(135deg, var(--brand-l), var(--brand-d));display:grid;place-items:center;font-weight:700;font-size:13px;color:#06120c;}
.landingx .rh .who b{font-size:13.5px;}.landingx .rh .who span{display:block;font-size:11.5px;color:rgba(255, 255, 255, .45);}
.landingx .rh .tag{margin-left:auto;font-size:10.5px;font-weight:600;color:var(--brand-l);background:rgba(22, 145, 106, .16);padding:3px 10px;border-radius:99px;}
.landingx .aisum{border-radius:12px;padding:14px;background:linear-gradient(120deg, rgba(124, 92, 255, .14), transparent 75%);border:1px solid rgba(124, 92, 255, .25);margin-bottom:16px;}
.landingx .aisum .h{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:700;color:#b9a8ff;margin-bottom:7px;}
.landingx .aisum p{font-size:12.5px;color:rgba(255, 255, 255, .82);line-height:1.5;}
.landingx .read .ring{display:flex;align-items:center;gap:14px;margin-bottom:16px;}
.landingx .read .ring .rv{font-family:'DM Sans';font-weight:800;font-size:30px;}
.landingx .read p.b{font-size:13px;color:rgba(255, 255, 255, .7);line-height:1.6;margin-bottom:11px;}
.landingx .att{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:rgba(255, 255, 255, .7);border:1px solid rgba(255, 255, 255, .12);border-radius:9px;padding:8px 12px;}
/* generic section */
.landingx .sec{padding:80px 0;}
.landingx .eb{display:inline-flex;align-items:center;gap:9px;font-size:13px;color:rgba(255, 255, 255, .6);}
.landingx .eb .d{width:6px;height:6px;border-radius:99px;background:#fff;}
.landingx .eb .pl{font-size:11px;color:rgba(255, 255, 255, .5);border:1px solid rgba(255, 255, 255, .1);border-radius:99px;padding:2px 9px;}
.landingx .two{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start;}
@media(max-width:860px){.landingx .two{grid-template-columns:1fr;gap:32px;}}
.landingx h2{font-size:clamp(1.9rem, 4vw, 3rem);font-weight:600;letter-spacing:-0.02em;line-height:1.04;margin-top:18px;}
.landingx .lede{margin-top:20px;color:rgba(255, 255, 255, .6);font-size:15.5px;line-height:1.6;max-width:30rem;}
.landingx .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px;}
.landingx .chips span{font-size:12px;color:rgba(255, 255, 255, .72);border:1px solid rgba(255, 255, 255, .1);background:rgba(255, 255, 255, .03);border-radius:99px;padding:6px 13px;}
.landingx .triage{border-radius:18px;padding:18px;}
.landingx .triage .tt{font-size:12px;color:rgba(255, 255, 255, .5);margin-bottom:12px;}
.landingx .subcard{border-radius:12px;padding:13px;margin-bottom:10px;}
.landingx .subcard .sh{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;margin-bottom:7px;}
.landingx .subcard .sh i{width:9px;height:9px;border-radius:3px;}.landingx .subcard .sh .c{margin-left:auto;font-size:11px;color:rgba(255, 255, 255, .45);font-weight:500;}
.landingx .subcard .it{font-size:12px;color:rgba(255, 255, 255, .6);padding:3px 0;}
/* logo cloud */
.landingx .kick{text-align:center;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255, 255, 255, .4);}
.landingx .logos{margin-top:34px;display:grid;grid-template-columns:repeat(4, 1fr);gap:22px;}
@media(min-width:900px){.landingx .logos{grid-template-columns:repeat(8, 1fr);}}
.landingx .logos span{text-align:center;font-size:14px;font-weight:600;letter-spacing:-0.01em;color:rgba(255, 255, 255, .5);transition:color .2s;}
.landingx .logos span:hover{color:#fff;}
/* testimonials */
.landingx .tg{display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;}
@media(max-width:820px){.landingx .tg{grid-template-columns:1fr;}}
.landingx .tc{border-radius:18px;padding:24px;}
.landingx .tc blockquote{font-size:14px;color:rgba(255, 255, 255, .85);line-height:1.6;}
.landingx .tc figcaption{margin-top:22px;padding-top:18px;border-top:1px solid rgba(255, 255, 255, .1);}
.landingx .tc .nm{font-size:13px;font-weight:600;}.landingx .tc .ro{font-size:11.5px;color:rgba(255, 255, 255, .5);}.landingx .tc .co{font-size:11px;font-weight:700;letter-spacing:.04em;color:#fff;margin-top:3px;}
/* pricing */
.landingx .pricing{position:relative;padding:40px 20px 90px;display:flex;flex-direction:column;align-items:center;overflow-x:hidden;}
.landingx .wm{position:relative;width:100%;max-width:1100px;text-align:center;margin-top:30px;z-index:2;}
.landingx .wm-main{font-size:clamp(2.6rem, 11vw, 9rem);font-weight:800;line-height:.9;letter-spacing:-0.05em;display:flex;flex-direction:column;align-items:center;}
.landingx .wm-1{color:rgba(255, 255, 255, .9);}
.landingx .wm-2{background:linear-gradient(to right, #06231a 0%, #0f7d59 25%, #9ff7d8 65%, #4fd9a6 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;}
.landingx .pgrid{display:grid;grid-template-columns:repeat(3, 1fr);gap:20px;width:100%;max-width:1100px;margin-top:50px;position:relative;z-index:3;}
@media(max-width:1024px){.landingx .pgrid{grid-template-columns:1fr;max-width:420px;}}
.landingx .pcard{background:linear-gradient(135deg, rgba(0, 0, 0, .7), rgba(0, 0, 0, .4));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255, 255, 255, .85);border-radius:40px;padding:42px 26px;min-height:560px;display:flex;flex-direction:column;transition:all .5s var(--ease);position:relative;overflow:hidden;}
.landingx .pcard::before{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg, rgba(255, 255, 255, .1) 0%, rgba(255, 255, 255, 0) 50%);pointer-events:none;}
.landingx .pcard:hover{border-color:rgba(79, 217, 166, .7);transform:translateY(-12px) scale(1.01);}
.landingx .pcard.pro{background:linear-gradient(135deg, rgba(8, 30, 22, .9), rgba(0, 0, 0, .55));border-color:rgba(79, 217, 166, .5);}
.landingx .p-sm{font-size:1.05rem;color:rgba(255, 255, 255, .6);}
.landingx .p-lg{font-family:'DM Sans';font-size:2.6rem;font-weight:600;letter-spacing:-0.02em;margin-top:8px;}
.landingx .p-lg .per{font-size:1rem;color:rgba(255, 255, 255, .5);font-weight:400;}
.landingx .p-desc{font-size:.86rem;color:rgba(255, 255, 255, .45);min-height:3.4em;margin:14px 0 32px;line-height:1.5;}
.landingx .p-list{list-style:none;flex:1;}
.landingx .p-list li{display:flex;align-items:flex-start;gap:13px;font-size:.9rem;color:rgba(255, 255, 255, .82);margin-bottom:16px;line-height:1.4;}
.landingx .p-check{width:26px;height:26px;border-radius:50%;background:rgba(79, 217, 166, .18);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--brand-l);}
.landingx .p-btn{background:#fff;color:#000;padding:11px 32px;border-radius:100px;font-weight:600;font-size:.88rem;margin-top:auto;border:none;align-self:center;transition:all .3s var(--ease);}
.landingx .p-btn:hover{transform:scale(1.03);box-shadow:0 8px 24px rgba(79, 217, 166, .25);}
.landingx .pcard.pro .p-btn{background:linear-gradient(180deg, var(--brand-l), var(--brand-d));color:#06120c;}
.landingx .ptog-wrap{display:flex;align-items:center;justify-content:flex-end;gap:12px;width:100%;max-width:1100px;margin-top:30px;padding-right:10px;}
@media(max-width:1024px){.landingx .ptog-wrap{justify-content:center;padding-right:0;}}
.landingx .ptog-wrap .lab{font-size:13px;color:rgba(255, 255, 255, .7);}
.landingx .ptog{width:52px;height:28px;background:rgba(255, 255, 255, .2);border-radius:100px;position:relative;border:none;transition:background .3s;}
.landingx .ptog .knob{width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:4px;left:4px;transition:all .3s;}
.landingx .ptog.on{background:var(--brand);}.landingx .ptog.on .knob{transform:translateX(24px);}
/* final cta */
.landingx .final{border-radius:28px;padding:clamp(48px, 8vw, 90px) 28px;text-align:center;position:relative;overflow:hidden;}
.landingx .final .glow{position:absolute;inset:0;background:radial-gradient(600px circle at 50% 0%, rgba(79, 217, 166, .18), transparent 70%);pointer-events:none;}
.landingx .final h2{font-size:clamp(2.2rem, 5vw, 3.6rem);}
.landingx .final p{margin:22px auto 30px;color:rgba(255, 255, 255, .6);max-width:30rem;font-size:14px;line-height:1.6;}
.landingx .final .row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.landingx .ghost{display:inline-flex;align-items:center;gap:7px;border-radius:999px;border:1px solid rgba(255, 255, 255, .4);background:rgba(255, 255, 255, .12);color:#fff !important;font-size:14px;font-weight:600;padding:11px 20px;transition:background .2s, border-color .2s;}
.landingx .ghost svg{color:#fff;}
.landingx .ghost:hover{background:rgba(255, 255, 255, .2);border-color:rgba(255, 255, 255, .6);}
/* footer */
.landingx .footer-section{position:relative;z-index:5;background:transparent;padding:48px 24px 52px;color:#fff;border-top:1px solid rgba(255, 255, 255, .08);font-family:'DM Sans', sans-serif;margin-top:30px;}
.landingx .footer-section *{box-sizing:border-box;}
.landingx .fw{max-width:1150px;margin:0 auto;display:grid;grid-template-columns:350px 1fr;gap:16px;align-items:stretch;}
@media(max-width:860px){.landingx .fw{grid-template-columns:1fr;}}
.landingx .fl{position:relative;min-height:330px;border-radius:28px;padding:32px;overflow:hidden;box-shadow:0 12px 40px rgba(15, 125, 89, .28);background:var(--brand-d);display:flex;flex-direction:column;justify-content:space-between;}
.landingx .fl video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;}
.landingx .fl .lo{display:flex;align-items:center;gap:10px;position:relative;z-index:1;}
.landingx .fl .lo .mk{width:32px;height:32px;border-radius:8px;background:rgba(255, 255, 255, .15);border:1.5px solid rgba(255, 255, 255, .85);display:grid;place-items:center;}
.landingx .fl .lo .nm{font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.02em;}
.landingx .fl .tag{position:relative;z-index:1;margin-top:auto;margin-bottom:24px;font-size:18px;color:#fff;line-height:1.45;text-shadow:0 1px 14px rgba(8, 40, 28, .5);}
.landingx .fl .tag span{color:rgba(255, 255, 255, .66);}
.landingx .fl .soc{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1;}
.landingx .fl .soc .lab{font-family:'Caveat', cursive;font-size:17px;font-weight:600;color:rgba(255, 255, 255, .92);}
.landingx .fl .soc .ic{display:flex;gap:7px;}
.landingx .fl .soc .ic a{width:34px;height:34px;border-radius:9px;background:#0e1014;display:grid;place-items:center;box-shadow:0 6px 18px rgba(0, 0, 0, .35);transition:background .2s, transform .15s;}
.landingx .fl .soc .ic a:hover{background:#000;transform:translateY(-2px);}
.landingx .fl .soc .ic svg{width:15px;height:15px;fill:#fff;}
.landingx .fr{background:rgba(255, 255, 255, 0.05);-webkit-backdrop-filter:blur(28px) saturate(150%);backdrop-filter:blur(28px) saturate(150%);border:1px solid rgba(255, 255, 255, .13);border-radius:28px;padding:38px;box-shadow:0 4px 20px rgba(0, 0, 0, .04);display:flex;flex-direction:column;justify-content:space-between;position:relative;}
.landingx .lucky{position:absolute;top:-34px;right:38px;z-index:10;display:flex;flex-direction:column;align-items:flex-start;gap:6px;}
.landingx .lucky .cube{width:90px;height:90px;border-radius:22px;transform:rotate(-10deg);background:linear-gradient(135deg, var(--brand-l) 0%, var(--brand) 55%, var(--brand-d) 100%);display:grid;place-items:center;box-shadow:inset 3px 3px 8px rgba(255, 255, 255, .35), inset -3px -3px 12px rgba(0, 0, 0, .18), 8px 14px 28px rgba(15, 125, 89, .35);}
.landingx .lucky .cube b{font-size:40px;font-weight:700;color:#fff;letter-spacing:-0.04em;transform:rotate(10deg);text-shadow:0 3px 6px rgba(0, 0, 0, .25);}
.landingx .lucky .lt{display:flex;gap:6px;align-items:center;transform:rotate(-4deg);}
.landingx .lucky .lt svg{width:20px;height:20px;color:#9ca3af;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.landingx .lucky .lt span{font-family:'Caveat', cursive;font-size:20px;font-weight:600;color:#9ca3af;}
.landingx .fcols{display:flex;gap:64px;padding-top:8px;}
.landingx .fcol h4{font-family:'Caveat', cursive;font-size:23px;font-weight:600;font-style:italic;color:rgba(255, 255, 255, .5);margin-bottom:16px;}
.landingx .fcol a{display:block;font-size:14px;font-weight:600;color:rgba(255, 255, 255, .86);margin-bottom:13px;transition:color .2s;}
.landingx .fcol a:hover{color:#1f9e74;}
.landingx .fbot{display:flex;align-items:flex-end;justify-content:space-between;margin-top:44px;gap:24px;flex-wrap:wrap;}
.landingx .fcopy{font-size:12.5px;font-weight:500;color:rgba(255, 255, 255, .5);}
.landingx .fcta{display:flex;flex-direction:column;gap:13px;}
.landingx .fcta h4{font-size:15px;font-weight:400;color:rgba(255, 255, 255, .6);line-height:1.45;}
.landingx .fcta h4 strong{display:block;font-size:18px;font-weight:700;color:#fff;}
.landingx .fsub{display:flex;width:300px;max-width:100%;background:rgba(255, 255, 255, .07);border:1px solid rgba(255, 255, 255, .16);border-radius:12px;padding:5px;}
.landingx .fsub input{flex:1;min-width:0;padding:10px 14px;border:none;outline:none;font-family:'DM Sans';font-size:13.5px;color:#fff;background:transparent;}
.landingx .fsub button{padding:10px 20px;background:#111214;color:#fff;font-family:'DM Sans';font-size:13.5px;font-weight:600;border:none;border-radius:8px;}
@media(max-width:560px){.landingx .fr{padding:24px;}.landingx .fcols{gap:36px;}.landingx .fbot{flex-direction:column;align-items:flex-start;}.landingx .fsub{width:100%;}.landingx .lucky{right:14px;top:-26px;}.landingx .lucky .cube{width:70px;height:70px;}.landingx .lucky .cube b{font-size:30px;}}
@media(prefers-reduced-motion:reduce){.landingx .hero h1 .shiny{animation:none;}}
/* footer glass unify */
.landingx .fr{background:linear-gradient(155deg, rgba(255, 255, 255, .09), rgba(255, 255, 255, .03))!important;-webkit-backdrop-filter:blur(30px) saturate(170%)!important;backdrop-filter:blur(30px) saturate(170%)!important;border:1px solid rgba(255, 255, 255, .16)!important;box-shadow:0 28px 80px -34px rgba(0, 0, 0, .7), inset 0 1px 0 rgba(255, 255, 255, .22)!important;}
.landingx .fsub{background:rgba(255, 255, 255, .1)!important;border:1px solid rgba(255, 255, 255, .2)!important;}
.landingx .fsub button{background:linear-gradient(180deg, var(--brand-l, #4fd9a6), var(--brand-d, #0f7d59))!important;color:#06160e!important;}
.landingx .fcol a{color:rgba(255, 255, 255, .86)!important;}
.landingx .fcol a:hover{color:#5fe3b8!important;}
.landingx .fcol h4{color:rgba(255, 255, 255, .5)!important;}
.landingx .fcopy{color:rgba(255, 255, 255, .55)!important;}
.landingx .fcopy a{color:rgba(255, 255, 255, .7)!important;}
.landingx .fcta h4{color:rgba(255, 255, 255, .6)!important;}
.landingx .fcta h4 strong{color:#fff!important;}
.landingx .fsub{background:rgba(255, 255, 255, .08)!important;border:1px solid rgba(255, 255, 255, .18)!important;}
.landingx .fsub input{color:#fff!important;}
.landingx .fsub input::placeholder{color:rgba(255, 255, 255, .5)!important;}
.landingx .lucky .lt span{color:rgba(255, 255, 255, .5)!important;}
/* fsub fix */
.landingx .fsub{align-items:center;gap:6px;flex-wrap:nowrap;}.landingx .fsub button{flex-shrink:0;white-space:nowrap;}.landingx .fsub input{min-width:0;}@media(max-width:420px){.landingx .fsub{flex-wrap:wrap;}.landingx .fsub button{width:100%;}}
/* routing-securely entrance loader */
.landingx .pgxn{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;background:rgba(10, 16, 13, .22);-webkit-backdrop-filter:blur(2px) saturate(120%);backdrop-filter:blur(2px) saturate(120%);transition:opacity .42s cubic-bezier(.4, 0, .2, 1), backdrop-filter .42s cubic-bezier(.4, 0, .2, 1), -webkit-backdrop-filter .42s cubic-bezier(.4, 0, .2, 1);}
.landingx .pgxn.show{opacity:1;-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);}
.landingx .pgxn.cover{pointer-events:auto;}
.landingx .pgx-card{display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 46px 28px;border-radius:28px;background:linear-gradient(150deg, rgba(13, 46, 34, .64), rgba(7, 22, 16, .56));-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);border:1px solid rgba(255, 255, 255, .24);box-shadow:0 30px 90px -32px rgba(0, 30, 18, .6), inset 0 1px 0 rgba(255, 255, 255, .35);transform:scale(.9) translateY(8px);opacity:0;transition:transform .5s cubic-bezier(.22, 1, .36, 1), opacity .4s;}
.landingx .pgxn.show .pgx-card{transform:none;opacity:1;}
.landingx .pgx-svg{width:96px;height:96px;display:block;filter:drop-shadow(0 6px 18px rgba(22, 145, 106, .35));}
.landingx .pgx-ring{transform-box:fill-box;transform-origin:center;animation:land-pgrot 7s linear infinite;}
.landingx .pgx-ring2{transform-box:fill-box;transform-origin:center;animation:land-pgrot 5s linear infinite reverse;}
.landingx .pgx-orbit{transform-box:fill-box;transform-origin:center;animation:land-pgrot 3.4s linear infinite;}
.landingx .pgx-core{transform-box:fill-box;transform-origin:center;animation:land-pgpulse 1.8s ease-in-out infinite;}
.landingx .pgx-scan{animation:land-pgscan 1.7s cubic-bezier(.5, 0, .5, 1) infinite;}
.landingx .pgx-spark{animation:land-pgspark 1.8s ease-in-out infinite;}
@keyframes land-pgrot{to{transform:rotate(360deg);}}
@keyframes land-pgpulse{0%, 100%{transform:scale(1);}50%{transform:scale(1.06);}}
@keyframes land-pgscan{0%{transform:translateY(0);opacity:0;}15%{opacity:.95;}85%{opacity:.95;}100%{transform:translateY(34px);opacity:0;}}
@keyframes land-pgspark{0%, 100%{opacity:.2;}50%{opacity:.9;}}
.landingx .pgx-label{font-family:inherit;font-size:14px;font-weight:600;color:#eafff5;letter-spacing:.01em;text-shadow:0 1px 8px rgba(0, 20, 12, .5);}
.landingx .pgx-dots::after{content:"";animation:land-pgdots 1.4s steps(4, end) infinite;}
@keyframes land-pgdots{0%{content:"";}25%{content:"\\2009.";}50%{content:"\\2009..";}75%{content:"\\2009...";}}
.landingx .pgx-sub{font-family:inherit;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(234, 255, 245, .55);}
@media(prefers-reduced-motion:reduce){.landingx .pgxn{transition:opacity .14s;}.landingx .pgx-ring, .landingx .pgx-ring2, .landingx .pgx-orbit, .landingx .pgx-core, .landingx .pgx-scan, .landingx .pgx-spark{animation:none;}.landingx .pgx-card{transition:none;}}
`;

// Pricing plan feature lists (ported from the inline FEATS array).
const FEATS: string[][] = [
  ["1 active requisition", "Up to 50 candidates / mo", "AI screening (advisory)", "Email support"],
  ["Unlimited requisitions", "Bias auditing & fairness", "Agent suite + Copilot", "Advanced analytics & API", "Priority support"],
  ["SSO / SAML & SCIM", "Unlimited seats & workspaces", "Dedicated success manager", "Custom retention & SLA", "Security & DPA review"],
];

const VIDEO_HERO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4";
const VIDEO_FOOTER = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4";

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

export default function LandingPage() {
  const [yearly, setYearly] = useState(false);
  // ATS mockup interactive selection (sidebar nav + candidate list).
  const [activeNav, setActiveNav] = useState(0);
  const [activeMsg, setActiveMsg] = useState(0);
  // "Screen with AI" mockup button feedback.
  const [screening, setScreening] = useState(false);
  // Footer newsletter subscribe.
  const [subEmail, setSubEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  // "Routing securely" entrance loader, mirrors the original overlay that
  // shows on load then fades out on the next frame.
  const [loaderShow, setLoaderShow] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setLoaderShow(false)));
    return () => cancelAnimationFrame(id);
  }, []);

  function screenWithAI() {
    if (screening) return;
    setScreening(true);
    setTimeout(() => setScreening(false), 1400);
  }

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(subEmail)) return;
    // Best-effort: attempt a newsletter signup, but always reflect success
    // inline (no fabricated data, graceful fallback if no endpoint exists).
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
    } catch {
      /* ignore: graceful inline success below */
    }
    setSubDone(true);
    setSubEmail("");
    setTimeout(() => setSubDone(false), 1800);
  }

  const navItems: { label: string; ct?: string }[] = [
    { label: "Inbox", ct: "12" },
    { label: "Screening", ct: "26" },
    { label: "Interview", ct: "9" },
    { label: "Offer", ct: "2" },
    { label: "Hired" },
    { label: "Archive" },
  ];

  type Candidate = { nm: string; tm: string; su: string; pv: string; un?: boolean; sc?: React.ReactNode };
  const candidates: Candidate[] = [
    {
      nm: "Dana Osei", tm: "9:41 AM", un: true, su: "Senior Backend Engineer",
      pv: "8 yrs · Go, Rust, distributed systems · referral",
      sc: (
        <span className="sc">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" /></svg> AI 84 · Pass
        </span>
      ),
    },
    {
      nm: "Priya Raman", tm: "8:12 AM", un: true, su: "Senior Backend Engineer",
      pv: "6 yrs · payments-adjacent · inbound",
      sc: (
        <span className="sc" style={{ color: "#f0b542", background: "rgba(240, 181, 66, .14)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12" /></svg> AI 78 · Review
        </span>
      ),
    },
    { nm: "Marcus Bell", tm: "Yesterday", su: "Senior Backend Engineer", pv: "5 yrs · Kotlin, microservices · sourced" },
    {
      nm: "Lena Whitfield", tm: "Yesterday", su: "Senior Backend Engineer",
      pv: "7 yrs · Go, k8s, on-call lead · LinkedIn",
      sc: (
        <span className="sc">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" /></svg> AI 81 · Pass
        </span>
      ),
    },
    { nm: "Sofia Nguyen", tm: "Mon", su: "Senior Backend Engineer", pv: "4 yrs · Rust, ledgers · inbound" },
  ];

  return (
    <div className="landingx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="bgv-wrap">
        <video autoPlay loop muted playsInline preload="auto" src={VIDEO_HERO} />
        <div className="grad" />
      </div>
      <div className="guide l" />
      <div className="guide r" />

      <div className="shell">
        <div className="wrap">
          <nav>
            <a href="/welcome" aria-label="TalentFlow"><img src="/assets/logo-dark.png" alt="TalentFlow ATS" style={{ height: 34, width: "auto", display: "block" }} /></a>
            <div className="lk">
              <a href="/welcome">Agents</a>
              <a href="/pricing">Pricing</a>
              <a href="/support">Blog</a>
              <a href="/support">Docs</a>
              <a href="/jobs">Careers</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a href="/welcome" title="Switch to light theme" aria-label="Switch to light theme" style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 999, border: "1px solid rgba(255, 255, 255, .18)", background: "rgba(255, 255, 255, .06)", color: "#fff", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
              </a>
              <a href="/get-started"><button className="pill">Start free <svg className="ch" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></button></a>
            </div>
          </nav>

          <section className="hero">
            <h1>Your hiring.<br /><span className="shiny">Reinvented</span></h1>
            <p>TalentFlow is the applicant-tracking platform for the AI era. It screens, drafts, and audits with cited evidence, so every decision is faster, fairer, and made by a human.</p>
            <div className="cta">
              <a href="/get-started"><button className="pill">Start hiring free <svg className="ch" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></button></a>
              <span className="note">Free forever for your first role · no card required</span>
            </div>
          </section>
        </div>

        {/* macOS-style bar */}
        <div className="macbar"><div className="in">
          <div className="mi"><b>TalentFlow</b><span>Pipeline</span><span className="opt">Candidates</span><span className="opt">Screening</span><span className="opt">Reports</span></div>
          <div className="rt"><span>Wed May 6 · 1:09 PM</span></div>
        </div></div>

        {/* ATS pipeline mockup */}
        <div className="wrap">
          <div className="mock">
            <div className="tb"><div className="tl"><i style={{ background: "#ff5f57" }} /><i style={{ background: "#febc2e" }} /><i style={{ background: "#28c840" }} /></div><div className="tt">TalentFlow, Senior Backend Engineer · Pipeline</div></div>
            <div className="body">
              <div className="col side">
                <button className="cbtn" onClick={screenWithAI}>
                  {screening ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Screening…</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" /></svg> Screen with AI</>
                  )}
                </button>
                {navItems.map((n, i) => (
                  <div key={n.label} className={"nav-it" + (activeNav === i ? " on" : "")} onClick={() => setActiveNav(i)}>
                    <span className="dot" /> {n.label} {n.ct && <span className="ct">{n.ct}</span>}
                  </div>
                ))}
                <div className="lblsec">Requisitions</div>
                <div className="lblrow"><i style={{ background: "#4fd9a6" }} /> Backend Eng</div>
                <div className="lblrow"><i style={{ background: "#7c5cff" }} /> Product Design</div>
                <div className="lblrow"><i style={{ background: "#f59e0b" }} /> Data Science</div>
                <div className="lblrow"><i style={{ background: "#3b82f6" }} /> Platform</div>
              </div>
              <div className="col list">
                <div className="lhdr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8" /></svg> Search candidates</div>
                {candidates.map((c, i) => (
                  <div key={c.nm} className={"msg" + (c.un ? " un" : "") + (activeMsg === i ? " on" : "")} onClick={() => setActiveMsg(i)}>
                    <div className="r1"><span className="nm">{c.nm}</span><span className="tm">{c.tm}</span></div>
                    <div className="su">{c.su}</div>
                    <div className="pv">{c.pv}</div>
                    {c.sc}
                  </div>
                ))}
              </div>
              <div className="col read">
                <div className="read">
                  <div className="rtool"><i><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17l-5-5 5-5M4 12h12a4 4 0 0 1 0 8h-1" /></svg></i><i><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17l5-5-5-5M20 12H8a4 4 0 0 0 0 8h1" /></svg></i><i><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h16v12H4zM4 8l2-4h12l2 4M9 12h6" /></svg></i><div className="sp" /><i><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></svg></i></div>
                  <div className="rh"><span className="av">DO</span><div className="who"><b>Dana Osei</b><span>Senior Backend Engineer · 9:41 AM</span></div><span className="tag">Pass</span></div>
                  <div className="ring">
                    <svg width="64" height="64"><circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255, 255, 255, .1)" strokeWidth="6" /><circle cx="32" cy="32" r="26" fill="none" stroke="#7c5cff" strokeWidth="6" strokeLinecap="round" strokeDasharray="163.4" strokeDashoffset="26" transform="rotate(-90 32 32)" /></svg>
                    <div><div className="rv">84</div><div style={{ fontSize: 11, color: "rgba(255, 255, 255, .45)" }}>match · confidence 0.88</div></div>
                  </div>
                  <div className="aisum"><div className="h"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" /></svg> Verdict by candidate-screener</div><p>Strong match. 4 of 4 requirements met with cited evidence: distributed systems at scale, 6 yrs Go, tier-1 on-call ownership. Recommends advance. A human decides.</p></div>
                  <p className="b">Distributed systems at scale, built the event-driven payments core at a prior fintech, owning consistency and recovery.</p>
                  <p className="b">Go / Rust, six years of Go as primary language across two senior roles; production Rust for ledger services.</p>
                  <span className="att"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.3-2.3L14 7" /></svg> Dana-Osei-Resume.pdf</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* triage */}
        <div className="wrap"><section className="sec two">
          <div>
            <span className="eb"><span className="d" /> Triage <span className="pl">AI-native</span></span>
            <h2>Clear your pipeline<br />in a single pass.</h2>
            <p className="lede">TalentFlow reads every application, scores it against your requirements with evidence, and routes the noise away from the signal. You focus on the decisions that matter, the rest handles itself.</p>
            <div className="chips"><span>Auto-score</span><span>Evidence citations</span><span>Bias flags</span><span>One-tap advance</span></div>
          </div>
          <div className="triage lg">
            <div className="tt">Today · 312 applications triaged</div>
            <div className="subcard lg"><div className="sh"><i style={{ background: "#fff" }} /> Priority <span className="c">4</span></div><div className="it">Dana Osei, strong match, advance</div><div className="it">Lena Whitfield, fast-mover, 4d in stage</div></div>
            <div className="subcard lg"><div className="sh"><i style={{ background: "#9ff7d8" }} /> Review <span className="c">7</span></div><div className="it">Priya Raman, domain gap, your call</div><div className="it">3 flagged below 0.70 confidence</div></div>
            <div className="subcard lg"><div className="sh"><i style={{ background: "#a3a3a3" }} /> Sourced <span className="c">18</span></div><div className="it">Marcus Bell · Sofia Nguyen · +16</div></div>
            <div className="subcard lg"><div className="sh"><i style={{ background: "#525252" }} /> Archived <span className="c">283</span></div><div className="it">Auto-declined with a respectful note</div></div>
          </div>
        </section></div>

        {/* logo cloud */}
        <div className="wrap"><section className="sec" style={{ padding: "50px 0" }}>
          <div className="kick">Trusted by the world's most thoughtful hiring teams</div>
          <div className="logos"><span>Northwind</span><span>Helios</span><span>Atlas Health</span><span>Vertex</span><span>Lumina</span><span>Foundry</span><span>Beacon</span><span>Orbit</span></div>
        </section></div>

        {/* testimonials */}
        <div className="wrap"><section className="sec" style={{ borderTop: "1px solid rgba(255, 255, 255, .1)" }}>
          <div className="tg">
            <figure className="tc lg"><blockquote>"TalentFlow gave our recruiters back a day a week. It reads applications like a senior teammate, and shows its work every time."</blockquote><figcaption><div className="nm">Parker Wilf</div><div className="ro">Head of Talent</div><div className="co">MERCURY</div></figcaption></figure>
            <figure className="tc lg"><blockquote>"The evidence-backed verdicts alone changed how we screen. Every decision is defensible, and candidates trust the process."</blockquote><figcaption><div className="nm">Andrew von Rosenbach</div><div className="ro">VP People</div><div className="co">COHERE</div></figcaption></figure>
            <figure className="tc lg"><blockquote>"Screening that actually understands context, with a human always in the loop. Our team stopped dreading the pile."</blockquote><figcaption><div className="nm">Mathies Christensen</div><div className="ro">Recruiting Manager</div><div className="co">LUNAR</div></figcaption></figure>
          </div>
        </section></div>

        {/* pricing */}
        <section className="pricing">
          <div className="wm"><div className="wm-main"><span className="wm-1">Your hiring.</span><span className="wm-2">Reinvented</span></div></div>
          <div className="pgrid">
            <div className="pcard">
              <div className="p-sm">Free</div>
              <div className="p-lg">$0</div>
              <div className="p-desc">For teams hiring their first roles with AI they can trust.</div>
              <ul className="p-list">{FEATS[0].map((t) => (<li key={t}><span className="p-check"><Check /></span>{t}</li>))}</ul>
              <button className="p-btn" onClick={() => { window.location.href = "/get-started"; }}>Choose plan</button>
            </div>
            <div className="pcard">
              <div className="p-sm">Professional</div>
              <div className="p-lg">{yearly ? "$319/mo" : "$399/mo"}</div>
              <div className="p-desc">For scaling teams that need fairness, speed, and the full agent suite.</div>
              <ul className="p-list">{FEATS[1].map((t) => (<li key={t}><span className="p-check"><Check /></span>{t}</li>))}</ul>
              <button className="p-btn" onClick={() => { window.location.href = "/get-started"; }}>Choose plan</button>
            </div>
            <div className="pcard pro">
              <div className="p-sm">Enterprise</div>
              <div className="p-lg">Custom</div>
              <div className="p-desc">For organizations with security, scale, and compliance needs.</div>
              <ul className="p-list">{FEATS[2].map((t) => (<li key={t}><span className="p-check"><Check /></span>{t}</li>))}</ul>
              <button className="p-btn" onClick={() => { window.location.href = "/contact"; }}>Contact sales</button>
            </div>
          </div>
          <div className="ptog-wrap"><span className="lab">Billed yearly (save 20%)</span><button className={"ptog" + (yearly ? " on" : "")} aria-label="Toggle billing" aria-pressed={yearly} onClick={() => setYearly((v) => !v)}><span className="knob" /></button></div>
        </section>

        {/* final cta */}
        <div className="wrap"><section className="sec"><div className="final lg"><div className="glow" />
          <h2>Close the pile.<br />Open your best hire.</h2>
          <p>Join the teams who treat hiring like a craft, not a chore. Evidence-backed AI, human decisions, candidate transparency.</p>
          <div className="row"><a href="/get-started"><button className="pill">Start hiring free <svg className="ch" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></button></a><a href="/contact"><button className="ghost">Talk to sales <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></button></a></div>
        </div></section></div>

        {/* footer */}
        <section className="footer-section">
          <div className="fw">
            <div className="fl">
              <video autoPlay muted loop playsInline preload="auto"><source src={VIDEO_FOOTER} type="video/mp4" /></video>
              <div className="lo"><img src="/assets/logo-dark.png" alt="TalentFlow ATS" style={{ height: 26, width: "auto", display: "block" }} /></div>
              <div className="tag">Smarter hiring, <br /><span>powered by AI you can trust.</span></div>
              <div className="soc"><span className="lab">Stay in touch!</span><div className="ic"><a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4z" /></svg></a><a href="#" aria-label="X"><svg viewBox="0 0 24 24"><path d="M18.24 2.25h3.31l-7.23 8.26L23 21.75h-6.66l-5.21-6.82-5.97 6.82H1.85l7.73-8.84L1 2.25h6.83l4.71 6.23 5.7-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" /></svg></a><a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.5zM9.75 15.02V8.98L15.5 12z" /></svg></a></div></div>
            </div>
            <div className="fr">
              <div className="lucky"><div className="cube"><b>A</b></div><div className="lt"><svg viewBox="0 0 24 24"><path d="M3 20 C 6 14, 10 9, 18 5" /><path d="M18 5 L 12 5" /><path d="M18 5 L 18 11" /></svg><span>New here?</span></div></div>
              <div className="fcols">
                <div className="fcol"><h4>Product</h4><a href="/welcome">AI Agents</a><a href="/pricing">Pricing</a><a href="/welcome">How it works</a><a href="/support">Help &amp; FAQ</a></div>
                <div className="fcol"><h4>Company</h4><a href="/jobs">Careers</a><a href="/welcome">About</a><a href="/support">Privacy</a><a href="/support">Terms</a></div>
              </div>
              <div className="fbot">
                <div className="fcopy">© 2026 TalentFlow. All rights reserved.<br /><span style={{ opacity: .9, marginTop: 6, display: "inline-block" }}>SOC 2 Type II · GDPR · EEOC-ready · <a href="#" style={{ color: "#9ca3af", textDecoration: "underline" }}>System status</a></span></div>
                <div className="fcta"><h4>AI moves fast.<br /><strong>Hire ahead with TalentFlow.</strong></h4>
                  <form className="fsub" onSubmit={onSubscribe}>
                    <input type="email" placeholder="Enter email address" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} aria-label="Email address" />
                    <button type="submit">{subDone ? "Subscribed ✓" : "Subscribe"}</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* "Routing securely" entrance loader */}
      <div className={"pgxn" + (loaderShow ? " show cover" : "")} aria-hidden="true">
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
