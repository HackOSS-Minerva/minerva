import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { schema as participantSchema } from "@/components/forms/fields/participant";
import {
  BriefcaseBusiness,
  Cake,
  Globe,
  GraduationCap,
  Phone,
  ScrollText,
  Shirt,
  UserRound,
  MessagesSquare,
  FileText,
  MapPin,
  Utensils,
} from "lucide-react";
import { variants } from "@/data/status";
import { Badge } from "@/components/ui/badge";
import DetailRow from "../row";
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

const statusCircleClass: Record<string, string> = {
  ACCEPTANCE: "bg-green-500",
  PENDING: "bg-yellow-500",
  REJECTION: "bg-red-500",
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
        <div className="flex h-full flex-col gap-5 px-4 py-5">
          <div className="flex items-start justify-between">
            <DrawerHeader className="gap-1 p-0 w-full">
              <div className="flex items-center justify-between w-full">
                <DrawerTitle>
                  {item.firstname} {item.lastname}
                </DrawerTitle>

                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close profile"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    statusCircleClass[item.status]
                  }`}
                />
                <p className="font-semibold text-foreground">{item.status}</p>
              </div>
            </DrawerHeader>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto text-sm">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Contact</p>
              <div className="grid gap-3">
                <DetailRow
                  icon={UserRound}
                  label="Email"
                  value={item.email}
                  copyable
                  onCopy={handleCopyEmail}
                  copied={copied}
                />
                <DetailRow icon={Phone} label="Phone" value={item.telephone} />
                <DetailRow
                  icon={MessagesSquare}
                  label="Discord"
                  value={item.discord}
                />
                <DetailRow
                  icon={UserRound}
                  label="Gender"
                  value={item.gender}
                />
                <DetailRow
                  icon={Shirt}
                  label="Shirt Size"
                  value={formatShirtSize(item.shirt)}
                />
              </div>
            </div>

            <hr />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Application
              </p>
              <div className="grid gap-3">
                <DetailRow
                  icon={GraduationCap}
                  label="School"
                  value={item.school}
                />
                <DetailRow icon={ScrollText} label="Grade" value={item.grade} />
                <DetailRow
                  icon={BriefcaseBusiness}
                  label="Major"
                  value={item.major}
                />
                <DetailRow icon={Cake} label="Age" value={item.age} />
                <DetailRow icon={Globe} label="Country" value={item.country} />
                <DetailRow
                  icon={Utensils}
                  label="Dietary Restrictions"
                  value={item.dietrestriction || "None"}
                />
                <DetailRow
                  icon={FileText}
                  label="Resume"
                  value={
                    item.resume
                      ? (item.resume as unknown as string)
                      : "Not Attached"
                  }
                />
              </div>
            </div>
          </div>
        </div>
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
    accessorKey: "shirt",
    header: () => <div>Shirt</div>,
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {formatShirtSize(row.original.shirt)}
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
