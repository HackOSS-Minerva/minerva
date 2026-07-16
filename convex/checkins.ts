import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { isDuplicateCheckin } from "../lib/checkins/duplicate-scope";
import { resolveCanonicalCheckinRole } from "../lib/checkins/role-resolution";

export const checkin = mutation({
  args: {
    userid: v.string(),
    eventid: v.string(),
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    tenant: v.string(),
  },
  handler: async (ctx, args) => {
    const { userid, eventid, firstname, lastname, email, tenant } = args;

    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_user_event_tenant", (q) =>
        q.eq("userid", userid).eq("eventid", eventid).eq("tenant", tenant),
      )
      .first();

    if (existing && isDuplicateCheckin(existing, { userid, eventid, tenant })) {
      throw new Error("User already checked into this event");
    }

    const [participants, judges, speakers, volunteers] = await Promise.all([
      ctx.db
        .query("participants")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
      ctx.db
        .query("judges")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
      ctx.db
        .query("speakers")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
      ctx.db
        .query("volunteers")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
    ]);
    const role = resolveCanonicalCheckinRole({
      email,
      participants,
      judges,
      speakers,
      volunteers,
    });

    const id = await ctx.db.insert("checkins", {
      userid,
      eventid,
      firstname,
      lastname,
      email,
      role,
      timestamp: Date.now(),
      tenant,
    });

    const created = await ctx.db.get("checkins", id);
    if (!created) throw new Error("Failed to create checkin");

    return { id, checkin: created };
  },
});

export const getByEvent = query({
  args: {
    eventid: v.optional(v.string()),
    tenant: v.string(),
  },
  handler: async (ctx, args) => {
    const { eventid, tenant } = args;

    if (!eventid) {
      return [];
    }

    const allCheckins = await ctx.db
      .query("checkins")
      .withIndex("by_event_tenant", (q) =>
        q.eq("eventid", eventid).eq("tenant", tenant),
      )
      .collect();

    return allCheckins;
  },
});

export const remove = mutation({
  args: { id: v.id("checkins") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("checkins")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});
