"use client";
// Module G — shared Share & Export control. Drop it anywhere there is tabular
// data: it offers CSV / Excel / PDF / Word from a single ExportTable. The caller
// passes either a static table or a getter (resolved on click, so the latest
// in-view data is exported). Heavy format libs load lazily inside lib/export.
import * as React from "react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { exportTable, type ExportTable, type ExportFormat } from "@/lib/export";

const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: "csv", label: "CSV (.csv)" },
  { format: "xlsx", label: "Excel (.xlsx)" },
  { format: "pdf", label: "PDF (.pdf)" },
  { format: "docx", label: "Word (.docx)" },
];

export function ExportMenu({
  table,
  label = "Export",
  size = "sm",
  variant = "outline",
  disabled,
}: {
  table: ExportTable | (() => ExportTable | null | undefined);
  label?: string;
  size?: "sm" | "default";
  variant?: "outline" | "ghost" | "default" | "secondary";
  disabled?: boolean;
}) {
  const [busy, setBusy] = React.useState(false);
  const run = async (format: ExportFormat) => {
    const t = typeof table === "function" ? table() : table;
    if (!t || t.rows.length === 0) return;
    try {
      setBusy(true);
      await exportTable(format, t);
    } finally {
      setBusy(false);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant as any} size={size as any} disabled={disabled || busy} aria-label="Share and export">
          {busy ? "Exporting…" : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Share &amp; export</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {FORMATS.map((f) => (
          <DropdownMenuItem key={f.format} onSelect={() => void run(f.format)}>
            {f.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
