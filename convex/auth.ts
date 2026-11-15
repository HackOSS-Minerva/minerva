import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

// The component client has methods needed for integrating Convex with Better
// Auth, as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility.
      convex({ authConfig }),
    ],
  });
};

// Get the current authenticated user (or null if signed out).
// Uses safeGetAuthUser so unauthenticated requests return null instead of
// throwing ConvexError("Unauthenticated").
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.safeGetAuthUser(ctx);
  },
});

// Auth-only session check; no role/tenant authorization. Use `getAdminAccess`
// (and friends) for role gating.
export const getAuthStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    return { authenticated: !!user } as const;
  },
});

// Admin section access. `authenticated` = valid Better Auth session;
// `authorized` = an ACCEPTANCE-status superadmin record in the tenant. This is
// the secure gate — the proxy only does an optimistic cookie check.
export const getAdminAccess = query({
  args: { tenant: v.string() },
  handler: (ctx, { tenant }) => readAdminAccess(ctx, tenant),
});

async function readAdminAccess(ctx: QueryCtx, tenant: string) {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) {
    return { authenticated: false, authorized: false } as const;
  }

  const superadmin = await ctx.db
    .query("superadmins")
    .withIndex("by_tenant_user", (q) => q.eq("tenant", tenant).eq("userId", user._id))
    .first();

  const authorized = superadmin?.status === "ACCEPTANCE";

  return {
    authenticated: true,
    authorized,
    status: superadmin?.status ?? null,
  } as const;
}

export const getAnalyticsCreationTime = query({
  args: {
    tenant: v.string(),
    id: v.string(),
    table: v.union(
      v.literal("participants"),
      v.literal("judges"),
      v.literal("speakers"),
      v.literal("superadmins"),
      v.literal("volunteers"),
      v.literal("submissions"),
      v.literal("checkins"),
    ),
    userId: v.optional(v.string()),
    eventId: v.optional(v.string()),
  },
  handler: async (ctx, { tenant, id, table, userId, eventId }) => {
    if (table === "checkins") {
      const access = await readAdminAccess(ctx, tenant);
      if (!access.authenticated) return { authenticated: false } as const;
      if (!access.authorized) return { authenticated: true, timestamp: null } as const;

      const recordId = ctx.db.normalizeId(table, id);
      const record = recordId && (await ctx.db.get(table, recordId));
      const timestamp =
        record && record.tenant === tenant && record.userid === userId && record.eventid === eventId
          ? record.timestamp
          : null;
      return { authenticated: true, timestamp } as const;
    }

    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return { authenticated: false } as const;

    const recordId = ctx.db.normalizeId(table, id);
    const record = recordId && (await ctx.db.get(table, recordId));
    if (!record || record.tenant !== tenant)
      return { authenticated: true, timestamp: null } as const;

    const email = user.email.trim().toLowerCase();
    const ownsRecord =
      "userId" in record
        ? record.userId === user._id
        : Boolean(email) && record.submitterEmail === email;
    return { authenticated: true, timestamp: ownsRecord ? record._creationTime : null } as const;
  },
});

// Judge section access, same shape as `getAdminAccess` but against the tenant's
// judge records. This is the secure gate; the proxy only checks cookies.
export const getJudgeAccess = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return { authenticated: false, authorized: false, status: null } as const;
    }

    const judge = await ctx.db
      .query("judges")
      .withIndex("by_tenant_user", (q) => q.eq("tenant", tenant).eq("userId", user._id))
      .first();

    const authorized = judge?.status === "ACCEPTANCE";

    return {
      authenticated: true,
      authorized,
      status: judge?.status ?? null,
    } as const;
  },
});

// Participant (live) access, same shape as `getJudgeAccess` but against the
// tenant's participant records. Gates the live "Participate" nav section.
export const getParticipantAccess = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return { authenticated: false, authorized: false, status: null } as const;
    }

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_tenant_user", (q) => q.eq("tenant", tenant).eq("userId", user._id))
      .first();

    const authorized = participant?.status === "ACCEPTANCE";

    return {
      authenticated: true,
      authorized,
      status: participant?.status ?? null,
    } as const;
  },
});
