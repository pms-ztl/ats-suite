"use client";
// app/(dashboard)/settings/chrome-extension/page.tsx - EXACT Claude Design
// "Aurora" settings, the Chrome extension right-panel (claude-design/"Settings
// Extras.html" -> chrome()). The settings layout already renders the left nav
// rail + a <section> wrapper, so this file is ONLY the right-panel content: the
// install hero (gradient mark / version / "Add to Chrome" store link), what the
// LinkedIn-sourcing extension does, a connected status + feature list, the
// 3-step setup, and the workspace config key. PanelHead / Card are reproduced
// locally as the prototype defines them (matching the sibling settings pages);
// Btn / Pill come from the kit, Icon from the shim. Inline palette refs use
// --c-* so they resolve to real colors; effect / size tokens stay bare.
//
// Mostly static product chrome: the install button is a real Chrome Web Store
// link (kept as-is from the prototype's intent), Copy writes the config key to
// the clipboard, and the lone feature toggle is controlled local state.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

/* Chrome Web Store listing for the sourcing extension (placeholder id kept
   as-is so the install CTA is a real, openable link). */
const STORE_URL = "https://chrome.google.com/webstore/detail/ats-for-chrome/cdcatschromeext0000000000";
const CONFIG_KEY = "cdc_ext_northwind_8f3a2k9d7c4b21";

/* ---- local helpers, verbatim from the prototype (chrome() uses PanelHead + Card) ---- */
function PanelHead({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
        {desc && <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)", maxWidth: 560 }}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, pad = 0 }: { children: React.ReactNode; pad?: number }) {
  return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad, marginBottom: 16 }}>{children}</div>;
}

function CardHead({ title, right }: { title: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-md)", display: "flex", alignItems: "center", gap: 9, justifyContent: "space-between" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>{title}</span>
      {right}
    </div>
  );
}

const codeBox: CSS = { fontFamily: "var(--font-mono)", fontSize: 12.5, background: "var(--c-surface-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r)", padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 };

/* the lone setup row: numbered chip + title + detail (no control) */
function SetupRow({ n, title, detail, top }: { n: string; title: string; detail: string; top: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: top ? "1px solid var(--c-line)" : "none" }}>
      <span className="mono" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--c-brand-tint)", color: "var(--c-brand-ink)", fontWeight: 700 }}>{n}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{detail}</div>
      </div>
    </div>
  );
}

/* feature row: icon tile + title + detail + optional toggle / status */
function FeatureRow({ icon, title, detail, right, top }: { icon: string; title: string; detail: string; right?: React.ReactNode; top: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: top ? "1px solid var(--c-line)" : "none" }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name={icon} size={16} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{detail}</div>
      </div>
      {right}
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background var(--t)" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t)" }} />
    </button>
  );
}

/* download glyph (IC.dl in the prototype is not in the shared icon shim) */
function DownloadGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v10M8 11l4 4 4-4M5 19h14" />
    </svg>
  );
}

/* what the extension captures, on the sites it supports */
const FEATURES: { icon: string; title: string; detail: string }[] = [
  { icon: "users", title: "One-click add from LinkedIn", detail: "Capture name, title, company, and public profile URL." },
  { icon: "fileText", title: "Resume + contact parsing", detail: "Pull attached resumes and visible contact details into a candidate." },
  { icon: "scan", title: "Duplicate detection", detail: "Flags profiles already in your pipeline before you add them." },
  { icon: "radar", title: "Sourcing across the web", detail: "Works on LinkedIn, GitHub, AngelList, and most job boards." },
];

/* ----------------------------- panel ----------------------------- */
function ChromeExtensionPanel() {
  const [autoScreen, setAutoScreen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyKey() {
    try { navigator.clipboard?.writeText(CONFIG_KEY); } catch {}
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <PanelHead
        title="Chrome extension"
        desc="Add candidates to ATS in one click from LinkedIn, GitHub, or any job site."
      />

      {/* install hero */}
      <Card pad={18}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon name="terminal" size={30} />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>ATS for Chrome</span>
              <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">Connected</Pill>
            </div>
            <div style={{ fontSize: 13, color: "var(--c-ink-2)", marginTop: 3 }}>
              <span className="mono">v2.4</span> · works on LinkedIn, GitHub, AngelList, and job boards.
            </div>
          </div>
          <a href={STORE_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <Btn variant="primary" style={{ pointerEvents: "none" }}><DownloadGlyph /> Add to Chrome</Btn>
          </a>
        </div>
      </Card>

      {/* what it does */}
      <Card>
        <CardHead title={<><Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} /> What it does</>} />
        <div style={{ padding: 18 }}>
          {FEATURES.map((f, i) => (
            <FeatureRow
              key={f.title}
              icon={f.icon}
              title={f.title}
              detail={f.detail}
              top={i > 0}
              right={f.title === "One-click add from LinkedIn" ? <Pill tone="var(--c-brand-ink)" bg="var(--c-brand-tint)">Primary</Pill> : undefined}
            />
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid var(--c-line)" }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai)" }}><Icon name="cpu" size={16} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Auto-run the screener on add</div>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Kick off candidate screening the moment a profile is sourced.</div>
            </div>
            <Toggle on={autoScreen} onClick={() => setAutoScreen((v) => !v)} />
          </div>
        </div>
      </Card>

      {/* setup */}
      <Card>
        <CardHead title="Setup" />
        <div style={{ padding: 18 }}>
          <SetupRow n="1" title="Install the extension" detail="Add it from the Chrome Web Store using the button above." top={false} />
          <SetupRow n="2" title="Connect your workspace" detail="Paste the config key below into the extension popup." top />
          <SetupRow n="3" title="Start sourcing" detail="Click the CDC icon on any profile to add a candidate." top />

          <div style={{ marginTop: 14 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 6 }}>Workspace config key</label>
            <div style={codeBox}>
              <span>{CONFIG_KEY}</span>
              <Btn variant="ghost" size="sm" icon={copied ? "check" : "copy"} onClick={copyKey}>{copied ? "Copied" : "Copy"}</Btn>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <Btn variant="soft" size="sm">Test connection</Btn>
          </div>
        </div>
      </Card>
    </>
  );
}

export default function ChromeExtensionSettingsPage() {
  return (
    <div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }}>
      <ChromeExtensionPanel />
    </div>
  );
}
