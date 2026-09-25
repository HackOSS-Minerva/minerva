import { PhotosPage } from "@/components/photos/photos-page";
import { FeatureGateModal } from "@/components/feature-flags/feature-gate-modal";
import { getConfiguredPhotoEvent } from "@/lib/google-photos";
import { getFeatureFlag } from "@/lib/feature-flags";
import type { TenantSlug } from "@/hooks/get-tenant";

interface PhotosRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const PhotosRoute = async ({ params }: PhotosRouteProps) => {
  const { tenant } = await params;

  if (!getFeatureFlag("photos")) {
    return <FeatureGateModal reason="locked" />;
  }

  const event = getConfiguredPhotoEvent(tenant);

  return <PhotosPage event={event} />;
};

export default PhotosRoute;
