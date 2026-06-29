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
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  IconDotsVertical,
  IconCopy,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { schema as judgeSchema } from "@/components/forms/fields/judge";
import { variants } from "@/data/status";
import { Badge } from "@/components/ui/badge";
import { Phone, Shirt, UserRound, Utensils } from "lucide-react";
import DetailRow from "../row";
import { formatShirtSize } from "@/lib/utils";

export const metadata = {
  title: "Judges",
};

export const schema = judgeSchema;

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

  const statusCircleClass: Record<string, string> = {
    ACCEPTANCE: "bg-green-500",
    PENDING: "bg-yellow-500",
    REJECTION: "bg-red-500",
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.firstname + " " + item.lastname}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex h-full flex-col px-4 py-5 gap-2">
          <div className="flex items-start justify-between">
            <DrawerTitle>Profile</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close profile">
                <IconX className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>

          <div className="flex flex-col items-center text-sm text-foreground">
            <div className="relative h-64 w-64 overflow-hidden rounded-2xl border border-border">
              <Image
                src={item.picture as unknown as string}
                alt={`${item.firstname} ${item.lastname}`}
                fill
                sizes="128px"
                className="object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background text-sm text-muted-foreground"
                onClick={handleCopyPicture}
              >
                {pictureCopied ? (
                  <IconCheck className="h-4 w-4" />
                ) : (
                  <IconCopy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="gap-2 text-center">
              <p className="text-lg font-semibold text-foreground">
                {item.firstname} {item.lastname}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.organization}
              </p>
              <p className="text-sm text-muted-foreground">{item.title}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                statusCircleClass[item.status]
              }`}
            />
            <p className="font-semibold text-foreground">{item.status}</p>
          </div>
          <hr />
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-sm font-semibold text-foreground">Contact</p>
              <div className="mt-2 space-y-2">
                <DetailRow
                  icon={UserRound}
                  label="Email"
                  value={item.email}
                  copyable
                  onCopy={handleCopyEmail}
                  copied={copied}
                />
                <DetailRow icon={Phone} label="Phone" value={item.telephone} />
              </div>
            </div>
            <hr />
            <div>
              <div className="mt-2 space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Application
                </p>
                <DetailRow
                  icon={Shirt}
                  label="Shirt Size"
                  value={formatShirtSize(item.shirt)}
                />
                <DetailRow
                  icon={Utensils}
                  label="Dietary Restrictions"
                  value={item.dietrestriction || "None"}
                />
              </div>
            </div>
          </div>
        </div>
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
