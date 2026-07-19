import { AnalyticsPage } from "@/components/sponsor/analytics-page";

interface AnalyticsRouteProps {
  params: Promise<{
    tenant: string;
  }>;
}

const AnalyticsRoute = async ({ params }: AnalyticsRouteProps) => {
  const { tenant } = await params;

  return <AnalyticsPage tenant={tenant} />;
};

export default AnalyticsRoute;
