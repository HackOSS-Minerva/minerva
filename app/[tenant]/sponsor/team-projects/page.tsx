import { TeamProjectsPage } from "@/components/sponsor/team-projects-page";

interface TeamProjectsRouteProps {
  params: {
    tenant: string;
  };
}

const TeamProjectsRoute = async ({ params }: TeamProjectsRouteProps) => {
  const { tenant } = await params;

  return <TeamProjectsPage tenant={tenant} />;
};

export default TeamProjectsRoute;
