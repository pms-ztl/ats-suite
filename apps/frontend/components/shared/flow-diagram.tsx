"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface FlowStage {
  name: string;
  value?: string | number;
  status: "complete" | "active" | "pending" | "error";
  subtitle?: string;
}

interface FlowDiagramProps {
  stages: FlowStage[];
  className?: string;
}

export function FlowDiagram({ stages, className }: FlowDiagramProps) {
  const statusStyles = {
    complete: { bg: "bg-ok-tint border-ok/40", icon: <CheckCircle2 className="h-4 w-4 text-ok" />, text: "text-ok" },
    active: { bg: "bg-info-tint border-info/40 ring-2 ring-indigo-300", icon: <Clock className="h-4 w-4 text-info animate-pulse" />, text: "text-info" },
    pending: { bg: "bg-muted/40 border-border", icon: <Clock className="h-4 w-4 text-muted-foreground" />, text: "text-muted-foreground" },
    error: { bg: "bg-danger-tint border-danger/40", icon: <AlertTriangle className="h-4 w-4 text-danger" />, text: "text-danger" },
  };

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-2", className)}>
      {stages.map((stage, i) => (
        <div key={stage.name} className="flex items-center gap-2 shrink-0">
          <div className={cn("flex flex-col items-center gap-1.5 p-3 rounded-lg border min-w-[120px]", statusStyles[stage.status].bg)}>
            {statusStyles[stage.status].icon}
            <span className={cn("text-xs font-semibold", statusStyles[stage.status].text)}>{stage.name}</span>
            {stage.value !== undefined && (
              <span className="text-lg font-bold text-foreground">{stage.value}</span>
            )}
            {stage.subtitle && (
              <span className="text-2xs text-muted-foreground">{stage.subtitle}</span>
            )}
          </div>
          {i < stages.length - 1 && <ArrowRight className="h-4 w-4 text-ink-3 shrink-0" />}
        </div>
      ))}
    </div>
  );
}
