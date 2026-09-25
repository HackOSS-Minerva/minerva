import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
import Dashboard from "@/components/dashboards/dashboard";
import { getAdminPageLock } from "@/lib/admin-locks";
import type { TenantSlug } from "@/hooks/get-tenant";

const DASHBOARD_TITLES: Record<string, string> = {
  participants: "Participants",
  judges: "Judges",
  speakers: "Speakers",
  superadmins: "Superadmins",
  volunteers: "Volunteers",
  attendance: "Attendance",
  feedback: "Feedback",
  submissions: "Submissions",
};

interface PageProps {
  params: Promise<{
    tenant: TenantSlug;
    dashboard: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { tenant, dashboard } = await params;
  const title = DASHBOARD_TITLES[dashboard] ?? "Dashboard";

  return (
    <AdminShell title={title}>
      {getAdminPageLock(tenant, dashboard) ? (
        <FeatureGateModal reason="locked" />
      ) : (
        <Dashboard />
      )}
    </AdminShell>
  );
};

export default Page;
