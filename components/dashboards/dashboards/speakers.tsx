"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconDotsVertical, IconCopy, IconCheck } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { schema as speakerSchema } from "@/components/forms/fields/speaker";
import { statuses, variants } from "@/data/status";
import { Badge } from "@/components/ui/badge";
import { formatShirtSize } from "@/lib/utils";

export const metadata = {
  title: "Speakers",
};

export const schema = speakerSchema;

export const csvFields = [
  "firstname",
  "lastname",
  "email",
  "telephone",
  "gender",
  "shirt",
  "dietrestriction",
  "status",
  "affiliation",
  "title",
  "organization",
  "picture",
  "privacy_policy_consent",
  "code_of_conduct_consent",
];

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [pictureCopied, setPictureCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(item.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPicture = () => {
    navigator.clipboard.writeText(item.picture as unknown as string);
    setPictureCopied(true);
    setTimeout(() => setPictureCopied(false), 2000);
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.firstname + " " + item.lastname}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>
            {item.firstname} {item.lastname}
          </DrawerTitle>
          <DrawerDescription className="flex items-center gap-2">
            {item.email}
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={handleCopyEmail}
            >
              {copied ? (
                <IconCheck className="h-4 w-4" />
              ) : (
                <IconCopy className="h-4 w-4" />
              )}
            </Button>
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Phone</Label>
              <p>{item.telephone}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Gender</Label>
              <p>{item.gender}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Shirt Size</Label>
              <p>{item.shirt}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Affiliation</Label>
              <p>{item.affiliation}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Title</Label>
              <p>{item.title}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Organization</Label>
              <p>{item.organization}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Diet Restriction</Label>
              <p>{item.dietrestriction}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground">Picture</Label>
              <div className="flex items-center gap-3">
                <div className="relative h-32 w-32 overflow-hidden rounded-md border border-border bg-muted text-center">
                  <Image
                    src={item.picture as unknown as string}
                    alt={`${item.firstname} ${item.lastname}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 shrink-0"
                  onClick={handleCopyPicture}
                >
                  {pictureCopied ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    <IconCopy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Status</Label>
              <Select defaultValue={item.status || "PENDING"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export const columns: ColumnDef<z.infer<typeof schema>>[] = [
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
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="w-32">
        <Label className="text-muted-foreground px-1.5">
          {row.original.email}
        </Label>
      </div>
    ),
  },
  {
    accessorKey: "telephone",
    header: "Phone",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.telephone}
      </Label>
    ),
  },
  {
    accessorKey: "affiliation",
    header: () => <div>Affiliation</div>,
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.affiliation}
      </Label>
    ),
  },
  {
    accessorKey: "shirt",
    header: () => <div>Shirt</div>,
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {formatShirtSize(row.original.shirt)}
      </Label>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge className={variants[status]}>{status}</Badge>;
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
