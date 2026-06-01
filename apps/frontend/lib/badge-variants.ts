/**
 * Returns a consistent Tailwind className string for status badges
 * based on a semantic status value. Aurora semantic tints adapt to light + dark.
 */
export function statusBadgeClass(status: string): string {
  const s = status?.toLowerCase() ?? "";

  // Success / positive states
  if (["active", "completed", "approved", "passed", "hired", "verified", "operational", "resolved"].includes(s))
    return "bg-ok-tint text-ok";

  // Warning / pending states
  if (["pending", "review", "in progress", "in_progress", "screening", "interviewing", "expiring"].includes(s))
    return "bg-warn-tint text-warn";

  // Error / negative states
  if (["rejected", "failed", "revoked", "blocked", "expired", "denied", "inactive"].includes(s))
    return "bg-danger-tint text-danger";

  // Info / neutral states
  if (["offer", "offered", "new", "draft", "scheduled", "open"].includes(s))
    return "bg-info-tint text-info";

  // Default / unknown
  return "bg-muted text-muted-foreground";
}

/**
 * Returns a risk level badge class
 */
export function riskBadgeClass(risk: string): string {
  const r = risk?.toLowerCase() ?? "";
  if (r === "critical" || r === "high") return "bg-danger-tint text-danger";
  if (r === "medium") return "bg-warn-tint text-warn";
  if (r === "low") return "bg-ok-tint text-ok";
  return "bg-muted text-muted-foreground";
}
