import { ResumeBookPage } from "@/components/sponsor/resume-book-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface ResumeBookRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const ResumeBookRoute = async ({ params }: ResumeBookRouteProps) => {
  const { tenant } = await params;

  return <ResumeBookPage tenant={tenant} />;
};

export default ResumeBookRoute;
