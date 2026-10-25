import { Button } from "@/components/ui/button";
import { RiFileCopyLine, RiCheckLine } from "@remixicon/react";
import { useCopyWithTimeout } from "@/hooks/use-copy";
import { StatusIcon } from "../status-icon";
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
import { ColumnDef } from "@tanstack/react-table";
import type { Doc } from "@/convex/_generated/dataModel";
import { schema as volunteerSchema } from "@/components/forms/fields/volunteer";
import { RiSunLine, RiMoonLine, RiSunCloudyLine } from "@remixicon/react";
import { availabilities } from "@/data/information";
import { formatShirtSize } from "@/lib/utils";
import { selectColumn, useDrawerDirection } from "../profile-drawer";

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
  const Icon = getAvailabilityIcon(availability) as React.ComponentType<{
    className: string;
  }>;

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

function TableCellViewer({ item }: { item: Doc<"volunteers"> }) {
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
              <Label className="text-muted-foreground">Discord</Label>
              <p>{item.discord}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Gender</Label>
              <p>{item.gender}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Shirt Size</Label>
              <p>{formatShirtSize(item.shirt)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Availabilities</Label>
              <AllAvailabilities selected={item.availabilities} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-muted-foreground">Diet Restrictions</Label>
              <p>{item.dietrestriction}</p>
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
    accessorKey: "discord",
    header: "Discord",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">{row.original.discord}</Label>
    ),
  },
  {
    accessorKey: "telephone",
    header: "Telephone",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">{row.original.telephone}</Label>
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
        <StatusIcon status={row.original.status} />
      </div>
    ),
  },
];
