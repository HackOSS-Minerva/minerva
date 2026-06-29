import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const ROLE_TABLES = [
  "participants",
  "judges",
  "speakers",
  "superadmins",
  "volunteers",
] as const;

const ROLE_MAP: Record<string, string> = {
  participants: "participant",
  judges: "judge",
  speakers: "speaker",
  superadmins: "superadmin",
  volunteers: "volunteer",
};

/**
 * Resolves a user's role by checking which role table contains a document
 * matching the given WorkOS user ID and tenant.
 */
async function resolveRole(
  ctx: MutationCtx,
  workos: string,
  tenant: string,
): Promise<string | null> {
  for (const table of ROLE_TABLES) {
    const doc = await ctx.db
      .query(table)
      .filter((q) =>
        q.and(
          q.eq(q.field("workos"), workos),
          q.eq(q.field("tenant"), tenant),
        ),
      )
      .first();

    if (doc) {
      return ROLE_MAP[table];
    }
  }

  return null;
}

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

    // Check if a checkin already exists for this user + event
    const existing = await ctx.db
      .query("checkins")
      .withIndex("by_user_event", (q) =>
        q.eq("userid", userid).eq("eventid", eventid),
      )
      .first();

    if (existing) {
      throw new Error("User already checked into this event");
    }

    // Resolve the role from the database using the WorkOS user ID
    const role = await resolveRole(ctx, userid, tenant);
    if (!role) {
      throw new Error(
        "User not found in any role. They must register before checking in.",
      );
    }

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

    // If no event selected, return empty
    if (!eventid) {
      return [];
    }

    // Query checkins by eventid using the tenant filter
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
