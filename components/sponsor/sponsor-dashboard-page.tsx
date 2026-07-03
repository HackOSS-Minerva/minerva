"use client";

import { useTenant } from "@/hooks/use-tenant";
import { HeroSection } from "@/components/live/dashboard/hero-section";
import { ScheduleSection } from "@/components/live/dashboard/schedule-section";
import { SponsorNav } from "@/components/sponsor/sponsor-nav";
import { Separator } from "@/components/ui/separator";

interface SponsorDashboardPageProps {
  tenant: string;
}

export function SponsorDashboardPage({ tenant }: SponsorDashboardPageProps) {
  const { live } = useTenant();

  if (!live) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Sponsor Dashboard</h1>
        <p className="text-center text-2xl font-bold">👋 Hello, Guest User</p>
        <p className="mt-2 text-muted-foreground">
          Live event information is not available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:py-10">
      <SponsorNav tenant={tenant} />
      <p className="text-center text-2xl font-bold">👋 Hello, Guest User</p>

      <HeroSection startTime={live.startTime} endTime={live.endTime} />
      <Separator className="my-6" />

      <ScheduleSection />
    </div>
  );
}
