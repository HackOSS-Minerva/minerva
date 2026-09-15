import { AssignmentsPage } from "@/components/judge/assignments-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { getFeatureFlag } from "@/lib/feature-flags";

interface AssignmentsRouteProps {
  params: {
    tenant: string;
  };
}

const AssignmentsRoute = async ({ params }: AssignmentsRouteProps) => {
  const { tenant } = await params;

  if (!getFeatureFlag("assignments")) {
    return <FeatureGateModal reason="disabled" />;
  }

  return <AssignmentsPage tenant={tenant} />;
};

export default AssignmentsRoute;
