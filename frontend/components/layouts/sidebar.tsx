"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SIDEBAR_CATEGORIES, CATEGORY_FEATURES_COUNT } from "@/lib/constants";
import { usePermissions } from "@/lib/use-permissions";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard, Shield, Scale, Brain, BarChart3, Users, Video,
  ClipboardCheck, Search, CheckCircle2, ArrowUpRight, Plug, Calendar,
  Rocket, Home, Settings, Bell, ExternalLink, FileText,
  PanelLeftClose, PanelLeft, Sparkles, ShieldCheck, DollarSign,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
  Scale: <Scale className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Video: <Video className="h-4 w-4" />,
  ClipboardCheck: <ClipboardCheck className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
  ArrowUpRight: <ArrowUpRight className="h-4 w-4" />,
  Plug: <Plug className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  Rocket: <Rocket className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { can } = usePermissions();
  const [hitlPendingCount, setHitlPendingCount] = useState(0);

  useEffect(() => {
    // Use absolute backend URL + JWT (sessionStorage primary, HttpOnly cookie
    // fallback via credentials:"include"). Previously hit relative "/api/..."
    // on port 3000 with a fake "x-tenant-id" header — always 401, retried
    // on every layout mount, added perceptible click latency.
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    let token: string | null = null;
    if (typeof window !== "undefined") {
      try { token = window.sessionStorage?.getItem("ats-access-token") || null; } catch {}
    }
    fetch(`${API_BASE}/agents/hitl`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        setHitlPendingCount(data.filter((c: { status: string }) => c.status === "PENDING").length);
      })
      .catch(() => {});
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "group/sidebar fixed left-0 top-0 z-40 h-screen border-r border-border/40 glass-surface transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* ───── Premium edge-rail toggle ─────────────────────────────────
            A full-height invisible hover zone on the sidebar's right edge.
            On hover, an emerald vertical bar fades in along the edge AND a
            pill toggle slides into view (centered vertically near the top).
            Click anywhere on the bar OR the pill to toggle.
            Pure CSS hover — no JS state — so it's instant.
            ───────────────────────────────────────────────────────────── */}
        <div className="absolute top-0 right-0 h-full w-3 -mr-1.5 group/rail z-50">
          {/* Invisible widened hit-target — makes the edge forgiving to grab */}
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute inset-0 cursor-pointer"
          />
          {/* Animated emerald rail that lights up on hover */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-full w-px",
              "bg-gradient-to-b from-transparent via-primary/0 to-transparent",
              "group-hover/rail:via-primary/70 transition-all duration-300"
            )}
          />
          {/* Floating pill toggle — premium look with glow on hover */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-20 left-1/2 -translate-x-1/2",
              "h-10 w-6 rounded-full border border-border/60",
              "bg-background/90 backdrop-blur-md shadow-md",
              "flex items-center justify-center",
              "text-muted-foreground",
              "opacity-0 -translate-x-1 group-hover/rail:opacity-100 group-hover/rail:translate-x-1/2",
              "group-hover/rail:border-primary/60 group-hover/rail:text-primary",
              "group-hover/rail:shadow-[0_0_0_3px_hsl(var(--primary)/0.15),0_8px_20px_-6px_hsl(var(--primary)/0.45)]",
              "transition-all duration-200 ease-out"
            )}
          >
            {collapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronLeft className="h-3.5 w-3.5" />}
          </span>
        </div>
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border/40 px-4">
          <Link href="/" className={cn("flex items-center gap-2 min-w-0", collapsed && "mx-auto")}>
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary glow-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
            <div
              className={cn(
                "min-w-0 overflow-hidden transition-all duration-200",
                collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}
            >
              <span className="block text-sm font-bold text-foreground truncate">CDC ATS</span>
              <p className="text-2xs text-muted-foreground truncate">AI-Powered Hiring</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <div className="space-y-1 px-2">
            {/* Home */}
            <NavItem
              href="/"
              icon={<Home className="h-4 w-4" />}
              label="Dashboard"
              active={pathname === "/"}
              collapsed={collapsed}
            />

            {/* HITL Review Queue */}
            <NavItem
              href="/hitl"
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Review Queue"
              badge={hitlPendingCount > 0 ? hitlPendingCount : undefined}
              active={pathname.startsWith("/hitl")}
              collapsed={collapsed}
              urgent={hitlPendingCount > 0}
            />

            <Separator className="my-2" />

            {/* Category links — filtered by role */}
            {SIDEBAR_CATEGORIES.filter((cat) => can(cat.key)).map((cat) => (
              <NavItem
                key={cat.key}
                href={cat.path}
                icon={iconMap[cat.icon]}
                label={cat.label}
                badge={CATEGORY_FEATURES_COUNT[cat.key]}
                active={pathname.startsWith(cat.path)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2 space-y-1">
          <NavItem href="/status" icon={<ExternalLink className="h-4 w-4" />} label="Candidate Portal" collapsed={collapsed} />
          <NavItem href="/billing" icon={<DollarSign className="h-4 w-4" />} label="Cost & Usage" collapsed={collapsed} active={pathname.startsWith("/billing")} />
          <NavItem href="/notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" collapsed={collapsed} />
          <Link
            href="/platform"
            title="What's New"
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors min-w-0",
              collapsed && "justify-center"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span
              className={cn(
                "flex-1 min-w-0 truncate transition-all duration-200",
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}
            >
              What&apos;s New
            </span>
            <span
              className={cn(
                "shrink-0 overflow-hidden transition-all duration-200 bg-primary text-primary-foreground text-2xs px-1.5 py-0.5 rounded-full whitespace-nowrap",
                collapsed ? "opacity-0 w-0 px-0" : "opacity-100"
              )}
            >
              New
            </span>
          </Link>
          <NavItem href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" collapsed={collapsed} />
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-w-0",
              collapsed && "justify-center"
            )}
          >
            {collapsed
              ? <PanelLeft className="h-4 w-4 shrink-0" />
              : <PanelLeftClose className="h-4 w-4 shrink-0" />}
            <span
              className={cn(
                "flex-1 min-w-0 truncate text-left transition-all duration-200",
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

function NavItem({
  href,
  icon,
  label,
  badge,
  active,
  collapsed,
  urgent,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  collapsed: boolean;
  urgent?: boolean;
}) {
  // `min-w-0` on the outer Link + `flex-1 min-w-0 truncate` on the label
  // is the canonical recipe to make a flexbox child truncate cleanly without
  // pushing siblings (the icon / badge) out of view.
  const content = (
    <Link
      href={href}
      title={label}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors min-w-0",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        collapsed && "justify-center px-2"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span
        className={cn(
          "flex-1 min-w-0 truncate transition-all duration-200",
          collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
        )}
      >
        {label}
      </span>
      {badge !== undefined && (
        <span
          className={cn(
            "shrink-0 overflow-hidden transition-all duration-200",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}
        >
          <Badge
            variant={urgent ? "destructive" : "secondary"}
            className={cn(
              "text-2xs h-5 min-w-[20px] justify-center tabular-nums",
              urgent
                ? "bg-rose-500 text-white"
                : active
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {badge}
          </Badge>
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {label}
          {badge !== undefined && (
            <Badge variant="secondary" className="text-2xs">{badge}</Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
