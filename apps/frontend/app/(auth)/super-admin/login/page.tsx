"use client";

/**
 * Platform-admin (super-admin) sign-in.
 *
 * Self-contained, theme-adaptive page (follows the app's `.dark` class on
 * <html>): glassmorphic nav, ambient video hero (pushed right, scrimmed left),
 * Inter / Outfit / Fraunces type, #9fff00 brand accent, CSS motion. All colors
 * flow from CSS variables that flip in dark mode, and the TalentFlow logo swaps
 * with the surface: dark (full-color) logo on the light theme, white logo on
 * the dark theme — so it never disappears.
 *
 * It does NOT use the shared <LoginCard> (which also powers /login and
 * /staff/login), so this restyle stays scoped to the platform portal. Auth flow
 * is unchanged: useAuth().login() -> /auth/me -> SUPER_ADMIN gate ->
 * router.push("/admin"), which the middleware forwards to the console.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inter, Outfit, Fraunces } from "next/font/google";
import { useAuth } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const outfit = Outfit({ subsets: ["latin"], weight: ["600", "700", "800"] });
const serif = Fraunces({ subsets: ["latin"], style: "italic" });

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4";

const NAV_LINKS = [
  { label: "Platform", href: "/welcome" },
  { label: "Agents", href: "/agents" },
  { label: "Status", href: "/system-status" },
  { label: "Pricing", href: "/pricing" },
];

const VALUE_PROPS = [
  "Cross-tenant oversight in one console",
  "Live AI spend, budgets & kill-switches",
  "Tamper-evident operator audit trail",
];

/* Real TalentFlow mark, theme-adaptive: dark (full-color) logo on light
   surfaces, white logo on dark surfaces — swapped by the app's .dark class. */
