"use client";
// app/(dashboard)/settings/page.tsx
// VERBATIM port of claude-design/"Settings Extras.html" (the Settings &
// integrations area). This is the MAIN /settings landing page, which the
// prototype's router defaults to the Cloud sync view (route() falls back to
// "#cloud-sync"), so this file renders the left settings sub-nav + the Cloud
// sync content scene EXACTLY as the prototype's default view.
//
// Because this route lives inside the (dashboard) shell (app/(dashboard)/
// layout.tsx already renders the sidebar + topbar + theme toggle inside
// <main className="p-6">), the prototype's own outer .app/.top topbar shell,
// the full-page .aurora background, the breadcrumb, and the theme-toggle button
// are dropped. We port the SETTINGS area: the .snav left settings sub-nav (its
// links point at the real /settings/* routes that exist in the app) and the
// .body > .wrap > #view content (the Cloud sync scene).
//
// METHOD (Aurora verbatim): the prototype's entire <style> block is copied into
// the CSS const, every selector scoped under .setx (bare body/*/h1/a/h2/h3/p and
// the :root token blocks are prefixed), @keyframes rise is renamed setx-rise and
// its animation: ref updated, and full-page resets (overflow:hidden, height:100%
// that would fight the dashboard's own scroll) are dropped. The content markup is
// copied element-for-element from the JS-generated cloudSync() view (class ->
// className, inline style -> camelCased style objects with the same values, the
// I() icon helper becomes inline SVGs). The toggles (bi-directional sync) and the
// inline JS behavior become React useState.
import { useState } from "react";

/* The settings sub-nav. Each prototype nav label maps to the closest existing
   /settings/* route in the app. Cloud sync is the active item on this page,
   matching the prototype's default route. */
