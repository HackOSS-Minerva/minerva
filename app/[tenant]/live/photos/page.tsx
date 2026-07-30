import { CurrentPhotosPage } from "@/components/photos/current-photos-page";

interface PhotosRouteProps {
  params: Promise<{
    tenant: string;
  }>;
}

export default async function PhotosRoute({ params }: PhotosRouteProps) {
  const { tenant } = await params;

  return <CurrentPhotosPage tenant={tenant} mode="participant" />;
}
