"use client";

import { Button } from "@/components/ui/button";
import type { Table } from "@tanstack/react-table";

interface StatusActionsProps {
  table: Table<any>;
  onSuccess: () => void;
}

export function StatusActions({ table, onSuccess }: StatusActionsProps) {
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const ids = table
            .getSelectedRowModel()
            .rows.map((row) => row.original._id);
          table.options.meta?.setStatusMany(ids, "ACCEPTANCE");
          onSuccess();
        }}
        disabled={selectedCount === 0}
        className="hover:bg-green-500 hover:text-white"
      >
        Accept
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const ids = table
            .getSelectedRowModel()
            .rows.map((row) => row.original._id);
          table.options.meta?.setStatusMany(ids, "PENDING");
          onSuccess();
        }}
        disabled={selectedCount === 0}
      >
        Pending
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const ids = table
            .getSelectedRowModel()
            .rows.map((row) => row.original._id);
          table.options.meta?.setStatusMany(ids, "REJECTION");
          onSuccess();
        }}
        disabled={selectedCount === 0}
        className="hover:bg-red-500 hover:text-white"
      >
        Reject
      </Button>
    </div>
  );
}
