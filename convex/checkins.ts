import { scheduleAnalyticsEvent } from "./posthog";
import { mutation, query } from "./_generated/server";
import { convexError } from "./app_error";
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
      .withIndex("by_user_event", (q) => q.eq("userid", userid).eq("eventid", eventid))
      .first();

    if (existing) {
      throw convexError("VALIDATION_FAILED", "User already checked into this event");
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
    if (!created) throw convexError("INTERNAL", "Failed to create checkin");

    await scheduleAnalyticsEvent(ctx, "checkin_created", {
      tenant: created.tenant,
      entity_id: id,
      user_id: created.userid,
      event_id: created.eventid,
    });

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
      .withIndex("by_event_tenant", (q) => q.eq("eventid", eventid).eq("tenant", tenant))
      .collect();

    return allCheckins;
  },
});

export const remove = mutation({
  args: { id: v.id("checkins") },
  handler: async (ctx, { id }) => {
    const record = await ctx.db.get(id);
    if (!record) return { success: true };
    await ctx.db.delete(id);
    await scheduleAnalyticsEvent(ctx, "checkin_deleted", {
      tenant: record.tenant,
      entity_id: id,
      user_id: record.userid,
      event_id: record.eventid,
    });
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("checkins")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      const record = await ctx.db.get(id);
      if (!record) continue;
      await ctx.db.delete(id);
      await scheduleAnalyticsEvent(ctx, "checkin_deleted", {
        tenant: record.tenant,
        entity_id: id,
        user_id: record.userid,
        event_id: record.eventid,
      });
    }
    return { success: true };
  },
});
