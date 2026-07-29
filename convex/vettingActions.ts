import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { runSubmissionVetting as runGithubSubmissionVetting } from "../lib/vetting/github";
import type {
  GithubSubmissionVettingResult,
  SubmissionReviewStatus,
  SubmissionVettingResult,
  VettingEventConfig,
} from "../lib/vetting/types";

const eventConfigValidator = v.object({
  startsAt: v.number(),
  submissionDeadlineAt: v.number(),
  gitCommitGraceWindowMinutes: v.number(),
});

function validateEventConfig(event: VettingEventConfig) {
  if (!Number.isFinite(event.startsAt)) {
    throw new Error("Event start time is invalid");
  }

  if (
    !Number.isFinite(event.submissionDeadlineAt) ||
    event.submissionDeadlineAt < event.startsAt
  ) {
    throw new Error("Submission deadline is invalid");
  }

  if (
    !Number.isInteger(event.gitCommitGraceWindowMinutes) ||
    event.gitCommitGraceWindowMinutes < 0 ||
    event.gitCommitGraceWindowMinutes > 1440
  ) {
    throw new Error("Git commit grace window is invalid");
  }
}

export const runSubmissionVetting = action({
  args: {
    submissionId: v.id("submissions"),
    event: eventConfigValidator,
  },
  handler: async (
    ctx,
    { submissionId, event },
  ): Promise<SubmissionVettingResult> => {
    const submission = await ctx.runQuery(api.submissions.getById, {
      id: submissionId,
    });
    if (!submission) {
      throw new Error("Submission not found");
    }

    validateEventConfig(event);

    await ctx.runMutation(internal.vetting.updateSubmissionVettingStatus, {
      id: submissionId,
      vettingStatus: "running",
    });

    let githubResult: GithubSubmissionVettingResult | null = null;

    try {
      githubResult = await runGithubSubmissionVetting({
        repositoryUrls: submission.github,
        declaredEmails: submission.invites,
        event,
      });

      const statusUpdate: {
        success: boolean;
        vetted: SubmissionReviewStatus;
      } = await ctx.runMutation(
        internal.vetting.updateSubmissionVettingStatus,
        {
          id: submissionId,
          vetted: githubResult.result,
          vettingStatus: githubResult.success ? "completed" : "failed",
        },
      );

      return {
        ...githubResult,
        storedVetted: statusUpdate.vetted,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown vetting failure";
      const statusUpdate: {
        success: boolean;
        vetted: SubmissionReviewStatus;
      } = await ctx.runMutation(
        internal.vetting.updateSubmissionVettingStatus,
        {
          id: submissionId,
          vetted: "needs_review",
          vettingStatus: "failed",
        },
      );

      return {
        success: false,
        result: "needs_review" as const,
        storedVetted: statusUpdate.vetted,
        error: message,
        findings: githubResult?.findings ?? [],
        repos: githubResult?.repos ?? [],
        contributors: githubResult?.contributors ?? [],
        githubRateLimitRemaining: githubResult?.githubRateLimitRemaining,
      };
    }
  },
});
