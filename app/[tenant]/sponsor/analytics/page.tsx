import { AnalyticsPage } from "@/components/sponsor/analytics-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { getFeatureFlag } from "@/lib/feature-flags";
import type { TenantSlug } from "@/hooks/get-tenant";

interface AnalyticsRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const AnalyticsRoute = async ({ params }: AnalyticsRouteProps) => {
  const { tenant } = await params;

  if (!getFeatureFlag("analytics")) {
    return <FeatureGateModal reason="disabled" />;
  }

  return <AnalyticsPage tenant={tenant} />;
};

export default AnalyticsRoute;
