"use client";

import { JudgeNav } from "@/components/judge/judge-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconMapPin,
  IconClock,
  IconUsers,
  IconClipboardList,
} from "@tabler/icons-react";

interface AssignmentsPageProps {
  tenant: string;
}

const dummyAssignments = [
  {
    id: 1,
    projectName: "EcoRoute",
    teamName: "Byte Brawlers",
    timeSlot: "12:00 PM - 12:15 PM",
    location: "Room A",
    criteria: ["Innovation", "Technical Complexity", "Presentation"],
    status: "Assigned",
  },
  {
    id: 2,
    projectName: "MediConnect",
    teamName: "Circuit Sisters",
    timeSlot: "12:15 PM - 12:30 PM",
    location: "Room B",
    criteria: ["Impact", "Design", "Demo"],
    status: "Assigned",
  },
  {
    id: 3,
    projectName: "CampusEats",
    teamName: "Hack Heroes",
    timeSlot: "12:30 PM - 12:45 PM",
    location: "Room A",
    criteria: ["Feasibility", "Market Fit", "Presentation"],
    status: "Assigned",
  },
];

export function AssignmentsPage({ tenant }: AssignmentsPageProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <JudgeNav tenant={tenant} />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Your Assignments</h1>
        <p className="text-sm text-muted-foreground">
          Review your assigned teams, times, and judging criteria below.
        </p>
      </div>

      <div className="space-y-4">
        {dummyAssignments.map((assignment) => (
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
                <Badge variant="secondary">{assignment.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconClock className="h-3 w-3" />
                  {assignment.timeSlot}
                </span>
                <span className="flex items-center gap-1">
                  <IconMapPin className="h-3 w-3" />
                  {assignment.location}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <IconClipboardList className="h-3 w-3 text-muted-foreground self-center" />
                {assignment.criteria.map((criterion) => (
                  <Badge key={criterion} variant="outline">
                    {criterion}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

