import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconExternalLink, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { DeadlineBadge } from "@/components/live/dashboard/deadline-badge";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SubmissionSectionProps {
  tenant: TenantSlug;
  submissionDeadline: number;
}

// Server Component: card + deadline text render on the server. The ticking
// badge is a `DeadlineBadge` client island.
export function SubmissionSection({
  tenant,
  submissionDeadline,
}: SubmissionSectionProps) {
  // Per-request "now" on the server (matches the previous `useState(Date.now)`
  // mount-frozen semantics). Impure by design — evaluated once per request.
  // eslint-disable-next-line react-hooks/purity
  const isPastDeadline = Date.now() > submissionDeadline;

  const hasSubmitted = false;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Submission</CardTitle>
        {hasSubmitted && (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 flex items-center gap-1 font-semibold"
          >
            <IconCheck className="h-3 w-3" />
            Submitted
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
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
          <div>
            <DeadlineBadge
              deadline={submissionDeadline}
              isPastDeadline={isPastDeadline}
            />
          </div>
        </div>

        {!isPastDeadline && (
          <div className="flex flex-wrap gap-3">
            <Button asChild>
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
