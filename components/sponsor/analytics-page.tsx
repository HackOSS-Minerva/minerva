"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { trackDashboardViewed } from "@/lib/posthog";
import {
  AnalyticsErrorBoundary,
  AnalyticsState,
} from "@/components/analytics/analytics-state";
import { isEmptyAnalytics } from "@/components/analytics/analytics-projections";
import { SponsorAnalyticsSummary } from "@/components/analytics/analytics-summaries";

interface SponsorAnalyticsPageProps {
  tenant: string;
}

export function AnalyticsPage({ tenant }: SponsorAnalyticsPageProps) {
  useEffect(() => {
    trackDashboardViewed({ tenant, role: "sponsor", dashboard: "sponsor_analytics" });
  }, [tenant]);

  return (
    <AnalyticsErrorBoundary>
      <SponsorAnalyticsContent tenant={tenant} />
    </AnalyticsErrorBoundary>
  );
}

function SponsorAnalyticsContent({ tenant }: SponsorAnalyticsPageProps) {
  const analytics = useQuery(api.analytics.get, { tenant });

  if (analytics === undefined) return <AnalyticsState state="loading" />;
  if (isEmptyAnalytics(analytics)) return <AnalyticsState state="empty" />;

  return <SponsorAnalyticsSummary analytics={analytics} />;
}
