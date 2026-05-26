"use client";

/**
 * Notification dropdown — clicked from the dashboard bell icon.
 * Shows the 10 most recent unread, lets the user mark individual / all read,
 * and links to the full /notifications inbox.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Bell, CheckCheck, Crown, Sparkles, Building2, AlertCircle,
  Calendar, Upload, Wifi, WifiOff, Inbox,
} from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/use-notifications";

const TYPE_META: Record<string, { icon: React.ReactNode; tint: string }> = {
  PLAN_CHANGE_REQUESTED:  { icon: <Crown className="h-4 w-4" />,    tint: "text-violet-500 bg-violet-500/10" },
  PLAN_CHANGE_APPROVED:   { icon: <Sparkles className="h-4 w-4" />, tint: "text-emerald-500 bg-emerald-500/10" },
  PLAN_CHANGE_REJECTED:   { icon: <AlertCircle className="h-4 w-4" />, tint: "text-amber-500 bg-amber-500/10" },
  NEW_TENANT_SIGNUP:      { icon: <Building2 className="h-4 w-4" />, tint: "text-blue-500 bg-blue-500/10" },
  BULK_UPLOAD_COMPLETED:  { icon: <Upload className="h-4 w-4" />, tint: "text-emerald-500 bg-emerald-500/10" },
  SEAT_LIMIT_REACHED:     { icon: <AlertCircle className="h-4 w-4" />, tint: "text-amber-500 bg-amber-500/10" },
  INTERVIEW_FEEDBACK_NEW: { icon: <Calendar className="h-4 w-4" />, tint: "text-blue-500 bg-blue-500/10" },
  SYSTEM:                 { icon: <Bell className="h-4 w-4" />,    tint: "text-muted-foreground bg-muted" },
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface NotificationRowProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationRow({ notification: n, onClick }: NotificationRowProps) {
  const meta = TYPE_META[n.type] ?? TYPE_META.SYSTEM;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3",
        n.readAt ? "hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10"
      )}
    >
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", meta.tint)}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-tight", !n.readAt && "font-semibold")}>{n.title}</p>
        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
        <p className="text-2xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
      </div>
      {!n.readAt && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" aria-label="unread" />}
    </button>
  );
}

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllRead, streamMode } = useNotifications();
  const router = useRouter();

  const handleClick = (n: Notification) => {
    if (!n.readAt) markAsRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label="View notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center tabular-nums">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {streamMode === "sse" && (
              <span title="Real-time SSE connected" className="text-emerald-500">
                <Wifi className="h-3 w-3" />
              </span>
            )}
            {streamMode === "polling" && (
              <span title="Polling (SSE unavailable)" className="text-amber-500">
                <WifiOff className="h-3 w-3" />
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="h-[400px]">
          <div className="p-1 space-y-0.5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                <Inbox className="h-8 w-8 opacity-50" />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.slice(0, 12).map((n) => (
                <NotificationRow key={n.id} notification={n} onClick={() => handleClick(n)} />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border/60">
          <Link
            href="/notifications"
            className="block w-full text-center text-xs py-2.5 text-primary hover:bg-muted/50 transition-colors"
          >
            View all notifications →
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
