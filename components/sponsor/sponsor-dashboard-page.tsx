"use client";

import { useTenant } from "@/hooks/use-tenant";
import { authClient } from "@/lib/auth-client";
import { HeroSection } from "@/components/live/dashboard/hero-section";
import { ScheduleSection } from "@/components/live/dashboard/schedule-section";
import { Separator } from "@/components/ui/separator";

interface SponsorDashboardPageProps {
  tenant: string;
}

export function SponsorDashboardPage({}: SponsorDashboardPageProps) {
  const { live } = useTenant();
  const { data: session } = authClient.useSession();
  const name = session?.user?.name ?? "hacker";

  if (!live) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Sponsor Dashboard</h1>
        <p className="text-center text-2xl font-bold">👋 Hello, {name}</p>
        <p className="mt-2 text-muted-foreground">
          Live event information is not available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-2xl font-bold">👋 Hello, {name}</p>

      <HeroSection startTime={live.startTime} endTime={live.endTime} />
      <Separator className="my-6" />

      <ScheduleSection />
    </div>
  );
}
