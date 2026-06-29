"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCountdown } from "@/hooks/use-countdown";
import { IconExternalLink, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface SubmissionSectionProps {
  tenant: string;
  submissionDeadline: number;
  requirements: string;
}

export function SubmissionSection({
  tenant,
  submissionDeadline,
  requirements,
}: SubmissionSectionProps) {
  const timeLeft = useCountdown(submissionDeadline);
  const now = Date.now();
  const isPastDeadline = now > submissionDeadline;

  const { user } = useAuth();
  
  // Check if this user has already submitted a project
  const submission = useQuery(
    api.submissions.getByUser,
    user?.id
      ? {
          tenant: tenant.toLowerCase(),
          workos: user.id,
        }
      : "skip"
  );

  const hasSubmitted = !!submission;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Submission</CardTitle>
        {hasSubmitted && (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 flex items-center gap-1 font-semibold">
            <IconCheck className="h-3 w-3" />
            Submitted
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Submission Deadline</p>
            <p className="font-medium">
              {new Date(submissionDeadline).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {timeLeft && !isPastDeadline && (
            <Badge variant="secondary" className="shrink-0">
              {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
              {timeLeft.hours}h {timeLeft.minutes}m remaining
            </Badge>
          )}
          {isPastDeadline && (
            <Badge variant="outline">Deadline Passed</Badge>
          )}
        </div>

        {requirements && (
          <div>
            <p className="mb-1 text-sm font-medium">Requirements</p>
            <p className="text-sm text-muted-foreground">{requirements}</p>
          </div>
        )}

        {hasSubmitted && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm border border-border">
            <p className="font-medium text-foreground">Current Submission: <span className="font-semibold text-primary">{submission.projectName}</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">Team: {submission.teamName}</p>
          </div>
        )}

        {!hasSubmitted && (
          <div className="flex flex-wrap gap-3">
            <Button asChild disabled={isPastDeadline}>
              <Link href={`/${tenant}/live/submit`}>
                Submit Project
                <IconExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}