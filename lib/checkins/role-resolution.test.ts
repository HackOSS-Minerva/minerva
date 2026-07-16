import assert from "node:assert/strict";
import test from "node:test";
import { aggregateEventAnalytics } from "../analytics/aggregate.ts";
import { resolveCanonicalCheckinRole } from "./role-resolution.ts";

test("maps a tenant participant check-in to participant attendance", () => {
  const role = resolveCanonicalCheckinRole({
    email: " Participant@Example.com ",
    participants: [{ email: "participant@example.com" }],
    judges: [],
    speakers: [],
    volunteers: [],
  });

  const analytics = aggregateEventAnalytics({
    participants: [{ status: "ACCEPTED" }],
    judges: [],
    speakers: [],
    volunteers: [],
    checkins: [
      {
        userid: "participant-1",
        role: role.toLowerCase() as "participant",
        timestamp: 0,
      },
    ],
    submissions: [],
    feedback: [],
  });

  assert.equal(role, "PARTICIPANT");
  assert.equal(analytics.attendance.byRole.participant, 1);
  assert.equal(analytics.attendance.acceptanceRate, 1);
});

test("leaves unmatched visitor check-ins unclassified", () => {
  const role = resolveCanonicalCheckinRole({
    email: "guest@example.com",
    participants: [],
    judges: [],
    speakers: [],
    volunteers: [],
  });

  const analytics = aggregateEventAnalytics({
    participants: [],
    judges: [],
    speakers: [],
    volunteers: [],
    checkins: [{ userid: "guest-1", role: null, timestamp: 0 }],
    submissions: [],
    feedback: [],
  });

  assert.equal(role, "VISITOR");
  assert.deepEqual(analytics.attendance.byRole, {
    participant: 0,
    judge: 0,
    speaker: 0,
    volunteer: 0,
  });
});
