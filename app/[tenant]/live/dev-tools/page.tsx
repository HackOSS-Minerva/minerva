import { DevToolsPage } from "@/components/live/dev-tools/dev-tools-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface DevToolsRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const DevToolsRoute = async ({ params }: DevToolsRouteProps) => {
  const { tenant } = await params;

  return <DevToolsPage tenant={tenant} />;
};

export default DevToolsRoute;
