import { fetchAuthQuery } from "@/lib/auth-server";
import { JudgeDashboardPage } from "@/components/judge/judge-dashboard-page";
import { api } from "@/convex/_generated/api";

interface JudgeDashboardRouteProps {
  params: {
    tenant: string;
  };
}

const JudgeDashboardRoute = async ({ params }: JudgeDashboardRouteProps) => {
  const { tenant } = await params;

  // Fetch the judge's access state so the dashboard can show their application
  // status and conditionally render UI. The proxy already did an optimistic
  // cookie-existence redirect; this is the secure session validation via Convex.
  const access = await fetchAuthQuery(api.auth.getJudgeAccess, { tenant });

  return <JudgeDashboardPage tenant={tenant} judgeStatus={access.status} />;
};

export default JudgeDashboardRoute;
