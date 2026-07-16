export const EVENT_TIME_ZONE = "America/Los_Angeles";

export type Role = "participant" | "judge" | "speaker" | "volunteer";
export type Status = "PENDING" | "ACCEPTED" | "REJECTED";
export type VettingState = "verified" | "needs_review" | "disqualified";

export type ApplicationRecord = { status: Status };
export type CheckinRecord = {
  userid: string;
  role: Role | null;
  timestamp: number;
};
export type SubmissionRecord = { vetted: VettingState };
export type FeedbackRecord = { rating: number };

export type EventAnalyticsInput = {
  participants: ApplicationRecord[];
  judges: ApplicationRecord[];
  speakers: ApplicationRecord[];
  volunteers: ApplicationRecord[];
  checkins: CheckinRecord[];
  submissions: SubmissionRecord[];
  feedback: FeedbackRecord[];
};

type ApplicationTotals = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
};

export type EventAnalytics = {
  applications: Record<Role, ApplicationTotals>;
  participants: { accepted: number };
  attendance: {
    uniqueParticipants: number;
    acceptanceRate: number | null;
    byRole: Record<Role, number>;
    byDay: Array<{ day: string; total: number }>;
  };
  projects: {
    total: number;
    byVetting: Record<VettingState, number>;
  };
  speakers: ApplicationTotals;
  feedback: { responseCount: number; averageRating: number | null };
};

const roles: Role[] = ["participant", "judge", "speaker", "volunteer"];
const vettingStates: VettingState[] = [
  "verified",
  "needs_review",
  "disqualified",
];

export function eventDay(timestamp: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

function emptyApplicationTotals(): ApplicationTotals {
  return { total: 0, pending: 0, accepted: 0, rejected: 0 };
}

function applicationTotals(records: ApplicationRecord[]): ApplicationTotals {
  return records.reduce((totals, { status }) => {
    totals.total += 1;
    totals[status.toLowerCase() as "pending" | "accepted" | "rejected"] += 1;
    return totals;
  }, emptyApplicationTotals());
}

export function aggregateEventAnalytics(
  input: EventAnalyticsInput,
): EventAnalytics {
  const applications = {
    participant: applicationTotals(input.participants),
    judge: applicationTotals(input.judges),
    speaker: applicationTotals(input.speakers),
    volunteer: applicationTotals(input.volunteers),
  };
  const byRole = Object.fromEntries(roles.map((role) => [role, 0])) as Record<
    Role,
    number
  >;
  const seenCheckins = new Set<string>();
  const days = new Map<string, { total: number; firstTimestamp: number }>();

  for (const checkin of input.checkins) {
    if (seenCheckins.has(checkin.userid)) continue;
    seenCheckins.add(checkin.userid);
    if (checkin.role && roles.includes(checkin.role)) {
      byRole[checkin.role] += 1;
    }

    const day = eventDay(checkin.timestamp);
    const existingDay = days.get(day);
    if (existingDay) {
      existingDay.total += 1;
      existingDay.firstTimestamp = Math.min(
        existingDay.firstTimestamp,
        checkin.timestamp,
      );
    } else {
      days.set(day, { total: 1, firstTimestamp: checkin.timestamp });
    }
  }

  const byVetting = Object.fromEntries(
    vettingStates.map((state) => [state, 0]),
  ) as Record<VettingState, number>;
  for (const submission of input.submissions) byVetting[submission.vetted] += 1;

  const responseCount = input.feedback.length;
  const averageRating = responseCount
    ? input.feedback.reduce((sum, feedback) => sum + feedback.rating, 0) /
      responseCount
    : null;

  return {
    applications,
    participants: { accepted: applications.participant.accepted },
    attendance: {
      uniqueParticipants: seenCheckins.size,
      acceptanceRate: applications.participant.accepted
        ? byRole.participant / applications.participant.accepted
        : null,
      byRole,
      byDay: [...days.entries()]
        .sort(
          ([, left], [, right]) => left.firstTimestamp - right.firstTimestamp,
        )
        .map(([day, value]) => ({ day, total: value.total })),
    },
    projects: { total: input.submissions.length, byVetting },
    speakers: applications.speaker,
    feedback: { responseCount, averageRating },
  };
}
