import { PhotosPage } from "@/components/photos/photos-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { AdminShell } from "@/components/dashboards/admin-shell";
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
    return (
      <AdminShell title="Photos">
        <FeatureGateModal reason="locked" />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Photos">
      <PhotosPage event={getConfiguredPhotoEvent(tenant)} canManage />
    </AdminShell>
  );
};

export default AdminPhotosRoute;
