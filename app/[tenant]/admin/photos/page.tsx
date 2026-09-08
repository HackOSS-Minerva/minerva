import { PhotosPage } from "@/components/photos/photos-page";
import { AppSidebar } from "@/components/dashboards/sidebar";
import { SiteHeader } from "@/components/dashboards/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getConfiguredPhotoEvent } from "@/lib/photos/google-photos";

interface AdminPhotosRouteProps {
  params: Promise<{ tenant: string }>;
}

const AdminPhotosRoute = async ({ params }: AdminPhotosRouteProps) => {
  const { tenant } = await params;
  const event = getConfiguredPhotoEvent(tenant);

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
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <PhotosPage event={event} canManage />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminPhotosRoute;
