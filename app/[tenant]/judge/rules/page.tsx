import { RulesPage } from "@/components/portal/pages/rules-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface JudgeRulesRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const JudgeRulesRoute = async ({ params }: JudgeRulesRouteProps) => {
  const { tenant } = await params;

  return <RulesPage tenant={tenant} baseHref={`/${tenant}/judge/dashboard`} />;
};

export default JudgeRulesRoute;
