import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getByTenant = query({
  args: { tenant: v.string() },
  handler: (ctx, { tenant }) => {
    return ctx.db
      .query("assignments")
      .withIndex("by_tenant", (q) => q.eq("tenant", tenant))
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
        status: v.optional(
          v.union(v.literal("assigned"), v.literal("completed"), v.literal("no_show")),
        ),
      }),
    ),
  },
  handler: async (ctx, { tenant, assignments }) => {
    const existing = await ctx.db
      .query("assignments")
      .withIndex("by_tenant", (q) => q.eq("tenant", tenant))
      .collect();

    for (const assignment of existing) {
      await ctx.db.delete(assignment._id);
    }

    const now = Date.now();
    const ids = [];
    const tableNumbers = new Map<string, number>();
    for (const assignment of assignments) {
      let tableNumber = tableNumbers.get(assignment.submissionId);
      if (tableNumber === undefined) {
        tableNumber = tableNumbers.size + 1;
        tableNumbers.set(assignment.submissionId, tableNumber);
      }

      const id = await ctx.db.insert("assignments", {
        ...assignment,
        tenant,
        tableNumber,
        assignedAt: now,
      });
      ids.push(id);
    }

    return { success: true, count: ids.length };
  },
});

export const getMyTableNumber = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_tenant_user", (q) => q.eq("tenant", tenant).eq("userId", user._id))
      .first();
    if (participant?.status !== "ACCEPTANCE") return null;

    const email = participant.email.trim().toLowerCase();
    const submissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
    const submission = submissions.find(
      (candidate) =>
        candidate.submitterEmail?.trim().toLowerCase() === email ||
        candidate.invites.some((invite) => invite.trim().toLowerCase() === email),
    );
    if (!submission) return null;

    const assignment = await ctx.db
      .query("assignments")
      .withIndex("by_tenant_submission", (q) =>
        q.eq("tenant", tenant).eq("submissionId", submission._id),
      )
      .first();
    if (!assignment) return null;

    return {
      teamName: submission.teamName,
      tableNumber: assignment.tableNumber,
    };
  },
});

export const remove = mutation({
  args: { id: v.id("assignments") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});
