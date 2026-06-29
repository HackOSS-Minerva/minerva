import { HackpacksPage } from "@/components/live/hackpacks/hackpacks-page";
import { withAuth } from "@workos-inc/authkit-nextjs";

interface HackpacksRouteProps {
  params: {
    tenant: string;
  };
}

const HackpacksRoute = async ({ params }: HackpacksRouteProps) => {
  const { tenant } = await params;
  const { user } = await withAuth();

  return <HackpacksPage tenant={tenant} />;
};

export default HackpacksRoute;
