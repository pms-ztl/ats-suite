"use client";

/**
 * Drag-drop form builder (Batch 4).
 *
 * Layout:
 *   ┌────────┬────────────────────────┬──────────┐
 *   │Palette │ Canvas (reorderable)   │ Config   │
 *   │ (left) │ Selected field bordered│ (right)  │
 *   └────────┴────────────────────────┴──────────┘
 *
 * Uses native HTML5 drag-drop (no extra deps). Drag from palette to canvas
 * appends; drag inside canvas reorders.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Type, AlignLeft, Mail, Phone, Hash, Link as LinkIcon, Calendar,
  ChevronDown, ListChecks, CircleDot, Square, Upload, Image as ImageIcon,
  GripVertical, Trash2, Plus,
} from "lucide-react";
import {
  type FormField, type FieldType, FIELD_PALETTE, newField,
} from "./form-types";

const ICONS: Record<string, React.ReactNode> = {
  Type: <Type className="h-4 w-4" />,
  AlignLeft: <AlignLeft className="h-4 w-4" />,
  Mail: <Mail className="h-4 w-4" />,
  Phone: <Phone className="h-4 w-4" />,
  Hash: <Hash className="h-4 w-4" />,
  Link: <LinkIcon className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  ChevronDown: <ChevronDown className="h-4 w-4" />,
  ListChecks: <ListChecks className="h-4 w-4" />,
  CircleDot: <CircleDot className="h-4 w-4" />,
  Square: <Square className="h-4 w-4" />,
  Upload: <Upload className="h-4 w-4" />,
  ImageIcon: <ImageIcon className="h-4 w-4" />,
};

interface FormBuilderProps {
  initialFields: FormField[];
  onChange: (fields: FormField[]) => void;
}

export function FormBuilder({ initialFields, onChange }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(
    [...initialFields].sort((a, b) => a.order - b.order)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const updateFields = (next: FormField[]) => {
    const normalized = next.map((f, i) => ({ ...f, order: i }));
    setFields(normalized);
    onChange(normalized);
  };

  const addFromPalette = (type: FieldType) => {
    const f = newField(type, fields.length);
    updateFields([...fields, f]);
    setSelectedId(f.id);
  };

  const updateField = (id: string, patch: Partial<FormField>) => {
    updateFields(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const deleteField = (id: string) => {
    updateFields(fields.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Drag-reorder within canvas
  const handleDragStart = (i: number) => setDraggedIndex(i);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (i: number) => {
    if (draggedIndex === null || draggedIndex === i) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(i, 0, moved);
    updateFields(reordered);
    setDraggedIndex(null);
  };

  const selected = fields.find((f) => f.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
      {/* ─── LEFT: Palette ─────────────────────────────────────────── */}
      <div className="col-span-2 border border-border rounded-lg p-3 overflow-y-auto bg-muted/20">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Add field</p>
        <div className="space-y-1">
          {FIELD_PALETTE.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => addFromPalette(type)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-accent hover:text-foreground text-muted-foreground transition-colors"
            >
              <span className="text-primary">{ICONS[icon]}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── CENTER: Canvas ────────────────────────────────────────── */}
      <div className="col-span-7 border border-border rounded-lg p-4 overflow-y-auto bg-card">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <Plus className="h-8 w-8 opacity-30" />
            <p className="text-sm">Click a field type on the left to add it here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((f, i) => (
              <div
                key={f.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(i)}
                onClick={() => setSelectedId(f.id)}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                  selectedId === f.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-border/80 bg-background"
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs uppercase tracking-wider text-primary font-semibold">{f.type}</span>
                    {f.required && <span className="text-2xs text-destructive">required</span>}
                  </div>
                  <p className="text-sm font-medium truncate">{f.label}</p>
                  {f.placeholder && <p className="text-xs text-muted-foreground truncate">{f.placeholder}</p>}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteField(f.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-danger transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── RIGHT: Config ─────────────────────────────────────────── */}
      <div className="col-span-3 border border-border rounded-lg p-4 overflow-y-auto bg-muted/20">
        {!selected ? (
          <p className="text-xs text-muted-foreground text-center py-8">Select a field to edit its properties</p>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Field properties</p>

            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                value={selected.label}
                onChange={(e) => updateField(selected.id, { label: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Field ID</Label>
              <Input
                value={selected.id}
                onChange={(e) => updateField(selected.id, { id: e.target.value.replace(/[^a-zA-Z0-9_]/g, "_") })}
                className="font-mono text-xs"
              />
              <p className="text-2xs text-muted-foreground">Used as the response key; lowercase + underscores recommended.</p>
            </div>

            <div className="flex items-center justify-between gap-2 py-1">
              <Label className="text-xs cursor-pointer" htmlFor="req">Required field</Label>
              <Switch
                id="req"
                checked={selected.required}
                onCheckedChange={(c) => updateField(selected.id, { required: c })}
              />
            </div>

            {(["text", "textarea", "email", "phone", "url", "number", "date"].includes(selected.type)) && (
              <div className="space-y-1.5">
                <Label className="text-xs">Placeholder</Label>
                <Input
                  value={selected.placeholder ?? ""}
                  onChange={(e) => updateField(selected.id, { placeholder: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Help text</Label>
              <Textarea
                value={selected.helpText ?? ""}
                onChange={(e) => updateField(selected.id, { helpText: e.target.value })}
                rows={2}
              />
            </div>

            {(["select", "multiselect", "radio", "checkbox"].includes(selected.type)) && (
              <div className="space-y-1.5">
                <Label className="text-xs">Options (one per line)</Label>
                <Textarea
                  value={(selected.options ?? []).join("\n")}
                  onChange={(e) =>
                    updateField(selected.id, {
                      options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  rows={5}
                  className="font-mono text-xs"
                />
              </div>
            )}

            {(["file", "image"].includes(selected.type)) && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Accepted file types</Label>
                  <Input
                    value={(selected.fileTypes ?? []).join(",")}
                    onChange={(e) =>
                      updateField(selected.id, {
                        fileTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder=".pdf, .docx"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max size (MB)</Label>
                  <Input
                    type="number"
                    min={1} max={50}
                    value={selected.maxSizeMb ?? 10}
                    onChange={(e) => updateField(selected.id, { maxSizeMb: Number(e.target.value) })}
                  />
                </div>
              </>
            )}

            {(["text", "textarea"].includes(selected.type)) && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Min length</Label>
                  <Input
                    type="number" min={0}
                    value={selected.minLength ?? ""}
                    onChange={(e) => updateField(selected.id, { minLength: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Max length</Label>
                  <Input
                    type="number" min={1}
                    value={selected.maxLength ?? ""}
                    onChange={(e) => updateField(selected.id, { maxLength: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteField(selected.id)}
              className="w-full gap-2 mt-4"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete field
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
