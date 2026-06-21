"use client";
// app/(dashboard)/settings/branding/page.tsx - Aurora "Branding" right-panel.
//
// WF6-F4 — this page used to PUT a NONEXISTENT route (/tenant/branding then
// /settings/branding) and silently no-op while still flashing "Saved". It now
// PUTs the REAL gateway route GET/PUT /api/branding (proxied to tenant-service
// /internal/branding) and only shows "Saved" on a genuine HTTP 200; a failed
// save surfaces an honest inline error instead of a fake confirmation.
//
// The form covers the full brand payload the tenant row persists: company name,
// tagline, primary / secondary / accent color, default color mode (the chrome
// scheme new users get before they pick their own), and a real logo upload
// (multipart POST /api/branding/logo). The live "candidate portal" preview to
// the right reflects the controlled state so the tenant sees the result before
// saving. Prefilled from useTenantBranding(); every field is additive and
// graceful — an un-deployed backend just returns non-200 and we say so honestly.
import { useEffect, useRef, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon, Logo } from "@/components/aurora-icon";
import { useTenantBranding } from "@/hooks/use-tenant-branding";
import { validateContrast } from "@/lib/theme/brand-ramp";
import { UiCustomizationEditor } from "@/components/cd/ui-customization-editor";

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

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 6, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

const labelStyle: CSS = { fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 };
const inp: CSS = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

/* preset accent swatches, paired with a free-form color input below */
const SWATCHES: [string, string][] = [
  ["#16916a", "Emerald"],
  ["#1a8fff", "Blue"],
  ["#9b8cff", "Violet"],
  ["#f5a524", "Amber"],
];
const DEFAULT_COLOR = "#16916a";
const COLOR_MODES: [("system" | "light" | "dark"), string][] = [
  ["system", "Match device"],
  ["light", "Light"],
  ["dark", "Dark"],
];

/* A hex value is "usable" by the picker only if it's a #rrggbb literal. The token
   forms (var(--c-*)) the old preview used are NOT round-trippable to a real color
   the API can store, so swatches are now real hex literals. */
const isHex = (s: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}

/* Real branding PUT. Returns the HTTP ok flag + status so the caller can show a
   TRUTHFUL result: "Saved" only on 200, an error otherwise. No silent fallback
   to a nonexistent route, no fake "Saved". */
