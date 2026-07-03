import { HackpacksPage } from "@/components/live/hackpacks/hackpacks-page";

interface HackpacksRouteProps {
  params: {
    tenant: string;
  };
}

const HackpacksRoute = async ({ params }: HackpacksRouteProps) => {
  const { tenant } = await params;

  return <HackpacksPage tenant={tenant} />;
};

export default HackpacksRoute;
