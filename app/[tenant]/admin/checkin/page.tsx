import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
import CheckinContent from "@/components/checkin/checkin-content";
import { getAdminPageLock } from "@/lib/admin-locks";
import type { TenantSlug } from "@/hooks/get-tenant";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}) {
  const { tenant } = await params;

  return (
    <AdminShell title="Check-in">
      {getAdminPageLock(tenant, "checkin") ? (
        <FeatureGateModal reason="locked" />
      ) : (
        <CheckinContent />
      )}
    </AdminShell>
  );
}
