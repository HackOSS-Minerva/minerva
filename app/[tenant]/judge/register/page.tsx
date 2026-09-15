import { RegisterPage } from "@/components/judge/register-page";
import type { TenantSlug } from "@/hooks/get-tenant";

interface RegisterRouteProps {
  params: Promise<{
    tenant: TenantSlug;
  }>;
}

const RegisterRoute = async ({ params }: RegisterRouteProps) => {
  const { tenant } = await params;

  return <RegisterPage tenant={tenant} />;
};

export default RegisterRoute;
