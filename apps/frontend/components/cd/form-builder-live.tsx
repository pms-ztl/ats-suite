"use client";
// components/cd/form-builder-live.tsx
// Wires the byte-exact FormBuilder (RequisitionBuilder) to the real application
// form schema. Loads GET /api/requisitions/:id/form, lets the tenant design the
// form (add / relabel / require / reorder fields, configure dropdown choices and
// file/image accepted types + max size), and persists via PUT /api/requisitions/
// :id/form. The public apply page renders exactly this schema. The system fields
// the candidate record needs (first name, last name, email, resume) are locked
// from removal so an application always has the essentials.
import { useEffect, useState } from "react";
import { FormBuilder } from "./RequisitionBuilder";
import { getApplicationForm, saveApplicationForm, type FormFieldDef } from "@/lib/api";
import type { FormBuilderData, FormField, FormPaletteItem } from "./types";

const LOCKED = new Set(["firstName", "lastName", "email", "resume"]);
const PALETTE: FormPaletteItem[] = [
  { type: "text", label: "Short text", icon: "type" },
  { type: "textarea", label: "Long text", icon: "fileText" },
  { type: "email", label: "Email", icon: "dot" },
  { type: "phone", label: "Phone", icon: "card" },
  { type: "url", label: "URL", icon: "arrowUpRight" },
  { type: "select", label: "Dropdown", icon: "chevD" },
  { type: "checkbox", label: "Yes / No", icon: "check" },
  { type: "file", label: "File upload", icon: "fileText" },
  { type: "image", label: "Image upload", icon: "swatch" },
];

function toCdField(f: FormFieldDef): FormField {
  return {
    id: f.id, type: f.type, label: f.label, required: Boolean(f.required), locked: LOCKED.has(f.id),
    order: f.order, placeholder: f.placeholder, helpText: f.helpText, options: f.options, fileTypes: f.fileTypes, maxSizeMb: f.maxSizeMb,
  };
}
function toServerField(f: FormField, i: number): FormFieldDef {
  return {
    id: f.id, type: f.type, label: f.label, required: Boolean(f.required), order: i,
    ...(f.placeholder ? { placeholder: f.placeholder } : {}),
    ...(f.helpText ? { helpText: f.helpText } : {}),
    ...(f.options && f.options.length ? { options: f.options } : {}),
    ...(f.fileTypes && f.fileTypes.length ? { fileTypes: f.fileTypes } : {}),
    ...(f.maxSizeMb ? { maxSizeMb: f.maxSizeMb } : {}),
  };
}

export function FormBuilderLive({ requisitionId, jobTitle, orgLine }: { requisitionId: string; jobTitle?: string; orgLine?: string }) {
  const [data, setData] = useState<FormBuilderData | null>(null);
  const [name] = useState("Application form");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    getApplicationForm(requisitionId).then((res) => {
      if (cancelled) return;
      const fields = (res.fields ?? []).map(toCdField).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setData({ fields, palette: PALETTE });
    });
    return () => { cancelled = true; };
  }, [requisitionId]);

  const save = async (fields: FormField[]) => {
    setState("saving");
    try {
      await saveApplicationForm(requisitionId, name, fields.map(toServerField));
      setState("saved");
      setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 2200);
    } catch { setState("error"); }
  };

  if (!data) return <div style={{ padding: 24, color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>Loading the application form...</div>;
  return <FormBuilder data={data} jobTitle={jobTitle} orgLine={orgLine} onPublish={save} publishState={state} />;
}
