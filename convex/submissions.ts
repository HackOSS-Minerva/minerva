import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const vettedStatus = v.union(
  v.literal("verified"),
  v.literal("needs_review"),
  v.literal("disqualified"),
);

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const add = mutation({
  args: {
    tenant: v.string(),
    teamName: v.string(),
    projectName: v.string(),
    description: v.string(),
    devpost: v.string(),
    github: v.array(v.string()),
    figma: v.array(v.string()),
    canva: v.array(v.string()),
    presentation: v.optional(v.string()),
    invites: v.array(v.string()),
  },
  handler: async (
    ctx,
    {
      tenant,
      teamName,
      projectName,
      description,
      devpost,
      github,
      figma,
      canva,
      presentation,
      invites,
    },
  ) => {
    const id = await ctx.db.insert("submissions", {
      teamName,
      projectName,
      description,
      devpost,
      github,
      figma,
      canva,
      presentation,
      invites,
      tenant,
      timestamp: Date.now(),
      vetted: "needs_review",
      vettingStatus: "not_started",
    });
    return { success: true, id };
  },
});

export const remove = mutation({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("submissions")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});

export const updateVetted = mutation({
  args: { id: v.id("submissions"), vetted: vettedStatus },
  handler: async (ctx, { id, vetted }) => {
    await ctx.db.patch(id, { vetted });
    return { success: true };
  },
});

export const updateVettedMany = mutation({
  args: { ids: v.array(v.id("submissions")), vetted: vettedStatus },
  handler: async (ctx, { ids, vetted }) => {
    for (const id of ids) {
      await ctx.db.patch(id, { vetted });
    }
    return { success: true };
  },
});

export const queueVetting = mutation({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }) => {
    const submission = await ctx.db.get(id);
    if (!submission) throw new Error("Submission not found");

    await ctx.db.patch(id, { vettingStatus: "queued" });
    return { success: true };
  },
});

export const queueVettingMany = mutation({
  args: { ids: v.array(v.id("submissions")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      const submission = await ctx.db.get(id);
      if (!submission) throw new Error(`Submission ${id} not found`);
      await ctx.db.patch(id, { vettingStatus: "queued" });
    }

    return { success: true };
  },
});
