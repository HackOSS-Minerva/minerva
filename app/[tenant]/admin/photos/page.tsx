import { AppSidebar } from "@/components/dashboards/sidebar";
import { SiteHeader } from "@/components/dashboards/header";
import { CurrentPhotosPage } from "@/components/photos/current-photos-page";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AdminPhotosRouteProps {
  params: Promise<{
    tenant: string;
  }>;
}

export default async function AdminPhotosRoute({
  params,
}: AdminPhotosRouteProps) {
  const { tenant } = await params;

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
        <SiteHeader>Photos</SiteHeader>
        <main className="flex-1 px-4 py-6 lg:px-6">
          <CurrentPhotosPage tenant={tenant} mode="admin" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
