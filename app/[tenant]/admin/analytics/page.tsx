import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
import { getFeatureFlag } from "@/lib/feature-flags";
import type { TenantSlug } from "@/hooks/get-tenant";

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}) {
  const { tenant } = await params;

  return (
    <AdminShell title="Analytics">
      {!getFeatureFlag("analytics") ? (
        <FeatureGateModal reason="disabled" />
      ) : (
        <AnalyticsPage tenant={tenant} scope="admin" />
      )}
    </AdminShell>
  );
}
