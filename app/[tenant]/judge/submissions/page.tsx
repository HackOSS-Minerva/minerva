import { SubmissionsPage } from "@/components/judge/submissions-page";

interface SubmissionsRouteProps {
  params: {
    tenant: string;
  };
}

const SubmissionsRoute = async ({ params }: SubmissionsRouteProps) => {
  const { tenant } = await params;

  return <SubmissionsPage tenant={tenant} />;
};

export default SubmissionsRoute;
