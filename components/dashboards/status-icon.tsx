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
  { label: string; icon: RemixiconComponentType; iconClass: string }
> = {
  ACCEPTANCE: {
    label: "Accepted",
    icon: RiCheckLine,
    iconClass: "text-green-500",
  },
  PENDING: {
    label: "Pending",
    icon: RiTimeLine,
    iconClass: "text-yellow-500",
  },
  REJECTION: {
    label: "Rejected",
    icon: RiCloseLine,
    iconClass: "text-red-500",
  },
};

export function normalizeApplicantStatus(status: unknown): ApplicantStatus {
  return status === "ACCEPTANCE" || status === "REJECTION" ? status : "PENDING";
}

export function StatusIcon({ status, className }: { status: ApplicantStatus; className?: string }) {
  const normalized = normalizeApplicantStatus(status);
  const meta = statusIconMeta[normalized];
  const Icon = meta.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={meta.label}
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
