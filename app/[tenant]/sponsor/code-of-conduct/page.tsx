import { CodeOfConductPage } from "@/components/live/code-of-conduct/code-of-conduct-page";

interface SponsorCodeOfConductRouteProps {
  params: {
    tenant: string;
  };
}

const SponsorCodeOfConductRoute = async ({
  params,
}: SponsorCodeOfConductRouteProps) => {
  const { tenant } = await params;

  return (
    <CodeOfConductPage
      tenant={tenant}
      baseHref={`/${tenant}/sponsor/dashboard`}
    />
  );
};

export default SponsorCodeOfConductRoute;
