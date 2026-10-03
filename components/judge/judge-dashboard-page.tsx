import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { HeroSection } from "@/components/portal/dashboard/hero-section";
import { ScheduleSection } from "@/components/portal/dashboard/schedule-section";
import { CheckinSection } from "@/components/portal/dashboard/checkin-section";
import { Separator } from "@/components/ui/separator";
import { ApplicationStatusBadge } from "@/components/portal/dashboard/application-status-badge";
import type { ApplicationStatus } from "@/components/portal/dashboard/application-status-badge";
import type { CalendarResponse } from "@/types/calendar";

interface JudgeDashboardPageProps {
  tenant: TenantSlug;
  judgeStatus: ApplicationStatus;
  /** Display name from the server session. */
  userName?: string;
  /** SSR'd calendar payload; forwarded as the schedule island's initialData. */
  initialSchedule?: CalendarResponse;
}

// Server Component shell: tenant config lookup is sync + server-safe.
// Interactive children (countdown, QR, schedule filters) are client islands.
export function JudgeDashboardPage({
  tenant,
  judgeStatus,
  userName,
  initialSchedule,
}: JudgeDashboardPageProps) {
  const { config } = getTenant(tenant);
  const live = config?.event ?? null;

  if (!live) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-full max-w-2xl text-left">
          <ApplicationStatusBadge
            status={judgeStatus}
            userName={userName}
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
        userName={userName}
        applyHref={`/${tenant}/forms/judge`}
        applyLabel="Apply to be a Judge"
      />

      <HeroSection startTime={live.startTime} endTime={live.endTime} />
      <Separator className="my-6" />

      <CheckinSection />
      <Separator className="my-6" />

      <ScheduleSection initialData={initialSchedule} />
    </div>
  );
}
