import { RulesPage } from "@/components/portal/pages/rules-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface RulesRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const RulesRoute = async ({ params }: RulesRouteProps) => {
  const { tenant } = await params;

  return <RulesPage tenant={tenant} />;
};

export default RulesRoute;
