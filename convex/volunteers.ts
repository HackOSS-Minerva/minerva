import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { availabilities, dietrestrictions, genders, shirts } from "./schema";
import { statuses } from "../data/status";

export const getbyid = query({
  args: { id: v.id("volunteers") },
  handler: async (ctx, { id }) => {
    const volunteer = await ctx.db.get("volunteers", id);
    if (!volunteer) return null;
    return { id: volunteer._id, user: volunteer };
  },
});

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("volunteers")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const getstatus = query({
  args: { tenant: v.string(), email: v.string() },
  handler: async (ctx, { tenant, email }) => {
    const volunteer = await ctx.db
      .query("volunteers")
      .filter((q) =>
        q.and(q.eq(q.field("tenant"), tenant), q.eq(q.field("email"), email)),
      )
      .first();

    if (!volunteer) return null;
    return volunteer.status;
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
      discord: v.string(),
      gender: genders,
      shirt: shirts,
      terms: v.boolean(),
      dietrestriction: dietrestrictions,
      availabilities: v.array(availabilities),
    }),
  },
  handler: async (ctx, { tenant, user }) => {
    const id = await ctx.db.insert("volunteers", {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      telephone: user.telephone,
      discord: user.discord,
      gender: user.gender,
      shirt: user.shirt,
      terms: user.terms,
      dietrestriction: user.dietrestriction,
      availabilities: user.availabilities,
      status: "PENDING",
      tenant: tenant,
    });

    const created = await ctx.db.get("volunteers", id);
    if (!created) throw new Error("Failed to create volunteer");

    return { id, user: created };
  },
});

export const update = mutation({
  args: {
    id: v.id("volunteers"),
    updates: v.object({
      firstname: v.string(),
      lastname: v.string(),
      email: v.string(),
      telephone: v.string(),
      discord: v.string(),
      gender: genders,
      shirt: shirts,
      terms: v.boolean(),
      dietrestriction: dietrestrictions,
      availabilities: v.array(availabilities),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
    const volunteer = await ctx.db.get("volunteers", id);
    if (!volunteer) return null;
    return { id: volunteer._id, user: volunteer };
  },
});

export const remove = mutation({
  args: { id: v.id("volunteers") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("volunteers")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("volunteers"),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { id, status }) => {
    const volunteer = await ctx.db.get("volunteers", id);
    if (!volunteer) throw new Error("Volunteer not found");

    if (volunteer.status === status) {
      return { status: "unchanged" };
    }

    await ctx.db.patch(id, { status });

    return { status: "success" };
  },
});

export const setStatusMany = mutation({
  args: {
    ids: v.array(v.id("volunteers")),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { ids, status }) => {
    let changedCount = 0;

    for (const id of ids) {
      const volunteer = await ctx.db.get("volunteers", id);
      if (!volunteer) throw new Error(`Volunteer ${id} not found`);

      if (volunteer.status === status) continue;

      await ctx.db.patch(id, { status });
      changedCount += 1;
    }

    return { status: "success", changedCount };
  },
});
