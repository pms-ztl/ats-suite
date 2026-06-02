"use client";
// app/(dashboard)/onboarding/page.tsx - EXACT Claude Design "Onboarding Config"
// prototype, translated from claude-design/Onboarding Config.html into TSX and
// wired to the real app. The hero + three configuration cards (background
// checks, document requests, first-day tasks) keep the prototype's copy and
// glass styling. Toggles are interactive (local useState); the workspace name
// and recruiter first name are prefilled from useCurrentUser(). On save we make
// a best-effort POST to an onboarding-config endpoint and fall back gracefully.
import { useMemo, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// liquid-glass surface, ported from the prototype's .liquid-glass rule.
const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.01)",
  backgroundBlendMode: "luminosity",
  WebkitBackdropFilter: "blur(8px)",
  backdropFilter: "blur(8px)",
  border: "none",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,.1)",
  position: "relative",
  overflow: "hidden",
};

const DISPLAY = "var(--font-mono)"; // serif display surrogate in the app shell

// Each config card is a group of toggle items, mirroring the prototype's
// .cc .item rows (some start "off"). State drives the chk/tog visuals.
type Item = { id: string; label: string };
type Group = { id: string; icon: React.ReactNode; title: string; copy: string; items: Item[]; defaultsOff: string[] };

const SHIELD = (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" /><path d="M9 12l2 2 4-4" />
  </svg>
);
const DOC = (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5M8 13h8M8 17h5" />
  </svg>
);
const TASKS = (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const CHECK = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const GROUPS: Group[] = [
  {
    id: "checks",
    icon: SHIELD,
    title: "Background checks",
    copy: "Choose the verifications to run before day one. Initiated automatically when an offer is accepted.",
    items: [
      { id: "identity", label: "Identity & right to work" },
      { id: "employment", label: "Employment history" },
      { id: "criminal", label: "Criminal record (where lawful)" },
    ],
    defaultsOff: ["criminal"],
  },
  {
    id: "docs",
    icon: DOC,
    title: "Document requests",
    copy: "Collect signed paperwork and IDs securely, with reminders until everything's complete.",
    items: [
      { id: "offer", label: "Signed offer letter" },
      { id: "tax", label: "Tax & banking forms" },
      { id: "emergency", label: "Emergency contacts" },
    ],
    defaultsOff: ["emergency"],
  },
  {
    id: "firstday",
    icon: TASKS,
    title: "First-day tasks",
    copy: "A warm, guided checklist so new hires arrive ready, and feel they belong from minute one.",
    items: [
      { id: "accounts", label: "Set up accounts & access" },
      { id: "buddy", label: "Meet your buddy" },
      { id: "lunch", label: "Team welcome lunch" },
    ],
    defaultsOff: ["lunch"],
  },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export default function OnboardingPage() {
  const { user } = useCurrentUser();
  const workspace = user?.tenant?.name || "your workspace";
  const first = (user?.name || "there").split(" ")[0];

  // Build the initial on/off map from each group's defaults.
  const initial = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const g of GROUPS) for (const it of g.items) m[it.id] = !g.defaultsOff.includes(it.id);
    return m;
  }, []);
  const [on, setOn] = useState<Record<string, boolean>>(initial);
  const [save, setSave] = useState<SaveState>("idle");

  const cfgRef = useRef<HTMLDivElement | null>(null);

  function toggle(id: string) {
    setOn((s) => ({ ...s, [id]: !s[id] }));
    if (save !== "idle") setSave("idle");
  }

  function scrollToConfig() {
    cfgRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSave() {
    setSave("saving");
    // Collect the enabled keys per group into a plausible payload.
    const payload = {
      tenant: user?.tenant?.slug,
      backgroundChecks: GROUPS[0].items.filter((it) => on[it.id]).map((it) => it.id),
      documents: GROUPS[1].items.filter((it) => on[it.id]).map((it) => it.id),
      firstDayTasks: GROUPS[2].items.filter((it) => on[it.id]).map((it) => it.id),
    };
    try {
      await raw("/onboarding/config", { method: "POST", body: JSON.stringify(payload) });
      setSave("saved");
    } catch {
      // Endpoint may not exist yet; do not fabricate a success. Surface a
      // best-effort "saved locally" affordance so the wizard stays usable.
      setSave("error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      {/* hero */}
      <header className="flex flex-col items-center px-[22px] pb-[clamp(28px,5vw,56px)] pt-[clamp(8px,3vw,32px)] text-center">
        <span
          className="mb-6 inline-flex items-center gap-2 rounded-full px-[15px] py-[7px] text-[12.5px]"
          style={{ ...GLASS, color: "var(--c-ink-3)", borderRadius: "999px" }}
        >
          <span
            className="inline-block h-[7px] w-[7px] rounded-full"
            style={{ background: "var(--c-brand)", boxShadow: "0 0 10px var(--c-brand)" }}
            aria-hidden="true"
          />
          Onboarding configuration
        </span>
        <h1
          className="m-0 max-w-[13ch] text-[clamp(2.2rem,6vw,4.2rem)] font-normal leading-[.98]"
          style={{ fontFamily: DISPLAY, letterSpacing: "-1.5px" }}
        >
          Where great hires <em className="not-italic" style={{ color: "var(--c-ink-3)" }}>find their footing.</em>
        </h1>
        <p className="mx-auto mt-[22px] max-w-[38rem] text-[clamp(14px,1.6vw,17px)] leading-[1.65] text-ink-3">
          Set up the first chapter of every new hire's journey at {workspace}, the background checks, the documents you need, and the tasks that make day one feel like belonging.
        </p>
        <button
          type="button"
          onClick={scrollToConfig}
          className="mt-[34px] rounded-full px-[44px] py-[15px] text-[15px] transition-transform hover:scale-[1.03]"
          style={{ ...GLASS, borderRadius: "999px" }}
        >
          Configure onboarding
        </button>
      </header>

      {/* config cards */}
      <section ref={cfgRef} className="mx-auto max-w-[1080px] pb-[28px] pt-[10px]">
        <div className="grid grid-cols-1 gap-[14px] md:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.id} className="rounded-[22px] p-6 text-left" style={{ ...GLASS, borderRadius: "22px" }}>
              <span
                className="mb-[15px] grid h-[46px] w-[46px] place-items-center rounded-[13px]"
                style={{ background: "rgba(255,255,255,.06)", color: "var(--c-brand)" }}
              >
                {g.icon}
              </span>
              <h3 className="m-0 mb-[6px] text-[22px] font-normal" style={{ fontFamily: DISPLAY, letterSpacing: "-0.01em" }}>
                {g.title}
              </h3>
              <p className="m-0 mb-4 text-[13.5px] leading-[1.55] text-ink-3">{g.copy}</p>
              {g.items.map((it, idx) => {
                const isOn = on[it.id];
                return (
                  <button
                    type="button"
                    key={it.id}
                    onClick={() => toggle(it.id)}
                    aria-pressed={isOn}
                    className="flex w-full cursor-pointer items-center gap-[10px] py-2 text-left text-[13px]"
                    style={{ borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,.1)", background: "transparent" }}
                  >
                    <span
                      className="grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded-[6px]"
                      style={
                        isOn
                          ? { background: "rgba(128,213,170,.16)", color: "var(--c-brand)" }
                          : { background: "rgba(255,255,255,.06)", color: "var(--c-ink-3)" }
                      }
                    >
                      {isOn ? CHECK : null}
                    </span>
                    <span className="flex-1">{it.label}</span>
                    <span
                      className="relative h-[20px] w-[34px] flex-shrink-0 rounded-full"
                      style={{ background: isOn ? "var(--c-brand)" : "rgba(255,255,255,.14)" }}
                    >
                      <i
                        className="absolute top-[2.5px] h-[15px] w-[15px] rounded-full"
                        style={{
                          left: isOn ? "16px" : "2.5px",
                          background: isOn ? "var(--c-surface)" : "rgba(255,255,255,.5)",
                          transition: "left .18s var(--ease-out, ease)",
                        }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* save row, best-effort persist with graceful fallback */}
        <div className="mt-[26px] flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={save === "saving"}
            className="rounded-full px-[44px] py-[14px] text-[15px] transition-transform hover:scale-[1.03] disabled:opacity-60"
            style={{ ...GLASS, borderRadius: "999px" }}
          >
            {save === "saving" ? "Saving..." : "Save & continue"}
          </button>
          {save === "saved" && (
            <p className="text-[12.5px]" style={{ color: "var(--c-ok)" }}>
              Onboarding for {first} is configured. It runs automatically once an offer is accepted.
            </p>
          )}
          {save === "error" && (
            <p className="text-[12.5px] text-ink-3">
              We could not reach onboarding setup just now. Your selections are kept on this page, try Save again shortly.
            </p>
          )}
        </div>

        <div className="px-[22px] pb-[24px] pt-[20px] text-center text-[12px] text-ink-3" style={{ opacity: 0.85 }}>
          ATS by TalentFlow · Onboarding runs automatically once an offer is accepted, you stay in control of every step.
        </div>
      </section>
    </div>
  );
}
