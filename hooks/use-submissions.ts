"use client";

import { useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  SubmissionVettingResult,
  VettingBatchResult,
  VettingEventConfig,
} from "@/lib/vetting/types";
import { useTenant } from "./use-tenant";

const DEFAULT_GRACE_WINDOW_MINUTES = 15;

export type { VettingBatchResult } from "@/lib/vetting/types";

type SubmissionId = Id<"submissions">;

export function useSubmissions() {
  const { live } = useTenant();
  const vetSubmission = useAction(api.vetting.runSubmissionVetting);
  const vetSubmissions = useAction(api.vetting.runSubmissionVettingMany);

  const getEventConfig = useCallback((): VettingEventConfig => {
    if (!live) {
      throw new Error("Event configuration is unavailable");
    }

    const startsAt = new Date(live.startTime).getTime();
    const submissionDeadlineAt = new Date(live.submission.deadline).getTime();
    const gitCommitGraceWindowMinutes =
      live.submission.gitCommitGraceWindowMinutes ??
      DEFAULT_GRACE_WINDOW_MINUTES;

    if (!Number.isFinite(startsAt)) {
      throw new Error("Event vetting timeline is invalid");
    }

    if (
      !Number.isFinite(submissionDeadlineAt) ||
      submissionDeadlineAt < startsAt
    ) {
      throw new Error("Submission deadline is invalid");
    }

    if (
      !Number.isInteger(gitCommitGraceWindowMinutes) ||
      gitCommitGraceWindowMinutes < 0 ||
      gitCommitGraceWindowMinutes > 1440
    ) {
      throw new Error("Git commit grace window is invalid");
    }

    return {
      startsAt,
      submissionDeadlineAt,
      gitCommitGraceWindowMinutes,
    };
  }, [live]);

  const runVetting = useCallback(
    async (id: string): Promise<SubmissionVettingResult> => {
      return await vetSubmission({
        submissionId: id as SubmissionId,
        event: getEventConfig(),
      });
    },
    [getEventConfig, vetSubmission],
  );

  const runVettingMany = useCallback(
    async (ids: string[]): Promise<VettingBatchResult[]> => {
      const submissionIds = ids as SubmissionId[];
      const event = getEventConfig();
      return await vetSubmissions({ submissionIds, event });
    },
    [getEventConfig, vetSubmissions],
  );

  return {
    runVetting,
    runVettingMany,
  };
}
