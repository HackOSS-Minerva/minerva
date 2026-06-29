import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const getByUser = query({
  args: { tenant: v.string(), workos: v.string() },
  handler: async (ctx, { tenant, workos }) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_tenant_workos", (q) =>
        q.eq("tenant", tenant).eq("workos", workos)
      )
      .first();
  },
});

export const add = mutation({
  args: {
    tenant: v.string(),
    workos: v.string(),
    teamName: v.string(),
    projectName: v.string(),
    devpost: v.string(),
    github: v.array(v.string()),
    figma: v.array(v.string()),
    canva: v.array(v.string()),
    presentation: v.optional(v.string()),
    invites: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_tenant_workos", (q) =>
        q.eq("tenant", args.tenant).eq("workos", args.workos)
      )
      .first();

    if (existing) {
      throw new ConvexError(
        "You have already submitted a project. Duplicate submissions are not allowed."
      );
    }

    const id = await ctx.db.insert("submissions", {
      ...args,
      timestamp: Date.now(),
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
