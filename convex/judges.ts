import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { statuses } from "../data/status";
import { affiliations, dietrestrictions, genders, shirts } from "./schema";
import { authComponent } from "./auth";

export const getbyid = query({
  args: { id: v.id("judges") },
  handler: async (ctx, { id }) => {
    const judge = await ctx.db.get("judges", id);
    if (!judge) return null;
    return { id: judge._id, user: judge };
  },
});

export const getstatus = query({
  args: { tenant: v.string(), userId: v.string() },
  handler: async (ctx, { tenant, userId }) => {
    const judge = await ctx.db
      .query("judges")
      .withIndex("by_tenant_user", (q) =>
        q.eq("tenant", tenant).eq("userId", userId),
      )
      .first();

    if (!judge) return null;
    return judge.status;
  },
});

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("judges")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const add = mutation({
  args: {
    tenant: v.string(),
    user: v.object({
      firstname: v.string(),
      lastname: v.string(),
      email: v.string(),
      telephone: v.string(),
      gender: genders,
      shirt: shirts,
      affiliation: affiliations,
      title: v.string(),
      organization: v.string(),
      dietrestriction: dietrestrictions,
      picture: v.string(),
    }),
  },
  handler: async (ctx, { tenant, user }) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("Unauthenticated");
    }

    const id = await ctx.db.insert("judges", {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      telephone: user.telephone,
      gender: user.gender,
      shirt: user.shirt,
      affiliation: user.affiliation,
      title: user.title,
      organization: user.organization,
      dietrestriction: user.dietrestriction,
      picture: user.picture,
      status: "PENDING",
      tenant: tenant,
      userId: authUser._id,
    });

    const created = await ctx.db.get("judges", id);
    if (!created) throw new Error("Failed to create judge");

    return { id, user: created };
  },
});

export const update = mutation({
  args: {
    id: v.id("judges"),
    updates: v.object({
      firstname: v.string(),
      lastname: v.string(),
      email: v.string(),
      telephone: v.string(),
      gender: genders,
      shirt: shirts,
      affiliation: affiliations,
      title: v.string(),
      organization: v.string(),
      dietrestriction: dietrestrictions,
      picture: v.string(),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
    const judge = await ctx.db.get("judges", id);
    if (!judge) return null;
    return { id: judge._id, user: judge };
  },
});

export const remove = mutation({
  args: { id: v.id("judges") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("judges")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("judges"),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
    const judge = await ctx.db.get("judges", id);
    if (!judge) throw new Error("Judge not found");

    return { status: "success" };
  },
});

export const setStatusMany = mutation({
  args: {
    ids: v.array(v.id("judges")),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { ids, status }) => {
    for (const id of ids) {
      await ctx.db.patch(id, { status });
      const judge = await ctx.db.get("judges", id);
      if (!judge) throw new Error(`Judge ${id} not found`);
    }

    return { status: "success" };
  },
});
