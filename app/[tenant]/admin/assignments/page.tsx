import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
import AssignmentsContent from "@/components/admin/assignments-page";
import { getFeatureFlag } from "@/lib/feature-flags";

export default async function AssignmentsPage() {
  return (
    <AdminShell title="Assignments">
      {!getFeatureFlag("assignments") ? (
        <FeatureGateModal reason="disabled" />
      ) : (
        <AssignmentsContent />
      )}
    </AdminShell>
  );
}
