"use client";

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
  IconDotsVertical,
  IconX,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import {
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
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.teamName}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
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

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-5">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{item.projectName}</h3>
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

                <VettingSummary submissionId={item._id} />
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function truncateDescription(
  description: string,
  maxLength: number = 75,
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
      <Label className="text-muted-foreground px-1.5 whitespace-nowrap">
        {formatTimestamp(row.original.timestamp)}
      </Label>
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
      <Label className="text-muted-foreground px-1.5">
        {row.original.projectName}
      </Label>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-muted-foreground px-1.5 text-sm">
        {truncateDescription(row.original.description)}
      </span>
    ),
  },
  {
    accessorKey: "devpost",
    header: "Devpost",
    cell: ({ row }) => (
      <a
        href={row.original.devpost}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 text-sm px-1.5 hover:opacity-80 transition-opacity"
      >
        View Submission
      </a>
    ),
  },
  {
    accessorKey: "vetted",
    header: "Vetted",
    cell: ({ row }) => {
      const vetted = row.original.vetted ?? "needs_review";
      const config = vettedConfig[vetted];
      if (!config) {
        return <span className="text-muted-foreground px-1.5">-</span>;
      }
      const Icon = config.icon;
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center justify-center px-1.5 cursor-pointer">
                <Icon className={`h-5 w-5 ${config.color}`} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{config.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "vettingStatus",
    header: "Vetting",
    cell: ({ row }) => {
      const status = row.original.vettingStatus ?? "not_started";
      const config = vettingStatusConfig[status];
      const Icon = config.icon;

      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1.5 px-1.5 text-sm text-muted-foreground">
                <Icon className={`h-4 w-4 ${config.color}`} />
                <span className="hidden xl:inline">{config.label}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>
                {config.label}
                {row.original.lastVettedAt
                  ? ` at ${formatTimestamp(row.original.lastVettedAt)}`
                  : ""}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
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
            onClick={() => table.options.meta?.onDelete(row.original._id)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
