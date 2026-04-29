"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
  options: { label: string; value: string }[];
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  className?: string;
  actions?: React.ReactNode;
  sticky?: boolean;
}

export function FilterBar({ searchPlaceholder = "Search...", searchValue = "", onSearchChange, filters = [], activeFilters = {}, onFilterChange, onClearFilters, className, actions, sticky }: FilterBarProps) {
  const activeCount = Object.values(activeFilters).filter(v => v && v !== "all").length;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", sticky && "sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2", className)}>
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={searchPlaceholder} value={searchValue} onChange={e => onSearchChange?.(e.target.value)} className="pl-9 h-8 text-sm" />
        {searchValue && (
          <button aria-label="Clear search" onClick={() => onSearchChange?.("")} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      {filters.map(filter => (
        <Select key={filter.value} value={activeFilters[filter.value] || "all"} onValueChange={v => onFilterChange?.(filter.value, v)}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] text-2xs gap-1">
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-2xs">All {filter.label}</SelectItem>
            {filter.options.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-2xs">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 text-2xs">
          Clear filters <Badge variant="secondary" className="ml-1">{activeCount}</Badge>
        </Button>
      )}
      {actions}
    </div>
  );
}
