import {
  createFinding,
  extractUniqueAuthors,
  getDeclaredTeamCount,
  resultFromFindings,
  uniqueNormalizedEmails,
} from "./rules";
import type {
  ExtractedContributor,
  FindingCode,
  GithubCommitAuthor,
  GithubRepoSnapshot,
  GithubSubmissionVettingInput,
  GithubSubmissionVettingResult,
  ParsedGithubRepo,
  VettingContributor,
  VettingFinding,
} from "./types";

const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);
const TEAM_SIZE_LIMIT = 4;
const COMMITS_PER_PAGE = 100;
const MAX_COMMIT_PAGES = 5;
const TIMELINE_EVIDENCE_LIMIT = 10;

type GithubJsonResult = {
  ok: boolean;
  status: number;
  rateLimitRemaining?: number;
  rateLimitResetAt?: number;
  data: unknown;
};

type GithubRepoResponse = {
  private?: boolean;
  fork?: boolean;
  isTemplate?: boolean;
  createdAt?: number;
  pushedAt?: number;
};

type GithubCommitPagesResult = GithubJsonResult & {
  commits: GithubCommitAuthor[];
  pagesFetched: number;
  reachedPageLimit: boolean;
};

export function parseGithubRepoUrl(rawUrl: string): ParsedGithubRepo | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (!GITHUB_HOSTS.has(url.hostname.toLowerCase())) return null;

  const [owner, repo, ...rest] = url.pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.trim());

  if (!owner || !repo) return null;
  if (rest.length > 0 && rest[0] !== "tree" && rest[0] !== "blob") {
    return null;
  }

  const cleanRepo = repo.endsWith(".git") ? repo.slice(0, -4) : repo;
  if (!cleanRepo) return null;

  return {
    owner,
    name: cleanRepo,
    canonicalUrl: `https://github.com/${owner}/${cleanRepo}`,
  };
}

export function parseGithubRateLimit(headers: Headers): {
  remaining?: number;
  resetAt?: number;
} {
  const remainingRaw = headers.get("x-ratelimit-remaining");
  const resetRaw = headers.get("x-ratelimit-reset");
  const remaining = remainingRaw === null ? undefined : Number(remainingRaw);
  const resetSeconds = resetRaw === null ? undefined : Number(resetRaw);

  return {
    remaining: Number.isFinite(remaining) ? remaining : undefined,
    resetAt:
      typeof resetSeconds === "number" && Number.isFinite(resetSeconds)
        ? resetSeconds * 1000
        : undefined,
  };
}

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
  const rateLimit = parseGithubRateLimit(response.headers);
  const data = await response.json().catch(() => null);

  return {
    ok: response.ok,
    status: response.status,
    rateLimitRemaining: rateLimit.remaining,
    rateLimitResetAt: rateLimit.resetAt,
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
    fork: typeof data.fork === "boolean" ? data.fork : undefined,
    isTemplate:
      typeof data.is_template === "boolean" ? data.is_template : undefined,
    createdAt:
      typeof data.created_at === "string"
        ? toTimestamp(data.created_at)
        : undefined,
    pushedAt:
      typeof data.pushed_at === "string"
        ? toTimestamp(data.pushed_at)
        : undefined,
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
          typeof author.email === "string"
            ? author.email.toLowerCase()
            : undefined,
        authorName: typeof author.name === "string" ? author.name : undefined,
        authorDate,
        committerEmail:
          typeof committer.email === "string"
            ? committer.email.toLowerCase()
            : undefined,
        committerName:
          typeof committer.name === "string" ? committer.name : undefined,
        committerDate:
          typeof committer.date === "string"
            ? toTimestamp(committer.date)
            : undefined,
      };
    })
    .filter((commit): commit is GithubCommitAuthor => commit !== null);
}

