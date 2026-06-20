"use client";
// components/dashboard/WidgetPalette.tsx
//
// SLICE F2 - the "Add widget" panel for dashboard edit mode.
//
// The palette is driven ENTIRELY by the WF5 widget registry (lib/widgets/
// registry). It lists the catalog entries the signed-in user MAY place, filtered
// by exactly the same three gates the cd-shell NAV uses:
//   1. ROLE   - registry.filter() checks entry.roles against the user's role.
//   2. MODULE - the tenant's resolved enabled-module set (use-modules) is passed
//               to filter() ONLY when gating is resolved; when it is NOT resolved
//               (endpoint absent / errored -> allEnabled), nothing is hidden, so
//               the palette mirrors the graceful all-enabled posture of the nav.
//               When gating IS resolved, a widget whose `requiredModule` is NOT in
//               the enabled set is DROPPED from the palette, so a module-owned
//               widget (e.g. `oa_results`, owned by `oa-assessments`) only appears
//               once its module is enabled. This closes the dashboard <-> module
//               loop. Widgets with NO requiredModule are unaffected (always shown,
//               subject to role/plan), so the gate is purely additive.
//   3. PLAN   - the tenant's current plan (user.tenant.plan) gates entries whose
//               planTier exceeds it.
//
// Adding a widget pushes a NEW instance (makeInstanceId) into document.widgets
// AND into every breakpoint layout at {x: Infinity, y: Infinity} - the react-
// grid-layout auto-place sentinel, which RGL resolves to a real free slot on the
// next layout pass (onLayoutChange then writes the resolved integer coordinates
// back into the working document, so the persisted board never carries Infinity).
//
// REAL DATA OR HONEST EMPTY ONLY: the palette only places a registered widget,
// each of which binds a realData:true source (or is a source-less utility widget)
// and renders an honest empty state. It fabricates nothing.
import * as React from "react";
import type { DashboardDocument, DashboardWidget } from "@cdc-ats/contracts";
import { Icon } from "../cd/icon";
import {
  filter as filterCatalog,
  type CatalogEntry,
  type DashboardRole,
  type PlanTier,
} from "@/lib/widgets/registry";
import { makeInstanceId } from "@/lib/widgets/schema";

const BREAKPOINT_KEYS = ["lg", "md", "sm", "xs", "xxs"] as const;

// Coerce the JWT role (uppercase) to a registry DashboardRole; unknown roles get
// no placeable widgets (the palette renders its honest empty state).
const KNOWN_ROLES: ReadonlySet<DashboardRole> = new Set<DashboardRole>([
  "SUPER_ADMIN",
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
  "INTERVIEWER",
]);
function toDashboardRole(role: string | null | undefined): DashboardRole | null {
  const r = (role ?? "").toUpperCase();
  return KNOWN_ROLES.has(r as DashboardRole) ? (r as DashboardRole) : null;
}

const KNOWN_PLANS: ReadonlySet<PlanTier> = new Set<PlanTier>([
  "FREE",
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE",
]);
function toPlanTier(plan: string | null | undefined): PlanTier | undefined {
  const p = (plan ?? "").toUpperCase();
  return KNOWN_PLANS.has(p as PlanTier) ? (p as PlanTier) : undefined;
}

/** Build the DashboardWidget for a newly placed catalog entry. The source key +
 *  default viz/config/min footprint all come from the registry so a placed
 *  widget can never drift from the catalog. Source-less utility widgets key
 *  their dataSourceKey on their type (matching the defaults builder). */
function widgetFromEntry(entry: CatalogEntry): DashboardWidget {
  return {
    instanceId: makeInstanceId(),
    type: entry.type,
    title: entry.label,
    dataSourceKey: entry.dataSourceKey ?? entry.type,
    viz: entry.allowedViz[0],
    config: { ...entry.defaultConfig },
    minW: entry.defaultSize.minW,
    minH: entry.defaultSize.minH,
  };
}

