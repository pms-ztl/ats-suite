"use client";
// components/dashboard/WidgetSkeleton.tsx
// SLICE E5 - the loading placeholder for a dashboard widget body.
//
// Used as the <Suspense fallback> while a widget's React.lazy body chunk loads,
// and as the visible state for a not-yet-in-view cell. It fills the SectionCard
// body so there is zero layout shift when the real content lands. Styled with
// the existing cd-tokens (--surface / --surface-2 / --line) so it matches the
// Aurora cards, and the shimmer animation is gated behind
// @media (prefers-reduced-motion: no-preference) so reduced-motion users get a
// static muted block.
//
// HONEST DATA: this is a structural placeholder only. It paints muted bars, not
// numbers - it never renders a fabricated value or a fake zero.
import * as React from "react";

export function WidgetSkeleton({
  rows = 3,
  style = {},
}: {
  /** Number of muted bars to draw under the lead block. */
  rows?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        height: "100%",
        minHeight: 120,
        ...style,
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .cd-widget-skel-bar { animation: cdWidgetShimmer 1.3s ease-in-out infinite; }
        }
        @keyframes cdWidgetShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {/* Lead block (stands in for the chart / hero number). */}
      <div
        className="cd-widget-skel-bar"
        style={{
          flex: 1,
          minHeight: 64,
          borderRadius: "var(--r, 10px)",
          background:
            "linear-gradient(90deg, var(--surface-2) 0%, var(--surface) 50%, var(--surface-2) 100%)",
          backgroundSize: "200% 100%",
        }}
      />
      {/* Caption bars (stand in for legend / labels). */}
      {Array.from({ length: Math.max(0, rows) }).map((_, i) => (
        <div
          key={i}
          className="cd-widget-skel-bar"
          style={{
            height: 10,
            width: `${88 - i * 16}%`,
            borderRadius: 99,
            background:
              "linear-gradient(90deg, var(--surface-2) 0%, var(--surface) 50%, var(--surface-2) 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      ))}
    </div>
  );
}

export default WidgetSkeleton;
