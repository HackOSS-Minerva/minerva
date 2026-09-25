import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
import AssignmentsContent from "@/components/admin/assignments-page";
import { getAdminPageLock } from "@/lib/admin-locks";
import { getFeatureFlag } from "@/lib/feature-flags";
import type { TenantSlug } from "@/hooks/get-tenant";

export default async function AssignmentsPage({
  params,
}: {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}) {
  const { tenant } = await params;

  return (
    <AdminShell title="Assignments">
      {!getFeatureFlag("assignments") ? (
        <FeatureGateModal reason="disabled" />
      ) : getAdminPageLock(tenant, "assignments") ? (
        <FeatureGateModal reason="locked" />
      ) : (
        <AssignmentsContent />
      )}
    </AdminShell>
  );
}
