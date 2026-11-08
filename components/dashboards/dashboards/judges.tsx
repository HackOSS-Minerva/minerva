import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { schema as judgeSchema } from "@/components/forms/fields/judge";
import {
  RiFileCopyLine,
  RiPhoneLine,
  RiShirtLine,
  RiUserLine,
  RiTableLine,
} from "@remixicon/react";
import { useCopyWithTimeout } from "@/hooks/use-copy";
import { StatusIcon } from "../status-icon";
import { Label } from "@/components/ui/label";

import Image from "next/image";
import { formatShirtSize } from "@/lib/localization";
import { selectColumn } from "../profile-drawer";
import { MemberSheet, type MemberSectionConfig } from "../member-sheet";

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

const sections: MemberSectionConfig[] = [
  {
    title: "Contact",
    icon: RiUserLine,
    fields: [
      { key: "email", label: "Email", icon: RiUserLine, copyable: true },
      { key: "telephone", label: "Phone", icon: RiPhoneLine, copyable: true },
    ],
  },
  {
    title: "Preferences",
    icon: RiShirtLine,
    fields: [
      { key: "shirt", label: "Shirt Size", icon: RiShirtLine, format: (value) => formatShirtSize(String(value)) },
      { key: "dietrestriction", label: "Dietary Restrictions", icon: RiTableLine, format: (value) => String(value) || "None" },
    ],
  },
];

function TableCellViewer({ item }: { item: Doc<"judges"> }) {
  const { copy: copyText } = useCopyWithTimeout();

  const handleCopyEmail = () => {
    if (typeof item.email === "string") {
      copyText(item.email);
    }
  };

  return (
    <MemberSheet
      item={item}
      sections={sections}
      header=
        {<div className="flex flex-col items-center text-sm text-foreground">
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
              onClick={handleCopyEmail}
            >
              <RiFileCopyLine className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-lg font-semibold text-foreground">
              {item.firstname} {item.lastname}
            </p>
            <p className="text-sm text-muted-foreground">{item.organization}</p>
            <p className="text-sm text-muted-foreground">{item.title}</p>
          </div>
        </div>}
    />
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
