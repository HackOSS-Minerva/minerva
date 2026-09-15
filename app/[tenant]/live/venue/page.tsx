import { VenuePage } from "@/components/live/venue/venue-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface VenueRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const VenueRoute = async ({ params }: VenueRouteProps) => {
  const { tenant } = await params;

  return <VenuePage tenant={tenant} />;
};

export default VenueRoute;
