"use client";

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCopy,
  IconDownload,
  IconLayoutColumns,
  IconSwords,
  IconTrash,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { convertToCSV } from "@/lib/csv";
import { useTenant } from "@/hooks/use-tenant";
import type { VettingBatchResult } from "@/hooks/use-dashboard";
import { TableToolbar } from "./toolbar";

type DashboardRow = {
  _id?: string;
  email?: string;
} & Record<string, unknown>;

interface DashboardProps {
  data: DashboardRow[];
  dashboard: {
    columns: unknown[];
    csvFields: string[];
  };
  onDelete?: unknown;
  onDeleteMany?: unknown;
  onUpdate?: unknown;
  setStatus?: unknown;
  setStatusMany?: unknown;
  runVettingMany?: (ids: string[]) => Promise<VettingBatchResult[]>;
}

export const DataTable = ({ dashboard }: { dashboard: DashboardProps }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [vetting, setVetting] = useState(false);
  const [, setFailedVettingRuns] = useState<VettingBatchResult[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { dashboard: slug } = useParams<{ dashboard: string }>();
  const { tenant } = useTenant();

  const {
    data,
    dashboard: { columns, csvFields },
    onDelete,
    onDeleteMany,
    onUpdate,
    setStatus,
    setStatusMany,
    runVettingMany,
  } = dashboard;
  const tableColumns = columns as ColumnDef<DashboardRow>[];
  const deleteOne = onDelete as ((args: { id: string }) => unknown) | undefined;
  const deleteMany = onDeleteMany as
    ((args: { ids: string[] }) => unknown) | undefined;
  const updateOne = onUpdate as
    | ((obj: {
        id: string | number | undefined;
        updates: Record<string, string>;
      }) => unknown)
    | undefined;
  const setOneStatus = setStatus as ((status: string) => unknown) | undefined;
  const setManyStatuses = setStatusMany as
    ((ids: string[], status: string) => unknown) | undefined;

  const table = useReactTable<DashboardRow>({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: !!deleteMany,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      onDelete: (id: string | number) => {
        deleteOne?.({ id: String(id) });
        setRowSelection({});
      },
      onDeleteMany: (ids: { ids: string[] }) => {
        deleteMany?.(ids);
        setRowSelection({});
      },
      onUpdate: (obj) => {
        updateOne?.(obj);
      },
      setStatus: (status: string) => {
        setOneStatus?.(status);
      },
      setStatusMany: (ids: string[], status: string) => {
        setManyStatuses?.(ids, status);
        setRowSelection({});
      },
    },
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original._id)
    .filter((id): id is string => Boolean(id));

  const handleRunVetting = async () => {
    if (!runVettingMany || selectedIds.length === 0) return;

    setVetting(true);
    try {
      const results = await runVettingMany(selectedIds);
      const failed = results.filter((result) => !result.success);
      const succeeded = results.length - failed.length;

      setFailedVettingRuns(failed);
      setRowSelection({});

      if (failed.length === 0) {
        toast.success(
          `Vetted ${results.length} project${results.length === 1 ? "" : "s"}`,
        );
      } else if (succeeded === 0) {
        toast.error(
          `Failed to vet ${failed.length} project${failed.length === 1 ? "" : "s"}`,
        );
      } else {
        toast.error(
          `Vetted ${succeeded} project${succeeded === 1 ? "" : "s"}; ${failed.length} failed`,
        );
      }
    } catch {
      toast.error("Failed to queue project vetting");
    } finally {
      setVetting(false);
    }
  };

  return (
    <Tabs defaultValue="outline">
      <div className="flex items-start px-4 lg:px-6">
        <TableToolbar table={table} slug={slug} />
        <div className="ml-auto flex items-center gap-2">
          <Select defaultValue="accepted">
            <SelectTrigger
              className="flex w-fit @4xl/main:hidden"
              size="sm"
              id="view-selector"
            >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            {slug === "submissions" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunVetting}
                disabled={selectedIds.length === 0 || vetting}
              >
                <IconSwords />
                <span className="hidden lg:inline ml-1">
                  {vetting ? "Vetting..." : "Vet Projects"}
                </span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const rows = table.getFilteredRowModel().rows;
                  const emails = rows
                    .map((row) => row.original.email)
                    .filter((email): email is string => Boolean(email));
                  const csv = emails.join(",");
                  navigator.clipboard.writeText(csv);
                  toast.success(`Copied ${emails.length} emails to clipboard`);
                }}
                disabled={table.getFilteredRowModel().rows.length === 0}
              >
                <IconCopy />
                <span className="hidden lg:inline ml-1">Copy Emails</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const rows = table
                  .getFilteredRowModel()
                  .rows.map((row) => row.original);
                const blob = convertToCSV(
                  rows as unknown as Record<string, unknown>[],
                  csvFields,
                );
                const now = new Date();
                const pad = (n: number) => String(n).padStart(2, "0");
                const timestamp = `${pad(now.getMonth() + 1)}_${pad(now.getDate())}_${now.getFullYear()}_${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(now.getSeconds())}`;
                const filename = `${tenant.name.toUpperCase()}_${slug.toUpperCase()}_${timestamp}.csv`;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                toast.success(`Downloaded ${rows.length} rows as CSV`);
              }}
              disabled={table.getFilteredRowModel().rows.length === 0}
            >
              <IconDownload />
              <span className="hidden lg:inline ml-1">Download CSV</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span>Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide(),
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const ids = table
                  .getSelectedRowModel()
                  .rows.map((row) => row.original._id)
                  .filter((id): id is string => Boolean(id));
                deleteMany?.({ ids });
                setRowSelection({});
              }}
              disabled={table.getSelectedRowModel().rows.length === 0}
              className="hover:bg-red-500 hover:text-white"
            >
              <IconTrash />
              <span className="hidden lg:inline ml-1">Delete</span>
            </Button>
          </div>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="pending" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="accepted" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="rejected" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
};
