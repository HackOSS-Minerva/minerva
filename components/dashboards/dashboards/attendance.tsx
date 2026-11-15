"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RiMoreLine } from "@remixicon/react";
import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";

type CheckinRecord = Doc<"checkins">;

export const metadata = {
  title: "Attendance",
};

export const csvFields = ["firstname", "lastname", "email", "role", "timestamp"];
const formatTimestamp = (ts: number): string => {

  const date = new Date(ts);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  
});
}

export const columns: ColumnDef<CheckinRecord>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstname",
    header: "Name",
    cell: ({ row }) => (
      <Label className="px-1.5 text-foreground">
        {row.original.firstname} {row.original.lastname}
      </Label>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <Label className="px-1.5 text-muted-foreground">{row.original.email}</Label>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Label className="px-1.5 text-muted-foreground capitalize">{row.original.role}</Label>
    ),
  },
  {
    accessorKey: "timestamp",
    header: "Check-in Time",
    cell: ({ row }) => (
      <Label className="px-1.5 text-muted-foreground">
        {formatTimestamp(row.original.timestamp)}
      </Label>
    ),
  },
  {
    id: "actions",
    cell: ({ table, row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <RiMoreLine />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => table.options.meta?.onDelete(row.original._id)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
