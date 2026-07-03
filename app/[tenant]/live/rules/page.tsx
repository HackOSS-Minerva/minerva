import { RulesPage } from "@/components/live/rules/rules-page";

interface RulesRouteProps {
  params: {
    tenant: string;
  };
}

const RulesRoute = async ({ params }: RulesRouteProps) => {
  const { tenant } = await params;

  return <RulesPage tenant={tenant} />;
};

export default RulesRoute;