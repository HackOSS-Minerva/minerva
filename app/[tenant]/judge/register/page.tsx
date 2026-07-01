import { RegisterPage } from "@/components/judge/register-page";

interface RegisterRouteProps {
  params: {
    tenant: string;
  };
}

const RegisterRoute = async ({ params }: RegisterRouteProps) => {
  const { tenant } = await params;

  return <RegisterPage tenant={tenant} />;
};

export default RegisterRoute;
