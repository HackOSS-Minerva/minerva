"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
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
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

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

  const handleConfirmClear = async () => {
    await clearAssignments();
    setClearDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleAssign}
            disabled={
              isSaving || judges.length === 0 || submissions.length === 0
            }
          >
            <IconArrowsShuffle className="mr-1 h-4 w-4" />
            {isSaving ? "Saving..." : "Assign"}
          </Button>
          {hasAssignments && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearDialogOpen(true)}
              disabled={isSaving}
            >
              <IconRefresh className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="relative min-w-40 flex-1">
          <IconSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={viewMode}
          onValueChange={(value) => {
            if (value) setViewMode(value as ViewMode);
          }}
          className="shrink-0"
          aria-label="Change view"
        >
          <ToggleGroupItem value="teams-by-judge" aria-label="View by judge">
            <IconUser className="h-4 w-4" />
            By Judge
          </ToggleGroupItem>
          <ToggleGroupItem value="judges-by-team" aria-label="View by team">
            <IconUsers className="h-4 w-4" />
            By Team
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Summary stats — always visible */}
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

      {/* Empty states */}
      {judges.length === 0 && (
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

      {judges.length > 0 && submissions.length === 0 && (
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
        <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          No assignments have been created yet. Click the Assign button above to
          generate judge assignments.
        </div>
      )}

      {/* Content — visible as soon as judges + submissions exist */}
      {judges.length > 0 && submissions.length > 0 && (
        <>
          {viewMode === "teams-by-judge" ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredJudges.map((judge) => {
                const teamIds = teamsByJudge.get(judge._id) ?? [];
                return (
                  <Card key={judge._id} className="gap-0 overflow-hidden py-0">
                    <CardHeader className="border-b bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/30 pr-2">
                          <IconUser className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="truncate text-[15px]">
                            {getJudgeName(judge)}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {teamIds.length} team
                            {teamIds.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                      {teamIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No teams assigned
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {teamIds.map((submissionId) => {
                            const sub = submissionsById.get(submissionId);
                            if (!sub) return null;
                            return (
                              <li
                                key={submissionId}
                                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                              >
                                <IconClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
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
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredSubmissions.map((submission) => {
                const judgeIds = judgesByTeam.get(submission._id) ?? [];
                return (
                  <Card
                    key={submission._id}
                    className="gap-0 overflow-hidden py-0"
                  >
                    <CardHeader className="border-b bg-muted/30 px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/30 pr-2">
                          <IconUsers className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="truncate text-[15px]">
                            {submission.teamName}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {judgeIds.length} judge
                            {judgeIds.length !== 1 ? "s" : ""} assigned
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                      {judgeIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          No judges assigned
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {judgeIds.map((judgeId) => {
                            const judge = judgesById.get(judgeId);
                            if (!judge) return null;
                            return (
                              <li
                                key={judgeId}
                                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                              >
                                <IconUser className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="truncate font-medium">
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

      {/* Clear confirmation */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all assignments?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {assignments.length} assignment
              {assignments.length !== 1 ? "s" : ""}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmClear}
              disabled={isSaving}
            >
              {isSaving ? "Clearing..." : "Clear assignments"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
