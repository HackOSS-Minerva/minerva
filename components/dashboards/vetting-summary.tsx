"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useSubmissions } from "@/hooks/use-submissions";
import type {
  FindingCode,
  FindingSeverity,
  SubmissionReviewStatus,
  SubmissionVettingResult,
  VettingContributor,
  VettingFinding,
  VettingStatus,
} from "@/lib/vetting/types";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitFork,
  Link2,
  RefreshCw,
  ShieldAlert,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

type DisplayFinding = {
  _id: string;
  repoUrl?: string;
  severity: FindingSeverity;
  code: FindingCode;
  message: string;
  count: number;
};

function formatDate(timestamp?: number) {
  if (!timestamp) return "Unknown";
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function contributorLabel(contributor: VettingContributor) {
  return (
    contributor.githubUsername ??
    contributor.authorEmail ??
    contributor.authorName ??
    "Unknown contributor"
  );
}

const repoFindingCodes = new Set<FindingCode>([
  "repo_missing",
  "repo_invalid_url",
  "repo_private_or_inaccessible",
  "repo_created_before_event",
  "repo_fork_detected",
  "repo_template_detected",
  "repo_empty_or_no_event_commits",
  "commit_scan_truncated",
  "commit_before_event",
  "commit_after_deadline_grace",
  "github_rate_limited",
  "github_api_error",
]);

const peopleFindingCodes = new Set<FindingCode>([
  "declared_team_size_exceeds_limit",
  "git_contributor_count_exceeds_limit",
  "unregistered_git_contributor",
  "author_committer_mismatch",
]);

const findingMeta: Record<
  FindingCode,
  { label: string; icon: React.ElementType }
> = {
  declared_team_size_exceeds_limit: {
    label: "Declared team size exceeds limit",
    icon: UsersRound,
  },
  repo_missing: { label: "GitHub repository missing", icon: Link2 },
  repo_invalid_url: { label: "Invalid GitHub URL", icon: Link2 },
  repo_private_or_inaccessible: {
    label: "Private or inaccessible repository",
    icon: ShieldAlert,
  },
  repo_created_before_event: {
    label: "Repository created before event",
    icon: Clock3,
  },
  repo_fork_detected: { label: "Repository is a fork", icon: GitFork },
  repo_template_detected: {
    label: "Repository is a template",
    icon: GitBranch,
  },
  repo_empty_or_no_event_commits: {
    label: "No event-window commits found",
    icon: GitCommit,
  },
  commit_scan_truncated: { label: "Commit scan truncated", icon: GitCommit },
  commit_before_event: { label: "Commit before event", icon: Clock3 },
  commit_after_deadline_grace: {
    label: "Commit after deadline grace window",
    icon: Clock3,
  },
  git_contributor_count_exceeds_limit: {
    label: "Git contributor count exceeds limit",
    icon: UsersRound,
  },
  unregistered_git_contributor: {
    label: "Unregistered Git contributor",
    icon: UserRound,
  },
  author_committer_mismatch: {
    label: "Author and committer mismatch",
    icon: GitCommit,
  },
  github_rate_limited: { label: "GitHub rate limit reached", icon: Clock3 },
  github_api_error: { label: "GitHub API error", icon: XCircle },
};

function severityClasses(severity: FindingSeverity) {
  if (severity === "review_required") {
    return {
      icon: "text-amber-600",
      row: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100",
    };
  }

  if (severity === "warning") {
    return {
      icon: "text-yellow-600",
      row: "border-yellow-200 bg-yellow-50 text-yellow-950 dark:border-yellow-900/70 dark:bg-yellow-950/20 dark:text-yellow-100",
    };
  }

  return {
    icon: "text-sky-600",
    row: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/70 dark:bg-sky-950/20 dark:text-sky-100",
  };
}

const severityRank: Record<FindingSeverity, number> = {
  info: 0,
  warning: 1,
  review_required: 2,
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function groupedFindingMessage(finding: VettingFinding, count: number): string {
  if (count === 1) return finding.message;

  switch (finding.code as FindingCode) {
    case "commit_before_event":
      return `${count} ${pluralize(count, "commit")} were authored before the event start time.`;
    case "commit_after_deadline_grace":
      return `${count} ${pluralize(count, "commit")} were authored after the deadline grace window.`;
    case "author_committer_mismatch":
      return `${count} ${pluralize(count, "commit")} had different author and committer identities.`;
    case "unregistered_git_contributor":
      return `${count} Git ${pluralize(count, "contributor")} could not be mapped to the submission.`;
    default:
      return `${count} related findings were recorded.`;
  }
}

function aggregateFindings(findings: VettingFinding[]): DisplayFinding[] {
  const groups = new Map<string, { finding: VettingFinding; count: number }>();

  for (const finding of findings) {
    const key = `${finding.repoUrl ?? "global"}:${finding.code}`;
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, { finding, count: 1 });
      continue;
    }

    existing.count += 1;
    if (
      severityRank[finding.severity] > severityRank[existing.finding.severity]
    ) {
      existing.finding = finding;
    }
  }

  return Array.from(groups.values()).map(({ finding, count }) => ({
    _id: `${finding.code}:${finding.repoUrl ?? "global"}`,
    repoUrl: finding.repoUrl,
    severity: finding.severity,
    code: finding.code,
    message: groupedFindingMessage(finding, count),
    count,
  }));
}

