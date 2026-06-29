"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCountdown } from "@/hooks/use-countdown";
import { IconExternalLink } from "@tabler/icons-react";

interface SubmissionSectionProps {
  submissionUrl: string;
  submissionDeadline: number;
  requirements: string;
}

export function SubmissionSection({
  submissionUrl,
  submissionDeadline,
  requirements,
}: SubmissionSectionProps) {
  const timeLeft = useCountdown(submissionDeadline);
  const now = Date.now();
  const isPastDeadline = now > submissionDeadline;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission</CardTitle>
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

        <div className="flex flex-wrap gap-3">
          <Button asChild disabled={isPastDeadline}>
            <a
              href={submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Submit Project
              <IconExternalLink className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}