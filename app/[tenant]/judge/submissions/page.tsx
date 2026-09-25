import { JudgeSubmissionsDashboard } from "@/components/judge/judge-submissions-dashboard";
import type { TenantSlug } from "@/hooks/get-tenant";

interface SubmissionsRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const SubmissionsRoute = async ({ params }: SubmissionsRouteProps) => {
  const { tenant } = await params;

  return <JudgeSubmissionsDashboard tenant={tenant} />;
};

export default SubmissionsRoute;
