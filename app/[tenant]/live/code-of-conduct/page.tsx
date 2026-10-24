import { CodeOfConductPage } from "@/components/portal/pages/code-of-conduct-page";
import { guardParticipantPage } from "@/lib/require-participant";
import type { TenantSlug } from "@/hooks/get-tenant";

interface CodeOfConductRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const CodeOfConductRoute = async ({ params }: CodeOfConductRouteProps) => {
  const { tenant } = await params;

  // Same guard as the navbar lock: signed-in accepted participants only.
  const locked = await guardParticipantPage(tenant, `/${tenant}/live/code-of-conduct`);
  if (locked) {
    return locked;
  }

  return <CodeOfConductPage tenant={tenant} />;
};

export default CodeOfConductRoute;
