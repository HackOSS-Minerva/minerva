"use client";

import type { GoogleEvent } from "@/types/calendar";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const formatTime = (dateTime: string, timeZone: string) => {
  return new Date(dateTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timeZone,
  });
};

type EventStatus = "completed" | "ongoing" | "planned";

const getEventStatus = (start: string, end: string): EventStatus => {
  const now = Date.now();
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (now > endTime) return "completed";
  if (now >= startTime && now <= endTime) return "ongoing";
  return "planned";
};

const getDayOfWeek = (dateTime: string, timeZone: string): string => {
  return new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: timeZone,
  });
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
    default:
      return "outline";
  }
};

const eventStatusFilter = (
  row: Row<GoogleEvent>,
  _columnId: string,
  filterValues: string[],
) => {
  const { start, end } = row.original;
  const now = Date.now();
  const startTime = new Date(start.dateTime).getTime();
  const endTime = new Date(end.dateTime).getTime();
  let status: string;
  if (now > endTime) status = "completed";
  else if (now >= startTime && now <= endTime) status = "ongoing";
  else status = "planned";
  return filterValues.includes(status);
};

const dayOfWeekFilter = (
  row: Row<GoogleEvent>,
  _columnId: string,
  filterValues: string[],
) => {
  const { dateTime, timeZone } = row.original.start;
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
      const { dateTime, timeZone } = row.original.start;
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
      const { dateTime, timeZone } = row.original.start;
      return <span className="font-medium">{formatTime(dateTime, timeZone)}</span>;
    },
    sortingFn: (rowA, rowB) => {
      const a = new Date(rowA.original.start.dateTime).getTime();
      const b = new Date(rowB.original.start.dateTime).getTime();
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
      const { dateTime, timeZone } = row.original.end;
      return <span className="font-medium">{formatTime(dateTime, timeZone)}</span>;
    },
    sortingFn: (rowA, rowB) => {
      const a = new Date(rowA.original.end.dateTime).getTime();
      const b = new Date(rowB.original.end.dateTime).getTime();
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
      return (
        <span className="font-medium line-clamp-1 max-w-[250px]">
          {row.getValue("summary")}
        </span>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as string;
      return location ? (
        <span className="text-muted-foreground line-clamp-1 max-w-[250px]">
          {location}
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
      const status = getEventStatus(start.dateTime, end.dateTime);
      return (
        <Badge variant={statusVariant(status)} className="capitalize">
          {status}
        </Badge>
      );
    },
    sortingFn: (rowA, rowB) => {
      const statusA = getEventStatus(
        rowA.original.start.dateTime,
        rowA.original.end.dateTime,
      );
      const statusB = getEventStatus(
        rowB.original.start.dateTime,
        rowB.original.end.dateTime,
      );
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