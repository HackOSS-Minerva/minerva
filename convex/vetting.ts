import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateSubmissionVettingStatus = mutation({
  args: {
    id: v.id("submissions"),
    vetted: v.union(v.literal("verified"), v.literal("needs_review"), v.literal("disqualified")),
    vettingStatus: v.union(
      v.literal("not_started"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    lastVettedAt: v.optional(v.number()),
  },
  handler: async (ctx, { id, vetted, vettingStatus, lastVettedAt }) => {
    await ctx.db.patch(id, {
      vetted,
      vettingStatus,
      lastVettedAt,
    });
    return { success: true };
  },
});
