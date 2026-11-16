import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiExternalLinkLine, RiCheckLine } from "@remixicon/react";
import Link from "next/link";
import { DeadlineBadge } from "@/components/live/dashboard/deadline-badge";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SubmissionSectionProps {
  tenant: TenantSlug;
  submissionDeadline: number;
  compact?: boolean;
}

// Server Component: card + deadline text render on the server. The ticking
// badge is a `DeadlineBadge` client island.
export const SubmissionSection = ({
  tenant,
  submissionDeadline,
  compact = false,
}: SubmissionSectionProps) => {
  // Per-request "now" on the server (matches the previous `useState(Date.now)`
  // mount-frozen semantics). Impure by design — evaluated once per request.
  const isPastDeadline = Date.now() > submissionDeadline;

  const hasSubmitted = false;

  if (compact) {
    return (
      <section className="space-y-3 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Submission</h2>
          {hasSubmitted && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 border-emerald-500/20 bg-emerald-500/10 font-semibold text-emerald-500 hover:bg-emerald-500/20"
            >
              <RiCheckLine className="h-3 w-3" />
              Submitted
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {new Date(submissionDeadline).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <DeadlineBadge deadline={submissionDeadline} isPastDeadline={isPastDeadline} />
          </div>
          {!isPastDeadline && (
            <Button asChild size="sm">
              <Link href={`/${tenant}/live/submit`}>
                Submit Project
                <RiExternalLinkLine className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Submission</CardTitle>
        {hasSubmitted && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1 border-emerald-500/20 bg-emerald-500/10 font-semibold text-emerald-500 hover:bg-emerald-500/20"
          >
            <RiCheckLine className="h-3 w-3" />
            Submitted
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="space-y-1">
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
          <div>
            <DeadlineBadge deadline={submissionDeadline} isPastDeadline={isPastDeadline} />
          </div>
        </div>

        {!isPastDeadline && (
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/${tenant}/live/submit`}>
                Submit Project
                <RiExternalLinkLine className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
