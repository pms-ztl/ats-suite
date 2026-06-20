"use client";
// app/(embed)/embed/embed-shell.tsx
//
// WF9 / SLICE I1 — the shared chrome-less shell every embed page mounts. It:
//   1. validates the [token] with the gateway (POST /api/embed/validate). The
//      gateway verifies the SIGNED token server-side and returns the LOCKED
//      render context (module / resourceId / params) plus the tenant's
//      white-label branding (name + brand hex + logo). The client never trusts
//      anything outside that verified response.
//   2. on an invalid / expired token, renders an HONEST "this embed link is
//      invalid or expired" state (fail closed — no resource, no data).
//   3. applies the WF6 brand ramp from the tenant's brand hex, scoped to THIS
//      embed's .cd-scope (byte-identical mechanism to cd-shell.tsx), so the
//      widget is white-labelled to the tenant's color in light + dark.
//   4. exposes the validated context + a token-authed data fetcher to the page
//      via a render prop, so each page renders the real screen content.
//
// The brand-ramp injection is lifted VERBATIM from cd-shell.tsx (buildBrandStyle)
// so the embed and the logged-in app re-skin from the same single brand hex with
// identical token math.
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { brandRamp } from "@/lib/theme/brand-ramp";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** The verified, locked context the gateway returns for a valid embed token. */
export interface EmbedContext {
  module: string;
  resourceId: string;
  params: Record<string, unknown>;
  branding: { name?: string; brandPrimaryColor?: string | null; logoUrl?: string | null } | null;
}

// A valid 3- or 6-digit hex is the ONLY trigger for tenant theming — matches
// cd-shell.tsx exactly. Anything else leaves the .cd-scope emerald defaults.
function isHex(hex: string | null | undefined): hex is string {
  return !!hex && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(hex);
}

// The six brand-family token keys brandRamp() produces. Emitted in BOTH forms
// cd-tokens.css reads inside .cd-scope: the bare `--brand*` and the `--c-brand*`
// full-color companions. Lifted verbatim from cd-shell.tsx.
const BRAND_KEYS = [
  "--brand", "--brand-2", "--brand-ink", "--brand-tint", "--brand-tint-2", "--on-brand",
] as const;

function buildBrandStyle(hex: string, scopeId: string): string {
  const ramp = brandRamp(hex);
  const decls = (side: Record<string, string>): string =>
    BRAND_KEYS.map((k) => {
      const color = `oklch(${side[k]})`;
      const cKey = k.replace(/^--/, "--c-");
      return `${k}:${color};${cKey}:${color};`;
    }).join("");
  const sel = `.cd-scope[data-cd-brand="${scopeId}"]`;
  return `${sel}{${decls(ramp.light)}}\n.dark ${sel}{${decls(ramp.dark)}}`;
}

type ValidateState =
  | { phase: "loading" }
  | { phase: "invalid" }
  | { phase: "valid"; ctx: EmbedContext };

/**
 * Fetch the locked resource for this embed (GET /api/embed/data). The token is
 * the ONLY credential; the gateway resolves the tenant + resource from it. Fails
 * soft to null so the page renders its honest empty state on a transient blip.
 */
export async function fetchEmbedData<T = unknown>(token: string): Promise<T | null> {
  try {
    const r = await fetch(`${API_BASE}/embed/data`, {
      headers: { "x-embed-token": token },
    });
    if (!r.ok) return null;
    const body = await r.json().catch(() => null);
    return (body?.data ?? body ?? null) as T | null;
  } catch {
    return null;
  }
}

/** Honest, self-contained invalid/expired state (no chrome, cd-token themed). */
function InvalidState() {
  return (
    <div className="cd-scope" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "transparent" }}>
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          padding: "28px 26px",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--line)",
          background: "var(--surface)",
          boxShadow: "var(--e1)",
        }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: 14, margin: "0 auto 14px",
            display: "grid", placeItems: "center",
            background: "var(--surface-2)", color: "var(--ink-3)",
          }}
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" />
            <path d="M12 9v4M12 16h.01" />
          </svg>
        </div>
        <div style={{ fontSize: "var(--fs-lg)", fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ink)" }}>
          This embed link is invalid or expired
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.55 }}>
          The link used to load this widget could not be verified. It may have
          expired or been revoked. Please ask the team that shared it for a fresh
          embed link.
        </p>
      </div>
    </div>
  );
}

/** A minimal cd-token-themed loading state while the token validates. */
function LoadingState() {
  return (
    <div className="cd-scope" style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "transparent" }}>
      <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)" }}>Loading...</div>
    </div>
  );
}

/**
 * EmbedShell — validates the token, applies the tenant brand, and renders the
 * page via a render prop with the validated context + the raw token (for the
 * page's own data fetch). Fail closed: no valid token => InvalidState, never the
 * page content.
 */
export function EmbedShell({
  token,
  expectedModule,
  children,
}: {
  token: string;
  /** The module this page renders (e.g. "pipeline"). A token minted for a
   *  different module is treated as invalid for THIS page — a screening token
   *  cannot render the pipeline embed. */
  expectedModule: string;
  children: (args: { ctx: EmbedContext; token: string }) => React.ReactNode;
}) {
  const [state, setState] = useState<ValidateState>({ phase: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ phase: "invalid" });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/embed/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const body = await r.json().catch(() => null);
        const d = body?.data ?? body ?? null;
        if (cancelled) return;
        // Fail closed: only render when the gateway says valid AND the token's
        // module matches THIS page's surface.
        if (!d?.valid || d.module !== expectedModule) {
          setState({ phase: "invalid" });
          return;
        }
        setState({
          phase: "valid",
          ctx: {
            module: String(d.module),
            resourceId: String(d.resourceId ?? ""),
            params: (d.params && typeof d.params === "object") ? d.params : {},
            branding: d.branding ?? null,
          },
        });
      } catch {
        if (!cancelled) setState({ phase: "invalid" });
      }
    })();
    return () => { cancelled = true; };
  }, [token, expectedModule]);

  // Stable per-mount scope id for the brand override (only used when theming).
  const scopeId = useState(() => `e${Math.random().toString(36).slice(2, 9)}`)[0];
  const brandHex =
    state.phase === "valid" && isHex(state.ctx.branding?.brandPrimaryColor)
      ? state.ctx.branding!.brandPrimaryColor!
      : null;
  const brandCss = useMemo(
    () => (brandHex ? buildBrandStyle(brandHex, scopeId) : null),
    [brandHex, scopeId],
  );

  if (state.phase === "loading") return <LoadingState />;
  if (state.phase === "invalid") return <InvalidState />;

  return (
    <div
      className="cd-scope"
      data-cd-brand={brandCss ? scopeId : undefined}
      style={{ minHeight: "100vh", background: "transparent", overflow: "auto" }}
    >
      {brandCss ? <style dangerouslySetInnerHTML={{ __html: brandCss }} /> : null}
      {children({ ctx: state.ctx, token })}
    </div>
  );
}
