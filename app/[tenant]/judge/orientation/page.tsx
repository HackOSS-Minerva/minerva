import { OrientationPage } from "@/components/judge/orientation-page";

interface OrientationRouteProps {
  params: {
    tenant: string;
  };
}

const OrientationRoute = async ({ params }: OrientationRouteProps) => {
  const { tenant } = await params;

  return <OrientationPage tenant={tenant} />;
};

export default OrientationRoute;
