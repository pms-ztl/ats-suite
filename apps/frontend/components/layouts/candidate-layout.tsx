"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, HelpCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const candidateNav = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/status", label: "My Applications", icon: FileText },
  { href: "/transparency", label: "Help", icon: HelpCircle },
];

// Phase 33c, public-branding shape (subset of /api/public/branding/:slug)
interface PublicBranding {
  name: string;
  slug: string;
  logoUrl: string | null;
  brandPrimaryColor: string | null;
  brandTagline: string | null;
  careerPortalHeroImageUrl: string | null;
}

/** Hex → "h s% l%" tuple for the Tailwind --primary CSS variable. */
function hexToHslTuple(hex: string | null | undefined): string | null {
  if (!hex || !/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(hex)) return null;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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

export function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Phase 33c, when on /c/<slug>/... (tenant-scoped career portal), pull
  // the tenant's public branding and whitelabel the layout. On the generic
  // /jobs route (no slug) we keep the platform default.
  const slug = useMemo(() => {
    const m = pathname?.match(/^\/c\/([^/]+)/);
    return m?.[1] ?? null;
  }, [pathname]);

  const [branding, setBranding] = useState<PublicBranding | null>(null);
  useEffect(() => {
    if (!slug) { setBranding(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/public/branding/${slug}`);
        if (!res.ok) return;
        const body = await res.json();
        if (!cancelled) setBranding(body.data ?? body);
      } catch { /* fall back to platform default */ }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // Inject the tenant's primary color into the local CSS scope only.
  const brandStyle = useMemo(() => {
    const hsl = hexToHslTuple(branding?.brandPrimaryColor);
    return hsl ? ({ "--primary": hsl } as React.CSSProperties) : undefined;
  }, [branding?.brandPrimaryColor]);

  const tenantName = branding?.name ?? "CDC ATS";

  // Full-bleed routes ship their OWN complete chrome (exact Claude Design ports,
  // e.g. the job board renders its own nav + footer). Render them bare so the
  // portal shell does not double-wrap (two navs/footers, width clamp). Matches
  // the global board (/jobs) and the tenant-scoped board (/c/{slug}/jobs).
  // /profile is the exact Candidate Profile design, it ships its own full-page
  // chrome (cinematic hero + nav), so render it bare like the job boards.
  //
  // WF6-F4 — the ENTIRE per-tenant portal subtree (/c/{slug}/*) now gets its
  // chrome from the nested c/[slug]/layout.tsx (BrandedShell, tenant white-label),
  // so render all of it bare here to avoid double-wrapping with this generic
  // glass shell. Untouched non-tenant routes (/status, /appeal, ...) are
  // byte-identical to before — they still get this shell.
  const isTenantPortal = /^\/c\/[^/]+(\/|$)/.test(pathname ?? "");
  // WF7-G12 - the assessment RUNNER (/assessment/take/<token>) is a focused,
  // timed exam surface that ships its own full-screen chrome (timer header,
  // question-nav grid, proctor capture). It must NOT be wrapped in the portal
  // nav/footer, which would offer the candidate escape links mid-attempt.
  const isAssessmentTake = /^\/assessment\/take(\/|$)/.test(pathname ?? "");
  const fullBleed =
    pathname === "/jobs" || isTenantPortal || pathname === "/profile" || isAssessmentTake;
  if (fullBleed) return <>{children}</>;

  // Glassmorphism: chrome surfaces composite over the global aurora backdrop
  // applied in globals.css (body::before). All shades use semantic tokens so
  // both light and dark mode look right.
  // Phase 33c, brandStyle (when present) recolors --primary inside this
  // tree only, so the tenant's color flows through bg-primary / text-primary
  // utility classes used across the candidate portal.
  return (
    <div className="min-h-screen text-foreground flex flex-col" style={brandStyle}>
      {/* Top Nav, glass */}
      <header className="sticky top-0 z-30 border-b border-border/40 glass-surface">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
          <Link href={slug ? `/c/${slug}/jobs` : "/jobs"} className="flex items-center gap-2.5">
            {branding?.logoUrl ? (
              <Image
                src={branding.logoUrl}
                alt={`${tenantName} logo`}
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover"
                unoptimized
              />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-primary glow-primary flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">Career Portal</span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {tenantName}
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {candidateNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/jobs" && pathname?.startsWith("/jobs"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 glass-surface mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{tenantName} Career Portal</span>
          <div className="flex items-center gap-4">
            <Link href="/transparency" className="hover:text-foreground transition-colors">
              AI Transparency
            </Link>
            <Link href="/appeal" className="hover:text-foreground transition-colors">
              Appeal a Decision
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
