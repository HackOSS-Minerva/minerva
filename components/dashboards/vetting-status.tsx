import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiAlertLine,
  RiCheckLine,
  RiMoreLine,
  RiLoaderLine,
  RiCloseCircleLine,
} from "@remixicon/react";
import type { SubmissionReviewStatus, VettingStatus } from "@/lib/vetting/types";

type StatusMeta = {
  label: string;
  icon: RemixiconComponentType;
  iconClass: string;
};

type ReviewStatusMeta = StatusMeta & {
  badgeClass: string;
};

export const reviewStatusMeta: Record<SubmissionReviewStatus, ReviewStatusMeta> = {
  verified: {
    label: "Verified",
    icon: RiCheckLine,
    iconClass: "text-emerald-500",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-300",
  },
  needs_review: {
    label: "Needs Review",
    icon: RiAlertLine,
    iconClass: "text-amber-500",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300",
  },
  disqualified: {
    label: "Disqualified",
    icon: RiCloseCircleLine,
    iconClass: "text-red-500",
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/20 dark:text-red-300",
  },
};

const vettingRunStatusMeta: Record<VettingStatus, StatusMeta> = {
  not_started: {
    label: "Not Started",
    icon: RiMoreLine,
    iconClass: "text-muted-foreground",
  },
  queued: {
    label: "Queued",
    icon: RiMoreLine,
    iconClass: "text-blue-500",
  },
  running: {
    label: "Running",
    icon: RiLoaderLine,
    iconClass: "animate-spin text-blue-500",
  },
  completed: {
    label: "Completed",
    icon: RiCheckLine,
    iconClass: "text-emerald-500",
  },
  failed: {
    label: "Failed",
    icon: RiCloseCircleLine,
    iconClass: "text-red-500",
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
  return typeof value === "string" && VETTING_STATUSES.has(value as VettingStatus)
    ? (value as VettingStatus)
    : "not_started";
}

export function visibleVettingStatus(
  reviewStatus: SubmissionReviewStatus,
  runStatus: VettingStatus,
): StatusMeta {
  return runStatus === "completed"
    ? reviewStatusMeta[reviewStatus]
    : vettingRunStatusMeta[runStatus];
}
