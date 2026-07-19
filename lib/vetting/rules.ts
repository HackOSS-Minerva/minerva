import type {
  ExtractedContributor,
  GithubCommitAuthor,
  VettingFindingInput,
  VettingResult,
} from "./types";

export function uniqueNormalizedEmails(emails: string[]): string[] {
  return Array.from(
    new Set(
      emails
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0),
    ),
  );
}

export function getDeclaredTeamCount(invites: string[]): number {
  return 1 + uniqueNormalizedEmails(invites).length;
}

export function createFinding(input: VettingFindingInput): VettingFindingInput {
  return input;
}

export function resultFromFindings(
  findings: VettingFindingInput[],
): VettingResult {
  return findings.some((finding) => finding.severity === "review_required")
    ? "needs_review"
    : "verified";
}

function contributorKey(commit: GithubCommitAuthor): string {
  if (commit.githubUserId) return `github:${commit.githubUserId}`;
  if (commit.githubUsername) {
    return `username:${commit.githubUsername.toLowerCase()}`;
  }
  if (commit.authorEmail) return `email:${commit.authorEmail.toLowerCase()}`;
  if (commit.authorName) return `name:${commit.authorName.toLowerCase()}`;
  return `unknown:${commit.sha}`;
}

export function extractUniqueAuthors(
  commits: GithubCommitAuthor[],
): ExtractedContributor[] {
  const contributors = new Map<string, ExtractedContributor>();

  for (const commit of commits) {
    const key = contributorKey(commit);
    const existing = contributors.get(key);

    if (!existing) {
      contributors.set(key, {
        githubUserId: commit.githubUserId,
        githubUsername: commit.githubUsername,
        authorEmail: commit.authorEmail?.toLowerCase(),
        authorName: commit.authorName,
        commitCount: 1,
        firstCommitAt: commit.authorDate,
        lastCommitAt: commit.authorDate,
        mappingSource: "unmapped",
      });
      continue;
    }

    existing.commitCount += 1;
    existing.firstCommitAt = Math.min(
      existing.firstCommitAt,
      commit.authorDate,
    );
    existing.lastCommitAt = Math.max(existing.lastCommitAt, commit.authorDate);
  }

  return Array.from(contributors.values()).sort(
    (a, b) => b.commitCount - a.commitCount,
  );
}
