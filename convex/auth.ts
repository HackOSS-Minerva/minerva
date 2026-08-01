import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
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
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

/**
 * Returns whether the request carries a valid Better Auth session.
 *
 * This is a lightweight auth-only check; it does not perform any role or
 * tenant-specific authorization. For admin gating, use `getAdminAccess`.
 */
export const getAuthStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    return { authenticated: !!user } as const;
  },
});

/**
 * Returns the access state for the admin section of a tenant.
 *
 * - `authenticated` is true when the request carries a valid Better Auth
 *   session (i.e. the user is signed in with Google).
 * - `authorized` is true when the signed-in user's email matches a superadmin
 *   record in the given tenant whose status is "ACCEPTANCE" (approved).
 *
 * This is the secure authorization check used by the admin layout. The proxy
 * only does an optimistic cookie-existence check; this query is what actually
 * gates access.
 */
export const getAdminAccess = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return { authenticated: false, authorized: false } as const;
    }

    const superadmin = await ctx.db
      .query("superadmins")
      .withIndex("by_tenant_user", (q) =>
        q.eq("tenant", tenant).eq("userId", user._id),
      )
      .first();

    const authorized = superadmin?.status === "ACCEPTANCE";

    return {
      authenticated: true,
      authorized,
      status: superadmin?.status ?? null,
    } as const;
  },
});

/**
 * Returns the access state for the judge section of a tenant.
 *
 * - `authenticated` is true when the request carries a valid Better Auth
 *   session (i.e. the user is signed in with Google).
 * - `authorized` is true when the signed-in user's email matches a judge
 *   record in the given tenant whose status is "ACCEPTANCE" (approved).
 * - `status` is the judge's approval status ("ACCEPTANCE", "PENDING",
 *   "REJECTION", or `null` if the user has not applied yet).
 *
 * This is the secure authorization check used by the judge layout. The proxy
 * only does an optimistic cookie-existence check; this query is what actually
 * gates access to judge-only features.
 */
export const getJudgeAccess = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return { authenticated: false, authorized: false, status: null } as const;
    }

    const judge = await ctx.db
      .query("judges")
      .withIndex("by_tenant_user", (q) =>
        q.eq("tenant", tenant).eq("userId", user._id),
      )
      .first();

    const authorized = judge?.status === "ACCEPTANCE";

    return {
      authenticated: true,
      authorized,
      status: judge?.status ?? null,
    } as const;
  },
});

