import { AppSidebar } from "@/components/dashboards/sidebar";
import { SiteHeader } from "@/components/dashboards/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AssignmentsContent from "@/components/admin/assignments-page";

export default function AssignmentsPage() {
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
        <SiteHeader>Assignments</SiteHeader>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex py-4 md:gap-6 md:py-6">
              <AssignmentsContent />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
