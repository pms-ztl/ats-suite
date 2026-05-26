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

  // Emerald accent across the brand
  const SPARK_COLOR = "hsl(160 84% 39%)";
  return (
    <Card
      className={cn(
        "glass-hover gradient-card relative overflow-hidden",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-4xl font-bold tracking-tight mt-2 text-foreground tabular-nums">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
                {!isPositive && !isNegative && <Minus className="h-3 w-3 text-muted-foreground" />}
                <span className={cn("text-xs font-semibold", isPositive ? "text-emerald-500" : isNegative ? "text-red-500" : "text-muted-foreground")}>
                  {isPositive ? "+" : ""}{change}%
                </span>
                {changeLabel && <span className="text-xs text-muted-foreground">{changeLabel}</span>}
              </div>
            )}
            {change === undefined && changeLabel && (
              <p className="text-xs text-muted-foreground mt-2">{changeLabel}</p>
            )}
          </div>
          {icon && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-2 text-primary shrink-0">
              {icon}
            </div>
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-10 mt-3 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData.map((v, i) => ({ i, v }))}>
                <defs>
                  <linearGradient id={`spark_${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SPARK_COLOR} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={SPARK_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                <Area type="monotone" dataKey="v" stroke={SPARK_COLOR} strokeWidth={2} fill={`url(#spark_${gradientId})`} dot={false} />
                <ReferenceDot
                  x={sparklineData.length - 1}
                  y={sparklineData[sparklineData.length - 1]}
                  r={3}
                  fill={SPARK_COLOR}
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
