import { Label } from "@/components/ui/label";

import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { schema as participantSchema } from "@/components/forms/fields/participant";
import {
  RiBriefcaseLine,
  RiCakeLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiGraduationCapLine,
  RiPhoneLine,
  RiScrollToBottomLine,
  RiShirtLine,
  RiUserLine,
  RiMessageLine,
  RiFileCopyLine,
  RiFileTextLine,
} from "@remixicon/react";
import { StatusBadge } from "../status-icon";
import { selectColumn } from "../profile-drawer";
import { formatShirtSize } from "@/lib/localization";
import { Button } from "@/components/ui/button";

import { MemberSheet, type MemberSectionConfig } from "../member-sheet";

export const metadata = {
  title: "Participants",
};

export const schema = participantSchema;

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
  "country",
  "school",
  "grade",
  "mlh_marketing",
  "resume",
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
      {
        key: "shirt",
        label: "Shirt Size",
        icon: RiShirtLine,
        format: (value) => formatShirtSize(String(value)),
      },
      {
        key: "dietrestriction",
        label: "Dietary Restrictions",
        icon: RiFileTextLine,
        format: (value) => String(value) || "None",
      },
    ],
  },
  {
    title: "Attributes",
    icon: RiScrollToBottomLine,
    fields: [
      { key: "school", label: "School", icon: RiScrollToBottomLine },
      { key: "country", label: "Country", icon: RiUserLine },
      {
        key: "resume",
        label: "Resume",
        icon: RiFileTextLine,
        render: (item, copyText, copied) => {
          const resume = item.resume;
          if (!resume) return "No Resume Attached";
          const fullName =
            `${(item.firstname as string) || ""} ${(item.lastname as string) || ""}`.trim();
          const displayName = fullName || "Participant";
          return (
            <div className="flex items-center gap-2">
              <span className="truncate flex-1 text-left">{displayName} Resume</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => {
                  try {
                    window.open(resume as string, "_blank");
                  } catch {}
                }}
              >
                <RiExternalLinkLine />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => copyText?.(resume as string)}
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
    fields: [
      { key: "gender", label: "Gender", icon: RiUserLine },
      { key: "grade", label: "Grade", icon: RiBriefcaseLine },
      { key: "major", label: "Major", icon: RiGraduationCapLine },
      { key: "age", label: "Age", icon: RiCakeLine },
    ],
  },
];

function TableCellViewer({ item }: { item: Doc<"participants"> }) {
  return <MemberSheet item={item} sections={sections} />;
}

export const columns: ColumnDef<Doc<"participants">>[] = [
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
    accessorKey: "discord",
    header: "Discord",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">{row.original.discord}</Label>
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
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
];
