"use client";
// components/cd/widgets/widget-shell.tsx
// Shared chrome + source-binding helper for every WF5 dashboard widget wrapper.
//
// Each widget wrapper (the components named by lib/widgets/registry) binds ONE
// E1 data source (lib/widgets/sources) through the app's 45s live layer
// (lib/use-data) and renders an honest state machine:
//   • loading  -> a muted skeleton caption (no fabricated values)
//   • error    -> a muted error caption (the prior data, if any, is kept by useData)
//   • empty    -> the widget's OWN honest-empty viz (EmptyChart / EmptyMetric)
//   • data     -> the chosen viz, rendered verbatim from the shared kit
//
// REAL DATA OR HONEST EMPTY ONLY: a widget never paints a fake 0 or a flat
// zero-line. `useWidgetSource` resolves the source via getSource() and refuses a
// non-real / unknown key at runtime (defense in depth on top of the registry's
// load-time assertRealSource), so a misconfigured instance shows an honest
// "unavailable" note instead of guessing.
import * as React from "react";
import { useData } from "@/lib/use-data";
import { getSource } from "@/lib/widgets/sources";
import { Icon, type IconName } from "@/components/cd/icon";

// The frame every widget renders inside: a titled card matching the cd-tokens
// surface, with the live source kept inside. Kept intentionally light so the
// widget body owns its own viz padding.
export function WidgetShell({
  title,
  icon,
  headRight,
  children,
}: {
  title?: string;
  icon?: IconName;
  headRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--e1)",
        overflow: "hidden",
      }}
    >
      {(title || headRight) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "12px 14px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--ink-1)",
            }}
          >
            {icon && (
              <span style={{ color: "var(--ink-3)" }}>
                <Icon name={icon} size={15} />
              </span>
            )}
            {title}
          </span>
          {headRight}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, padding: 14, overflow: "auto" }}>{children}</div>
    </div>
  );
}

// A muted, honest status line (loading / error). Never shows a number.
export function WidgetNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: "100%", minHeight: 80, display: "grid", placeItems: "center" }}>
      <span style={{ fontSize: 12.5, color: "var(--st-nodata, var(--ink-3))", fontWeight: 600 }}>
        {children}
      </span>
    </div>
  );
}

// Bind a registry dataSourceKey to its real fetcher through the 45s live layer.
// Returns the async state PLUS a `blocked` flag set when the key is unknown or
// not realData:true — the wrapper renders an honest "unavailable" note in that
// case rather than fetching nothing and showing a fake empty.
export function useWidgetSource<T>(dataSourceKey: string): {
  data?: T;
  loading: boolean;
  error?: Error;
  blocked: boolean;
  blockedReason?: string;
} {
  const source = getSource(dataSourceKey);
  const blocked = !source || !source.realData;
  const blockedReason = !source
    ? `Unknown data source "${dataSourceKey}".`
    : !source.realData
      ? source.blockedReason ?? "This data source is not bindable."
      : undefined;

  // A blocked key must still call a hook (rules of hooks), so we bind a no-op
  // fetcher that resolves to undefined and never paints.
  const fetcher = React.useCallback(
    () => (source && source.realData ? (source.fetcher() as Promise<T>) : Promise.resolve(undefined as T)),
    [source],
  );
  const state = useData<T>(fetcher);

  return { ...state, blocked, blockedReason };
}
