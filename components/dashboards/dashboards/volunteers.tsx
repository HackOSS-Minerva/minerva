import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { schema as volunteerSchema } from "@/components/forms/fields/volunteer";
import {
  RiMoonLine,
  RiSunCloudyLine,
  RiSunLine,
  RiUserLine,
  RiPhoneLine,
  RiMessageLine,
  RiShirtLine,
  RiTableLine,
} from "@remixicon/react";
import { StatusBadge } from "../status-icon";
import { Label } from "@/components/ui/label";
import { availabilities } from "@/data/information";
import { formatShirtSize } from "@/lib/localization";
import { selectColumn } from "../profile-drawer";
import { MemberSheet, type MemberSectionConfig } from "../member-sheet";

export const metadata = {
  title: "Volunteers",
};

export const schema = volunteerSchema;

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
  "availabilities",
  "privacy_policy_consent",
  "code_of_conduct_consent",
];

const getAvailabilityIcon = (availability: string) => {
  const time = availability.split(" ")[1]?.toLowerCase();
  switch (time) {
    case "morning":
      return RiSunCloudyLine;
    case "afternoon":
      return RiSunLine;
    case "evening":
      return RiSunLine;
    case "night":
      return RiMoonLine;
    default:
      return RiSunLine;
  }
};

const AvailabilityIcon = ({
  availability,
  isAvailable = true,
}: {
  availability: string;
  isAvailable: boolean;
}) => {
  const Icon = getAvailabilityIcon(availability) as React.ComponentType<{ className: string }>;
  return (
    <div
      className={`flex items-center justify-center p-1 rounded ${isAvailable ? "text-primary" : "text-gray-300"}`}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
};

const AllAvailabilities = ({ selected }: { selected: string[] }) => {
  const saturday = availabilities.filter((a) => a.startsWith("Saturday"));
  const sunday = availabilities.filter((a) => a.startsWith("Sunday"));
  const isAvailable = (availability: string) => selected.includes(availability);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Saturday</span>
        <div className="flex flex-wrap gap-1">
          {saturday.map((availability) => (
            <AvailabilityIcon
              key={availability}
              availability={availability}
              isAvailable={isAvailable(availability)}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Sunday</span>
        <div className="flex flex-wrap gap-1">
          {sunday.map((availability) => (
            <AvailabilityIcon
              key={availability}
              availability={availability}
              isAvailable={isAvailable(availability)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

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
        icon: RiTableLine,
        format: (value) => String(value) || "None",
      },
    ],
  },
  {
    title: "Attributes",
    icon: RiMoonLine,
    fields: [{ key: "availabilities", label: "Availabilities", icon: RiMoonLine }],
  },
  {
    title: "Profile",
    icon: RiUserLine,
    fields: [{ key: "gender", label: "Gender", icon: RiUserLine }],
  },
];

function TableCellViewer({ item }: { item: Doc<"volunteers"> }) {
  return <MemberSheet item={item} sections={sections} />;
}

export const columns: ColumnDef<Doc<"volunteers">>[] = [
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
    accessorKey: "shirt",
    header: () => <div>Shirt</div>,
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">{formatShirtSize(row.original.shirt)}</Label>
    ),
  },
  {
    accessorKey: "availabilities",
    header: () => <div>Availabilities</div>,
    cell: ({ row }) => <AllAvailabilities selected={row.original.availabilities} />,
  },
  {
    accessorKey: "dietrestriction",
    header: () => <div>Diet Restrictions</div>,
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">{row.original.dietrestriction}</Label>
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