/** Append a new widget to the working document: add it to widgets[] and to every
 *  breakpoint layout at the RGL auto-place sentinel ({x: Infinity, y: Infinity}).
 *  The new item also carries the widget's default w/h so it lands at a sensible
 *  size; RGL clamps to minW/minH (stamped from the widget) on layout. */
export function addWidget(
  doc: DashboardDocument,
  entry: CatalogEntry,
): DashboardDocument {
  const widget = widgetFromEntry(entry);
  const { w, h } = entry.defaultSize;

  const layouts = { ...doc.layouts } as DashboardDocument["layouts"];
  for (const bp of BREAKPOINT_KEYS) {
    layouts[bp] = [
      ...doc.layouts[bp],
      // Infinity is RGL's "auto-place at the next free slot" sentinel. It is a
      // transient in-memory value: RGL resolves it to real integer coordinates
      // on the next layout pass, which onLayoutChange writes back. It is sanitized
      // out before any PUT (see use-dashboard-layout.save).
      { i: widget.instanceId, x: Infinity, y: Infinity, w, h } as DashboardDocument["layouts"]["lg"][number],
    ];
  }

  return {
    ...doc,
    widgets: [...doc.widgets, widget],
    layouts,
  };
}

export interface WidgetPaletteProps {
  /** The current working document (used to disable already-maxed-out entries if
   *  ever needed; presently informational). */
  document: DashboardDocument;
  /** The signed-in user's role (uppercase JWT role). */
  role: string | null | undefined;
  /** The tenant's plan (FREE..ENTERPRISE), if known. */
  plan: string | null | undefined;
  /** The tenant's resolved enabled module keys, or null when gating is NOT
   *  resolved (treat as all-enabled -> hide nothing). */
  enabledKeys: string[] | null;
  /** Called with the next document when the user adds a widget. */
  onAdd: (next: DashboardDocument) => void;
  /** Close the palette. */
  onClose: () => void;
}

export function WidgetPalette({
  document: doc,
  role,
  plan,
  enabledKeys,
  onAdd,
  onClose,
}: WidgetPaletteProps) {
  const dashRole = toDashboardRole(role);
  const planTier = toPlanTier(plan);

  // Mirror cd-shell: pass the module list to the registry filter ONLY when gating
  // is resolved (enabledKeys non-null). When null (route absent / errored), pass
  // undefined so filter() does NOT hide anything - the graceful all-enabled path.
  const entries: CatalogEntry[] = React.useMemo(() => {
    if (!dashRole) return [];
    return filterCatalog(dashRole, enabledKeys ?? undefined, planTier);
  }, [dashRole, enabledKeys, planTier]);

  return (
    <div
      role="dialog"
      aria-label="Add a widget"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-xl)",
        boxShadow: "var(--e2, var(--e1))",
        padding: 18,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: "var(--fs-md)" }}>
          <Icon name="plus" size={16} style={{ color: "var(--ink-3)" }} />
          Add a widget
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "var(--r)",
            border: "1px solid var(--line)",
            background: "var(--surface)",
            color: "var(--ink-3)",
            cursor: "pointer",
          }}
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      {entries.length === 0 ? (
        // Honest empty state: no widget kinds are placeable for this role/plan/
        // module set. Never a fabricated list.
        <div style={{ padding: "18px 4px", color: "var(--ink-3)", fontSize: 13 }}>
          No widgets are available to add for your role and plan.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 10,
          }}
        >
          {entries.map((entry) => (
            <button
              key={entry.type}
              type="button"
              onClick={() => onAdd(addWidget(doc, entry))}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                textAlign: "left",
                padding: "12px 13px",
                borderRadius: "var(--r-lg, 12px)",
                border: "1px solid var(--line)",
                background: "var(--surface-2, var(--surface))",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  flex: "0 0 auto",
                  borderRadius: "var(--r)",
                  background: "var(--brand-tint, var(--surface-3))",
                  color: "var(--brand)",
                }}
              >
                <Icon name={entry.icon} size={16} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 13 }}>
                  {entry.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--ink-3)",
                    marginTop: 2,
                    lineHeight: 1.35,
                  }}
                >
                  {entry.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default WidgetPalette;
