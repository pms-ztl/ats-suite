"use client";

/**
 * Tenant branding hook — fetches /api/branding once per session and caches
 * the result in module-local state with a 5-minute TTL.
 *
 * Used by:
 *   - dashboard layout (CSS variable injection for primary color)
 *   - sidebar (logo, company name)
 *   - any future component that wants brand-aware rendering
 *
 * Returns null while loading or when the user isn't authenticated (silent
 * fail — branding is non-essential).
 */
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

export interface TenantBranding {
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

// Module-local cache so all consumers share one fetch.
let cached: { branding: TenantBranding; fetchedAt: number } | null = null;
let inflight: Promise<TenantBranding | null> | null = null;
const TTL_MS = 5 * 60 * 1000;

async function fetchBranding(): Promise<TenantBranding | null> {
  const token = getToken();
  if (!token) return null;
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached.branding;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/branding`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const body = await res.json();
      const branding: TenantBranding = body.data ?? body;
      cached = { branding, fetchedAt: Date.now() };
      return branding;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function useTenantBranding(): { branding: TenantBranding | null; loading: boolean; refresh: () => void } {
  const [branding, setBranding] = useState<TenantBranding | null>(cached?.branding ?? null);
  const [loading, setLoading] = useState(cached === null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchBranding();
      if (active) {
        setBranding(result);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function refresh() {
    cached = null;
    void fetchBranding().then((r) => setBranding(r));
  }

  return { branding, loading, refresh };
}

/** Test seam — clear the module-local cache (used after PUT /branding). */
export function clearTenantBrandingCache() {
  cached = null;
}
