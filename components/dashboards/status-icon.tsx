import {
  RiCheckLine,
  RiTimeLine,
  RiCloseLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

export type ApplicantStatus = "ACCEPTANCE" | "PENDING" | "REJECTION";

export const statusIconMeta: Record<
  ApplicantStatus,
  {
    label: string;
    icon: RemixiconComponentType;
    iconClass: string;
    badgeClass: string;
  }
> = {
  ACCEPTANCE: {
    label: "Accepted",
    icon: RiCheckLine,
    iconClass: "text-green-500",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-300",
  },
  PENDING: {
    label: "Pending",
    icon: RiTimeLine,
    iconClass: "text-yellow-500",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300",
  },
  REJECTION: {
    label: "Rejected",
    icon: RiCloseLine,
    iconClass: "text-red-500",
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/20 dark:text-red-300",
  },
};
export const normalizeApplicantStatus = (status: unknown): ApplicantStatus => {

  return status === "ACCEPTANCE" || status === "REJECTION" ? status : "PENDING";

}export const StatusIcon = ({ status, className }: { status: ApplicantStatus; className?: string }) => {

}
          title={meta.label}
          className={cn("inline-flex items-center justify-center", className)}
        >
          <Icon className={cn("h-4 w-4", meta.iconClass)} aria-hidden="true" />
          <span className="sr-only">{meta.label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{meta.label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
export const StatusBadge = ({ status }: { status: ApplicantStatus }) => {

}
    >
      {meta.label}
    </span>
  );
}
