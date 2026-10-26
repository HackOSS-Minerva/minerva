import { v } from "convex/values";
import { internalAction, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { convexError } from "./app_error";
import type { AnalyticsEvent, AnalyticsEventProperties } from "../lib/analytics";

export async function scheduleAnalyticsEvent(
  ctx: MutationCtx,
  event: AnalyticsEvent,
  properties: AnalyticsEventProperties,
): Promise<void> {
  // Scheduling is part of the mutation's transaction: rollback cancels delivery.
  await ctx.scheduler.runAfter(0, internal.posthog.capture, {
    event,
    properties,
    timestamp: Date.now(),
  });
}

export const capture = internalAction({
  args: {
    event: v.union(
      v.literal("application_created"),
      v.literal("application_status_changed"),
      v.literal("application_deleted"),
      v.literal("checkin_created"),
      v.literal("checkin_deleted"),
      v.literal("submission_created"),
      v.literal("submission_deleted"),
    ),
    properties: v.object({
      tenant: v.string(),
      entity_id: v.string(),
      role: v.optional(
        v.union(
          v.literal("participant"),
          v.literal("judge"),
          v.literal("speaker"),
          v.literal("superadmin"),
          v.literal("volunteer"),
        ),
      ),
      status: v.optional(
        v.union(v.literal("PENDING"), v.literal("ACCEPTANCE"), v.literal("REJECTION")),
      ),
      user_id: v.optional(v.string()),
      event_id: v.optional(v.string()),
      gender: v.optional(v.string()),
      dietrestriction: v.optional(v.string()),
      shirt: v.optional(v.string()),
      school: v.optional(v.string()),
      major: v.optional(v.string()),
      age: v.optional(v.string()),
      grade: v.optional(v.string()),
    }),
    timestamp: v.number(),
    uuid: v.optional(v.string()),
    attempt: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<null> => {
    const key = process.env.POSTHOG_KEY;
    if (!key) {
      console.error("PostHog delivery failed: POSTHOG_KEY is not configured in Convex");
      throw convexError("CONFIG_ERROR");
    }

    const host = (process.env.POSTHOG_HOST ?? "https://us.i.posthog.com").replace(/\/$/, "");
    const uuid = args.uuid ?? crypto.randomUUID();
    const attempt = args.attempt ?? 0;
    let status: number | undefined;
    try {
      const response = await fetch(`${host}/i/v0/e/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          api_key: key,
          uuid,
          event: args.event,
          timestamp: new Date(args.timestamp).toISOString(),
          distinct_id: `${args.properties.tenant}:${args.properties.user_id ?? args.properties.entity_id}`,
          properties: { ...args.properties, $process_person_profile: false },
        }),
      });
      if (response.ok) return null;
      status = response.status;
    } catch {
      // Network errors and timeouts are retried with the original event identity.
    }

    const retryable = status === undefined || status === 408 || status === 429 || status >= 500;
    const details = {
      event: args.event,
      tenant: args.properties.tenant,
      entity_id: args.properties.entity_id,
      attempt: attempt + 1,
      status: status ?? "network_error",
    };
    if (retryable && attempt < 2) {
      console.warn("PostHog delivery retry", details);
      await ctx.scheduler.runAfter(1000 * 2 ** attempt, internal.posthog.capture, {
        ...args,
        uuid,
        attempt: attempt + 1,
      });
      return null;
    }

    console.error("PostHog delivery failed", details);
    throw convexError("UPSTREAM_UNAVAILABLE", "PostHog event delivery failed");
  },
});
