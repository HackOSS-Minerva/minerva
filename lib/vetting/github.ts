import {
  extractUniqueAuthors,
  MAX_TEAM_SIZE,
  resultFromFindings,
  uniqueNormalizedEmails,
} from "./rules";
import type {
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
const COMMITS_PER_PAGE = 100;
const MAX_COMMIT_PAGES = 5;
const TIMELINE_SAMPLE_SIZE = 10;

type GithubJsonResult = {
  ok: boolean;
  status: number;
  rateLimitRemaining?: number;
  data: unknown;
};

type GithubCommitPagesResult = GithubJsonResult & {
  commits: GithubCommitAuthor[];
  reachedPageLimit: boolean;
};

export function parseGithubRepoUrl(rawUrl: string): ParsedGithubRepo | null {
  let url: URL;

  try {
    url = new URL(rawUrl.trim());
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

  const name = repo.endsWith(".git") ? repo.slice(0, -4) : repo;
  if (!name) return null;

  return {
    owner,
    name,
    canonicalUrl: `https://github.com/${owner}/${name}`,
  };
}

export function parseGithubRateLimit(headers: Headers): number | undefined {
  const value = headers.get("x-ratelimit-remaining");
  if (value === null) return undefined;

  const remaining = Number(value);
  return Number.isFinite(remaining) ? remaining : undefined;
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

  return {
    ok: response.ok,
    status: response.status,
    rateLimitRemaining: parseGithubRateLimit(response.headers),
    data: await response.json().catch(() => null),
  };
}

function isRateLimited(result: GithubJsonResult): boolean {
  return (
    result.status === 429 ||
    (result.status === 403 && result.rateLimitRemaining === 0)
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toTimestamp(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function normalizeRepo(data: unknown): {
  isPrivate?: boolean;
  createdAt?: number;
  pushedAt?: number;
} {
  if (!isObject(data)) return {};

  return {
    isPrivate: typeof data.private === "boolean" ? data.private : undefined,
    createdAt: toTimestamp(data.created_at),
    pushedAt: toTimestamp(data.pushed_at),
  };
}

function normalizeCommits(data: unknown): GithubCommitAuthor[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((entry, index): GithubCommitAuthor | null => {
      if (!isObject(entry)) return null;

      const commit = isObject(entry.commit) ? entry.commit : {};
      const author = isObject(commit.author) ? commit.author : {};
      const committer = isObject(commit.committer) ? commit.committer : {};
      const githubAuthor = isObject(entry.author) ? entry.author : {};
      const authorDate = toTimestamp(author.date);

      if (!authorDate) return null;

      return {
        sha:
          typeof entry.sha === "string" ? entry.sha : `unknown-commit-${index}`,
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
      };
    })
    .filter((commit): commit is GithubCommitAuthor => commit !== null);
}

function finding(
  code: FindingCode,
  message: string,
  repoUrl?: string,
): VettingFinding {
  return { code, message, repoUrl };
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
    `https://api.github.com/repos/${args.owner}/${args.name}/commits?${params}`,
  );
}

async function fetchCommitPages(args: {
  owner: string;
  name: string;
  since: string;
  until: string;
}): Promise<GithubCommitPagesResult> {
  const commits: GithubCommitAuthor[] = [];
  let lastResult: GithubJsonResult = { ok: true, status: 200, data: [] };

  for (let page = 1; page <= MAX_COMMIT_PAGES; page += 1) {
    const result = await fetchCommits({
      ...args,
      perPage: COMMITS_PER_PAGE,
      page,
    });
    lastResult = result;

    if (!result.ok) {
      return { ...result, commits, reachedPageLimit: false };
    }

    commits.push(...normalizeCommits(result.data));
    if (!Array.isArray(result.data) || result.data.length < COMMITS_PER_PAGE) {
      return { ...result, commits, reachedPageLimit: false };
    }
  }

  return { ...lastResult, commits, reachedPageLimit: true };
}

function failedResult(
  error: string,
  findings: VettingFinding[],
  repos: GithubRepoSnapshot[],
  contributors: VettingContributor[],
): GithubSubmissionVettingResult {
  return {
    success: false,
    result: "needs_review",
    error,
    findings,
    repos,
    contributors,
  };
}

function apiFailure(
  result: GithubJsonResult,
  repoUrl: string,
): { finding: VettingFinding; error: string } {
  if (isRateLimited(result)) {
    return {
      finding: finding(
        "github_rate_limited",
        "GitHub API rate limit was reached during vetting.",
        repoUrl,
      ),
      error: "GitHub API rate limit reached",
    };
  }

  return {
    finding: finding(
      "github_api_error",
      "GitHub could not complete repository vetting.",
      repoUrl,
    ),
    error: `GitHub API request failed with status ${result.status}`,
  };
}

function authorCommitterMismatchCount(commits: GithubCommitAuthor[]): number {
  return commits.filter((commit) => {
    if (!commit.authorEmail || !commit.committerEmail) return false;
    if (commit.committerEmail.includes("noreply.github.com")) return false;
    return commit.authorEmail !== commit.committerEmail;
  }).length;
}

export async function runSubmissionVetting(
  input: GithubSubmissionVettingInput,
): Promise<GithubSubmissionVettingResult> {
  const findings: VettingFinding[] = [];
  const repos: GithubRepoSnapshot[] = [];
  const contributors: VettingContributor[] = [];
  const projectCommits: GithubCommitAuthor[] = [];
  const declaredEmails = uniqueNormalizedEmails(input.declaredEmails);
  const graceUntil =
    input.event.submissionDeadlineAt +
    input.event.gitCommitGraceWindowMinutes * 60_000;

  if (input.declaredTeamCount > MAX_TEAM_SIZE) {
    findings.push(
      finding(
        "declared_team_size_exceeds_limit",
        `Declared team size exceeds the ${MAX_TEAM_SIZE}-person limit.`,
      ),
    );
  }

  if (input.repositoryUrls.length === 0) {
    findings.push(
      finding(
        "repo_missing",
        "Submission does not include a GitHub repository.",
      ),
    );
  }

  try {
    for (const submittedUrl of input.repositoryUrls) {
      const parsed = parseGithubRepoUrl(submittedUrl);

      if (!parsed) {
        findings.push(
          finding(
            "repo_invalid_url",
            "Submitted GitHub URL is not a repository URL.",
            submittedUrl,
          ),
        );
        continue;
      }

      const repoResult = await githubJson(
        `https://api.github.com/repos/${parsed.owner}/${parsed.name}`,
      );

      if (!repoResult.ok) {
        if (
          !isRateLimited(repoResult) &&
          (repoResult.status === 403 || repoResult.status === 404)
        ) {
          findings.push(
            finding(
              "repo_private_or_inaccessible",
              "Repository is private, deleted, or inaccessible.",
              parsed.canonicalUrl,
            ),
          );
          repos.push({
            repoUrl: parsed.canonicalUrl,
            owner: parsed.owner,
            name: parsed.name,
          });
          continue;
        }

        const failure = apiFailure(repoResult, parsed.canonicalUrl);
        findings.push(failure.finding);
        return failedResult(failure.error, findings, repos, contributors);
      }

      const repo = normalizeRepo(repoResult.data);
      repos.push({
        repoUrl: parsed.canonicalUrl,
        owner: parsed.owner,
        name: parsed.name,
        ...repo,
      });

      if (repo.isPrivate) {
        findings.push(
          finding(
            "repo_private_or_inaccessible",
            "Repository is private.",
            parsed.canonicalUrl,
          ),
        );
        continue;
      }

      if (repo.createdAt && repo.createdAt < input.event.startsAt) {
        findings.push(
          finding(
            "repo_created_before_event",
            "Repository was created before the event start time.",
            parsed.canonicalUrl,
          ),
        );
      }

      const eventCommitsResult = await fetchCommitPages({
        owner: parsed.owner,
        name: parsed.name,
        since: new Date(input.event.startsAt).toISOString(),
        until: new Date(graceUntil).toISOString(),
      });

      if (!eventCommitsResult.ok && eventCommitsResult.status !== 409) {
        const failure = apiFailure(eventCommitsResult, parsed.canonicalUrl);
        findings.push(failure.finding);
        return failedResult(failure.error, findings, repos, contributors);
      }

      const eventCommits =
        eventCommitsResult.status === 409 ? [] : eventCommitsResult.commits;
      projectCommits.push(...eventCommits);

      if (eventCommitsResult.reachedPageLimit) {
        findings.push(
          finding(
            "commit_scan_truncated",
            `Commit scan reached the ${MAX_COMMIT_PAGES * COMMITS_PER_PAGE}-commit limit.`,
            parsed.canonicalUrl,
          ),
        );
      }

      if (eventCommits.length === 0) {
        findings.push(
          finding(
            "repo_empty_or_no_event_commits",
            "No commits were found during the event window.",
            parsed.canonicalUrl,
          ),
        );
      }

      const beforeStart = await fetchCommits({
        owner: parsed.owner,
        name: parsed.name,
        until: new Date(input.event.startsAt - 1).toISOString(),
        perPage: TIMELINE_SAMPLE_SIZE,
      });

      if (!beforeStart.ok && beforeStart.status !== 409) {
        const failure = apiFailure(beforeStart, parsed.canonicalUrl);
        findings.push(failure.finding);
        return failedResult(failure.error, findings, repos, contributors);
      }

      const earlyCommitCount = normalizeCommits(beforeStart.data).length;
      if (earlyCommitCount > 0) {
        findings.push(
          finding(
            "commit_before_event",
            `${earlyCommitCount} commit${earlyCommitCount === 1 ? " was" : "s were"} authored before the event start time.`,
            parsed.canonicalUrl,
          ),
        );
      }

      const afterGrace = await fetchCommits({
        owner: parsed.owner,
        name: parsed.name,
        since: new Date(graceUntil + 1).toISOString(),
        perPage: TIMELINE_SAMPLE_SIZE,
      });

      if (!afterGrace.ok && afterGrace.status !== 409) {
        const failure = apiFailure(afterGrace, parsed.canonicalUrl);
        findings.push(failure.finding);
        return failedResult(failure.error, findings, repos, contributors);
      }

      const lateCommitCount = normalizeCommits(afterGrace.data).length;
      if (lateCommitCount > 0) {
        findings.push(
          finding(
            "commit_after_deadline_grace",
            `${lateCommitCount} commit${lateCommitCount === 1 ? " was" : "s were"} authored after the deadline grace window.`,
            parsed.canonicalUrl,
          ),
        );
      }
    }

    const extractedContributors = extractUniqueAuthors(projectCommits);
    if (extractedContributors.length > MAX_TEAM_SIZE) {
      findings.push(
        finding(
          "git_contributor_count_exceeds_limit",
          `Git contributor count exceeds the ${MAX_TEAM_SIZE}-person limit.`,
        ),
      );
    }

    const declaredEmailSet = new Set(declaredEmails);
    contributors.push(
      ...extractedContributors.map((contributor) => ({
        ...contributor,
        mappingSource:
          contributor.authorEmail &&
          declaredEmailSet.has(contributor.authorEmail)
            ? ("email" as const)
            : ("unmapped" as const),
      })),
    );

    const unmappedCount = contributors.filter(
      (contributor) => contributor.mappingSource === "unmapped",
    ).length;
    if (unmappedCount > 0) {
      findings.push(
        finding(
          "unregistered_git_contributor",
          `${unmappedCount} Git contributor${unmappedCount === 1 ? "" : "s"} could not be mapped to the submission.`,
        ),
      );
    }

    const mismatchCount = authorCommitterMismatchCount(projectCommits);
    if (mismatchCount > 0) {
      findings.push(
        finding(
          "author_committer_mismatch",
          `${mismatchCount} commit${mismatchCount === 1 ? " has" : "s have"} different author and committer identities.`,
        ),
      );
    }

    return {
      success: true,
      result: resultFromFindings(findings),
      findings,
      repos,
      contributors,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown GitHub API failure";
    findings.push(
      finding("github_api_error", "GitHub could not complete project vetting."),
    );
    return failedResult(message, findings, repos, contributors);
  }
}
