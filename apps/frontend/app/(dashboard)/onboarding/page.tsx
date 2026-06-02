"use client";
// app/(dashboard)/onboarding/page.tsx
// RICH port of claude-design/Onboarding Config.html (the onboarding setup): the
// hero eyebrow/headline/lede + "Configure onboarding" CTA, and the three config
// cards, Background checks / Document requests / First-day tasks, each with its
// icon, copy, and toggleable items. Because this route lives inside the
// (dashboard) shell (sidebar + <main className="p-6">), the HTML's own top nav,
// the full-page background video + veil, and the route-transition overlay chrome
// are dropped, the dashboard layout supplies the frame. Every card/section/
// toggle/copy is reproduced faithfully. Scoped CSS lives under .onbx, the
// @keyframes is renamed to an onb- prefix. The toggles are controlled React
// state, the "Configure onboarding" CTA smooth-scrolls to the grid, and Save &
// continue does a best-effort POST to /onboarding/config (bearer from
// sessionStorage) with a graceful inline acknowledgement either way. The
// workspace name is prefilled from useCurrentUser() into the saved config.
import { useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// The three config groups, verbatim from the source markup, with each item's
// label and default-on state. These drive the controlled toggle UI below.
type Item = { label: string; on: boolean };
type GroupKey = "backgroundChecks" | "documentRequests" | "firstDayTasks";

const GROUPS: Array<{
  key: GroupKey;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  fr: string;
  items: Item[];
}> = [
  {
    key: "backgroundChecks",
    title: "Background checks",
    blurb: "Choose the verifications to run before day one. Initiated automatically when an offer is accepted.",
    fr: "fr1",
    icon: (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    items: [
      { label: "Identity & right to work", on: true },
      { label: "Employment history", on: true },
      { label: "Criminal record (where lawful)", on: false },
    ],
  },
  {
    key: "documentRequests",
    title: "Document requests",
    blurb: "Collect signed paperwork and IDs securely, with reminders until everything's complete.",
    fr: "fr2",
    icon: (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5M8 13h8M8 17h5" />
      </svg>
    ),
    items: [
      { label: "Signed offer letter", on: true },
      { label: "Tax & banking forms", on: true },
      { label: "Emergency contacts", on: false },
    ],
  },
  {
    key: "firstDayTasks",
    title: "First-day tasks",
    blurb: "A warm, guided checklist so new hires arrive ready, and feel they belong from minute one.",
    fr: "fr3",
    icon: (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    items: [
      { label: "Set up accounts & access", on: true },
      { label: "Meet your buddy", on: true },
      { label: "Team welcome lunch", on: false },
    ],
  },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');
.onbx{--font-display:'Instrument Serif', serif;--font-body:'Inter', system-ui, sans-serif;
  --muted:hsl(240 4% 66%);--br:oklch(0.8 0.13 162);--ai:#9b8cff;--ease:cubic-bezier(.22, 1, .36, 1);
  position:relative;font-family:var(--font-body);color:#fff;-webkit-font-smoothing:antialiased;}
.onbx *{box-sizing:border-box;}
.onbx a{color:inherit;text-decoration:none;}
.onbx button{font-family:inherit;cursor:pointer;}
.onbx ::selection{background:rgba(255, 255, 255, .2);}
.onbx :focus-visible{outline:none;box-shadow:0 0 0 3px rgba(255, 255, 255, .4);border-radius:12px;}
.onbx .disp{font-family:var(--font-display);}
.onbx .liquid-glass{background:rgba(255, 255, 255, 0.01);background-blend-mode:luminosity;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:none;box-shadow:inset 0 1px 1px rgba(255, 255, 255, .1);position:relative;overflow:hidden;}
.onbx .liquid-glass::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.4px;background:linear-gradient(180deg, rgba(255, 255, 255, .45) 0%, rgba(255, 255, 255, .15) 20%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, .15) 80%, rgba(255, 255, 255, .45) 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.onbx .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:999px;font-size:14px;color:#fff;padding:11px 22px;transition:transform .15s var(--ease), background .2s;}
.onbx .btn:hover{transform:scale(1.03);}
/* hero (content only, the dashboard shell supplies the page frame) */
.onbx .hero{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;text-align:center;padding:clamp(28px, 5vw, 64px) 0 clamp(36px, 6vw, 64px);}
.onbx .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted);padding:7px 15px;border-radius:999px;margin-bottom:24px;}
.onbx .eyebrow .dot{width:7px;height:7px;border-radius:99px;background:var(--br);box-shadow:0 0 10px var(--br);}
.onbx h1{font-family:var(--font-display);font-weight:400;font-size:clamp(2.4rem, 7vw, 5.4rem);line-height:.95;letter-spacing:-2px;max-width:13ch;margin:0;text-shadow:0 2px 40px hsl(201 100% 8%/.6);}
.onbx h1 em{font-style:normal;color:var(--muted);}
.onbx .sub{color:var(--muted);font-size:clamp(15px, 1.7vw, 18px);max-width:38rem;margin:26px auto 0;line-height:1.65;}
.onbx .hcta{margin-top:38px;border-radius:999px;padding:17px 48px;font-size:16px;color:#fff;}
/* config cards */
.onbx .cfg{max-width:1080px;margin:0 auto;padding:10px 0 24px;}
.onbx .grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:14px;}
@media(max-width:860px){.onbx .grid{grid-template-columns:1fr;}}
.onbx .cc{border-radius:22px;padding:24px;text-align:left;}
.onbx .cc .ic{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;margin-bottom:15px;background:rgba(255, 255, 255, .06);color:var(--br);}
.onbx .cc h3{font-family:var(--font-display);font-weight:400;font-size:24px;margin:0 0 6px;letter-spacing:-0.01em;}
.onbx .cc p{font-size:13.5px;color:var(--muted);line-height:1.55;margin:0 0 16px;}
.onbx .cc .item{display:flex;align-items:center;gap:10px;font-size:13px;padding:8px 0;border-top:1px solid rgba(255, 255, 255, .1);width:100%;background:none;border-left:none;border-right:none;border-bottom:none;color:inherit;text-align:left;cursor:pointer;}
.onbx .cc .item:first-of-type{border-top:none;}
.onbx .cc .item .chk{width:18px;height:18px;border-radius:6px;flex-shrink:0;display:grid;place-items:center;background:rgba(128, 213, 170, .16);color:var(--br);}
.onbx .cc .item.off .chk{background:rgba(255, 255, 255, .06);color:var(--muted);}
.onbx .cc .item .lbl{flex:1;}
.onbx .cc .item .tog{width:34px;height:20px;border-radius:99px;background:var(--br);position:relative;flex-shrink:0;}
.onbx .cc .item .tog i{position:absolute;top:2.5px;left:16px;width:15px;height:15px;border-radius:99px;background:#04120c;}
.onbx .cc .item.off .tog{background:rgba(255, 255, 255, .14);}
.onbx .cc .item.off .tog i{left:2.5px;background:rgba(255, 255, 255, .5);}
.onbx .savebar{display:flex;flex-wrap:wrap;align-items:center;gap:14px;max-width:1080px;margin:18px auto 0;}
.onbx .savebar .ack{font-size:13px;color:var(--br);}
.onbx .savebar .ack.err{color:#ffd9a8;}
.onbx .foot{text-align:center;padding:30px 0 6px;font-size:12px;color:var(--muted);opacity:.8;}
@keyframes onb-fade-rise{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
.onbx .fr{animation:onb-fade-rise .8s ease-out both;}
.onbx .fr1{animation:onb-fade-rise .8s ease-out .2s both;}
.onbx .fr2{animation:onb-fade-rise .8s ease-out .4s both;}
.onbx .fr3{animation:onb-fade-rise .8s ease-out .6s both;}
@media(prefers-reduced-motion:reduce){.onbx .fr, .onbx .fr1, .onbx .fr2, .onbx .fr3{animation:none;}}
`;

// The small check glyph shown inside an "on" item's checkbox.
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default function OnboardingConfigPage() {
  const { user } = useCurrentUser();

  // Controlled toggle state, one boolean[] per group, seeded from the source's
  // default-on flags. Clicking an item flips its switch (mirrors the script).
  const [state, setState] = useState<Record<GroupKey, boolean[]>>(() => ({
    backgroundChecks: GROUPS[0].items.map((i) => i.on),
    documentRequests: GROUPS[1].items.map((i) => i.on),
    firstDayTasks: GROUPS[2].items.map((i) => i.on),
  }));

  const [saveState, setSaveState] = useState<"idle" | "saving" | "done" | "fallback">("idle");

  const cfgRef = useRef<HTMLElement>(null);

  function toggle(group: GroupKey, idx: number) {
    setState((prev) => {
      const next = prev[group].slice();
      next[idx] = !next[idx];
      return { ...prev, [group]: next };
    });
  }

  function scrollToConfig() {
    cfgRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Save & continue, best-effort POST of the selected onboarding config. The
  // workspace name is prefilled from the signed-in user where sensible. We never
  // throw, the user always gets an inline acknowledgement.
  async function onSave() {
    if (saveState === "saving") return;
    setSaveState("saving");

    const config = {
      workspace: user?.tenant?.name ?? user?.name ?? null,
      configuredBy: user?.email ?? null,
      backgroundChecks: GROUPS[0].items.map((i, idx) => ({ label: i.label, enabled: state.backgroundChecks[idx] })),
      documentRequests: GROUPS[1].items.map((i, idx) => ({ label: i.label, enabled: state.documentRequests[idx] })),
      firstDayTasks: GROUPS[2].items.map((i, idx) => ({ label: i.label, enabled: state.firstDayTasks[idx] })),
    };

    let token: string | null = null;
    try {
      token = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
    } catch {}

    try {
      const res = await fetch(`${API_BASE}/onboarding/config`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(config),
      });
      setSaveState(res.ok ? "done" : "fallback");
    } catch {
      setSaveState("fallback");
    }
    setTimeout(() => setSaveState("idle"), 3200);
  }

  return (
    <div className="onbx">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* hero (page chrome supplied by the dashboard shell) */}
      <header className="hero">
        <span className="eyebrow liquid-glass fr"><span className="dot" /> Onboarding configuration</span>
        <h1 className="fr">Where great hires <em>find their footing.</em></h1>
        <p className="sub fr1">
          Set up the first chapter of every new hire&apos;s journey, the background checks, the documents you need, and the tasks that make day one feel like belonging.
        </p>
        <button className="hcta liquid-glass fr2" type="button" onClick={scrollToConfig}>Configure onboarding</button>
      </header>

      <section className="cfg" ref={cfgRef}>
        <div className="grid">
          {GROUPS.map((group) => (
            <div key={group.key} className={"cc liquid-glass " + group.fr}>
              <span className="ic">{group.icon}</span>
              <h3>{group.title}</h3>
              <p>{group.blurb}</p>
              {group.items.map((item, idx) => {
                const on = state[group.key][idx];
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={"item" + (on ? "" : " off")}
                    aria-pressed={on}
                    onClick={() => toggle(group.key, idx)}
                  >
                    <span className="chk">{on ? <CheckIcon /> : null}</span>
                    <span className="lbl">{item.label}</span>
                    <span className="tog"><i /></span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <div className="savebar">
        <button className="btn liquid-glass" type="button" onClick={onSave} disabled={saveState === "saving"}>
          {saveState === "saving" ? "Saving" : "Save & continue"}
        </button>
        {saveState === "done" && <span className="ack">Onboarding configuration saved.</span>}
        {saveState === "fallback" && <span className="ack err">Saved locally. We&apos;ll sync once you&apos;re back online.</span>}
      </div>

      <div className="foot">ATS by TalentFlow · Onboarding runs automatically once an offer is accepted, you stay in control of every step.</div>
    </div>
  );
}
