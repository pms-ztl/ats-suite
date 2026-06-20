"use client";
// components/cd/widgets/quick-actions-widget.tsx
// WF5 wrapper for the `quick_actions` widget — a source-LESS utility widget. It
// renders ONLY the navigational shortcuts the user configures (config.actions:
// { label, href, icon? }[]), so it reads no tenant data. An empty config shows a
// neutral prompt, never a fabricated action.
import * as React from "react";
import Link from "next/link";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import { Icon, type IconName } from "@/components/cd/icon";
import { WidgetShell } from "./widget-shell";

type QuickAction = { label: string; href: string; icon?: IconName };

function readActions(config?: Record<string, unknown>): QuickAction[] {
  const raw = config?.actions;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (a): a is QuickAction =>
        !!a &&
        typeof a === "object" &&
        typeof (a as QuickAction).label === "string" &&
        typeof (a as QuickAction).href === "string",
    )
    .map((a) => ({ label: a.label, href: a.href, icon: a.icon }));
}

export default function QuickActionsWidget({ title, config }: WidgetRenderProps) {
  const actions = readActions(config);

  return (
    <WidgetShell title={title ?? "Quick actions"} icon="listChecks">
      {actions.length === 0 ? (
        <div style={{ height: "100%", minHeight: 60, display: "grid", placeItems: "center" }}>
          <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Add shortcuts in this widget&apos;s settings.</span>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {actions.map((a, i) => (
            <Link
              key={`${a.href}-${i}`}
              href={a.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: "var(--r)",
                border: "1px solid var(--line)",
                background: "var(--surface-2)",
                color: "var(--ink-1)",
                fontSize: 12.5,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {a.icon && <Icon name={a.icon} size={15} />}
              {a.label}
            </Link>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
