import { defineSchema, defineTable } from "convex/server";
import { v, Validator } from "convex/values";
import {
  ages as Ages,
  availabilities as Availabilities,
  dietrestrictions as DietRestrictions,
  grades as Grades,
  majors as Majors,
  teams as Teams,
} from "../data/information";
import {
  affiliations as Affiliations,
  genders as Genders,
  shirts as Shirts,
} from "../data/information";
import { countries as Countries } from "../data/countries";
import { schools as Schools } from "../data/schools";
import { statuses as Statuses } from "../data/status";

export const union = <const T extends readonly [string, ...string[]]>(
  values: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Validator<any> => {
  return v.union(...values.map((value) => v.literal(value)));
};

export const genders = union(Genders);
export const shirts = union(Shirts);
export const affiliations = union(Affiliations);
export const statuses = union(Statuses);
export const grades = union(Grades);
export const majors = union(Majors);
export const teams = union(Teams);
export const countries = union(Countries);
export const schools = union(Schools);
export const ages = union(Ages);
export const dietrestrictions = union(DietRestrictions);
export const availabilities = union(Availabilities);

const vettingStatuses = v.union(
  v.literal("not_started"),
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
);

const vettingResults = v.union(
  v.literal("verified"),
  v.literal("needs_review"),
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
  v.literal("commit_before_event"),
  v.literal("commit_after_deadline_grace"),
  v.literal("git_contributor_count_exceeds_limit"),
  v.literal("unregistered_git_contributor"),
  v.literal("git_identity_used_on_multiple_submissions"),
  v.literal("author_committer_mismatch"),
  v.literal("github_rate_limited"),
  v.literal("github_api_error"),
);

export default defineSchema({
  participants: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    gender: genders,
    shirt: shirts,
    discord: v.string(),
    major: majors,
    age: ages,
    country: countries,
    school: schools,
    grade: grades,
    mlh_marketing: v.boolean(),
    dietrestriction: dietrestrictions,
    resume: v.optional(v.string()),
    status: statuses,
    tenant: v.string(),
  }),

  judges: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    gender: genders,
    shirt: shirts,
    affiliation: affiliations,
    title: v.string(),
    organization: v.string(),
    dietrestriction: dietrestrictions,
    picture: v.string(),
    status: statuses,
    tenant: v.string(),
  }),

  speakers: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    gender: genders,
    shirt: shirts,
    affiliation: affiliations,
    title: v.string(),
    organization: v.string(),
    dietrestriction: dietrestrictions,
    picture: v.string(),
    status: statuses,
    tenant: v.string(),
  }),

  superadmins: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    gender: genders,
    shirt: shirts,
    discord: v.string(),
    major: majors,
    age: ages,
    grade: grades,
    team: teams,
    status: statuses,
    dietrestriction: dietrestrictions,
    tenant: v.string(),
  }),

  checkins: defineTable({
    userid: v.string(),
    eventid: v.string(),
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    role: v.string(),
    timestamp: v.number(),
    tenant: v.string(),
  })
    .index("by_user_event", ["userid", "eventid"])
    .index("by_event_tenant", ["eventid", "tenant"]),

  volunteers: defineTable({
    firstname: v.string(),
    lastname: v.string(),
    email: v.string(),
    telephone: v.string(),
    discord: v.string(),
    gender: genders,
    shirt: shirts,
    terms: v.boolean(),
    dietrestriction: dietrestrictions,
    availabilities: v.array(availabilities),
    status: statuses,
    tenant: v.string(),
  }),

  feedback: defineTable({
    find: v.string(),
    liked_to_see: v.string(),
    not_beneficial: v.string(),
    rating: v.number(),
    anything_else: v.string(),
    tenant: v.string(),
    timestamp: v.number(),
  }),

  ideas: defineTable({
    title: v.string(),
    description: v.string(),
    authorid: v.string(),
    author: v.string(),
    skills: v.array(v.string()),
    timestamp: v.number(),
    tenant: v.string(),
  }),

  submissions: defineTable({
    teamName: v.string(),
    projectName: v.string(),
    description: v.string(),
    devpost: v.string(),
    github: v.array(v.string()),
    figma: v.array(v.string()),
    canva: v.array(v.string()),
    presentation: v.optional(v.string()),
    invites: v.array(v.string()),
    tenant: v.string(),
    timestamp: v.number(),
    vetted: v.union(
      v.literal("verified"),
      v.literal("needs_review"),
      v.literal("disqualified"),
    ),
    vettingStatus: v.optional(vettingStatuses),
    latestVettingRunId: v.optional(v.id("repoVettingRuns")),
    lastVettedAt: v.optional(v.number()),
    submittedByGithubUserId: v.optional(v.string()),
    submittedByGithubUsername: v.optional(v.string()),
  })
    .index("by_tenant", ["tenant"])
    .index("by_tenant_vetted", ["tenant", "vetted"])
    .index("by_vetting_status", ["vettingStatus"]),

  submissionGitIdentities: defineTable({
    tenant: v.string(),
    submissionId: v.id("submissions"),
    email: v.optional(v.string()),
    provider: v.literal("github"),
    providerUserId: v.string(),
    username: v.string(),
    primaryEmail: v.optional(v.string()),
    verifiedEmails: v.array(v.string()),
    connectedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_submission", ["submissionId"])
    .index("by_provider_user_id", ["providerUserId"])
    .index("by_tenant_username", ["tenant", "username"]),

  repoVettingRuns: defineTable({
    tenant: v.string(),
    submissionId: v.id("submissions"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    result: v.optional(vettingResults),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    githubRateLimitRemaining: v.optional(v.number()),
  })
    .index("by_submission", ["submissionId"])
    .index("by_tenant_status", ["tenant", "status"]),

  repoVettingRepos: defineTable({
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
  })
    .index("by_submission", ["submissionId"])
    .index("by_run", ["runId"]),

  repoVettingContributors: defineTable({
    runId: v.id("repoVettingRuns"),
    submissionId: v.id("submissions"),
    repoUrl: v.string(),
    githubUserId: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    authorName: v.optional(v.string()),
    commitCount: v.number(),
    firstCommitAt: v.number(),
    lastCommitAt: v.number(),
    mappedEmail: v.optional(v.string()),
    mappingSource: v.union(
      v.literal("oauth"),
      v.literal("email"),
      v.literal("manual"),
      v.literal("unmapped"),
    ),
  })
    .index("by_run", ["runId"])
    .index("by_submission", ["submissionId"])
    .index("by_github_user", ["githubUserId"])
    .index("by_author_email", ["authorEmail"]),

  gitIdentityMappings: defineTable({
    tenant: v.string(),
    identityType: v.union(
      v.literal("github_user_id"),
      v.literal("github_username"),
      v.literal("author_email"),
    ),
    identityValue: v.string(),
    mappedEmail: v.string(),
    createdByOrganizerEmail: v.optional(v.string()),
    createdAt: v.number(),
    note: v.optional(v.string()),
  })
    .index("by_tenant_identity", ["tenant", "identityType", "identityValue"])
    .index("by_mapped_email", ["mappedEmail"]),

  repoVettingFindings: defineTable({
    runId: v.id("repoVettingRuns"),
    submissionId: v.id("submissions"),
    repoUrl: v.optional(v.string()),
    severity: findingSeverity,
    code: findingCode,
    message: v.string(),
    evidenceJson: v.string(),
    createdAt: v.number(),
  })
    .index("by_submission", ["submissionId"])
    .index("by_run", ["runId"])
    .index("by_code", ["code"]),
});
