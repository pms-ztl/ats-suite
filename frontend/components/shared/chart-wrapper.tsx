"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  timeRanges?: string[];
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
  height?: number;
}

export function ChartWrapper({ title, description, children, className, timeRanges, selectedRange, onRangeChange, height = 300 }: ChartWrapperProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && <p className="text-2xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {timeRanges && onRangeChange && (
          <Select value={selectedRange} onValueChange={onRangeChange}>
            <SelectTrigger className="w-[120px] h-7 text-2xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {timeRanges.map(r => <SelectItem key={r} value={r} className="text-2xs">{r}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div style={{ height }}>{children}</div>
      </CardContent>
    </Card>
  );
}
