"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  ExternalLink,
  GitBranch,
  GitCommit,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSubmissionVetting } from "@/hooks/use-submissions";
import { cn } from "@/lib/utils";
import type {
  FindingCode,
  SubmissionReviewStatus,
  SubmissionVettingResult,
  VettingContributor,
  VettingFinding,
  VettingStatus,
} from "@/lib/vetting/types";
import { reviewStatusMeta } from "./vetting-status";

const peopleFindingMeta: Partial<
  Record<FindingCode, { label: string; icon: typeof UserRound }>
> = {
  declared_team_size_exceeds_limit: {
    label: "Declared team size exceeds limit",
    icon: UsersRound,
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
};

const unavailableRepositoryFindingCodes = new Set<FindingCode>([
  "repo_missing",
  "repo_invalid_url",
  "repo_private_or_inaccessible",
  "github_rate_limited",
  "github_api_error",
]);

export function repositoryEvidenceExplanation(
  findings: VettingFinding[],
): string | null {
  const messages = Array.from(
    new Set(
      findings
        .filter(({ code }) => unavailableRepositoryFindingCodes.has(code))
        .map(({ message }) => message),
    ),
  );

  return messages.length > 0
    ? `Repository evidence unavailable: ${messages.join(" ")}`
    : null;
}

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

export function VettingSummary({
  submissionId,
  currentStatus,
  vettingStatus,
}: {
  submissionId: string;
  currentStatus: SubmissionReviewStatus;
  vettingStatus: VettingStatus;
}) {
  const { runVetting } = useSubmissionVetting();
  const [result, setResult] = useState<SubmissionVettingResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runVettingAction = async () => {
    setIsRunning(true);
    try {
      setResult(await runVetting(submissionId));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to run vetting",
      );
    } finally {
      setIsRunning(false);
    }
  };

  const peopleFindings = useMemo(
    () =>
      (result?.findings ?? []).filter(
        (finding) => peopleFindingMeta[finding.code] !== undefined,
      ),
    [result?.findings],
  );
  const repositoryExplanation = useMemo(
    () => repositoryEvidenceExplanation(result?.findings ?? []),
    [result?.findings],
  );
  const isBusy =
    isRunning || vettingStatus === "queued" || vettingStatus === "running";
  const reviewStatus = result?.storedVetted ?? currentStatus;
  const status = reviewStatusMeta[reviewStatus];
  const StatusIcon = status.icon;

  return (
    <section className="grid gap-4 rounded-lg border border-border/70 p-4">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-4 w-4", status.iconClass)} />
            <h3 className="text-sm font-semibold">Project Vetting</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={status.badgeClass}>
              {status.label}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void runVettingAction()}
              disabled={isBusy}
            >
              <RefreshCw className={cn("h-4 w-4", isBusy && "animate-spin")} />
              {isBusy
                ? "Vetting..."
                : result || vettingStatus === "completed"
                  ? "Refresh"
                  : "Run vetting"}
            </Button>
          </div>
        </div>
        {repositoryExplanation ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {repositoryExplanation}
          </p>
        ) : result?.error ? (
          <p className="text-xs text-red-600">{result.error}</p>
        ) : null}
      </div>

      {!result ? (
        <p className="text-sm text-muted-foreground">
          {isBusy
            ? "Project vetting is in progress."
            : vettingStatus === "completed"
              ? "Refresh vetting to load current repository and contributor evidence."
              : "Run vetting to load repository and contributor evidence."}
        </p>
      ) : (
        <>
          <Separator />

          <div className="grid gap-3">
            <h4 className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              Repositories
            </h4>
            {result.repos.length > 0 ? (
              <div className="grid gap-2">
                {result.repos.map((repo) => {
                  const createdBeforeEvent = result.findings.some(
                    (finding) =>
                      finding.repoUrl === repo.repoUrl &&
                      finding.code === "repo_created_before_event",
                  );
                  const hasLateCommit = result.findings.some(
                    (finding) =>
                      finding.repoUrl === repo.repoUrl &&
                      finding.code === "commit_after_deadline_grace",
                  );

                  return (
                    <div
                      key={repo.repoUrl}
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
                          <Badge variant="outline" className="text-amber-700">
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
                            "flex items-center gap-1.5 rounded-md border border-border/70 p-2 font-medium",
                            hasLateCommit &&
                              "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-200",
                          )}
                        >
                          <Clock3 className="h-3.5 w-3.5" />
                          Last push: {formatDate(repo.pushedAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No repository evidence was recorded.
              </p>
            )}
          </div>

          <Separator />

          <div className="grid gap-3">
            <h4 className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
              <GitCommit className="h-4 w-4" />
              People
            </h4>
            {peopleFindings.length > 0 ? (
              <div className="grid gap-2">
                {peopleFindings.map((finding) => {
                  const meta = peopleFindingMeta[finding.code];
                  if (!meta) return null;
                  const FindingIcon = meta.icon;

                  return (
                    <div
                      key={finding.code}
                      className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100"
                    >
                      <FindingIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div className="min-w-0">
                        <p className="font-medium leading-5">{meta.label}</p>
                        <p className="text-xs leading-5 opacity-80">
                          {finding.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No people-related issues found.
              </div>
            )}

            {result.contributors.length > 0 ? (
              <div className="grid gap-2">
                {result.contributors.map((contributor) => (
                  <div
                    key={`${contributor.githubUserId ?? contributor.authorEmail ?? contributor.authorName}:${contributor.firstCommitAt}`}
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
                        {contributor.mappingSource}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CircleDashed className="h-4 w-4" />
                No event-window Git contributors were found.
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
