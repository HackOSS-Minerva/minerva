import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { schema as speakerSchema } from "@/components/forms/fields/speaker";
import { RiPhoneLine, RiShirtLine, RiUserLine, RiTableLine, RiUser2Line, RiGraduationCapLine, RiCalendarLine } from "@remixicon/react";
import { StatusIcon } from "../status-icon";
import { Label } from "@/components/ui/label";
import { DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { formatShirtSize } from "@/lib/localization";
import { selectColumn } from "../profile-drawer";
import { MemberSheet, type MemberSectionConfig } from "../member-sheet";

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

const sections: MemberSectionConfig[] = [
  {
    title: "Contact",
    icon: RiUserLine,
    fields: [
      { key: "telephone", label: "Phone", icon: RiPhoneLine, copyable: true },
    ],
  },
  {
    title: "Preferences",
    icon: RiShirtLine,
    fields: [
      { key: "shirt", label: "Shirt Size", icon: RiShirtLine, format: (value) => formatShirtSize(String(value)) },
      { key: "dietrestriction", label: "Diet Restriction", icon: RiTableLine },
    ],
  },
  {
    title: "Information",
    icon: RiUserLine,
    fields: [
      { key: "gender", label: "Gender", icon: RiUserLine },
      { key: "affiliation", label: "Affiliation", icon: RiUser2Line },
      { key: "title", label: "Title", icon: RiGraduationCapLine },
      { key: "organization", label: "Organization", icon: RiCalendarLine },
    ],
  },
];

function TableCellViewer({ item }: { item: Doc<"speakers"> }) {
  return (
    <MemberSheet
      item={item}
      sections={sections}
      header=
        {<div className="flex flex-col gap-2 text-sm text-foreground">
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
        </div>}
    />
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
