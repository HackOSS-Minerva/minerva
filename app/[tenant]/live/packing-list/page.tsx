import { PackingListPage } from "@/components/portal/pages/packing-list-page";
import { guardParticipantPage } from "@/lib/require-participant";
import type { TenantSlug } from "@/hooks/get-tenant";

interface PackingListRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const PackingListRoute = async ({ params }: PackingListRouteProps) => {
  const { tenant } = await params;

  // Same guard as the navbar lock: signed-in accepted participants only.
  const locked = await guardParticipantPage(tenant, `/${tenant}/live/packing-list`);
  if (locked) {
    return locked;
  }

  return <PackingListPage tenant={tenant} />;
};

export default PackingListRoute;
