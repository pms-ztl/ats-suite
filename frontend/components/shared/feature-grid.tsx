"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, ChevronDown, ChevronUp, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/use-debounce";

interface FeatureItem {
  title: string;
  route: string;
}

interface FeatureGridProps {
  features: FeatureItem[];
  title?: string;
  defaultOpen?: boolean;
}

export function FeatureGrid({ features, title, defaultOpen = false }: FeatureGridProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return features;
    const q = debouncedSearch.toLowerCase();
    return features.filter(f => f.title.toLowerCase().includes(q));
  }, [features, debouncedSearch]);

  return (
    <Card className="mt-6">
      <CardHeader
        className="cursor-pointer select-none flex-row items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {title || "Feature Modules"}
          </span>
          <Badge variant="secondary" className="text-xs">
            {features.length}
          </Badge>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />
        }
      </CardHeader>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="pt-0 px-0 pb-0">
          {/* Search bar */}
          <div className="px-4 pb-3 pt-1">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No features match &ldquo;{debouncedSearch}&rdquo;
            </div>
          )}

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:gap-0">
            {filtered.map((f, i) => (
              <Link key={f.route} href={f.route}>
                <div
                  className={`flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 hover:shadow-md hover:border-primary/30 transition-all duration-150 cursor-pointer text-sm border-b border-border/40 ${
                    i % 3 !== 2 ? "sm:border-r" : ""
                  }`}
                >
                  <span className="truncate pr-2">{f.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
