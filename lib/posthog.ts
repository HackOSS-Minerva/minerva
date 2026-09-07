import posthog from "posthog-js";

export type AnalyticsRole =
  | "participant"
  | "judge"
  | "speaker"
  | "superadmin"
  | "volunteer";

export type ApplicationStatus = "PENDING" | "ACCEPTANCE" | "REJECTION";

export type AnalyticsEvent =
  | "application_created"
  | "application_status_changed"
  | "application_deleted"
  | "checkin_created"
  | "checkin_deleted"
  | "submission_created"
  | "submission_deleted";

export type AnalyticsEventProperties = {
  tenant: string;
  entity_id: string;
  role?: AnalyticsRole;
  status?: ApplicationStatus;
  user_id?: string;
  event_id?: string;
  gender?: string;
  dietrestriction?: string;
  shirt?: string;
  school?: string;
  major?: string;
  age?: string;
  grade?: string;
};

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

type HogQLResponse = {
  results?: unknown[][];
};

const analyticsRoles: AnalyticsRole[] = [
  "participant",
  "judge",
  "speaker",
  "superadmin",
  "volunteer",
];

const participantDemographicKeys: ParticipantDemographicKey[] = [
  "gender",
  "dietrestriction",
  "shirt",
  "school",
  "major",
  "age",
  "grade",
];

const emptyStatusCounts = (): StatusCounts => ({
  total: 0,
  pending: 0,
  accepted: 0,
  rejected: 0,
});

const emptyParticipantDemographics = (): ParticipantDemographics => ({
  gender: [],
  dietrestriction: [],
  shirt: [],
  school: [],
  major: [],
  age: [],
  grade: [],
});

