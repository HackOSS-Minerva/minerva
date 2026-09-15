import { TeamsPage } from "@/components/live/teams/teams-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface TeamsRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const TeamsRoute = async ({ params }: TeamsRouteProps) => {
  const { tenant } = await params;

  return <TeamsPage tenant={tenant} />;
};

export default TeamsRoute;
