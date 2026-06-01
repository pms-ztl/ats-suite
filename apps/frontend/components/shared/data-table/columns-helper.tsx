"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfidenceMeter } from "@/components/shared/confidence-meter";
import { formatDate } from "@/lib/utils";

export function selectColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };
}

export function actionsColumn<T>(actions: { label: string; onClick: (row: T) => void; variant?: string }[]): ColumnDef<T> {
  return {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, i) => (
            <DropdownMenuItem key={i} onClick={() => action.onClick(row.original)} className={action.variant === "destructive" ? "text-destructive" : ""}>
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    size: 50,
  };
}

export function statusColumn<T>(accessorKey: string = "status"): ColumnDef<T> {
  return {
    accessorKey,
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue(accessorKey) as string} />,
  };
}

export function dateColumn<T>(accessorKey: string, header: string): ColumnDef<T> {
  return {
    accessorKey,
    header,
    cell: ({ row }) => {
      const val = row.getValue(accessorKey) as string;
      return <span className="text-sm whitespace-nowrap">{val ? formatDate(val) : "-"}</span>;
    },
  };
}

export function confidenceColumn<T>(accessorKey: string = "confidence"): ColumnDef<T> {
  return {
    accessorKey,
    header: "Confidence",
    cell: ({ row }) => {
      const val = row.getValue(accessorKey) as number;
      return <ConfidenceMeter value={val} size="sm" className="w-24" />;
    },
  };
}
