// app/not-found.tsx
// Next.js 404 special file. Exact-layout port of the Aurora "404.html"
// prototype: a full-viewport standalone screen with a decorative background
// video + legibility veil, a centered top nav (brand mark + link pill), and a
// bottom-left hero (error badge, headline, helpful copy, primary "back to
// dashboard" action + a secondary help link). Static, no data wiring. The
// brand mark uses the shared Aurora `Logo`. Brand accent maps to the app's
// --c-brand palette token; the neutral surface/text values are the prototype's
// literal design values for this standalone screen.

import Link from "next/link";
import { Logo } from "@/components/aurora-icon";

export default function NotFound() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#f0f0ee",
        fontFamily: "var(--font-sans)",
        // local accent alias, the green ties to the app brand token
        ["--acc" as string]: "var(--c-brand)",
      }}
    >
      {/* Decorative ambient backdrop */}
      <video
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      {/* Legibility veil for the bottom-left dark text */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(60deg, rgba(240,240,238,.92) 0%, rgba(240,240,238,.5) 34%, rgba(240,240,238,0) 60%), linear-gradient(0deg, rgba(240,240,238,.55) 0%, transparent 40%)",
        }}
      />

      {/* Foreground */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "18px 16px 0",
          }}
        >
          <Link
            href="/"
            aria-label="CDC ATS home"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              width: 44,
              height: 44,
              flexShrink: 0,
              background: "#EDEDED",
              boxShadow: "0 1px 2px rgba(0,0,0,.06)",
              textDecoration: "none",
            }}
          >
            <Logo size={24} />
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(16px,4vw,40px)",
              borderRadius: 14,
              padding: "13px clamp(18px,4vw,32px)",
              background: "#EDEDED",
              boxShadow: "0 1px 2px rgba(0,0,0,.06)",
            }}
          >
            {[
              { label: "Product", href: "/" },
              { label: "Pricing", href: "/pricing" },
              { label: "Help", href: "/support" },
              { label: "Support", href: "/support" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  fontSize: "clamp(12px,1.4vw,14px)",
                  fontWeight: 500,
                  color: "#3f3f46",
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Hero, anchored bottom-left */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            padding:
              "0 clamp(24px,7vw,112px) clamp(40px,7vw,80px)",
          }}
        >
          <div style={{ maxWidth: 440 }}>
            <Link
              href="/support"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--acc)",
                marginBottom: 14,
                letterSpacing: ".01em",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: "var(--acc)",
                }}
              />
              Error 404 · Page not found
              <span style={{ display: "inline-block" }} aria-hidden="true">
                {"→"}
              </span>
            </Link>
            <h1
              style={{
                fontSize: "clamp(26px,3vw,34px)",
                lineHeight: 1.14,
                fontWeight: 600,
                color: "#18181b",
                letterSpacing: "-0.025em",
                margin: "0 0 12px",
              }}
            >
              This page wandered off the map.
            </h1>
            <p
              style={{
                fontSize: 13.5,
                color: "#71717a",
                fontWeight: 400,
                margin: "0 0 22px",
                lineHeight: 1.55,
                maxWidth: "38ch",
              }}
            >
              The link you followed does not exist, or it moved somewhere new.
              Let us get you back on track.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--acc)",
                  border: "1px solid #8fd3bd",
                  borderRadius: 999,
                  padding: "11px 22px",
                  background: "rgba(255,255,255,.4)",
                  textDecoration: "none",
                }}
              >
                Back to dashboard
                <span style={{ display: "inline-block" }} aria-hidden="true">
                  {"→"}
                </span>
              </Link>
              <Link
                href="/support"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#52525b",
                  textDecoration: "none",
                }}
              >
                Visit help center
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
