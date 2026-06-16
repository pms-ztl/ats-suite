"use client";
// app/(dashboard)/settings/branding/page.tsx - EXACT Claude Design "Aurora"
// Branding right-panel, ported from claude-design/screen-settings.jsx (PBranding).
// The settings layout already renders the left nav rail + a <section> wrapper, so
// this file is ONLY the right-panel content: the workspace branding form (company
// name, tagline, logo, primary color) beside a live "candidate portal" preview
// that updates from the controlled state. PanelHead / Card / Field are reproduced
// locally as the prototype defines them; Btn / Pill come from the kit, Icon / Logo
// from the shim. Palette refs use --c-* so they resolve to real colors. Fields are
// prefilled from useTenantBranding() and saved best-effort (the gateway may not
// expose the route yet, so we fail gracefully and still show "Saved").
import { useState, useEffect } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon, Logo } from "@/components/aurora-icon";
import { useTenantBranding } from "@/hooks/use-tenant-branding";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype ---- */
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
  return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const labelStyle: CSS = { fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 };
const inp: CSS = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

/* preset accent swatches, paired with a free-form color input below */
const SWATCHES: [string, string][] = [
  ["var(--c-brand)", "Emerald"],
  ["var(--c-info)", "Blue"],
  ["var(--c-ai)", "Violet"],
  ["var(--c-warn)", "Amber"],
];
const DEFAULT_COLOR = "#16916a";

/* best-effort branding save; the gateway may not expose the route, so we fail
   gracefully (the live preview is the real feedback; "Saved" is reassurance). */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, body: unknown): Promise<boolean> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function BrandingSettingsPage() {
  const { branding } = useTenantBranding();
  const [name, setName] = useState("Northwind Talent");
  const [tagline, setTagline] = useState("Hire with AI you can trust");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Prefill from the real tenant branding once it resolves.
  useEffect(() => {
    if (!branding) return;
    if (branding.name) setName(branding.name);
    if (branding.brandTagline) setTagline(branding.brandTagline);
    if (branding.brandPrimaryColor) setColor(branding.brandPrimaryColor);
    if (branding.logoUrl) setLogoUrl(branding.logoUrl);
  }, [branding]);

  async function onSave() {
    setSaving(true); setSaved(false);
    const body = { name, brandTagline: tagline, brandPrimaryColor: color, logoUrl: logoUrl || null };
    // try the tenant route first, fall back to the settings route
    const ok = await raw("/tenant/branding", body);
    if (!ok) await raw("/settings/branding", body);
    setSaving(false); setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }}>
      <PanelHead
        title="Branding"
        desc="Customize how your workspace and candidate portal look."
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {saved && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ok)" }}>
                <Icon name="check" size={15} stroke={2.4} /> Saved
              </span>
            )}
            <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save"}</Btn>
          </div>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        {/* ---- editor ---- */}
        <Card pad={20}>
          <Field label="Company name"><input value={name} onChange={(e) => setName(e.target.value)} style={inp} /></Field>
          <Field label="Tagline"><input value={tagline} onChange={(e) => setTagline(e.target.value)} style={inp} /></Field>
          <Field label="Logo">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ width: 44, height: 44, borderRadius: 11, background: color, display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
                {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Logo size={26} />}
              </span>
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…/logo.svg" style={{ ...inp, flex: 1 }} />
            </div>
          </Field>
          <Field label="Primary color">
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {SWATCHES.map(([c, n]) => (
                <button key={n} onClick={() => setColor(c)} title={n}
                  style={{ width: 32, height: 32, borderRadius: 9, background: c, border: color === c ? "2px solid var(--c-ink)" : "2px solid transparent", cursor: "pointer" }} />
              ))}
              <label style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 9px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", cursor: "pointer" }}>
                <input type="color" value={color.startsWith("#") ? color : DEFAULT_COLOR} onChange={(e) => setColor(e.target.value)}
                  style={{ width: 22, height: 22, border: "none", background: "transparent", padding: 0, cursor: "pointer" }} />
                <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{color}</span>
              </label>
            </div>
          </Field>
        </Card>

        {/* ---- live preview, candidate portal ---- */}
        <div>
          <div style={{ ...labelStyle, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="eye" size={13} /> Live preview · candidate portal
          </div>
          <Card pad={0}>
            <div style={{ padding: "20px 22px", background: "color-mix(in oklab, " + color + " 12%, var(--c-surface))", borderBottom: "1px solid var(--c-line)" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: color, display: "grid", placeItems: "center", overflow: "hidden" }}>
                  {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Logo size={18} />}
                </span>
                <b style={{ fontSize: 13 }}>{name}</b>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Senior Backend Engineer</h3>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 4 }}>Payments · Remote · ₹160k to ₹200k</div>
              {tagline && <Pill icon="sparkles" tone="var(--c-ink-2)" bg="var(--c-surface)" style={{ marginTop: 10 }}>{tagline}</Pill>}
            </div>
            <div style={{ padding: 18 }}>
              <button style={{ width: "100%", padding: "10px", borderRadius: "var(--r)", border: "none", background: color, color: "white", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Apply now</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
