import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { statuses, variants } from "@/data/status";
import { Badge } from "@/components/ui/badge";
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
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { schema as volunteerSchema } from "@/components/forms/fields/volunteer";
import { Sun, Moon, CloudSun, Sunset } from "lucide-react";
import { availabilities } from "@/data/information";
import { formatShirtSize } from "@/lib/utils";

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
      return CloudSun;
    case "afternoon":
      return Sun;
    case "evening":
      return Sunset;
    case "night":
      return Moon;
    default:
      return Sun;
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
        <span className="text-sm font-medium text-muted-foreground">
          Saturday
        </span>
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
        <span className="text-sm font-medium text-muted-foreground">
          Sunday
        </span>
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

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(item.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
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
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={handleCopyEmail}
            >
              {copied ? (
                <IconCheck className="h-4 w-4" />
              ) : (
                <IconCopy className="h-4 w-4" />
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
              <Select defaultValue={item.status || "PENDING"}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
    accessorKey: "discord",
    header: "Discord",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.discord}
      </Label>
    ),
  },
  {
    accessorKey: "telephone",
    header: "Telephone",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.telephone}
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
    accessorKey: "availabilities",
    header: () => <div>Availabilities</div>,
    cell: ({ row }) => (
      <AllAvailabilities selected={row.original.availabilities} />
    ),
  },
  {
    accessorKey: "dietrestriction",
    header: () => <div>Diet Restrictions</div>,
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.dietrestriction}
      </Label>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <Badge className={variants[status]}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ table, row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            variant="destructive"
            onClick={() =>
              table.options.meta?.onDelete(row.original._id as number)
            }
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
