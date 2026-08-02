"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconMapPin,
  IconUsers,
  IconClipboardList,
  IconBuilding,
} from "@tabler/icons-react";
import {
  useAssignments,
  getStatusBadgeVariant,
  formatStatus,
} from "@/hooks/use-assignments";
import { FormLockModal } from "@/components/forms/form-lock-modal";

interface AssignmentsPageProps {
  tenant: string;
}

export function AssignmentsPage({ tenant }: AssignmentsPageProps) {
  const { enrichedAssignments, isLoading } = useAssignments(tenant);

  if (isLoading) {
    return (
      <>
        <FormLockModal form="judge-assignments" />
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </>
    );
  }

  if (enrichedAssignments.length === 0) {
    return (
      <>
        <FormLockModal form="judge-assignments" />
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">Your Assignments</h1>
            <p className="text-sm text-muted-foreground">
              Review your assigned teams and judging slots below.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <IconClipboardList className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              No assignments available
            </h3>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Assignments have not been created yet. Please check back later.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FormLockModal form="judge-assignments" />
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Your Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Review your assigned teams, times, and judging criteria below.
          </p>
        </div>

        <div className="space-y-4">
          {enrichedAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      {assignment.projectName}
                    </CardTitle>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <IconUsers className="h-3 w-3" />
                      {assignment.teamName}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(assignment.status)}>
                    {formatStatus(assignment.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {assignment.room && (
                    <span className="flex items-center gap-1">
                      <IconMapPin className="h-3 w-3" />
                      {assignment.room}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <IconBuilding className="h-3 w-3" />
                    {assignment.judgeName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <IconClipboardList className="h-3 w-3 text-muted-foreground self-center" />
                  <Badge variant="outline">Innovation</Badge>
                  <Badge variant="outline">Technical Complexity</Badge>
                  <Badge variant="outline">Presentation</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
