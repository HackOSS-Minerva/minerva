import { OrientationPage } from "@/components/judge/orientation-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface OrientationRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const OrientationRoute = async ({ params }: OrientationRouteProps) => {
  const { tenant } = await params;

  return <OrientationPage tenant={tenant} />;
};

export default OrientationRoute;
