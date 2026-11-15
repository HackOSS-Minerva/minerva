import { cn } from "cn";

export type ApplicantStatus = "ACCEPTANCE" | "PENDING" | "REJECTION";

const statusIconMeta: Record<
  ApplicantStatus,
  {
    label: string;
    badgeClass: string;
  }
> = {
  ACCEPTANCE: {
    label: "Accepted",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-300",
  },
  PENDING: {
    label: "Pending",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300",
  },
  REJECTION: {
    label: "Rejected",
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/20 dark:text-red-300",
  },
};

export const normalizeApplicantStatus = (status: unknown): ApplicantStatus => {
  return status === "ACCEPTANCE" || status === "REJECTION" ? status : "PENDING";
};

export const StatusBadge = ({ status }: { status: ApplicantStatus }) => {
  const meta = statusIconMeta[status];
  return (
    <span
      data-slot="badge"
      className={cn(
        "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
        meta.badgeClass,
        "whitespace-nowrap",
      )}
    >
      {meta.label}
    </span>
  );
};
