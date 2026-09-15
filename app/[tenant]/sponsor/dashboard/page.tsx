import { SponsorDashboardPage } from "@/components/sponsor/sponsor-dashboard-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SponsorDashboardRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const SponsorDashboardRoute = async ({
  params,
}: SponsorDashboardRouteProps) => {
  const { tenant } = await params;

  return <SponsorDashboardPage tenant={tenant} />;
};

export default SponsorDashboardRoute;
