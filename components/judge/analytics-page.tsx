import { AnalyticsPage as SharedAnalyticsPage } from "@/components/analytics/analytics-page";

import type { TenantSlug } from "@/hooks/get-tenant";

interface JudgeAnalyticsPageProps {
  tenant: TenantSlug;
}

export function AnalyticsPage({ tenant }: JudgeAnalyticsPageProps) {
  return <SharedAnalyticsPage tenant={tenant} scope="shared" />;
}
