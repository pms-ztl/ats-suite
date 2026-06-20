"use client";
// components/dashboard/WidgetSettings.tsx
//
// SLICE F2 - the per-widget configuration form for dashboard edit mode.
//
// Generated entirely from the WF5 registry entry for the widget's type:
//   - TITLE     : free text (falls back to the catalog label).
//   - VIZ       : a choice limited to the entry's allowedViz list (the renderer
//                 only honors those variants). First entry is the default.
//   - SIZE      : the widget's w/h in grid units, clamped to the registry minW/
//                 minH so a cell can never be sized below what it renders.
//   - CONFIG    : a small, type-aware form for the entry's defaultConfig keys
//                 (numbers -> number input, strings -> text, booleans -> checkbox,
//                 with markdown_note's free-text body handled as a textarea). Only
//                 keys the catalog declares a default for are editable, so the
//                 form can never introduce an unknown config field.
//
// The form edits a DRAFT and commits the whole widget (+ its w/h, applied to
// every breakpoint layout) back through onApply, which the grid merges into the
// working document. Nothing is persisted here - Save on the toolbar PUTs the
// whole document.
//
// REAL DATA OR HONEST EMPTY ONLY: this form only adjusts presentation/config of a
// registered widget bound to a real source; it never changes WHICH source feeds a
// widget to something un-audited (the data source is fixed by the catalog entry).
import * as React from "react";
import type { DashboardWidget } from "@cdc-ats/contracts";
import { Icon } from "../cd/icon";
import { Btn } from "../cd/aurora-ui";
import { getCatalogEntry, type CatalogEntry } from "@/lib/widgets/registry";

const BREAKPOINT_KEYS = ["lg", "md", "sm", "xs", "xxs"] as const;
export type BreakpointKey = (typeof BREAKPOINT_KEYS)[number];

export interface WidgetSettingsResult {
  /** The updated widget definition (title / viz / config / minW / minH). */
  widget: DashboardWidget;
  /** The chosen footprint, applied to the widget's layout item in every
   *  breakpoint by the grid. */
  size: { w: number; h: number };
}

export interface WidgetSettingsProps {
  /** The widget being edited. */
  widget: DashboardWidget;
  /** The widget's current footprint (from the active breakpoint layout). */
  size: { w: number; h: number };
  /** Commit the edited widget + size. */
  onApply: (result: WidgetSettingsResult) => void;
  /** Discard and close. */
  onClose: () => void;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--ink-2)",
  marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  borderRadius: "var(--r)",
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--ink-1)",
};

// Render a single config field appropriate to the default value's type. Unknown/
// nested-object defaults (e.g. quick_actions' actions[]) are shown read-only with
// a note rather than guessed at - honest about what this simple form can edit.
function ConfigField({
  k,
  value,
  onChange,
}: {
  k: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  // markdown body -> textarea.
  if (k === "markdown" && (typeof value === "string" || value == null)) {
    return (
      <label style={{ display: "block", marginBottom: 12 }}>
        <span style={labelStyle}>Note text</span>
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono, monospace)" }}
        />
      </label>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}>{k}</span>
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <label style={{ display: "block", marginBottom: 12 }}>
        <span style={labelStyle}>{k}</span>
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          style={inputStyle}
        />
      </label>
    );
  }

  if (typeof value === "string") {
    return (
      <label style={{ display: "block", marginBottom: 12 }}>
        <span style={labelStyle}>{k}</span>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      </label>
    );
  }

  // Arrays / nested objects: not editable in this simple form. Shown honestly.
  return (
    <div style={{ marginBottom: 12 }}>
      <span style={labelStyle}>{k}</span>
      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
        Configured in the widget itself.
      </span>
    </div>
  );
}

export function WidgetSettings({ widget, size, onApply, onClose }: WidgetSettingsProps) {
  const entry: CatalogEntry | undefined = getCatalogEntry(widget.type);

  // Draft state seeded from the widget. Config merges the catalog default so any
  // newly added catalog key surfaces with its default value.
  const [title, setTitle] = React.useState<string>(widget.title ?? entry?.label ?? "");
  const [viz, setViz] = React.useState<string>(widget.viz ?? entry?.allowedViz[0] ?? "");
  const [w, setW] = React.useState<number>(size.w);
  const [h, setH] = React.useState<number>(size.h);
  const [config, setConfig] = React.useState<Record<string, unknown>>({
    ...(entry?.defaultConfig ?? {}),
    ...(widget.config ?? {}),
  });

  const minW = entry?.defaultSize.minW ?? widget.minW ?? 2;
  const minH = entry?.defaultSize.minH ?? widget.minH ?? 2;
  const allowedViz = entry?.allowedViz ?? (viz ? [viz] : []);
  // Only expose config keys the catalog declares a default for (so the form can
  // never introduce an unknown field). markdown_note/quick_actions included.
  const configKeys = Object.keys(entry?.defaultConfig ?? {});

  const clampW = (n: number) => Math.max(minW, Math.min(12, Math.round(n)));
  const clampH = (n: number) => Math.max(minH, Math.min(24, Math.round(n)));

  const apply = () => {
    onApply({
      widget: {
        ...widget,
        title: title.trim() || (entry?.label ?? widget.type),
        viz: viz || widget.viz,
        config,
        minW,
        minH,
      },
      size: { w: clampW(w), h: clampH(h) },
    });
  };

  return (
    <div
      role="dialog"
      aria-label="Widget settings"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-xl)",
        boxShadow: "var(--e2, var(--e1))",
        padding: 18,
        marginBottom: 16,
        maxWidth: 520,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: "var(--fs-md)" }}>
          <Icon name="settings" size={16} style={{ color: "var(--ink-3)" }} />
          {entry?.label ?? widget.type} settings
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

      {/* Title */}
      <label style={{ display: "block", marginBottom: 12 }}>
        <span style={labelStyle}>Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={entry?.label ?? widget.type}
          style={inputStyle}
        />
      </label>

      {/* Visualization (only when the entry offers more than one). */}
      {allowedViz.length > 1 && (
        <label style={{ display: "block", marginBottom: 12 }}>
          <span style={labelStyle}>Visualization</span>
          <select value={viz} onChange={(e) => setViz(e.target.value)} style={inputStyle}>
            {allowedViz.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Size (grid units, clamped to the widget's minimums). */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Width (cols, min {minW})</span>
          <input
            type="number"
            min={minW}
            max={12}
            value={w}
            onChange={(e) => setW(Number(e.target.value))}
            onBlur={() => setW((v) => clampW(v))}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Height (rows, min {minH})</span>
          <input
            type="number"
            min={minH}
            max={24}
            value={h}
            onChange={(e) => setH(Number(e.target.value))}
            onBlur={() => setH((v) => clampH(v))}
            style={inputStyle}
          />
        </label>
      </div>

      {/* Config (type-aware, only catalog-declared keys). */}
      {configKeys.length > 0 && (
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12, marginTop: 4 }}>
          {configKeys.map((k) => (
            <ConfigField
              key={k}
              k={k}
              value={config[k]}
              onChange={(v) => setConfig((c) => ({ ...c, [k]: v }))}
            />
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn variant="primary" icon="check" onClick={apply}>
          Apply
        </Btn>
      </div>
    </div>
  );
}

export default WidgetSettings;
