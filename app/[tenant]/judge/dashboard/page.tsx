import { fetchAuthQuery } from "@/lib/auth-server";
import { JudgeDashboardPage } from "@/components/judge/judge-dashboard-page";
import { fetchScheduleServer } from "@/lib/schedule-server";
import { api } from "@/convex/_generated/api";
import type { TenantSlug } from "@/hooks/get-tenant";

interface JudgeDashboardRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const JudgeDashboardRoute = async ({ params }: JudgeDashboardRouteProps) => {
  const { tenant } = await params;

  // Judge access state: the dashboard shows the application status. This is the
  // secure session check; the proxy only did an optimistic cookie redirect.
  const access = await fetchAuthQuery(api.auth.getJudgeAccess, { tenant });

  // Display name for the greeting; avoids a client-side `useSession()` hook.
  const authUser = await fetchAuthQuery(api.auth.getCurrentUser, {});
  const userName = authUser?.name ?? undefined;

  // SSR the calendar server-side (cached 5 min); the client island uses it
  // as React Query `initialData`, so first paint has no client waterfall.
  // A calendar outage must not take down the whole dashboard.
  const schedule = await fetchScheduleServer(tenant).catch(() => null);

  return (
    <JudgeDashboardPage
      tenant={tenant}
      judgeStatus={access.status}
      userName={userName}
      initialSchedule={schedule ?? undefined}
    />
  );
};

export default JudgeDashboardRoute;
