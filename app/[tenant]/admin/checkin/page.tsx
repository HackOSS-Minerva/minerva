import { AdminShell } from "@/components/dashboards/admin-shell";
import CheckinContent from "@/components/checkin/checkin-content";

const CheckinPage = async () => {
  return (
    <AdminShell title="Check-in">
      <CheckinContent />
    </AdminShell>
  );
};

export default CheckinPage;
