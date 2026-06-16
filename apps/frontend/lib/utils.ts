import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt: string = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateId(prefix: string = "ID"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
}

export function getInitials(name: string): string {
  if (!name) return "";
  return name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return "text-success";
  if (confidence >= 0.7) return "text-warning";
  return "text-danger";
}

export function getConfidenceBg(confidence: number): string {
  if (confidence >= 0.9) return "bg-ok-tint text-ok";
  if (confidence >= 0.7) return "bg-warn-tint text-warn";
  return "bg-danger-tint text-danger";
}

export function getTrendIcon(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

export function getTrendColor(value: number, inverseIsGood: boolean = false): string {
  const isPositive = inverseIsGood ? value < 0 : value > 0;
  if (isPositive) return "text-ok";
  if (value === 0) return "text-muted-foreground";
  return "text-danger";
}

// ---- Title-case / enum humanization (for table field VALUES) ----
const TC_ACRONYMS = new Set([
  "ai", "id", "ip", "hr", "ats", "mrr", "arr", "sla", "kpi", "url", "api", "csv", "pdf",
  "sso", "saml", "oidc", "sms", "mfa", "gdpr", "ccpa", "eeoc", "ofccp", "us", "uk", "eu",
  "de", "p50", "p90", "p95", "p99", "cv", "ui", "ux", "ok", "faq", "dsr", "dpa", "soc",
]);
const TC_SMALL = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "per", "the", "to", "vs", "via", "with",
]);

/**
 * Convert a raw enum/snake/kebab/camel/SCREAMING value to Title Case for display.
 *   "in_progress" -> "In Progress", "PENDING_APPROVAL" -> "Pending Approval",
 *   "over-budget" -> "Over Budget", "aiScore" -> "AI Score", "ENTERPRISE" -> "Enterprise".
 * Use for status/stage/result/plan/priority/severity/health/type values - NOT names, emails, IDs, or currency.
 */
export function toTitleCase(input: string | null | undefined): string {
  if (input == null) return "";
  const raw = String(input).trim();
  if (!raw) return "";
  const words = raw
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  return words
    .map((w, i) => {
      const lower = w.toLowerCase();
      if (TC_ACRONYMS.has(lower)) return lower.toUpperCase();
      if (i > 0 && i < words.length - 1 && TC_SMALL.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/** Alias for clarity at call sites that format a status/enum pill. Empty string for nullish so callers can fall back. */
export function humanizeStatus(value: string | null | undefined): string {
  return toTitleCase(value);
}
