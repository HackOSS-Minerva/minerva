import { JudgeDashboardPage } from "@/components/judge/judge-dashboard-page";

interface JudgeDashboardRouteProps {
  params: {
    tenant: string;
  };
}

const JudgeDashboardRoute = async ({ params }: JudgeDashboardRouteProps) => {
  const { tenant } = await params;

  return <JudgeDashboardPage tenant={tenant} />;
};

export default JudgeDashboardRoute;
