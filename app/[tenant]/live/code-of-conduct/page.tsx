import { CodeOfConductPage } from "@/components/live/code-of-conduct/code-of-conduct-page";

interface CodeOfConductRouteProps {
  params: {
    tenant: string;
  };
}

const CodeOfConductRoute = async ({ params }: CodeOfConductRouteProps) => {
  const { tenant } = await params;

  return <CodeOfConductPage tenant={tenant} />;
};

export default CodeOfConductRoute;