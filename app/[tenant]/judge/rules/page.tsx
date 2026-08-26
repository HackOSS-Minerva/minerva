import { RulesPage } from "@/components/live/rules/rules-page";

interface JudgeRulesRouteProps {
  params: {
    tenant: string;
  };
}

const JudgeRulesRoute = async ({ params }: JudgeRulesRouteProps) => {
  const { tenant } = await params;

  return <RulesPage tenant={tenant} baseHref={`/${tenant}/judge/dashboard`} />;
};

export default JudgeRulesRoute;
