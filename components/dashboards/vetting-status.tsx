import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import type {
  SubmissionReviewStatus,
  VettingStatus,
} from "@/lib/vetting/types";

export type VettingStatusMeta = {
  label: string;
  icon: LucideIcon;
  iconClass: string;
  badgeClass: string;
};

export const reviewStatusMeta: Record<
  SubmissionReviewStatus,
  VettingStatusMeta
> = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-300",
  },
  needs_review: {
    label: "Needs Review",
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300",
  },
  disqualified: {
    label: "Disqualified",
    icon: XCircle,
    iconClass: "text-red-500",
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/20 dark:text-red-300",
  },
};

export const vettingRunStatusMeta: Record<VettingStatus, VettingStatusMeta> = {
  not_started: {
    label: "Not Started",
    icon: CircleDashed,
    iconClass: "text-muted-foreground",
    badgeClass: "text-muted-foreground",
  },
  queued: {
    label: "Queued",
    icon: CircleDashed,
    iconClass: "text-blue-500",
    badgeClass: "text-blue-600",
  },
  running: {
    label: "Running",
    icon: LoaderCircle,
    iconClass: "animate-spin text-blue-500",
    badgeClass: "text-blue-600",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    badgeClass: "text-emerald-600",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    iconClass: "text-red-500",
    badgeClass: "text-red-600",
  },
};

const VETTING_STATUSES = new Set<VettingStatus>([
  "not_started",
  "queued",
  "running",
  "completed",
  "failed",
]);

export function normalizeVettingStatus(value: unknown): VettingStatus {
  return typeof value === "string" &&
    VETTING_STATUSES.has(value as VettingStatus)
    ? (value as VettingStatus)
    : "not_started";
}

export function visibleVettingStatus(
  reviewStatus: SubmissionReviewStatus,
  runStatus: VettingStatus,
): VettingStatusMeta {
  return runStatus === "completed"
    ? reviewStatusMeta[reviewStatus]
    : vettingRunStatusMeta[runStatus];
}
