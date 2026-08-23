import { DashboardPage } from "@/components/live/dashboard/dashboard-page";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

interface DashboardRouteProps {
  params: {
    tenant: string;
  };
}

const DashboardRoute = async ({ params }: DashboardRouteProps) => {
  const { tenant } = await params;

  // Fetch the participant's application status so the dashboard can show their
  // registration state (not registered / pending / accepted / rejected).
  const access = await fetchAuthQuery(api.auth.getParticipantAccess, {
    tenant,
  });

  return <DashboardPage tenant={tenant} participantStatus={access.status} />;
};

export default DashboardRoute;
