"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconCircleX,
  IconX,
} from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  PanelRightOpen,
  Users,
  Link as LinkIcon,
  Github,
  Figma,
  Presentation,
} from "lucide-react";
import DetailRow from "../row";
import { VettingSummary } from "../vetting-summary";

interface SubmissionRecord {
  _id: string;
  _creationTime: number;
  teamName: string;
  projectName: string;
  description: string;
  devpost: string;
  github: string[];
  figma: string[];
  canva: string[];
  presentation?: string;
  invites: string[];
  tenant: string;
  vetted: "verified" | "needs_review" | "disqualified";
  vettingStatus?: "not_started" | "queued" | "running" | "completed" | "failed";
  latestVettingRunId?: string;
  lastVettedAt?: number;
  timestamp: number;
}

export const metadata = {
  title: "Submissions",
};

export const schema = undefined;

export const csvFields = [
  "teamName",
  "projectName",
  "description",
  "devpost",
  "github",
  "figma",
  "canva",
  "presentation",
  "invites",
  "vetted",
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

function formatCompactTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function LinkList({
  links,
  fallback = "None",
}: {
  links: string[];
  fallback?: string;
}) {
  if (!links || links.length === 0) return <span>{fallback}</span>;
  return (
    <div className="flex flex-col gap-1">
      {links.map((link, i) => (
        <a
          key={i}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
        >
          {link}
        </a>
      ))}
    </div>
  );
}

function TableCellViewer({ item }: { item: SubmissionRecord }) {
  const isMobile = useIsMobile();

  return (
    <SubmissionDetailsDrawer
      item={item}
      direction={isMobile ? "bottom" : "right"}
      trigger={
        <Button
          variant="ghost"
          className="group h-auto max-w-full justify-start gap-1.5 px-1.5 py-1 text-left"
        >
          <span className="min-w-0 truncate font-medium text-foreground">
            {item.teamName}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
            <PanelRightOpen className="h-3.5 w-3.5" />
          </span>
        </Button>
      }
    />
  );
}

function SubmissionDetailsDrawer({
  item,
  direction,
  trigger,
  open,
  onOpenChange,
}: {
  item: SubmissionRecord;
  direction: "bottom" | "right";
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Drawer direction={direction} open={open} onOpenChange={onOpenChange}>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <SubmissionDetailsContent item={item} />
    </Drawer>
  );
}

function SubmissionDetailsContent({ item }: { item: SubmissionRecord }) {
  return (
    <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
      <div className="flex h-full flex-col gap-5 px-4 py-5">
        <div className="flex items-start justify-between">
          <DrawerHeader className="gap-1 p-0 w-full">
            <div className="flex items-center justify-between w-full">
              <DrawerTitle>{item.teamName}</DrawerTitle>
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close submission"
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            <p className="text-sm text-muted-foreground">
              Submitted {formatTimestamp(item.timestamp)}
            </p>
          </DrawerHeader>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:theme(colors.border)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
          <div className="grid gap-5">
            <VettingSummary submissionId={item._id} />

            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Project details
              </p>
              <h3 className="text-base font-semibold">{item.projectName}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            <div className="grid gap-4">
              <DetailRow
                icon={LinkIcon}
                label="Devpost"
                value={
                  item.devpost ? (
                    <a
                      href={item.devpost}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      {item.devpost}
                    </a>
                  ) : (
                    "No devpost link"
                  )
                }
              />

              <DetailRow
                icon={Github}
                label="GitHub"
                value={
                  item.github && item.github.length > 0 ? (
                    <LinkList links={item.github} />
                  ) : (
                    "No GitHub links"
                  )
                }
              />

              <DetailRow
                icon={Figma}
                label="Figma"
                value={
                  item.figma && item.figma.length > 0 ? (
                    <LinkList links={item.figma} />
                  ) : (
                    "No Figma links"
                  )
                }
              />

              <DetailRow
                icon={Presentation}
                label="Canva / Presentation"
                value={
                  item.canva && item.canva.length > 0 ? (
                    <LinkList links={item.canva} />
                  ) : item.presentation ? (
                    <a
                      href={item.presentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      {item.presentation}
                    </a>
                  ) : (
                    "No presentation link"
                  )
                }
              />

              <DetailRow
                icon={Users}
                label="Team Members"
                value={
                  item.invites && item.invites.length > 0
                    ? item.invites.map((email, i) => (
                        <span key={i} className="block text-sm">
                          {email}
                        </span>
                      ))
                    : "No invites"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </DrawerContent>
  );
}

function truncateDescription(
  description: string,
  maxLength: number = 52,
): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength).trim() + "...";
}

const vettedConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  verified: {
    icon: IconCircleCheck,
    color: "text-emerald-500",
    label: "Verified",
  },
  needs_review: {
    icon: IconAlertTriangle,
    color: "text-amber-500",
    label: "Needs Review",
  },
  disqualified: {
    icon: IconCircleX,
    color: "text-red-500",
    label: "Disqualified",
  },
};

const vettingStatusConfig: Record<
  NonNullable<SubmissionRecord["vettingStatus"]>,
  { icon: React.ElementType; color: string; label: string }
> = {
  not_started: {
    icon: IconAlertTriangle,
    color: "text-muted-foreground",
    label: "Not Started",
  },
  queued: {
    icon: IconAlertTriangle,
    color: "text-blue-500",
    label: "Queued",
  },
  running: {
    icon: IconAlertTriangle,
    color: "text-blue-500",
    label: "Running",
  },
  completed: {
    icon: IconCircleCheck,
    color: "text-emerald-500",
    label: "Completed",
  },
  failed: {
    icon: IconCircleX,
    color: "text-red-500",
    label: "Failed",
  },
};

function ReviewCell({ item }: { item: SubmissionRecord }) {
  const vetted = item.vetted ?? "needs_review";
  const vettedStatus = vettedConfig[vetted];
  const status = item.vettingStatus ?? "not_started";
  const runStatus = vettingStatusConfig[status];

  if (!vettedStatus || !runStatus) {
    return <span className="text-muted-foreground px-1.5">-</span>;
  }

  const showRunStatus = status === "queued" || status === "running";
  const visibleStatus = showRunStatus ? runStatus : vettedStatus;
  const VisibleIcon = visibleStatus.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-auto inline-flex max-w-full items-center justify-end gap-1.5 px-1.5 text-sm">
            <VisibleIcon
              className={`h-4 w-4 shrink-0 ${visibleStatus.color}`}
            />
            <span className="truncate whitespace-nowrap">
              {visibleStatus.label}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>
            {vettedStatus.label} / {runStatus.label}
            {item.lastVettedAt
              ? ` at ${formatTimestamp(item.lastVettedAt)}`
              : ""}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const columns: ColumnDef<SubmissionRecord>[] = [
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
    accessorKey: "timestamp",
    header: "Submitted",
    cell: ({ row }) => (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="text-muted-foreground block truncate px-1.5 whitespace-nowrap">
              {formatCompactTimestamp(row.original.timestamp)}
            </Label>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{formatTimestamp(row.original.timestamp)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "teamName",
    header: "Team",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "projectName",
    header: "Project",
    cell: ({ row }) => (
      <Label className="text-muted-foreground block truncate px-1.5">
        {row.original.projectName}
      </Label>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="block truncate px-1.5 text-sm text-muted-foreground">
        {truncateDescription(row.original.description)}
      </span>
    ),
  },
  {
    accessorKey: "vetted",
    header: "Review",
    cell: ({ row }) => {
      return <ReviewCell item={row.original} />;
    },
  },
];
