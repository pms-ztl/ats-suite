"use client";

/**
 * Phase 20 — public, tenant-branded shell for the candidate-facing career
 * portal. Wraps any child route under /c/[slug]/* with the tenant's logo,
 * brand color, tagline, and an optional hero image + welcome message.
 *
 * Server-side rendering is intentionally avoided so the shell stays simple
 * (no need for cross-service SSR fetch). The few hundred ms latency before
 * the brand renders is acceptable for a careers page — and the layout is
 * stable so there's no CLS.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface PublicBranding {
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

interface Props {
  slug: string;
  children: React.ReactNode;
  /** Show the hero band at the top with welcome message + image. Defaults true. */
  hero?: boolean;
}

/**
 * Same hex → "h s% l%" converter as dashboard-layout.tsx — repeated here
 * rather than imported because this component lives in the public bundle
 * and we want zero coupling to the dashboard tree.
 */
function hexToHslTuple(hex: string | null | undefined): string | null {
  if (!hex || !/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(hex)) return null;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0, sat = 0;
  const light = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: hue = ((b - r) / d + 2); break;
      case b: hue = ((r - g) / d + 4); break;
    }
    hue *= 60;
  }
  return `${Math.round(hue)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%`;
}

export function BrandedShell({ slug, children, hero = true }: Props) {
  const [branding, setBranding] = useState<PublicBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/public/branding/${encodeURIComponent(slug)}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        setBranding(body.data ?? body);
      } catch (err) {
        console.error("Branding fetch failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 space-y-3">
        <h1 className="text-2xl font-bold">We couldn&apos;t find that workspace</h1>
        <p className="text-muted-foreground max-w-md">
          The careers page for <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{slug}</code> doesn&apos;t exist.
          Double-check the URL or contact the recruiting team.
        </p>
        <Link href="/" className="text-primary underline">
          Go home
        </Link>
      </div>
    );
  }

  const hsl = hexToHslTuple(branding?.brandPrimaryColor);
  const style = hsl ? ({ "--primary": hsl } as React.CSSProperties) : undefined;
  const heroBg = branding?.careerPortalHeroImageUrl
    ? `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.55)), url(${branding.careerPortalHeroImageUrl}) center/cover`
    : `linear-gradient(135deg, oklch(var(--primary)), oklch(var(--primary)) 70%)`;

  return (
    <div className="min-h-screen bg-background" style={style}>
      {/* Top nav — minimal, tenant-branded */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
          <Link href={`/c/${slug}/jobs`} className="flex items-center gap-2 min-w-0">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.name} className="h-7 max-w-[140px] object-contain" />
            ) : (
              <>
                <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">{branding?.name?.charAt(0) ?? "?"}</span>
                </div>
                <span className="font-semibold truncate">{branding?.name ?? "Careers"}</span>
              </>
            )}
            <span className="text-muted-foreground text-sm hidden sm:inline">/ Careers</span>
          </Link>
          <div className="flex items-center gap-3">
            {branding?.website && (
              <a
                href={branding.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{new URL(branding.website).hostname}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero band */}
      {hero && (
        <section
          className="text-white"
          style={{ background: heroBg }}
        >
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Join {branding?.name ?? "us"}
            </h1>
            <p className="mt-3 text-lg opacity-95 max-w-2xl">
              {branding?.careerPortalWelcomeMessage ||
                branding?.brandTagline ||
                "We're hiring people who care about the work."}
            </p>
          </div>
        </section>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 py-10 max-w-6xl">{children}</main>

      {/* About + footer */}
      {branding?.careerPortalAboutHtml && (
        <section className="border-t bg-muted/30 mt-12">
          <div
            className="container mx-auto px-4 py-12 max-w-3xl prose prose-sm dark:prose-invert"
            // Sanitization happens server-side at /api/branding PUT — we only
            // accept basic HTML (no scripts) so this is intentional and safe.
            dangerouslySetInnerHTML={{ __html: branding.careerPortalAboutHtml }}
          />
        </section>
      )}

      <footer className="border-t bg-background py-6 mt-auto">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} {branding?.name ?? "Workspace"}. Hiring powered by CDC ATS.
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/c/${slug}/jobs`} className="hover:text-foreground">All jobs</Link>
            {branding?.website && (
              <a href={branding.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                About {branding.name}
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
