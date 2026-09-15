export type AutomatedVettingResult = "verified" | "needs_review";

export type SubmissionReviewStatus = AutomatedVettingResult | "disqualified";

export type VettingStatus =
  | "not_started"
  | "queued"
  | "running"
  | "completed"
  | "failed";

export type FindingCode =
  | "declared_team_size_exceeds_limit"
  | "repo_missing"
  | "repo_invalid_url"
  | "repo_private_or_inaccessible"
  | "repo_created_before_event"
  | "repo_empty_or_no_event_commits"
  | "commit_scan_truncated"
  | "commit_before_event"
  | "commit_after_deadline_grace"
  | "git_contributor_count_exceeds_limit"
  | "unregistered_git_contributor"
  | "author_committer_mismatch"
  | "github_rate_limited"
  | "github_api_error";

export interface VettingFinding {
  code: FindingCode;
  message: string;
  repoUrl?: string;
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
  isPrivate?: boolean;
  createdAt?: number;
  pushedAt?: number;
}

export interface GithubCommitAuthor {
  githubUserId?: string;
  githubUsername?: string;
  authorEmail?: string;
  authorName?: string;
  authorDate: number;
  committerEmail?: string;
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
}

export interface VettingContributor extends ExtractedContributor {
  mappingSource: "email" | "unmapped";
}

export interface VettingEventConfig {
  startsAt: number;
  submissionDeadlineAt: number;
  gitCommitGraceWindowMinutes: number;
}

export interface GithubSubmissionVettingInput {
  repositoryUrls: string[];
  declaredEmails: string[];
  declaredTeamCount: number;
  event: VettingEventConfig;
}

export interface GithubSubmissionVettingResult {
  success: boolean;
  result: AutomatedVettingResult;
  error?: string;
  findings: VettingFinding[];
  repos: GithubRepoSnapshot[];
  contributors: VettingContributor[];
}

export interface SubmissionVettingResult extends GithubSubmissionVettingResult {
  storedVetted: SubmissionReviewStatus;
}

export interface VettingBatchResult {
  submissionId: string;
  success: boolean;
  error?: string;
}