export function captureAnalyticsEvent(
  event: AnalyticsEvent,
  properties: AnalyticsEventProperties,
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

async function queryPostHog(query: string): Promise<HogQLResponse> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = (
    process.env.POSTHOG_API_HOST ?? "https://us.posthog.com"
  ).replace(/\/$/, "");

  if (!apiKey || !projectId) {
    throw new Error("PostHog query credentials are not configured");
  }

  const response = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PostHog query failed with status ${response.status}`);
  }

  return response.json();
}

const toCount = (value: unknown) => {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
};

export async function getPostHogAnalytics(
  tenant: string,
): Promise<AnalyticsData> {
  if (!/^[a-z0-9-]+$/.test(tenant)) {
    throw new Error("Invalid analytics tenant");
  }

  const applicationQuery = `
    SELECT role, status, count()
    FROM (
      SELECT
        properties.entity_id AS entity_id,
        argMax(properties.role, timestamp) AS role,
        argMax(properties.status, timestamp) AS status,
        argMax(event, timestamp) AS latest_event
      FROM events
      WHERE properties.tenant = '${tenant}'
        AND event IN (
          'application_created',
          'application_status_changed',
          'application_deleted'
        )
      GROUP BY properties.entity_id
    )
    WHERE latest_event != 'application_deleted'
    GROUP BY role, status
    ORDER BY role, status
  `;

  const activityQuery = `
    SELECT entity_type, count(), uniq(user_id)
    FROM (
      SELECT
        properties.entity_id AS entity_id,
        if(event LIKE 'checkin_%', 'checkin', 'submission') AS entity_type,
        argMax(event, timestamp) AS latest_event,
        argMax(properties.user_id, timestamp) AS user_id
      FROM events
      WHERE properties.tenant = '${tenant}'
        AND event IN (
          'checkin_created',
          'checkin_deleted',
          'submission_created',
          'submission_deleted'
        )
      GROUP BY properties.entity_id, entity_type
    )
    WHERE latest_event IN ('checkin_created', 'submission_created')
    GROUP BY entity_type
    ORDER BY entity_type
  `;

  const participantDemographicsQuery = `
    SELECT
      demographic.1 AS dimension,
      demographic.2 AS value,
      count()
    FROM (
      SELECT
        properties.entity_id AS entity_id,
        argMax(event, timestamp) AS latest_event,
        argMax(properties.role, timestamp) AS role,
        argMaxIf(
          properties.gender,
          timestamp,
          event = 'application_created'
        ) AS gender,
        argMaxIf(
          properties.dietrestriction,
          timestamp,
          event = 'application_created'
        ) AS dietrestriction,
        argMaxIf(
          properties.shirt,
          timestamp,
          event = 'application_created'
        ) AS shirt,
        argMaxIf(
          properties.school,
          timestamp,
          event = 'application_created'
        ) AS school,
        argMaxIf(
          properties.major,
          timestamp,
          event = 'application_created'
        ) AS major,
        argMaxIf(
          properties.age,
          timestamp,
          event = 'application_created'
        ) AS age,
        argMaxIf(
          properties.grade,
          timestamp,
          event = 'application_created'
        ) AS grade
      FROM events
      WHERE properties.tenant = '${tenant}'
        AND event IN (
          'application_created',
          'application_status_changed',
          'application_deleted'
        )
      GROUP BY properties.entity_id
    )
    ARRAY JOIN [
      tuple('gender', gender),
      tuple('dietrestriction', dietrestriction),
      tuple('shirt', shirt),
      tuple('school', school),
      tuple('major', major),
      tuple('age', age),
      tuple('grade', grade)
    ] AS demographic
    WHERE latest_event != 'application_deleted'
      AND role = 'participant'
      AND demographic.2 != ''
    GROUP BY dimension, value
    ORDER BY dimension, count() DESC, value
  `;

  const [
    applicationResponse,
    activityResponse,
    participantDemographicsResponse,
  ] = await Promise.all([
    queryPostHog(applicationQuery),
    queryPostHog(activityQuery),
    queryPostHog(participantDemographicsQuery),
  ]);

  const byRole = Object.fromEntries(
    analyticsRoles.map((role) => [role, emptyStatusCounts()]),
  ) as Record<AnalyticsRole, StatusCounts>;

  for (const row of applicationResponse.results ?? []) {
    const role = row[0];
    const status = row[1];
    const count = toCount(row[2]);

    if (!analyticsRoles.includes(role as AnalyticsRole)) continue;

    const roleCounts = byRole[role as AnalyticsRole];
    roleCounts.total += count;

    if (status === "PENDING") roleCounts.pending += count;
    if (status === "ACCEPTANCE") roleCounts.accepted += count;
    if (status === "REJECTION") roleCounts.rejected += count;
  }

  const applicationTotals = analyticsRoles.reduce(
    (totals, role) => ({
      total: totals.total + byRole[role].total,
      accepted: totals.accepted + byRole[role].accepted,
    }),
    { total: 0, accepted: 0 },
  );

  const participantDemographicCounts = Object.fromEntries(
    participantDemographicKeys.map((key) => [key, new Map<string, number>()]),
  ) as Record<ParticipantDemographicKey, Map<string, number>>;

  for (const row of participantDemographicsResponse.results ?? []) {
    const key = row[0];
    const value = typeof row[1] === "string" ? row[1].trim() : "";
    const count = toCount(row[2]);

    if (
      !participantDemographicKeys.includes(key as ParticipantDemographicKey) ||
      !value
    ) {
      continue;
    }

    const counts =
      participantDemographicCounts[key as ParticipantDemographicKey];
    counts.set(value, count);
  }

  const participantDemographics = emptyParticipantDemographics();

  for (const key of participantDemographicKeys) {
    const counts = participantDemographicCounts[key];
    const total = Array.from(counts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    participantDemographics[key] = Array.from(counts.entries())
      .map(([value, count]) => ({
        value,
        count,
        percentage:
          total === 0 ? 0 : Number(((count / total) * 100).toFixed(1)),
      }))
      .sort(
        (left, right) =>
          right.count - left.count || left.value.localeCompare(right.value),
      );
  }

  let activeParticipants = 0;
  let submissions = 0;

  for (const row of activityResponse.results ?? []) {
    if (row[0] === "checkin") {
      activeParticipants = toCount(row[2]);
    }

    if (row[0] === "submission") {
      submissions = toCount(row[1]);
    }
  }

  return {
    applications: {
      ...applicationTotals,
      byRole,
      participantDemographics,
    },
    checkins: {
      activeParticipants,
    },
    submissions: {
      total: submissions,
    },
  };
}
