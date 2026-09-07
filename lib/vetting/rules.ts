import type {
  AutomatedVettingResult,
  ExtractedContributor,
  GithubCommitAuthor,
  SubmissionReviewStatus,
  VettingEventConfig,
  VettingFinding,
} from "./types";

export const MAX_TEAM_SIZE = 4;
export const MAX_VETTING_BATCH_SIZE = 10;
export const DEFAULT_GIT_COMMIT_GRACE_WINDOW_MINUTES = 15;
export const MAX_GIT_COMMIT_GRACE_WINDOW_MINUTES = 1440;
export const TEAM_SIZE_ERROR =
  "Teams can include at most 4 people including the submitter.";

export function uniqueNormalizedEmails(emails: string[]): string[] {
  return Array.from(
    new Set(
      emails
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0),
    ),
  );
}

export function getSubmissionTeam(
  submitterEmail: string | undefined,
  invites: string[],
): {
  memberEmails: string[];
  normalizedInvites: string[];
  memberCount: number;
} {
  const normalizedSubmitter = submitterEmail?.trim().toLowerCase();
  const normalizedInvites = uniqueNormalizedEmails(invites).filter(
    (email) => email !== normalizedSubmitter,
  );
  const memberEmails = uniqueNormalizedEmails([
    ...(normalizedSubmitter ? [normalizedSubmitter] : []),
    ...normalizedInvites,
  ]);

  return {
    memberEmails,
    normalizedInvites,
    memberCount: normalizedInvites.length + 1,
  };
}

export function validateVettingEventConfig(event: VettingEventConfig): void {
  if (!Number.isFinite(event.startsAt)) {
    throw new Error("Event start time is invalid");
  }

  if (
    !Number.isFinite(event.submissionDeadlineAt) ||
    event.submissionDeadlineAt < event.startsAt
  ) {
    throw new Error("Submission deadline is invalid");
  }

  if (
    !Number.isInteger(event.gitCommitGraceWindowMinutes) ||
    event.gitCommitGraceWindowMinutes < 0 ||
    event.gitCommitGraceWindowMinutes > MAX_GIT_COMMIT_GRACE_WINDOW_MINUTES
  ) {
    throw new Error("Git commit grace window is invalid");
  }
}

export function resultFromFindings(
  findings: VettingFinding[],
): AutomatedVettingResult {
  return findings.length > 0 ? "needs_review" : "verified";
}

export function applyAutomatedReviewResult(
  current: SubmissionReviewStatus,
  automated?: AutomatedVettingResult,
): SubmissionReviewStatus {
  return current === "disqualified" ? current : (automated ?? current);
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
