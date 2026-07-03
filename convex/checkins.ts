import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
      .withIndex("by_user_event", (q) =>
        q.eq("userid", userid).eq("eventid", eventid),
      )
      .first();

    if (existing) {
      throw new Error("User already checked into this event");
    }

    const id = await ctx.db.insert("checkins", {
      userid,
      eventid,
      firstname,
      lastname,
      email,
      role: "VISITOR",
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
