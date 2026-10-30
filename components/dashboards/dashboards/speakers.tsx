"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
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
import { RiFileCopyLine, RiCheckLine } from "@remixicon/react";
import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { useCopyWithTimeout } from "@/hooks/use-copy";
import { schema as speakerSchema } from "@/components/forms/fields/speaker";
import { StatusIcon } from "../status-icon";
import { formatShirtSize } from "@/lib/localization";
import { selectColumn, useDrawerDirection } from "../profile-drawer";

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

function TableCellViewer({ item }: { item: Doc<"speakers"> }) {
  const { copied, copy: copyText } = useCopyWithTimeout();
  const { copied: pictureCopied, copy: copyPicture } = useCopyWithTimeout();
  const direction = useDrawerDirection();

  const handleCopyEmail = () => {
    copyText(item.email);
  };

  const handleCopyPicture = () => {
    copyPicture(item.picture);
  };

  return (
    <Drawer direction={direction}>
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
            <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={handleCopyEmail}>
              {copied ? (
                <RiCheckLine className="h-4 w-4" />
              ) : (
                <RiFileCopyLine className="h-4 w-4" />
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
                    src={item.picture}
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
                    <RiCheckLine className="h-4 w-4" />
                  ) : (
                    <RiFileCopyLine className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Status</Label>
              <div>
                <StatusIcon status={item.status} />
              </div>
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

export const columns: ColumnDef<Doc<"speakers">>[] = [
  selectColumn(),
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
        <Label className="text-muted-foreground px-1.5">{row.original.email}</Label>
      </div>
    ),
  },
  {
    accessorKey: "telephone",
    header: "Phone",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">{row.original.telephone}</Label>
    ),
  },
  {
    accessorKey: "affiliation",
    header: () => <div>Affiliation</div>,
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">{row.original.affiliation}</Label>
    ),
  },
  {
    accessorKey: "shirt",
    header: () => <div>Shirt</div>,
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">{formatShirtSize(row.original.shirt)}</Label>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <StatusIcon status={row.original.status} />
      </div>
    ),
  },
];
