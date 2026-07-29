"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ── Public types ──────────────────────────────────────────────────────────────

export interface JudgeDisplay {
  _id: Id<"judges">;
  firstname: string;
  lastname: string;
  email: string;
}

export interface SubmissionDisplay {
  _id: Id<"submissions">;
  teamName: string;
  projectName: string;
}

export interface AssignmentData {
  judgeId: Id<"judges">;
  submissionId: Id<"submissions">;
  room?: string;
  status?: "assigned" | "completed" | "no_show";
}

export interface EnrichedAssignment {
  id: Id<"assignments">;
  projectName: string;
  teamName: string;
  room?: string;
  status?: string;
  judgeName: string;
}

export type ViewMode = "teams-by-judge" | "judges-by-team";

// ── Pure utility functions (no hooks) ─────────────────────────────────────────

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateAssignments(
  judges: JudgeDisplay[],
  submissions: SubmissionDisplay[],
): AssignmentData[] {
  if (judges.length === 0 || submissions.length === 0) return [];

  const shuffledTeams = shuffleArray(submissions);
  const assignments: AssignmentData[] = [];

  // Distribute teams evenly among judges (round-robin)
  shuffledTeams.forEach((submission, index) => {
    const judge = judges[index % judges.length];
    assignments.push({
      judgeId: judge._id,
      submissionId: submission._id,
      status: "assigned",
    });
  });

  return assignments;
}

export function getJudgeName(judge: JudgeDisplay): string {
  return `${judge.firstname} ${judge.lastname}`.trim();
}

export function getStatusBadgeVariant(
  status?: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "assigned":
      return "secondary";
    case "completed":
      return "default";
    case "no_show":
      return "destructive";
    default:
      return "outline";
  }
}

export function formatStatus(status?: string): string {
  if (!status) return "Assigned";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ── React hook ────────────────────────────────────────────────────────────────

export function useAssignments(tenant: string) {
  // ── Queries ────────────────────────────────────────────────────────────
  const rawSubmissions = useQuery(api.submissions.get, { tenant });
  const rawJudges = useQuery(api.judges.get, { tenant });
  const rawAssignments = useQuery(api.assignments.getByTenant, { tenant });
  const setAssignmentsMut = useMutation(api.assignments.setAssignments);

  const [isSaving, setIsSaving] = useState(false);

  // ── Memoised transforms ────────────────────────────────────────────────
  const submissions: SubmissionDisplay[] = useMemo(
    () =>
      (rawSubmissions ?? []).map((s: any) => ({
        _id: s._id as Id<"submissions">,
        teamName: s.teamName,
        projectName: s.projectName,
      })),
    [rawSubmissions],
  );

  const judges: JudgeDisplay[] = useMemo(
    () =>
      (rawJudges ?? []).map((j: any) => ({
        _id: j._id as Id<"judges">,
        firstname: j.firstname,
        lastname: j.lastname,
        email: j.email,
      })),
    [rawJudges],
  );

  const assignments: AssignmentData[] = useMemo(
    () =>
      (rawAssignments ?? []).map((a: any) => ({
        judgeId: a.judgeId as Id<"judges">,
        submissionId: a.submissionId as Id<"submissions">,
        room: a.room,
        status: a.status as "assigned" | "completed" | "no_show" | undefined,
      })),
    [rawAssignments],
  );

  // Lookup maps
  const judgesById = useMemo(
    () => new Map(judges.map((j) => [j._id, j])),
    [judges],
  );

  const submissionsById = useMemo(
    () => new Map(submissions.map((s) => [s._id, s])),
    [submissions],
  );

  // Groupings
  const teamsByJudge = useMemo(() => {
    const map = new Map<Id<"judges">, Id<"submissions">[]>();
    for (const a of assignments) {
      const existing = map.get(a.judgeId) ?? [];
      existing.push(a.submissionId);
      map.set(a.judgeId, existing);
    }
    return map;
  }, [assignments]);

  const judgesByTeam = useMemo(() => {
    const map = new Map<Id<"submissions">, Id<"judges">[]>();
    for (const a of assignments) {
      const existing = map.get(a.submissionId) ?? [];
      existing.push(a.judgeId);
      map.set(a.submissionId, existing);
    }
    return map;
  }, [assignments]);

  // Enriched assignments (for judge page)
  const enrichedAssignments: EnrichedAssignment[] = useMemo(() => {
    if (!rawAssignments || !rawSubmissions || !rawJudges) return [];

    return (rawAssignments as any[]).map((a) => {
      const sub = submissionsById.get(a.submissionId as Id<"submissions">);
      const judge = judgesById.get(a.judgeId as Id<"judges">);
      const judgeName = judge ? getJudgeName(judge) : "Unknown Judge";

      return {
        id: a._id as Id<"assignments">,
        projectName: sub?.projectName ?? "Unknown Project",
        teamName: sub?.teamName ?? "Unknown Team",
        room: a.room,
        status: a.status ?? "assigned",
        judgeName,
      };
    });
  }, [rawAssignments, rawSubmissions, rawJudges, submissionsById, judgesById]);

  const isLoading =
    rawSubmissions === undefined ||
    rawJudges === undefined ||
    rawAssignments === undefined;

  const hasAssignments = assignments.length > 0;

  // ── Mutations ──────────────────────────────────────────────────────────
  const saveAssignments = useCallback(
    async (newAssignments: AssignmentData[]) => {
      setIsSaving(true);
      try {
        await setAssignmentsMut({
          tenant,
          assignments: newAssignments,
        });
      } finally {
        setIsSaving(false);
      }
    },
    [tenant, setAssignmentsMut],
  );

  const clearAssignments = useCallback(async () => {
    await saveAssignments([]);
  }, [saveAssignments]);

  // ── Return ─────────────────────────────────────────────────────────────
  return {
    submissions,
    judges,
    assignments,
    judgesById,
    submissionsById,
    teamsByJudge,
    judgesByTeam,
    enrichedAssignments,
    isLoading,
    isSaving,
    hasAssignments,
    saveAssignments,
    clearAssignments,
  };
}
