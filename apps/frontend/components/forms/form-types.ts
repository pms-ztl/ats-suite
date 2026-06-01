/**
 * Shared types for the form builder + renderer (Batch 4).
 * Mirrors backend FormField shape, keep in sync with
 * backend/src/lib/form-validator.ts.
 */
export type FieldType =
  | "text" | "textarea" | "email" | "phone" | "number" | "url"
  | "date" | "select" | "multiselect" | "radio" | "checkbox"
  | "file" | "image";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];        // select/multiselect/radio
  fileTypes?: string[];      // file/image
  maxSizeMb?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  order: number;
}

export const FIELD_PALETTE: { type: FieldType; label: string; icon: string }[] = [
  { type: "text",        label: "Short text",   icon: "Type" },
  { type: "textarea",    label: "Long text",    icon: "AlignLeft" },
  { type: "email",       label: "Email",        icon: "Mail" },
  { type: "phone",       label: "Phone",        icon: "Phone" },
  { type: "number",      label: "Number",       icon: "Hash" },
  { type: "url",         label: "URL",          icon: "Link" },
  { type: "date",        label: "Date",         icon: "Calendar" },
  { type: "select",      label: "Dropdown",     icon: "ChevronDown" },
  { type: "multiselect", label: "Multi-select", icon: "ListChecks" },
  { type: "radio",       label: "Radio",        icon: "CircleDot" },
  { type: "checkbox",    label: "Checkboxes",   icon: "Square" },
  { type: "file",        label: "File upload",  icon: "Upload" },
  { type: "image",       label: "Image upload", icon: "ImageIcon" },
];

export function newField(type: FieldType, order: number): FormField {
  const id = `field_${Math.random().toString(36).slice(2, 9)}`;
  const base: FormField = {
    id,
    type,
    label: `New ${type} field`,
    required: false,
    order,
  };
  if (type === "select" || type === "multiselect" || type === "radio" || type === "checkbox") {
    base.options = ["Option 1", "Option 2"];
  }
  if (type === "file" || type === "image") {
    base.fileTypes = type === "image" ? [".png", ".jpg", ".jpeg"] : [".pdf", ".doc", ".docx"];
    base.maxSizeMb = 10;
  }
  return base;
}
