import { Button } from "@/components/ui/button";
import { RiCloseLine } from "@remixicon/react";
import { useCopyWithTimeout } from "@/hooks/use-copy";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { schema as participantSchema } from "@/components/forms/fields/participant";
import {
  RiBriefcaseLine,
  RiCakeLine,
  RiGlobeLine,
  RiGraduationCapLine,
  RiPhoneLine,
  RiScrollToBottomLine,
  RiShirtLine,
  RiUserLine,
  RiMessageLine,
  RiFileTextLine,
  RiTableLine,
} from "@remixicon/react";
import { StatusIcon } from "../status-icon";
import DetailRow from "../row";
import { selectColumn, useDrawerDirection } from "../profile-drawer";
import { formatShirtSize } from "@/lib/utils";

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

function TableCellViewer({ item }: { item: Doc<"participants"> }) {
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
        <div className="flex h-full flex-col gap-5 px-4 py-5">
          <div className="flex items-start justify-between">
            <DrawerHeader className="gap-1 p-0 w-full">
              <div className="flex items-center justify-between w-full">
                <DrawerTitle>
                  {item.firstname} {item.lastname}
                </DrawerTitle>

                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close profile">
                    <RiCloseLine className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>

              <div className="flex items-center gap-2">
                <StatusIcon status={item.status} />
              </div>
            </DrawerHeader>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto text-sm">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Contact</p>
              <div className="grid gap-3">
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
                <DetailRow icon={RiUserLine} label="Gender" value={item.gender} />
                <DetailRow
                  icon={RiShirtLine}
                  label="Shirt Size"
                  value={formatShirtSize(item.shirt)}
                />
              </div>
            </div>

            <hr />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Application</p>
              <div className="grid gap-3">
                <DetailRow icon={RiGraduationCapLine} label="School" value={item.school} />
                <DetailRow icon={RiScrollToBottomLine} label="Grade" value={item.grade} />
                <DetailRow icon={RiBriefcaseLine} label="Major" value={item.major} />
                <DetailRow icon={RiCakeLine} label="Age" value={item.age} />
                <DetailRow icon={RiGlobeLine} label="Country" value={item.country} />
                <DetailRow
                  icon={RiTableLine}
                  label="Dietary Restrictions"
                  value={item.dietrestriction || "None"}
                />
                <DetailRow
                  icon={RiFileTextLine}
                  label="Resume"
                  value={item.resume ? item.resume : "Not Attached"}
                />
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
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
        <StatusIcon status={row.original.status} />
      </div>
    ),
  },
];
