import { VenuePage } from "@/components/live/venue/venue-page";

interface JudgeVenueRouteProps {
  params: {
    tenant: string;
  };
}

const JudgeVenueRoute = async ({ params }: JudgeVenueRouteProps) => {
  const { tenant } = await params;

  return <VenuePage tenant={tenant} baseHref={`/${tenant}/judge/dashboard`} />;
};

export default JudgeVenueRoute;
