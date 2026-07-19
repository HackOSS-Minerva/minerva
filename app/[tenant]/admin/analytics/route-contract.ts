export type AdminAnalyticsRouteProps = {
  tenant: string;
};

export async function resolveAdminAnalyticsRouteProps(
  params: Promise<{ tenant: string }>,
): Promise<AdminAnalyticsRouteProps> {
  const { tenant } = await params;

  return { tenant };
}
