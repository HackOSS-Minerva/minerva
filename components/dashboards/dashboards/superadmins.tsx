import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { schema as superadminSchema } from "@/components/forms/fields/superadmin";
import {
  RiPhoneLine,
  RiUserLine,
  RiShirtLine,
  RiTableLine,
  RiMessageLine,
  RiGraduationCapLine,
  RiUser2Line,
  RiCalendarLine,
} from "@remixicon/react";

import { StatusIcon } from "../status-icon";

import { Label } from "@/components/ui/label";
import {
} from "@/components/ui/drawer";
import { formatShirtSize } from "@/lib/localization";
import { selectColumn } from "../profile-drawer";
import { MemberSheet, type MemberSectionConfig } from "../member-sheet";

export const metadata = {
  title: "Superadmins",
};

export const schema = superadminSchema;

export const csvFields = [
  "firstname",
  "lastname",
  "email",
  "telephone",
  "gender",
  "shirt",
  "dietrestriction",
  "status",
  "discord",
  "major",
  "age",
  "grade",
  "team",
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
      { key: "discord", label: "Discord", icon: RiMessageLine, copyable: true },
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
  {
    title: "Attributes",
    icon: RiUser2Line,
    fields: [
      { key: "team", label: "Team", icon: RiUser2Line },
    ],
  },
  {
    title: "Profile",
    icon: RiGraduationCapLine,
    fields: [
      { key: "gender", label: "Gender", icon: RiUserLine },
      { key: "major", label: "Major", icon: RiGraduationCapLine },
      { key: "grade", label: "Grade", icon: RiCalendarLine },
      { key: "age", label: "Age", icon: RiUserLine },
    ],
  },
];

function TableCellViewer({ item }: { item: Doc<"superadmins"> }) {
  return (
    <MemberSheet
      item={item}
      sections={sections}
    />
  );
}

export const columns: ColumnDef<Doc<"superadmins">>[] = [
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
    accessorKey: "discord",
    header: "Discord",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">{row.original.discord}</Label>
    ),
  },
  {
    accessorKey: "team",
    header: () => <div>Team</div>,
    cell: ({ row }) => <Label className="text-muted-foreground px-1.5">{row.original.team}</Label>,
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
