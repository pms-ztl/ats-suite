"use client";

import { useState, useMemo, useCallback } from "react";

export function useTableState<T>(initialData: T[] = []) {
  const [search, setSearchRaw] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(25);

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPage(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeRaw(size);
    setPage(1);
  }, []);

  const filteredData = useMemo(() => {
    let result = initialData;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        Object.values(item as Record<string, unknown>).some(v =>
          String(v).toLowerCase().includes(q)
        )
      );
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter(item => (item as Record<string, unknown>)[key] === value);
      }
    });
    return result;
  }, [initialData, search, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  return {
    search,
    setSearch,
    filters,
    setFilters,
    setFilter: (key: string, value: string) => { setFilters(prev => ({ ...prev, [key]: value })); setPage(1); },
    clearFilters: () => { setFilters({}); setSearchRaw(""); setPage(1); },
    page,
    setPage,
    pageSize,
    setPageSize,
    filteredData,
    paginatedData,
    totalPages: Math.ceil(filteredData.length / pageSize),
    total: filteredData.length,
  };
}
