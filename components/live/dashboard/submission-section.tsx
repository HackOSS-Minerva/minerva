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
}

// Server Component: card + deadline text render on the server. The ticking
// badge is a `DeadlineBadge` client island.export const SubmissionSection = ({ tenant, submissionDeadline }: SubmissionSectionProps) => {

}
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
}