function finding(input: {
  code: FindingCode;
  message: string;
  repoUrl?: string;
  evidence: Record<string, unknown>;
  severity?: VettingFinding["severity"];
}): VettingFinding {
  return createFinding({
    severity: input.severity ?? "review_required",
    code: input.code,
    message: input.message,
    repoUrl: input.repoUrl,
    evidence: input.evidence,
  });
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
}): Promise<GithubCommitPagesResult> {
  const commits: GithubCommitAuthor[] = [];
  let lastResult: GithubJsonResult | null = null;

  for (let page = 1; page <= MAX_COMMIT_PAGES; page += 1) {
    const result = await fetchCommits({
      ...args,
      perPage: COMMITS_PER_PAGE,
      page,
    });
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

    if (pageCommits.length < COMMITS_PER_PAGE) {
      return {
        ...result,
        commits,
        pagesFetched: page,
        reachedPageLimit: false,
      };
    }
  }

  return {
    ...(lastResult ?? { ok: true, status: 200, data: [] }),
    commits,
    pagesFetched: MAX_COMMIT_PAGES,
    reachedPageLimit: true,
  };
}

function mapContributor(
  contributor: ExtractedContributor,
  declaredEmails: string[],
): { mappedEmail: string; mappingSource: "email" } | null {
  if (
    contributor.authorEmail &&
    declaredEmails.includes(contributor.authorEmail.toLowerCase())
  ) {
    return {
      mappedEmail: contributor.authorEmail,
      mappingSource: "email",
    };
  }

  return null;
}

