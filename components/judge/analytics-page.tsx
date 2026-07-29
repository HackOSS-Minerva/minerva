import { AnalyticsPage as SharedAnalyticsPage } from "@/components/analytics/analytics-page";

interface JudgeAnalyticsPageProps {
  tenant: string;
}

export function AnalyticsPage({ tenant }: JudgeAnalyticsPageProps) {
  return <SharedAnalyticsPage tenant={tenant} scope="shared" />;
}
