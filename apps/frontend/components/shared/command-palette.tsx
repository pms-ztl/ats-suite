"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Shield, Scale, Brain, BarChart3, Users,
  Video, ClipboardCheck, Search, CheckCircle2, ArrowUpRight,
  Plug, Calendar, Rocket, Settings, Bell,
} from "lucide-react";
import sectionFeatures from "@/lib/section-features.json";
import { SIDEBAR_CATEGORIES } from "@/lib/constants";

// ── Section icons keyed by section slug ───────────────────────────────────────
const SECTION_ICONS: Record<string, React.ReactNode> = {
  platform:     <LayoutDashboard className="h-4 w-4 shrink-0" />,
  security:     <Shield          className="h-4 w-4 shrink-0" />,
  compliance:   <Scale           className="h-4 w-4 shrink-0" />,
  ai:           <Brain           className="h-4 w-4 shrink-0" />,
  analytics:    <BarChart3       className="h-4 w-4 shrink-0" />,
  candidates:   <Users           className="h-4 w-4 shrink-0" />,
  interviews:   <Video           className="h-4 w-4 shrink-0" />,
  screening:    <ClipboardCheck  className="h-4 w-4 shrink-0" />,
  sourcing:     <Search          className="h-4 w-4 shrink-0" />,
  decisions:    <CheckCircle2   className="h-4 w-4 shrink-0" />,
  mobility:     <ArrowUpRight   className="h-4 w-4 shrink-0" />,
  integrations: <Plug            className="h-4 w-4 shrink-0" />,
  scheduling:   <Calendar        className="h-4 w-4 shrink-0" />,
  onboarding:   <Rocket          className="h-4 w-4 shrink-0" />,
};

// Human-readable section labels derived from SIDEBAR_CATEGORIES
const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  SIDEBAR_CATEGORIES.map(c => [c.key, c.label])
);

// Valid section base paths (the only real, existing routes) keyed by section
// slug. The per-feature deep routes in section-features.json (e.g.
// /ai/explainable-ai-ranking) have NO backing page, so every search result is
// routed to its owning section's base page instead.
const SECTION_BASE_PATHS: Record<string, string> = Object.fromEntries(
  SIDEBAR_CATEGORIES.map(c => [c.key, c.path])
);

const QUICK_LINKS = [
  { title: "Dashboard",  route: "/",               icon: <LayoutDashboard className="h-4 w-4 shrink-0" /> },
  { title: "Settings",   route: "/settings",       icon: <Settings        className="h-4 w-4 shrink-0" /> },
  { title: "Notifications", route: "/notifications", icon: <Bell          className="h-4 w-4 shrink-0" /> },
  { title: "Audit Log",  route: "/audit",          icon: <Shield          className="h-4 w-4 shrink-0" /> },
];

// ── Flatten section-features.json once at module level ───────────────────────
interface FeatureItem {
  title: string;
  route: string;
  section: string;
  /** lower-cased search target */
  _search: string;
}

const ALL_FEATURES: FeatureItem[] = (() => {
  const items: FeatureItem[] = [];
  for (const [section, features] of Object.entries(
    sectionFeatures as Record<string, { title: string; route: string }[]>
  )) {
    for (const f of features) {
      items.push({
        ...f,
        section,
        _search: `${f.title} ${section} ${SECTION_LABELS[section] ?? ""}`.toLowerCase(),
      });
    }
  }
  return items;
})();

// ── Component ─────────────────────────────────────────────────────────────────
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMac, setIsMac] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMac(
      navigator.platform.toUpperCase().includes("MAC") ||
        navigator.userAgent.toUpperCase().includes("MAC")
    );
  }, []);

  // Ctrl+K / ⌘K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Reset query when closed
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_FEATURES.filter(f => f._search.includes(q)).slice(0, 15);
  }, [query]);

  const navigate = useCallback(
    (route: string) => {
      router.push(route);
      setOpen(false);
    },
    [router]
  );

  const showQuickLinks = query.trim() === "";
  const showResults   = !showQuickLinks && filtered.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-lg">
        <DialogTitle className="sr-only">Command Palette, Search all features</DialogTitle>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3"
        >
          {/* Search input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search 928 features, pages, sections…"
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="ml-1 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <Command.List className="max-h-[420px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No features found for &ldquo;{query}&rdquo;
            </Command.Empty>

            {/* Quick links shown when there is no query */}
            {showQuickLinks && (
              <Command.Group heading="Quick Links">
                {QUICK_LINKS.map(link => (
                  <Command.Item
                    key={link.route}
                    value={link.route}
                    onSelect={() => navigate(link.route)}
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    {link.icon}
                    <span>{link.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Section nav shown when there is no query */}
            {showQuickLinks && (
              <>
                <Command.Separator className="mx-2 my-1 h-px bg-border" />
                <Command.Group heading="Browse Sections">
                  {SIDEBAR_CATEGORIES.map(cat => (
                    <Command.Item
                      key={cat.key}
                      value={cat.path}
                      onSelect={() => navigate(cat.path)}
                      className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                    >
                      {SECTION_ICONS[cat.key] ?? <LayoutDashboard className="h-4 w-4 shrink-0" />}
                      <span className="flex-1">{cat.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}

            {/* Search results */}
            {showResults && (
              <Command.Group heading={`Results, ${filtered.length} of ${ALL_FEATURES.length}`}>
                {filtered.map(item => (
                  <Command.Item
                    key={item.route}
                    value={item.route}
                    // The deep per-feature route (item.route) has no backing page;
                    // route to the owning section's real base page instead.
                    onSelect={() => navigate(SECTION_BASE_PATHS[item.section] ?? "/" + item.section)}
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                  >
                    {SECTION_ICONS[item.section] ?? <LayoutDashboard className="h-4 w-4 shrink-0" />}
                    <span className="flex-1 truncate">{item.title}</span>
                    <Badge variant="secondary" className="ml-2 text-[10px] capitalize shrink-0">
                      {SECTION_LABELS[item.section] ?? item.section}
                    </Badge>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer hint */}
          <div className="border-t px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              <kbd className="rounded border bg-muted px-1 font-mono">↑↓</kbd> navigate &nbsp;
              <kbd className="rounded border bg-muted px-1 font-mono">↵</kbd> open &nbsp;
              <kbd className="rounded border bg-muted px-1 font-mono">Esc</kbd> close
            </span>
            <span className="flex items-center gap-1">
              {isMac ? (
                <>
                  <kbd className="rounded border bg-muted px-1 font-mono">⌘K</kbd>
                </>
              ) : (
                <kbd className="rounded border bg-muted px-1 font-mono">Ctrl+K</kbd>
              )}
              {" "}to toggle
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