function findAuthorCommitterMismatches(
  commits: GithubCommitAuthor[],
): VettingFinding[] {
  return commits
    .filter((commit) => {
      if (!commit.authorEmail || !commit.committerEmail) return false;
      if (commit.committerEmail.includes("noreply.github.com")) return false;
      return commit.authorEmail !== commit.committerEmail;
    })
    .slice(0, TIMELINE_EVIDENCE_LIMIT)
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

function failedResult(args: {
  error: string;
  findings: VettingFinding[];
  repos: GithubRepoSnapshot[];
  contributors: VettingContributor[];
  githubRateLimitRemaining?: number;
}): GithubSubmissionVettingResult {
  return {
    success: false,
    result: "needs_review",
    error: args.error,
    findings: args.findings,
    repos: args.repos,
    contributors: args.contributors,
    githubRateLimitRemaining: args.githubRateLimitRemaining,
  };
}

export async function runSubmissionVetting(
  input: GithubSubmissionVettingInput,
): Promise<GithubSubmissionVettingResult> {
  const findings: VettingFinding[] = [];
  const repos: GithubRepoSnapshot[] = [];
  const contributors: VettingContributor[] = [];
  const declaredEmails = uniqueNormalizedEmails(input.declaredEmails);
  const declaredTeamCount = getDeclaredTeamCount(input.declaredEmails);
  const graceUntil =
    input.event.submissionDeadlineAt +
    input.event.gitCommitGraceWindowMinutes * 60_000;
  let githubRateLimitRemaining: number | undefined;

  if (declaredTeamCount > TEAM_SIZE_LIMIT) {
    findings.push(
      finding({
        code: "declared_team_size_exceeds_limit",
        message: "Declared team size exceeds the event limit.",
        evidence: {
          declaredTeamCount,
          declaredEmails,
          limit: TEAM_SIZE_LIMIT,
        },
      }),
    );
  }

  if (input.repositoryUrls.length === 0) {
    findings.push(
      finding({
        code: "repo_missing",
        message: "Submission does not include a GitHub repository.",
        evidence: {},
      }),
    );
  }

  try {
    for (const repoUrl of input.repositoryUrls) {
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

        return failedResult({
          error: "GitHub API rate limit reached",
          findings,
          repos,
          contributors,
          githubRateLimitRemaining,
        });
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
        });
        continue;
      }

      const repo = normalizeRepoResponse(repoResult.data);
      const snapshot: GithubRepoSnapshot = {
        repoUrl: parsed.canonicalUrl,
        owner: parsed.owner,
        name: parsed.name,
        isPrivate: repo.private,
        isFork: repo.fork,
        isTemplate: repo.isTemplate,
        createdAt: repo.createdAt,
        pushedAt: repo.pushedAt,
        accessible: true,
      };
      repos.push(snapshot);

      if (snapshot.isPrivate) {
        findings.push(
          finding({
            code: "repo_private_or_inaccessible",
            message: "Repository is private.",
            repoUrl: parsed.canonicalUrl,
            evidence: { isPrivate: true },
          }),
        );
        continue;
      }

      if (snapshot.createdAt && snapshot.createdAt < input.event.startsAt) {
        findings.push(
          finding({
            code: "repo_created_before_event",
            message: "Repository was created before the event start time.",
            repoUrl: parsed.canonicalUrl,
            evidence: {
              createdAt: snapshot.createdAt,
              eventStartsAt: input.event.startsAt,
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

      const commitsResult = await fetchCommitPages({
        owner: parsed.owner,
        name: parsed.name,
        since: new Date(input.event.startsAt).toISOString(),
        until: new Date(graceUntil).toISOString(),
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

        return failedResult({
          error: "GitHub API rate limit reached",
          findings,
          repos,
          contributors,
          githubRateLimitRemaining,
        });
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
            message: "Commit scan reached the configured page limit.",
            repoUrl: parsed.canonicalUrl,
            evidence: {
              pagesFetched: commitsResult.pagesFetched,
              commitsFetched: commitsResult.commits.length,
              commitsPerPage: COMMITS_PER_PAGE,
            },
          }),
        );
      }

      const preStartResult = await fetchCommits({
        owner: parsed.owner,
        name: parsed.name,
        until: new Date(input.event.startsAt - 1).toISOString(),
        perPage: TIMELINE_EVIDENCE_LIMIT,
      });

      if (preStartResult.ok) {
        for (const commit of normalizeCommitResponse(preStartResult.data)) {
          findings.push(
            finding({
              code: "commit_before_event",
              message: "Repository contains commits before the event start.",
              repoUrl: parsed.canonicalUrl,
              evidence: {
                sha: commit.sha,
                authorDate: commit.authorDate,
                eventStartsAt: input.event.startsAt,
              },
            }),
          );
        }
      }

      const postGraceResult = await fetchCommits({
        owner: parsed.owner,
        name: parsed.name,
        since: new Date(graceUntil + 1).toISOString(),
        perPage: TIMELINE_EVIDENCE_LIMIT,
      });

      if (postGraceResult.ok) {
        for (const commit of normalizeCommitResponse(postGraceResult.data)) {
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
              eventStartsAt: input.event.startsAt,
              graceUntil,
            },
          }),
        );
        continue;
      }

      const extractedContributors = extractUniqueAuthors(commits);
      if (extractedContributors.length > TEAM_SIZE_LIMIT) {
        findings.push(
          finding({
            code: "git_contributor_count_exceeds_limit",
            message: "Git contributor count exceeds the event team size limit.",
            repoUrl: parsed.canonicalUrl,
            evidence: {
              contributorCount: extractedContributors.length,
              limit: TEAM_SIZE_LIMIT,
            },
          }),
        );
      }

      for (const contributor of extractedContributors) {
        const mapped = mapContributor(contributor, declaredEmails);
        contributors.push({
          ...contributor,
          repoUrl: parsed.canonicalUrl,
          mappedEmail: mapped?.mappedEmail,
          mappingSource: mapped?.mappingSource ?? "unmapped",
        });

        if (!mapped) {
          findings.push(
            finding({
              code: "unregistered_git_contributor",
              message: "Git contributor could not be mapped to the submission.",
              repoUrl: parsed.canonicalUrl,
              evidence: {
                githubUsername: contributor.githubUsername,
                authorEmail: contributor.authorEmail,
                commitCount: contributor.commitCount,
              },
            }),
          );
        }
      }

      for (const mismatch of findAuthorCommitterMismatches(commits)) {
        findings.push({
          ...mismatch,
          repoUrl: parsed.canonicalUrl,
        });
      }
    }

    return {
      success: true,
      result: resultFromFindings(findings),
      findings,
      repos,
      contributors,
      githubRateLimitRemaining,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown GitHub API failure";
    findings.push(
      finding({
        code: "github_api_error",
        message: "GitHub API request failed.",
        evidence: { message },
      }),
    );

    return failedResult({
      error: message,
      findings,
      repos,
      contributors,
      githubRateLimitRemaining,
    });
  }
}
