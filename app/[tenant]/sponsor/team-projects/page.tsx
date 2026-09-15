import { TeamProjectsPage } from "@/components/sponsor/team-projects-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface TeamProjectsRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const TeamProjectsRoute = async ({ params }: TeamProjectsRouteProps) => {
  const { tenant } = await params;

  return <TeamProjectsPage tenant={tenant} />;
};

export default TeamProjectsRoute;
