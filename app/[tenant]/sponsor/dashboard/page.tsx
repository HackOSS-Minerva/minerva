import { SponsorDashboardPage } from "@/components/sponsor/sponsor-dashboard-page";

interface SponsorDashboardRouteProps {
  params: {
    tenant: string;
  };
}

const SponsorDashboardRoute = async ({ params }: SponsorDashboardRouteProps) => {
  const { tenant } = await params;

  return <SponsorDashboardPage tenant={tenant} />;
};

export default SponsorDashboardRoute;
