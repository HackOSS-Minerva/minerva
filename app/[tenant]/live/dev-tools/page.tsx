import { DevToolsPage } from "@/components/live/dev-tools/dev-tools-page";
import { guardParticipantPage } from "@/lib/require-participant";
import type { TenantSlug } from "@/hooks/get-tenant";

interface DevToolsRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const DevToolsRoute = async ({ params }: DevToolsRouteProps) => {
  const { tenant } = await params;

  // Same guard as the navbar lock: signed-in accepted participants only.
  const locked = await guardParticipantPage(
    tenant,
    `/${tenant}/live/dev-tools`,
  );
  if (locked) {
    return locked;
  }

  return <DevToolsPage tenant={tenant} />;
};

export default DevToolsRoute;
