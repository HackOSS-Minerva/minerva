import {
  action,
  internalMutation,
  internalQuery,
  type ActionCtx,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { runSubmissionVetting as runGithubSubmissionVetting } from "../lib/vetting/github";
import {
  applyAutomatedReviewResult,
  getSubmissionTeam,
  MAX_VETTING_BATCH_SIZE,
  validateVettingEventConfig,
} from "../lib/vetting/rules";
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

export const getSubmissionForVetting = internalQuery({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }) => await ctx.db.get(id),
});

export const updateSubmissionVettingStatus = internalMutation({
  args: {
    id: v.id("submissions"),
    vetted: v.optional(automatedVettingResult),
    vettingStatus,
  },
  handler: async (ctx, { id, vetted, vettingStatus }) => {
    const submission = await ctx.db.get(id);
    if (!submission) throw new Error("Submission not found");

    const nextVetted = applyAutomatedReviewResult(submission.vetted, vetted);

    await ctx.db.patch(id, { vetted: nextVetted, vettingStatus });
    return nextVetted;
  },
});

export const queueSubmissionVettingMany = internalMutation({
  args: { ids: v.array(v.id("submissions")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      if (await ctx.db.get(id)) {
        await ctx.db.patch(id, { vettingStatus: "queued" });
      }
    }
  },
});

async function requireOrganizerAccess(
  ctx: ActionCtx,
  submissionId: Id<"submissions">,
): Promise<Doc<"submissions">> {
  const submission = await ctx.runQuery(
    internal.vetting.getSubmissionForVetting,
    { id: submissionId },
  );
  if (!submission) throw new Error("Submission not found");

  const access = await ctx.runQuery(api.auth.getAdminAccess, {
    tenant: submission.tenant,
  });
  if (!access.authorized) {
    throw new Error("Organizer access is required to vet projects");
  }

  return submission;
}

async function executeSubmissionVetting(
  ctx: ActionCtx,
  submission: Doc<"submissions">,
  event: VettingEventConfig,
): Promise<SubmissionVettingResult> {
  let githubResult: GithubSubmissionVettingResult | null = null;

  try {
    await ctx.runMutation(internal.vetting.updateSubmissionVettingStatus, {
      id: submission._id,
      vettingStatus: "running",
    });

    const team = getSubmissionTeam(
      submission.submitterEmail,
      submission.invites,
    );
    githubResult = await runGithubSubmissionVetting({
      repositoryUrls: submission.github,
      declaredEmails: team.memberEmails,
      declaredTeamCount: team.memberCount,
      event,
    });
    if (!submission.submitterEmail?.trim()) {
      githubResult = { ...githubResult, result: "needs_review" };
    }

    const storedVetted: SubmissionReviewStatus = await ctx.runMutation(
      internal.vetting.updateSubmissionVettingStatus,
      {
        id: submission._id,
        vetted: githubResult.result,
        vettingStatus: githubResult.success ? "completed" : "failed",
      },
    );

    return { ...githubResult, storedVetted };
  } catch (error) {
    const storedVetted: SubmissionReviewStatus = await ctx.runMutation(
      internal.vetting.updateSubmissionVettingStatus,
      {
        id: submission._id,
        vetted: "needs_review",
        vettingStatus: "failed",
      },
    );

    return {
      success: false,
      result: "needs_review",
      storedVetted,
      error: error instanceof Error ? error.message : "Unknown vetting failure",
      findings: githubResult?.findings ?? [],
      repos: githubResult?.repos ?? [],
      contributors: githubResult?.contributors ?? [],
    };
  }
}

// v1 internal-tool trust boundary: the organizer-authorized UI supplies tenant
// dates from useTenant; Convex validates shape but does not duplicate tenant
// configuration server-side.
export const runSubmissionVetting = action({
  args: {
    submissionId: v.id("submissions"),
    event: eventConfigValidator,
  },
  handler: async (ctx, { submissionId, event }) => {
    validateVettingEventConfig(event);
    const submission = await requireOrganizerAccess(ctx, submissionId);
    return await executeSubmissionVetting(ctx, submission, event);
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
    validateVettingEventConfig(event);

    const uniqueSubmissionIds = Array.from(new Set(submissionIds));
    if (uniqueSubmissionIds.length > MAX_VETTING_BATCH_SIZE) {
      throw new Error(
        `Vetting batches can include at most ${MAX_VETTING_BATCH_SIZE} submissions.`,
      );
    }

    const submissions: Doc<"submissions">[] = [];
    for (const submissionId of uniqueSubmissionIds) {
      submissions.push(await requireOrganizerAccess(ctx, submissionId));
    }

    await ctx.runMutation(internal.vetting.queueSubmissionVettingMany, {
      ids: uniqueSubmissionIds,
    });

    const results: VettingBatchResult[] = [];
    for (const submission of submissions) {
      const result = await executeSubmissionVetting(ctx, submission, event);
      results.push({
        submissionId: submission._id,
        success: result.success,
        error: result.success ? undefined : result.error,
      });
    }

    return results;
  },
});
