"use client";
// components/dashboard/WidgetGridInner.tsx
//
// The client-only react-grid-layout body for <WidgetGrid>. Split out from
// WidgetGrid.tsx so the latter can stay an SSR-safe boundary and lazy-load
// this via next/dynamic({ ssr: false }) - RGL's WidthProvider reads `window`
// and must never run on the server.
//
// API: react-grid-layout v2.2.3, LEGACY subpath (`react-grid-layout/legacy`).
// That subpath is what still exposes the classic v1 flat-prop <Responsive>
// (breakpoints / cols / layouts objects, isDraggable / isResizable,
// onLayoutChange(layout, layouts)) AND the WidthProvider HOC. The root export
// in v2 is the new composable component with a different (config-object) API
// and ships no WidthProvider, so it is deliberately NOT used here.
import * as React from "react";
import {
  Responsive,
  WidthProvider,
  type Layout as RglLayout,
  type ResponsiveLayouts as RglResponsiveLayouts,
} from "react-grid-layout/legacy";
import type { DashboardDocument, DashboardWidget } from "@cdc-ats/contracts";
import {
  BREAKPOINTS,
  COLS,
  ROW_HEIGHT,
  MARGIN,
  type WidgetGridProps,
} from "./WidgetGrid";

// WidthProvider injects a measured `width` prop into the wrapped Responsive
// grid. `measureBeforeMount` defers the first paint until the container width
// is known, which prevents the items from flashing at a default width.
const ResponsiveGridLayout = WidthProvider(Responsive);

const BREAKPOINT_KEYS = ["lg", "md", "sm", "xs", "xxs"] as const;
type BreakpointKey = (typeof BREAKPOINT_KEYS)[number];

/**
 * Build RGL's `layouts` prop from the working document. The document's layout
 * items are already RGL-shaped ({ i, x, y, w, h }); we additionally stamp each
 * item's minW / minH from its owning widget so a cell can never be sized below
 * what its renderer needs. The grid item key (`i`) is the widget's instanceId.
 *
 * `editing` flips the per-item `static` flag: VIEW mode hard-locks every item
 * (static: true) so the board can never be dragged; EDIT mode unlocks them
 * (static: false) so RGL honors the grid-level isDraggable/isResizable. A freshly
 * added widget may carry x/y = Infinity (the auto-place sentinel) which RGL
 * resolves to a real free slot on the next layout pass.
 */
function toRglLayouts(
  doc: DashboardDocument,
  editing: boolean,
): RglResponsiveLayouts<BreakpointKey> {
  const minByInstance = new Map<string, { minW?: number; minH?: number }>();
  for (const w of doc.widgets) {
    minByInstance.set(w.instanceId, { minW: w.minW, minH: w.minH });
  }

  const out = {} as Record<BreakpointKey, RglLayout>;
  for (const bp of BREAKPOINT_KEYS) {
    out[bp] = doc.layouts[bp].map((item) => {
      const mins = minByInstance.get(item.i);
      return {
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        ...(mins?.minW != null ? { minW: mins.minW } : {}),
        ...(mins?.minH != null ? { minH: mins.minH } : {}),
        // VIEW mode hard-locks each item; EDIT mode unlocks for drag/resize.
        static: !editing,
      };
    });
  }
  return out;
}

/** Group RGL's flat layout (one breakpoint) back into the document's 5-key
 *  shape for the onLayoutChange consumer. Breakpoints other than the active one
 *  are preserved from the current document so we never drop their placement. */
function toDocLayouts(
  doc: DashboardDocument,
  activeBp: BreakpointKey,
  next: RglLayout,
): DashboardDocument["layouts"] {
  const flat = next.map((it) => ({ i: it.i, x: it.x, y: it.y, w: it.w, h: it.h }));
  return { ...doc.layouts, [activeBp]: flat };
}

export default function WidgetGridInner({
  document: doc,
  isEditing = false,
  onLayoutChange,
  renderWidget,
  className,
}: WidgetGridProps) {
  // Track the active breakpoint so renderWidget can adapt and so the change
  // callback can report which breakpoint's layout actually changed.
  const [breakpoint, setBreakpoint] = React.useState<BreakpointKey>("lg");

  // Recompute RGL layouts when the document OR the edit state changes (toggling
  // edit flips every item's `static`). A new instance (added widget) also changes
  // `doc`, so the memo picks it up.
  const layouts = React.useMemo(() => toRglLayouts(doc, isEditing), [doc, isEditing]);

  // Debounce the layout-change callback LOCALLY so a drag/resize gesture (which
  // fires onLayoutChange on every pixel) commits to the page's working document
  // at most a few times. The page still holds the authoritative working copy; we
  // only smooth the firehose. Latest-args-win via a ref.
  const latestRef = React.useRef<{ flat: RglLayout } | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleLayoutChange = React.useCallback(
    (current: RglLayout) => {
      if (!onLayoutChange) return;
      latestRef.current = { flat: current };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const latest = latestRef.current;
        if (!latest) return;
        onLayoutChange(
          latest.flat.map((it) => ({ i: it.i, x: it.x, y: it.y, w: it.w, h: it.h })),
          toDocLayouts(doc, breakpoint, latest.flat),
        );
      }, 180);
    },
    [onLayoutChange, doc, breakpoint],
  );

  return (
    <ResponsiveGridLayout
      className={["wg-grid", isEditing ? "wg-editing" : "", className].filter(Boolean).join(" ")}
      layouts={layouts}
      breakpoints={BREAKPOINTS}
      cols={COLS}
      rowHeight={ROW_HEIGHT}
      margin={MARGIN}
      isDraggable={isEditing}
      isResizable={isEditing}
      // Drag only from the per-card header handle so the remove/settings buttons
      // (and any in-body interaction) stay clickable while editing.
      draggableHandle=".wg-drag-handle"
      onBreakpointChange={(bp) => setBreakpoint(bp as BreakpointKey)}
      onLayoutChange={handleLayoutChange}
      measureBeforeMount
      useCSSTransforms
    >
      {doc.widgets.map((widget: DashboardWidget) => (
        // RGL matches each child to a layout item by its `key`, so the key MUST
        // equal the layout item's `i` (the widget instanceId).
        <div key={widget.instanceId} className="wg-cell">
          {renderWidget(widget, { breakpoint, isEditing })}
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
