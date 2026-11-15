import type { AnalyticsCapture } from "@/lib/analytics-schema";

export type AnalyticsEvent = AnalyticsCapture["event"];
export type AnalyticsEventProperties = AnalyticsCapture["properties"];
export type AnalyticsRole = NonNullable<AnalyticsEventProperties["role"]>;
export type ApplicationStatus = NonNullable<AnalyticsEventProperties["status"]>;

export function captureAnalyticsEvent(event: AnalyticsEvent, properties: AnalyticsEventProperties) {
  if (typeof window === "undefined") return;

  // Best-effort browser delivery: analytics failure must not fail the database operation.
  void fetch("/api/analytics/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ event, properties }),
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Analytics capture failed (${response.status})`);
    })
    .catch(() => {
      console.warn("Analytics event delivery failed", { event, tenant: properties.tenant });
    });
}

export type StatusCounts = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
};

export type ParticipantDemographicKey =
  | "gender"
  | "dietrestriction"
  | "shirt"
  | "school"
  | "major"
  | "age"
  | "grade";

export type ParticipantDemographicBreakdown = {
  value: string;
  count: number;
  percentage: number;
};

export type ParticipantDemographics = Record<
  ParticipantDemographicKey,
  ParticipantDemographicBreakdown[]
>;

export type AnalyticsData = {
  applications: {
    total: number;
    accepted: number;
    byRole: Record<AnalyticsRole, StatusCounts>;
    participantDemographics: ParticipantDemographics;
  };
  checkins: {
    activeParticipants: number;
  };
  submissions: {
    total: number;
  };
};
