import { AssignmentsPage } from "@/components/judge/assignments-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { getFeatureFlag } from "@/lib/feature-flags";
import type { TenantSlug } from "@/hooks/get-tenant";

interface AssignmentsRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const AssignmentsRoute = async ({ params }: AssignmentsRouteProps) => {
  const { tenant } = await params;

  if (!getFeatureFlag("assignments")) {
    return <FeatureGateModal reason="disabled" />;
  }

  return <AssignmentsPage tenant={tenant} />;
};

export default AssignmentsRoute;
