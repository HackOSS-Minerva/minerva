import { VenuePage } from "@/components/live/venue/venue-page";

interface VenueRouteProps {
  params: {
    tenant: string;
  };
}

const VenueRoute = async ({ params }: VenueRouteProps) => {
  const { tenant } = await params;

  return <VenuePage tenant={tenant} />;
};

export default VenueRoute;