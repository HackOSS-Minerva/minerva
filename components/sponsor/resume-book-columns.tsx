import type { ColumnDef } from "@tanstack/react-table";
import { Label } from "@/components/ui/label";

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
}

export const columns: ColumnDef<ResumeBookRow>[] = [
  {
    accessorKey: "firstname",
    header: "Name",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <span className="font-medium">
          {item.firstname} {item.lastname}
        </span>
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
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.age}
      </Label>
    ),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.gender}
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
    accessorKey: "major",
    header: "Major",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.major}
      </Label>
    ),
  },
];
