import { HackpacksPage } from "@/components/live/hackpacks/hackpacks-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface HackpacksRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const HackpacksRoute = async ({ params }: HackpacksRouteProps) => {
  const { tenant } = await params;

  return <HackpacksPage tenant={tenant} />;
};

export default HackpacksRoute;
