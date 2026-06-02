"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Command, Sun, Moon, ChevronRight } from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTenantBranding } from "@/hooks/use-tenant-branding";
import { refreshTokenIfNeeded, getTokenExpiryMs } from "@/lib/token-refresh";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";
import { ImpersonationBanner } from "@/components/auth/impersonation-banner";

/** Valid 3- or 6-digit hex check for tenant brand-color injection. */
function isHex(hex: string | null | undefined): hex is string {
  return !!hex && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(hex);
}

const ROLE_BADGE_COLORS: Record<string, string> = {
  // uppercase (backend)
  ADMIN: "bg-ai-tint text-ai-ink border-ai/40",
  RECRUITER: "bg-info-tint text-info border-info/40",
  HIRING_MANAGER: "bg-ok-tint text-ok border-ok/40",
  COMPLIANCE_OFFICER: "bg-warn-tint text-warn border-warn/40",
  CANDIDATE: "bg-muted text-muted-foreground border-border",
  // lowercase (legacy mock fallback)
  admin: "bg-ai-tint text-ai-ink border-ai/40",
  recruiter: "bg-info-tint text-info border-info/40",
  hiring_manager: "bg-ok-tint text-ok border-ok/40",
  compliance_officer: "bg-warn-tint text-warn border-warn/40",
  candidate: "bg-muted text-muted-foreground border-border",
};

const ROLE_LABELS: Record<string, string> = {
  // uppercase (backend)
  ADMIN: "Admin",
  RECRUITER: "Recruiter",
  HIRING_MANAGER: "Hiring Manager",
  COMPLIANCE_OFFICER: "Compliance Officer",
  CANDIDATE: "Candidate",
  // lowercase (legacy mock fallback)
  admin: "Admin",
  recruiter: "Recruiter",
  hiring_manager: "Hiring Manager",
  compliance_officer: "Compliance Officer",
  candidate: "Candidate",
};

const SIDEBAR_STORAGE_KEY = "ats-sidebar-collapsed";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { branding } = useTenantBranding();
  // Start expanded so SSR + first client render match (no hydration mismatch),
  // then hydrate the persisted value from localStorage right after mount.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage?.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === "1") setSidebarCollapsed(true);
    } catch { /* localStorage may be blocked */ }
  }, []);
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try { window.localStorage?.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const { user, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  // Auto-refresh JWT before it expires
  useEffect(() => {
    refreshTokenIfNeeded(); // Check on mount
    const interval = setInterval(refreshTokenIfNeeded, 5 * 60 * 1000); // Check every 5 min
    return () => clearInterval(interval);
  }, []);

  // Warn user when session is about to expire
  useEffect(() => {
    const checkExpiry = () => {
      const remaining = getTokenExpiryMs();
      if (remaining !== null && remaining < 5 * 60 * 1000 && remaining > 0) {
        toast.warning("Your session expires in less than 5 minutes. Save your work.");
      }
    };
    const interval = setInterval(checkExpiry, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(
      navigator.platform.toUpperCase().includes("MAC") ||
        navigator.userAgent.toUpperCase().includes("MAC")
    );
  }, []);

  const handleSignOut = () => {
    document.cookie = "ats-token=; Max-Age=0; path=/";
    router.push("/login");
  };

  // Inject the tenant brand color as --brand (cascades to --primary and every
  // brand-* utility under Aurora). A hex is already a valid CSS color.
  const brandStyle = isHex(branding?.brandPrimaryColor)
    ? ({ "--brand": branding!.brandPrimaryColor, "--primary": branding!.brandPrimaryColor } as React.CSSProperties)
    : undefined;

  // Top-bar breadcrumb + theme toggle (exact Aurora shell top bar).
  const [isDark, setIsDark] = useState(false);
  useEffect(() => { setIsDark(document.documentElement.classList.contains("dark")); }, [pathname]);
  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setIsDark(next);
    try { window.localStorage?.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  const wsName = branding?.name ?? user?.tenant?.name ?? "CDC ATS";
  const pageTitle = pathname === "/"
    ? "Home"
    : (pathname.split("/").filter(Boolean)[0] ?? "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen" style={brandStyle}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm"
      >
        Skip to main content
      </a>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/40 glass-surface px-6">
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {/* breadcrumb: workspace > section */}
            <div className="hidden items-center gap-2 min-w-0 md:flex">
              <span className="truncate max-w-[150px] text-sm font-medium text-muted-foreground">{wsName}</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-semibold tracking-tight">{pageTitle}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search features…"
                      className="pl-9 h-8 bg-muted/50 border-border cursor-pointer"
                      onClick={() =>
                        document.dispatchEvent(
                          new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
                        )
                      }
                      onFocus={(e) => e.target.blur()}
                      readOnly
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {isMac ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Command className="h-3 w-3" />K
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Ctrl+K</span>
                      )}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    Search all features{" "}
                    <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded border">
                      {isMac ? "⌘K" : "Ctrl+K"}
                    </kbd>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-3">
            {/* theme toggle */}
            <button onClick={toggleTheme} aria-label="Toggle theme" className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {/* Notifications, live unread count via /api/notifications */}
            <NotificationDropdown />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-2 px-2" aria-label="User menu" disabled={userLoading}>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-2xs bg-primary text-white">
                      {user ? user.name.split(" ").map(n => n[0]).join("") : "?"}
                    </AvatarFallback>
                  </Avatar>
                  {user && (
                    <>
                      <span className="text-sm font-medium hidden sm:inline max-w-[160px] truncate" title={user.name}>{user.name}</span>
                      <span
                        className={`hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-medium whitespace-nowrap ${ROLE_BADGE_COLORS[user.role] ?? "bg-muted text-muted-foreground border-border"}`}
                      >
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name ?? "-"}</p>
                    <p className="text-2xs text-muted-foreground">{user?.email ?? ""}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Phase 32a, bright-red impersonation banner. Renders FIRST so
            it's the most visible thing on the page. */}
        <ImpersonationBanner />

        {/* Phase 31b, dismissable confirm-email banner (top of every page) */}
        <VerifyEmailBanner />

        {/* Main Content */}
        <main id="main-content" className="p-6 animate-page-in">{children}</main>
      </div>

      {/* Phase 29, first-run onboarding wizard. Internally checks if the
          tenant has dismissed/completed it; only shows for tenant-admins on
          first dashboard visit. No-op for non-admins (endpoint 403s, wizard
          stays hidden). */}
      {user?.role === "ADMIN" && <OnboardingWizard />}
    </div>
  );
}
