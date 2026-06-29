import { PackingListPage } from "@/components/live/packing-list/packing-list-page";
import { withAuth } from "@workos-inc/authkit-nextjs";

interface PackingListRouteProps {
  params: {
    tenant: string;
  };
}

const PackingListRoute = async ({ params }: PackingListRouteProps) => {
  const { tenant } = await params;
  const { user } = await withAuth();

  return <PackingListPage tenant={tenant} />;
};

export default PackingListRoute;