import { makeFunctionReference } from "convex/server";
import { action } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  parseGithubRateLimit,
  parseGithubRepoUrl,
} from "../lib/vetting/github";
import { getRuntimeVettingConfigForTenant } from "../lib/vetting/event-config";
import {
  createFinding,
  extractUniqueAuthors,
  getDeclaredTeamCount,
  resultFromFindings,
  uniqueNormalizedEmails,
} from "../lib/vetting/rules";
import type {
  ExtractedContributor,
  FindingCode,
  GithubCommitAuthor,
  GithubRepoSnapshot,
  VettingFindingInput,
  VettingResult,
} from "../lib/vetting/types";

type GithubJsonResult = {
  ok: boolean;
  status: number;
  rateLimitRemaining?: number;
  rateLimitResetAt?: number;
  data: unknown;
};

type GithubRepoResponse = {
  private?: boolean;
  visibility?: "public" | "private" | "internal";
  fork?: boolean;
  is_template?: boolean;
  created_at?: string;
  pushed_at?: string;
  default_branch?: string;
};

type RepoSnapshot = GithubRepoSnapshot & { repoUrl: string; accessible: boolean; fetchedAt: number };

type ContributorRow = ExtractedContributor & { repoUrl: string; mappedEmail?: string; mappingSource: "oauth" | "email" | "unmapped" };

type FindingRow = VettingFindingInput & { repoUrl?: string };

const getSubmissionById = makeFunctionReference<
  "query",
  { id: Id<"submissions"> },
  { _id: Id<"submissions">; tenant: string; github: string[]; invites: string[] } | null
>("submissions:getById");

const updateSubmissionVettingStatus = makeFunctionReference<
  "mutation",
  {
    id: Id<"submissions">;
    vetted: "verified" | "needs_review" | "disqualified";
    vettingStatus: "not_started" | "running" | "completed" | "failed";
    lastVettedAt?: number;
  },
  { success: boolean }
>("vetting:updateSubmissionVettingStatus");

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubJson(url: string): Promise<GithubJsonResult> {
  const response = await fetch(url, { headers: githubHeaders() });
  const rate = parseGithubRateLimit(response.headers);
  const data = await response.json().catch(() => null);

  return {
    ok: response.ok,
    status: response.status,
    rateLimitRemaining: rate.remaining,
    rateLimitResetAt: rate.resetAt,
    data,
  };
}

function isRateLimited(result: GithubJsonResult): boolean {
  return (
    (result.status === 403 || result.status === 429) &&
    result.rateLimitRemaining === 0
  );
}

