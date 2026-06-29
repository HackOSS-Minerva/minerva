import { DashboardPage } from "@/components/live/dashboard/dashboard-page";
import { withAuth } from "@workos-inc/authkit-nextjs";

interface DashboardRouteProps {
  params: {
    tenant: string;
  };
}

const DashboardRoute = async ({ params }: DashboardRouteProps) => {
  const { tenant } = await params;
  const { user } = await withAuth();

  return <DashboardPage tenant={tenant} />;
};

export default DashboardRoute;