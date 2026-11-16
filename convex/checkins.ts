import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { convexError } from "./app_error";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { isTenantSlug, tenantConfigs } from "../tenants/config";
import { api, components } from "./_generated/api";

async function requireCheckinAdmin(ctx: QueryCtx | MutationCtx, tenant: string) {
  const access = await ctx.runQuery(api.auth.getAdminAccess, { tenant });
  if (!access.authenticated) throw convexError("UNAUTHORIZED");
  if (!access.authorized) throw convexError("FORBIDDEN");
}

export const getHackCredits = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    if (!isTenantSlug(tenant)) throw convexError("TENANT_INVALID");

    const checkins = await ctx.db
      .query("checkins")
      .withIndex("by_user_tenant_event", (q) => q.eq("userid", user._id).eq("tenant", tenant))
      .collect();

    // Attendance is the source of truth, including historical attendance.
    // Deduplicate legacy records so one activity never awards credits twice.
    const checkinCount = new Set(checkins.map((checkin) => checkin.eventid)).size;
    return {
      balance: checkinCount * tenantConfigs[tenant].hackCreditsPerCheckin,
      checkinCount,
    };
  },
});

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
    await requireCheckinAdmin(ctx, tenant);
    if (!eventid.trim()) throw convexError("BAD_REQUEST", "Select an event before checking in");
    // Look up by email so malformed/stale QR IDs never reach db.get(). Both
    // identifiers must match the same real account before attendance is saved.
    const attendee = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    });
    if (!attendee || attendee._id !== userid) {
      throw convexError("NOT_FOUND", "Attendee account not found");
    }

    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_user_tenant_event", (q) =>
        q.eq("userid", userid).eq("tenant", tenant).eq("eventid", eventid),
      )
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
    await requireCheckinAdmin(ctx, tenant);

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
    const checkin = await ctx.db.get("checkins", id);
    if (!checkin) throw convexError("NOT_FOUND");
    await requireCheckinAdmin(ctx, checkin.tenant);
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("checkins")) },
  handler: async (ctx, { ids }) => {
    const tenants = new Set<string>();
    for (const id of ids) {
      const checkin = await ctx.db.get("checkins", id);
      if (!checkin) throw convexError("NOT_FOUND");
      tenants.add(checkin.tenant);
    }
    for (const tenant of tenants) {
      await requireCheckinAdmin(ctx, tenant);
    }
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});
