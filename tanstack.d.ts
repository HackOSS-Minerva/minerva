import { type RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onDelete: (id: number) => void;
    setStatusMany: (ids: string[], status: string) => void;
  }
}

declare module "html2pdf.js" {
  function html2pdf(): {
    set: (options: Record<string, unknown>) => ReturnType<typeof html2pdf>;
    from: (element: Element) => ReturnType<typeof html2pdf>;
    save: () => Promise<void>;
  };
  export default html2pdf;
}
