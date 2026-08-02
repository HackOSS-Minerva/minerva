"use client";

import { useTenant } from "@/hooks/use-tenant";
import { HeroSection } from "@/components/live/dashboard/hero-section";
import { ScheduleSection } from "@/components/live/dashboard/schedule-section";
import { CheckinSection } from "@/components/live/dashboard/checkin-section";
import { Separator } from "@/components/ui/separator";
import { ApplicationStatusBadge } from "@/components/live/dashboard/application-status-badge";
import type { ApplicationStatus } from "@/components/live/dashboard/application-status-badge";

interface JudgeDashboardPageProps {
  tenant: string;
  judgeStatus: ApplicationStatus;
}

export function JudgeDashboardPage({
  tenant,
  judgeStatus,
}: JudgeDashboardPageProps) {
  const { live } = useTenant();

  if (!live) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-full max-w-2xl text-left">
          <ApplicationStatusBadge
            status={judgeStatus}
            applyHref={`/${tenant}/forms/judge`}
            applyLabel="Apply to be a Judge"
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
        status={judgeStatus}
        applyHref={`/${tenant}/forms/judge`}
        applyLabel="Apply to be a Judge"
      />

      <HeroSection startTime={live.startTime} endTime={live.endTime} />
      <Separator className="my-6" />

      <CheckinSection tenant={tenant} />
      <Separator className="my-6" />

      <ScheduleSection />
    </div>
  );
}
