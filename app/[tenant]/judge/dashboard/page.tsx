import { fetchAuthQuery } from "@/lib/auth-server";
import { JudgeDashboardPage } from "@/components/judge/judge-dashboard-page";
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

  return <JudgeDashboardPage tenant={tenant} judgeStatus={access.status} />;
};

export default JudgeDashboardRoute;
