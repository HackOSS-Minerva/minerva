import { createElement } from "react";
import type { EventAnalytics } from "../../lib/analytics/aggregate.ts";
import {
  adminAnalyticsSections,
  sponsorAnalyticsMetrics,
} from "./analytics-projections.ts";
import { MetricCard } from "./metric-card.ts";
import { StatusBreakdown } from "./status-breakdown.ts";

type SummaryProps = { analytics: EventAnalytics };

export function SponsorAnalyticsSummary({ analytics }: SummaryProps) {
  return createElement(
    "section",
    { className: "space-y-6", "aria-labelledby": "sponsor-analytics" },
    createElement(
      "div",
      { className: "flex flex-col gap-1" },
      createElement(
        "h1",
        { id: "sponsor-analytics", className: "text-2xl font-bold" },
        "Hackathon Analytics",
      ),
      createElement(
        "p",
        { className: "text-sm text-muted-foreground" },
        "High-level event statistics and insights.",
      ),
    ),
    metricList(sponsorAnalyticsMetrics(analytics)),
  );
}

export function AdminAnalyticsSummary({ analytics }: SummaryProps) {
  const sections = adminAnalyticsSections(analytics);

  return createElement(
    "section",
    { className: "space-y-6", "aria-labelledby": "admin-analytics" },
    createElement(
      "div",
      null,
      createElement(
        "h1",
        { id: "admin-analytics", className: "text-2xl font-bold" },
        "Event analytics",
      ),
      createElement(
        "p",
        { className: "text-sm text-muted-foreground" },
        "Aggregate event activity and operational status.",
      ),
    ),
    metricList([
      {
        label: "Total applications",
        value: Object.values(analytics.applications).reduce(
          (total, applications) => total + applications.total,
          0,
        ),
      },
      {
        label: "Accepted participants",
        value: analytics.participants.accepted,
      },
      {
        label: "Checked-in participants",
        value: analytics.attendance.byRole.participant,
      },
      { label: "Projects submitted", value: analytics.projects.total },
    ]),
    createElement(
      "div",
      { className: "grid gap-4 lg:grid-cols-2" },
      ...sections.map((section) => statusTable(section.title, section.rows)),
      statusTable(
        "Attendance by Pacific event day",
        analytics.attendance.byDay.length
          ? analytics.attendance.byDay.map(({ day, total }) => ({
              label: day,
              value: total,
            }))
          : [{ label: "No check-ins yet", value: 0 }],
      ),
    ),
  );
}

function metricList(metrics: Array<{ label: string; value: number | string }>) {
  return createElement(
    "div",
    { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4" },
    ...metrics.map((metric) =>
      createElement(MetricCard, { key: metric.label, ...metric }),
    ),
  );
}

function statusTable(
  title: string,
  rows: Array<{ label: string; value: number | string }>,
) {
  return createElement(StatusBreakdown, { key: title, title, rows });
}
