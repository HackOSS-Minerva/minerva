import { RulesPage } from "@/components/live/rules/rules-page";

interface SponsorRulesRouteProps {
  params: {
    tenant: string;
  };
}

const SponsorRulesRoute = async ({ params }: SponsorRulesRouteProps) => {
  const { tenant } = await params;

  return (
    <RulesPage tenant={tenant} baseHref={`/${tenant}/sponsor/dashboard`} />
  );
};

export default SponsorRulesRoute;
