"use client";

import { useTenant } from "@/hooks/use-tenant";
import { HeroSection } from "@/components/live/dashboard/hero-section";
import { ScheduleSection } from "@/components/live/dashboard/schedule-section";
import { SubmissionSection } from "@/components/live/dashboard/submission-section";
import { CheckinSection } from "@/components/live/dashboard/checkin-section";
import { LiveNav } from "@/components/live/live-nav";
import { Separator } from "@/components/ui/separator";

interface DashboardPageProps {
  tenant: string;
}

export function DashboardPage({ tenant }: DashboardPageProps) {
  const { live } = useTenant();

  if (!live) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Live event information is not available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <LiveNav tenant={tenant} />

      <HeroSection startTime={live.startTime} endTime={live.endTime} />
      <Separator className="my-6" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CheckinSection tenant={tenant} />

        {live.submission && (
          <SubmissionSection
            tenant={tenant}
            submissionDeadline={new Date(live.submission.deadline).getTime()}
            requirements={live.submission.requirements}
          />
        )}
      </div>

      <Separator className="my-6" />

      <ScheduleSection />
    </div>
  );
}