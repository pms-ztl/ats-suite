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
  operational: "bg-ok-tint/60 border-ok/40",
  degraded: "bg-warn-tint/60 border-warn/40",
  down: "bg-danger-tint/60 border-danger/40",
};

const dotVariants: Record<ServiceStatus, string> = {
  operational: "bg-ok",
  degraded: "bg-warn",
  down: "bg-danger",
};

const StatusIcon = ({ status }: { status: ServiceStatus }) => {
  if (status === "operational") return <CheckCircle2 className="h-4 w-4 text-ok dark:text-ok" />;
  if (status === "degraded") return <AlertTriangle className="h-4 w-4 text-warn dark:text-warn" />;
  return <XCircle className="h-4 w-4 text-danger dark:text-danger" />;
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
