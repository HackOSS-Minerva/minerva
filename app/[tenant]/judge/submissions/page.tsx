import { SubmissionsPage } from "@/components/judge/submissions-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SubmissionsRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const SubmissionsRoute = async ({ params }: SubmissionsRouteProps) => {
  const { tenant } = await params;

  return <SubmissionsPage tenant={tenant} />;
};

export default SubmissionsRoute;
