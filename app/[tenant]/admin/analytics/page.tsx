import { AdminAnalyticsPage } from "@/components/analytics/admin-analytics-page";
import { resolveAdminAnalyticsRouteProps } from "./route-contract";

export default async function AnalyticsRoute({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const routeProps = await resolveAdminAnalyticsRouteProps(params);

  return <AdminAnalyticsPage {...routeProps} />;
}
