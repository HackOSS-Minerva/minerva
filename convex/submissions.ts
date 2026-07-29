import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const vettedStatus = v.union(
  v.literal("verified"),
  v.literal("needs_review"),
  v.literal("disqualified"),
);

function uniqueNormalizedEmails(emails: string[]): string[] {
  return Array.from(
    new Set(
      emails
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0),
    ),
  );
}

function normalizeRequiredEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("A valid submitter email is required.");
  }
  return normalized;
}

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const add = mutation({
  args: {
    tenant: v.string(),
    teamName: v.string(),
    submitterEmail: v.string(),
    projectName: v.string(),
    description: v.string(),
    devpost: v.string(),
    github: v.array(v.string()),
    figma: v.array(v.string()),
    canva: v.array(v.string()),
    presentation: v.optional(v.string()),
    invites: v.array(v.string()),
  },
  handler: async (
    ctx,
    {
      tenant,
      teamName,
      submitterEmail,
      projectName,
      description,
      devpost,
      github,
      figma,
      canva,
      presentation,
      invites,
    },
  ) => {
    const normalizedSubmitterEmail = normalizeRequiredEmail(submitterEmail);
    const normalizedInvites = uniqueNormalizedEmails(invites).filter(
      (email) => email !== normalizedSubmitterEmail,
    );
    const declaredTeamCount = 1 + normalizedInvites.length;

    if (declaredTeamCount > 4) {
      throw new Error(
        "Teams can include at most 4 people including the submitter.",
      );
    }

    const id = await ctx.db.insert("submissions", {
      teamName,
      submitterEmail: normalizedSubmitterEmail,
      projectName,
      description,
      devpost,
      github,
      figma,
      canva,
      presentation,
      invites: normalizedInvites,
      tenant,
      timestamp: Date.now(),
      vetted: "needs_review",
      vettingStatus: "not_started",
    });
    return { success: true, id };
  },
});

export const remove = mutation({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

export const deleteMany = mutation({
  args: { ids: v.array(v.id("submissions")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true };
  },
});

export const updateVetted = mutation({
  args: { id: v.id("submissions"), vetted: vettedStatus },
  handler: async (ctx, { id, vetted }) => {
    await ctx.db.patch(id, { vetted });
    return { success: true };
  },
});

export const updateVettedMany = mutation({
  args: { ids: v.array(v.id("submissions")), vetted: vettedStatus },
  handler: async (ctx, { ids, vetted }) => {
    for (const id of ids) {
      await ctx.db.patch(id, { vetted });
    }
    return { success: true };
  },
});
