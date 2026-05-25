"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, HelpCircle } from "lucide-react";

const candidateNav = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/status", label: "My Applications", icon: FileText },
  { href: "/transparency", label: "Help", icon: HelpCircle },
];

export function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Glassmorphism: chrome surfaces composite over the global aurora backdrop
  // applied in globals.css (body::before). All shades use semantic tokens so
  // both light and dark mode look right.
  return (
    <div className="min-h-screen text-foreground flex flex-col">
      {/* Top Nav — glass */}
      <header className="sticky top-0 z-30 border-b border-border/40 glass-surface">
        <div className="max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/jobs" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary glow-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">Career Portal</span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                CDC ATS
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {candidateNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/jobs" && pathname?.startsWith("/jobs"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 glass-surface mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>CDC ATS Career Portal</span>
          <div className="flex items-center gap-4">
            <Link href="/transparency" className="hover:text-foreground transition-colors">
              AI Transparency
            </Link>
            <Link href="/appeal" className="hover:text-foreground transition-colors">
              Appeal a Decision
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
