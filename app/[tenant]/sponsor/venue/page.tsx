import { VenuePage } from "@/components/live/venue/venue-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SponsorVenueRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const SponsorVenueRoute = async ({ params }: SponsorVenueRouteProps) => {
  const { tenant } = await params;

  return (
    <VenuePage tenant={tenant} baseHref={`/${tenant}/sponsor/dashboard`} />
  );
};

export default SponsorVenueRoute;