async function putBranding(body: unknown): Promise<{ ok: boolean; status: number }> {
  const t = authToken();
  try {
    const res = await fetch(`${API_BASE}/branding`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

/* Real multipart logo upload to POST /api/branding/logo. Returns the persisted
   logoUrl (a data: URL) on success so the form + preview update immediately. */
async function uploadLogo(file: File): Promise<{ ok: boolean; status: number; logoUrl: string | null }> {
  const t = authToken();
  const fd = new FormData();
  fd.append("logo", file);
  try {
    const res = await fetch(`${API_BASE}/branding/logo`, {
      method: "POST",
      credentials: "include",
      headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) }, // no Content-Type: the browser sets the multipart boundary
      body: fd,
    });
    let logoUrl: string | null = null;
    try {
      const j = await res.json();
      logoUrl = (j?.data?.logoUrl ?? j?.logoUrl) ?? null;
    } catch { /* non-JSON body */ }
    return { ok: res.ok, status: res.status, logoUrl };
  } catch {
    return { ok: false, status: 0, logoUrl: null };
  }
}

function BrandingPanel() {
  const { branding, refresh } = useTenantBranding();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [secondary, setSecondary] = useState("");
  const [accent, setAccent] = useState("");
  const [colorMode, setColorMode] = useState<"system" | "light" | "dark">("system");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prefill from the real tenant branding once it resolves.
  useEffect(() => {
    if (!branding) return;
    if (branding.name) setName(branding.name);
    if (branding.brandTagline) setTagline(branding.brandTagline);
    if (branding.brandPrimaryColor) setColor(branding.brandPrimaryColor);
    if (branding.brandSecondaryColor) setSecondary(branding.brandSecondaryColor);
    if (branding.brandAccentColor) setAccent(branding.brandAccentColor);
    if (branding.defaultColorMode) setColorMode(branding.defaultColorMode);
    if (branding.logoUrl) setLogoUrl(branding.logoUrl);
  }, [branding]);

  useEffect(() => () => { if (savedTimer.current) clearTimeout(savedTimer.current); }, []);

  function flashSaved() {
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2600);
  }

  async function onSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    // Send the full shape every time (the backend treats "" as null, so clearing
    // a field is explicit). Only send brandPrimaryColor when it's a real hex.
    const body: Record<string, unknown> = {
      // name lives on the Tenant row but is NOT part of the branding PUT schema,
      // so it isn't sent here (renaming the workspace is a separate flow); we keep
      // it editable for the live preview only.
      brandTagline: tagline || null,
      brandPrimaryColor: isHex(color) ? color : null,
      brandSecondaryColor: isHex(secondary) ? secondary : (secondary === "" ? null : undefined),
      brandAccentColor: isHex(accent) ? accent : (accent === "" ? null : undefined),
      defaultColorMode: colorMode,
    };
    // Drop undefined keys (invalid non-empty hex we don't want to clobber with).
    for (const k of Object.keys(body)) if (body[k] === undefined) delete body[k];

    const res = await putBranding(body);
    setSaving(false);
    if (res.ok) {
      flashSaved();
      refresh(); // bust the module cache so the chrome picks up the new brand
    } else {
      setError(
        res.status === 401 || res.status === 403
          ? "You need workspace-admin access to change branding."
          : res.status === 0
            ? "Could not reach the server. Check your connection and try again."
            : `We could not save your branding (error ${res.status}). Please try again.`,
      );
    }
  }

  async function onPickLogo(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const res = await uploadLogo(file);
    setUploading(false);
    if (res.ok && res.logoUrl) {
      setLogoUrl(res.logoUrl);
      flashSaved();
      refresh();
    } else {
      setError(
        res.status === 413
          ? "That logo is too large. Please use an image under 512KB."
          : res.status === 400
            ? "That file is not a supported image (PNG, JPEG, WEBP, GIF, or SVG)."
            : res.status === 401 || res.status === 403
              ? "You need workspace-admin access to change the logo."
              : "We could not upload that logo. Please try again.",
      );
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  // Honest accessibility hint: is white text legible on the chosen primary?
  const contrast = isHex(color) ? validateContrast("#ffffff", color) : null;

  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
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

      {error && (
        <div role="alert" style={{ display: "flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: "var(--fs-sm)", marginBottom: 16, border: "1px solid color-mix(in oklab, var(--c-danger) 22%, transparent)" }}>
          <Icon name="shield" size={15} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        {/* ---- editor ---- */}
        <Card pad={20}>
          <Field label="Company name"><input value={name} onChange={(e) => setName(e.target.value)} style={inp} /></Field>
          <Field label="Tagline"><input value={tagline} onChange={(e) => setTagline(e.target.value)} style={inp} placeholder="Hire with AI you can trust" /></Field>

          <Field label="Logo" hint="Uploads up to 512KB (PNG, JPEG, WEBP, GIF, SVG). Stored with your workspace and shown on the candidate portal.">
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ width: 44, height: 44, borderRadius: 11, background: isHex(color) ? color : DEFAULT_COLOR, display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
                {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Logo size={26} />}
              </span>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" onChange={(e) => onPickLogo(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
              <Btn variant="soft" icon="swatch" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? "Uploading" : logoUrl ? "Replace logo" : "Upload logo"}</Btn>
              {logoUrl && <Btn variant="ghost" onClick={() => setLogoUrl("")}>Clear</Btn>}
            </div>
          </Field>

          <Field
            label="Primary color"
            hint={contrast ? (
              contrast.passesAA
                ? `White text on this color passes WCAG AA (${contrast.ratio}:1).`
                : `White text on this color may be hard to read (${contrast.ratio}:1, below 4.5:1). Consider a darker shade.`
            ) : undefined}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {SWATCHES.map(([c, n]) => (
                <button key={n} onClick={() => setColor(c)} title={n}
                  style={{ width: 32, height: 32, borderRadius: 9, background: c, border: color.toLowerCase() === c.toLowerCase() ? "2px solid var(--c-ink)" : "2px solid transparent", cursor: "pointer" }} />
              ))}
              <label style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 9px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", cursor: "pointer" }}>
                <input type="color" value={isHex(color) ? color : DEFAULT_COLOR} onChange={(e) => setColor(e.target.value)}
                  style={{ width: 22, height: 22, border: "none", background: "transparent", padding: 0, cursor: "pointer" }} />
                <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{color}</span>
              </label>
            </div>
          </Field>

          <Field label="Secondary color" hint="Optional. Used for accents alongside your primary brand color.">
            <label style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 9px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", cursor: "pointer" }}>
              <input type="color" value={isHex(secondary) ? secondary : "#64748b"} onChange={(e) => setSecondary(e.target.value)}
                style={{ width: 22, height: 22, border: "none", background: "transparent", padding: 0, cursor: "pointer" }} />
              <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{secondary || "Not set"}</span>
              {secondary && <button onClick={(e) => { e.preventDefault(); setSecondary(""); }} style={{ border: "none", background: "transparent", color: "var(--c-ink-3)", cursor: "pointer", fontSize: 12 }}>clear</button>}
            </label>
          </Field>

          <Field label="Accent color" hint="Optional. A third brand color for highlights and call-to-action details.">
            <label style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 9px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", cursor: "pointer" }}>
              <input type="color" value={isHex(accent) ? accent : "#9b8cff"} onChange={(e) => setAccent(e.target.value)}
                style={{ width: 22, height: 22, border: "none", background: "transparent", padding: 0, cursor: "pointer" }} />
              <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{accent || "Not set"}</span>
              {accent && <button onClick={(e) => { e.preventDefault(); setAccent(""); }} style={{ border: "none", background: "transparent", color: "var(--c-ink-3)", cursor: "pointer", fontSize: 12 }}>clear</button>}
            </label>
          </Field>

          <Field label="Default color mode" hint="The dashboard theme new teammates see before they choose their own.">
            <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)" }}>
              {COLOR_MODES.map(([m, lbl]) => (
                <button key={m} onClick={() => setColorMode(m)}
                  style={{ padding: "7px 14px", borderRadius: "var(--r-sm, 8px)", border: "none", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-sans)", background: colorMode === m ? "var(--c-surface)" : "transparent", color: colorMode === m ? "var(--c-ink)" : "var(--c-ink-2)", boxShadow: colorMode === m ? "var(--e1)" : "none" }}>
                  {lbl}
                </button>
              ))}
            </div>
          </Field>
        </Card>

        {/* ---- live preview, candidate portal ---- */}
        <div>
          <div style={{ ...labelStyle, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="eye" size={13} /> Live preview · candidate portal
          </div>
          <Card pad={0}>
            <div style={{ padding: "20px 22px", background: "color-mix(in oklab, " + (isHex(color) ? color : DEFAULT_COLOR) + " 12%, var(--c-surface))", borderBottom: "1px solid var(--c-line)" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: isHex(color) ? color : DEFAULT_COLOR, display: "grid", placeItems: "center", overflow: "hidden" }}>
                  {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Logo size={18} />}
                </span>
                <b style={{ fontSize: 13 }}>{name || "Your workspace"}</b>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Senior Backend Engineer</h3>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 4 }}>Payments · Remote · ₹160k to ₹200k</div>
              {tagline && <Pill icon="sparkles" tone="var(--c-ink-2)" bg="var(--c-surface)" style={{ marginTop: 10 }}>{tagline}</Pill>}
            </div>
            <div style={{ padding: 18 }}>
              <button style={{ width: "100%", padding: "10px", borderRadius: "var(--r)", border: "none", background: isHex(color) ? color : DEFAULT_COLOR, color: "white", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Apply now</button>
            </div>
          </Card>
          <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 10, lineHeight: 1.5 }}>
            This preview mirrors the white-labeled public board at <span className="mono">/c/{branding?.slug ?? "your-workspace"}/jobs</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Page = two tabs over the SAME settings route:
 *   • "Branding"          — the brand payload form (PUT /api/branding), unchanged.
 *   • "UI customization"  — the UiConfig editor (PUT /api/me/ui-config), which
 *                           writes the tenant theme / nav / route / copy overrides.
 * The tab switch is additive: the Branding tab opens by default, so this route
 * renders exactly as before until an admin opens the new tab.
 * ------------------------------------------------------------------------- */
const TABS: [("branding" | "ui"), string, string][] = [
  ["branding", "Branding", "swatch"],
  ["ui", "UI customization", "sparkles"],
];

export default function BrandingSettingsPage() {
  const [tab, setTab] = useState<"branding" | "ui">("branding");
  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      <div role="tablist" aria-label="Branding settings sections" style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", marginBottom: 20 }}>
        {TABS.map(([id, label, icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 15px", borderRadius: "var(--r-sm, 8px)", border: "none", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-sans)", background: tab === id ? "var(--c-surface)" : "transparent", color: tab === id ? "var(--c-ink)" : "var(--c-ink-2)", boxShadow: tab === id ? "var(--e1)" : "none" }}>
            <Icon name={icon} size={15} />{label}
          </button>
        ))}
      </div>
      {tab === "branding" ? <BrandingPanel /> : <UiCustomizationEditor />}
    </div>
  );
}
