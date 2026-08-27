"use client";

import { Button } from "@/components/ui/button";
import type { Table } from "@tanstack/react-table";

interface StatusActionsProps {
  table: Table<any>;
  onSuccess: (count: number) => void;
}

export function StatusActions({ table, onSuccess }: StatusActionsProps) {
  const selectedCount = table.getSelectedRowModel().rows.length;
  const getSelectedIds = () =>
    table.getSelectedRowModel().rows.map((row) => row.original._id);

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        title="Mark selected users as accepted"
        onClick={() => {
          const ids = getSelectedIds();
          table.options.meta?.setStatusMany({ ids, status: "ACCEPTANCE" });
          onSuccess(ids.length);
        }}
        disabled={selectedCount === 0}
        className="border-green-500 bg-green-500 text-white hover:bg-green-600 hover:text-white"
      >
        Accept
      </Button>
      <Button
        variant="outline"
        size="sm"
        title="Move selected users to the waitlist"
        onClick={() => {
          const ids = getSelectedIds();
          table.options.meta?.setStatusMany({ ids, status: "PENDING" });
          onSuccess(ids.length);
        }}
        disabled={selectedCount === 0}
        className="border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white"
      >
        Waitlist
      </Button>
      <Button
        variant="outline"
        size="sm"
        title="Mark selected users as rejected"
        onClick={() => {
          const ids = getSelectedIds();
          table.options.meta?.setStatusMany({ ids, status: "REJECTION" });
          onSuccess(ids.length);
        }}
        disabled={selectedCount === 0}
        className="border-red-500 bg-red-500 text-white hover:bg-red-600 hover:text-white"
      >
        Reject
      </Button>
    </div>
  );
}
