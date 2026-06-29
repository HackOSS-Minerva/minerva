import { VenuePage } from "@/components/live/venue/venue-page";
import { withAuth } from "@workos-inc/authkit-nextjs";

interface VenueRouteProps {
  params: {
    tenant: string;
  };
}

const VenueRoute = async ({ params }: VenueRouteProps) => {
  const { tenant } = await params;
  const { user } = await withAuth();

  return <VenuePage tenant={tenant} />;
};

export default VenueRoute;