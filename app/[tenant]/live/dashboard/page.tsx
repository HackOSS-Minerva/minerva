import { DashboardPage } from "@/components/live/dashboard/dashboard-page";

interface DashboardRouteProps {
  params: {
    tenant: string;
  };
}

const DashboardRoute = async ({ params }: DashboardRouteProps) => {
  const { tenant } = await params;

  return <DashboardPage tenant={tenant} />;
};

export default DashboardRoute;