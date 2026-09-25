import { PhotosPage } from "@/components/photos/photos-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AppSidebar } from "@/components/dashboards/sidebar";
import { SiteHeader } from "@/components/dashboards/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getConfiguredPhotoEvent } from "@/lib/google-photos";
import { getFeatureFlag } from "@/lib/feature-flags";
import type { TenantSlug } from "@/hooks/get-tenant";

interface AdminPhotosRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const AdminPhotosRoute = async ({ params }: AdminPhotosRouteProps) => {
  const { tenant } = await params;

  if (!getFeatureFlag("photos")) {
    return <FeatureGateModal reason="locked" />;
  }

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
          <PhotosPage event={getConfiguredPhotoEvent(tenant)} canManage />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminPhotosRoute;
