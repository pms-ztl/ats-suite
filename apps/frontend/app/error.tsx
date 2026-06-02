"use client";
// app/error.tsx
// Next.js error boundary (500 / system-error screen). Exact-layout port of
// claude-design/500.html: full-viewport light shell with a soft background
// video, centered top nav, and a bottom-left hero. The primary CTA wires to
// the framework-provided reset(); the secondary returns home. Palette refs use
// the --c-* full-color tokens; decorative video/veil keep the prototype's
// literal wash. No data wiring, this is a static boundary.

import { useEffect } from "react";
import { Logo } from "@/components/aurora-icon";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "var(--c-surface-2)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Decorative ambient background, soft and out of the way. */}
      <video
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        src={VIDEO_SRC}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.9,
        }}
      />
      {/* Legibility veil for the bottom-left copy. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(60deg, color-mix(in oklab, var(--c-surface-2) 92%, transparent) 0%, color-mix(in oklab, var(--c-surface-2) 50%, transparent) 34%, transparent 60%), linear-gradient(0deg, color-mix(in oklab, var(--c-surface-2) 55%, transparent) 0%, transparent 40%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Top nav, centered logo pill + quick links. */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "18px 16px 0",
          }}
        >
          <a
            href="/"
            aria-label="ATS home"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              width: 44,
              height: 44,
              flexShrink: 0,
              background: "var(--c-surface)",
              boxShadow: "0 1px 2px rgba(0,0,0,.06)",
            }}
          >
            <Logo size={24} />
          </a>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(16px,4vw,40px)",
              borderRadius: 14,
              padding: "13px clamp(18px,4vw,32px)",
              background: "var(--c-surface)",
              boxShadow: "0 1px 2px rgba(0,0,0,.06)",
            }}
          >
            <a href="/" style={navLink}>
              Dashboard
            </a>
            <a href="/jobs" style={navLink}>
              Jobs
            </a>
            <a href="/candidates" style={navLink}>
              Candidates
            </a>
            <a href="/settings" style={navLink}>
              Support
            </a>
          </div>
        </nav>

        {/* Hero, bottom-left aligned per the prototype. */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            padding:
              "0 clamp(24px,7vw,112px) clamp(40px,7vw,80px)",
          }}
        >
          <div style={{ maxWidth: 460 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--c-brand)",
                marginBottom: 14,
                letterSpacing: ".01em",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: "var(--c-brand)",
                }}
              />
              Error 500 &middot; System hiccup
            </span>
            <h1
              style={{
                fontSize: "clamp(26px,3vw,34px)",
                lineHeight: 1.14,
                fontWeight: 600,
                color: "var(--c-ink)",
                letterSpacing: "-0.025em",
                margin: "0 0 12px",
              }}
            >
              Something broke on our end.
            </h1>
            <p
              style={{
                fontSize: 13.5,
                color: "var(--c-ink-2)",
                fontWeight: 400,
                margin: "0 0 22px",
                lineHeight: 1.55,
                maxWidth: "38ch",
              }}
            >
              This one is on us, not you. We have logged it and our team is
              already on it. Give it a moment and try again.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  color: "var(--c-brand)",
                  border: "1px solid var(--c-brand-tint-2)",
                  borderRadius: 999,
                  padding: "11px 22px",
                  background: "color-mix(in oklab, var(--c-surface) 40%, transparent)",
                  cursor: "pointer",
                  transition: "all .2s cubic-bezier(.22,1,.36,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--c-brand)";
                  e.currentTarget.style.color = "var(--c-on-brand)";
                  e.currentTarget.style.borderColor = "var(--c-brand)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 22px -8px color-mix(in oklab, var(--c-brand) 60%, transparent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "color-mix(in oklab, var(--c-surface) 40%, transparent)";
                  e.currentTarget.style.color = "var(--c-brand)";
                  e.currentTarget.style.borderColor = "var(--c-brand-tint-2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Try again
                <span aria-hidden="true">&rarr;</span>
              </button>
              <a
                href="/"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--c-ink-2)",
                  transition: "color .2s",
                }}
              >
                Back to dashboard
              </a>
            </div>

            {error.digest && (
              <p
                style={{
                  marginTop: 20,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--c-ink-3)",
                  letterSpacing: "-0.01em",
                }}
              >
                Reference: {error.digest}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const navLink: React.CSSProperties = {
  fontSize: "clamp(12px,1.4vw,14px)",
  fontWeight: 500,
  color: "var(--c-ink-2)",
  textDecoration: "none",
  transition: "color .2s",
};
