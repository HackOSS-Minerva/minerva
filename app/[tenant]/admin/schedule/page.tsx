import { AdminShell } from "@/components/dashboards/admin-shell";
import ScheduleContent from "@/components/schedule/schedule-content";

const SchedulePage = async () => {
  return (
    <AdminShell title="Schedule">
      <ScheduleContent />
    </AdminShell>
  );
};

export default SchedulePage;