function Logo() {
  return (
    <span className="block">
      {/* eslint-disable @next/next/no-img-element */}
      <img src="/assets/logo-light.png" alt="TalentFlow ATS" className="sa-logo-onlight block h-[30px] w-auto sm:h-[34px]" />
      <img src="/assets/logo-dark.png" alt="TalentFlow ATS" className="sa-logo-ondark hidden h-[30px] w-auto sm:h-[34px]" />
      {/* eslint-enable @next/next/no-img-element */}
    </span>
  );
}

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid work email."); return; }
    if (!password) { setError("Password is required."); return; }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const token = window.sessionStorage.getItem("ats-access-token");
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!meRes.ok) throw new Error("Could not verify your account after sign-in.");
      const me = await meRes.json();
      const role = me.data?.role ?? me.role;
      if (role !== "SUPER_ADMIN") {
        setError(
          <>
            This portal is for platform operators. Your account is <strong>{role}</strong>. Use the{" "}
            <Link href="/login" className="underline font-semibold">tenant</Link> or{" "}
            <Link href="/staff/login" className="underline font-semibold">staff</Link> sign-in instead.
          </>
        );
        try { window.sessionStorage.removeItem("ats-access-token"); } catch {}
        document.cookie = "ats-token=; Max-Age=0; path=/";
        setLoading(false);
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Check your credentials.");
      setLoading(false);
    }
  }

  const ink = "text-[color:var(--sa-ink)]";
  const ink2 = "text-[color:var(--sa-ink-2)]";
  const ink3 = "text-[color:var(--sa-ink-3)]";

  return (
    <div className={`${inter.className} sa-root relative min-h-screen w-full overflow-hidden ${ink} selection:bg-[#9fff00] selection:text-black`} style={{ background: "var(--sa-bg)" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .sa-root {
              --sa-bg:#EDEEF5; --sa-ink:#111; --sa-ink-2:#4a4a54; --sa-ink-3:#5a5a64; --sa-tile:#111;
              --sa-btn:#111; --sa-btn-ink:#fff;
              --sa-glass: linear-gradient(135deg, rgba(255,255,255,.76), rgba(255,255,255,.58));
              --sa-glass-brd: rgba(255,255,255,.7);
              --sa-soft: rgba(255,255,255,.4); --sa-soft-brd: rgba(255,255,255,.68);
              --sa-field: rgba(255,255,255,.62); --sa-field-brd: rgba(255,255,255,.85);
              --sa-sheen: linear-gradient(180deg, rgba(255,255,255,.6), rgba(255,255,255,0) 70%);
              --sa-glass-sh: 0 34px 80px -28px rgba(18,18,44,.55);
            }
            html.dark .sa-root {
              --sa-bg:#0a0b12; --sa-ink:#f1f3fa; --sa-ink-2:#aab0be; --sa-ink-3:#8b92a3; --sa-tile:rgba(255,255,255,.12);
              --sa-btn:#9fff00; --sa-btn-ink:#0a0b12;
              --sa-glass: linear-gradient(135deg, rgba(36,39,54,.72), rgba(18,20,30,.6));
              --sa-glass-brd: rgba(255,255,255,.14);
              --sa-soft: rgba(255,255,255,.07); --sa-soft-brd: rgba(255,255,255,.14);
              --sa-field: rgba(255,255,255,.08); --sa-field-brd: rgba(255,255,255,.16);
              --sa-sheen: linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,0) 70%);
              --sa-glass-sh: 0 34px 80px -28px rgba(0,0,0,.7);
            }
            html.dark .sa-logo-onlight { display: none; }
            html.dark .sa-logo-ondark { display: block; }

            @keyframes saRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
            @keyframes saFade { from { opacity: 0; } to { opacity: 1; } }
            .sa-rise { opacity: 0; animation: saRise .8s cubic-bezier(.22,1,.36,1) forwards; }
            .sa-fade { opacity: 0; animation: saFade 1.2s ease forwards; }
            .sa-glass {
              background: var(--sa-glass);
              -webkit-backdrop-filter: blur(30px) saturate(180%); backdrop-filter: blur(30px) saturate(180%);
              border: 1px solid var(--sa-glass-brd);
              box-shadow: var(--sa-glass-sh), inset 0 1px 1px rgba(255,255,255,.5);
            }
            .sa-sheen { background: var(--sa-sheen); }
            .sa-glass-soft {
              background: var(--sa-soft);
              -webkit-backdrop-filter: blur(16px) saturate(160%); backdrop-filter: blur(16px) saturate(160%);
              border: 1px solid var(--sa-soft-brd);
              box-shadow: 0 10px 26px -14px rgba(18,18,44,.4), inset 0 1px 1px rgba(255,255,255,.45);
            }
            .sa-field {
              background: var(--sa-field); border: 1px solid var(--sa-field-brd); color: var(--sa-ink);
              transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
            }
            .sa-field::placeholder { color: var(--sa-ink-3); opacity: .8; }
            .sa-field:focus { outline: none; border-color: rgba(159,255,0,.7); box-shadow: 0 0 0 3px rgba(159,255,0,.4); }
            .sa-cta { transition: transform .15s ease, box-shadow .2s ease, background .2s ease; }
            .sa-cta:hover { transform: translateY(-1px); }
            .sa-link { transition: color .15s ease; }
            .sa-drawer { overflow: hidden; transition: max-height .35s cubic-bezier(.22,1,.36,1), opacity .3s ease; }
          `,
        }}
      />

      {/* Ambient video, pushed right, scrimmed left for readable copy */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="h-full w-full object-cover opacity-95 sa-fade dark:opacity-60" style={{ objectPosition: "78% center" }} src={VIDEO_URL} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, var(--sa-bg), color-mix(in srgb, var(--sa-bg) 80%, transparent) 55%, transparent)" }} />
        <div className="absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(180deg, var(--sa-bg), transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-28" style={{ background: "linear-gradient(0deg, var(--sa-bg), transparent)" }} />
      </div>

      {/* ===== Navbar ===== */}
      <nav className="fixed top-0 left-0 z-50 w-full py-5 backdrop-blur-[3px] md:py-6" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--sa-bg) 85%, transparent), transparent)" }}>
        <div className="mx-auto grid max-w-7xl grid-cols-12 items-center px-6 md:px-10">
          <Link href="/welcome" className="col-span-6 md:col-span-3"><Logo /></Link>
          <div className="col-span-6 hidden items-center justify-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (<Link key={l.label} href={l.href} className={`sa-link text-[13.5px] font-medium ${ink3} hover:opacity-80`}>{l.label}</Link>))}
          </div>
          <div className="col-span-6 flex items-center justify-end gap-3 md:col-span-3">
            <Link href="/login" className={`sa-link hidden text-[13.5px] font-medium ${ink3} hover:opacity-80 sm:inline`}>Tenant Sign-in</Link>
            <Link href="/get-started" className="sa-cta hidden items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-semibold sm:inline-flex" style={{ background: "var(--sa-btn)", color: "var(--sa-btn-ink)" }}>
              Get Started <span aria-hidden>&rarr;</span>
            </Link>
            <button type="button" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)} className="sa-glass-soft flex h-9 w-9 items-center justify-center rounded-full md:hidden">
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 block h-[2px] w-4 transition-all ${menuOpen ? "top-1.5 rotate-45" : "top-0"}`} style={{ background: "var(--sa-ink)" }} />
                <span className={`absolute left-0 top-1.5 block h-[2px] w-4 transition-all ${menuOpen ? "opacity-0" : "opacity-100"}`} style={{ background: "var(--sa-ink)" }} />
                <span className={`absolute left-0 block h-[2px] w-4 transition-all ${menuOpen ? "top-1.5 -rotate-45" : "top-3"}`} style={{ background: "var(--sa-ink)" }} />
              </span>
            </button>
          </div>
        </div>
        <div className={`sa-drawer mx-auto max-w-7xl px-6 md:hidden ${menuOpen ? "mt-3 max-h-72 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="sa-glass-soft flex flex-col gap-1 rounded-2xl p-3">
            {NAV_LINKS.map((l) => (<Link key={l.label} href={l.href} className={`rounded-lg px-3 py-2 text-sm font-medium ${ink2}`}>{l.label}</Link>))}
            <Link href="/login" className={`rounded-lg px-3 py-2 text-sm font-medium ${ink2}`}>Tenant Sign-in</Link>
            <Link href="/get-started" className="mt-1 rounded-lg px-3 py-2 text-center text-sm font-semibold" style={{ background: "var(--sa-btn)", color: "var(--sa-btn-ink)" }}>Get Started &rarr;</Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero: copy left, sign-in right ===== */}
      <section className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pt-28 pb-12 md:px-10">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* LEFT — value copy */}
          <div className="lg:col-span-7">
            <div className={`sa-rise sa-glass-soft mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] ${ink}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#9fff00] shadow-[0_0_10px_2px_rgba(159,255,0,.75)]" />
              Platform Operator Portal
            </div>

            <h1 className={`${outfit.className} sa-rise max-w-[16ch] text-[2.4rem] font-extrabold leading-[0.95] tracking-[-0.045em] sm:text-[3.2rem] md:text-[3.9rem] lg:text-[4.3rem]`} style={{ color: "var(--sa-ink)", animationDelay: ".04s" }}>
              The control plane for{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className={`${serif.className} italic`} style={{ fontWeight: 600, fontSize: "1.05em" }}>AI-powered hiring</span>
                <span aria-hidden className="absolute -bottom-2 left-1 right-1 h-[5px] rounded-full bg-gradient-to-r from-[#9fff00] via-[#9fff00]/70 to-transparent" />
              </span>
              <span>.</span>
            </h1>

            <p className="sa-rise mt-7 max-w-md text-[15.5px] leading-relaxed sm:text-base" style={{ color: "var(--sa-ink-2)", animationDelay: ".12s" }}>
              Operate every tenant, agent, and dollar from <span className="font-semibold" style={{ color: "var(--sa-ink)" }}>one console</span>.
            </p>

            <ul className="sa-rise mt-7 flex flex-col gap-3" style={{ animationDelay: ".2s" }}>
              {VALUE_PROPS.map((v) => (
                <li key={v} className="flex items-center gap-2.5 text-[14px] font-medium" style={{ color: "var(--sa-ink-2)" }}>
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "var(--sa-tile)" }}>
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#9fff00" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
                  </span>
                  {v}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — sign-in card */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <form onSubmit={handleSubmit} className="sa-rise sa-glass relative w-full max-w-[420px] overflow-hidden rounded-[26px] p-6 sm:p-7" style={{ animationDelay: ".18s" }}>
              <div className="sa-sheen pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-[26px]" aria-hidden />
              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--sa-tile)" }}>
                    <span className="h-2.5 w-2.5 rounded-full bg-[#9fff00] shadow-[0_0_8px_1px_rgba(159,255,0,.7)]" />
                  </span>
                  <div>
                    <div className={`${outfit.className} text-[17px] font-bold leading-tight`} style={{ color: "var(--sa-ink)" }}>Platform Admin Sign-In</div>
                    <div className="text-[12.5px] font-medium" style={{ color: "var(--sa-ink-3)" }}>TalentFlow ATS, the platform provider portal</div>
                  </div>
                </div>

                {error && (<div className="mb-4 rounded-lg border border-red-300/60 bg-red-500/10 px-3 py-2 text-[13px] text-red-500">{error}</div>)}

                <label className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--sa-ink-2)" }}>Work email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" className="sa-field mb-4 w-full rounded-lg px-3.5 py-2.5 text-[14px]" />

                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[12.5px] font-semibold" style={{ color: "var(--sa-ink-2)" }}>Password</label>
                  <Link href="/forgot-password" className="sa-link text-[12px] font-medium" style={{ color: "var(--sa-ink-3)" }}>Forgot password?</Link>
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" autoComplete="current-password" className="sa-field mb-5 w-full rounded-lg px-3.5 py-2.5 text-[14px]" />

                <button type="submit" disabled={loading} className="sa-cta flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-semibold disabled:opacity-60" style={{ background: "var(--sa-btn)", color: "var(--sa-btn-ink)" }}>
                  {loading ? "Signing in…" : (
                    <>
                      Sign in to Platform Admin
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9fff00] text-black" aria-hidden>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </span>
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[12px]" style={{ color: "var(--sa-ink-3)" }}>
                  Not a platform admin?{" "}
                  <Link href="/login" className="sa-link font-semibold" style={{ color: "var(--sa-ink-2)" }}>Tenant sign-in</Link>{" · "}
                  <Link href="/staff/login" className="sa-link font-semibold" style={{ color: "var(--sa-ink-2)" }}>Staff sign-in</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
