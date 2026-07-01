import { AssignmentsPage } from "@/components/judge/assignments-page";

interface AssignmentsRouteProps {
  params: {
    tenant: string;
  };
}

const AssignmentsRoute = async ({ params }: AssignmentsRouteProps) => {
  const { tenant } = await params;

  return <AssignmentsPage tenant={tenant} />;
};

export default AssignmentsRoute;
