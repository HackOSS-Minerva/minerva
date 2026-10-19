import { TeamsPage } from "@/components/live/teams/teams-page";
import { guardParticipantPage } from "@/lib/require-participant";
import type { TenantSlug } from "@/hooks/get-tenant";

interface TeamsRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const TeamsRoute = async ({ params }: TeamsRouteProps) => {
  const { tenant } = await params;

  // Same guard as the navbar lock: signed-in accepted participants only.
  const locked = await guardParticipantPage(tenant, `/${tenant}/live/teams`);
  if (locked) {
    return locked;
  }

  return <TeamsPage tenant={tenant} />;
};

export default TeamsRoute;
