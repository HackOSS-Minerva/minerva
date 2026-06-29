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
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";

interface CheckinRecord {
  _id: string;
  _creationTime: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  timestamp: number;
  eventid: string;
  userid: string;
  tenant: string;
}

export const metadata = {
  title: "Attendance",
};

export const csvFields = [
  "firstname",
  "lastname",
  "email",
  "role",
  "timestamp",
];

function formatTimestamp(ts: number): string {
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
      <Label className="text-foreground px-1.5">
        {row.original.firstname} {row.original.lastname}
      </Label>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.email}
      </Label>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5 capitalize">
        {row.original.role}
      </Label>
    ),
  },
  {
    accessorKey: "timestamp",
    header: "Check-in Time",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
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
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            variant="destructive"
            onClick={() =>
              table.options.meta?.onDelete(row.original._id as unknown as number)
            }
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];