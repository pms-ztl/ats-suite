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
import { Bell, Search, Command } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { refreshTokenIfNeeded, getTokenExpiryMs } from "@/lib/token-refresh";

const ROLE_BADGE_COLORS: Record<string, string> = {
  // uppercase (backend)
  ADMIN: "bg-violet-100 text-violet-700 border-violet-200",
  RECRUITER: "bg-blue-100 text-blue-700 border-blue-200",
  HIRING_MANAGER: "bg-emerald-100 text-emerald-700 border-emerald-200",
  COMPLIANCE_OFFICER: "bg-amber-100 text-amber-700 border-amber-200",
  CANDIDATE: "bg-slate-100 text-slate-600 border-slate-200",
  // lowercase (legacy mock fallback)
  admin: "bg-violet-100 text-violet-700 border-violet-200",
  recruiter: "bg-blue-100 text-blue-700 border-blue-200",
  hiring_manager: "bg-emerald-100 text-emerald-700 border-emerald-200",
  compliance_officer: "bg-amber-100 text-amber-700 border-amber-200",
  candidate: "bg-slate-100 text-slate-600 border-slate-200",
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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const handleNotifications = () => {
    router.push("/notifications");
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm"
      >
        Skip to main content
      </a>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-64")}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex-1 flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search features…"
                      className="pl-9 h-8 bg-slate-50 border-slate-200 cursor-pointer"
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
            {/* Notifications */}
            <Button variant="ghost" size="icon-sm" className="relative" aria-label="View notifications" onClick={handleNotifications}>
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>

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
                      <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                      <span
                        className={`hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-medium ${ROLE_BADGE_COLORS[user.role] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
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
                    <p className="text-sm font-medium">{user?.name ?? "—"}</p>
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

        {/* Main Content */}
        <main id="main-content" className="p-6 animate-page-in">{children}</main>
      </div>
    </div>
  );
}
