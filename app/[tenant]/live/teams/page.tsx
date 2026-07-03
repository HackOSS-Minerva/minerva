import { TeamsPage } from "@/components/live/teams/teams-page";

interface TeamsRouteProps {
  params: {
    tenant: string;
  };
}

const TeamsRoute = async ({ params }: TeamsRouteProps) => {
  const { tenant } = await params;

  return <TeamsPage tenant={tenant} />;
};

export default TeamsRoute;
