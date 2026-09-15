import { CodeOfConductPage } from "@/components/live/code-of-conduct/code-of-conduct-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SponsorCodeOfConductRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const SponsorCodeOfConductRoute = async ({
  params,
}: SponsorCodeOfConductRouteProps) => {
  const { tenant } = await params;

  return (
    <CodeOfConductPage
      tenant={tenant}
      baseHref={`/${tenant}/sponsor/dashboard`}
    />
  );
};

export default SponsorCodeOfConductRoute;
