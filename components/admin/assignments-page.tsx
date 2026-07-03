"use client";

import { useState, useMemo } from "react";
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

interface Team {
  id: string;
  name: string;
  project: string;
}

interface Judge {
  id: string;
  name: string;
}

interface Assignment {
  judgeId: string;
  teamIds: string[];
}

const originalTeams: Team[] = [
  { id: "T1", name: "Byte Brawlers", project: "EcoRoute" },
  { id: "T2", name: "Circuit Sisters", project: "MediConnect" },
  { id: "T3", name: "Hack Heroes", project: "CampusEats" },
  { id: "T4", name: "Dev Dragons", project: "CodeCollab" },
  { id: "T5", name: "Pixel Pirates", project: "Artify" },
  { id: "T6", name: "Neural Knights", project: "BrainSync" },
];

const originalJudges: Judge[] = [
  { id: "J1", name: "Dr. Sarah Chen" },
  { id: "J2", name: "Prof. James Miller" },
  { id: "J3", name: "Ms. Emily Rodriguez" },
  { id: "J4", name: "Mr. David Kim" },
  { id: "J5", name: "Dr. Lisa Patel" },
];

const originalAssignments: Assignment[] = [
  { judgeId: "J1", teamIds: ["T1", "T3", "T5"] },
  { judgeId: "J2", teamIds: ["T1", "T2", "T4"] },
  { judgeId: "J3", teamIds: ["T2", "T3", "T6"] },
  { judgeId: "J4", teamIds: ["T4", "T5"] },
  { judgeId: "J5", teamIds: ["T1", "T6"] },
];

type ViewMode = "teams-by-judge" | "judges-by-team";

function assignmentsExist(assignments: Assignment[]): boolean {
  return assignments.some((a) => a.teamIds.length > 0);
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateRandomAssignments(): Assignment[] {
  // Give each judge a fair random subset of teams
  const allTeamIds = originalTeams.map((t) => t.id);
  return originalJudges.map((judge) => {
    const shuffled = shuffleArray(allTeamIds);
    // Each judge gets between 2 and 4 random teams
    const count = Math.floor(Math.random() * 3) + 2;
    return {
      judgeId: judge.id,
      teamIds: shuffled.slice(0, count),
    };
  });
}

function getTeamsForJudge(
  judgeId: string,
  assignments: Assignment[],
): Team[] {
  const assignment = assignments.find((a) => a.judgeId === judgeId);
  if (!assignment) return [];
  return originalTeams.filter((t) => assignment.teamIds.includes(t.id));
}

function getJudgesForTeam(
  teamId: string,
  assignments: Assignment[],
): Judge[] {
  return assignments
    .filter((a) => a.teamIds.includes(teamId))
    .map((a) => originalJudges.find((j) => j.id === a.judgeId)!)
    .filter(Boolean);
}

export default function AssignmentsContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("teams-by-judge");
  const [assignments, setAssignments] = useState<Assignment[]>(originalAssignments);
  const [searchQuery, setSearchQuery] = useState("");

  const hasAssignments = assignmentsExist(assignments);

  const lowerQuery = searchQuery.toLowerCase();

  const filteredJudges = useMemo(() => {
    if (!lowerQuery) return originalJudges;
    return originalJudges.filter((judge) =>
      judge.name.toLowerCase().includes(lowerQuery),
    );
  }, [lowerQuery]);

  const filteredTeams = useMemo(() => {
    if (!lowerQuery) return originalTeams;
    return originalTeams.filter(
      (team) =>
        team.name.toLowerCase().includes(lowerQuery) ||
        team.project.toLowerCase().includes(lowerQuery),
    );
  }, [lowerQuery]);

  const handleAssign = () => {
    setAssignments(generateRandomAssignments());
    setSearchQuery("");
  };

  const handleReset = () => {
    setAssignments([]);
    setSearchQuery("");
  };

  return (
    <div className="w-full space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Judge Assignments</h1>
          <p className="text-sm text-muted-foreground">
            {!hasAssignments
              ? "No judge assignments have been created yet."
              : viewMode === "teams-by-judge"
                ? "Viewing teams assigned to each judge"
                : "Viewing judges assigned to each team"}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          {hasAssignments ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setViewMode(
                  viewMode === "teams-by-judge" ? "judges-by-team" : "teams-by-judge",
                )
              }
              className="flex items-center gap-2"
            >
              <IconArrowsLeftRight className="h-4 w-4" />
              {viewMode === "teams-by-judge" ? "View by Team" : "View by Judge"}
            </Button>
          ) : null}
          {hasAssignments ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <IconRefresh className="h-4 w-4" />
              Reset
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleAssign}
              className="flex items-center gap-2"
            >
              <IconArrowsShuffle className="h-4 w-4" />
              Assign
            </Button>
          )}
        </div>
      </div>

      {hasAssignments && (
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              viewMode === "teams-by-judge"
                ? "Search judges by name..."
                : "Search teams by name or project..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {hasAssignments ? (
        viewMode === "teams-by-judge" ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredJudges.map((judge) => {
              const teams = getTeamsForJudge(judge.id, assignments);
              return (
                <Card key={judge.id} className="overflow-hidden">
                  <CardHeader className="border-b bg-muted/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <IconUser className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{judge.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {teams.length} team{teams.length !== 1 ? "s" : ""} assigned
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {teams.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No teams assigned
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {teams.map((team) => (
                          <li
                            key={team.id}
                            className="flex flex-col gap-2 rounded-lg border p-3 text-sm"
                          >
                            <Badge variant="secondary" className="text-xs w-fit">
                              {team.project}
                            </Badge>
                            <span className="flex items-center gap-2 font-medium">
                              <IconUsers className="h-4 w-4 text-muted-foreground" />
                              {team.name}
                            </span>
                          </li>
                        ))}
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
            {filteredTeams.map((team) => {
              const judges = getJudgesForTeam(team.id, assignments);
              return (
                <Card key={team.id} className="overflow-hidden">
                  <CardHeader className="border-b bg-muted/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/30">
                        <IconUsers className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{team.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {judges.length} judge{judges.length !== 1 ? "s" : ""} assigned
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs">
                        <IconClipboardList className="mr-1 h-3 w-3" />
                        {team.project}
                      </Badge>
                    </div>
                    {judges.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No judges assigned
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {judges.map((judge) => (
                          <li
                            key={judge.id}
                            className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                          >
                            <IconUser className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{judge.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {filteredTeams.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-12 text-sm text-muted-foreground">
                No teams match your search.
              </div>
            )}
          </div>
        )
      ) : (
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
    </div>
  );
}
