import type { Metadata } from "next";

// Serves the LITERAL claude-design "CDC ATS - System & Shell (Offline).html"
// harness, copied verbatim to /public/design-system/system-shell-offline.html
// (the self-contained build with all 44 scripts inlined, so it renders with zero
// sibling-file fetches). Rendered full-screen in an iframe exactly as the design
// file renders it (React + Babel via CDN). This is the STATIC ground-truth design
// reference: no auth, no live data, in-browser Babel. The real, wired app, which
// now matches this file's exact CSS + fonts, lives at the other routes.
export const metadata: Metadata = { title: "System & Shell (design reference)" };

export default function SystemShellPage() {
  return (
    <iframe
      src="/design-system/system-shell-offline.html"
      title="CDC ATS - System & Shell (Claude Design ground truth)"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none", zIndex: 50 }}
    />
  );
}
