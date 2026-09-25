import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
import { getAdminPageLock } from "@/lib/admin-locks";
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
      ) : getAdminPageLock(tenant, "analytics") ? (
        <FeatureGateModal reason="locked" />
      ) : (
        <AnalyticsPage tenant={tenant} scope="admin" />
      )}
    </AdminShell>
  );
}
