import { query, mutation } from "./_generated/server";
import { convexError } from "./app_error";
import { v } from "convex/values";
import { authComponent } from "./auth";
import {
  getSubmissionTeam,
  MAX_LINKS_PER_TYPE,
  MAX_TEAM_SIZE,
  TEAM_SIZE_ERROR,
} from "../lib/vetting/rules";

export const get = query({
  args: { tenant: v.string() },
  handler: (ctx, { tenant }) => {
    return ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const getMine = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const submitterEmail = user?.email?.trim().toLowerCase();
    if (!submitterEmail) return null;

    const submission = await ctx.db
      .query("submissions")
      .withIndex("by_tenant_submitter", (q) =>
        q.eq("tenant", tenant).eq("submitterEmail", submitterEmail),
      )
      .first();
    if (submission) return submission;

    const tenantSubmissions = await ctx.db
      .query("submissions")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
    return (
      tenantSubmissions.find((candidate) =>
        candidate.invites.some((invite) => invite.trim().toLowerCase() === submitterEmail),
      ) ?? null
    );
  },
});

const validateSubmissionLinks = (github: string[], figma: string[], canva: string[]) => {
  const nonEmpty = (links: string[]) => links.filter((link) => link.trim() !== "");
  if (
    github.length > MAX_LINKS_PER_TYPE ||
    figma.length > MAX_LINKS_PER_TYPE ||
    canva.length > MAX_LINKS_PER_TYPE ||
    nonEmpty(github).length > MAX_LINKS_PER_TYPE ||
    nonEmpty(figma).length > MAX_LINKS_PER_TYPE ||
    nonEmpty(canva).length > MAX_LINKS_PER_TYPE
  ) {
    throw convexError(
      "VALIDATION_FAILED",
      `You can add at most ${MAX_LINKS_PER_TYPE} links per type.`,
    );
  }
};

export const add = mutation({
  args: {
    tenant: v.string(),
    teamName: v.string(),
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
    const user = await authComponent.safeGetAuthUser(ctx);
    const submitterEmail = user?.email?.trim().toLowerCase();
    if (!submitterEmail) {
      throw convexError("UNAUTHORIZED", "An authenticated submitter email is required.");
    }

    const existingAsSubmitter = await ctx.db
      .query("submissions")
      .withIndex("by_tenant_submitter", (q) =>
        q.eq("tenant", tenant).eq("submitterEmail", submitterEmail),
      )
      .first();
    const existing =
      existingAsSubmitter ??
      (
        await ctx.db
          .query("submissions")
          .filter((q) => q.eq(q.field("tenant"), tenant))
          .collect()
      ).find((candidate) =>
        candidate.invites.some((invite) => invite.trim().toLowerCase() === submitterEmail),
      );
    if (existing) {
      throw convexError(
        "VALIDATION_FAILED",
        "You already have access to a project submission. Reload the page to edit it.",
      );
    }

    const team = getSubmissionTeam(submitterEmail, invites);
    if (team.memberCount > MAX_TEAM_SIZE) throw convexError("VALIDATION_FAILED", TEAM_SIZE_ERROR);
    validateSubmissionLinks(github, figma, canva);

    const id = await ctx.db.insert("submissions", {
      teamName,
      submitterEmail,
      projectName,
      description,
      devpost,
      github,
      figma,
      canva,
      presentation,
      invites: team.normalizedInvites,
      tenant,
      timestamp: Date.now(),
      vetted: "needs_review",
      vettingStatus: "not_started",
    });
    return { success: true, id };
  },
});

export const update = mutation({
  args: {
    id: v.id("submissions"),
    tenant: v.string(),
    teamName: v.string(),
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
      id,
      tenant,
      teamName,
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
    const user = await authComponent.safeGetAuthUser(ctx);
    const submitterEmail = user?.email?.trim().toLowerCase();
    if (!submitterEmail) {
      throw convexError("UNAUTHORIZED", "An authenticated submitter email is required.");
    }

    const submission = await ctx.db.get(id);
    if (!submission || submission.tenant !== tenant) {
      throw convexError("NOT_FOUND", "Project submission not found.");
    }
    const isSubmitter = submission.submitterEmail?.trim().toLowerCase() === submitterEmail;
    const isInvited = submission.invites.some(
      (invite) => invite.trim().toLowerCase() === submitterEmail,
    );
    if (!isSubmitter && !isInvited) {
      throw convexError("FORBIDDEN", "You can only edit a submission you own or were invited to.");
    }

    const team = getSubmissionTeam(submission.submitterEmail, invites);
    if (team.memberCount > MAX_TEAM_SIZE) throw convexError("VALIDATION_FAILED", TEAM_SIZE_ERROR);
    validateSubmissionLinks(github, figma, canva);

    await ctx.db.patch(id, {
      teamName,
      projectName,
      description,
      devpost,
      github,
      figma,
      canva,
      presentation,
      invites: team.normalizedInvites,
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
