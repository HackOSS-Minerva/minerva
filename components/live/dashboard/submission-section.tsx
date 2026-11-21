import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeadlineBadge } from "@/components/live/dashboard/deadline-badge";
import type { TenantSlug } from "@/hooks/get-tenant";
import { FALLBACK_EVENT_TIME_ZONE } from "@/lib/schedule";

interface SubmissionSectionProps {
  tenant: TenantSlug;
  submissionDeadline: number;
}

// Server Component: deadline text renders on the server; the ticking badge is
// a `DeadlineBadge` client island.
export const SubmissionSection = ({ tenant, submissionDeadline }: SubmissionSectionProps) => {
  const isPastDeadline = Date.now() > submissionDeadline;

  return (
    <section className="space-y-3 border-t pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
      <h2 className="text-sm font-semibold">Submission</h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Due{" "}
            {new Date(submissionDeadline).toLocaleString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
              timeZone: FALLBACK_EVENT_TIME_ZONE,
            })}
          </p>
        </div>
        {!isPastDeadline && (
          <Button asChild size="sm">
            <Link href={`/${tenant}/live/submit`}>Submit project</Link>
          </Button>
        )}
      </div>
    </section>
  );
};
