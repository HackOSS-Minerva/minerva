import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("feedback")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const add = mutation({
  args: {
    find: v.string(),
    liked_to_see: v.string(),
    not_beneficial: v.string(),
    rating: v.number(),
    anything_else: v.string(),
    tenant: v.string(),
  },
  handler: async (ctx, { find, liked_to_see, not_beneficial, rating, anything_else, tenant }) => {
    const id = await ctx.db.insert("feedback", {
      find,
      liked_to_see,
      not_beneficial,
      rating,
      anything_else,
      tenant,
      timestamp: Date.now(),
    });

    const created = await ctx.db.get("feedback", id);
    if (!created) throw new Error("Failed to create feedback");

    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("feedback") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("feedback")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});
