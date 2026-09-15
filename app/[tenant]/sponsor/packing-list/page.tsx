import { PackingListPage } from "@/components/live/packing-list/packing-list-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SponsorPackingListRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const SponsorPackingListRoute = async ({
  params,
}: SponsorPackingListRouteProps) => {
  const { tenant } = await params;

  return (
    <PackingListPage
      tenant={tenant}
      baseHref={`/${tenant}/sponsor/dashboard`}
    />
  );
};

export default SponsorPackingListRoute;
