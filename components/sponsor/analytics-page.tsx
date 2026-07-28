import { AnalyticsPage as SharedAnalyticsPage } from "@/components/analytics/analytics-page";

interface SponsorAnalyticsPageProps {
  tenant: string;
}

export function AnalyticsPage({ tenant }: SponsorAnalyticsPageProps) {
  return <SharedAnalyticsPage tenant={tenant} audience="sponsor" />;
}
