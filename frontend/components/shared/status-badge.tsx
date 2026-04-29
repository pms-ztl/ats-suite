import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  const colors = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.active;
  const displayLabel = status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-semibold", colors.bg, colors.text, className)}>
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />}
      {displayLabel}
    </span>
  );
}
