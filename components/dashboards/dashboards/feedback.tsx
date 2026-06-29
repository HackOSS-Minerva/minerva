"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IconDotsVertical, IconX } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { Star, Calendar, MessageSquare, ThumbsDown, HelpCircle } from "lucide-react";
import DetailRow from "../row";

interface FeedbackRecord {
  _id: string;
  _creationTime: number;
  find: string;
  liked_to_see: string;
  not_beneficial: string;
  rating: number;
  anything_else: string;
  tenant: string;
  timestamp: number;
}

export const metadata = {
  title: "Feedback",
};

export const csvFields = [
  "find",
  "liked_to_see",
  "not_beneficial",
  "rating",
  "anything_else",
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

function formatLabel(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }, (_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">({rating}/10)</span>
    </div>
  );
}

function TableCellViewer({ item }: { item: FeedbackRecord }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {formatLabel(item.find)}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex h-full flex-col gap-5 px-4 py-5">
          <div className="flex items-start justify-between">
            <DrawerHeader className="gap-1 p-0 w-full">
              <div className="flex items-center justify-between w-full">
                <DrawerTitle>Feedback Details</DrawerTitle>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close feedback"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto text-sm">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Summary</p>
              <div className="grid gap-3">
                <DetailRow
                  icon={HelpCircle}
                  label="Found Via"
                  value={formatLabel(item.find)}
                />
                <DetailRow
                  icon={Star}
                  label="Rating"
                  value={<RatingBadge rating={item.rating} />}
                />
                <DetailRow
                  icon={Calendar}
                  label="Submitted"
                  value={formatTimestamp(item.timestamp)}
                />
              </div>
            </div>

            <hr />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Responses</p>
              <div className="grid gap-3">
                <DetailRow
                  icon={MessageSquare}
                  label="Liked to See"
                  value={item.liked_to_see}
                />
                <DetailRow
                  icon={ThumbsDown}
                  label="Not Beneficial"
                  value={item.not_beneficial}
                />
                <DetailRow
                  icon={MessageSquare}
                  label="Anything Else"
                  value={item.anything_else || "No additional comments"}
                />
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const columns: ColumnDef<FeedbackRecord>[] = [
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
    accessorKey: "find",
    header: "Found Via",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "liked_to_see",
    header: "Liked to See",
    cell: ({ row }) => (
      <div className="max-w-48">
        <Label className="text-muted-foreground px-1.5 line-clamp-2">
          {row.original.liked_to_see}
        </Label>
      </div>
    ),
  },
  {
    accessorKey: "not_beneficial",
    header: "Not Beneficial",
    cell: ({ row }) => (
      <div className="max-w-48">
        <Label className="text-muted-foreground px-1.5 line-clamp-2">
          {row.original.not_beneficial}
        </Label>
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        <RatingBadge rating={row.original.rating} />
      </Label>
    ),
  },
  {
    accessorKey: "timestamp",
    header: "Submitted",
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