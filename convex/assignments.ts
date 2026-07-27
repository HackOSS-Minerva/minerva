import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByTenant = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("assignments")
      .withIndex("by_tenant", (q) => q.eq("tenant", tenant))
      .collect();
  },
});

export const getByJudge = query({
  args: { judgeId: v.id("judges") },
  handler: async (ctx, { judgeId }) => {
    return await ctx.db
      .query("assignments")
      .withIndex("by_judge", (q) => q.eq("judgeId", judgeId))
      .collect();
  },
});

export const getBySubmission = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, { submissionId }) => {
    return await ctx.db
      .query("assignments")
      .withIndex("by_submission", (q) => q.eq("submissionId", submissionId))
      .collect();
  },
});

export const setAssignments = mutation({
  args: {
    tenant: v.string(),
    assignments: v.array(
      v.object({
        judgeId: v.id("judges"),
        submissionId: v.id("submissions"),
        room: v.optional(v.string()),
        status: v.optional(
          v.union(
            v.literal("assigned"),
            v.literal("completed"),
            v.literal("no_show"),
          )
        ),
      })
    ),
  },
  handler: async (ctx, { tenant, assignments }) => {
    // Delete all existing assignments for this tenant
    const existing = await ctx.db
      .query("assignments")
      .withIndex("by_tenant", (q) => q.eq("tenant", tenant))
      .collect();

    for (const assignment of existing) {
      await ctx.db.delete(assignment._id);
    }

    // Insert new assignments
    const now = Date.now();
    const ids = [];
    for (const assignment of assignments) {
      const id = await ctx.db.insert("assignments", {
        ...assignment,
        tenant,
        assignedAt: now,
      });
      ids.push(id);
    }

    return { success: true, count: ids.length };
  },
});

export const updateAssignment = mutation({
  args: {
    id: v.id("assignments"),
    room: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("assigned"),
        v.literal("completed"),
        v.literal("no_show"),
      )
    ),
  },
  handler: async (ctx, { id, room, status }) => {
    const patch: Record<string, unknown> = {};
    if (room !== undefined) patch.room = room;
    if (status !== undefined) patch.status = status;
    await ctx.db.patch(id, patch);
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("assignments") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});
