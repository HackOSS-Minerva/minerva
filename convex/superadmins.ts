import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  dietrestrictions,
  genders,
  grades,
  majors,
  shirts,
  teams,
  ages,
} from "./schema";
import { statuses } from "../data/status";

export const getbyid = query({
  args: { id: v.id("superadmins") },
  handler: async (ctx, { id }) => {
    const superadmin = await ctx.db.get("superadmins", id);
    if (!superadmin) return null;
    return { id: superadmin._id, user: superadmin };
  },
});

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("superadmins")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const getstatus = query({
  args: { tenant: v.string(), workos: v.string() },
  handler: async (ctx, { tenant, workos }) => {
    const superadmin = await ctx.db
      .query("superadmins")
      .filter((q) =>
        q.and(q.eq(q.field("tenant"), tenant), q.eq(q.field("workos"), workos)),
      )
      .first();

    if (!superadmin) return null;
    return superadmin.status;
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
      discord: v.string(),
      major: majors,
      age: ages,
      grade: grades,
      team: teams,
      authId: v.string(),
      dietrestriction: dietrestrictions,
    }),
  },
  handler: async (ctx, { tenant, workos, user }) => {
    const id = await ctx.db.insert("superadmins", {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      telephone: user.telephone,
      gender: user.gender,
      shirt: user.shirt,
      discord: user.discord,
      major: user.major,
      age: user.age,
      grade: user.grade,
      team: user.team,
      dietrestriction: user.dietrestriction,
      status: "PENDING",
      authId: user.authId,
      tenant: tenant,
      workos: workos,
    });

    const created = await ctx.db.get("superadmins", id);
    if (!created) throw new Error("Failed to create superadmin");

    return { id, user: created };
  },
});

export const update = mutation({
  args: {
    id: v.id("superadmins"),
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
      grade: grades,
      team: teams,
      dietrestriction: dietrestrictions,
    }),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
    const superadmin = await ctx.db.get("superadmins", id);
    if (!superadmin) return null;
    return { id: superadmin._id, user: superadmin };
  },
});

export const remove = mutation({
  args: { id: v.id("superadmins") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("superadmins")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("superadmins"),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
    const superadmin = await ctx.db.get("superadmins", id);
    if (!superadmin) throw new Error("Superadmin not found");

    return { status: "success" };
  },
});

export const setStatusMany = mutation({
  args: {
    ids: v.array(v.id("superadmins")),
    status: v.union(...statuses.map((s) => v.literal(s))),
  },
  handler: async (ctx, { ids, status }) => {
    for (const id of ids) {
      await ctx.db.patch(id, { status });
      const superadmin = await ctx.db.get("superadmins", id);
      if (!superadmin) throw new Error(`Superadmin ${id} not found`);
    }

    return { status: "success" };
  },
});