const NAV: { id: string; href: string; label: string; icon: React.ReactNode }[] = [
  { id: "integrations", href: "/settings/integrations", label: "Marketplace", icon: <path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5" /> },
  { id: "cloud-sync", href: "/settings/cloud-sync", label: "Cloud sync", icon: <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16M3 20v-4h4" /> },
  { id: "inbound-email", href: "/settings/inbound-email", label: "Inbound email", icon: <path d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /> },
  { id: "sms", href: "/settings/sms", label: "SMS", icon: <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /> },
  { id: "chrome-extension", href: "/settings/chrome-extension", label: "Chrome extension", icon: <path d="M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM8 9l3 2.5L8 14M13 15h4" /> },
];

// The Cloud sync view's field-mapping rows (verbatim from the prototype).
const FIELD_MAP: [string, string][] = [
  ["workday.worker_id", "Candidate ID"],
  ["workday.legal_name", "Full name"],
  ["workday.email_primary", "Email"],
  ["workday.position_id", "Requisition"],
  ["workday.hire_date", "Start date"],
];

const CSS = `
:root{--font-sans:"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;--font-mono:"Geist Mono", ui-monospace, monospace;--ease-out:cubic-bezier(.22, 1, .36, 1);--ease-spring:cubic-bezier(.34, 1.4, .5, 1);--r-sm:8px;--r:11px;--r-lg:14px;--r-xl:18px;--r-2xl:24px;--r-pill:999px;}
.setx{color-scheme:light;--bg:oklch(0.984 0.006 165);--bg-deep:oklch(0.972 0.008 165);--surface:oklch(0.997 0.003 165);--surface-2:oklch(0.978 0.006 165);--surface-3:oklch(0.962 0.008 165);--ink:oklch(0.245 0.013 175);--ink-2:oklch(0.47 0.013 175);--ink-3:oklch(0.605 0.012 175);--line:oklch(0.905 0.008 175);--line-2:oklch(0.86 0.01 175);--line-strong:oklch(0.80 0.012 175);--brand:oklch(0.585 0.122 162);--brand-2:oklch(0.515 0.118 162);--brand-ink:oklch(0.40 0.10 162);--brand-tint:oklch(0.955 0.028 162);--brand-tint-2:oklch(0.925 0.045 162);--on-brand:oklch(0.99 0.01 162);--ai:oklch(0.555 0.185 292);--ai-ink:oklch(0.44 0.16 292);--ai-tint:oklch(0.955 0.03 292);--ok:oklch(0.60 0.13 152);--ok-tint:oklch(0.95 0.04 152);--warn:oklch(0.69 0.135 73);--warn-tint:oklch(0.955 0.05 80);--danger:oklch(0.565 0.185 25);--danger-tint:oklch(0.955 0.035 25);--info:oklch(0.585 0.13 245);--info-tint:oklch(0.95 0.04 245);--glass:oklch(0.99 0.004 165/0.78);--glass-edge:oklch(0.80 0.012 175/0.5);--glass-blur:18px;--e1:0 1px 2px oklch(0.4 0.03 165/.05);--e2:0 6px 16px -6px oklch(0.35 0.04 165/.12), 0 2px 6px -3px oklch(0.35 0.04 165/.08);--e3:0 22px 48px -16px oklch(0.30 0.05 165/.22);--aurora-op:.55;}
[data-theme="dark"] .setx{color-scheme:dark;--bg:oklch(0.168 0.012 178);--bg-deep:oklch(0.13 0.012 178);--surface:oklch(0.206 0.014 178);--surface-2:oklch(0.238 0.015 178);--surface-3:oklch(0.272 0.016 178);--ink:oklch(0.955 0.005 175);--ink-2:oklch(0.74 0.012 175);--ink-3:oklch(0.595 0.014 175);--line:oklch(0.305 0.014 178);--line-2:oklch(0.36 0.016 178);--line-strong:oklch(0.44 0.018 178);--brand:oklch(0.755 0.13 162);--brand-2:oklch(0.82 0.13 162);--brand-ink:oklch(0.86 0.10 162);--brand-tint:oklch(0.30 0.05 162);--brand-tint-2:oklch(0.36 0.07 162);--on-brand:oklch(0.17 0.04 162);--ai:oklch(0.715 0.155 292);--ai-ink:oklch(0.82 0.12 292);--ai-tint:oklch(0.31 0.07 292);--ok:oklch(0.74 0.14 152);--ok-tint:oklch(0.31 0.06 152);--warn:oklch(0.80 0.135 80);--warn-tint:oklch(0.33 0.06 80);--danger:oklch(0.685 0.16 25);--danger-tint:oklch(0.33 0.07 25);--info:oklch(0.71 0.12 245);--info-tint:oklch(0.31 0.06 245);--glass:oklch(0.225 0.014 178/0.7);--glass-edge:oklch(0.55 0.02 178/0.3);--glass-blur:20px;--e1:0 1px 2px oklch(0 0 0/.35);--e2:0 8px 22px -8px oklch(0 0 0/.55);--e3:0 28px 56px -18px oklch(0 0 0/.68);--aurora-op:.65;}
.setx *{box-sizing:border-box;}
.setx{font-family:var(--font-sans);font-size:14px;line-height:1.5;color:var(--ink);-webkit-font-smoothing:antialiased;font-feature-settings:"ss01" 1;}
.setx .mono{font-family:var(--font-mono);font-variant-numeric:tabular-nums;letter-spacing:-0.01em;}.setx a{color:inherit;text-decoration:none;}.setx h1, .setx h2, .setx h3, .setx p{margin:0;}
.setx ::-webkit-scrollbar{width:10px;}.setx ::-webkit-scrollbar-thumb{background:var(--line-2);border-radius:99px;border:3px solid var(--bg);}
.setx .aurora{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;opacity:var(--aurora-op);}.setx .aurora i{position:absolute;border-radius:50%;filter:blur(80px);display:block;}
.setx .aurora .b1{width:40vw;height:40vw;left:-14vw;top:-18vw;background:radial-gradient(circle, var(--brand) 0%, transparent 68%);opacity:.12;}.setx .aurora .b2{width:36vw;height:36vw;right:-12vw;bottom:-14vw;background:radial-gradient(circle, var(--ai) 0%, transparent 68%);opacity:.09;}
.setx .app{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;}
.setx .top{height:58px;flex-shrink:0;display:flex;align-items:center;gap:14px;padding:0 22px;border-bottom:1px solid var(--line);background:var(--glass);backdrop-filter:blur(var(--glass-blur)) saturate(160%);-webkit-backdrop-filter:blur(var(--glass-blur)) saturate(160%);}
.setx .brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:16px;letter-spacing:-0.02em;}
.setx .crumb{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink-3);}.setx .crumb b{color:var(--ink);font-weight:700;}
.setx .tbtn{width:36px;height:36px;border-radius:var(--r);border:1px solid var(--line);background:var(--surface);color:var(--ink-2);display:grid;place-items:center;cursor:pointer;}
.setx .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:9px 16px;border-radius:var(--r);font-weight:600;font-size:13.5px;font-family:var(--font-sans);cursor:pointer;border:1px solid transparent;transition:all .18s var(--ease-out);}
.setx .btn-primary{background:var(--brand);color:var(--on-brand);box-shadow:var(--e1);}.setx .btn-soft{background:var(--surface-2);color:var(--ink);border-color:var(--line-2);}.setx .btn-ghost{background:transparent;color:var(--ink-2);}.setx .btn-sm{padding:6px 12px;font-size:12.5px;}
.setx .shell2{flex:1;display:grid;grid-template-columns:232px 1fr;min-height:0;}
.setx .snav{border-right:1px solid var(--line);overflow-y:auto;padding:20px 12px;background:color-mix(in oklab, var(--surface) 50%, transparent);}
.setx .snav h1{font-size:17px;font-weight:800;letter-spacing:-0.02em;margin:0 0 14px 8px;}
.setx .snav .grp{font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);padding:0 8px 6px;margin-top:12px;}
.setx .snav a{width:100%;display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:var(--r);color:var(--ink-2);font-weight:500;font-size:13.5px;margin-bottom:1px;}
.setx .snav a:hover{background:var(--surface-2);}.setx .snav a.on{background:var(--brand-tint);color:var(--brand-ink);font-weight:700;}
.setx .snav a.on svg{color:var(--brand);}.setx .snav a svg{color:var(--ink-3);}
.setx .body{overflow-y:auto;padding:30px 36px 60px;}.setx .wrap{max-width:760px;}
.setx .scene{animation:setx-rise .4s var(--ease-out) both;}@keyframes setx-rise{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
.setx .phead{margin-bottom:20px;}.setx .phead h2{font-size:21px;font-weight:800;letter-spacing:-0.025em;}.setx .phead p{font-size:13.5px;color:var(--ink-2);margin-top:6px;max-width:60ch;}
.setx .chip{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:var(--r-pill);font-size:11px;font-weight:700;}
.setx .chip-ok{background:var(--ok-tint);color:var(--ok);}.setx .chip-warn{background:var(--warn-tint);color:var(--warn);}.setx .chip-info{background:var(--info-tint);color:var(--info);}.setx .chip-brand{background:var(--brand-tint);color:var(--brand-ink);}
.setx .card{border-radius:var(--r-xl);border:1px solid var(--line);background:var(--surface);box-shadow:var(--e1);overflow:hidden;margin-bottom:16px;}
.setx .card-h{padding:14px 18px;border-bottom:1px solid var(--line);font-weight:700;font-size:14px;display:flex;align-items:center;gap:9px;justify-content:space-between;}
.setx .card-b{padding:18px;}
.setx .field{margin-bottom:15px;}.setx .field label{display:block;font-size:12.5px;font-weight:600;color:var(--ink-2);margin-bottom:6px;}
.setx .field input, .setx .field select{width:100%;padding:10px 12px;border-radius:var(--r);border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font-size:14px;font-family:var(--font-sans);outline:none;}
.setx .field input:focus, .setx .field select:focus{border-color:var(--brand);box-shadow:0 0 0 3px var(--brand-tint-2);}.setx .field .hint{font-size:11.5px;color:var(--ink-3);margin-top:6px;}
.setx .trow{display:flex;align-items:center;gap:14px;padding:14px 0;border-top:1px solid var(--line);}.setx .trow:first-child{border-top:none;}.setx .trow .ti{width:32px;height:32px;border-radius:9px;background:var(--surface-2);color:var(--ink-2);display:grid;place-items:center;flex-shrink:0;}
.setx .trow .tx{flex:1;min-width:0;}.setx .trow .tt{font-size:13.5px;font-weight:600;}.setx .trow .td{font-size:12px;color:var(--ink-3);margin-top:1px;}
.setx .toggle{width:38px;height:22px;border-radius:99px;border:none;background:var(--line-strong);position:relative;cursor:pointer;flex-shrink:0;transition:background .25s;}.setx .toggle.on{background:var(--brand);}
.setx .toggle i{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:99px;background:white;box-shadow:var(--e1);transition:left .25s var(--ease-spring);}.setx .toggle.on i{left:19px;}
.setx .code{font-family:var(--font-mono);font-size:12.5px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r);padding:9px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;}
/* map rows */
.setx .maprow{display:grid;grid-template-columns:1fr 24px 1fr;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line);}.setx .maprow:first-child{border-top:none;}
.setx .maprow .src{font-family:var(--font-mono);font-size:12px;color:var(--ink);}
/* marketplace */
.setx .mk-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:14px;}@media(max-width:820px){.setx .mk-grid{grid-template-columns:repeat(2, 1fr);}.setx .wrap.wide{max-width:100%;}}@media(max-width:560px){.setx .mk-grid{grid-template-columns:1fr;}}
.setx .mk{border-radius:var(--r-lg);border:1px solid var(--line);background:var(--surface);box-shadow:var(--e1);padding:16px;transition:transform .2s, box-shadow .2s, border-color .2s;}
.setx .mk:hover{transform:translateY(-3px);box-shadow:var(--e3);border-color:var(--line-strong);}
.setx .mk .top2{display:flex;gap:11px;align-items:center;margin-bottom:11px;}.setx .mk .lg{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;font-weight:800;font-size:14px;}
.setx .mk .nm{font-size:14px;font-weight:700;}.setx .mk .ct{font-size:11px;color:var(--ink-3);}
.setx .mk p{font-size:12px;color:var(--ink-2);line-height:1.45;min-height:51px;}
.setx .mk .ft{display:flex;justify-content:space-between;align-items:center;margin-top:12px;}
.setx .cats{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:18px;}
.setx .catpill{padding:6px 13px;border-radius:var(--r-pill);border:1px solid var(--line-2);background:var(--surface);font-size:12.5px;font-weight:600;color:var(--ink-2);cursor:pointer;}.setx .catpill.on{background:var(--brand-tint);border-color:transparent;color:var(--brand-ink);}
.setx .search{display:flex;align-items:center;gap:8px;padding:0 12px;height:38px;border-radius:var(--r);border:1px solid var(--line-2);background:var(--surface);margin-bottom:14px;}
.setx .search input{flex:1;border:none;outline:none;background:transparent;font-size:13.5px;color:var(--ink);font-family:var(--font-sans);}
@media(prefers-reduced-motion:reduce){.setx .scene{animation:none;}}

/* responsive overflow guard (added globally) */
.setx *, .setx *::before, .setx *::after{min-width:0;}
.setx img, .setx svg, .setx video, .setx canvas{max-width:100%;}
`;

export default function SettingsPage() {
  // The Cloud sync scene's bi-directional sync toggle (default on, matching the
  // prototype's toggleHTML(true)). The inline JS toggled a class; here it is
  // controlled local React state.
  const [biDirectional, setBiDirectional] = useState(true);

  // active settings sub-nav item, fixed to Cloud sync on this default page.
  const active = "cloud-sync";

  return (
    <div className="setx mx-auto w-full max-w-[1200px]">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* settings area: left sub-nav + the Cloud sync content scene. The outer
          .app/.top topbar shell, full-page .aurora, and theme toggle are dropped,
          the dashboard layout supplies them. */}
      <div className="shell2">
        <aside className="snav">
          <h1>Settings</h1>
          <div className="grp">Connections</div>
          {NAV.map((n) => (
            <a key={n.id} href={n.href} className={n.id === active ? "on" : undefined}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {n.icon}
              </svg>
              {n.label}
            </a>
          ))}
        </aside>

        <div className="body">
          <div className="wrap">
            {/* Cloud sync scene (the prototype's default #cloud-sync view) */}
            <div className="scene">
              <div className="phead">
                <h2>Cloud sync</h2>
                <p>Keep candidate and requisition data in sync with your connected HRIS and ATS, bi-directionally.</p>
              </div>

              <div className="card">
                <div className="card-h">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 4v4h-4M21 12a9 9 0 0 1-15 6.7L3 16M3 20v-4h4" /></svg> Sync status
                  </span>
                  <span className="chip chip-ok"><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--ok)" }} /> Active</span>
                </div>
                <div className="card-b">
                  <div className="trow">
                    <span className="ti"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 9h4a1 1 0 0 1 1 1v11M3 21h18" /></svg></span>
                    <div className="tx"><div className="tt">Workday HRIS</div><div className="td">Last synced 4 minutes ago · 1, 284 records</div></div>
                    <button className="btn btn-soft btn-sm">Sync now</button>
                  </div>
                  <div className="trow">
                    <div className="tx"><div className="tt">Bi-directional sync</div><div className="td">Push hires back to Workday automatically</div></div>
                    <button className={"toggle" + (biDirectional ? " on" : "")} onClick={() => setBiDirectional((v) => !v)}><i /></button>
                  </div>
                  <div className="field" style={{ marginTop: 14 }}>
                    <label>Sync frequency</label>
                    <select>
                      <option>Every 15 minutes</option>
                      <option>Hourly</option>
                      <option>Daily</option>
                      <option>Manual only</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-h">
                  <span>Field mapping</span>
                  <button className="btn btn-ghost btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg> Add</button>
                </div>
                <div className="card-b">
                  {FIELD_MAP.map(([src, dest]) => (
                    <div className="maprow" key={src}>
                      <span className="src">{src}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{dest}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button className="btn btn-soft">Disable sync</button>
                <button className="btn btn-primary"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> Save changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
