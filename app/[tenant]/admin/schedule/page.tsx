import { AdminShell } from "@/components/dashboards/admin-shell";
import ScheduleContent from "@/components/schedule/schedule-content";

export default async function SchedulePage() {
  return (
    <AdminShell title="Schedule">
      <ScheduleContent />
    </AdminShell>
  );
}
