"use client";
// components/dashboard/WidgetFrame.tsx
//
// SLICE E5 - the per-cell WIDGET FRAME for the customizable dashboard (WF5/WF6).
//
// Every placed widget in <WidgetGrid> is rendered through this frame. The frame
// owns three concerns and nothing else:
//
//   1. CHROME - it wraps the widget body in the existing aurora-kit <SectionCard>
//      (title top-left, optional action top-right). We reuse SectionCard verbatim
//      so a framed widget is visually identical to the hand-wired Aurora cards.
//      In VIEW mode the frame is READ-ONLY: remove / settings affordances are
//      WF6, so the only header-right element here is an optional source-provided
//      `action` (e.g. "Breakdown"); there is no remove/gear button yet.
//
//   2. LAZY + VIEWPORT GATING - the widget body is a React.lazy chunk rendered
//      inside <Suspense fallback={<WidgetSkeleton/>}>, and the whole body subtree
//      is gated behind useInView (IntersectionObserver). An OFF-screen widget
//      renders only the skeleton: its body NEVER mounts and - because the data
//      binding lives inside the gated subtree - it NEVER fetches until the cell
//      scrolls into view. Once in view it latches mounted (useInView `once`) so a
//      widget that scrolls back off keeps its data + live refetch.
//
//   3. DATA BINDING - the frame resolves the widget's dataSourceKey against the
//      lib/widgets/sources registry and binds it through the existing
//      lib/use-data useData(...) hook, keyed by { instanceId, globalFilters } (so
//      a filter change re-fetches and two instances of the same source are
//      independent) on the source's own refreshMs cadence. The hook's resolved
//      { data, error, loading } is handed to the body to render the real value or
//      the honest empty state.
//
// HARD RULE - REAL DATA OR HONEST EMPTY ONLY: the frame fetches only through the
// audited registry fetchers (getSource), refuses any non-real / landmine key with
// an honest "unbindable" notice, and renders an error/empty state rather than a
// fabricated value. It never invents a number.
import * as React from "react";
import { Suspense } from "react";
import type { IconName } from "../cd/icon";
import { Icon } from "../cd/icon";
import { SectionCard } from "../cd/aurora-kit";
import { EmptyMetric } from "../cd/dashboard-kit";
import { WidgetSkeleton } from "./WidgetSkeleton";
import { useInView } from "@/hooks/use-in-view";
import { useData, type Async } from "@/lib/use-data";
import { getSource, type DataSource } from "@/lib/widgets/sources";

// Shared style for the small header-right buttons (settings / remove) shown in
// edit mode. Kept module-local so the frame stays self-contained.
const frameBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  borderRadius: "var(--r)",
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink-3)",
  cursor: "pointer",
};

// The contract for a widget body. A body is a presentational React.lazy module:
// it receives the resolved async state (data / error / loading) plus its widget
// instance config and the active breakpoint, and it owns the choice between
// rendering the real value and the honest empty state (EmptyMetric/EmptyChart).
// It performs NO fetching of its own - the frame did that and passes the result.
export interface WidgetBodyProps<T = unknown> {
  /** Resolved async state from the frame's useData binding. */
  state: Async<T>;
  /** This placed instance's stable id. */
  instanceId: string;
  /** The widget kind key (e.g. "kpi", "funnel"). */
  type: string;
  /** Visualization variant the body should pick (e.g. "bar", "donut", "kpi"). */
  viz?: string;
  /** Free-form, widget-specific configuration. */
  config?: Record<string, unknown>;
  /** The resolved registry source row (for the body's view-model awareness). */
  source: DataSource;
  /** The active responsive breakpoint, so the body can adapt density. */
  breakpoint: string;
}

export interface WidgetFrameProps {
  /** Stable id of this placed widget instance (keys the data binding). */
  instanceId: string;
  /** Widget kind key (resolves the body renderer). */
  type: string;
  /** Card title (top-left in the SectionCard header). */
  title: string;
  /** Optional icon shown beside the title. */
  icon?: IconName;
  /** Optional read-only header action label (top-right). VIEW mode only - this is
   *  source-provided context, NOT a remove/settings affordance (those are WF6). */
  action?: string;
  /** Click handler for the optional `action` label. */
  onAction?: () => void;
  /** dataSourceKey naming the registry source that feeds this widget. */
  dataSourceKey: string;
  /** Visualization variant passed through to the body. */
  viz?: string;
  /** Free-form widget config passed through to the body. */
  config?: Record<string, unknown>;
  /** Dashboard-wide filters; part of the data-binding key so a filter change
   *  re-fetches every widget. */
  globalFilters?: Record<string, unknown>;
  /** The active responsive breakpoint (from WidgetGrid). */
  breakpoint?: string;
  /** Lazy module exporting the widget body as its default export. Provided by
   *  the widget registry (WF6); the frame only mounts it once in view. */
  bodyLoader: () => Promise<{ default: React.ComponentType<WidgetBodyProps> }>;
  /** Body padding inside the SectionCard (matches the Aurora cards). */
  pad?: number;
  /** Outer style passthrough (the grid cell already sizes the frame). */
  style?: React.CSSProperties;
  /** EDIT mode (WF6/F2). When true the header becomes a drag handle and the
   *  remove (X) + settings (gear) affordances appear in the header-right slot. */
  isEditing?: boolean;
  /** Remove this widget from the working document (edit mode only). */
  onRemove?: () => void;
  /** Open this widget's settings form (edit mode only). */
  onSettings?: () => void;
}

