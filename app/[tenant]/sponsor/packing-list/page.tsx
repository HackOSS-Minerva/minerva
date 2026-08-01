import { PackingListPage } from "@/components/live/packing-list/packing-list-page";

interface SponsorPackingListRouteProps {
  params: {
    tenant: string;
  };
}

const SponsorPackingListRoute = async ({
  params,
}: SponsorPackingListRouteProps) => {
  const { tenant } = await params;

  return (
    <PackingListPage
      tenant={tenant}
      baseHref={`/${tenant}/sponsor/dashboard`}
    />
  );
};

export default SponsorPackingListRoute;
