import { CheckinPage } from "@/components/live/checkin/checkin-page";

interface CheckinRouteProps {
  params: {
    tenant: string;
  };
}

const CheckinRoute = async ({ params }: CheckinRouteProps) => {
  const { tenant } = await params;

  return <CheckinPage tenant={tenant} />;
};

export default CheckinRoute;