import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregateEventAnalytics,
  type EventAnalytics,
  type EventAnalyticsInput,
  type Role,
} from "./aggregate.ts";

const fixture: EventAnalyticsInput = {
  participants: [{ status: "ACCEPTED" }, { status: "PENDING" }],
  judges: [{ status: "REJECTED" }],
  speakers: [{ status: "ACCEPTED" }],
  volunteers: [{ status: "PENDING" }],
  checkins: [
    {
      userid: "participant-1",
      role: "participant",
      timestamp: Date.UTC(2026, 6, 14, 7),
    },
    {
      userid: "participant-1",
      role: "participant",
      timestamp: Date.UTC(2026, 6, 14, 8),
    },
    { userid: "judge-1", role: "judge", timestamp: Date.UTC(2026, 6, 14, 8) },
  ],
  submissions: [{ vetted: "verified" }, { vetted: "needs_review" }],
  feedback: [{ rating: 4 }, { rating: 5 }],
};

const zeroAnalytics: EventAnalytics = {
  applications: {
    participant: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    judge: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    speaker: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    volunteer: { total: 0, pending: 0, accepted: 0, rejected: 0 },
  },
  participants: { accepted: 0 },
  attendance: {
    uniqueParticipants: 0,
    acceptanceRate: null,
    byRole: { participant: 0, judge: 0, speaker: 0, volunteer: 0 },
    byDay: [],
  },
  projects: {
    total: 0,
    byVetting: { verified: 0, needs_review: 0, disqualified: 0 },
  },
  speakers: { total: 0, pending: 0, accepted: 0, rejected: 0 },
  feedback: { responseCount: 0, averageRating: null },
};

test("aggregates unique attendance and role status totals", () => {
  const result = aggregateEventAnalytics(fixture);

  assert.deepEqual(result.applications, {
    participant: { total: 2, pending: 1, accepted: 1, rejected: 0 },
    judge: { total: 1, pending: 0, accepted: 0, rejected: 1 },
    speaker: { total: 1, pending: 0, accepted: 1, rejected: 0 },
    volunteer: { total: 1, pending: 1, accepted: 0, rejected: 0 },
  });
  assert.equal(result.participants.accepted, 1);
  assert.equal(result.attendance.uniqueParticipants, 2);
  assert.equal(result.attendance.acceptanceRate, 1);
  assert.deepEqual(result.attendance.byRole, {
    participant: 1,
    judge: 1,
    speaker: 0,
    volunteer: 0,
  });
  assert.deepEqual(result.attendance.byDay, [{ day: "2026-07-14", total: 2 }]);
  assert.equal(result.projects.total, 2);
  assert.deepEqual(result.projects.byVetting, {
    verified: 1,
    needs_review: 1,
    disqualified: 0,
  });
  assert.deepEqual(result.speakers, {
    total: 1,
    pending: 0,
    accepted: 1,
    rejected: 0,
  });
  assert.equal(result.feedback.responseCount, 2);
  assert.equal(result.feedback.averageRating, 4.5);
});

test("groups attendance days in Pacific time", () => {
  const result = aggregateEventAnalytics({
    ...fixture,
    checkins: [
      {
        userid: "participant-1",
        role: "participant",
        timestamp: Date.UTC(2026, 6, 14, 6, 59),
      },
      { userid: "judge-1", role: "judge", timestamp: Date.UTC(2026, 6, 14, 7) },
    ],
  });

  assert.deepEqual(result.attendance.byDay, [
    { day: "2026-07-13", total: 1 },
    { day: "2026-07-14", total: 1 },
  ]);
});

test("counts unknown-role check-ins in attendance without classifying them", () => {
  const result = aggregateEventAnalytics({
    ...fixture,
    checkins: [
      {
        userid: "visitor-1",
        role: "visitor" as Role,
        timestamp: Date.UTC(2026, 6, 14, 8),
      },
      {
        userid: "visitor-1",
        role: "visitor" as Role,
        timestamp: Date.UTC(2026, 6, 14, 9),
      },
    ],
  });

  assert.equal(result.attendance.uniqueParticipants, 1);
  assert.deepEqual(result.attendance.byRole, {
    participant: 0,
    judge: 0,
    speaker: 0,
    volunteer: 0,
  });
  assert.deepEqual(result.attendance.byDay, [{ day: "2026-07-14", total: 1 }]);
});

test("returns a zero-safe payload for an empty tenant", () => {
  assert.deepEqual(
    aggregateEventAnalytics({
      participants: [],
      judges: [],
      speakers: [],
      volunteers: [],
      checkins: [],
      submissions: [],
      feedback: [],
    }),
    zeroAnalytics,
  );
});
