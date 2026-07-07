import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const identityType = v.union(
  v.literal("github_user_id"),
  v.literal("github_username"),
  v.literal("author_email"),
);

const findingSeverity = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("review_required"),
);

const findingCode = v.union(
  v.literal("submitter_missing_github_oauth"),
  v.literal("declared_team_size_exceeds_limit"),
  v.literal("repo_invalid_url"),
  v.literal("repo_private_or_inaccessible"),
  v.literal("repo_created_before_event"),
  v.literal("repo_fork_detected"),
  v.literal("repo_template_detected"),
  v.literal("repo_empty_or_no_event_commits"),
  v.literal("commit_scan_truncated"),
  v.literal("commit_before_event"),
  v.literal("commit_after_deadline_grace"),
  v.literal("git_contributor_count_exceeds_limit"),
  v.literal("unregistered_git_contributor"),
  v.literal("git_identity_used_on_multiple_submissions"),
  v.literal("author_committer_mismatch"),
  v.literal("github_rate_limited"),
  v.literal("github_api_error"),
);

const vettingResult = v.union(v.literal("verified"), v.literal("needs_review"));

const mappingSource = v.union(
  v.literal("oauth"),
  v.literal("email"),
  v.literal("manual"),
  v.literal("unmapped"),
);

const contributorInput = v.object({
  repoUrl: v.string(),
  githubUserId: v.optional(v.string()),
  githubUsername: v.optional(v.string()),
  authorEmail: v.optional(v.string()),
  authorName: v.optional(v.string()),
  commitCount: v.number(),
  firstCommitAt: v.number(),
  lastCommitAt: v.number(),
  mappedEmail: v.optional(v.string()),
  mappingSource,
});

const findingInput = v.object({
  repoUrl: v.optional(v.string()),
  severity: findingSeverity,
  code: findingCode,
  message: v.string(),
  evidenceJson: v.string(),
});

export const getSubmissionVettingSummary = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.db.get(submissionId);
    if (!submission) return null;

    const runs = await ctx.db
      .query("repoVettingRuns")
      .withIndex("by_submission", (q) => q.eq("submissionId", submissionId))
      .collect();

    const latestRun = runs.sort((a, b) => b.startedAt - a.startedAt)[0] ?? null;
    if (!latestRun) {
      return {
        submission,
        latestRun: null,
        repos: [],
        contributors: [],
        findings: [],
      };
    }

    const repos = await ctx.db
      .query("repoVettingRepos")
      .withIndex("by_run", (q) => q.eq("runId", latestRun._id))
      .collect();
    const contributors = await ctx.db
      .query("repoVettingContributors")
      .withIndex("by_run", (q) => q.eq("runId", latestRun._id))
      .collect();
    const findings = await ctx.db
      .query("repoVettingFindings")
      .withIndex("by_run", (q) => q.eq("runId", latestRun._id))
      .collect();

    return { submission, latestRun, repos, contributors, findings };
  },
});

export const getMappingsForTenant = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    return await ctx.db
      .query("gitIdentityMappings")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();
  },
});

export const getSubmissionGitIdentities = query({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, { submissionId }) => {
    return await ctx.db
      .query("submissionGitIdentities")
      .withIndex("by_submission", (q) => q.eq("submissionId", submissionId))
      .collect();
  },
});

export const findMatchingContributors = query({
  args: {
    tenant: v.string(),
    submissionId: v.id("submissions"),
    githubUserId: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
  },
  handler: async (ctx, { tenant, submissionId, githubUserId, authorEmail }) => {
    const matches = [];

    if (githubUserId) {
      const githubMatches = await ctx.db
        .query("repoVettingContributors")
        .withIndex("by_github_user", (q) => q.eq("githubUserId", githubUserId))
        .collect();
      matches.push(...githubMatches);
    }

    if (authorEmail) {
      const emailMatches = await ctx.db
        .query("repoVettingContributors")
        .withIndex("by_author_email", (q) => q.eq("authorEmail", authorEmail))
        .collect();
      matches.push(...emailMatches);
    }

    const uniqueMatches = new Map(matches.map((match) => [match._id, match]));
    const scopedMatches = [];

    for (const match of uniqueMatches.values()) {
      if (match.submissionId === submissionId) continue;

      const submission = await ctx.db.get(match.submissionId);
      if (submission?.tenant === tenant) {
        scopedMatches.push(match);
      }
    }

    return scopedMatches;
  },
});

