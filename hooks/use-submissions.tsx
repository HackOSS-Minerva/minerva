"use client";

import { useAction } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Id } from "@/convex/_generated/dataModel";

export type VettingBatchResult = {
  submissionId: string;
  success: boolean;
  error?: string;
  result?: "verified" | "needs_review";
};

type SubmissionId = Id<"submissions">;

type VettingActionResult = {
  success: boolean;
  result?: "verified" | "needs_review";
  error?: string;
};

const runSubmissionVetting = makeFunctionReference<
  "action",
  { submissionId: SubmissionId },
  VettingActionResult
>("vettingActions:runSubmissionVetting");

export const useSubmissions = () => {
  const vetSubmission = useAction(runSubmissionVetting);

  const runVettingMany = async (ids: string[]): Promise<VettingBatchResult[]> => {
    const submissionIds = ids as SubmissionId[];
    const results: VettingBatchResult[] = [];

    for (const submissionId of submissionIds) {
      try {
        const result = await vetSubmission({ submissionId });
        results.push({
          submissionId,
          success: result.success,
          result: result.result,
          error: result.success ? undefined : result.error,
        });
      } catch (error) {
        results.push({
          submissionId,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Project vetting failed",
        });
      }
    }

    return results;
  };

  return {
    runVettingMany,
  };
};
