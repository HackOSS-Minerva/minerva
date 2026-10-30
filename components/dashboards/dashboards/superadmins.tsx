import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { RiCloseLine } from "@remixicon/react";
import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { schema as superadminSchema } from "@/components/forms/fields/superadmin";
import { StatusIcon } from "../status-icon";
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
import DetailRow from "../row";
import { selectColumn, useDrawerDirection } from "../profile-drawer";
import { useCopyWithTimeout } from "@/hooks/use-copy";
import { formatShirtSize } from "@/lib/localization";

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

function TableCellViewer({ item }: { item: Doc<"superadmins"> }) {
  const { copied, copy: copyText } = useCopyWithTimeout();
  const direction = useDrawerDirection();

  const handleCopyEmail = () => {
    copyText(item.email);
  };

  return (
    <Drawer direction={direction}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.firstname + " " + item.lastname}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex h-full flex-col px-4 py-5 gap-2 overflow-y-auto">
          <div className="flex items-start justify-between">
            <DrawerTitle>Profile</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close profile">
                <RiCloseLine className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>

          <div className="flex flex-col items-center text-sm text-foreground">
            <div className="gap-2 text-center">
              <p className="text-lg font-semibold text-foreground">
                {item.firstname} {item.lastname}
              </p>
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
                  icon={RiUserLine}
                  label="Email"
                  value={item.email}
                  copyable
                  onCopy={handleCopyEmail}
                  copied={copied}
                />
                <DetailRow icon={RiPhoneLine} label="Phone" value={item.telephone} />
                <DetailRow icon={RiMessageLine} label="Discord" value={item.discord} />
              </div>
            </div>
            <hr />
            <div>
              <p className="text-sm font-semibold text-foreground">Admin Information</p>
              <div className="mt-2 space-y-2">
                <DetailRow icon={RiGraduationCapLine} label="Major" value={item.major} />
                <DetailRow icon={RiUser2Line} label="Team" value={item.team} />
                <DetailRow icon={RiCalendarLine} label="Grade" value={item.grade} />
                <DetailRow label="Age" value={item.age} icon={RiUserLine} />
                <DetailRow label="Gender" value={item.gender} icon={RiUserLine} />
              </div>
            </div>
            <hr />
            <div>
              <p className="text-sm font-semibold text-foreground">Preferences</p>
              <div className="mt-2 space-y-2">
                <DetailRow
                  icon={RiShirtLine}
                  label="Shirt Size"
                  value={formatShirtSize(item.shirt)}
                />
                <DetailRow
                  icon={RiTableLine}
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
