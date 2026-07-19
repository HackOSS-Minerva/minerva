"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { trackDashboardViewed } from "@/lib/posthog";
import type { EventAnalytics } from "@/lib/analytics/aggregate";
import { AnalyticsErrorBoundary, AnalyticsState } from "./analytics-state";
import {
  isEmptyAnalytics,
  judgeAnalyticsMetrics,
} from "./analytics-projections";
import { MetricCard } from "./metric-card";

type JudgeAnalyticsSectionProps = { tenant: string };

export function JudgeAnalyticsSection({ tenant }: JudgeAnalyticsSectionProps) {
  useEffect(() => {
    trackDashboardViewed({ tenant, role: "judge", dashboard: "judge_analytics" });
  }, [tenant]);

  return (
    <AnalyticsErrorBoundary>
      <JudgeAnalyticsContent tenant={tenant} />
    </AnalyticsErrorBoundary>
  );
}

function JudgeAnalyticsContent({ tenant }: JudgeAnalyticsSectionProps) {
  const analytics = useQuery(api.analytics.get, { tenant });

  if (analytics === undefined) return <AnalyticsState state="loading" />;
  if (isEmptyAnalytics(analytics)) return <AnalyticsState state="empty" />;

  return <JudgeAnalyticsSummary analytics={analytics} />;
}

export function JudgeAnalyticsSummary({
  analytics,
}: {
  analytics: EventAnalytics;
}) {
  return (
    <section aria-labelledby="judge-event-analytics" className="space-y-4">
      <div>
        <h2 id="judge-event-analytics" className="text-xl font-bold">
          Event overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Event-wide totals for judging context.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {judgeAnalyticsMetrics(analytics).map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
        Personal assignment progress will appear when persistent assignments
        launch.
      </p>
    </section>
  );
}
