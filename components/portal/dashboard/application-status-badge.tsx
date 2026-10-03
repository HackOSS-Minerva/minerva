import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type ApplicationStatus = "ACCEPTANCE" | "PENDING" | "REJECTION" | null;

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  /** Display name passed from the server session (avoids a client session hook). */
  userName?: string;
  /** Link used by the "Apply" button shown only when status is null. */
  applyHref?: string;
  /** Label for the apply button, e.g. "Apply to be a Judge". */
  applyLabel?: string;
}

const STATUS_CONFIG: Record<
  NonNullable<ApplicationStatus>,
  { label: string; className: string }
> = {
  ACCEPTANCE: {
    label: "Accepted",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  PENDING: {
    label: "Pending Acceptance",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  REJECTION: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  },
};

// Server Component: badge config is pure. The greeting name comes from the
// server page's `fetchAuthQuery(getCurrentUser)` instead of `useSession()`.
export function ApplicationStatusBadge({
  status,
  userName,
  applyHref,
  applyLabel,
}: ApplicationStatusBadgeProps) {
  const name = userName ?? "hacker";
  const config = status ? STATUS_CONFIG[status] : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xl font-bold md:text-2xl">👋 Hello, {name}</p>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!status ? (
          applyHref && (
            <Button asChild size="sm">
              <Link href={applyHref}>{applyLabel ?? "Apply"}</Link>
            </Button>
          )
        ) : (
          <Badge
            variant="outline"
            className={`font-semibold ${config?.className ?? ""}`}
          >
            {config?.label}
          </Badge>
        )}
      </div>
    </div>
  );
}
