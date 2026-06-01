import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  value: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ConfidenceMeter({ value, showLabel = true, size = "md", className }: ConfidenceMeterProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const percentage = Math.round(clamped * 100);
  // AI confidence carries the violet AI accent; below the 0.70 auto-advance
  // threshold it flips to warn (human verification recommended).
  const low = percentage < 70;
  const color = low ? "bg-warn" : "bg-ai";
  const textColor = low ? "text-warn" : "text-ai-ink";
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex-1 bg-muted rounded-full overflow-hidden", heights[size])}>
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && <span className={cn("text-2xs font-semibold tabular-nums", textColor)}>{percentage}%</span>}
    </div>
  );
}
