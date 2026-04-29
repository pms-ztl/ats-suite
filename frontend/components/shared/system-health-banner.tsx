"use client";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type ServiceStatus = "operational" | "degraded" | "down";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
}

interface SystemHealthBannerProps {
  services: ServiceHealth[];
  className?: string;
}

const stripVariants: Record<ServiceStatus, string> = {
  operational: "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800",
  degraded: "bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
  down: "bg-rose-50/60 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800",
};

const dotVariants: Record<ServiceStatus, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  down: "bg-rose-500",
};

const StatusIcon = ({ status }: { status: ServiceStatus }) => {
  if (status === "operational") return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
  if (status === "degraded") return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
  return <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
};

export function SystemHealthBanner({ services, className }: SystemHealthBannerProps) {
  const overallStatus: ServiceStatus = services.some(s => s.status === "down")
    ? "down"
    : services.some(s => s.status === "degraded")
    ? "degraded"
    : "operational";

  const statusLabel = {
    operational: "All Systems Operational",
    degraded: "Partial Degradation",
    down: "Service Outage",
  }[overallStatus];

  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm",
      stripVariants[overallStatus],
      className
    )}>
      <div className="flex items-center gap-2">
        <span className={cn("relative flex h-2.5 w-2.5")}>
          <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotVariants[overallStatus])} />
          <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", dotVariants[overallStatus])} />
        </span>
        <StatusIcon status={overallStatus} />
        <span className="font-medium">{statusLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        {services.map(service => (
          <div key={service.name} className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", dotVariants[service.status])} />
            <span className="text-xs text-muted-foreground">{service.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
