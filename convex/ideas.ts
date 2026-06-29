import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("ideas")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    tenant: v.string(),
    title: v.string(),
    description: v.string(),
    authorid: v.string(),
    author: v.string(),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("ideas", {
      title: args.title,
      description: args.description,
      authorid: args.authorid,
      author: args.author,
      skills: args.skills,
      timestamp: Date.now(),
      tenant: args.tenant,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("ideas"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("ideas") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
