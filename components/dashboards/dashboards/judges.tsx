"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IconCopy, IconCheck, IconX } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { useCopyWithTimeout } from "@/hooks/use-copy";
import { schema as judgeSchema } from "@/components/forms/fields/judge";
import { StatusIcon } from "../status-icon";
import { Phone, Shirt, UserRound, Utensils } from "lucide-react";
import DetailRow from "../row";
import { selectColumn, useDrawerDirection } from "../profile-drawer";
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

function TableCellViewer({ item }: { item: Doc<"judges"> }) {
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
                src={item.picture}
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
            <StatusIcon status={item.status} />
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

export const columns: ColumnDef<Doc<"judges">>[] = [
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
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <StatusIcon status={row.original.status} />
      </div>
    ),
  },
];
