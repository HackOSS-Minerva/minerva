import { CodeOfConductPage } from "@/components/live/code-of-conduct/code-of-conduct-page";

interface JudgeCodeOfConductRouteProps {
  params: {
    tenant: string;
  };
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
