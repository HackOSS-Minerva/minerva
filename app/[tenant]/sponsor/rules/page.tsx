import { RulesPage } from "@/components/live/rules/rules-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SponsorRulesRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const SponsorRulesRoute = async ({ params }: SponsorRulesRouteProps) => {
  const { tenant } = await params;

  return (
    <RulesPage tenant={tenant} baseHref={`/${tenant}/sponsor/dashboard`} />
  );
};

export default SponsorRulesRoute;
