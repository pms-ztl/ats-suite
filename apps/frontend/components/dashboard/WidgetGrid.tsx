"use client";
// components/dashboard/WidgetGrid.tsx
//
// SLICE E4 (view) + SLICE F2 (edit) - the customizable-dashboard GRID RENDERER.
//
// Renders a DashboardDocument (from @cdc-ats/contracts) onto a responsive
// react-grid-layout. WF5 shipped VIEW mode only (items locked). WF6/F2 turns on
// EDIT mode: when isEditing is true the grid unlocks drag/resize (dragging only
// from a header handle so the per-widget buttons stay clickable) and reports
// every move/resize through onLayoutChange so the page can keep its working
// document in sync. View mode is byte-identical to WF5 (every item static).
//
// react-grid-layout v2.2.3 NOTES (this is the v2 rewrite, not v1):
//   - The package ROOT export (`react-grid-layout`) ships the NEW composable
//     <Responsive>, which takes config objects (gridConfig/dragConfig/...) and
//     measures its own width via useContainerWidth - it does NOT export
//     WidthProvider, and does NOT take the flat v1 props.
//   - The classic v1-compatible API we want here - flat `breakpoints` / `cols`
//     / `layouts` objects, `isDraggable` / `isResizable`, and the
//     `onLayoutChange(layout, layouts)` callback, with the container width fed
//     by the WidthProvider HOC - lives under the `react-grid-layout/legacy`
//     subpath export. That is the API used below.
//   - WidthProvider injects a measured `width` prop, so the grid must live in a
//     block-level container that has a real width. It reads `window`, hence the
//     whole RGL tree is mounted client-only via next/dynamic({ ssr: false }).
//
// HONEST DATA: this component places cells and nothing more. Whether a cell
// shows real data or an EmptyMetric / EmptyChart is entirely the renderWidget
// function's responsibility (it owns the data binding). The grid never invents
// a value.
import * as React from "react";
import dynamic from "next/dynamic";
import type { DashboardDocument, DashboardWidget } from "@cdc-ats/contracts";

// RGL stylesheets. `react-grid-layout/css/styles.css` positions the grid items
// and animates placeholders; `react-resizable/css/styles.css` draws the resize
// handle. Both are side-effect CSS imports (the package marks "*.css" as a
// side effect) and are safe to import even in VIEW mode.
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Breakpoints + column counts are fixed for the dashboard and MUST match the
// five breakpoints persisted in DashboardLayoutsSchema (lg/md/sm/xs/xxs).
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 } as const;
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } as const;

// Row height (px) for one grid unit, and [x, y] margin between cells. Kept here
// so the seeded default document's `h` values translate to a sensible pixel
// height for the existing bento cards.
const ROW_HEIGHT = 96;
const MARGIN: [number, number] = [16, 16];

/** Renders one placed widget into its grid cell. The grid passes the widget's
 *  document entry plus the active breakpoint AND the edit state so the renderer
 *  can mount the drag handle + remove/settings affordances in edit mode. This fn
 *  owns ALL data binding + the honest empty-state decision. */
export type WidgetRenderFn = (
  widget: DashboardWidget,
  ctx: { breakpoint: string; isEditing: boolean },
) => React.ReactNode;

export interface WidgetGridProps {
  /** The persisted dashboard description (widgets + responsive placement). */
  document: DashboardDocument;
  /** Edit mode toggle. Off = WF5 VIEW (locked). On = drag/resize unlocked. */
  isEditing?: boolean;
  /** Fired by RGL when the layout changes (drag/resize). Inert in VIEW mode. */
  onLayoutChange?: (
    layout: ReadonlyArray<{ i: string; x: number; y: number; w: number; h: number }>,
    layouts: DashboardDocument["layouts"],
  ) => void;
  /** Renders a single widget instance into its cell. */
  renderWidget: WidgetRenderFn;
  /** Optional extra class on the outer grid container. */
  className?: string;
}

// The inner grid is loaded client-only: react-grid-layout (via WidthProvider)
// touches `window`, so it cannot run during SSR. A lightweight skeleton holds
// the layout height while the chunk loads to avoid a content jump.
const WidgetGridInner = dynamic(() => import("./WidgetGridInner"), {
  ssr: false,
  loading: () => <WidgetGridSkeleton />,
});

/** Placeholder shown while the client-only grid chunk hydrates. */
function WidgetGridSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        minHeight: 320,
        borderRadius: "var(--r-lg, 14px)",
        background:
          "linear-gradient(90deg, var(--surface-2, #f3f4f6) 0%, var(--surface, #fff) 50%, var(--surface-2, #f3f4f6) 100%)",
        backgroundSize: "200% 100%",
        animation: "wg-shimmer 1.3s ease-in-out infinite",
      }}
    >
      <style>{`@keyframes wg-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

/**
 * WidgetGrid - the SSR-safe public entry. It renders nothing layout-heavy on
 * the server (delegating to the dynamic, client-only inner grid) so the page
 * can be a server component up to this boundary.
 */
export default function WidgetGrid(props: WidgetGridProps) {
  return <WidgetGridInner {...props} />;
}

export { BREAKPOINTS, COLS, ROW_HEIGHT, MARGIN };
