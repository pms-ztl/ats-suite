/**
 * Formats a date string or Date object consistently across the app.
 * Returns "—" for null/undefined/invalid dates.
 */
export function formatDate(value: string | Date | null | undefined, opts?: {
  includeTime?: boolean;
  relative?: boolean;
}): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "—";

  if (opts?.relative) {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  const fmt: Intl.DateTimeFormatOptions = opts?.includeTime
    ? { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    : { year: "numeric", month: "short", day: "numeric" };

  return new Intl.DateTimeFormat("en-US", fmt).format(date);
}
