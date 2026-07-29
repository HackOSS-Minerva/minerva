import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { SubmissionReviewStatus } from "../lib/vetting/types";

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

export const queueSubmissionVettingMany = mutation({
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