function toTimestamp(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const value = new Date(raw).getTime();
  return Number.isFinite(value) ? value : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeRepoResponse(data: unknown): GithubRepoResponse {
  if (!isObject(data)) return {};

  return {
    private: typeof data.private === "boolean" ? data.private : undefined,
    visibility:
      data.visibility === "public" ||
      data.visibility === "private" ||
      data.visibility === "internal"
        ? data.visibility
        : undefined,
    fork: typeof data.fork === "boolean" ? data.fork : undefined,
    is_template:
      typeof data.is_template === "boolean" ? data.is_template : undefined,
    created_at:
      typeof data.created_at === "string" ? data.created_at : undefined,
    pushed_at: typeof data.pushed_at === "string" ? data.pushed_at : undefined,
    default_branch: typeof data.default_branch === "string" ? data.default_branch : undefined,
  };
}

function normalizeCommitResponse(data: unknown): GithubCommitAuthor[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((entry): GithubCommitAuthor | null => {
      if (!isObject(entry)) return null;

      const commit = isObject(entry.commit) ? entry.commit : {};
      const author = isObject(commit.author) ? commit.author : {};
      const committer = isObject(commit.committer) ? commit.committer : {};
      const githubAuthor = isObject(entry.author) ? entry.author : {};
      const authorDate =
        typeof author.date === "string" ? toTimestamp(author.date) : undefined;

      if (!authorDate) return null;

      return {
        sha: typeof entry.sha === "string" ? entry.sha : "unknown",
        githubUserId:
          typeof githubAuthor.id === "number"
            ? String(githubAuthor.id)
            : undefined,
        githubUsername:
          typeof githubAuthor.login === "string"
            ? githubAuthor.login
            : undefined,
        authorEmail:
          typeof author.email === "string" ? author.email.toLowerCase()
            : undefined,
        authorName: typeof author.name === "string" ? author.name : undefined,
        authorDate,
        committerEmail:
          typeof committer.email === "string" ? committer.email.toLowerCase()
            : undefined,
        committerName: typeof committer.name === "string" ? committer.name : undefined,
        committerDate:
          typeof committer.date === "string" ? toTimestamp(committer.date) : undefined,
      };
    })
    .filter((commit): commit is GithubCommitAuthor => commit !== null);
}

function finding(input: {
  code: FindingCode;
  message: string;
  repoUrl?: string;
  evidence: Record<string, unknown>;
  severity?: "info" | "warning" | "review_required";
}): VettingFindingInput {
  return createFinding({
    severity: input.severity ?? "review_required",
    code: input.code,
    message: input.message,
    repoUrl: input.repoUrl,
    evidence: input.evidence,
  });
}

function mapContributorToSubmittedIdentity(args: {
  contributor: ExtractedContributor;
  declaredEmails: string[];
}): { mappedEmail: string; mappingSource: "email" } | null {
  const { contributor, declaredEmails } = args;

  if (
    contributor.authorEmail &&
    declaredEmails.includes(contributor.authorEmail.toLowerCase())
  ) {
    return { mappedEmail: contributor.authorEmail, mappingSource: "email" };
  }

  return null;
}

function findAuthorCommitterMismatches(
  commits: GithubCommitAuthor[],
): VettingFindingInput[] {
  return commits
    .filter((commit) => {
      if (!commit.authorEmail || !commit.committerEmail) return false;
      if (commit.committerEmail.includes("noreply.github.com")) return false;
      return commit.authorEmail !== commit.committerEmail;
    })
    .slice(0, 10)
    .map((commit) =>
      finding({
        code: "author_committer_mismatch",
        message: "Commit author and committer differ.",
        evidence: {
          sha: commit.sha,
          authorEmail: commit.authorEmail,
          authorName: commit.authorName,
          committerEmail: commit.committerEmail,
          committerName: commit.committerName,
        },
      }),
    );
}

async function fetchCommits(args: {
  owner: string;
  name: string;
  since?: string;
  until?: string;
  perPage: number;
  page?: number;
}): Promise<GithubJsonResult> {
  const params = new URLSearchParams({ per_page: String(args.perPage) });
  if (args.since) params.set("since", args.since);
  if (args.until) params.set("until", args.until);
  if (args.page) params.set("page", String(args.page));

  return await githubJson(
    `https://api.github.com/repos/${args.owner}/${args.name}/commits?${params.toString()}`,
  );
}

async function fetchCommitPages(args: {
  owner: string;
  name: string;
  since?: string;
  until?: string;
  perPage: number;
  maxPages: number;
}): Promise<
  GithubJsonResult & {
    commits: GithubCommitAuthor[];
    pagesFetched: number;
    reachedPageLimit: boolean;
  }
> {
  const commits: GithubCommitAuthor[] = [];
  let lastResult: GithubJsonResult | null = null;

  for (let page = 1; page <= args.maxPages; page += 1) {
    const result = await fetchCommits({ ...args, page });
    lastResult = result;

    if (!result.ok) {
      return {
        ...result,
        commits,
        pagesFetched: page,
        reachedPageLimit: false,
      };
    }

    const pageCommits = normalizeCommitResponse(result.data);
    commits.push(...pageCommits);

    if (pageCommits.length < args.perPage) {
      return {
        ...result,
        commits,
        pagesFetched: page,
        reachedPageLimit: false,
      };
    }
  }

  return {
    ...(lastResult ?? {
      ok: true,
      status: 200,
      data: [],
    }),
    commits,
    pagesFetched: args.maxPages,
    reachedPageLimit: true,
  };
}

export const runSubmissionVetting = action({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, { submissionId }) => {
    const submission = await ctx.runQuery(getSubmissionById, {
      id: submissionId,
    });
    if (!submission) throw new Error("Submission not found");

    const findings: FindingRow[] = [];
    const repos: RepoSnapshot[] = [];
    const contributors: ContributorRow[] = [];
    let githubRateLimitRemaining: number | undefined;

    try {
      await ctx.runMutation(updateSubmissionVettingStatus, {
        id: submissionId,
        vetted: "needs_review",
        vettingStatus: "running",
        lastVettedAt: Date.now(),
      });

      const event = getRuntimeVettingConfigForTenant(submission.tenant);
      const declaredEmails = uniqueNormalizedEmails(submission.invites);
      const declaredTeamCount = getDeclaredTeamCount(submission.invites);

      if (declaredTeamCount > event.teamSizeLimit) {
        findings.push(
          finding({
            code: "declared_team_size_exceeds_limit",
            message: "Declared team size exceeds the event limit.",
            evidence: {
              declaredTeamCount,
              declaredEmails,
              limit: event.teamSizeLimit,
            },
          }),
        );
      }

      for (const repoUrl of submission.github) {
        const parsed = parseGithubRepoUrl(repoUrl);
        if (!parsed) {
          findings.push(
            finding({
              code: "repo_invalid_url",
              message: "Submitted GitHub URL is not a repository URL.",
              repoUrl,
              evidence: { repoUrl },
            }),
          );
          continue;
        }

        const repoResult = await githubJson(
          `https://api.github.com/repos/${parsed.owner}/${parsed.name}`,
        );
        githubRateLimitRemaining =
          repoResult.rateLimitRemaining ?? githubRateLimitRemaining;

        if (isRateLimited(repoResult)) {
          findings.push(
            finding({
              code: "github_rate_limited",
              message: "GitHub API rate limit was reached during vetting.",
              repoUrl: parsed.canonicalUrl,
              evidence: {
                status: repoResult.status,
                resetAt: repoResult.rateLimitResetAt,
              },
            }),
          );

          const result = resultFromFindings(findings);
          await ctx.runMutation(updateSubmissionVettingStatus, {
            id: submissionId,
            vetted: result,
            vettingStatus: "failed",
            lastVettedAt: Date.now(),
          });
          return {
            success: false,
            result,
            error: "GitHub API rate limit reached",
            findings,
            repos,
            contributors,
            githubRateLimitRemaining,
          };
        }

        if (!repoResult.ok) {
          findings.push(
            finding({
              code: "repo_private_or_inaccessible",
              message: "Repository is private, deleted, or inaccessible.",
              repoUrl: parsed.canonicalUrl,
              evidence: { status: repoResult.status },
            }),
          );
          repos.push({
            repoUrl: parsed.canonicalUrl,
            owner: parsed.owner,
            name: parsed.name,
            accessible: false,
            fetchedAt: Date.now(),
          });
          continue;
        }

        const repo = normalizeRepoResponse(repoResult.data);
        const snapshot: RepoSnapshot = {
          repoUrl: parsed.canonicalUrl,
          owner: parsed.owner,
          name: parsed.name,
          visibility: repo.visibility,
          isPrivate: repo.private,
          isFork: repo.fork,
          isTemplate: repo.is_template,
          createdAt: toTimestamp(repo.created_at),
          pushedAt: toTimestamp(repo.pushed_at),
          defaultBranch: repo.default_branch,
          accessible: true,
          fetchedAt: Date.now(),
        };
        repos.push(snapshot);

        if (snapshot.isPrivate) {
          findings.push(
            finding({
              code: "repo_private_or_inaccessible",
              message: "Repository is private.",
              repoUrl: parsed.canonicalUrl,
              evidence: { visibility: snapshot.visibility },
            }),
          );
          continue;
        }

        if (snapshot.createdAt && snapshot.createdAt < event.startsAt) {
          findings.push(
            finding({
              code: "repo_created_before_event",
              message: "Repository was created before the event start time.",
              repoUrl: parsed.canonicalUrl,
              evidence: {
                createdAt: snapshot.createdAt,
                eventStartsAt: event.startsAt,
              },
            }),
          );
        }

        if (snapshot.isFork) {
          findings.push(
            finding({
              code: "repo_fork_detected",
              message: "Repository is marked as a fork.",
              repoUrl: parsed.canonicalUrl,
              evidence: { isFork: true },
            }),
          );
        }

        if (snapshot.isTemplate) {
          findings.push(
            finding({
              code: "repo_template_detected",
              message: "Repository is marked as a template.",
              repoUrl: parsed.canonicalUrl,
              evidence: { isTemplate: true },
            }),
          );
        }

        const graceUntil =
          event.submissionDeadlineAt +
          event.gitCommitGraceWindowMinutes * 60_000;
        const commitsResult = await fetchCommitPages({
          owner: parsed.owner,
          name: parsed.name,
          since: new Date(event.startsAt).toISOString(),
          until: new Date(graceUntil).toISOString(),
          perPage: 100,
          maxPages: 5,
        });
        githubRateLimitRemaining =
          commitsResult.rateLimitRemaining ?? githubRateLimitRemaining;

        if (isRateLimited(commitsResult)) {
          findings.push(
            finding({
              code: "github_rate_limited",
              message: "GitHub API rate limit was reached during commit fetch.",
              repoUrl: parsed.canonicalUrl,
              evidence: {
                status: commitsResult.status,
                resetAt: commitsResult.rateLimitResetAt,
              },
            }),
          );

          const result = resultFromFindings(findings);
          await ctx.runMutation(updateSubmissionVettingStatus, {
            id: submissionId,
            vetted: result,
            vettingStatus: "failed",
            lastVettedAt: Date.now(),
          });
          return {
            success: false,
            result,
            error: "GitHub API rate limit reached",
            findings,
            repos,
            contributors,
            githubRateLimitRemaining,
          };
        }

        if (!commitsResult.ok) {
          findings.push(
            finding({
              code: "github_api_error",
              message: "GitHub commit fetch failed.",
              repoUrl: parsed.canonicalUrl,
              evidence: { status: commitsResult.status },
            }),
          );
          continue;
        }

        if (commitsResult.reachedPageLimit) {
          findings.push(
            finding({
              code: "commit_scan_truncated",
              message: "Commit scan reached the v1 page limit.",
              repoUrl: parsed.canonicalUrl,
              evidence: {
                pagesFetched: commitsResult.pagesFetched,
                commitsFetched: commitsResult.commits.length,
                perPage: 100,
              },
            }),
          );
        }

        const preStartResult = await fetchCommits({
          owner: parsed.owner,
          name: parsed.name,
          until: new Date(event.startsAt - 1).toISOString(),
          perPage: 10,
        });
        if (preStartResult.ok) {
          const preStartCommits = normalizeCommitResponse(preStartResult.data);
          for (const commit of preStartCommits) {
            findings.push(
              finding({
                code: "commit_before_event",
                message: "Repository contains commits before the event start.",
                repoUrl: parsed.canonicalUrl,
                evidence: {
                  sha: commit.sha,
                  authorDate: commit.authorDate,
                  eventStartsAt: event.startsAt,
                },
              }),
            );
          }
        }

        const postGraceResult = await fetchCommits({
          owner: parsed.owner,
          name: parsed.name,
          since: new Date(graceUntil + 1).toISOString(),
          perPage: 10,
        });
        if (postGraceResult.ok) {
          const postGraceCommits = normalizeCommitResponse(
            postGraceResult.data,
          );
          for (const commit of postGraceCommits) {
            findings.push(
              finding({
                code: "commit_after_deadline_grace",
                message:
                  "Repository contains commits after the deadline grace window.",
                repoUrl: parsed.canonicalUrl,
                evidence: {
                  sha: commit.sha,
                  authorDate: commit.authorDate,
                  graceUntil,
                },
              }),
            );
          }
        }

        const commits = commitsResult.commits;
        if (commits.length === 0) {
          findings.push(
            finding({
              code: "repo_empty_or_no_event_commits",
              message: "Repository has no commits in the event window.",
              repoUrl: parsed.canonicalUrl,
              evidence: {
                eventStartsAt: event.startsAt,
                graceUntil,
              },
            }),
          );
          continue;
        }

        const extractedContributors = extractUniqueAuthors(commits);
        const mappedContributors: ContributorRow[] = [];

        if (extractedContributors.length > event.teamSizeLimit) {
          findings.push(
            finding({
              code: "git_contributor_count_exceeds_limit",
              message:
                "Git contributor count exceeds the event team size limit.",
              repoUrl: parsed.canonicalUrl,
              evidence: {
                contributorCount: extractedContributors.length,
                limit: event.teamSizeLimit,
              },
            }),
          );
        }

        for (const contributor of extractedContributors) {
          const mapped = mapContributorToSubmittedIdentity({
            contributor,
            declaredEmails,
          });
          const mappedContributor: ContributorRow = {
            ...contributor,
            repoUrl: parsed.canonicalUrl,
            mappedEmail: mapped?.mappedEmail,
            mappingSource: mapped?.mappingSource ?? "unmapped",
          };
          mappedContributors.push(mappedContributor);

          if (!mapped) {
            findings.push(
              finding({
                code: "unregistered_git_contributor",
                message:
                  "Git contributor could not be mapped to the submission.",
                repoUrl: parsed.canonicalUrl,
                evidence: {
                  githubUsername: contributor.githubUsername,
                  authorEmail: contributor.authorEmail,
                  commitCount: contributor.commitCount,
                },
              }),
            );
            continue;
          }
        }

        contributors.push(...mappedContributors);

        for (const mismatch of findAuthorCommitterMismatches(commits)) {
          findings.push({
            ...mismatch,
            repoUrl: parsed.canonicalUrl,
          });
        }
      }

      const result = resultFromFindings(findings);
      await ctx.runMutation(updateSubmissionVettingStatus, {
        id: submissionId,
        vetted: result,
        vettingStatus: "completed",
        lastVettedAt: Date.now(),
      });

      return {
        success: true,
        result,
        findings,
        repos,
        contributors,
        githubRateLimitRemaining,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown vetting failure";
      await ctx.runMutation(updateSubmissionVettingStatus, {
        id: submissionId,
        vetted: "needs_review",
        vettingStatus: "failed",
        lastVettedAt: Date.now(),
      });
      return { success: false, error: message, findings, repos, contributors };
    }
  },
});
