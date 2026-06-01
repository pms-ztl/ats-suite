import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  status: "operational" | "degraded" | "outage";
  label?: string;
  className?: string;
}

export function LiveIndicator({ status, label, className }: LiveIndicatorProps) {
  const styles = {
    operational: { bg: "bg-ok-tint border-ok/40 text-ok", dot: "bg-ok", defaultLabel: "Operational" },
    degraded: { bg: "bg-warn-tint border-warn/40 text-warn", dot: "bg-warn", defaultLabel: "Degraded" },
    outage: { bg: "bg-danger-tint border-danger/40 text-danger", dot: "bg-danger", defaultLabel: "Outage" },
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
