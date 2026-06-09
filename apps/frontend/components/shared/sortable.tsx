"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight, design-preserving sortable-table primitives for the Aurora CSS-grid tables.
 * Pairs a `useTableSort` hook (sorts a rows array by a key) with a `<SortHead>` header button
 * that renders the triangle (asc up / desc down, dimmed when inactive) sort indicator.
 *
 * Usage:
 *   const { sorted, sort, toggle } = useTableSort(rows, { key: "score", dir: "desc" });
 *   // header cell (keep your existing grid wrapper + classes):
 *   <SortHead label="Score" sortKey="score" sort={sort} onSort={toggle} align="right" className={headerCellClasses} />
 *   // body: map over `sorted` instead of `rows`.
 */

export type SortDir = "asc" | "desc";
export interface SortState {
  key: string | null;
  dir: SortDir;
}

function getVal(obj: any, key: string): any {
  return key.split(".").reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

/** Natural comparison: numbers numerically, numeric-strings numerically, else locale string compare. Nulls sort last. */
function compareVals(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  const sa = String(a).trim();
  const sb = String(b).trim();
  const na = Number(sa);
  const nb = Number(sb);
  if (sa !== "" && sb !== "" && !Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: "base" });
}

export function useTableSort<T>(rows: T[], initial?: { key: string; dir?: SortDir }) {
  const [sort, setSort] = React.useState<SortState>({
    key: initial?.key ?? null,
    dir: initial?.dir ?? "asc",
  });

  const sorted = React.useMemo(() => {
    if (!sort.key) return rows;
    const key = sort.key;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => factor * compareVals(getVal(a, key), getVal(b, key)));
  }, [rows, sort.key, sort.dir]);

  const toggle = React.useCallback((key: string) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }, []);

  return { sorted, sort, toggle, setSort };
}

/** Stacked up/down triangles. `dir` highlights the active direction; null = neutral (both dimmed). */
export function SortTriangles({ dir, className }: { dir: SortDir | null; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex flex-col items-center justify-center leading-none -my-px shrink-0", className)}
    >
      <span className={cn("text-[7px] leading-[7px] transition-opacity", dir === "asc" ? "opacity-100" : "opacity-30")}>
        &#9650;
      </span>
      <span className={cn("text-[7px] leading-[7px] transition-opacity", dir === "desc" ? "opacity-100" : "opacity-30")}>
        &#9660;
      </span>
    </span>
  );
}

export interface SortHeadProps {
  label: React.ReactNode;
  sortKey: string;
  sort: SortState;
  onSort: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
  align?: "left" | "right" | "center";
}

/**
 * A clickable column header that toggles sorting and shows the triangle indicator.
 * Renders as a transparent, inheriting <button> so it slots into an existing grid header cell
 * without altering the Aurora layout - pass the cell's classes via `className`.
 */
export function SortHead({ label, sortKey, sort, onSort, className, style, align = "left" }: SortHeadProps) {
  const active = sort.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      title={`Sort by ${typeof label === "string" ? label : sortKey}`}
      style={{ font: "inherit", color: "inherit", letterSpacing: "inherit", textTransform: "inherit", ...style }}
      className={cn(
        "group inline-flex items-center gap-1 select-none cursor-pointer border-0 bg-transparent p-0 m-0 transition-opacity",
        align === "right" && "ml-auto flex-row-reverse",
        align === "center" && "justify-center",
        active ? "opacity-100" : "opacity-90 hover:opacity-100",
        className,
      )}
    >
      <span>{label}</span>
      <SortTriangles dir={active ? sort.dir : null} className={active ? "opacity-100" : "opacity-60 group-hover:opacity-90"} />
    </button>
  );
}
