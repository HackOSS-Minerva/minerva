"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconArrowsLeftRight,
  IconUsers,
  IconUser,
  IconClipboardList,
  IconSearch,
  IconRefresh,
  IconArrowsShuffle,
} from "@tabler/icons-react";
import { useParams } from "next/navigation";
import {
  useAssignments,
  generateAssignments,
  getJudgeName,
} from "@/hooks/use-assignments";
import type { ViewMode } from "@/hooks/use-assignments";

export default function AssignmentsContent() {
  const params = useParams<{ tenant: string }>();
  const tenant = params.tenant;

  const {
    submissions,
    judges,
    assignments,
    judgesById,
    submissionsById,
    teamsByJudge,
    judgesByTeam,
    isLoading,
    isSaving,
    hasAssignments,
    saveAssignments,
    clearAssignments,
  } = useAssignments(tenant);

  const [viewMode, setViewMode] = useState<ViewMode>("teams-by-judge");
  const [searchQuery, setSearchQuery] = useState("");

  const lowerQuery = searchQuery.toLowerCase();

  // Filter judges based on search
  const filteredJudges = judges.filter((judge) => {
    const name = getJudgeName(judge).toLowerCase();
    const teamNames =
      teamsByJudge
        .get(judge._id)
        ?.map((sid) => submissionsById.get(sid)?.teamName ?? "")
        .join(" ") ?? "";
    return (
      name.includes(lowerQuery) || teamNames.toLowerCase().includes(lowerQuery)
    );
  });

  // Filter submissions based on search
  const filteredSubmissions = submissions.filter((submission) => {
    const teamName = submission.teamName.toLowerCase();
    const projectName = submission.projectName.toLowerCase();
    const judgeNames =
      judgesByTeam
        .get(submission._id)
        ?.map((jid) => {
          const judge = judgesById.get(jid);
          return judge ? getJudgeName(judge).toLowerCase() : "";
        })
        .join(" ") ?? "";
    return (
      teamName.includes(lowerQuery) ||
      projectName.includes(lowerQuery) ||
      judgeNames.includes(lowerQuery)
    );
  });

  const handleAssign = async () => {
    if (judges.length === 0 || submissions.length === 0) return;
    const newAssignments = generateAssignments(judges, submissions);
    await saveAssignments(newAssignments);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleAssign}
            disabled={isSaving || judges.length === 0 || submissions.length === 0}
          >
            <IconArrowsShuffle className="mr-1 h-4 w-4" />
            {isSaving ? "Saving..." : "Assign"}
          </Button>
          {hasAssignments && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAssignments}
              disabled={isSaving}
            >
              <IconRefresh className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-48 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={viewMode === "teams-by-judge" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("teams-by-judge")}
            className="gap-1"
          >
            <IconUser className="h-4 w-4" />
            By Judge
          </Button>
          <Button
            variant={viewMode === "judges-by-team" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("judges-by-team")}
            className="gap-1"
          >
            <IconUsers className="h-4 w-4" />
            By Team
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setViewMode(
                viewMode === "teams-by-judge" ? "judges-by-team" : "teams-by-judge",
              );
            }}
          >
            <IconArrowsLeftRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      {hasAssignments && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            <strong>{judges.length}</strong> judges
          </span>
          <span>
            <strong>{submissions.length}</strong> submissions
          </span>
          <span>
            <strong>{assignments.length}</strong> assignments
          </span>
        </div>
      )}

      {/* Empty states */}
      {!hasAssignments && judges.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <IconUsers className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            No judges found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Register judges before creating assignments.
          </p>
        </div>
      )}

      {!hasAssignments && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <IconUsers className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            No submissions found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Teams must submit projects before creating assignments.
          </p>
        </div>
      )}

      {!hasAssignments && judges.length > 0 && submissions.length > 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <IconUsers className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            No assignments have been created
          </h3>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Click the Assign button above to generate judge assignments.
          </p>
        </div>
      )}

      {/* Content */}
      {hasAssignments && (
        <>
          {viewMode === "teams-by-judge" ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredJudges.map((judge) => {
                const teamIds = teamsByJudge.get(judge._id) ?? [];
                return (
                  <Card key={judge._id} className="p-3 gap-3">
                    <CardHeader className="p-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30">
                          <IconUser className="h-4 w-4 text-secondary-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="truncate text-sm">
                            {getJudgeName(judge)}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {teamIds.length} team{teamIds.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {teamIds.length === 0 ? (
                        <p className="py-2 text-xs text-muted-foreground italic">
                          No teams assigned
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {teamIds.map((submissionId) => {
                            const sub = submissionsById.get(submissionId);
                            if (!sub) return null;
                            return (
                              <li
                                key={submissionId}
                                className="flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs"
                              >
                                <IconClipboardList className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span className="truncate font-medium">
                                  {sub.teamName}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {filteredJudges.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-12 text-sm text-muted-foreground">
                  No judges match your search.
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredSubmissions.map((submission) => {
                const judgeIds = judgesByTeam.get(submission._id) ?? [];
                return (
                  <Card key={submission._id} className="overflow-hidden">
                    <CardHeader className="border-b bg-muted/30 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/30">
                          <IconUsers className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {submission.teamName}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {judgeIds.length} judge{judgeIds.length !== 1 ? "s" : ""} assigned
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                          <IconClipboardList className="mr-1 h-3 w-3" />
                          {submission.projectName}
                        </Badge>
                      </div>
                      {judgeIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No judges assigned
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {judgeIds.map((judgeId) => {
                            const judge = judgesById.get(judgeId);
                            if (!judge) return null;
                            return (
                              <li
                                key={judgeId}
                                className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                              >
                                <IconUser className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {getJudgeName(judge)}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {filteredSubmissions.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-12 text-sm text-muted-foreground">
                  No teams match your search.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
