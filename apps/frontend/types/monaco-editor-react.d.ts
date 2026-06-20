// Ambient declaration for @monaco-editor/react.
//
// The package is a declared runtime dependency (see apps/frontend/package.json)
// and is installed for the real Next build, but the candidate code-runner loads
// it ONLY via next/dynamic on the assessment-take route, so it never enters the
// server bundle. This minimal shim lets `tsc --noEmit` resolve the module in
// environments where node_modules has not been hydrated yet (CI host check),
// declaring just the surface the runner uses (the default <Editor> component).
declare module "@monaco-editor/react" {
  import type * as React from "react";

  export interface EditorProps {
    height?: string | number;
    width?: string | number;
    /** Language id, e.g. "python", "javascript", "typescript", "java". */
    language?: string;
    /** Editor color theme, e.g. "vs-dark" / "light". */
    theme?: string;
    /** Controlled editor value. */
    value?: string;
    /** Initial (uncontrolled) value. */
    defaultValue?: string;
    /** Fired on every edit with the new full document text. */
    onChange?: (value: string | undefined) => void;
    /** Fired once the underlying Monaco instance has mounted. */
    onMount?: (editor: unknown, monaco: unknown) => void;
    /** Monaco IStandaloneEditorConstructionOptions (loosely typed here). */
    options?: Record<string, unknown>;
    /** Node shown while the editor chunk loads. */
    loading?: React.ReactNode;
    className?: string;
    keepCurrentModel?: boolean;
  }

  const Editor: React.ComponentType<EditorProps>;
  export default Editor;
}