export const searchMappingCandidates = query({
  args: { tenant: v.string(), query: v.string() },
  handler: async (ctx, { tenant, query }) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_tenant", (q) => q.eq("tenant", tenant))
      .collect();
    const participants = await ctx.db
      .query("participants")
      .filter((q) => q.eq(q.field("tenant"), tenant))
      .collect();

    const emails = new Set<string>();
    for (const submission of submissions) {
      for (const invite of submission.invites) {
        const email = invite.trim().toLowerCase();
        if (email.includes(normalized)) emails.add(email);
      }
    }
    for (const participant of participants) {
      const email = participant.email.trim().toLowerCase();
      if (email.includes(normalized)) emails.add(email);
    }

    return Array.from(emails).sort().slice(0, 20);
  },
});

export const createManualMapping = mutation({
  args: {
    tenant: v.string(),
    identityType,
    identityValue: v.string(),
    mappedEmail: v.string(),
    createdByOrganizerEmail: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("gitIdentityMappings", {
      ...args,
      identityValue: args.identityValue.trim().toLowerCase(),
      mappedEmail: args.mappedEmail.trim().toLowerCase(),
      createdAt: Date.now(),
    });

    return { success: true, id };
  },
});

export const startRun = mutation({
  args: { submissionId: v.id("submissions"), tenant: v.string() },
  handler: async (ctx, { submissionId, tenant }) => {
    const submission = await ctx.db.get(submissionId);
    if (!submission) throw new Error("Submission not found");

    const id = await ctx.db.insert("repoVettingRuns", {
      tenant,
      submissionId,
      status: "running",
      startedAt: Date.now(),
    });

    await ctx.db.patch(submissionId, {
      vettingStatus: "running",
      latestVettingRunId: id,
    });

    return { id };
  },
});

export const saveRepoSnapshot = mutation({
  args: {
    runId: v.id("repoVettingRuns"),
    submissionId: v.id("submissions"),
    repoUrl: v.string(),
    owner: v.string(),
    name: v.string(),
    visibility: v.optional(
      v.union(v.literal("public"), v.literal("private"), v.literal("internal")),
    ),
    isPrivate: v.optional(v.boolean()),
    isFork: v.optional(v.boolean()),
    isTemplate: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    pushedAt: v.optional(v.number()),
    defaultBranch: v.optional(v.string()),
    accessible: v.boolean(),
    fetchedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("repoVettingRepos", args);
    return { success: true, id };
  },
});

export const saveContributors = mutation({
  args: {
    runId: v.id("repoVettingRuns"),
    submissionId: v.id("submissions"),
    contributors: v.array(contributorInput),
  },
  handler: async (ctx, { runId, submissionId, contributors }) => {
    const ids = [];
    for (const contributor of contributors) {
      ids.push(
        await ctx.db.insert("repoVettingContributors", {
          runId,
          submissionId,
          ...contributor,
        }),
      );
    }

    return { success: true, ids };
  },
});

export const saveFindings = mutation({
  args: {
    runId: v.id("repoVettingRuns"),
    submissionId: v.id("submissions"),
    findings: v.array(findingInput),
  },
  handler: async (ctx, { runId, submissionId, findings }) => {
    const ids = [];
    for (const finding of findings) {
      ids.push(
        await ctx.db.insert("repoVettingFindings", {
          runId,
          submissionId,
          ...finding,
          createdAt: Date.now(),
        }),
      );
    }

    return { success: true, ids };
  },
});

export const completeRun = mutation({
  args: {
    runId: v.id("repoVettingRuns"),
    submissionId: v.id("submissions"),
    result: vettingResult,
    githubRateLimitRemaining: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { runId, submissionId, result, githubRateLimitRemaining },
  ) => {
    const submission = await ctx.db.get(submissionId);
    if (!submission) throw new Error("Submission not found");

    const completedAt = Date.now();
    const vetted =
      submission.vetted === "disqualified" ? "disqualified" : result;

    await ctx.db.patch(runId, {
      status: "completed",
      result,
      completedAt,
      githubRateLimitRemaining,
    });
    await ctx.db.patch(submissionId, {
      vetted,
      vettingStatus: "completed",
      lastVettedAt: completedAt,
      latestVettingRunId: runId,
    });

    return { success: true };
  },
});

export const failRun = mutation({
  args: {
    runId: v.id("repoVettingRuns"),
    submissionId: v.id("submissions"),
    errorMessage: v.string(),
    githubRateLimitRemaining: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { runId, submissionId, errorMessage, githubRateLimitRemaining },
  ) => {
    const submission = await ctx.db.get(submissionId);
    if (!submission) throw new Error("Submission not found");

    const completedAt = Date.now();
    const vetted =
      submission.vetted === "disqualified" ? "disqualified" : "needs_review";

    await ctx.db.patch(runId, {
      status: "failed",
      result: "needs_review",
      completedAt,
      errorMessage,
      githubRateLimitRemaining,
    });
    await ctx.db.patch(submissionId, {
      vetted,
      vettingStatus: "failed",
      lastVettedAt: completedAt,
      latestVettingRunId: runId,
    });

    return { success: true };
  },
});
