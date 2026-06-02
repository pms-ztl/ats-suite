import type { Metadata } from "next";

// Serves the LITERAL claude-design "CDC ATS - System & Shell.html" harness,
// copied verbatim to /public/design-system/ (the exact file + all ~45 of its
// .jsx modules + assets), rendered full-screen in an iframe exactly as the
// design file renders it (React + Babel loaded via CDN, shell.jsx mounts the
// whole prototype). This is a STATIC design reference: no auth, no live data,
// in-browser Babel transpile. The real, wired app lives at the other routes.
export const metadata: Metadata = { title: "System & Shell (design reference)" };

export default function SystemShellPage() {
  return (
    <iframe
      src="/design-system/system-shell.html"
      title="CDC ATS - System & Shell"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none", zIndex: 50 }}
    />
  );
}
