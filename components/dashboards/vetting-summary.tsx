"use client";

import { useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  GitCommit,
  ShieldAlert,
  UserRound,
} from "lucide-react";

type SubmissionId = Id<"submissions">;

type VettingSummaryResult = {
  submission: Doc<"submissions">;
  latestRun: Doc<"repoVettingRuns"> | null;
  repos: Doc<"repoVettingRepos">[];
  contributors: Doc<"repoVettingContributors">[];
  findings: Doc<"repoVettingFindings">[];
};

type IdentityType = "github_user_id" | "github_username" | "author_email";
type FindingSeverity = "review_required" | "warning" | "info";

const getVettingSummary = makeFunctionReference<
  "query",
  { submissionId: SubmissionId },
  VettingSummaryResult | null
>("vetting:getSubmissionVettingSummary");

const createManualMapping = makeFunctionReference<
  "mutation",
  {
    tenant: string;
    submissionId: SubmissionId;
    identityType: IdentityType;
    identityValue: string;
    mappedEmail: string;
    note?: string;
  },
  { success: boolean; id: Id<"gitIdentityMappings">; created: boolean }
>("vetting:createManualMapping");

const queueSubmissionVetting = makeFunctionReference<
  "mutation",
  { id: SubmissionId },
  { success: boolean }
>("submissions:queueVetting");

const runSubmissionVetting = makeFunctionReference<
  "action",
  { submissionId: SubmissionId },
  { success: boolean; result?: "verified" | "needs_review"; error?: string }
>("vettingActions:runSubmissionVetting");

