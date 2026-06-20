"use client";
// components/cd/widgets/markdown-note-widget.tsx
// WF5 wrapper for the `markdown_note` widget — a source-LESS utility widget. It
// renders ONLY the user's own note text (config.markdown), so it reads no tenant
// data and is honest by construction. An empty note shows a neutral prompt, not a
// fabricated value. (Rendered as plain text with preserved whitespace; a full
// markdown renderer can be layered in later without touching the registry.)
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import { WidgetShell } from "./widget-shell";

export default function MarkdownNoteWidget({ title, config }: WidgetRenderProps) {
  const markdown = typeof config?.markdown === "string" ? config.markdown : "";

  return (
    <WidgetShell title={title ?? "Note"} icon="type">
      {markdown.trim() ? (
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--ink-1)",
          }}
        >
          {markdown}
        </div>
      ) : (
        <div style={{ height: "100%", minHeight: 60, display: "grid", placeItems: "center" }}>
          <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Add a note in this widget&apos;s settings.</span>
        </div>
      )}
    </WidgetShell>
  );
}
