import { CodeOfConductPage } from "@/components/live/code-of-conduct/code-of-conduct-page";
import { withAuth } from "@workos-inc/authkit-nextjs";

interface CodeOfConductRouteProps {
  params: {
    tenant: string;
  };
}

const CodeOfConductRoute = async ({ params }: CodeOfConductRouteProps) => {
  const { tenant } = await params;
  const { user } = await withAuth();

  return <CodeOfConductPage tenant={tenant} />;
};

export default CodeOfConductRoute;