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
    complete: { bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />, text: "text-emerald-700" },
    active: { bg: "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-300", icon: <Clock className="h-4 w-4 text-indigo-600 animate-pulse" />, text: "text-indigo-700" },
    pending: { bg: "bg-slate-50 border-slate-200", icon: <Clock className="h-4 w-4 text-slate-400" />, text: "text-slate-500" },
    error: { bg: "bg-rose-50 border-rose-200", icon: <AlertTriangle className="h-4 w-4 text-rose-600" />, text: "text-rose-700" },
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
          {i < stages.length - 1 && <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />}
        </div>
      ))}
    </div>
  );
}
