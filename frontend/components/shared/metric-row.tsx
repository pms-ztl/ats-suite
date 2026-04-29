import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface MetricRowProps {
  label: string;
  value: number;
  max: number;
  target?: number;
  format?: (v: number) => string;
  className?: string;
}

export function MetricRow({ label, value, max, target, format, className }: MetricRowProps) {
  const pct = Math.min(100, (value / max) * 100);
  const targetPct = target ? Math.min(100, (target / max) * 100) : undefined;
  const isAboveTarget = target ? value >= target : true;
  const displayValue = format ? format(value) : String(value);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold tabular-nums", isAboveTarget ? "text-foreground" : "text-rose-600")}>{displayValue}</span>
      </div>
      <div className="relative">
        <Progress value={pct} className={cn("h-2", !isAboveTarget && "[&>div]:bg-rose-500")} />
        {targetPct !== undefined && (
          <div className="absolute top-0 h-2 w-0.5 bg-slate-800" style={{ left: `${targetPct}%` }} title={`Target: ${target}`} />
        )}
      </div>
    </div>
  );
}