/**
 * The viewport-gated, data-bound body. Split into its own component so the
 * useData hook (and therefore the network request) only ever runs when this
 * subtree is mounted - i.e. when the cell is in view. The parent <WidgetFrame>
 * mounts <GatedBody> only after useInView latches true.
 */
function GatedBody({
  source,
  instanceId,
  type,
  viz,
  config,
  globalFilters,
  breakpoint,
  Body,
}: {
  source: DataSource;
  instanceId: string;
  type: string;
  viz?: string;
  config?: Record<string, unknown>;
  globalFilters?: Record<string, unknown>;
  breakpoint: string;
  Body: React.ComponentType<WidgetBodyProps>;
}) {
  // Bind via the existing live layer. The deps array keys the binding by this
  // instance and the active global filters, so (a) a filter change re-fetches,
  // (b) two instances of the same source fetch independently, and (c) the 45s
  // background refetch + focus/visibility wake-ups in use-data.ts apply for free.
  // The per-source refreshMs is carried through so a heavier source (e.g. a
  // super-admin rollup) can refresh on its own slower cadence.
  const filtersKey = React.useMemo(
    () => JSON.stringify(globalFilters ?? {}),
    [globalFilters],
  );
  const state = useData(source.fetcher, [instanceId, filtersKey, source.refreshMs]);

  return (
    <Body
      state={state}
      instanceId={instanceId}
      type={type}
      viz={viz}
      config={config}
      source={source}
      breakpoint={breakpoint}
    />
  );
}

/** Honest notice shown when a widget is bound to an unknown or non-real
 *  (landmine) source. Renders inside the card body rather than a fabricated
 *  value - keeps the REAL-DATA-OR-HONEST-EMPTY rule even for a misconfigured
 *  document. */
function UnbindableNotice({ reason }: { reason: string }) {
  return (
    <div
      style={{
        minHeight: 120,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        padding: 16,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12.5,
          color: "var(--ink-3)",
          maxWidth: "40ch",
        }}
      >
        <Icon name="flag" size={14} />
        {reason}
      </span>
    </div>
  );
}

export function WidgetFrame({
  instanceId,
  type,
  title,
  icon,
  action,
  onAction,
  dataSourceKey,
  viz,
  config,
  globalFilters,
  breakpoint = "lg",
  bodyLoader,
  pad = 18,
  style = {},
  isEditing = false,
  onRemove,
  onSettings,
}: WidgetFrameProps) {
  // Viewport gate: an off-screen widget mounts neither its body nor its fetch.
  // `once: true` latches mounted on first intersection so scrolling back off
  // keeps the data + live refetch (no tear-down / re-fetch churn).
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: "200px", once: true });

  // Resolve the source once. An unknown key, or a known landmine (realData:false),
  // is refused here - we render an honest notice instead of ever fetching it.
  const source = getSource(dataSourceKey);
  const unbindableReason = !source
    ? `Unknown data source "${dataSourceKey}".`
    : !source.realData
      ? source.blockedReason ?? `Data source "${dataSourceKey}" has no real backend source.`
      : null;

  // React.lazy must be stable across renders, so memoize on the loader identity.
  const Body = React.useMemo(
    () => React.lazy(bodyLoader),
    [bodyLoader],
  );

  // In edit mode the header doubles as the RGL drag handle (the grid sets
  // draggableHandle=".wg-drag-handle"); the header-right slot carries the per-
  // widget settings (gear) + remove (X) controls instead of the source action.
  const editHeadRight = isEditing ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {onSettings && (
        <button
          type="button"
          aria-label="Widget settings"
          onClick={onSettings}
          // Stop the pointer-down from starting a drag when clicking the button.
          onMouseDown={(e) => e.stopPropagation()}
          style={frameBtnStyle}
        >
          <Icon name="settings" size={14} />
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove widget"
          onClick={onRemove}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ ...frameBtnStyle, color: "var(--danger, #b91c1c)" }}
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </span>
  ) : undefined;

  return (
    <SectionCard
      title={title}
      icon={icon}
      action={isEditing ? undefined : action}
      onAction={onAction}
      headRight={editHeadRight}
      headerClassName={isEditing ? "wg-drag-handle" : undefined}
      headerStyle={isEditing ? { cursor: "grab", userSelect: "none" } : {}}
      pad={pad}
      style={{ height: "100%", ...style }}
    >
      {/* The ref'd wrapper is what the IntersectionObserver watches; it always
          fills the card body so the skeleton holds the cell's height. */}
      <div ref={ref} style={{ width: "100%", height: "100%", minHeight: 120 }}>
        {unbindableReason ? (
          <UnbindableNotice reason={unbindableReason} />
        ) : !inView ? (
          // Off-screen: skeleton only. No lazy chunk, no useData, no fetch.
          <WidgetSkeleton />
        ) : (
          // In view: lazy-load the body chunk (skeleton fallback) and, once the
          // chunk is ready, GatedBody runs the real useData binding.
          <Suspense fallback={<WidgetSkeleton />}>
            <GatedBody
              source={source!}
              instanceId={instanceId}
              type={type}
              viz={viz}
              config={config}
              globalFilters={globalFilters}
              breakpoint={breakpoint}
              Body={Body}
            />
          </Suspense>
        )}
      </div>
    </SectionCard>
  );
}

export default WidgetFrame;

// Re-export the small empty primitive so a body that just needs the honest
// em-dash can import it from one place alongside the frame.
export { EmptyMetric };
