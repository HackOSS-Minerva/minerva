import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  countries,
  dietrestrictions,
  genders,
  grades,
  majors,
  schools,
  shirts,
  ages,
} from "./schema";
import { statuses } from "../data/status";

export const getbyid = query({
  args: { id: v.id("participants") },
  handler: async (ctx, { id }) => {
    const participant = await ctx.db.get("participants", id);
    if (!participant) return null;
    return { id: participant._id, user: participant };
  },
});

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("participants")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const getstatus = query({
  args: { tenant: v.string(), email: v.string() },
  handler: async (ctx, { tenant, email }) => {
    const participant = await ctx.db
      .query("participants")
      .filter((q) =>
        q.and(q.eq(q.field("tenant"), tenant), q.eq(q.field("email"), email)),
      )
      .first();

    if (!participant) return null;
    return participant.status;
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
      discord: v.string(),
      major: majors,
      age: ages,
      country: countries,
      school: schools,
      grade: grades,
      mlh_marketing: v.boolean(),
      dietrestriction: dietrestrictions,
      resume: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { tenant, user }) => {
    const id = await ctx.db.insert("participants", {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      telephone: user.telephone,
      gender: user.gender,
      shirt: user.shirt,
      discord: user.discord,
      major: user.major,
      age: user.age,
      country: user.country,
      school: user.school,
      grade: user.grade,
      mlh_marketing: user.mlh_marketing,
      dietrestriction: user.dietrestriction,
      resume: user.resume,
      status: "PENDING",
      tenant: tenant,
    });

    const created = await ctx.db.get("participants", id);
    if (!created) throw new Error("Failed to create participant");

    return { id, user: created };
  },
});

export const update = mutation({
  args: {
    id: v.id("participants"),
    updates: v.object({
      firstname: v.string(),
      lastname: v.string(),
      email: v.string(),
      telephone: v.string(),
      gender: genders,
      shirt: shirts,
      discord: v.string(),
      major: majors,
      age: ages,
      country: countries,
      school: schools,
      grade: grades,
      mlh_marketing: v.boolean(),
      dietrestriction: dietrestrictions,
      resume: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
    const updated = await ctx.db.get("participants", id);
    if (!updated) return null;
    return { id: updated._id, user: updated };
  },
});

export const remove = mutation({
  args: { id: v.id("participants") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("participants")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("participants"),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { id, status }) => {
    const participant = await ctx.db.get("participants", id);
    if (!participant) throw new Error("Participant not found");

    if (participant.status === status) {
      return { status: "unchanged" };
    }

    await ctx.db.patch(id, { status });

    return { status: "success" };
  },
});

export const setStatusMany = mutation({
  args: {
    ids: v.array(v.id("participants")),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { ids, status }) => {
    let changedCount = 0;

    for (const id of ids) {
      const participant = await ctx.db.get("participants", id);
      if (!participant) throw new Error(`Participant ${id} not found`);

      if (participant.status === status) continue;

      await ctx.db.patch(id, { status });
      changedCount += 1;
    }

    return { status: "success", changedCount };
  },
});
