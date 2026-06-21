import type { Metadata } from "next";

// WF-B / B4 - the (ext) route-group layout.
//
// The (ext) group hosts developer-REGISTERED page surfaces (the customizable-UI
// program's routable pages), resolved by the [...slug] catch-all. Like (embed),
// the group adds NO URL segment and is DELIBERATELY chrome-less: it mounts no
// CdShell sidebar/topbar and no candidate-portal nav/footer. A registered page
// surface is a FULL-BLEED screen that owns its own chrome (matching the byte-exact
// CD full-bleed routes), and the catch-all's client host wraps it in a
// brand-themed .cd-scope so the Aurora tokens resolve - so this layout only needs
// to provide a transparent, full-height container.
//
// ADDITIVE + FAIL-SOFT: this group never overlaps another (its surfaces resolve
// only from the registry, and the baseline manifest is empty, so every (ext) slug
// 404s until a developer registers a page). It therefore changes no existing
// route group and no untouched tenant's render.
export const metadata: Metadata = {
  title: "CDC ATS",
  // Registered surfaces are internal app screens; do not index the catch-all.
  robots: { index: false, follow: false },
};

export default function ExtLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100vh", background: "transparent" }}>{children}</div>;
}
