// components/cd/wire-helpers.ts
// Small shared helpers for the CD live-data wrappers (initials, relative time,
// requisition-id -> title lookup). Pure functions; safe in client components.
import type { Requisition } from "@/lib/types";

export function initials(name: string): string {
  const p = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() : "?";
}

export function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

export function reqTitleMap(reqs?: Requisition[] | null): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of reqs ?? []) map[r.id] = r.title;
  return map;
}
