export type FindingSeverity = "info" | "warning" | "review_required";

export type VettingResult = "verified" | "needs_review";

export type MappingSource = "oauth" | "email" | "manual" | "unmapped";

export type FindingCode =
  | "submitter_missing_github_oauth"
  | "declared_team_size_exceeds_limit"
  | "repo_invalid_url"
  | "repo_private_or_inaccessible"
  | "repo_created_before_event"
  | "repo_fork_detected"
  | "repo_template_detected"
  | "repo_empty_or_no_event_commits"
  | "commit_scan_truncated"
  | "commit_before_event"
  | "commit_after_deadline_grace"
  | "git_contributor_count_exceeds_limit"
  | "unregistered_git_contributor"
  | "git_identity_used_on_multiple_submissions"
  | "author_committer_mismatch"
  | "github_rate_limited"
  | "github_api_error";

export interface VettingFindingInput {
  severity: FindingSeverity;
  code: FindingCode;
  message: string;
  repoUrl?: string;
  evidence: Record<string, unknown>;
}

export interface ParsedGithubRepo {
  owner: string;
  name: string;
  canonicalUrl: string;
}

export interface GithubRepoSnapshot {
  repoUrl: string;
  owner: string;
  name: string;
  visibility?: "public" | "private" | "internal";
  isPrivate?: boolean;
  isFork?: boolean;
  isTemplate?: boolean;
  createdAt?: number;
  pushedAt?: number;
  defaultBranch?: string;
  accessible: boolean;
  fetchedAt: number;
}

export interface GithubCommitAuthor {
  githubUserId?: string;
  githubUsername?: string;
  authorEmail?: string;
  authorName?: string;
  authorDate: number;
  committerEmail?: string;
  committerName?: string;
  committerDate?: number;
  sha: string;
}

export interface ExtractedContributor {
  githubUserId?: string;
  githubUsername?: string;
  authorEmail?: string;
  authorName?: string;
  commitCount: number;
  firstCommitAt: number;
  lastCommitAt: number;
  mappedEmail?: string;
  mappingSource: MappingSource;
}

export interface VettingEventConfig {
  tenant: string;
  name: string;
  startsAt: number;
  submissionDeadlineAt: number;
  teamSizeLimit: number;
  gitCommitGraceWindowMinutes: number;
  githubVettingEnabled: boolean;
}
