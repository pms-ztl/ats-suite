"use client";
// components/dashboard/DashboardToolbar.tsx
//
// SLICE F2 - the dashboard edit-mode toolbar.
//
// In VIEW mode it shows a single "Customize" button plus the shared LiveStatus
// chip (reused verbatim from dashboard-kit) so the home keeps its live-data
// indicator. In EDIT mode it swaps in the action set:
//   - Add widget       : opens the WidgetPalette (page-owned).
//   - Save             : PUTs the whole working document (copy-on-write override).
//   - Cancel           : discards edits and leaves edit mode.
//   - Reset to default : DELETEs the personal override and reloads the default.
//   - Set as tenant default (ADMIN only): best-effort promote the current board
//                        to the workspace default. Rendered only when the page
//                        supplies onSetTenantDefault (admins) and degrades
//                        gracefully if the endpoint is absent.
//
// The toolbar is purely presentational: every action is a callback the page
// owns. It fabricates no state and shows honest disabled/saving states.
import * as React from "react";
import { Btn } from "../cd/aurora-ui";
import { LiveStatus } from "../cd/dashboard-kit";

// The shared Btn has no `disabled` prop, so we model disabled locally: dim the
// button and swallow the click. Keeps the shared primitive untouched (additive).
function dim(disabled: boolean): React.CSSProperties {
  return disabled ? { opacity: 0.5, pointerEvents: "none", cursor: "default" } : {};
}

export interface DashboardToolbarProps {
  /** Whether the board is currently in edit mode. */
  isEditing: boolean;
  /** Enter edit mode (snapshot the working copy). */
  onEdit: () => void;
  /** Save the working document (PUT). */
  onSave: () => void;
  /** Discard edits and leave edit mode. */
  onCancel: () => void;
  /** Reset to the default (DELETE the personal override + reload). */
  onReset: () => void;
  /** Toggle the Add-widget palette (edit mode only). */
  onTogglePalette: () => void;
  /** Whether the palette is open (drives the Add button's pressed state). */
  paletteOpen: boolean;
  /** ADMIN-only: promote the current board to the tenant default. Omit to hide. */
  onSetTenantDefault?: () => void;
  /** True while a save/reset/set-default write is in flight. */
  saving: boolean;
  /** Whether the working copy differs from what is loaded (enables Save). */
  dirty: boolean;
  /** Which tier the rendered board came from (shows a small "Customized" hint). */
  source: "user" | "tenant" | "system";
  /** Last successful data refresh, for the LiveStatus chip. */
  updatedAt?: number | string | Date | null;
  /** The last write error, if any, surfaced inline. */
  error?: Error;
}

export function DashboardToolbar({
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onReset,
  onTogglePalette,
  paletteOpen,
  onSetTenantDefault,
  saving,
  dirty,
  source,
  updatedAt,
  error,
}: DashboardToolbarProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {/* Left: live status + (when not editing) a quiet "customized" hint. */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LiveStatus updatedAt={updatedAt ?? null} />
          {!isEditing && source === "user" && (
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Customized layout</span>
          )}
        </div>

        {/* Right: the action set. */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {!isEditing ? (
            <Btn variant="soft" icon="grid" onClick={onEdit}>
              Customize
            </Btn>
          ) : (
            <>
              <Btn
                variant={paletteOpen ? "primary" : "soft"}
                icon="plus"
                onClick={onTogglePalette}
              >
                Add widget
              </Btn>
              <Btn variant="ghost" icon="logout" onClick={saving ? undefined : onReset} style={dim(saving)}>
                Reset to default
              </Btn>
              {onSetTenantDefault && (
                <Btn variant="ghost" icon="building" onClick={saving ? undefined : onSetTenantDefault} style={dim(saving)}>
                  Set as tenant default
                </Btn>
              )}
              <Btn variant="ghost" icon="x" onClick={saving ? undefined : onCancel} style={dim(saving)}>
                Cancel
              </Btn>
              <Btn
                variant="primary"
                icon="check"
                onClick={saving || !dirty ? undefined : onSave}
                style={dim(saving || !dirty)}
              >
                {saving ? "Saving..." : "Save"}
              </Btn>
            </>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginTop: 10,
            padding: "9px 12px",
            borderRadius: "var(--r)",
            border: "1px solid var(--danger, #ef4444)",
            background: "var(--danger-tint, rgba(239,68,68,0.08))",
            color: "var(--danger, #b91c1c)",
            fontSize: 12.5,
          }}
        >
          {error.message}
        </div>
      )}
    </div>
  );
}

export default DashboardToolbar;
