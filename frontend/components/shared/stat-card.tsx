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
    default: "border-slate-200 bg-white",
    success: "border-emerald-200 bg-emerald-50/50",
    warning: "border-amber-200 bg-amber-50/50",
    danger: "border-rose-200 bg-rose-50/50",
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border", size === "md" ? "p-4" : "p-3", variantStyles[variant], className)}>
      {icon && <div className="shrink-0 text-muted-foreground">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className={cn("text-muted-foreground truncate", size === "md" ? "text-xs" : "text-2xs")}>{label}</p>
        <div className="flex items-center gap-2">
          <p className={cn(size === "md" ? "text-2xl font-bold" : "text-base font-bold")}>{value}</p>
          {change !== undefined && (
            <span className={cn("flex items-center text-2xs font-medium", change > 0 ? "text-emerald-600" : change < 0 ? "text-rose-600" : "text-slate-500")}>
              {change > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : change < 0 ? <TrendingDown className="h-3 w-3 mr-0.5" /> : null}
              {change > 0 ? "+" : ""}{change}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
