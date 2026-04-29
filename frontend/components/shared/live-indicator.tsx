import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  status: "operational" | "degraded" | "outage";
  label?: string;
  className?: string;
}

export function LiveIndicator({ status, label, className }: LiveIndicatorProps) {
  const styles = {
    operational: { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500", defaultLabel: "Operational" },
    degraded: { bg: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500", defaultLabel: "Degraded" },
    outage: { bg: "bg-rose-50 border-rose-200 text-rose-700", dot: "bg-rose-500", defaultLabel: "Outage" },
  };
  const s = styles[status];

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-2xs font-medium", s.bg, className)}>
      <span className="relative flex h-2 w-2">
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", s.dot)} />
        <span className={cn("relative inline-flex rounded-full h-2 w-2", s.dot)} />
      </span>
      {label || s.defaultLabel}
    </div>
  );
}
