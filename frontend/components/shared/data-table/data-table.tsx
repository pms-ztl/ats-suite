"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  pageSize?: number;
  searchValue?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onExport?: () => void;
  className?: string;
  enableSelection?: boolean;
  bulkActions?: { label: string; value: string; variant?: "default" | "destructive" | "outline" }[];
  onBulkAction?: (action: string, selectedRows: TData[]) => void;
  // Server-side pagination props (API shape: { data: T[], total: number, page: number, limit: number })
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function DataTable<TData, TValue>({ columns, data, loading = false, pageSize = 25, searchValue, emptyTitle = "No results found", emptyDescription = "Try adjusting your search or filters.", onExport, className, enableSelection = false, bulkActions, onBulkAction, totalItems, currentPage, onPageChange, onPageSizeChange }: DataTableProps<TData, TValue>) {
  // Determine if we're in server-side pagination mode
  const isServerPaginated = totalItems !== undefined && onPageChange !== undefined;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const selectionColumn: ColumnDef<TData, any> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };

  const effectiveColumns = enableSelection ? [selectionColumn, ...columns] : columns;

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
    // Built-in CSV export — runs whenever onExport is omitted or is a no-op placeholder.
    // Detects empty arrow functions in both dev ("() => {}") and minified ("()=>{}") forms,
    // or when no onExport was provided at all.
    const src = onExport ? onExport.toString().replace(/\s/g, "") : "";
    if (!onExport || src === "()=>{}" || src === "function(){}") {
      const headers = columns
        .map(col => {
          const h = (col as any).header;
          return typeof h === "string" ? h : ((col as any).accessorKey ?? (col as any).id ?? "");
        })
        .join(",");
      const rows = data
        .map(row =>
          columns
            .map(col => {
              const key = (col as any).accessorKey;
              const val = key ? (row as any)[key] : "";
              const str = val === null || val === undefined ? "" : String(val);
              return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
            })
            .join(",")
        )
        .join("\n");
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} rows to CSV`);
    }
  };

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    enableRowSelection: enableSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: () => {},
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter: searchValue ?? "" },
    initialState: { pagination: { pageSize } },
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Bulk action toolbar */}
      {enableSelection && selectedCount > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border mb-2">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <div className="flex gap-1 ml-2">
            {bulkActions?.map(action => (
              <Button
                key={action.value}
                size="sm"
                variant={action.variant ?? "outline"}
                className="h-7 text-xs"
                onClick={() => onBulkAction?.(action.value, selectedRows.map(r => r.original))}
              >
                {action.label}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs ml-auto"
            onClick={() => table.resetRowSelection()}
          >
            Clear
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="bg-slate-50/50">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-2xs font-semibold uppercase tracking-wider">
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn("flex items-center gap-1", header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground")}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="group hover:bg-muted/50 transition-colors cursor-default">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={effectiveColumns.length} className="h-48 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-2xs text-muted-foreground">
          <span>{selectedCount} of {table.getFilteredRowModel().rows.length} selected</span>
          <Button variant="ghost" size="sm" onClick={handleExport} className="h-7 text-2xs">
            <Download className="h-3 w-3 mr-1" />Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-2xs">
                <SlidersHorizontal className="h-3 w-3 mr-1" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns()
                .filter(col => col.getCanHide())
                .map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                    className="capitalize"
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xs text-muted-foreground">Rows per page</span>
            <Select value={`${table.getState().pagination.pageSize}`} onValueChange={v => table.setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-[65px] text-2xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[25, 50, 100].map(size => <SelectItem key={size} value={`${size}`} className="text-2xs">{size}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <span className="text-2xs text-muted-foreground">
            Page {table.getPageCount() > 0 ? table.getState().pagination.pageIndex + 1 : 0} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" aria-label="Go to first page" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className={cn("h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors")}><ChevronsLeft className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon-sm" aria-label="Go to previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className={cn("h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors")}><ChevronLeft className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon-sm" aria-label="Go to next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className={cn("h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors")}><ChevronRight className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon-sm" aria-label="Go to last page" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className={cn("h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors")}><ChevronsRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>

      {/* Server-side pagination bar — shown when totalItems is provided */}
      {isServerPaginated && (() => {
        const activePage = currentPage ?? 1;
        const activeSize = pageSize ?? 25;
        const total = totalItems!;
        const totalPages = Math.max(1, Math.ceil(total / activeSize));
        const startItem = Math.min((activePage - 1) * activeSize + 1, total);
        const endItem = Math.min(activePage * activeSize, total);
        return (
          <div className="flex items-center justify-between border-t pt-3 px-1">
            {/* Left: showing X–Y of Z */}
            <span className="text-xs text-muted-foreground">
              Showing {total === 0 ? 0 : startItem}–{endItem} of {total} results
            </span>
            {/* Center: page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Page size</span>
              <Select
                value={`${activeSize}`}
                onValueChange={v => {
                  onPageSizeChange?.(Number(v));
                  onPageChange(1);
                }}
              >
                <SelectTrigger className="h-7 w-[70px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map(s => (
                    <SelectItem key={s} value={`${s}`} className="text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Right: prev/next + page indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Page {activePage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Go to first page"
                  onClick={() => onPageChange(1)}
                  disabled={activePage <= 1}
                  className={cn("h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors")}
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Go to previous page"
                  onClick={() => onPageChange(activePage - 1)}
                  disabled={activePage <= 1}
                  className={cn("h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors")}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Go to next page"
                  onClick={() => onPageChange(activePage + 1)}
                  disabled={activePage >= totalPages}
                  className={cn("h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors")}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Go to last page"
                  onClick={() => onPageChange(totalPages)}
                  disabled={activePage >= totalPages}
                  className={cn("h-8 w-8 hover:bg-accent hover:text-accent-foreground transition-colors")}
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
