import { VenuePage } from "@/components/portal/pages/venue-page";
import { guardParticipantPage } from "@/lib/require-participant";
import type { TenantSlug } from "@/hooks/get-tenant";

interface VenueRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const VenueRoute = async ({ params }: VenueRouteProps) => {
  const { tenant } = await params;

  // Same guard as the navbar lock: signed-in accepted participants only.
  const locked = await guardParticipantPage(tenant, `/${tenant}/live/venue`);
  if (locked) {
    return locked;
  }

  return <VenuePage tenant={tenant} />;
};

export default VenueRoute;
