import { PhotosPage } from "@/components/photos/photos-page";
import { getConfiguredPhotoEvent } from "@/lib/photos/google-photos";

interface PhotosRouteProps {
  params: Promise<{ tenant: string }>;
}

const PhotosRoute = async ({ params }: PhotosRouteProps) => {
  const { tenant } = await params;
  const event = getConfiguredPhotoEvent(tenant);

  return <PhotosPage event={event} />;
};

export default PhotosRoute;
