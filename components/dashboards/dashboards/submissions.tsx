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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RiCloseLine } from "@remixicon/react";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  RiUser2Line,
  RiExternalLinkLine as LinkIcon,
  RiGithubLine,
  RiFigmaLine,
  RiPresentationLine,
} from "@remixicon/react";
import DetailRow from "../row";
import { VettingSummary } from "../vetting-summary";
import { normalizeVettingStatus, reviewStatusMeta, visibleVettingStatus } from "../vetting-status";
import Link from "next/link";

type SubmissionRecord = Doc<"submissions">;

export const metadata = {
  title: "Submissions",
};

export const schema = undefined;

export const csvFields = [
  "teamName",
  "submitterEmail",
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
};

const formatCompactTimestamp = (ts: number): string => {
  const date = new Date(ts);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const LinkList = ({ links, fallback = "None" }: { links: string[]; fallback?: string }) => {
  if (!links || links.length === 0) return <span>{fallback}</span>;
  return (
    <div className="flex flex-col gap-1">
      {links.map((link, i) => (
        <Link
          key={i}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-primary underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          {link}
        </Link>
      ))}
    </div>
  );
};

const TableCellViewer = ({ item, readOnly }: { item: SubmissionRecord; readOnly?: boolean }) => {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="group h-auto max-w-full justify-start gap-1.5 px-1.5 py-1 text-left"
        >
          <span className="min-w-0 truncate font-medium text-foreground">{item.teamName}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-xl">
        <div className="flex h-full flex-col gap-5 px-4 py-5">
          <div className="flex items-start justify-between">
            <DrawerHeader className="w-full gap-1 p-0">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Team Name</p>
                  <DrawerTitle className="break-words">{item.teamName}</DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close submission">
                    <RiCloseLine className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
              <p className="text-sm text-muted-foreground">
                Submitted {formatTimestamp(item.timestamp)}
              </p>
            </DrawerHeader>
          </div>

          <div className="scrollbar-thin-custom flex-1 overflow-y-auto">
            <div className="grid gap-5">
              <VettingSummary
                submissionId={item._id}
                currentStatus={item.vetted}
                vettingStatus={normalizeVettingStatus(item.vettingStatus)}
                readOnly={readOnly}
              />

              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Project Details
                </p>
                <h3 className="text-base font-semibold">{item.projectName}</h3>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <div className="grid gap-4">
                <DetailRow
                  icon={LinkIcon}
                  label="Devpost"
                  value={
                    item.devpost ? (
                      <Link
                        href={item.devpost}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 transition-opacity hover:opacity-80"
                      >
                        {item.devpost}
                      </Link>
                    ) : (
                      "No devpost link"
                    )
                  }
                />

                <DetailRow
                  icon={RiGithubLine}
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
                  icon={RiFigmaLine}
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
                  icon={RiPresentationLine}
                  label="Canva / Presentation"
                  value={
                    item.canva && item.canva.length > 0 ? (
                      <LinkList links={item.canva} />
                    ) : item.presentation ? (
                      <Link
                        href={item.presentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 transition-opacity hover:opacity-80"
                      >
                        {item.presentation}
                      </Link>
                    ) : (
                      "No presentation link"
                    )
                  }
                />

                <DetailRow
                  icon={RiUser2Line}
                  label="Team Members"
                  value={
                    item.submitterEmail || item.invites.length > 0
                      ? [item.submitterEmail, ...item.invites]
                          .filter((email): email is string => Boolean(email))
                          .map((email, i) => (
                            <span key={i} className="block text-sm">
                              {email}
                            </span>
                          ))
                      : "No team emails"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const truncateDescription = (description: string, maxLength: number = 52): string => {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength).trim() + "...";
};

const ReviewCell = ({ item }: { item: SubmissionRecord }) => {
  const reviewStatus = item.vetted ?? "needs_review";
  const runStatus = normalizeVettingStatus(item.vettingStatus);
  const visibleStatus = visibleVettingStatus(reviewStatus, runStatus);
  const review = reviewStatusMeta[reviewStatus];
  const VisibleIcon = visibleStatus.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-auto inline-flex max-w-full items-center justify-end gap-1.5 px-1.5 text-sm">
            <VisibleIcon className={`h-4 w-4 shrink-0 ${visibleStatus.iconClass}`} />
            <span className="truncate">{visibleStatus.label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>
            {runStatus === "completed" ? review.label : `${visibleStatus.label} / ${review.label}`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="block truncate px-1.5 text-muted-foreground">
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
    cell: ({ row, table }) => {
      return <TableCellViewer item={row.original} readOnly={table.options.meta?.readOnly} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "projectName",
    header: "Project",
    cell: ({ row }) => (
      <Label className="block truncate px-1.5 text-muted-foreground">
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
    cell: ({ row }) => <ReviewCell item={row.original} />,
  },
];
