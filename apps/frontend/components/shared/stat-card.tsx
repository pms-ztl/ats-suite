"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export function StatCard({ label, value, change, icon, variant = "default", size = "sm", className }: StatCardProps) {
  const variantStyles = {
    default: "border-line bg-white",
    success: "border-ok/40 bg-ok-tint/50",
    warning: "border-warn/40 bg-warn-tint/50",
    danger: "border-danger/40 bg-danger-tint/50",
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border", size === "md" ? "p-4" : "p-3", variantStyles[variant], className)}>
      {icon && <div className="shrink-0 text-muted-foreground">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className={cn("text-muted-foreground truncate", size === "md" ? "text-xs" : "text-2xs")}>{label}</p>
        <div className="flex items-center gap-2">
          <p className={cn(size === "md" ? "text-2xl font-bold" : "text-base font-bold")}>{value}</p>
          {change !== undefined && (
            <span className={cn("flex items-center text-2xs font-medium", change > 0 ? "text-ok" : change < 0 ? "text-danger" : "text-muted-foreground")}>
              {change > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : change < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : null}
              {change > 0 ? "+" : ""}{change}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
