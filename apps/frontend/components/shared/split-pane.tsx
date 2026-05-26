"use client";

import { cn } from "@/lib/utils";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string;
  className?: string;
}

export function SplitPane({ left, right, leftWidth = "w-[360px]", className }: SplitPaneProps) {
  return (
    <div className={cn("flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] border rounded-lg overflow-hidden", className)}>
      <div className={cn("border-b lg:border-b-0 lg:border-r overflow-y-auto scrollbar-thin shrink-0 max-h-[300px] lg:max-h-none", leftWidth)}>{left}</div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">{right}</div>
    </div>
  );
}
