"use client";

import { useTenant } from "@/hooks/use-tenant";
import { HeroSection } from "@/components/live/dashboard/hero-section";
import { ScheduleSection } from "@/components/live/dashboard/schedule-section";
import { SubmissionSection } from "@/components/live/dashboard/submission-section";
import { CheckinSection } from "@/components/live/dashboard/checkin-section";
import { Separator } from "@/components/ui/separator";
import { ApplicationStatusBadge } from "@/components/live/dashboard/application-status-badge";
import type { ApplicationStatus } from "@/components/live/dashboard/application-status-badge";

interface DashboardPageProps {
  tenant: string;
  participantStatus?: ApplicationStatus;
}

export function DashboardPage({
  tenant,
  participantStatus,
}: DashboardPageProps) {
  const { live } = useTenant();

  if (!live) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-full max-w-2xl text-left">
          <ApplicationStatusBadge
            status={participantStatus ?? null}
            applyHref={`/${tenant}/forms/participant`}
            applyLabel="Apply to be a Participant"
          />
        </div>
        <p className="mt-4 text-muted-foreground">
          Live event information is not available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApplicationStatusBadge
        status={participantStatus ?? null}
        applyHref={`/${tenant}/forms/participant`}
        applyLabel="Apply to be a Participant"
      />

      <HeroSection startTime={live.startTime} endTime={live.endTime} />
      <Separator className="my-6" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CheckinSection tenant={tenant} />

        <SubmissionSection
          tenant={tenant}
          submissionDeadline={new Date(live.deadline).getTime()}
        />
      </div>

      <Separator className="my-6" />

      <ScheduleSection />
    </div>
  );
}
