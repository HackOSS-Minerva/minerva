import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { schema as judgeSchema } from "@/components/forms/fields/judge";
import {
  RiCheckLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiPhoneLine,
  RiShirtLine,
  RiUserLine,
  RiTableLine,
  RiUser2Line,
  RiGraduationCapLine,
  RiCalendarLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { StatusIcon } from "../status-icon";
import { Label } from "@/components/ui/label";
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
      {
        key: "shirt",
        label: "Shirt Size",
        icon: RiShirtLine,
        format: (value) => formatShirtSize(String(value)),
      },
      {
        key: "dietrestriction",
        label: "Dietary Restrictions",
        icon: RiTableLine,
        format: (value) => String(value) || "None",
      },
    ],
  },
  {
    title: "Attributes",
    icon: RiUserLine,
    fields: [
      { key: "affiliation", label: "Affiliation", icon: RiUser2Line },
      { key: "title", label: "Title", icon: RiGraduationCapLine },
      { key: "organization", label: "Organization", icon: RiCalendarLine },
      {
        key: "picture",
        label: "Picture",
        icon: RiUserLine,
        render: (item, copyText, copied) => {
          const picture = item.picture;
          if (!picture) return "No Picture";
          const fullName =
            `${(item.firstname as string) || ""} ${(item.lastname as string) || ""}`.trim();
          const displayName = fullName || "Judge";
          return (
            <div className="flex items-center gap-1">
              <span className="truncate flex-1 text-left">{displayName} Picture</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => {
                  try {
                    window.open(picture as string, "_blank");
                  } catch {}
                }}
              >
                <RiExternalLinkLine />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => copyText?.(picture as string)}
              >
                {copied ? <RiCheckLine /> : <RiFileCopyLine />}
              </Button>
            </div>
          );
        },
      },
    ],
  },
  {
    title: "Profile",
    icon: RiUserLine,
    fields: [{ key: "gender", label: "Gender", icon: RiUserLine }],
  },
];

function TableCellViewer({ item }: { item: Doc<"judges"> }) {
  return <MemberSheet item={item} sections={sections} />;
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
