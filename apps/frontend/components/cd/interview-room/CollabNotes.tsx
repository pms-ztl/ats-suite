"use client";
// Module D — collaborative interview notes. Tiptap bound to the shared Y.Doc's
// "notes" XML fragment, so the interviewer and candidate co-edit live. The plain
// text is surfaced via onText so the room can snapshot it for the PDF export.
import { useEffect } from "react";
import * as Y from "yjs";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";

export function CollabNotes({ doc, editable = true, onText }: { doc: Y.Doc; editable?: boolean; onText?: (text: string) => void }) {
  const editor = useEditor({
    editable,
    extensions: [
      // Collaboration brings its own (Yjs) history, so disable StarterKit's.
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: doc, field: "notes" }),
    ],
    editorProps: { attributes: { class: "cd-notes-editor", "aria-label": "Interview notes" } },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor || !onText) return;
    const handler = () => onText(editor.getText());
    editor.on("update", handler);
    return () => { editor.off("update", handler); };
  }, [editor, onText]);

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 12 }}>
      <EditorContent editor={editor} />
      <style jsx global>{`
        .cd-notes-editor { min-height: 240px; outline: none; font-size: 14px; line-height: 1.6; }
        .cd-notes-editor p { margin: 0 0 8px; }
        .cd-notes-editor:focus { outline: none; }
      `}</style>
    </div>
  );
}
