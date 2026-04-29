import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} />;
}

export function KPICardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Shimmer className="h-3 w-24 mb-3" />
        <Shimmer className="h-10 w-20 mb-2" />
        <Shimmer className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 py-2 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Shimmer key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading..." className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Shimmer className="h-7 w-48 mb-2" />
          <Shimmer className="h-4 w-72" />
        </div>
        <Shimmer className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
      </div>
      <Card>
        <CardHeader><Shimmer className="h-5 w-32" /></CardHeader>
        <CardContent><TableSkeleton /></CardContent>
      </Card>
    </div>
  );
}
