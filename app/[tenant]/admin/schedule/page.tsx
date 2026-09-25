import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
import ScheduleContent from "@/components/schedule/schedule-content";
import { getAdminPageLock } from "@/lib/admin-locks";
import type { TenantSlug } from "@/hooks/get-tenant";

export default async function SchedulePage({
  params,
}: {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}) {
  const { tenant } = await params;

  return (
    <AdminShell title="Schedule">
      {getAdminPageLock(tenant, "schedule") ? (
        <FeatureGateModal reason="locked" />
      ) : (
        <ScheduleContent />
      )}
    </AdminShell>
  );
}
