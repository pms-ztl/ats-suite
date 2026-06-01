"use client";

/**
 * Full notification inbox (Batch 3, rewritten to use real /api/notifications).
 */
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import {
  Bell, CheckCircle, AlertCircle, Crown, Sparkles, Building2,
  Upload, Calendar, Inbox, CheckCheck, Wifi, WifiOff,
} from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/use-notifications";

const TYPE_META: Record<string, { icon: React.ReactNode; tint: string }> = {
  PLAN_CHANGE_REQUESTED:  { icon: <Crown className="h-4 w-4" />,    tint: "text-ai-ink bg-ai/10" },
  PLAN_CHANGE_APPROVED:   { icon: <Sparkles className="h-4 w-4" />, tint: "text-ok bg-ok/10" },
  PLAN_CHANGE_REJECTED:   { icon: <AlertCircle className="h-4 w-4" />, tint: "text-warn bg-warn/10" },
  NEW_TENANT_SIGNUP:      { icon: <Building2 className="h-4 w-4" />, tint: "text-info bg-info/10" },
  BULK_UPLOAD_COMPLETED:  { icon: <Upload className="h-4 w-4" />, tint: "text-ok bg-ok/10" },
  SEAT_LIMIT_REACHED:     { icon: <AlertCircle className="h-4 w-4" />, tint: "text-warn bg-warn/10" },
  INTERVIEW_FEEDBACK_NEW: { icon: <Calendar className="h-4 w-4" />, tint: "text-info bg-info/10" },
  SYSTEM:                 { icon: <Bell className="h-4 w-4" />,    tint: "text-muted-foreground bg-muted" },
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllRead, streamMode } = useNotifications();

  const all = notifications;
  const unread = notifications.filter((n) => !n.readAt);
  const read = notifications.filter((n) => n.readAt);

  const handleClick = (n: Notification) => {
    if (!n.readAt) markAsRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="All your alerts in one place"
        breadcrumbs={[{ label: "Notifications" }]}
        actions={
          <div className="flex items-center gap-2">
            {streamMode === "sse" && (
              <Badge variant="outline" className="gap-1 text-ok">
                <Wifi className="h-3 w-3" /> Live
              </Badge>
            )}
            {streamMode === "polling" && (
              <Badge variant="outline" className="gap-1 text-warn">
                <WifiOff className="h-3 w-3" /> Polling
              </Badge>
            )}
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-xs gap-1">
          <Bell className="h-3 w-3" />
          {unreadCount} unread
        </Badge>
        <Badge variant="outline" className="text-xs">{all.length} total</Badge>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            {all.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-2xs h-4 min-w-[16px] justify-center">{all.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unread.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-2xs h-4 min-w-[16px] justify-center">{unread.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <NotificationList rows={all} onClick={handleClick} />
        </TabsContent>
        <TabsContent value="unread" className="mt-4">
          <NotificationList
            rows={unread}
            onClick={handleClick}
            emptyTitle="No unread notifications"
            emptyDescription="You're all caught up!"
          />
        </TabsContent>
        <TabsContent value="read" className="mt-4">
          <NotificationList rows={read} onClick={handleClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({
  rows, onClick,
  emptyTitle = "No notifications",
  emptyDescription = "You have no notifications at this time.",
}: {
  rows: Notification[];
  onClick: (n: Notification) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <div className="space-y-2">
      {rows.map((n) => {
        const meta = TYPE_META[n.type] ?? TYPE_META.SYSTEM;
        return (
          <Card
            key={n.id}
            className={cn("transition-colors cursor-pointer", !n.readAt && "border-primary/30 bg-primary/5")}
            onClick={() => onClick(n)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", meta.tint)}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm leading-tight", !n.readAt && "font-semibold")}>{n.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-2xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                      {!n.readAt && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                  {n.body && <p className="text-xs text-muted-foreground mt-1">{n.body}</p>}
                  {n.link && (
                    <p className="text-xs text-primary mt-1.5 font-medium">
                      View details →
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
