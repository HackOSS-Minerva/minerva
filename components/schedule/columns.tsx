"use client";

import type { GoogleEvent } from "@/types/calendar";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDayOfWeek } from "@/lib/schedule";

const formatTime = (dateTime?: string, timeZone?: string) => {
  if (!dateTime) return "N/A";
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timeZone || undefined,
    });
  } catch {
    return "N/A";
  }
};

type EventStatus = "completed" | "ongoing" | "planned";

const getEventStatus = (
  start?: { dateTime?: string; date?: string },
  end?: { dateTime?: string; date?: string },
): EventStatus => {
  const startStr = start?.dateTime ?? start?.date;
  const endStr = end?.dateTime ?? end?.date;
  if (!startStr || !endStr) return "planned";
  const now = Date.now();
  const startTime = new Date(startStr).getTime();
  const endTime = new Date(endStr).getTime();

  if (isNaN(startTime) || isNaN(endTime)) return "planned";
  if (now > endTime) return "completed";
  if (now >= startTime && now <= endTime) return "ongoing";
  return "planned";
};

const statusVariant = (
  status: EventStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "ongoing":
      return "default";
    case "planned":
      return "secondary";
    case "completed":
      return "outline";
  }
};

const eventStatusFilter = (
  row: Row<GoogleEvent>,
  _columnId: string,
  filterValues: string[],
) => {
  const { start, end } = row.original;
  const status = getEventStatus(start, end);
  return filterValues.includes(status);
};

const dayOfWeekFilter = (
  row: Row<GoogleEvent>,
  _columnId: string,
  filterValues: string[],
) => {
  const dateTime = row.original.start?.dateTime ?? row.original.start?.date;
  const timeZone = row.original.start?.timeZone ?? "America/Los_Angeles";
  const day = getDayOfWeek(dateTime, timeZone);
  return filterValues.includes(day);
};

export const columns: ColumnDef<GoogleEvent>[] = [
  {
    id: "day",
    header: "Day",
    filterFn: dayOfWeekFilter,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const dateTime = row.original.start?.dateTime ?? row.original.start?.date;
      const timeZone = row.original.start?.timeZone ?? "America/Los_Angeles";
      return <span>{getDayOfWeek(dateTime, timeZone)}</span>;
    },
  },
  {
    accessorKey: "start",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateTime = row.original.start?.dateTime;
      const isAllDay = !dateTime && Boolean(row.original.start?.date);
      const timeZone = row.original.start?.timeZone ?? "America/Los_Angeles";

      if (isAllDay) {
        return (
          <span className="text-muted-foreground italic text-xs font-medium">
            All Day
          </span>
        );
      }

      return (
        <span className="font-medium">{formatTime(dateTime, timeZone)}</span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aStr = rowA.original.start?.dateTime ?? rowA.original.start?.date;
      const bStr = rowB.original.start?.dateTime ?? rowB.original.start?.date;
      const a = aStr ? new Date(aStr).getTime() : 0;
      const b = bStr ? new Date(bStr).getTime() : 0;
      return a - b;
    },
  },
  {
    accessorKey: "end",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateTime = row.original.end?.dateTime;
      const isAllDay = !dateTime && Boolean(row.original.end?.date);
      const timeZone = row.original.end?.timeZone ?? "America/Los_Angeles";

      if (isAllDay) {
        return (
          <span className="text-muted-foreground italic text-xs font-medium">
            All Day
          </span>
        );
      }

      return (
        <span className="font-medium">{formatTime(dateTime, timeZone)}</span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aStr = rowA.original.end?.dateTime ?? rowA.original.end?.date;
      const bStr = rowB.original.end?.dateTime ?? rowB.original.end?.date;
      const a = aStr ? new Date(aStr).getTime() : 0;
      const b = bStr ? new Date(bStr).getTime() : 0;
      return a - b;
    },
  },

  {
    accessorKey: "summary",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const summary = row.getValue("summary") as string | undefined;
      return (
        <span className="font-medium line-clamp-1 max-w-[250px]">
          {summary?.trim() || (
            <span className="text-muted-foreground italic">Untitled Event</span>
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as string | undefined;
      return location?.trim() ? (
        <span className="text-muted-foreground line-clamp-1 max-w-[250px]">
          {location.trim()}
        </span>
      ) : (
        <span className="text-muted-foreground italic">N/A</span>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    filterFn: eventStatusFilter,
    cell: ({ row }) => {
      const { start, end } = row.original;
      const status = getEventStatus(start, end);
      return (
        <Badge variant={statusVariant(status)} className="capitalize">
          {status}
        </Badge>
      );
    },
    sortingFn: (rowA, rowB) => {
      const statusA = getEventStatus(rowA.original.start, rowA.original.end);
      const statusB = getEventStatus(rowB.original.start, rowB.original.end);
      const order = { completed: 0, ongoing: 1, planned: 2 };
      return order[statusA] - order[statusB];
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;

      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => window.open(event.htmlLink, "_blank")}
        >
          <span className="sr-only">Open in Google Calendar</span>
          <ExternalLink className="h-4 w-4" />
        </Button>
      );
    },
  },
];
