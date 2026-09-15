import { CheckinPage } from "@/components/live/checkin/checkin-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface CheckinRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const CheckinRoute = async ({ params }: CheckinRouteProps) => {
  const { tenant } = await params;

  return <CheckinPage tenant={tenant} />;
};

export default CheckinRoute;
