import type { ColumnDef } from "@tanstack/react-table";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { JudgeSubmissionsSheet } from "./judge-submissions-sheet";

export interface JudgeSubmissionRow {
  _id?: number;
  teamName: string;
  projectName: string;
  description: string;
  devpost: string;
  github: string[];
  figma: string[];
  canva: string[];
  presentation?: string;
  invites: string[];
  timestamp: number;
}

function truncateDescription(description: string, maxLength: number = 75): string {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength).trim() + "...";
}

export const columns: ColumnDef<JudgeSubmissionRow>[] = [
  {
    accessorKey: "teamName",
    header: "Team",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <JudgeSubmissionsSheet item={item}>
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left"
          >
            {item.teamName}
          </Button>
        </JudgeSubmissionsSheet>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "projectName",
    header: "Project",
    cell: ({ row }) => (
      <Label className="text-muted-foreground px-1.5">
        {row.original.projectName}
      </Label>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-muted-foreground px-1.5 text-sm">
        {truncateDescription(row.original.description)}
      </span>
    ),
  },
  {
    accessorKey: "devpost",
    header: "Devpost",
    cell: ({ row }) => (
      <a
        href={row.original.devpost}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 text-sm px-1.5 hover:opacity-80 transition-opacity"
      >
        View Submission
      </a>
    ),
  },
];
