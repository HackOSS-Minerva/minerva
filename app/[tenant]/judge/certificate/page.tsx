import { CertificatePage } from "@/components/judge/certificate-page";

interface CertificateRouteProps {
  params: {
    tenant: string;
  };
}

const CertificateRoute = async ({ params }: CertificateRouteProps) => {
  const { tenant } = await params;

  return <CertificatePage tenant={tenant} />;
};

export default CertificateRoute;
