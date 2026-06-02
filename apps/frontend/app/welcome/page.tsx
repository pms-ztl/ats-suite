"use client";
// app/welcome/page.tsx
// EXACT port of claude-design/Landing - Light Theme.html, the LIGHT marketing
// landing: CloudFront background video + white tint veil, hero ("Hire with
// clarity, not guesswork."), a static dashboard preview, the sister sections
// (logos, testimonials, pricing, final CTA), footer, and a mobile sheet menu.
// Standalone public page (no shell). Script behavior (mobile menu open/close,
// video fade-in) reproduced with React state. Links routed to real pages.
import { useState, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');
.lnlightx{
  --background:0 0% 100%;--foreground:165 22% 16%;
  --primary:165 22% 16%;--primary-foreground:0 0% 100%;
  --secondary:165 20% 96%;--muted-foreground:175 8% 48%;
  --accent:162 70% 33%;--accent-2:292 60% 62%;--border:165 16% 90%;
  --radius:.5rem;--font-display:'Instrument Serif', serif;--font-body:'Inter', sans-serif;
  --shadow-dashboard:0 25px 80px -12px rgba(10, 40, 28, .12), 0 0 0 1px rgba(10, 40, 28, .06);
  font-family:var(--font-body);color:hsl(var(--foreground));min-height:100vh;
}
.lnlightx *{box-sizing:border-box;margin:0;}
.lnlightx .page{display:flex;flex-direction:column;background:hsl(var(--background));}
.lnlightx .hero{min-height:calc(100vh - 74px);overflow:visible;padding-bottom:40px;}
/* ---- sister sections (light) ---- */
.lnlightx .sec{max-width:1100px;margin:0 auto;padding:clamp(56px, 8vw, 96px) clamp(20px, 5vw, 40px);}
.lnlightx .kick{text-align:center;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:hsl(var(--muted-foreground));}
.lnlightx .logos{margin-top:26px;display:grid;grid-template-columns:repeat(2, 1fr);gap:18px;}
@media(min-width:760px){.lnlightx .logos{grid-template-columns:repeat(4, 1fr);}}
.lnlightx .logos span{text-align:center;font-size:15px;font-weight:600;color:hsl(var(--foreground));opacity:.55;}
.lnlightx .sh2{text-align:center;font-family:var(--font-display);font-weight:400;font-size:clamp(2rem, 5vw, 3.4rem);letter-spacing:-0.02em;color:hsl(var(--foreground));}
.lnlightx .sh2 em{font-style:italic;color:hsl(var(--accent));}
.lnlightx .tgrid{margin-top:40px;display:grid;grid-template-columns:1fr;gap:16px;}
@media(min-width:820px){.lnlightx .tgrid{grid-template-columns:repeat(3, 1fr);}}
.lnlightx .tcard{background:#fff;border:1px solid hsl(var(--border));border-radius:18px;padding:24px;box-shadow:0 10px 30px -18px rgba(10, 40, 28, .14);}
.lnlightx .tcard p{font-size:14.5px;line-height:1.6;color:hsl(var(--foreground));}
.lnlightx .tcard .who{margin-top:18px;padding-top:16px;border-top:1px solid hsl(var(--border));font-size:13px;}
.lnlightx .tcard .who b{display:block;}.lnlightx .tcard .who span{color:hsl(var(--muted-foreground));font-size:12px;}
.lnlightx .pgrid{margin-top:40px;display:grid;grid-template-columns:1fr;gap:16px;}
@media(min-width:880px){.lnlightx .pgrid{grid-template-columns:repeat(4, 1fr);}}
.lnlightx .pcard{background:#fff;border:1px solid hsl(var(--border));border-radius:20px;padding:26px 22px;display:flex;flex-direction:column;}
.lnlightx .pcard.pop{border-color:hsl(var(--accent));box-shadow:0 16px 44px -22px hsl(var(--accent)/.5);}
.lnlightx .pcard .pn{font-size:13px;font-weight:600;color:hsl(var(--muted-foreground));}
.lnlightx .pcard .pp{font-family:var(--font-display);font-size:2.2rem;margin-top:6px;}
.lnlightx .pcard .pp small{font-size:13px;color:hsl(var(--muted-foreground));font-family:var(--font-body);}
.lnlightx .pcard ul{list-style:none;padding:0;margin:16px 0 20px;flex:1;display:flex;flex-direction:column;gap:9px;}
.lnlightx .pcard li{font-size:13px;color:hsl(var(--foreground));display:flex;gap:8px;}
.lnlightx .pcard li svg{color:hsl(var(--accent));flex-shrink:0;}
.lnlightx .pbtn{text-align:center;border-radius:999px;padding:10px;font-size:13px;font-weight:600;border:1px solid hsl(var(--border));background:#fff;color:hsl(var(--foreground));}
.lnlightx .pcard.pop .pbtn{background:hsl(var(--accent));color:#fff;border-color:transparent;}
.lnlightx .final{max-width:1100px;margin:0 auto clamp(40px, 7vw, 80px);padding:clamp(48px, 8vw, 80px) 28px;border-radius:28px;text-align:center;background:linear-gradient(135deg, hsl(var(--accent)/.1), hsl(var(--accent-2)/.08));border:1px solid hsl(var(--border));}
.lnlightx .final h2{font-family:var(--font-display);font-size:clamp(2rem, 5vw, 3.2rem);letter-spacing:-0.02em;}
.lnlightx .final p{margin:16px auto 26px;max-width:34ch;color:hsl(var(--muted-foreground));font-size:15px;line-height:1.6;}
.lnlightx .lfoot{background:hsl(var(--foreground));color:rgba(255, 255, 255, .8);padding:48px clamp(20px, 5vw, 40px);}
.lnlightx .lfoot .in{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-between;}
.lnlightx .lfoot a{color:rgba(255, 255, 255, .78);font-size:14px;margin-right:20px;}
.lnlightx .lfoot a:hover{color:#fff;}
.lnlightx .lfoot .cp{font-size:12px;color:rgba(255, 255, 255, .5);width:100%;border-top:1px solid rgba(255, 255, 255, .12);padding-top:18px;margin-top:8px;}
.lnlightx a{text-decoration:none;color:inherit;}.lnlightx button{font-family:inherit;cursor:pointer;}
.lnlightx .serif{font-family:var(--font-display);}
.lnlightx .fu{opacity:0;transform:translateY(16px);animation:lnlightx-fu .6s cubic-bezier(.22, 1, .36, 1) forwards;}
@keyframes lnlightx-fu{to{opacity:1;transform:none;}}
/* navbar */
.lnlightx nav{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:20px clamp(24px, 5vw, 80px);}
.lnlightx .logo{display:flex;align-items:center;gap:9px;}
.lnlightx .logo img{height:30px;}
.lnlightx .nlinks{display:flex;align-items:center;gap:32px;}
.lnlightx .nlinks a{font-size:14px;color:hsl(var(--muted-foreground));transition:color .2s;}
.lnlightx .nlinks a:hover{color:hsl(var(--foreground));}
.lnlightx .btn-primary{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:9px 20px;font-size:14px;font-weight:500;background:hsl(var(--primary));color:hsl(var(--primary-foreground));border:none;transition:filter .2s, transform .15s;}
.lnlightx .btn-primary:hover{filter:brightness(1.12);}.lnlightx .btn-primary:active{transform:scale(.97);}
.lnlightx .burger{display:none;width:40px;height:40px;border-radius:999px;background:hsl(var(--primary));color:#fff;align-items:center;justify-content:center;border:none;}
@media(max-width:860px){.lnlightx .nlinks{display:none;}.lnlightx .navcta{display:none;}.lnlightx .burger{display:flex;}}
/* hero */
.lnlightx .hero{position:relative;flex:1;display:flex;flex-direction:column;align-items:center;min-height:0;padding:0 20px;overflow:hidden;}
.lnlightx #bgv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;}
.lnlightx .vtint{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg, rgba(255, 255, 255, .72), rgba(255, 255, 255, .45) 40%, rgba(255, 255, 255, .82));}
.lnlightx .hwrap{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;width:100%;padding-top:clamp(20px, 5vh, 52px);}
.lnlightx .badge{display:inline-flex;align-items:center;gap:7px;border-radius:999px;border:1px solid hsl(var(--border));background:rgba(255, 255, 255, .85);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);padding:6px 16px;font-size:13.5px;color:hsl(var(--muted-foreground));margin-bottom:22px;}
.lnlightx .badge .sp{color:hsl(var(--accent));font-weight:600;}
.lnlightx h1{text-align:center;font-family:var(--font-display);font-weight:400;font-size:clamp(2.6rem, 6.4vw, 5rem);line-height:.95;letter-spacing:-0.02em;color:hsl(var(--foreground));max-width:14ch;}
.lnlightx h1 em{font-style:italic;color:hsl(var(--accent));}
.lnlightx .sub{margin-top:16px;text-align:center;font-size:clamp(15px, 1.6vw, 18px);color:hsl(var(--muted-foreground));max-width:640px;line-height:1.6;}
.lnlightx .ctas{margin-top:22px;display:flex;align-items:center;gap:12px;}
.lnlightx .play{height:44px;width:44px;border-radius:999px;border:none;background:#fff;box-shadow:0 2px 12px rgba(10, 40, 28, .12);display:grid;place-items:center;transition:background .2s, transform .15s;}
.lnlightx .play:hover{transform:scale(1.06);}
/* dashboard preview */
.lnlightx .dash-wrap{margin-top:30px;width:100%;max-width:1024px;border-radius:18px;overflow:hidden;padding:clamp(10px, 1.5vw, 16px);background:rgba(255, 255, 255, .45);-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);border:1px solid rgba(255, 255, 255, .6);box-shadow:var(--shadow-dashboard);}
.lnlightx .dash{background:#fff;border-radius:12px;overflow:hidden;font-size:11px;user-select:none;pointer-events:none;border:1px solid hsl(var(--border));}
.lnlightx .d-top{display:flex;align-items:center;gap:12px;padding:9px 12px;border-bottom:1px solid hsl(var(--border));}
.lnlightx .d-top .nlogo{display:flex;align-items:center;gap:6px;font-weight:700;}
.lnlightx .d-top .nlogo b{width:18px;height:18px;border-radius:6px;background:hsl(var(--accent));color:#fff;display:grid;place-items:center;font-size:10px;}
.lnlightx .d-search{flex:1;max-width:280px;display:flex;align-items:center;gap:6px;height:24px;padding:0 9px;border-radius:7px;background:hsl(var(--secondary));color:hsl(var(--muted-foreground));}
.lnlightx .d-search .k{margin-left:auto;font-size:9px;background:#fff;border:1px solid hsl(var(--border));border-radius:4px;padding:0 4px;}
.lnlightx .d-top .right{margin-left:auto;display:flex;align-items:center;gap:8px;}
.lnlightx .d-pill{background:hsl(var(--accent));color:#fff;border-radius:999px;padding:4px 10px;font-weight:600;font-size:10px;}
.lnlightx .d-av{width:20px;height:20px;border-radius:999px;background:linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-2)));color:#fff;display:grid;place-items:center;font-size:9px;font-weight:700;}
.lnlightx .d-body{display:flex;}
.lnlightx .d-side{width:152px;flex-shrink:0;padding:10px;border-right:1px solid hsl(var(--border));display:flex;flex-direction:column;gap:1px;}
.lnlightx .d-nav{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;color:hsl(var(--muted-foreground));}
.lnlightx .d-nav.on{background:hsl(var(--secondary));color:hsl(var(--foreground));font-weight:600;}
.lnlightx .d-nav .dot{width:13px;height:13px;border-radius:4px;background:hsl(var(--border));flex-shrink:0;}
.lnlightx .d-nav.on .dot{background:hsl(var(--accent));}
.lnlightx .d-nav .bdg{margin-left:auto;background:hsl(var(--accent));color:#fff;border-radius:999px;font-size:8px;padding:0 5px;font-weight:700;}
.lnlightx .d-sec{font-size:8.5px;text-transform:uppercase;letter-spacing:.08em;color:hsl(var(--muted-foreground));opacity:.7;margin:10px 0 4px 8px;}
.lnlightx .d-main{flex:1;min-width:0;padding:14px;background:hsl(var(--secondary)/.4);}
.lnlightx .d-greet{font-size:14px;font-weight:600;margin-bottom:10px;}
.lnlightx .d-acts{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:14px;}
.lnlightx .d-act{border-radius:999px;padding:4px 11px;font-size:10px;font-weight:500;background:#fff;border:1px solid hsl(var(--border));color:hsl(var(--foreground));}
.lnlightx .d-act.acc{background:hsl(var(--accent));color:#fff;border-color:transparent;}
.lnlightx .d-cards{display:flex;gap:10px;margin-bottom:12px;}
.lnlightx .d-card{flex:1;basis:0;min-width:0;background:#fff;border:1px solid hsl(var(--border));border-radius:10px;padding:12px;}
.lnlightx .d-card .ch{display:flex;align-items:center;gap:6px;font-size:11px;color:hsl(var(--muted-foreground));margin-bottom:6px;}
.lnlightx .d-card .amt{font-size:18px;font-weight:700;letter-spacing:-0.02em;}
.lnlightx .d-card .amt small{font-size:11px;color:hsl(var(--muted-foreground));font-weight:500;}
.lnlightx .d-stats{display:flex;gap:14px;margin-top:8px;font-size:9.5px;color:hsl(var(--muted-foreground));}
.lnlightx .d-row{display:flex;justify-content:space-between;padding:7px 0;font-size:11px;}
.lnlightx .d-tbl{background:#fff;border:1px solid hsl(var(--border));border-radius:10px;padding:12px;}
.lnlightx .d-tbl h4{font-size:11px;font-weight:600;margin-bottom:8px;}
.lnlightx .d-tr{display:grid;grid-template-columns:54px 1fr 76px 70px;gap:8px;padding:5px 0;font-size:10px;align-items:center;}
.lnlightx .d-tr.h{color:hsl(var(--muted-foreground));font-size:8.5px;text-transform:uppercase;letter-spacing:.05em;}
.lnlightx .d-st{font-size:8.5px;font-weight:600;border-radius:999px;padding:1px 7px;display:inline-block;}
.lnlightx .st-warn{background:#fef3c7;color:#b45309;}.lnlightx .st-ok{background:#dcfce7;color:#15803d;}
@media(max-width:680px){.lnlightx .d-side{display:none;}.lnlightx .d-cards{flex-direction:column;}}
@media(prefers-reduced-motion:reduce){.lnlightx #bgv{display:none;}.lnlightx .fu{animation:none;opacity:1;transform:none;}}
/* mobile menu */
.lnlightx .msheet{position:fixed;inset:0;z-index:50;display:none;}
.lnlightx .msheet.open{display:block;}
.lnlightx .msheet .scrim{position:absolute;inset:0;background:rgba(10, 30, 20, .5);}
.lnlightx .msheet .sheet{position:absolute;left:12px;right:12px;bottom:12px;background:#fff;border-radius:18px;padding:22px;transform:translateY(110%);transition:transform .5s cubic-bezier(.32, .72, 0, 1);}
.lnlightx .msheet.open .sheet{transform:none;}
.lnlightx .msheet .sheet a{display:block;font-size:26px;font-weight:500;padding:9px 0;color:hsl(var(--foreground));}
`;

export default function WelcomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const vid = useRef<HTMLVideoElement>(null);

  return (
    <div className="lnlightx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="page">
        <nav>
          <a className="logo" href="/welcome"><img src="/assets/logo-light.png" alt="TalentFlow ATS" /></a>
          <div className="nlinks">
            <a href="/welcome">Home</a><a href="/pricing">Pricing</a><a href="/agents">About</a><a href="/contact">Contact</a>
          </div>
          <a className="navcta" href="/get-started"><button className="btn-primary">Start free</button></a>
          <a href="/welcome/dark" title="Switch to dark theme" aria-label="Switch to dark theme" style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 999, border: "1px solid hsl(var(--border))", background: "#fff", color: "hsl(var(--foreground))", flexShrink: 0, marginLeft: "-4px" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg></a>
          <button className="burger" id="burger" aria-label="Menu" onClick={() => setMenuOpen(true)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
        </nav>

        <section className="hero">
          <video ref={vid} id="bgv" muted autoPlay loop playsInline src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"></video>
          <div className="vtint"></div>

          <div className="hwrap">
            <div className="badge fu">Now with agentic AI screening <span className="sp">✦</span></div>
            <h1 className="fu" style={{ animationDelay: ".1s" }}>Hire with <em>clarity</em>, not guesswork.</h1>
            <p className="sub fu" style={{ animationDelay: ".2s" }}>Evidence-backed AI agents screen, draft, and audit your hiring, so your team moves faster and a human always makes the final call.</p>
            <div className="ctas fu" style={{ animationDelay: ".3s" }}>
              <a href="/contact"><button className="btn-primary" style={{ padding: "12px 24px" }}>Book a demo</button></a>
              <button className="play" aria-label="Watch overview"><svg width="15" height="15" viewBox="0 0 24 24" fill="hsl(var(--foreground))"><path d="M8 5v14l11-7z" /></svg></button>
            </div>

            {/* dashboard preview */}
            <div className="dash-wrap fu" style={{ animationDelay: ".5s" }}>
              <div className="dash">
                <div className="d-top">
                  <div className="nlogo"><b>T</b> TalentFlow <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg></div>
                  <div className="d-search"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg> Search candidates <span className="k">⌘K</span></div>
                  <div className="right"><span className="d-pill">Source with AI</span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.8"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></svg><span className="d-av">AC</span></div>
                </div>
                <div className="d-body">
                  <div className="d-side">
                    <div className="d-nav on"><span className="dot"></span> Home</div>
                    <div className="d-nav"><span className="dot"></span> Candidates <span className="bdg">1284</span></div>
                    <div className="d-nav"><span className="dot"></span> Requisitions</div>
                    <div className="d-nav"><span className="dot"></span> Screening <span className="bdg">26</span></div>
                    <div className="d-nav"><span className="dot"></span> Interviews</div>
                    <div className="d-nav"><span className="dot"></span> Offers</div>
                    <div className="d-sec">Intelligence</div>
                    <div className="d-nav"><span className="dot"></span> Copilot</div>
                    <div className="d-nav"><span className="dot"></span> Review Queue</div>
                    <div className="d-nav"><span className="dot"></span> Analytics</div>
                    <div className="d-nav"><span className="dot"></span> Compliance</div>
                  </div>
                  <div className="d-main">
                    <div className="d-greet">Welcome, Avery</div>
                    <div className="d-acts">
                      <span className="d-act acc">Screen</span><span className="d-act">Source</span><span className="d-act">Schedule</span><span className="d-act">Draft JD</span><span className="d-act">Make offer</span><span className="d-act">Export</span><span style={{ fontSize: "10px", color: "hsl(var(--muted-foreground))" }}>Customize</span>
                    </div>
                    <div className="d-cards">
                      <div className="d-card">
                        <div className="ch"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Active candidates</div>
                        <div className="amt">1, 284 <small>this quarter</small></div>
                        <div className="d-stats"><span>Last 30 days</span><span style={{ color: "#15803d" }}>+186</span><span style={{ color: "#b91c1c" }}>−42 archived</span></div>
                        <svg viewBox="0 0 260 80" style={{ width: "100%", height: "70px", marginTop: "6px" }}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="hsl(var(--accent))" stopOpacity=".18" /><stop offset="1" stopColor="hsl(var(--accent))" stopOpacity="0" /></linearGradient></defs><path d="M0, 62 C30, 58 50, 40 80, 44 C110, 48 130, 28 160, 30 C190, 32 210, 16 260, 12 L260, 80 L0, 80 Z" fill="url(#cg)" /><path d="M0, 62 C30, 58 50, 40 80, 44 C110, 48 130, 28 160, 30 C190, 32 210, 16 260, 12" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5" /></svg>
                      </div>
                      <div className="d-card">
                        <div className="ch"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /></svg> Pipeline</div>
                        <div className="d-row" style={{ borderBottom: "1px solid hsl(var(--border))" }}><span>Screening</span><b>318</b></div>
                        <div className="d-row" style={{ borderBottom: "1px solid hsl(var(--border))" }}><span>Interview</span><b>64</b></div>
                        <div className="d-row"><span>Offer</span><b>12</b></div>
                      </div>
                    </div>
                    <div className="d-tbl">
                      <h4>AI screening verdicts</h4>
                      <div className="d-tr h"><span>Time</span><span>Candidate</span><span>Score</span><span>Verdict</span></div>
                      <div className="d-tr"><span>9:41</span><span>Dana Osei</span><span><b>84</b></span><span className="d-st st-ok">Pass</span></div>
                      <div className="d-tr"><span>8:12</span><span>Priya Raman</span><span><b>78</b></span><span className="d-st st-warn">Review</span></div>
                      <div className="d-tr"><span>Yest.</span><span>Lena Whitfield</span><span><b>81</b></span><span className="d-st st-ok">Pass</span></div>
                      <div className="d-tr"><span>Yest.</span><span>Marcus Bell</span><span><b>62</b></span><span className="d-st st-warn">Review</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===== sister sections (parity with dark Landing) ===== */}
      <div className="sec">
        <div className="kick">Trusted by thoughtful hiring teams</div>
        <div className="logos"><span>Northwind</span><span>Helios</span><span>Atlas Health</span><span>Vertex</span></div>
      </div>

      <div className="sec" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <h2 className="sh2">Hiring that earns <em>trust</em>.</h2>
        <div className="tgrid">
          <div className="tcard"><p>"TalentFlow gave our recruiters back a day a week. It reads applications like a senior teammate, and shows its work every time."</p><div className="who"><b>Parker Wilf</b><span>Head of Talent · Mercury</span></div></div>
          <div className="tcard"><p>"The evidence-backed verdicts changed how we screen. Every decision is defensible, and candidates trust the process."</p><div className="who"><b>Andrew von Rosenbach</b><span>VP People · Cohere</span></div></div>
          <div className="tcard"><p>"Screening that understands context, with a human always in the loop. Our team stopped dreading the pile."</p><div className="who"><b>Mathies Christensen</b><span>Recruiting Manager · Lunar</span></div></div>
        </div>
      </div>

      <div className="sec" style={{ background: "hsl(var(--secondary)/.5)", maxWidth: "none" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 className="sh2">Simple, transparent <em>pricing</em>.</h2>
          <div className="pgrid">
            <div className="pcard"><span className="pn">Free</span><div className="pp">$0</div><ul><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> 1 requisition</li><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> 50 candidates / mo</li><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> AI screening (10/mo)</li></ul><a href="/get-started"><div className="pbtn">Get started</div></a></div>
            <div className="pcard"><span className="pn">Starter</span><div className="pp">$149<small>/mo</small></div><ul><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> 5 requisitions</li><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Full AI + evidence</li><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Custom fields</li></ul><a href="/pricing"><div className="pbtn">Start trial</div></a></div>
            <div className="pcard pop"><span className="pn">Professional</span><div className="pp">$399<small>/mo</small></div><ul><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Unlimited reqs</li><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Bias auditing</li><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Copilot + API</li></ul><a href="/pricing"><div className="pbtn">Start trial</div></a></div>
            <div className="pcard"><span className="pn">Enterprise</span><div className="pp">Custom</div><ul><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> SSO / SAML</li><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Dedicated CSM</li><li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Custom SLA</li></ul><a href="/contact"><div className="pbtn">Contact sales</div></a></div>
          </div>
        </div>
      </div>

      <div className="final">
        <h2>Close the pile. <em>Open</em> your best hire.</h2>
        <p>Join the teams who treat hiring like a craft. Evidence-backed AI, human decisions, candidate transparency.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/get-started"><button className="btn-primary" style={{ padding: "12px 24px", background: "hsl(var(--accent))" }}>Start hiring free</button></a>
          <a href="/contact"><button className="btn-primary" style={{ padding: "12px 24px", background: "#fff", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>Talk to sales</button></a>
        </div>
      </div>

      <footer className="lfoot">
        <div className="in">
          <img src="/assets/logo-dark.png" alt="TalentFlow ATS" style={{ height: "26px" }} />
          <div><a href="/pricing">Pricing</a><a href="/agents">Agents</a><a href="/support">Help</a><a href="/system-status">Status</a><a href="/contact">Contact</a></div>
          <div className="cp">© 2026 TalentFlow · SOC 2 Type II · GDPR · EEOC-ready · AI is advisory, a human decides.</div>
        </div>
      </footer>

      {/* mobile menu */}
      <div className={"msheet" + (menuOpen ? " open" : "")} id="msheet">
        <div className="scrim" id="mscrim" onClick={() => setMenuOpen(false)}></div>
        <div className="sheet">
          <a href="/welcome" onClick={() => setMenuOpen(false)}>Home</a><a href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</a><a href="/agents" onClick={() => setMenuOpen(false)}>About</a><a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a href="/get-started" onClick={() => setMenuOpen(false)}><button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "12px", padding: "13px" }}>Start free</button></a>
        </div>
      </div>
    </div>
  );
}
