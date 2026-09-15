import { CodeOfConductPage } from "@/components/live/code-of-conduct/code-of-conduct-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface JudgeCodeOfConductRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const JudgeCodeOfConductRoute = async ({
  params,
}: JudgeCodeOfConductRouteProps) => {
  const { tenant } = await params;

  return (
    <CodeOfConductPage
      tenant={tenant}
      baseHref={`/${tenant}/judge/dashboard`}
    />
  );
};

export default JudgeCodeOfConductRoute;
