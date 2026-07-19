import type { EventAnalytics } from "../../lib/analytics/aggregate";

export type AnalyticsMetric = {
  label: string;
  value: number;
  description?: string;
};

export type AnalyticsSection = {
  title: string;
  rows: Array<{ label: string; value: number | string }>;
};

export function isEmptyAnalytics(analytics: EventAnalytics): boolean {
  const totalApplications = Object.values(analytics.applications).reduce(
    (total, applications) => total + applications.total,
    0,
  );

  return (
    totalApplications === 0 &&
    analytics.attendance.uniqueParticipants === 0 &&
    analytics.projects.total === 0
  );
}

export function sponsorAnalyticsMetrics(
  analytics: EventAnalytics,
): AnalyticsMetric[] {
  return [
    { label: "Total applications", value: totalApplications(analytics) },
    { label: "Accepted participants", value: analytics.participants.accepted },
    {
      label: "Checked-in participants",
      value: analytics.attendance.byRole.participant,
    },
    { label: "Projects submitted", value: analytics.projects.total },
    {
      label: "Verified projects",
      value: analytics.projects.byVetting.verified,
    },
    {
      label: "Projects needing review",
      value: analytics.projects.byVetting.needs_review,
    },
    {
      label: "Disqualified projects",
      value: analytics.projects.byVetting.disqualified,
    },
    { label: "Speaker applications", value: analytics.speakers.total },
  ];
}

export function judgeAnalyticsMetrics(
  analytics: EventAnalytics,
): AnalyticsMetric[] {
  return [
    { label: "Projects submitted", value: analytics.projects.total },
    {
      label: "Verified projects",
      value: analytics.projects.byVetting.verified,
    },
    {
      label: "Projects needing review",
      value: analytics.projects.byVetting.needs_review,
    },
    { label: "Accepted participants", value: analytics.participants.accepted },
    {
      label: "Checked-in participants",
      value: analytics.attendance.byRole.participant,
    },
    { label: "Accepted judges", value: analytics.applications.judge.accepted },
    { label: "Speaker applications", value: analytics.speakers.total },
  ];
}

export function adminAnalyticsSections(
  analytics: EventAnalytics,
): AnalyticsSection[] {
  return [
    {
      title: "Participant application status",
      rows: applicationRows(analytics.applications.participant),
    },
    {
      title: "Judge application status",
      rows: applicationRows(analytics.applications.judge),
    },
    {
      title: "Volunteer application status",
      rows: applicationRows(analytics.applications.volunteer),
    },
    {
      title: "Speaker application status",
      rows: applicationRows(analytics.speakers),
    },
    {
      title: "Attendance by role",
      rows: [
        {
          label: "Participants",
          value: analytics.attendance.byRole.participant,
        },
        { label: "Judges", value: analytics.attendance.byRole.judge },
        { label: "Speakers", value: analytics.attendance.byRole.speaker },
        { label: "Volunteers", value: analytics.attendance.byRole.volunteer },
      ],
    },
    {
      title: "Project vetting",
      rows: [
        { label: "Verified", value: analytics.projects.byVetting.verified },
        {
          label: "Needs review",
          value: analytics.projects.byVetting.needs_review,
        },
        {
          label: "Disqualified",
          value: analytics.projects.byVetting.disqualified,
        },
      ],
    },
    {
      title: "Feedback summary",
      rows: [
        {
          label: "Feedback responses",
          value: analytics.feedback.responseCount,
        },
        {
          label: "Average rating",
          value:
            analytics.feedback.averageRating === null
              ? "No ratings yet"
              : analytics.feedback.averageRating.toFixed(1),
        },
      ],
    },
  ];
}

function totalApplications(analytics: EventAnalytics): number {
  return Object.values(analytics.applications).reduce(
    (total, applications) => total + applications.total,
    0,
  );
}

function applicationRows(application: {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}): AnalyticsSection["rows"] {
  return [
    { label: "Total", value: application.total },
    { label: "Pending", value: application.pending },
    { label: "Accepted", value: application.accepted },
    { label: "Rejected", value: application.rejected },
  ];
}
