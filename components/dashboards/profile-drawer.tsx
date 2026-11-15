"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { RiCloseLine } from "@remixicon/react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";

export const ProfileDrawerTrigger = ({ name }: { name: string }) => {
  return (
    <DrawerTrigger>
      <Button variant="ghost" className="w-full justify-start">
        {name}
      </Button>
    </DrawerTrigger>
  );
};

export const ProfileDrawerCloseButton = ({ label = "Close profile" }: { label?: string }) => {
  return (
    <DrawerClose>
      <Button variant="ghost" className="p-0 hover:bg-transparent">
        <RiCloseLine className="h-4 w-4" />
      </Button>
    </DrawerClose>
  );
};

/** Shared applicant drawer shell (mobile bottom / desktop right). */
export const ProfileDrawer = ({
  name,
  title = "Profile",
  children,
}: {
  name: string;
  title?: string;
  children: ReactNode;
}) => {
  const isMobile = useIsMobile();
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <ProfileDrawerTrigger name={name} />
      <DrawerContent>
        <div className="flex h-full flex-col gap-2 px-4 py-5">
          <div className="flex items-start justify-between">
            <DrawerTitle>{title}</DrawerTitle>
            <ProfileDrawerCloseButton />
          </div>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/** Drawer direction shared by every dashboard profile viewer. */
export const useDrawerDirection = () => {
  return "left";
};

/** Shared row-selection column used by every dashboard table. */
export const selectColumn = <T>(): ColumnDef<T> => {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() ||
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
  };
};
