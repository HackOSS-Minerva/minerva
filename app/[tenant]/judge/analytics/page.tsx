import { AnalyticsPage } from "@/components/judge/analytics-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { getFeatureFlag } from "@/lib/feature-flags";

interface AnalyticsRouteProps {
  params: Promise<{
    tenant: string;
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
