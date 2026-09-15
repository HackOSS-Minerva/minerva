import { PackingListPage } from "@/components/portal/pages/packing-list-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface PackingListRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const PackingListRoute = async ({ params }: PackingListRouteProps) => {
  const { tenant } = await params;

  return <PackingListPage tenant={tenant} />;
};

export default PackingListRoute;
