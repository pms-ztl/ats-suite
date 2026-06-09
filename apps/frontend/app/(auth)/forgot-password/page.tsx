"use client";

/**
 * Forgot / reset password — rebuilt on the "nexto." hero design spec (DM Sans, Material Symbols
 * Rounded, layered spaceship background, floating cloud/heart decorations, full-viewport no-scroll,
 * responsive navbar + mobile overlay). The original three-state flow is preserved exactly:
 *   - email  : request a reset link  -> POST /api/auth/forgot-password
 *   - sent   : confirmation + resend
 *   - reset  : ?token= present -> set a new password -> POST /api/auth/reset-password
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
const LOGO = "/assets/logo-light.png";

function validateEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
  return null;
}
function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0&display=swap');

/* The global "html { zoom: 0.9 }" (globals.css) shrinks the dense dashboard
   chrome, but it also scales this full-screen fixed hero down to 90%, leaving a
   ~10% dead strip on the right + bottom. Neutralise it only while this page is
   mounted, so every other route keeps the intended zoom. */
html:has(.nf-root) { zoom: 1; }
.nf-root, .nf-root * { box-sizing: border-box; }
.nf-root {
  --text-main:#1a1a1a; --text-secondary:#888888; --bg-page:#F5F5F5; --card-bg:#ffffff;
  position: fixed; inset: 0; height: 100vh; width: 100vw; overflow: hidden;
  display: flex; flex-direction: column;
  font-family: 'DM Sans', system-ui, sans-serif; color: var(--text-main);
  background-image:
    url('https://pub-e68758f43067417dba612b2371819aa1.r2.dev/viktor-components/alien-spaceship.png'),
    linear-gradient(150deg, #EFF1F8, #F6F7FB 55%, #F2F3FA);
  background-repeat: no-repeat, no-repeat;
  background-position: 42% 46%, center;
  background-size: cover, cover;
  background-attachment: fixed, fixed;
}
.nf-root .material-symbols-rounded { font-family: 'Material Symbols Rounded'; font-weight: normal; font-style: normal; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; }

/* ---- navbar ---- */
.nf-nav { position: relative; width: 100%; padding: 26px clamp(24px, 4vw, 80px); display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.nf-nav::after { content: ""; position: absolute; left: clamp(24px, 4vw, 80px); right: clamp(24px, 4vw, 80px); bottom: 0; height: 1px; background-image: linear-gradient(to right, rgba(0,0,0,0.08) 2px, transparent 2px); background-size: 6px 1px; }
.nf-left { display: flex; align-items: center; gap: 9px; }
.nf-left img { height: 30px; }
.nf-brand { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; color: #111; }
.nf-links { display: flex; align-items: center; gap: 36px; }
.nf-links a { font-size: 14px; font-weight: 400; color: var(--text-main); opacity: 0.65; text-decoration: none; transition: opacity .15s; display: inline-flex; align-items: center; gap: 4px; }
.nf-links a:hover { opacity: 1; }
.nf-cta { display: inline-flex; align-items: center; gap: 9px; background: linear-gradient(180deg, #2c2c2c 0%, #111111 100%); color: #fff; font-size: 13px; font-weight: 500; border: none; border-radius: 40px; padding: 5px 16px 5px 5px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.15); transition: transform .15s, box-shadow .15s, filter .15s; text-decoration: none; }
.nf-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(0,0,0,0.22); filter: brightness(1.1); }
.nf-cta .nf-arrow { width: 24px; height: 24px; border-radius: 50%; background: #fff; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nf-cta .nf-arrow svg { width: 13px; height: 13px; }

/* hamburger */
.nf-burger { display: none; flex-direction: column; gap: 5px; width: 24px; background: none; border: none; cursor: pointer; padding: 4px 0; z-index: 60; }
.nf-burger span { display: block; width: 24px; height: 2px; background: #111; border-radius: 2px; transition: transform .3s, opacity .2s; }
.nf-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nf-burger.open span:nth-child(2) { opacity: 0; }
.nf-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* mobile nav overlay */
.nf-mnav { position: fixed; inset: 0; background: #F7F7F7; z-index: 50; transform: translateX(100%); transition: transform .55s cubic-bezier(0.77,0,0.175,1); display: flex; flex-direction: column; justify-content: center; padding: 40px; }
.nf-mnav.open { transform: translateX(0); }
.nf-mnav a { font-size: 38px; font-weight: 800; letter-spacing: -1.5px; color: var(--text-main); text-decoration: none; padding: 24px 0; border-bottom: 1px solid rgba(0,0,0,0.08); }
.nf-mnav a:last-child { border-bottom: none; margin-top: 18px; }
.nf-mnav .nf-cta { font-size: 18px; align-self: flex-start; padding: 6px 22px 6px 6px; }
.nf-mnav .nf-cta .nf-arrow { width: 32px; height: 32px; }

/* ---- main ---- */
.nf-main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(380px, 520px); align-items: center; gap: clamp(24px, 5vw, 96px); width: 100%; padding: clamp(16px, 3vh, 44px) clamp(24px, 4vw, 80px); }
.nf-left-col { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; text-align: left; padding: 0; min-width: 0; }
.nf-right-col { display: flex; flex-direction: column; justify-content: center; align-items: stretch; padding: 0; min-width: 0; }
.nf-right-inner { width: 100%; max-width: 520px; margin-left: auto; display: flex; flex-direction: column; gap: 12px; }
.nf-reassure { display: flex; align-items: center; gap: 8px; margin-top: 4px; padding: 0 6px; font-size: 12px; color: var(--text-secondary); }
.nf-reassure .material-symbols-rounded { font-size: 15px; color: #2e9e6b; }
.nf-lost { font-size: 15px; color: var(--text-secondary); font-weight: 400; margin: 0 0 12px; }
.nf-titlewrap { position: relative; display: inline-block; margin-bottom: 14px; }
.nf-deco { position: absolute; background: linear-gradient(to bottom, #F7B2FB 50%, #786EF1 80%, #5588FB 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; filter: drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff); pointer-events: none; }
.nf-deco.cloud { top: -18px; left: -24px; font-size: 42px; animation: nfFloat 5s ease-in-out .3s infinite; }
.nf-deco.heart { bottom: -15px; right: 20px; font-size: 32px; animation: nfFloat 4.5s ease-in-out 1s infinite; }
.nf-title { font-size: clamp(34px, 5vw, 52px); font-weight: 500; letter-spacing: -1.5px; line-height: 1.08; color: #0f0f0f; margin: 0; }
.nf-sub { font-size: 14px; color: var(--text-secondary); line-height: 1.7; max-width: 470px; margin: 0 0 28px; }
.nf-tag { display: inline-flex; align-items: center; background: #E0E2E7; font-size: 12.5px; font-weight: 600; color: var(--text-main); padding: 2px 12px; border-radius: 6px; }
.nf-steps { list-style: none; margin: 26px 0 0; padding: 0; display: flex; flex-direction: column; gap: 13px; }
.nf-steps li { display: flex; align-items: center; gap: 12px; font-size: 13.5px; color: var(--text-main); }
.nf-step-n { width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%; background: linear-gradient(145deg, #786EF1, #5588FB); color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 9px rgba(120,110,241,0.32); }

/* ---- footer ---- */
.nf-foot { flex-shrink: 0; width: 100%; padding: 12px clamp(24px, 4vw, 80px) 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 12.5px; color: var(--text-secondary); }
.nf-foot .nf-trust { display: inline-flex; align-items: center; gap: 7px; }
.nf-foot .nf-trust .material-symbols-rounded { font-size: 16px; color: #2e9e6b; }
.nf-foot a { color: var(--text-main); opacity: 0.72; text-decoration: none; }
.nf-foot a:hover { opacity: 1; }

/* ---- bottom card stack (form + nav) ---- */
.nf-stack { display: flex; flex-direction: column; gap: 12px; max-width: 460px; width: 100%; margin-top: auto; }
.nf-card { display: flex; align-items: center; justify-content: space-between; gap: 14px; background: linear-gradient(135deg, rgba(255,255,255,0.26), rgba(236,240,255,0.10)); backdrop-filter: blur(18px) saturate(165%); -webkit-backdrop-filter: blur(18px) saturate(165%); border: 1px solid rgba(255,255,255,0.6); border-radius: 20px; padding: 18px 22px; box-shadow: 0 12px 34px rgba(60,70,130,0.11), inset 0 1px 1.5px rgba(255,255,255,0.9), inset 0 0 0 1px rgba(255,255,255,0.16); text-decoration: none; color: inherit; transition: transform .3s cubic-bezier(.2,.7,.3,1), box-shadow .3s, background .3s; cursor: pointer; }
.nf-card:hover { transform: translateY(-3px); background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(238,242,255,0.2)); box-shadow: 0 18px 46px rgba(60,70,130,0.16), inset 0 1px 1.5px rgba(255,255,255,1), inset 0 0 0 1px rgba(255,255,255,0.24); }
.nf-card .nf-cl { display: flex; align-items: center; gap: 14px; text-align: left; min-width: 0; }
.nf-cicon { width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(228,231,238,0.5)); border: 1px solid rgba(255,255,255,0.75); box-shadow: inset 0 1px 1px rgba(255,255,255,0.95), 0 3px 10px rgba(70,80,150,0.10); display: flex; align-items: center; justify-content: center; transition: transform .25s; }
.nf-card:hover .nf-cicon { transform: scale(1.05); }
.nf-cicon svg { width: 22px; height: 22px; }
.nf-cicon .material-symbols-rounded { font-size: 24px; color: #1a1a1a; }
.nf-ctitle { font-size: 15px; font-weight: 600; }
.nf-csub { font-size: 12px; color: var(--text-secondary); }
.nf-chev { font-size: 21px; color: var(--text-secondary); flex-shrink: 0; transition: transform .2s; }
.nf-card:hover .nf-chev { transform: translateX(6px); }

/* ---- form card ---- */
.nf-form { position: relative; overflow: hidden; background: linear-gradient(135deg, rgba(255,255,255,0.30), rgba(236,240,255,0.12)); backdrop-filter: blur(20px) saturate(170%); -webkit-backdrop-filter: blur(20px) saturate(170%); border: 1px solid rgba(255,255,255,0.65); border-radius: 22px; padding: 20px; box-shadow: 0 14px 42px rgba(60,70,130,0.13), inset 0 1px 1.5px rgba(255,255,255,0.9), inset 0 0 0 1px rgba(255,255,255,0.18); text-align: left; }
.nf-form::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 55%; border-radius: 22px 22px 60% 60% / 22px 22px 24px 24px; background: linear-gradient(180deg, rgba(255,255,255,0.45), transparent); pointer-events: none; z-index: 0; }
.nf-form > * { position: relative; z-index: 1; }
.nf-form::after { content: ""; position: absolute; top: 0; bottom: 0; left: -70%; width: 42%; z-index: 3; pointer-events: none; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.32) 50%, transparent); transform: skewX(-16deg); animation: nfSheen 7s ease-in-out 2.4s infinite; }
.nf-flabel { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin: 0 0 8px 4px; display: block; }
.nf-field { position: relative; z-index: 1; display: flex; align-items: center; gap: 11px; background: rgba(255,255,255,0.66); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(70,72,110,0.14); border-radius: 13px; padding: 0 14px; box-shadow: inset 0 1px 2px rgba(255,255,255,0.7); transition: border-color .18s, box-shadow .18s, background .18s; }
.nf-field:focus-within { border-color: rgba(120,110,241,0.55); background: rgba(255,255,255,0.85); box-shadow: 0 0 0 3px rgba(120,110,241,0.14); }
.nf-field input:-webkit-autofill { -webkit-text-fill-color: #1a1a1a; -webkit-box-shadow: 0 0 0 60px rgba(255,255,255,0.92) inset; }
.nf-field.err { border-color: #e5484d; }
.nf-field .material-symbols-rounded { font-size: 20px; color: var(--text-secondary); flex-shrink: 0; }
.nf-field input { flex: 1; min-width: 0; border: none; background: none; outline: none; padding: 13px 0; font-family: inherit; font-size: 14px; color: var(--text-main); }
.nf-field input::placeholder { color: #aab0bb; }
.nf-eye { background: none; border: none; cursor: pointer; color: var(--text-secondary); display: flex; padding: 4px; }
.nf-field + .nf-field { margin-top: 10px; }
.nf-err { font-size: 12px; color: #e5484d; margin: 8px 0 0 4px; }
.nf-send { width: 100%; margin-top: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(180deg, #2c2c2c 0%, #111111 100%); color: #fff; font-family: inherit; font-size: 14px; font-weight: 600; border: none; border-radius: 40px; padding: 12px 18px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.15); transition: transform .15s, box-shadow .15s, filter .15s; }
.nf-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(0,0,0,0.22); filter: brightness(1.1); }
.nf-send:disabled { opacity: .6; cursor: not-allowed; }
.nf-send .nf-arrow { width: 24px; height: 24px; border-radius: 50%; background: #fff; display: inline-flex; align-items: center; justify-content: center; }
.nf-send .nf-arrow svg { width: 13px; height: 13px; }
.nf-strength { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.nf-strength li { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-secondary); }
.nf-strength li.met { color: #2e9e6b; }
.nf-strength .material-symbols-rounded { font-size: 16px; }
.nf-sent-banner { display: flex; align-items: center; gap: 10px; background: #eaf7f0; border: 1px solid rgba(46,158,107,0.3); color: #2e9e6b; border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 500; }
.nf-sent-banner .material-symbols-rounded { font-size: 20px; }
.nf-sent-banner b { color: #1a1a1a; }

@keyframes nfFloat { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-10px) rotate(3deg); } }
@keyframes nfSheen { 0% { left: -70%; } 16%, 100% { left: 140%; } }

/* ---- responsive ---- */
@media (max-width: 900px) {
  .nf-main { grid-template-columns: 1fr; max-width: 600px; margin: 0 auto; gap: 22px; padding: 10px 24px 28px; }
  .nf-left-col { align-items: center; text-align: center; padding: 6px 0 0; }
  .nf-right-col { padding: 0; align-items: stretch; }
  .nf-right-inner { max-width: 460px; margin: 0 auto; }
  .nf-root { background-position: center 42%, center; background-size: cover, cover; }
  .nf-steps { align-items: center; }
  .nf-foot { flex-direction: column; gap: 6px; text-align: center; padding: 10px 24px 16px; }
}
@media (max-width: 768px) {
  .nf-root { background-size: cover, cover; background-position: center 40%, center; }
  .nf-links, .nf-nav > .nf-cta { display: none; }
  .nf-burger { display: flex; }
  .nf-nav { padding: 20px; }
  .nf-title { font-size: 30px; }
  .nf-deco.cloud { font-size: 34px; top: -14px; left: -18px; }
  .nf-deco.heart { font-size: 26px; bottom: -12px; right: 14px; }
  .nf-stack { max-width: 100%; gap: 10px; }
  .nf-card { padding: 15px 16px; }
  .nf-cicon { width: 42px; height: 42px; }
}
@media (max-width: 480px) {
  .nf-root { background-size: cover, cover; }
  .nf-title { font-size: 26px; }
  .nf-deco.cloud { font-size: 30px; }
  .nf-deco.heart { font-size: 22px; }
}
`;

const ChevronArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
);

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Agents", href: "/agents" },
  { label: "Contact", href: "/contact" },
];

function Shell({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="nf-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <nav className="nf-nav">
        <Link href="/" className="nf-left" aria-label="TalentFlow home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="TalentFlow ATS" />
        </Link>
        <div className="nf-links">
          {NAV_LINKS.map((l) => <Link key={l.label} href={l.href}>{l.label}</Link>)}
        </div>
        <Link href="/login" className="nf-cta">
          <span className="nf-arrow"><ChevronArrow /></span> Sign in
        </Link>
        <button className={"nf-burger" + (open ? " open" : "")} aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </nav>
      <div className={"nf-mnav" + (open ? " open" : "")}>
        {NAV_LINKS.map((l) => <Link key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>)}
        <Link href="/login" className="nf-cta" onClick={() => setOpen(false)}>
          <span className="nf-arrow"><ChevronArrow /></span> Sign in
        </Link>
      </div>
      <main className="nf-main">
        <div className="nf-left-col">{left}</div>
        <div className="nf-right-col"><div className="nf-right-inner">{right}<div className="nf-reassure"><span className="material-symbols-rounded">lock</span> 256-bit encryption · we never email your password</div></div></div>
      </main>
      <footer className="nf-foot">
        <span className="nf-trust"><span className="material-symbols-rounded">verified_user</span> SOC 2 Type II · SSO · SAML · GDPR</span>
        <span>© 2026 TalentFlow · <Link href="/contact">Need help?</Link></span>
      </footer>
    </div>
  );
}

function BackToSignIn() {
  return (
    <Link href="/login" className="nf-card">
      <span className="nf-cl">
        <span className="nf-cicon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
        </span>
        <span>
          <div className="nf-ctitle">Back to sign in</div>
          <div className="nf-csub">Remembered it after all?</div>
        </span>
      </span>
      <span className="nf-chev">&rsaquo;</span>
    </Link>
  );
}

/* ── Reset password (token present) ─────────────────────────────────────────── */
function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordErr = validatePassword(password);
    const confirmErr = password !== confirm ? "Passwords do not match." : null;
    if (passwordErr || confirmErr) {
      setErrors({ password: passwordErr ?? undefined, confirm: confirmErr ?? undefined });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 800));
        toast.success("Password reset successfully! Redirecting to sign in…");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");
      toast.success("Password reset successfully! Redirecting to sign in…");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  return (
    <Shell
      left={<>
      <p className="nf-lost">Almost there. One last step.</p>
      <div className="nf-titlewrap">
        <span className="nf-deco cloud material-symbols-rounded">cloud</span>
        <span className="nf-deco heart material-symbols-rounded">favorite</span>
        <h1 className="nf-title">Set a new password</h1>
      </div>
      <p className="nf-sub">
        Choose a strong <span className="nf-tag">password</span> you&apos;ll remember. We&apos;ll log you straight back into your <span className="nf-tag">workspace</span>.
      </p>
      </>}
      right={<>
        <form className="nf-form" onSubmit={handleSubmit}>
          <label className="nf-flabel">New password</label>
          <div className={"nf-field" + (errors.password ? " err" : "")}>
            <span className="material-symbols-rounded">lock</span>
            <input type={showPassword ? "text" : "password"} placeholder="Min. 8 chars, 1 uppercase, 1 number" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus autoComplete="new-password" />
            <button type="button" className="nf-eye" tabIndex={-1} aria-label="Toggle password" onClick={() => setShowPassword((v) => !v)}>
              <span className="material-symbols-rounded">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {errors.password && <p className="nf-err">{errors.password}</p>}
          {password.length > 0 && (
            <ul className="nf-strength">
              {checks.map((c) => (
                <li key={c.label} className={c.met ? "met" : ""}>
                  <span className="material-symbols-rounded">{c.met ? "check_circle" : "radio_button_unchecked"}</span>{c.label}
                </li>
              ))}
            </ul>
          )}
          <label className="nf-flabel" style={{ marginTop: 14 }}>Confirm password</label>
          <div className={"nf-field" + (errors.confirm ? " err" : "")}>
            <span className="material-symbols-rounded">lock</span>
            <input type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            <button type="button" className="nf-eye" tabIndex={-1} aria-label="Toggle password" onClick={() => setShowConfirm((v) => !v)}>
              <span className="material-symbols-rounded">{showConfirm ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {errors.confirm && <p className="nf-err">{errors.confirm}</p>}
          <button type="submit" className="nf-send" disabled={loading}>
            <span className="nf-arrow"><ChevronArrow /></span>{loading ? "Saving…" : "Set new password"}
          </button>
        </form>
        <BackToSignIn />
      </>}
    />
  );
}

/* ── Forgot password (email + sent) ─────────────────────────────────────────── */
type Step = "email" | "sent";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (resetToken) return <ResetPasswordForm token={resetToken} />;

  const sendResetLink = async () => {
    const err = validateEmail(email);
    if (err) { setEmailErr(err); return; }
    setEmailErr(null);
    setLoading(true);
    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 800));
        setStep("sent");
        return;
      }
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset link.");
      setStep("sent");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendResetLink(); };

  if (step === "sent") {
    return (
      <Shell
        left={<>
        <p className="nf-lost">Sent! Now check your inbox.</p>
        <div className="nf-titlewrap">
          <span className="nf-deco cloud material-symbols-rounded">cloud</span>
          <span className="nf-deco heart material-symbols-rounded">favorite</span>
          <h1 className="nf-title">Check your email</h1>
        </div>
        <p className="nf-sub">
          We sent a secure <span className="nf-tag">reset link</span> to your inbox. Open it within 30 minutes to set a new <span className="nf-tag">password</span>.
        </p>
        </>}
      right={<>
          <div className="nf-form">
            <div className="nf-sent-banner">
              <span className="material-symbols-rounded">mark_email_read</span>
              <span>Reset link sent to <b>{email}</b></span>
            </div>
            <button type="button" className="nf-send" disabled={loading} onClick={() => { sendResetLink(); toast.info("Reset link resent."); }}>
              <span className="nf-arrow"><ChevronArrow /></span>{loading ? "Resending…" : "Didn't get it? Resend"}
            </button>
          </div>
          <BackToSignIn />
        </>}
      />
    );
  }

  return (
    <Shell
      left={<>
      <p className="nf-lost">Forgot your password? Happens to the best of us.</p>
      <div className="nf-titlewrap">
        <span className="nf-deco cloud material-symbols-rounded">cloud</span>
        <span className="nf-deco heart material-symbols-rounded">favorite</span>
        <h1 className="nf-title">Let&apos;s get you back in</h1>
      </div>
      <p className="nf-sub">
        Enter your work <span className="nf-tag">email</span> and we&apos;ll send a secure <span className="nf-tag">reset link</span>. It expires in 30 minutes, so keep an eye on your inbox.
      </p>
      <ol className="nf-steps">
        <li><span className="nf-step-n">1</span> Enter your work email below</li>
        <li><span className="nf-step-n">2</span> Open the secure link we email you</li>
        <li><span className="nf-step-n">3</span> Choose a fresh password and you&apos;re in</li>
      </ol>
      </>}
      right={<>
        <form className="nf-form" onSubmit={handleSubmit}>
          <label className="nf-flabel">Work email</label>
          <div className={"nf-field" + (emailErr ? " err" : "")}>
            <span className="material-symbols-rounded">mail</span>
            <input type="email" placeholder="you@company.com" value={email} onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(null); }} autoFocus autoComplete="email" />
          </div>
          {emailErr && <p className="nf-err">{emailErr}</p>}
          <button type="submit" className="nf-send" disabled={loading || !email}>
            <span className="nf-arrow"><ChevronArrow /></span>{loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <BackToSignIn />
      </>}
    />
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
