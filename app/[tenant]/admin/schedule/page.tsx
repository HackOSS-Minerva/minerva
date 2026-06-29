import { AppSidebar } from "@/components/dashboards/sidebar";
import { SiteHeader } from "@/components/dashboards/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ScheduleContent from "@/components/schedule/schedule-content";

export default function SchedulePage() {
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
        <SiteHeader>Schedule</SiteHeader>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <ScheduleContent />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
