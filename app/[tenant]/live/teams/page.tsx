import { TeamsPage } from "@/components/live/teams/teams-page";
import { withAuth } from "@workos-inc/authkit-nextjs";

interface TeamsRouteProps {
  params: {
    tenant: string;
  };
}

const TeamsRoute = async ({ params }: TeamsRouteProps) => {
  const { tenant } = await params;
  const { user } = await withAuth();

  return (
    <TeamsPage
      tenant={tenant}
      userId={user?.id ?? ""}
      userName={
        user?.firstName
          ? `${user.firstName} ${user.lastName ?? ""}`
          : "Anonymous"
      }
    />
  );
};

export default TeamsRoute;