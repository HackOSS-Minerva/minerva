import { CertificatePage } from "@/components/judge/certificate-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface CertificateRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const CertificateRoute = async ({ params }: CertificateRouteProps) => {
  const { tenant } = await params;

  return <CertificatePage tenant={tenant} />;
};

export default CertificateRoute;
