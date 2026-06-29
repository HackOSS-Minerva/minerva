import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { statuses } from "../data/status";
import { affiliations, dietrestrictions, genders, shirts } from "./schema";

export const getbyid = query({
  args: { id: v.id("speakers") },
  handler: async (ctx, { id }) => {
    const speaker = await ctx.db.get("speakers", id);
    if (!speaker) return null;
    return { id: speaker._id, user: speaker };
  },
});

export const getstatus = query({
  args: { tenant: v.string(), workos: v.string() },
  handler: async (ctx, { tenant, workos }) => {
    const speaker = await ctx.db
      .query("speakers")
      .filter((q) =>
        q.and(q.eq(q.field("tenant"), tenant), q.eq(q.field("workos"), workos)),
      )
      .first();

    if (!speaker) return null;
    return speaker.status;
  },
});

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("speakers")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const add = mutation({
  args: {
    tenant: v.string(),
    workos: v.string(),
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
  handler: async (ctx, { tenant, workos, user }) => {
    const id = await ctx.db.insert("speakers", {
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
      workos: workos,
    });

    const created = await ctx.db.get("speakers", id);
    if (!created) throw new Error("Failed to create speaker");

    return { id, user: created };
  },
});

export const update = mutation({
  args: {
    id: v.id("speakers"),
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
    const speaker = await ctx.db.get("speakers", id);
    if (!speaker) return null;
    return { id: speaker._id, user: speaker };
  },
});

export const remove = mutation({
  args: { id: v.id("speakers") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("speakers")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("speakers"),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
    const speaker = await ctx.db.get("speakers", id);
    if (!speaker) throw new Error("Speaker not found");

    return { status: "success" };
  },
});

export const setStatusMany = mutation({
  args: {
    ids: v.array(v.id("speakers")),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { ids, status }) => {
    for (const id of ids) {
      await ctx.db.patch(id, { status });
      const speaker = await ctx.db.get("speakers", id);
      if (!speaker) throw new Error(`Speaker ${id} not found`);
    }

    return { status: "success" };
  },
});