function IssueRow({ finding }: { finding: DisplayFinding }) {
  const code = finding.code as FindingCode;
  const meta = findingMeta[code] ?? {
    label: finding.code,
    icon: AlertTriangle,
  };
  const Icon = meta.icon;
  const classes = severityClasses(finding.severity);

  return (
    <div
      className={cn("flex gap-2 rounded-md border p-2.5 text-sm", classes.row)}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", classes.icon)} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 font-medium leading-5">
          <span>{meta.label}</span>
          {finding.count > 1 ? (
            <span className="rounded-full border border-current bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground shadow-sm">
              {finding.count}
            </span>
          ) : null}
        </div>
        <div className="text-xs leading-5 opacity-80">{finding.message}</div>
      </div>
    </div>
  );
}

function reviewStatusLabel(status: SubmissionReviewStatus) {
  switch (status) {
    case "verified":
      return "Verified";
    case "disqualified":
      return "Disqualified";
    default:
      return "Needs Review";
  }
}

function reviewStatusClasses(status: SubmissionReviewStatus) {
  if (status === "verified") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-300";
  }

  if (status === "disqualified") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/20 dark:text-red-300";
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300";
}

function VettingHeader({
  status,
  vettingStatus,
  isBusy,
  hasEvidence,
  error,
  onRun,
}: {
  status: SubmissionReviewStatus;
  vettingStatus: VettingStatus;
  isBusy: boolean;
  hasEvidence: boolean;
  error?: string;
  onRun: () => void;
}) {
  const StatusIcon =
    status === "verified"
      ? CheckCircle2
      : status === "disqualified"
        ? XCircle
        : ShieldAlert;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <StatusIcon
            className={cn(
              "h-4 w-4",
              status === "verified"
                ? "text-emerald-500"
                : status === "disqualified"
                  ? "text-red-500"
                  : "text-amber-500",
            )}
          />
          <h3 className="text-sm font-semibold">Project Vetting</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={reviewStatusClasses(status)}>
            {reviewStatusLabel(status)}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRun}
            disabled={isBusy}
          >
            <RefreshCw className={cn("h-4 w-4", isBusy && "animate-spin")} />
            {isBusy
              ? "Vetting..."
              : hasEvidence || vettingStatus === "completed"
                ? "Refresh"
                : "Run vetting"}
          </Button>
        </div>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function VettingSummary({
  submissionId,
  currentStatus,
  vettingStatus,
}: {
  submissionId: string;
  currentStatus: SubmissionReviewStatus;
  vettingStatus: VettingStatus;
}) {
  const { runVetting } = useSubmissions();
  const [result, setResult] = useState<SubmissionVettingResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runVettingAction = async () => {
    setIsRunning(true);
    try {
      const vettingResult = await runVetting(submissionId);
      setResult(vettingResult);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to run vetting",
      );
    } finally {
      setIsRunning(false);
    }
  };

  const categorizedFindings = useMemo(() => {
    const findings = result?.findings ?? [];
    const repoFindings = aggregateFindings(
      findings.filter((finding) =>
        repoFindingCodes.has(finding.code as FindingCode),
      ),
    );
    const peopleFindings = aggregateFindings(
      findings.filter((finding) =>
        peopleFindingCodes.has(finding.code as FindingCode),
      ),
    );
    const globalFindings = aggregateFindings(
      findings.filter(
        (finding) =>
          !repoFindingCodes.has(finding.code as FindingCode) &&
          !peopleFindingCodes.has(finding.code as FindingCode),
      ),
    );

    return { repoFindings, peopleFindings, globalFindings };
  }, [result?.findings]);

  const isBusy =
    isRunning || vettingStatus === "queued" || vettingStatus === "running";
  const reviewStatus = result?.storedVetted ?? currentStatus;

  if (!result) {
    return (
      <section className="grid gap-4 rounded-lg border border-border/70 p-4">
        <VettingHeader
          status={reviewStatus}
          vettingStatus={vettingStatus}
          isBusy={isBusy}
          hasEvidence={false}
          onRun={() => void runVettingAction()}
        />
        <p className="text-sm text-muted-foreground">
          {isBusy
            ? "Project vetting is in progress."
            : vettingStatus === "completed"
              ? "Refresh vetting to load current repository and contributor evidence."
              : "Run vetting to load repository and contributor evidence."}
        </p>
      </section>
    );
  }

  const { repos, contributors } = result;

  return (
    <section className="grid gap-4 rounded-lg border border-border/70 p-4">
      <VettingHeader
        status={reviewStatus}
        vettingStatus={vettingStatus}
        isBusy={isBusy}
        hasEvidence
        error={result.error}
        onRun={() => void runVettingAction()}
      />

      {categorizedFindings.globalFindings.length > 0 ? (
        <div className="grid gap-2">
          {categorizedFindings.globalFindings.map((finding) => (
            <IssueRow key={finding._id} finding={finding} />
          ))}
        </div>
      ) : null}

      <Separator />

      <div className="grid gap-3">
        <h4 className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <GitBranch className="h-4 w-4" />
          Repositories
        </h4>
        {repos.length > 0 ? (
          <div className="grid gap-2">
            {repos.map((repo, index) => {
              const repoFindings = categorizedFindings.repoFindings.filter(
                (finding) => finding.repoUrl === repo.repoUrl,
              );
              const createdBeforeEvent = repoFindings.some(
                (finding) => finding.code === "repo_created_before_event",
              );
              const hasLateCommit = repoFindings.some(
                (finding) => finding.code === "commit_after_deadline_grace",
              );

              return (
                <div
                  key={index}
                  className="grid gap-3 rounded-md border border-border/70 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <a
                      href={repo.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 items-center gap-1 break-all text-sm font-medium text-primary underline underline-offset-2"
                    >
                      {repo.owner}/{repo.name}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                    {repo.isPrivate ? (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300"
                      >
                        Private
                      </Badge>
                    ) : null}
                  </div>

                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border border-border/70 p-2 font-medium",
                        createdBeforeEvent &&
                          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-200",
                      )}
                    >
                      <Clock3 className="h-3.5 w-3.5" />
                      Created: {formatDate(repo.createdAt)}
                    </div>
                    <div
                      className={cn(
                        "rounded-md border border-border/70 p-2",
                        hasLateCommit &&
                          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-200",
                      )}
                    >
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock3 className="h-3.5 w-3.5" />
                        Last push: {formatDate(repo.pushedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No repository evidence was recorded.
          </div>
        )}
      </div>

      <Separator />

      <div className="grid gap-3">
        <h4 className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <GitCommit className="h-4 w-4" />
          People
        </h4>
        {categorizedFindings.peopleFindings.length > 0 ? (
          <div className="grid gap-2">
            {categorizedFindings.peopleFindings.map((finding) => (
              <IssueRow key={finding._id} finding={finding} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            No people-related issues found.
          </div>
        )}
        {contributors.length > 0 ? (
          <div className="grid gap-2">
            {contributors.map((contributor, index) => {
              return (
                <div
                  key={index}
                  className="grid gap-3 rounded-md border border-border/70 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        <span className="break-all">
                          {contributorLabel(contributor)}
                        </span>
                      </div>
                      <div className="mt-1 grid gap-0.5 text-xs text-muted-foreground">
                        <span>{contributor.commitCount} commits</span>
                        <span>
                          {formatDate(contributor.firstCommitAt)} -{" "}
                          {formatDate(contributor.lastCommitAt)}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        contributor.mappingSource === "unmapped"
                          ? "outline"
                          : "secondary"
                      }
                      className={cn(
                        "capitalize",
                        contributor.mappingSource === "unmapped" &&
                          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300",
                      )}
                    >
                      {contributor.mappingSource.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleDashed className="h-4 w-4" />
            No event-window Git contributors were found.
          </div>
        )}
      </div>
    </section>
  );
}
