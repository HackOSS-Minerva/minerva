import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
import AssignmentsContent from "@/components/admin/assignments-page";
import { getFeatureFlag } from "@/lib/feature-flags";

const AssignmentsPage = () => {
  return (
    <AdminShell title="Assignments">
      {!getFeatureFlag("assignments") ? (
        <FeatureGateModal reason="disabled" />
      ) : (
        <AssignmentsContent />
      )}
    </AdminShell>
  );
};

export default AssignmentsPage;
