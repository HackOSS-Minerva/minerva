import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { HeroSection } from "@/components/portal/dashboard/hero-section";
import { ScheduleSection } from "@/components/portal/dashboard/schedule-section";
import { SubmissionSection } from "@/components/live/dashboard/submission-section";
import { CheckinSection } from "@/components/portal/dashboard/checkin-section";
import { Separator } from "@/components/ui/separator";
import { ApplicationStatusBadge } from "@/components/portal/dashboard/application-status-badge";
import type { ApplicationStatus } from "@/components/portal/dashboard/application-status-badge";
import type { CalendarResponse } from "@/types/calendar";
import type { CheckinQrIdentity } from "@/lib/checkin";
import { HackCreditsCard } from "@/components/live/checkin/hack-credits-card";
import { DevModeSwitcher } from "@/components/dev/dev-mode-switcher";
import { Suspense } from "react";

interface DashboardPageProps {
  tenant: TenantSlug;
  participantStatus?: ApplicationStatus;
  userName?: string;
  checkinUser?: CheckinQrIdentity | null;
  initialSchedule?: CalendarResponse;
}

export const DashboardPage = ({
  tenant,
  participantStatus,
  userName,
  checkinUser,
  initialSchedule,
}: DashboardPageProps) => {
  const { config } = getTenant(tenant);
  const live = config?.event ?? null;

  const isAccepted = participantStatus === "ACCEPTANCE";

  if (!live) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-full max-w-2xl text-left">
          <ApplicationStatusBadge
            status={participantStatus ?? null}
            userName={userName}
            applyHref={`/${tenant}/forms/participant`}
            applyLabel="Apply to be a Participant"
          />
        </div>
        <p className="mt-4 text-muted-foreground">Live event information is not available yet.</p>
        <Suspense fallback={null}>
          <DevModeSwitcher role="participant" status={participantStatus ?? null} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApplicationStatusBadge
        status={participantStatus ?? null}
        userName={userName}
        applyHref={`/${tenant}/forms/participant`}
        applyLabel="Apply to be a Participant"
      />
      <HeroSection startTime={live.startTime} endTime={live.endTime} />
      {isAccepted && (
        <>
          <Separator className="my-6" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <CheckinSection user={checkinUser ?? null} />

            <HackCreditsCard compact />

            <SubmissionSection
              tenant={tenant}
              submissionDeadline={new Date(live.deadline).getTime()}
            />
          </div>
        </>
      )}

      <Separator className="my-6" />

      <ScheduleSection initialData={initialSchedule} />
      <Suspense fallback={null}>
        <DevModeSwitcher role="participant" status={participantStatus ?? null} />
      </Suspense>
    </div>
  );
};
