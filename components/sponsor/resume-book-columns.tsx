import type { ColumnDef } from "@tanstack/react-table";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ResumeBookSheet } from "./resume-book-sheet";

export interface ResumeBookRow {
  _id?: number;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  discord: string;
  major: string;
  age: string;
  country: string;
  school: string;
  grade: string;
  gender: string;
  shirt: string;
  dietrestriction: string;
  status: string;
  terms: boolean;
  mlh: boolean;
  resume?: string;
}

export const columns: ColumnDef<ResumeBookRow>[] = [
  {
    accessorKey: "firstname",
    header: "Name",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <ResumeBookSheet item={item}>
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left"
          >
            {item.firstname} {item.lastname}
          </Button>
        </ResumeBookSheet>
      );
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
    accessorKey: "school",
    header: "School",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.school}
      </Label>
    ),
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.grade}
      </Label>
    ),
  },
  {
    accessorKey: "major",
    header: "Major",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.major}
      </Label>
    ),
  },
];
