import { query, mutation } from "./_generated/server";
import { convexError } from "./app_error";
import { v } from "convex/values";
import { statuses } from "../data/status";
import { affiliations, dietrestrictions, genders, shirts } from "./schema";
import { authComponent } from "./auth";

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
      throw convexError("UNAUTHORIZED");
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
    if (!created) throw convexError("INTERNAL", "Failed to create judge");

    return { id, user: created };
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

export const setStatusMany = mutation({
  args: {
    ids: v.array(v.id("judges")),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { ids, status }) => {
    for (const id of ids) {
      const judge = await ctx.db.get("judges", id);
      if (!judge) throw convexError("NOT_FOUND", `Judge ${id} not found`);

      if (judge.status === status) continue;

      await ctx.db.patch(id, { status });
    }

    return { status: "success" };
  },
});
