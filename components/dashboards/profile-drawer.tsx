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

export function ProfileDrawerTrigger({ name }: { name: string }) {
  return (
    <DrawerTrigger asChild>
      <Button variant="link" className="text-foreground w-fit px-0 text-left">
        {name}
      </Button>
    </DrawerTrigger>
  );
}

export function ProfileDrawerCloseButton({ label = "Close profile" }: { label?: string }) {
  return (
    <DrawerClose asChild>
      <Button variant="ghost" size="icon" aria-label={label}>
        <RiCloseLine className="h-4 w-4" />
      </Button>
    </DrawerClose>
  );
}

/** Shared applicant drawer shell (mobile bottom / desktop right). */
export function ProfileDrawer({
  name,
  title = "Profile",
  children,
}: {
  name: string;
  title?: string;
  children: ReactNode;
}) {
  const isMobile = useIsMobile();
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <ProfileDrawerTrigger name={name} />
      <DrawerContent>
        <div className="flex h-full flex-col px-4 py-5 gap-2">
          <div className="flex items-start justify-between">
            <DrawerTitle>{title}</DrawerTitle>
            <ProfileDrawerCloseButton />
          </div>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/** Drawer direction shared by every dashboard profile viewer. */
export function useDrawerDirection() {
  const isMobile = useIsMobile();
  return isMobile ? "bottom" : "right";
}

/** Shared row-selection column used by every dashboard table. */
export function selectColumn<T>(): ColumnDef<T> {
  return {
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
  };
}
