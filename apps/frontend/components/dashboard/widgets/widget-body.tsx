"use client";
// components/dashboard/widgets/widget-body.tsx
//
// SLICE E6 - shared helpers for the WIDGET BODY components (components/dashboard/
// widgets/*). A body is the inner renderer that <WidgetFrame> mounts via its
// `bodyLoader`: the frame already owns the chrome (SectionCard), the viewport gate
// and the data binding (its useData against the widget's dataSourceKey), and hands
// the body the resolved async `state` (data / error / loading) plus the placed
// instance's `config` and chosen `viz` (WidgetBodyProps in ../WidgetFrame).
//
// So a body NEVER fetches and NEVER re-wraps itself in a card - it only turns the
// supplied state into one of the shared viz components (verbatim from
// shared/ribbon, shared/ribbon-ext, shared/charts, cd/dashboard-kit, cd/aurora-kit)
// or an HONEST empty/loading/error note.
//
// HARD RULE - REAL DATA OR HONEST EMPTY ONLY: a body bound to an empty source
// renders the viz's own EmptyChart / EmptyMetric (or BodyNote), NEVER a fabricated
// zero and NEVER a flat zero-line. A real measured 0 (e.g. a clear HITL queue) is
// shown as a real 0 by the viz; only an ABSENT value becomes the em-dash empty.
import * as React from "react";

// A muted, honest status line for the loading / error / source-blocked cases.
// It never shows a number (that would be a fabricated value); the real empty
// states are the viz components' own EmptyChart / EmptyMetric.
export function BodyNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: "100%", minHeight: 96, display: "grid", placeItems: "center", textAlign: "center", padding: 12 }}>
      <span style={{ fontSize: 12.5, color: "var(--st-nodata, var(--ink-3))", fontWeight: 600, maxWidth: "40ch" }}>
        {children}
      </span>
    </div>
  );
}

// A fixed-height wrapper so an SVG viz fills the cell consistently and the empty
// state holds the same footprint as the rendered chart (no layout jump).
export function BodyFill({ height = 230, children }: { height?: number; children: React.ReactNode }) {
  return <div style={{ width: "100%", height, minHeight: 0 }}>{children}</div>;
}
