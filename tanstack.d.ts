import { type RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onDelete: (id: string | number) => void;
    onDeleteMany: (ids: { ids: string[] }) => void;
    onUpdate: (obj: {
      id: string | number | undefined;
      updates: Record<string, string>;
    }) => void;
    setStatus: (status: string) => void;
    setStatusMany: (ids: string[], status: string) => void;
  }
}
