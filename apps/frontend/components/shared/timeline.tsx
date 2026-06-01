import { cn, formatDate } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
  type?: "info" | "success" | "warning" | "error";
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  const typeColors = {
    info: "bg-info",
    success: "bg-ok",
    warning: "bg-warn",
    error: "bg-danger",
  };

  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-3 pb-4 last:pb-0">
          <div className="flex flex-col items-center">
            <div className={cn("h-2 w-2 rounded-full mt-2 shrink-0", typeColors[event.type || "info"])} />
            {i < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium truncate">{event.action}</p>
              <time className="text-2xs text-muted-foreground font-mono whitespace-nowrap">{formatDate(event.timestamp, "MMM d, HH:mm")}</time>
            </div>
            <p className="text-2xs text-muted-foreground">{event.actor}</p>
            {event.details && <p className="text-sm text-muted-foreground mt-1">{event.details}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
