import { AppSidebar } from "@/components/dashboards/sidebar";
import { SiteHeader } from "@/components/dashboards/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Dashboard from "@/components/dashboards/dashboard";

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
  params: {
    dashboard: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { dashboard } = await params;
  const title = DASHBOARD_TITLES[dashboard] ?? "Dashboard";

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader>{title}</SiteHeader>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Dashboard />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Page;
