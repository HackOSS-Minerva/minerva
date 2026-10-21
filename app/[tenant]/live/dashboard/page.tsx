import { DashboardPage } from "@/components/live/dashboard/dashboard-page";
import { fetchAuthQuery } from "@/lib/auth-server";
import { fetchScheduleServer } from "@/lib/schedule-server";
import { api } from "@/convex/_generated/api";
import type { TenantSlug } from "@/hooks/get-tenant";

interface DashboardRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const DashboardRoute = async ({ params }: DashboardRouteProps) => {
  const { tenant } = await params;

  // Fetch the participant's application status so the dashboard can show their
  // registration state (not registered / pending / accepted / rejected).
  const access = await fetchAuthQuery(api.auth.getParticipantAccess, {
    tenant,
  });

  // Display name for the greeting; avoids a client-side `useSession()` hook.
  const authUser = await fetchAuthQuery(api.auth.getCurrentUser, {});
  const userName = authUser?.name ?? undefined;

  // Real session identity for the dashboard's check-in QR. `null` when signed
  // out (e.g. dev auth bypass) so the card prompts to sign in instead of ever
  // rendering a hardcoded placeholder code.
  const checkinUser = authUser
    ? { id: authUser._id, name: authUser.name, email: authUser.email }
    : null;

  // SSR the calendar server-side (cached 5 min); the client island uses it
  // as React Query `initialData`, so first paint has no client waterfall.
  // A calendar outage must not take down the whole dashboard.
  const schedule = await fetchScheduleServer(tenant).catch(() => null);

  return (
    <DashboardPage
      tenant={tenant}
      participantStatus={access.status}
      userName={userName}
      checkinUser={checkinUser}
      initialSchedule={schedule ?? undefined}
    />
  );
};

export default DashboardRoute;