const severityLabels: Record<FindingSeverity, string> = {
  review_required: "Review required",
  warning: "Warning",
  info: "Info",
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

function parseEvidence(evidenceJson: string): string {
  try {
    return JSON.stringify(JSON.parse(evidenceJson), null, 2);
  } catch {
    return evidenceJson;
  }
}

function contributorLabel(contributor: Doc<"repoVettingContributors">) {
  return (
    contributor.githubUsername ??
    contributor.authorEmail ??
    contributor.authorName ??
    "Unknown contributor"
  );
}

function contributorIdentity(
  contributor: Doc<"repoVettingContributors">,
): { identityType: IdentityType; identityValue: string } | null {
  if (contributor.githubUserId) {
    return {
      identityType: "github_user_id",
      identityValue: contributor.githubUserId,
    };
  }

  if (contributor.githubUsername) {
    return {
      identityType: "github_username",
      identityValue: contributor.githubUsername.toLowerCase(),
    };
  }

  if (contributor.authorEmail) {
    return {
      identityType: "author_email",
      identityValue: contributor.authorEmail.toLowerCase(),
    };
  }

  return null;
}

export function VettingSummary({ submissionId }: { submissionId: string }) {
  const id = submissionId as SubmissionId;
  const summary = useQuery(getVettingSummary, { submissionId: id });
  const mapIdentity = useMutation(createManualMapping);
  const queueVetting = useMutation(queueSubmissionVetting);
  const runVetting = useAction(runSubmissionVetting);
  const [mappingValues, setMappingValues] = useState<Record<string, string>>(
    {},
  );
  const [mappingContributorId, setMappingContributorId] = useState<
    string | null
  >(null);

  const groupedFindings = useMemo(() => {
    const groups: Record<FindingSeverity, Doc<"repoVettingFindings">[]> = {
      review_required: [],
      warning: [],
      info: [],
    };

    for (const finding of summary?.findings ?? []) {
      groups[finding.severity].push(finding);
    }

    return groups;
  }, [summary?.findings]);

  const handleMapContributor = async (
    contributor: Doc<"repoVettingContributors">,
  ) => {
    if (!summary) return;

    const mappedEmail = mappingValues[contributor._id]?.trim().toLowerCase();
    if (!mappedEmail) {
      toast.error("Enter a registered email to map this contributor");
      return;
    }

    const identity = contributorIdentity(contributor);
    if (!identity) {
      toast.error("Contributor has no GitHub identity or author email to map");
      return;
    }

    setMappingContributorId(contributor._id);
    try {
      await mapIdentity({
        tenant: summary.submission.tenant,
        submissionId: id,
        identityType: identity.identityType,
        identityValue: identity.identityValue,
        mappedEmail,
        note: "Mapped during project vetting review",
      });
      await queueVetting({ id });
      const result = await runVetting({ submissionId: id });
      if (!result.success) {
        throw new Error(result.error ?? "Project vetting failed");
      }
      setMappingValues((current) => ({ ...current, [contributor._id]: "" }));
      toast.success("Mapped contributor and re-ran vetting");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to map contributor",
      );
    } finally {
      setMappingContributorId(null);
    }
  };

  if (summary === undefined) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading vetting evidence...
      </div>
    );
  }

  if (!summary || !summary.latestRun) {
    return (
      <div className="text-sm text-muted-foreground">
        No vetting run has been recorded for this submission.
      </div>
    );
  }

  const { latestRun, repos, contributors } = summary;

  return (
    <section className="grid gap-4 rounded-lg border border-border/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {latestRun.result === "verified" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          )}
          <div>
            <h3 className="text-sm font-semibold">Project vetting</h3>
            <p className="text-xs text-muted-foreground">
              Last run{" "}
              {formatDate(latestRun.completedAt ?? latestRun.startedAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{latestRun.status}</Badge>
          {latestRun.result ? (
            <Badge
              variant={
                latestRun.result === "verified" ? "secondary" : "destructive"
              }
            >
              {latestRun.result === "verified" ? "Verified" : "Needs review"}
            </Badge>
          ) : null}
        </div>
      </div>

      <Separator />

      <div className="grid gap-3">
        <h4 className="text-xs font-medium uppercase text-muted-foreground">
          Findings
        </h4>
        {(["review_required", "warning", "info"] as const).map((severity) => {
          const findings = groupedFindings[severity];
          if (findings.length === 0) return null;

          return (
            <div key={severity} className="grid gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {severityLabels[severity]} ({findings.length})
              </div>
              <div className="grid gap-2">
                {findings.map((finding) => (
                  <details
                    key={finding._id}
                    className="rounded-md border border-border/70 p-3 text-sm"
                  >
                    <summary className="cursor-pointer font-medium">
                      {finding.message}
                    </summary>
                    <div className="mt-2 grid gap-2 text-xs text-muted-foreground">
                      <div className="font-mono">{finding.code}</div>
                      {finding.repoUrl ? (
                        <a
                          href={finding.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2"
                        >
                          {finding.repoUrl}
                        </a>
                      ) : null}
                      <pre className="max-h-40 overflow-auto rounded-md bg-muted p-2">
                        {parseEvidence(finding.evidenceJson)}
                      </pre>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          );
        })}
        {summary.findings.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No findings were recorded.
          </div>
        ) : null}
      </div>

      <Separator />

      <div className="grid gap-3">
        <h4 className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
          <GitBranch className="h-4 w-4" />
          Repositories
        </h4>
        {repos.length > 0 ? (
          <div className="grid gap-2">
            {repos.map((repo) => (
              <div
                key={repo._id}
                className="grid gap-2 rounded-md border border-border/70 p-3"
              >
                <a
                  href={repo.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm font-medium text-primary underline underline-offset-2"
                >
                  {repo.owner}/{repo.name}
                </a>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {repo.accessible ? "Accessible" : "Inaccessible"}
                  </Badge>
                  <Badge variant="outline">
                    {repo.visibility ?? "Unknown"}
                  </Badge>
                  {repo.isPrivate ? (
                    <Badge variant="destructive">Private</Badge>
                  ) : null}
                  {repo.isFork ? <Badge variant="outline">Fork</Badge> : null}
                  {repo.isTemplate ? (
                    <Badge variant="outline">Template</Badge>
                  ) : null}
                </div>
                <div className="grid gap-1 text-xs text-muted-foreground">
                  <span>Created {formatDate(repo.createdAt)}</span>
                  <span>Pushed {formatDate(repo.pushedAt)}</span>
                  <span>Default branch {repo.defaultBranch ?? "Unknown"}</span>
                </div>
              </div>
            ))}
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
          Contributors
        </h4>
        {contributors.length > 0 ? (
          <div className="grid gap-2">
            {contributors.map((contributor) => {
              const isUnmapped = contributor.mappingSource === "unmapped";
              const isMapping = mappingContributorId === contributor._id;

              return (
                <div
                  key={contributor._id}
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
                      variant={isUnmapped ? "destructive" : "secondary"}
                      className="capitalize"
                    >
                      {contributor.mappingSource.replace("_", " ")}
                    </Badge>
                  </div>

                  {contributor.mappedEmail ? (
                    <div className="text-xs text-muted-foreground">
                      Mapped to {contributor.mappedEmail}
                    </div>
                  ) : null}

                  {isUnmapped ? (
                    <form
                      className="flex flex-col gap-2 sm:flex-row"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void handleMapContributor(contributor);
                      }}
                    >
                      <Input
                        value={mappingValues[contributor._id] ?? ""}
                        onChange={(event) =>
                          setMappingValues((current) => ({
                            ...current,
                            [contributor._id]: event.target.value,
                          }))
                        }
                        placeholder="registered email"
                        inputMode="email"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={isMapping}
                      >
                        {isMapping ? "Mapping..." : "Map"}
                      </Button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No contributor evidence was recorded.
          </div>
        )}
      </div>
    </section>
  );
}
