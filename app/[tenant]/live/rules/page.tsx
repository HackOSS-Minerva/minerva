import { RulesPage } from "@/components/portal/pages/rules-page";
import { guardParticipantPage } from "@/lib/require-participant";
import type { TenantSlug } from "@/hooks/get-tenant";

interface RulesRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const RulesRoute = async ({ params }: RulesRouteProps) => {
  const { tenant } = await params;

  // Same guard as the navbar lock: signed-in accepted participants only.
  const locked = await guardParticipantPage(tenant, `/${tenant}/live/rules`);
  if (locked) {
    return locked;
  }

  return <RulesPage tenant={tenant} />;
};

export default RulesRoute;
