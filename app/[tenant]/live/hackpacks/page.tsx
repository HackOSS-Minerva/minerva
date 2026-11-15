import { HackpacksPage } from "@/components/live/hackpacks/hackpacks-page";
import { guardParticipantPage } from "@/lib/require-participant";
import type { TenantSlug } from "@/hooks/get-tenant";

interface HackpacksRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const HackpacksRoute = async ({ params }: HackpacksRouteProps) => {
  const { tenant } = await params;

  const locked = await guardParticipantPage(tenant, `/${tenant}/live/hackpacks`);
  if (locked) {
    return locked;
  }

  return <HackpacksPage tenant={tenant} />;
};

export default HackpacksRoute;
