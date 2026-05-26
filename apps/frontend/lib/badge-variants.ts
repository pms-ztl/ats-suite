/**
 * Returns a consistent Tailwind className string for status badges
 * based on a semantic status value.
 */
export function statusBadgeClass(status: string): string {
  const s = status?.toLowerCase() ?? "";

  // Success / positive states
  if (["active", "completed", "approved", "passed", "hired", "verified", "operational", "resolved"].includes(s))
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";

  // Warning / pending states
  if (["pending", "review", "in progress", "in_progress", "screening", "interviewing", "expiring"].includes(s))
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";

  // Error / negative states
  if (["rejected", "failed", "revoked", "blocked", "expired", "denied", "inactive"].includes(s))
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";

  // Info / neutral states
  if (["offer", "offered", "new", "draft", "scheduled", "open"].includes(s))
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";

  // Default / unknown
  return "bg-muted text-muted-foreground";
}

/**
 * Returns a risk level badge class
 */
export function riskBadgeClass(risk: string): string {
  const r = risk?.toLowerCase() ?? "";
  if (r === "critical" || r === "high") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  if (r === "medium") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  if (r === "low") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  return "bg-muted text-muted-foreground";
}
