import { RulesPage } from "@/components/live/rules/rules-page";
import { withAuth } from "@workos-inc/authkit-nextjs";

interface RulesRouteProps {
  params: {
    tenant: string;
  };
}

const RulesRoute = async ({ params }: RulesRouteProps) => {
  const { tenant } = await params;
  const { user } = await withAuth();

  return <RulesPage tenant={tenant} />;
};

export default RulesRoute;