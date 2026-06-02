"use client";
// app/(auth)/login/page.tsx
// EXACT port of claude-design/Auth.html, the full-bleed sign-in: CloudFront
// background video + aurora blobs + veil, hero (stats + "Hire With Clarity"),
// and the glass card with SSO / Google / Microsoft / SOC 2 badges. Wired to the
// real auth: useAuth().login + tenant-admin role gating + tier redirects.
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const ALLOWED = ["ADMIN", "COMPLIANCE_OFFICER"];
const REDIRECT: Record<string, string> = {
  SUPER_ADMIN: "/super-admin/login", RECRUITER: "/staff/login",
  HIRING_MANAGER: "/staff/login", INTERVIEWER: "/staff/login", CANDIDATE: "/status",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
.authx{--font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--ac:#8b5cf6;--ac-deep:#6d28d9;--br:oklch(0.76 0.13 162);--br-deep:oklch(0.64 0.13 162);--ease:cubic-bezier(.22,1,.36,1);position:relative;min-height:100vh;background:#06070d;color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
.authx *{box-sizing:border-box;font-family:var(--font);}
.authx a{color:inherit;text-decoration:none;}.authx button{font-family:inherit;cursor:pointer;}
.authx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(139,92,246,.45);border-radius:10px;}
.authx .up{text-transform:uppercase;letter-spacing:.14em;}
.authx .aurora{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:radial-gradient(55% 50% at 16% 18%, rgba(139,92,246,.28), transparent 70%),radial-gradient(55% 50% at 88% 82%, oklch(0.34 0.09 162/.4), transparent 70%),#06070d;}
.authx .aurora i{position:absolute;border-radius:50%;filter:blur(90px);}
.authx .aurora .a{width:46vw;height:46vw;left:-12vw;top:-16vw;background:radial-gradient(circle, var(--ac), transparent 66%);opacity:.16;animation:auth-drift 26s var(--ease) infinite;}
.authx .aurora .b{width:42vw;height:42vw;right:-12vw;bottom:-16vw;background:radial-gradient(circle, var(--br), transparent 66%);opacity:.14;animation:auth-drift 32s var(--ease) infinite reverse;}
@keyframes auth-drift{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(4%,-5%) scale(1.12);}}
.authx .bgv{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;opacity:0;transition:opacity 1.1s var(--ease);}
.authx .bgv.in{opacity:.52;}
.authx .veil{position:fixed;inset:0;z-index:2;pointer-events:none;background:linear-gradient(105deg, rgba(6,7,13,.78) 0%, rgba(6,7,13,.5) 40%, rgba(6,7,13,.32) 70%),linear-gradient(0deg, rgba(6,7,13,.7), transparent 45%);}
.authx .page{position:relative;z-index:10;display:flex;flex-direction:column;min-height:100vh;}
.authx nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px clamp(20px,4vw,48px) 0;}
.authx .logo{display:flex;align-items:center;gap:11px;}
.authx .nlinks{display:flex;align-items:center;gap:clamp(20px,3vw,40px);}
.authx .nlinks a{font-size:12.5px;font-weight:600;color:rgba(255,255,255,.82);transition:color .2s;}
.authx .nlinks a:hover{color:#fff;}
.authx .burger{display:none;width:38px;height:38px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);flex-direction:column;align-items:center;justify-content:center;gap:4px;}
.authx .burger span{width:16px;height:2px;background:#fff;border-radius:2px;}
@media(max-width:880px){.authx .nlinks{display:none;}.authx .burger{display:flex;}}
.authx .body{flex:1;display:grid;grid-template-columns:1.15fr 0.85fr;gap:24px;align-items:stretch;padding:clamp(20px,3vw,40px) clamp(20px,4vw,48px) clamp(24px,3vw,44px);min-height:0;}
@media(max-width:880px){.authx .body{grid-template-columns:1fr;gap:18px;}}
.authx .hero{display:flex;flex-direction:column;justify-content:flex-end;gap:clamp(20px,3vw,36px);min-width:0;}
.authx .stats{display:flex;gap:clamp(20px,3vw,44px);justify-content:flex-start;flex-wrap:wrap;}
.authx .stat .n{font-size:clamp(1.6rem,4vw,3rem);font-weight:600;line-height:1;letter-spacing:-0.02em;}
.authx .stat .n em{font-style:normal;color:var(--ac);font-size:.5em;vertical-align:super;margin-right:.04em;}
.authx .stat .l{font-size:clamp(9.5px,1vw,12px);font-weight:600;color:rgba(255,255,255,.6);margin-top:8px;line-height:1.25;white-space:pre-line;}
.authx .tagline{font-size:clamp(10px,1.1vw,12.5px);font-weight:600;color:rgba(255,255,255,.62);max-width:28ch;line-height:1.7;}
.authx .heading{display:flex;flex-direction:column;}
.authx .heading .word{overflow:hidden;display:block;}
.authx .heading .word b{display:block;font-size:clamp(2.6rem,8.5vw,7rem);line-height:.9;font-weight:700;letter-spacing:-0.03em;transform:translateY(110%);animation:auth-reveal .7s var(--ease) forwards;}
.authx .heading .word b.em{color:transparent;background:linear-gradient(110deg, var(--br), #fff 55%, var(--ac));-webkit-background-clip:text;background-clip:text;}
.authx .cardwrap{display:flex;align-items:center;justify-content:center;min-width:0;}
.authx .card{width:100%;max-width:400px;border-radius:24px;padding:30px 28px;background:rgba(255,255,255,0.04);-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 70px -28px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.12);}
.authx .card h1{font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px;}
.authx .card .lede{font-size:13px;color:rgba(255,255,255,.6);margin:0 0 22px;}
.authx .field{margin-bottom:13px;}
.authx .field label{display:block;font-size:11px;font-weight:600;color:rgba(255,255,255,.62);margin-bottom:7px;letter-spacing:.04em;text-transform:uppercase;}
.authx .ctrl{display:flex;align-items:center;gap:10px;height:46px;padding:0 14px;border-radius:13px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);transition:border-color .2s,box-shadow .2s,background .2s;}
.authx .ctrl:focus-within{border-color:var(--br);background:rgba(255,255,255,.07);box-shadow:0 0 0 3px oklch(0.76 0.13 162/.22);}
.authx .ctrl svg{color:rgba(255,255,255,.45);flex-shrink:0;}
.authx .ctrl input{flex:1;border:none;outline:none;background:transparent;color:#fff;font-size:14.5px;}
.authx .ctrl input::placeholder{color:rgba(255,255,255,.34);}
.authx .ctrl input:-webkit-autofill,.authx .ctrl input:-webkit-autofill:hover,.authx .ctrl input:-webkit-autofill:focus,.authx .ctrl input:-webkit-autofill:active{-webkit-text-fill-color:#fff;caret-color:#fff;-webkit-background-clip:text;transition:background-color 600000s 0s,color 600000s 0s;}
.authx .ctrl .toggle{background:none;border:none;color:rgba(255,255,255,.45);display:flex;padding:4px;}
.authx .rowbtw{display:flex;justify-content:space-between;align-items:center;margin:2px 0 18px;}
.authx .rowbtw label{display:flex;align-items:center;gap:7px;font-size:12px;color:rgba(255,255,255,.62);cursor:pointer;}
.authx .rowbtw a{font-size:12px;font-weight:600;color:var(--ac);}
.authx .err{font-size:12.5px;color:#ffb4b4;background:rgba(255,80,80,.1);border:1px solid rgba(255,80,80,.28);border-radius:10px;padding:9px 12px;margin-bottom:14px;line-height:1.45;}
.authx .btn{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;height:48px;border:none;border-radius:999px;font-size:14.5px;font-weight:700;transition:transform .15s var(--ease),box-shadow .25s,filter .2s,background .2s;}
.authx .btn:active{transform:scale(.98);}.authx .btn:disabled{opacity:.6;cursor:default;}
.authx .btn-em{background:linear-gradient(180deg, var(--br), var(--br-deep));color:#05120c;box-shadow:0 12px 30px -10px oklch(0.64 0.13 162/.6), inset 0 1px 0 rgba(255,255,255,.4);}
.authx .btn-em:hover{filter:brightness(1.06);}
.authx .btn-glass{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);color:#fff;margin-top:10px;}
.authx .btn-glass:hover{background:rgba(255,255,255,.1);}
.authx .divider{display:flex;align-items:center;gap:12px;margin:18px 0;color:rgba(255,255,255,.4);font-size:11px;font-weight:600;letter-spacing:.1em;}
.authx .divider::before,.authx .divider::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.12);}
.authx .social{display:flex;gap:10px;}
.authx .social button{flex:1;height:46px;border-radius:13px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;font-weight:600;transition:background .2s;}
.authx .social button:hover{background:rgba(255,255,255,.09);}
.authx .foot{text-align:center;font-size:12.5px;color:rgba(255,255,255,.55);margin-top:20px;}
.authx .foot a{color:var(--ac);font-weight:600;}
.authx .trust{display:flex;gap:7px;align-items:center;justify-content:center;font-size:10.5px;color:rgba(255,255,255,.4);margin-top:14px;letter-spacing:.04em;}
.authx .mobile{display:none;position:fixed;inset:0;z-index:60;background:rgba(6,7,13,.97);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);flex-direction:column;padding:22px clamp(20px,5vw,40px);}
.authx .mobile.open{display:flex;}
.authx .mobile .top{display:flex;justify-content:space-between;align-items:center;}
.authx .mobile .x{width:38px;height:38px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);color:#fff;display:grid;place-items:center;}
.authx .mobile .links{display:flex;flex-direction:column;gap:26px;margin-top:64px;}
.authx .mobile .links a{font-size:30px;font-weight:700;}
.authx .mobile .mcta{margin-top:auto;display:inline-flex;align-items:center;gap:8px;color:var(--ac);font-size:20px;font-weight:700;}
@keyframes auth-fd{from{opacity:0;transform:translateY(-20px);}to{opacity:1;transform:none;}}
@keyframes auth-fu{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:none;}}
@keyframes auth-reveal{from{transform:translateY(110%);}to{transform:translateY(0);}}
.authx .fd{opacity:0;animation:auth-fd .5s var(--ease) forwards;}
.authx .fu{opacity:0;animation:auth-fu .6s var(--ease) forwards;}
.authx.settled .fd,.authx.settled .fu{opacity:1 !important;transform:none !important;animation:none !important;}
.authx.settled .heading .word b{transform:none !important;animation:none !important;}
@media(prefers-reduced-motion:reduce){.authx .fd,.authx .fu,.authx .heading .word b,.authx .aurora i{animation:none !important;opacity:1 !important;transform:none !important;}.authx .bgv{transition:none;}}
`;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settled, setSettled] = useState(false);
  const vid = useRef<HTMLVideoElement>(null);
  const [vidIn, setVidIn] = useState(false);

  // safety net: guarantee entrance content is visible even if compositor
  // animations are throttled in a backgrounded tab.
  useEffect(() => { const t = setTimeout(() => setSettled(true), 1500); return () => clearTimeout(t); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !pw) { setError("Enter your work email and password."); return; }
    setLoading(true);
    try {
      await login(email, pw);
      let token: string | null = null;
      try { token = window.sessionStorage.getItem("ats-access-token"); } catch {}
      const me = await fetch(`${API_BASE}/auth/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: "include" }).then((r) => (r.ok ? r.json() : null));
      const role = me?.data?.role ?? me?.role;
      if (role && !ALLOWED.includes(role)) {
        const to = REDIRECT[role];
        setError(`This portal is for tenant admins. Your account is ${role}.${to ? " Sign in at " + to + "." : ""}`);
        try { window.sessionStorage.removeItem("ats-access-token"); } catch {}
        document.cookie = "ats-token=; Max-Age=0; path=/";
        setLoading(false);
        return;
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
      setLoading(false);
    }
  }

  async function onSso() {
    setError("");
    if (!email) { setError("Enter your work email first, then continue with SSO."); return; }
    try {
      const res = await fetch(`${API_BASE}/auth/sso/discover`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const body = res.ok ? await res.json() : null;
      const data = body?.data ?? body;
      if (data?.initiateUrl) { window.location.href = data.initiateUrl; return; }
      setError("No single sign-on is configured for that email domain.");
    } catch { setError("Could not reach the SSO service."); }
  }
  const oauth = (provider: string) => { window.location.href = `${API_BASE}/auth/oauth/${provider}`; };

  return (
    <div className={"authx" + (settled ? " settled" : "")}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="aurora" aria-hidden="true"><i className="a" /><i className="b" /></div>
      <video ref={vid} className={"bgv" + (vidIn ? " in" : "")} muted autoPlay loop playsInline preload="auto" aria-hidden="true"
        onLoadedData={() => setVidIn(true)}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_222138_3e3205be-3364-417b-a64a-bfe087acbec4.mp4" />
      <div className="veil" aria-hidden="true" />

      <div className="page">
        <nav>
          <a className="logo fd" style={{ animationDelay: "0s" }} href="/welcome"><img src="/assets/logo-dark.png" alt="TalentFlow ATS" style={{ height: 30, width: "auto", display: "block" }} /></a>
          <div className="nlinks">
            <a className="fd up" style={{ animationDelay: ".1s" }} href="/welcome">Product</a>
            <a className="fd up" style={{ animationDelay: ".2s" }} href="/pricing">Pricing</a>
            <a className="fd up" style={{ animationDelay: ".3s" }} href="/welcome">Customers</a>
            <a className="fd up" style={{ animationDelay: ".4s" }} href="/support">Help</a>
          </div>
          <button className="burger fd" style={{ animationDelay: ".5s" }} aria-label="Menu" onClick={() => setMobileOpen(true)}><span /><span /><span /></button>
        </nav>

        <div className="body">
          <section className="hero">
            <div className="stats">
              <div className="stat fu" style={{ animationDelay: ".24s" }}><div className="n"><em>+</em>2.4M</div><div className="l up">{"Résumés\nScreened"}</div></div>
              <div className="stat fu" style={{ animationDelay: ".36s" }}><div className="n"><em>+</em>180K</div><div className="l up">{"Hires\nMade"}</div></div>
              <div className="stat fu" style={{ animationDelay: ".48s" }}><div className="n"><em>+</em>4.2K</div><div className="l up">{"Teams\nOnboard"}</div></div>
            </div>
            <p className="tagline fu up" style={{ animationDelay: ".6s" }}>Evidence-backed AI screening. Human-in-the-loop decisions. Candidate transparency from the first click.</p>
            <div className="heading">
              <span className="word"><b style={{ animationDelay: ".4s" }}>Hire</b></span>
              <span className="word"><b style={{ animationDelay: ".54s" }}>With</b></span>
              <span className="word"><b className="em" style={{ animationDelay: ".68s" }}>Clarity</b></span>
            </div>
          </section>

          <section className="cardwrap">
            <div className="card fu" style={{ animationDelay: ".5s" }}>
              <h1>Welcome back</h1>
              <p className="lede">Sign in to your TalentFlow workspace.</p>
              <form onSubmit={handleSubmit} noValidate>
                {error && <div className="err" role="alert">{error}</div>}
                <div className="field"><label>Work email</label>
                  <div className="ctrl"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /></svg>
                    <input type="email" placeholder="you@company.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
                <div className="field"><label>Password</label>
                  <div className="ctrl"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 11V8a6 6 0 1 1 12 0v3M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" /></svg>
                    <input type={showPw ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
                    <button type="button" className="toggle" aria-label="Show password" onClick={() => setShowPw((s) => !s)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg></button></div></div>
                <div className="rowbtw">
                  <label><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} style={{ accentColor: "var(--br)", width: 15, height: 15 }} /> Keep me signed in</label>
                  <a href="/forgot-password">Forgot?</a>
                </div>
                <button className="btn btn-em" type="submit" disabled={loading}>{loading ? "Signing in" : "Sign in"}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>
                <button className="btn btn-glass" type="button" onClick={onSso}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" /></svg> Continue with single sign-on</button>
              </form>
              <div className="divider">OR</div>
              <div className="social">
                <button onClick={() => oauth("google")}><svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.9z" /><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.7l-3.6-2.7c-1 .7-2.2 1-3.6 1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M6 14.2a6.6 6.6 0 0 1 0-4.2V7.2H2.3a11 11 0 0 0 0 9.8z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.2L6 10c.9-2.6 3.2-4.5 6-4.5z" /></svg> Google</button>
                <button onClick={() => oauth("microsoft")}><svg width="16" height="16" viewBox="0 0 24 24"><path fill="#F25022" d="M3 3h8.5v8.5H3z" /><path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" /><path fill="#00A4EF" d="M3 12.5h8.5V21H3z" /><path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" /></svg> Microsoft</button>
              </div>
              <div className="foot">New to TalentFlow? <a href="/get-started">Start free</a></div>
              <div className="trust up"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--br)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" /><path d="M9 12l2 2 4-4" /></svg> SOC 2 · SSO · SAML</div>
            </div>
          </section>
        </div>
      </div>

      <div className={"mobile" + (mobileOpen ? " open" : "")}>
        <div className="top">
          <div className="logo"><img src="/assets/logo-dark.png" alt="TalentFlow ATS" style={{ height: 30, width: "auto", display: "block" }} /></div>
          <button className="x" aria-label="Close" onClick={() => setMobileOpen(false)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
        </div>
        <div className="links up"><a href="/welcome">Product</a><a href="/pricing">Pricing</a><a href="/welcome">Customers</a><a href="/support">Help</a></div>
        <a className="mcta up" href="/get-started">Start free <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg></a>
      </div>
    </div>
  );
}
