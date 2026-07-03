import { PackingListPage } from "@/components/live/packing-list/packing-list-page";

interface PackingListRouteProps {
  params: {
    tenant: string;
  };
}

const PackingListRoute = async ({ params }: PackingListRouteProps) => {
  const { tenant } = await params;

  return <PackingListPage tenant={tenant} />;
};

export default PackingListRoute;