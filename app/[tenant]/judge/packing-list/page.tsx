import { PackingListPage } from "@/components/live/packing-list/packing-list-page";

interface JudgePackingListRouteProps {
  params: {
    tenant: string;
  };
}

const JudgePackingListRoute = async ({
  params,
}: JudgePackingListRouteProps) => {
  const { tenant } = await params;

  return (
    <PackingListPage tenant={tenant} baseHref={`/${tenant}/judge/dashboard`} />
  );
};

export default JudgePackingListRoute;
