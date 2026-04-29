"use client";

import { useId } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, ReferenceDot, ResponsiveContainer, YAxis } from "recharts";

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  sparklineData?: number[];
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function KPICard({ label, value, change, changeLabel, sparklineData, icon, className, onClick }: KPICardProps) {
  const gradientId = useId().replace(/:/g, "_");
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card className={cn("cursor-default hover:shadow-md transition-shadow", onClick && "cursor-pointer", className)} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight mt-1 text-foreground">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {isPositive && <TrendingUp className="h-3 w-3 text-emerald-600" />}
                {isNegative && <TrendingDown className="h-3 w-3 text-red-600" />}
                {!isPositive && !isNegative && <Minus className="h-3 w-3 text-slate-500" />}
                <span className={cn("text-xs font-medium", isPositive ? "text-emerald-600" : isNegative ? "text-red-600" : "text-slate-500")}>
                  {isPositive ? "+" : ""}{change}%
                </span>
                {changeLabel && <span className="text-xs text-muted-foreground">{changeLabel}</span>}
              </div>
            )}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-10 mt-3 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData.map((v, i) => ({ i, v }))}>
                <defs>
                  <linearGradient id={`spark_${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                <Area type="monotone" dataKey="v" stroke="#4F46E5" strokeWidth={1.5} fill={`url(#spark_${gradientId})`} dot={false} />
                <ReferenceDot
                  x={sparklineData.length - 1}
                  y={sparklineData[sparklineData.length - 1]}
                  r={3}
                  fill="#4F46E5"
                  stroke="white"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
