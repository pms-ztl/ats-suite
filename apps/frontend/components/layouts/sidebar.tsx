"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SIDEBAR_CATEGORIES, CATEGORY_FEATURES_COUNT } from "@/lib/constants";
import { usePermissions } from "@/lib/use-permissions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTenantBranding } from "@/hooks/use-tenant-branding";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LayoutDashboard, Shield, Scale, Brain, BarChart3, Users, Video,
  ClipboardCheck, Search, CheckCircle2, ArrowUpRight, Plug, Calendar,
  Rocket, Home, Settings, Bell, ExternalLink, FileText,
  PanelLeftClose, PanelLeft, Sparkles, ShieldCheck, DollarSign,
  ChevronLeft, ChevronRight, Building2, Zap, Crown, Tag,
} from "lucide-react";

const PLAN_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  FREE:         { label: "Free",         icon: <Rocket className="h-2.5 w-2.5" />,   className: "bg-muted text-muted-foreground" },
  STARTER:      { label: "Starter",      icon: <Zap className="h-2.5 w-2.5" />,      className: "bg-info-tint text-info dark:text-info" },
  PROFESSIONAL: { label: "Pro",          icon: <Crown className="h-2.5 w-2.5" />,    className: "bg-ai-tint text-ai-ink dark:text-ai-ink" },
  ENTERPRISE:   { label: "Enterprise",   icon: <Building2 className="h-2.5 w-2.5" />, className: "bg-warn-tint text-warn dark:text-warn" },
};

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
  const { can, isSuperAdmin, isTenantAdmin } = usePermissions();
  const { user } = useCurrentUser();
  const { branding } = useTenantBranding();
  const [hitlPendingCount, setHitlPendingCount] = useState(0);
  const [seats, setSeats] = useState<{ used: number; limit: number; unlimited: boolean } | null>(null);
  const plan = PLAN_META[user?.tenant?.plan ?? "FREE"] ?? PLAN_META.FREE;

  // Fetch seat usage for tenant admin (Batch 1)
  useEffect(() => {
    if (!isTenantAdmin || !user) return;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    let token: string | null = null;
    if (typeof window !== "undefined") {
      try { token = window.sessionStorage.getItem("ats-access-token"); } catch {}
    }
    fetch(`${API_BASE}/users/seats`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(r => r.ok ? r.json() : null)
      .then(res => {
        if (res?.data) setSeats({ used: res.data.used, limit: res.data.limit, unlimited: res.data.unlimited });
      })
      .catch(() => {});
  }, [isTenantAdmin, user]);

  useEffect(() => {
    // Use absolute backend URL + JWT (sessionStorage primary, HttpOnly cookie
    // fallback via credentials:"include"). Previously hit relative "/api/..."
    // on port 3000 with a fake "x-tenant-id" header, always 401, retried
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
            Full-height hit zone hugging the sidebar's outer right edge.
            Sits MOSTLY outside the sidebar (-mr-2.5 → 10px outside, 2px
            inside) so it doesn't visually cover or intercept clicks on
            the rightmost portion of NavItem rows (badges, etc.).
            On hover an emerald vertical bar fades in + a pill toggle slides
            in. Click anywhere on the rail to toggle.
            ───────────────────────────────────────────────────────────── */}
        <div className="absolute top-0 right-0 h-full w-3 -mr-2.5 group/rail z-50">
          {/* Invisible widened hit-target, makes the edge forgiving to grab */}
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
          {/* Floating pill toggle, premium look with glow on hover */}
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
              "group-hover/rail:shadow-[0_0_0_3px_oklch(var(--primary)/0.15),0_8px_20px_-6px_oklch(var(--primary)/0.45)]",
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
            {branding?.logoUrl ? (
              // Branded: real logo at 32×32, object-contain so any aspect renders cleanly.
              <img
                src={branding.logoUrl}
                alt={branding.name}
                className="h-8 w-8 shrink-0 rounded-lg object-contain bg-white/5 p-0.5"
              />
            ) : (
              // Fallback: initial letter on primary-colored tile.
              <div
                className="h-8 w-8 shrink-0 rounded-lg glow-primary flex items-center justify-center"
                style={{ backgroundColor: branding?.brandPrimaryColor ?? undefined }}
              >
                <span className="text-sm font-bold text-primary-foreground">
                  {(branding?.name ?? user?.tenant?.name)?.charAt(0)?.toUpperCase() ?? "C"}
                </span>
              </div>
            )}
            <div
              className={cn(
                "min-w-0 overflow-hidden transition-all duration-200",
                collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              )}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="block text-sm font-bold text-foreground truncate leading-tight">
                  {branding?.name ?? user?.tenant?.name ?? "CDC ATS"}
                </span>
                <span className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold shrink-0",
                  plan.className
                )}>
                  {plan.icon}{plan.label}
                </span>
              </div>
              <p className="text-2xs text-muted-foreground truncate">{branding?.brandTagline ?? "AI-Powered Hiring"}</p>
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

            {/* Category links, filtered by role */}
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
          {/* Platform admin portal, SUPER_ADMIN only */}
          {isSuperAdmin && (
            <NavItem
              href="/admin"
              icon={<Building2 className="h-4 w-4" />}
              label="Admin Portal"
              active={pathname.startsWith("/admin")}
              collapsed={collapsed}
            />
          )}
          {/* Seat usage indicator, Tenant admin only */}
          {isTenantAdmin && seats && !collapsed && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-2xs">
              <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground truncate">
                Seats:{" "}
                <strong className={cn(
                  "text-foreground",
                  !seats.unlimited && seats.used >= seats.limit && "text-danger"
                )}>
                  {seats.used}{seats.unlimited ? "" : ` / ${seats.limit}`}
                </strong>
              </span>
            </div>
          )}
          <NavItem href="/status" icon={<ExternalLink className="h-4 w-4" />} label="Candidate Portal" collapsed={collapsed} />
          <NavItem href="/billing" icon={<DollarSign className="h-4 w-4" />} label="Cost & Usage" collapsed={collapsed} active={pathname.startsWith("/billing")} />
          <NavItem href="/notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" collapsed={collapsed} />
          {/* Upgrade prompt for FREE plan */}
          {!collapsed && (user?.tenant?.plan === "FREE" || !user?.tenant) && (
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-lg mx-1 px-3 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-primary truncate">Upgrade plan</p>
                <p className="text-[10px] text-muted-foreground truncate">Unlock all AI agents</p>
              </div>
            </Link>
          )}
          <Link
            href="/platform"
            title="What's New"
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors min-w-0",
              collapsed && "justify-center"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-ai" />
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
  // Grid layout: [icon] [label that truncates] [badge].
  // Grid is more bulletproof than flex for "label must truncate and badge must
  // stay visible", the badge column is `auto` so it sizes to content and never
  // collapses, the label column is `minmax(0, 1fr)` so it CAN shrink below
  // content width (which is what makes text-overflow:ellipsis kick in), and
  // the icon column is `auto` so it stays at its natural 16px.
  const content = (
    <Link
      href={href}
      title={label}
      className={cn(
        "relative grid items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors w-full",
        collapsed
          ? "grid-cols-[auto] justify-center px-2"
          : "grid-cols-[auto_minmax(0,1fr)_auto]",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
      )}
    >
      {/* Aurora signature: emerald left accent bar on the active item */}
      {active && !collapsed && (
        <span aria-hidden="true" className="absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <span className="shrink-0 leading-none">{icon}</span>
      {!collapsed && (
        <>
          <span className="min-w-0 truncate">
            {label}
          </span>
          {badge !== undefined ? (
            <Badge
              variant={urgent ? "destructive" : "secondary"}
              className={cn(
                "h-5 px-1.5 text-2xs min-w-[20px] justify-center tabular-nums shrink-0",
                urgent
                  ? "bg-danger text-white border-transparent"
                  : active
                    ? "bg-primary/20 text-primary border-transparent"
                    : "bg-muted text-muted-foreground border-transparent"
              )}
            >
              {badge}
            </Badge>
          ) : (
            // Empty cell so grid columns stay aligned across rows
            <span aria-hidden="true" />
          )}
        </>
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
