"use client";

import { useTenant } from "@/hooks/use-tenant";
import { HeroSection } from "@/components/live/dashboard/hero-section";
import { ScheduleSection } from "@/components/live/dashboard/schedule-section";
import { CheckinSection } from "@/components/live/dashboard/checkin-section";
import { JudgeNav } from "@/components/judge/judge-nav";
import { Separator } from "@/components/ui/separator";

interface JudgeDashboardPageProps {
  tenant: string;
}

export function JudgeDashboardPage({ tenant }: JudgeDashboardPageProps) {
  const { live } = useTenant();

  if (!live) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Judge Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Live event information is not available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <JudgeNav tenant={tenant} />

      <HeroSection startTime={live.startTime} endTime={live.endTime} />
      <Separator className="my-6" />

      <CheckinSection tenant={tenant} />
      <Separator className="my-6" />

      <ScheduleSection />
    </div>
  );
}

