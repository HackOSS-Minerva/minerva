"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { trackDashboardViewed } from "@/lib/posthog";
import { AnalyticsErrorBoundary, AnalyticsState } from "./analytics-state";
import { isEmptyAnalytics } from "./analytics-projections";
import { AdminAnalyticsSummary } from "./analytics-summaries";

export { AdminAnalyticsSummary } from "./analytics-summaries";

type AdminAnalyticsPageProps = { tenant: string };

export function AdminAnalyticsPage({ tenant }: AdminAnalyticsPageProps) {
  useEffect(() => {
    trackDashboardViewed({ tenant, role: "superadmin", dashboard: "admin_analytics" });
  }, [tenant]);

  return (
    <AnalyticsErrorBoundary>
      <AdminAnalyticsContent tenant={tenant} />
    </AnalyticsErrorBoundary>
  );
}

function AdminAnalyticsContent({ tenant }: AdminAnalyticsPageProps) {
  const analytics = useQuery(api.analytics.get, { tenant });

  if (analytics === undefined) return <AnalyticsState state="loading" />;
  if (isEmptyAnalytics(analytics)) return <AnalyticsState state="empty" />;

  return <AdminAnalyticsSummary analytics={analytics} />;
}
