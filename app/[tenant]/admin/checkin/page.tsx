import { AdminShell } from "@/components/dashboards/admin-shell";
import CheckinContent from "@/components/checkin/checkin-content";

export default async function CheckinPage() {
  return (
    <AdminShell title="Check-in">
      <CheckinContent />
    </AdminShell>
  );
}
