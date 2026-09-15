import { CodeOfConductPage } from "@/components/live/code-of-conduct/code-of-conduct-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface CodeOfConductRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const CodeOfConductRoute = async ({ params }: CodeOfConductRouteProps) => {
  const { tenant } = await params;

  return <CodeOfConductPage tenant={tenant} />;
};

export default CodeOfConductRoute;
