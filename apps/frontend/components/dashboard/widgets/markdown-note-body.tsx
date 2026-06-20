"use client";
// components/dashboard/widgets/markdown-note-body.tsx
// WF5 BODY for the `markdown_note` widget - a source-LESS utility widget. It reads
// NO tenant data (the frame's `state` is ignored), rendering ONLY the user's own
// note text (config.markdown), so it is honest by construction. An empty note shows
// a neutral prompt, never a fabricated value. (Plain text with preserved
// whitespace; a full markdown renderer can be layered in later without touching the
// registry or the frame.)
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";

export default function MarkdownNoteBody({ config }: WidgetBodyProps) {
  const markdown = typeof config?.markdown === "string" ? config.markdown : "";

  if (!markdown.trim()) {
    return (
      <div style={{ height: "100%", minHeight: 60, display: "grid", placeItems: "center" }}>
        <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Add a note in this widget&apos;s settings.</span>
      </div>
    );
  }

  return (
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
  );
}
