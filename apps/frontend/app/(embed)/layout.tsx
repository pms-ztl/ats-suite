import type { Metadata } from "next";

// WF9 / SLICE I1 — embeddable widget route group.
//
// The (embed) group is DELIBERATELY chrome-less: NO CdShell sidebar/topbar (the
// logged-in app chrome) and NO CandidateLayout nav/footer (the public portal
// chrome). An embed is a single widget framed into a customer's own page, so it
// must render ONLY the cd-token-themed content — the host site supplies the
// surrounding chrome.
//
// These pages are served by Next under /embed/* (the (embed) group does not add a
// URL segment), which nginx + the gateway serve with relaxed framing (WF2): the
// global X-Frame-Options is dropped and a per-tenant CSP frame-ancestors is set
// from the verified embed token's allowlist, failing closed to 'none' when there
// is no valid token. The page itself ALSO fails closed — it validates the token
// with the gateway before rendering anything sensitive.
//
// We intentionally do NOT wrap in AuthGuard / AuthProvider chrome: an embed has
// no logged-in user; its only credential is the signed token in the URL.
export const metadata: Metadata = {
  title: "Embedded widget | CDC ATS",
  // Embeds must never be indexed (they carry a scoped token in the URL).
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  // A transparent, full-bleed shell so the widget blends into the host page.
  // The per-page EmbedShell mounts the .cd-scope + tenant brand ramp.
  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      {children}
    </div>
  );
}
