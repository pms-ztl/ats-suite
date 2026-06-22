"use client";
// Module D — collaborative code panel. Monaco bound to the shared Y.Doc's "code"
// text via y-monaco, so code typed in the technical round syncs in real time and
// is captured into the interview record. Loaded client-only (Monaco has no SSR).
import { useRef } from "react";
import * as Y from "yjs";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";

const LANGS = ["typescript", "javascript", "python", "java", "go", "c", "cpp", "csharp", "rust", "sql", "plaintext"];

export function CollabCode({
  doc, language, onLanguageChange, onText,
}: {
  doc: Y.Doc;
  language: string;
  onLanguageChange?: (lang: string) => void;
  onText?: (text: string) => void;
}) {
  const bindingRef = useRef<MonacoBinding | null>(null);

  const onMount = (editor: any) => {
    const model = editor.getModel();
    if (!model) return;
    const yText = doc.getText("code");
    bindingRef.current = new MonacoBinding(yText, model, new Set([editor]));
    if (onText) {
      yText.observe(() => onText(yText.toString()));
      onText(yText.toString());
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderBottom: "1px solid var(--line, #2a2a2a)" }}>
        <span style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: ".06em" }}>Language</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange?.(e.target.value)}
          style={{ background: "transparent", color: "inherit", border: "1px solid var(--line, #2a2a2a)", borderRadius: 6, padding: "3px 8px", fontSize: 12 }}
        >
          {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          onMount={onMount}
          options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, automaticLayout: true }}
        />
      </div>
    </div>
  );
}
