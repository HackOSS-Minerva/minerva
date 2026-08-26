import { VenuePage } from "@/components/live/venue/venue-page";

interface SponsorVenueRouteProps {
  params: {
    tenant: string;
  };
}

const SponsorVenueRoute = async ({ params }: SponsorVenueRouteProps) => {
  const { tenant } = await params;

  return (
    <VenuePage tenant={tenant} baseHref={`/${tenant}/sponsor/dashboard`} />
  );
};

export default SponsorVenueRoute;
