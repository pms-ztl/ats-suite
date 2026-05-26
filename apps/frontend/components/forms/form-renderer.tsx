"use client";

/**
 * Dynamic form renderer (Batch 4).
 * Takes a schema (array of FormField) and renders the form. State is local;
 * onSubmit receives (values, files) where files is a Map of fieldId → File.
 *
 * Used by:
 *   - Candidate-portal apply page (real candidates submitting)
 *   - Form builder Preview tab (recruiter testing their design)
 */
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Upload, FileText, X } from "lucide-react";
import type { FormField } from "./form-types";

interface FormRendererProps {
  fields: FormField[];
  /** Called with { values, files, errors? } */
  onSubmit: (values: Record<string, any>, files: Map<string, File>) => void | Promise<void>;
  submitting?: boolean;
  /** Submit button label */
  submitLabel?: string;
  /** Disable submit button + all fields */
  disabled?: boolean;
  /** Initial values (e.g. for re-submit) */
  initialValues?: Record<string, any>;
  /** Server-side errors keyed by field id */
  serverErrors?: Record<string, string>;
}

export function FormRenderer({
  fields,
  onSubmit,
  submitting = false,
  submitLabel = "Submit Application",
  disabled = false,
  initialValues = {},
  serverErrors = {},
}: FormRendererProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [files, setFiles] = useState<Map<string, File>>(new Map());
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const handle = (id: string, val: any) => {
    setValues((prev) => ({ ...prev, [id]: val }));
    setClientErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleFile = (id: string, file: File | null) => {
    setFiles((prev) => {
      const next = new Map(prev);
      if (file) next.set(id, file);
      else next.delete(id);
      return next;
    });
    handle(id, file?.name ?? "");
  };

  const validateClient = (): boolean => {
    const errs: Record<string, string> = {};
    for (const f of sortedFields) {
      if (f.required) {
        const v = values[f.id];
        const hasFile = files.has(f.id);
        if ((f.type === "file" || f.type === "image") ? !hasFile : (v === undefined || v === null || v === "")) {
          errs[f.id] = `${f.label} is required.`;
        }
      }
    }
    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateClient()) return;
    await onSubmit(values, files);
  };

  const allErrors = { ...clientErrors, ...serverErrors };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {sortedFields.map((field) => {
        const err = allErrors[field.id];
        return (
          <div key={field.id} className="space-y-1.5">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {/* Field input */}
            {field.type === "text" && (
              <Input
                id={field.id}
                disabled={disabled || submitting}
                placeholder={field.placeholder}
                value={values[field.id] ?? ""}
                onChange={(e) => handle(field.id, e.target.value)}
                className={cn(err && "border-destructive")}
                maxLength={field.maxLength}
              />
            )}
            {field.type === "textarea" && (
              <Textarea
                id={field.id}
                disabled={disabled || submitting}
                placeholder={field.placeholder}
                value={values[field.id] ?? ""}
                onChange={(e) => handle(field.id, e.target.value)}
                className={cn(err && "border-destructive")}
                rows={4}
                maxLength={field.maxLength}
              />
            )}
            {(field.type === "email" || field.type === "phone" || field.type === "url" || field.type === "number") && (
              <Input
                id={field.id}
                type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                inputMode={field.type === "phone" ? "tel" : field.type === "number" ? "numeric" : undefined}
                disabled={disabled || submitting}
                placeholder={field.placeholder}
                value={values[field.id] ?? ""}
                onChange={(e) => handle(field.id, e.target.value)}
                className={cn(err && "border-destructive")}
              />
            )}
            {field.type === "date" && (
              <Input
                id={field.id}
                type="date"
                disabled={disabled || submitting}
                value={values[field.id] ?? ""}
                onChange={(e) => handle(field.id, e.target.value)}
                className={cn(err && "border-destructive")}
              />
            )}
            {field.type === "select" && (
              <Select value={values[field.id] ?? ""} onValueChange={(v) => handle(field.id, v)} disabled={disabled || submitting}>
                <SelectTrigger className={cn(err && "border-destructive")}>
                  <SelectValue placeholder={field.placeholder ?? "Select…"} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {(field.type === "multiselect" || field.type === "checkbox") && (
              <div className="space-y-1.5">
                {(field.options ?? []).map((opt) => {
                  const checked = Array.isArray(values[field.id]) && values[field.id].includes(opt);
                  return (
                    <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={checked}
                        disabled={disabled || submitting}
                        onCheckedChange={(c) => {
                          const cur = Array.isArray(values[field.id]) ? [...values[field.id]] : [];
                          if (c) cur.push(opt);
                          else cur.splice(cur.indexOf(opt), 1);
                          handle(field.id, cur);
                        }}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            )}
            {field.type === "radio" && (
              <div className="space-y-1.5">
                {(field.options ?? []).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={field.id}
                      value={opt}
                      checked={values[field.id] === opt}
                      disabled={disabled || submitting}
                      onChange={(e) => handle(field.id, e.target.value)}
                      className="h-4 w-4 accent-primary"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {(field.type === "file" || field.type === "image") && (
              <FileUploader
                field={field}
                file={files.get(field.id) ?? null}
                onChange={(f) => handleFile(field.id, f)}
                disabled={disabled || submitting}
                error={!!err}
              />
            )}

            {field.helpText && !err && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
            {err && <p className="text-xs text-destructive">{err}</p>}
          </div>
        );
      })}

      <Button type="submit" disabled={disabled || submitting} className="w-full glow-primary h-10 font-semibold">
        {submitting ? "Submitting…" : submitLabel}
      </Button>
    </form>
  );
}

// ─── File uploader sub-component ─────────────────────────────────────────────
function FileUploader({
  field, file, onChange, disabled, error,
}: {
  field: FormField;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled: boolean;
  error: boolean;
}) {
  return (
    <div>
      {file ? (
        <div className={cn(
          "flex items-center gap-3 rounded-lg border p-3",
          error ? "border-destructive" : "border-border bg-muted/30"
        )}>
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm truncate flex-1">{file.name}</span>
          <button type="button" onClick={() => onChange(null)} className="text-muted-foreground hover:text-rose-500" disabled={disabled}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex items-center gap-3 rounded-lg border-2 border-dashed p-4 cursor-pointer hover:bg-muted/30 transition-colors",
            error ? "border-destructive" : "border-border"
          )}
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Click to upload</p>
            <p className="text-2xs text-muted-foreground">
              {(field.fileTypes ?? []).join(", ")} · max {field.maxSizeMb ?? 10}MB
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            disabled={disabled}
            accept={(field.fileTypes ?? []).join(",")}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (field.maxSizeMb && f.size > field.maxSizeMb * 1024 * 1024) {
                alert(`File too large. Max ${field.maxSizeMb}MB.`);
                return;
              }
              onChange(f);
            }}
          />
        </label>
      )}
    </div>
  );
}
