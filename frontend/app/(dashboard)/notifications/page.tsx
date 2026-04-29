"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell, CheckCircle, AlertTriangle, Info, X, Archive } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

function apiToken() {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? "";
}
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Notification {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
  archived: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "info", title: "New application received", message: "Sarah Chen applied for Senior Engineer role", time: "2 hours ago", read: false, archived: false },
  { id: "2", type: "success", title: "Offer accepted", message: "James Wilson accepted the Product Manager offer", time: "5 hours ago", read: false, archived: false },
  { id: "3", type: "warning", title: "Interview reminder", message: "Panel interview for UX Designer in 30 minutes", time: "Yesterday", read: false, archived: false },
  { id: "4", type: "info", title: "Background check complete", message: "Background check for Alex Johnson cleared", time: "Yesterday", read: true, archived: false },
  { id: "5", type: "warning", title: "SLA breach risk", message: "3 applications pending screening for 5+ days", time: "2 days ago", read: true, archived: false },
  { id: "6", type: "success", title: "Requisition filled", message: "DevOps Engineer position has been filled", time: "3 days ago", read: true, archived: true },
];

const TYPE_ICON: Record<Notification["type"], React.ReactNode> = {
  info: <Info className="h-4 w-4 text-primary" />,
  success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
};

export default function NotificationsPage() {
  const { role } = usePermissions();
  if (role === "candidate") return null;

  const [notifications, setNotifications] = useState<Notification[]>(
    USE_MOCKS ? MOCK_NOTIFICATIONS : []
  );
  useEffect(() => {
    fetch(`${API}/platform/tenants/current`, { headers: { Authorization: `Bearer ${apiToken()}` }, credentials: "include" })
      .then(r => r.json())
      .then(r => { const d = r.data?.notifications ?? r.data?.data; if (Array.isArray(d) && d.length > 0) setNotifications(d); })
      .catch((err) => { console.error("Failed to load notifications:", err); });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read && !n.archived).length;

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.archived ? n : { ...n, read: true }))
    );
    toast.success("All notifications marked as read");
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, archived: true, read: true } : n))
    );
  };

  const allActive = notifications.filter((n) => !n.archived);
  const unread = notifications.filter((n) => !n.read && !n.archived);
  const archived = notifications.filter((n) => n.archived);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on hiring activity, alerts, and system events"
        breadcrumbs={[{ label: "Notifications" }]}
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-xs">
          <Bell className="h-3 w-3 mr-1" />
          {unreadCount} unread
        </Badge>
        <Badge variant="outline" className="text-xs">
          {allActive.length} total
        </Badge>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            {allActive.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-2xs h-4 min-w-[16px] justify-center">
                {allActive.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unread.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-2xs h-4 min-w-[16px] justify-center">
                {unread.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <NotificationList
            notifications={allActive}
            onMarkRead={markRead}
            onArchive={archiveNotification}
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <NotificationList
            notifications={unread}
            onMarkRead={markRead}
            onArchive={archiveNotification}
            emptyTitle="No unread notifications"
            emptyDescription="You're all caught up!"
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <NotificationList
            notifications={archived}
            onMarkRead={markRead}
            onArchive={archiveNotification}
            emptyTitle="No archived notifications"
            emptyDescription="Archived notifications will appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({
  notifications,
  onMarkRead,
  onArchive,
  emptyTitle = "No notifications",
  emptyDescription = "You have no notifications at this time.",
}: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <Card
          key={n.id}
          className={`transition-colors ${!n.read ? "border-primary/20 bg-primary/5" : ""}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm font-medium ${
                      !n.read ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {n.title}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-2xs text-muted-foreground">{n.time}</span>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 ml-1" />
                    )}
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Mark as read"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => onMarkRead(n.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {!n.archived && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Archive notification"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => onArchive(n.id)}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
