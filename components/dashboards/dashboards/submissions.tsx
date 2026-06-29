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
import { IconDotsVertical, IconX } from "@tabler/icons-react";
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
  Calendar,
  Users,
  FolderOpen,
  Link as LinkIcon,
  Github,
  Figma,
  Presentation,
  Mail,
  FileText,
} from "lucide-react";
import DetailRow from "../row";

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
  workos: string;
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
              <p className="text-sm text-muted-foreground">{item.projectName}</p>
            </DrawerHeader>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto text-sm">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Overview</p>
              <div className="grid gap-3">
                <DetailRow
                  icon={Users}
                  label="Team Name"
                  value={item.teamName}
                />
                <DetailRow
                  icon={FolderOpen}
                  label="Project Name"
                  value={item.projectName}
                />
                <DetailRow
                  icon={FileText}
                  label="Project Description"
                  value={item.description}
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
              <p className="text-sm font-semibold text-foreground">Links</p>
              <div className="grid gap-3">
                <DetailRow
                  icon={LinkIcon}
                  label="Devpost"
                  value={
                    <a
                      href={item.devpost}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
                    >
                      {item.devpost}
                    </a>
                  }
                />
                <DetailRow
                  icon={Github}
                  label="GitHub"
                  value={
                    <LinkList links={item.github} fallback="No GitHub links" />
                  }
                />
                <DetailRow
                  icon={Figma}
                  label="Figma"
                  value={
                    <LinkList links={item.figma} fallback="No Figma links" />
                  }
                />
                <DetailRow
                  icon={Presentation}
                  label="Canva"
                  value={
                    <LinkList links={item.canva} fallback="No Canva links" />
                  }
                />
                {item.presentation && (
                  <DetailRow
                    icon={Presentation}
                    label="Presentation"
                    value={
                      <a
                        href={item.presentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
                      >
                        {item.presentation}
                      </a>
                    }
                  />
                )}
              </div>
            </div>

            <hr />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Team</p>
              <div className="grid gap-3">
                <DetailRow
                  icon={Mail}
                  label="Invites"
                  value={
                    item.invites && item.invites.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.invites.map((inv, i) => (
                          <span key={i}>{inv}</span>
                        ))}
                      </div>
                    ) : (
                      "No invites"
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function truncateDescription(description: string, maxLength: number = 75): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength).trim() + "...";
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
              table.options.meta?.onDelete(row.original._id as number)
            }
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
