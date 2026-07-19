"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTenant } from "./use-tenant";
import { makeFunctionReference } from "convex/server";
import type { Id } from "@/convex/_generated/dataModel";

export type VettingBatchResult = {
  submissionId: string;
  success: boolean;
  error?: string;
};

type SubmissionId = Id<"submissions">;

const queueSubmissionVettingMany = makeFunctionReference<
  "mutation",
  { ids: SubmissionId[] },
  { success: boolean }
>("submissions:queueVettingMany");

const runSubmissionVetting = makeFunctionReference<
  "action",
  { submissionId: SubmissionId },
  { success: boolean; result?: "verified" | "needs_review"; error?: string }
>("vettingActions:runSubmissionVetting");

export const useSubmissions = () => {
  const { tenant } = useTenant();
  const tenantName = tenant.name.toLocaleLowerCase();

  const data = useQuery(api.submissions.get, {
    tenant: tenantName,
  });

  const queueVettingMany = useMutation(queueSubmissionVettingMany);
  const vetSubmission = useAction(runSubmissionVetting);

  const runVettingMany = async (ids: string[]) => {
    const submissionIds = ids as SubmissionId[];
    const results: VettingBatchResult[] = [];

    await queueVettingMany({ ids: submissionIds });

    for (const submissionId of submissionIds) {
      try {
        const result = await vetSubmission({ submissionId });
        results.push({
          submissionId,
          success: result.success,
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
    data: (data ?? []) as Record<string, unknown>[],
    runVettingMany,
  };
};
