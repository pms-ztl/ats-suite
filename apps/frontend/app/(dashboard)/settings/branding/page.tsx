"use client";

/**
 * Settings → Branding
 *
 * Tenant-admin self-service for everything that defines how the workspace
 * looks to its own users + to candidates landing on the public career portal.
 *
 *   - Company name (mirrors Tenant.name; read-only here, edit via /settings)
 *   - Logo URL (preview shown live)
 *   - Brand colors (primary / secondary / accent — applied to dashboard + emails)
 *   - Tagline
 *   - Career portal: welcome message + about HTML + hero image URL
 *
 * Reads/writes via /api/branding (proxied to tenant-service).
 * Live preview pane shows what the email + sidebar will look like.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Palette, Image as ImageIcon, Eye, Loader2, RotateCcw, ExternalLink } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface Branding {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  brandPrimaryColor: string | null;
  brandSecondaryColor: string | null;
  brandAccentColor: string | null;
  brandTagline: string | null;
  careerPortalWelcomeMessage: string | null;
  careerPortalAboutHtml: string | null;
  careerPortalHeroImageUrl: string | null;
}

const DEFAULTS = {
  primaryColor: "#10b981",
  secondaryColor: "#3b82f6",
  accentColor: "#8b5cf6",
};

export default function BrandingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState<Branding | null>(null);

  // Form state
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [primaryColor, setPrimaryColor] = useState(DEFAULTS.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULTS.secondaryColor);
  const [accentColor, setAccentColor] = useState(DEFAULTS.accentColor);
  const [tagline, setTagline] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [aboutHtml, setAboutHtml] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/branding`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const b: Branding = body.data ?? body;
      setBranding(b);
      setLogoUrl(b.logoUrl ?? "");
      setWebsite(b.website ?? "");
      setPrimaryColor(b.brandPrimaryColor ?? DEFAULTS.primaryColor);
      setSecondaryColor(b.brandSecondaryColor ?? DEFAULTS.secondaryColor);
      setAccentColor(b.brandAccentColor ?? DEFAULTS.accentColor);
      setTagline(b.brandTagline ?? "");
      setWelcomeMessage(b.careerPortalWelcomeMessage ?? "");
      setAboutHtml(b.careerPortalAboutHtml ?? "");
      setHeroImageUrl(b.careerPortalHeroImageUrl ?? "");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't load branding. Is tenant-service running?");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        logoUrl: logoUrl || null,
        website: website || null,
        brandPrimaryColor: primaryColor || null,
        brandSecondaryColor: secondaryColor || null,
        brandAccentColor: accentColor || null,
        brandTagline: tagline || null,
        careerPortalWelcomeMessage: welcomeMessage || null,
        careerPortalAboutHtml: aboutHtml || null,
        careerPortalHeroImageUrl: heroImageUrl || null,
      };
      const res = await fetch(`${API_BASE}/branding`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success("Branding saved. Changes apply to new emails + career portal immediately.");
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function resetColors() {
    setPrimaryColor(DEFAULTS.primaryColor);
    setSecondaryColor(DEFAULTS.secondaryColor);
    setAccentColor(DEFAULTS.accentColor);
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading branding…
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
      </Link>

      <PageHeader
        title="Brand & Career Portal"
        description={`Customize how ${branding?.name ?? "your workspace"} appears to your team, in notification emails, and on the public career portal.`}
        actions={
          branding?.slug ? (
            <Button variant="outline" size="sm" asChild>
              <a href={`/c/${branding.slug}/jobs`} target="_blank" rel="noopener noreferrer">
                Open career portal <ExternalLink className="w-3 h-3 ml-1.5" />
              </a>
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left two cols: form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Identity
              </CardTitle>
              <CardDescription>Logo, tagline, and website link shown across the workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company name</Label>
                <Input value={branding?.name ?? ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Edit this in your <Link href="/settings" className="underline">workspace settings</Link>.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://your-cdn.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">PNG or SVG, max 180×40px renders best. Shown in the sidebar and at the top of every email.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline (max 160 chars)</Label>
                <Input
                  id="tagline"
                  maxLength={160}
                  placeholder="Hiring engineers who ship."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{tagline.length}/160</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Company website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://acme.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Colors card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Brand colors
              </CardTitle>
              <CardDescription>Hex values like #1A8FFF. Applied to buttons, links, and email accents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorRow id="primary" label="Primary" hint="Buttons, links, sidebar accent" value={primaryColor} onChange={setPrimaryColor} />
              <ColorRow id="secondary" label="Secondary" hint="Section headers, badges" value={secondaryColor} onChange={setSecondaryColor} />
              <ColorRow id="accent" label="Accent" hint="Charts, highlights" value={accentColor} onChange={setAccentColor} />
              <Button type="button" variant="outline" size="sm" onClick={resetColors}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset to platform defaults
              </Button>
            </CardContent>
          </Card>

          {/* Career portal card */}
          <Card>
            <CardHeader>
              <CardTitle>Public career portal</CardTitle>
              <CardDescription>
                What candidates see at{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/c/{branding?.slug ?? "your-slug"}/jobs</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroImageUrl">Hero image URL</Label>
                <Input
                  id="heroImageUrl"
                  type="url"
                  placeholder="https://your-cdn.com/careers-hero.jpg"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Wide image, 1920×600 recommended. Behind the welcome message.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome message (max 2000 chars)</Label>
                <Textarea
                  id="welcomeMessage"
                  rows={3}
                  maxLength={2000}
                  placeholder="Join us on our mission to ship faster."
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutHtml">About us (HTML, max 10000 chars)</Label>
                <Textarea
                  id="aboutHtml"
                  rows={6}
                  maxLength={10000}
                  placeholder="<p>We're building the future of <strong>...</strong></p>"
                  value={aboutHtml}
                  onChange={(e) => setAboutHtml(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">Basic HTML allowed (paragraphs, lists, bold, links). No scripts.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur p-4 -mx-4 border-t">
            <Button variant="outline" onClick={load} disabled={saving}>
              Discard changes
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save branding
            </Button>
          </div>
        </div>

        {/* Right col: live preview */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4" />
                Live preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EmailPreview
                companyName={branding?.name ?? "Acme"}
                logoUrl={logoUrl || null}
                primaryColor={primaryColor}
                tagline={tagline}
              />
              <SidebarPreview
                companyName={branding?.name ?? "Acme"}
                logoUrl={logoUrl || null}
                primaryColor={primaryColor}
              />
              <CareerPortalPreview
                companyName={branding?.name ?? "Acme"}
                logoUrl={logoUrl || null}
                primaryColor={primaryColor}
                tagline={tagline}
                welcomeMessage={welcomeMessage}
                heroImageUrl={heroImageUrl || null}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function ColorRow({ id, label, hint, value, onChange }: { id: string; label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-[100px,1fr,140px] gap-3 items-center">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value.toLowerCase())} placeholder="#10b981" />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded border border-input cursor-pointer bg-transparent"
        />
        <span className="text-xs text-muted-foreground truncate">{hint}</span>
      </div>
    </div>
  );
}

function EmailPreview({ companyName, logoUrl, primaryColor, tagline }: { companyName: string; logoUrl: string | null; primaryColor: string; tagline: string }) {
  return (
    <div className="border rounded-md overflow-hidden bg-white text-gray-900 text-xs">
      <div className="px-3 py-2 border-b" style={{ borderColor: primaryColor + "33" }}>
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="h-5 max-w-[120px] object-contain" />
        ) : (
          <strong style={{ color: primaryColor }}>{companyName}</strong>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="font-semibold text-gray-900">New interview feedback</p>
        <p className="text-gray-600 leading-relaxed">
          Sam Patel submitted feedback on Alex Morgan&apos;s round 2 interview for Senior Engineer:
          <strong> STRONG_HIRE</strong>.
        </p>
        <button
          type="button"
          className="rounded px-2.5 py-1 text-white text-xs font-medium pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        >
          View feedback →
        </button>
        <p className="text-gray-400 text-[10px] pt-2 border-t border-gray-100">
          {tagline || `You're receiving this because you're a member of the ${companyName} workspace on CDC ATS.`}
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground px-3 pb-2 italic">Email preview</p>
    </div>
  );
}

function SidebarPreview({ companyName, logoUrl, primaryColor }: { companyName: string; logoUrl: string | null; primaryColor: string }) {
  return (
    <div className="border rounded-md p-3 bg-slate-900 text-white text-xs">
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="h-5 max-w-[80px] object-contain" />
        ) : (
          <div className="w-5 h-5 rounded" style={{ backgroundColor: primaryColor }} />
        )}
        <span className="font-medium truncate">{companyName}</span>
      </div>
      <div className="pt-2 space-y-1">
        <div className="flex items-center gap-2 px-1.5 py-1 rounded" style={{ backgroundColor: primaryColor + "22", color: primaryColor }}>
          <div className="w-3 h-3 rounded-sm bg-current opacity-70" /> Dashboard
        </div>
        <div className="flex items-center gap-2 px-1.5 py-1 text-white/60">
          <div className="w-3 h-3 rounded-sm bg-current opacity-50" /> Candidates
        </div>
      </div>
      <p className="text-[10px] text-white/30 pt-2 italic">Sidebar preview</p>
    </div>
  );
}

function CareerPortalPreview({ companyName, logoUrl, primaryColor, tagline, welcomeMessage, heroImageUrl }: {
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  tagline: string;
  welcomeMessage: string;
  heroImageUrl: string | null;
}) {
  return (
    <div className="border rounded-md overflow-hidden bg-white text-gray-900 text-xs">
      <div className="px-3 py-2 border-b flex items-center gap-2" style={{ borderColor: primaryColor + "33" }}>
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="h-5 max-w-[80px] object-contain" />
        ) : (
          <strong style={{ color: primaryColor }}>{companyName}</strong>
        )}
        <span className="text-gray-400">/ Careers</span>
      </div>
      <div
        className="px-3 py-4 text-white"
        style={{
          background: heroImageUrl
            ? `linear-gradient(rgba(15,23,42,0.6), rgba(15,23,42,0.6)), url(${heroImageUrl}) center/cover`
            : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)`,
        }}
      >
        <p className="font-semibold">Open roles at {companyName}</p>
        <p className="text-[10px] opacity-90 mt-1">{welcomeMessage || tagline || "Join us on our mission."}</p>
      </div>
      <div className="p-3 space-y-2">
        <div className="p-2 border rounded">
          <p className="font-medium">Senior Software Engineer</p>
          <p className="text-[10px] text-muted-foreground">Remote · Full-time</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground px-3 pb-2 italic">Career portal preview</p>
    </div>
  );
}
