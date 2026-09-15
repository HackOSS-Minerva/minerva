import { VenuePage } from "@/components/live/venue/venue-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface JudgeVenueRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const JudgeVenueRoute = async ({ params }: JudgeVenueRouteProps) => {
  const { tenant } = await params;

  return <VenuePage tenant={tenant} baseHref={`/${tenant}/judge/dashboard`} />;
};

export default JudgeVenueRoute;
