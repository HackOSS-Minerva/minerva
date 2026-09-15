import { PackingListPage } from "@/components/live/packing-list/packing-list-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface JudgePackingListRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const JudgePackingListRoute = async ({
  params,
}: JudgePackingListRouteProps) => {
  const { tenant } = await params;

  return (
    <PackingListPage tenant={tenant} baseHref={`/${tenant}/judge/dashboard`} />
  );
};

export default JudgePackingListRoute;
