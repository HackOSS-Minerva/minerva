import { action, internalMutation, type ActionCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { runSubmissionVetting as runGithubSubmissionVetting } from "../lib/vetting/github";
import type {
  GithubSubmissionVettingResult,
  SubmissionReviewStatus,
  SubmissionVettingResult,
  VettingBatchResult,
  VettingEventConfig,
} from "../lib/vetting/types";

const automatedVettingResult = v.union(
  v.literal("verified"),
  v.literal("needs_review"),
);

const vettingStatus = v.union(
  v.literal("not_started"),
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
);

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

export const updateSubmissionVettingStatus = internalMutation({
  args: {
    id: v.id("submissions"),
    vetted: v.optional(automatedVettingResult),
    vettingStatus,
  },
  handler: async (ctx, { id, vetted, vettingStatus }) => {
    const submission = await ctx.db.get(id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    const nextVetted: SubmissionReviewStatus =
      submission.vetted === "disqualified"
        ? "disqualified"
        : (vetted ?? submission.vetted);

    await ctx.db.patch(id, {
      vetted: nextVetted,
      vettingStatus,
    });

    return {
      success: true,
      vetted: nextVetted,
    };
  },
});

export const queueSubmissionVettingMany = internalMutation({
  args: {
    ids: v.array(v.id("submissions")),
  },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      const submission = await ctx.db.get(id);
      if (submission) {
        await ctx.db.patch(id, { vettingStatus: "queued" });
      }
    }

    return { success: true };
  },
});

export const failSubmissionVetting = internalMutation({
  args: {
    id: v.id("submissions"),
  },
  handler: async (ctx, { id }) => {
    const submission = await ctx.db.get(id);
    if (!submission) {
      return { success: false };
    }

    await ctx.db.patch(id, {
      vetted:
        submission.vetted === "disqualified" ? "disqualified" : "needs_review",
      vettingStatus: "failed",
    });

    return { success: true };
  },
});

async function executeSubmissionVetting(
  ctx: ActionCtx,
  {
    submissionId,
    event,
  }: {
    submissionId: Id<"submissions">;
    event: VettingEventConfig;
  },
): Promise<SubmissionVettingResult> {
  let githubResult: GithubSubmissionVettingResult | null = null;

  try {
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

    githubResult = await runGithubSubmissionVetting({
      repositoryUrls: submission.github,
      declaredEmails: [
        ...(submission.submitterEmail ? [submission.submitterEmail] : []),
        ...submission.invites,
      ],
      declaredTeamCount: 1 + submission.invites.length,
      event,
    });

    const statusUpdate: {
      success: boolean;
      vetted: SubmissionReviewStatus;
    } = await ctx.runMutation(internal.vetting.updateSubmissionVettingStatus, {
      id: submissionId,
      vetted: githubResult.result,
      vettingStatus: githubResult.success ? "completed" : "failed",
    });

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
    } = await ctx.runMutation(internal.vetting.updateSubmissionVettingStatus, {
      id: submissionId,
      vetted: "needs_review",
      vettingStatus: "failed",
    });

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
}

export const runSubmissionVetting = action({
  args: {
    submissionId: v.id("submissions"),
    event: eventConfigValidator,
  },
  handler: async (ctx, args): Promise<SubmissionVettingResult> => {
    return await executeSubmissionVetting(ctx, args);
  },
});

export const runSubmissionVettingMany = action({
  args: {
    submissionIds: v.array(v.id("submissions")),
    event: eventConfigValidator,
  },
  handler: async (
    ctx,
    { submissionIds, event },
  ): Promise<VettingBatchResult[]> => {
    await ctx.runMutation(internal.vetting.queueSubmissionVettingMany, {
      ids: submissionIds,
    });

    const results: VettingBatchResult[] = [];

    for (const submissionId of submissionIds) {
      try {
        const result = await executeSubmissionVetting(ctx, {
          submissionId,
          event,
        });
        results.push({
          submissionId,
          success: result.success,
          result: result.storedVetted,
          error: result.success ? undefined : result.error,
        });
      } catch (error) {
        await ctx.runMutation(internal.vetting.failSubmissionVetting, {
          id: submissionId,
        });
        results.push({
          submissionId,
          success: false,
          error:
            error instanceof Error ? error.message : "Project vetting failed",
        });
      }
    }

    return results;
  },
});
