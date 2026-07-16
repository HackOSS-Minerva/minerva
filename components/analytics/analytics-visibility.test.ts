import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { EventAnalytics } from "../../lib/analytics/aggregate.ts";
import {
  AdminAnalyticsSummary,
  SponsorAnalyticsSummary,
} from "./analytics-summaries.ts";
import { judgeAnalyticsMetrics } from "./analytics-projections.ts";

const fixture: EventAnalytics & {
  privateEmail: string;
  feedbackDetails: string;
} = {
  applications: {
    participant: { total: 10, pending: 2, accepted: 6, rejected: 2 },
    judge: { total: 4, pending: 1, accepted: 2, rejected: 1 },
    speaker: { total: 3, pending: 0, accepted: 2, rejected: 1 },
    volunteer: { total: 5, pending: 2, accepted: 2, rejected: 1 },
  },
  participants: { accepted: 6 },
  attendance: {
    uniqueParticipants: 8,
    acceptanceRate: 1,
    byRole: { participant: 6, judge: 1, speaker: 1, volunteer: 0 },
    byDay: [{ day: "2026-07-14", total: 8 }],
  },
  projects: {
    total: 3,
    byVetting: { verified: 1, needs_review: 1, disqualified: 1 },
  },
  speakers: { total: 3, pending: 0, accepted: 2, rejected: 1 },
  feedback: { responseCount: 4, averageRating: 4.5 },
  privateEmail: "private@example.com",
  feedbackDetails: "The private@example.com feedback should never render.",
};

test("sponsor summary renders aggregates without sensitive fields", () => {
  const html = renderToStaticMarkup(
    createElement(SponsorAnalyticsSummary, { analytics: fixture }),
  );

  assert.match(html, /Accepted participants/);
  assert.match(html, /Projects submitted/);
  assert.doesNotMatch(
    html,
    /private@example\.com|feedback details|email|gender/i,
  );
});

test("admin summary renders application and feedback summaries", () => {
  const html = renderToStaticMarkup(
    createElement(AdminAnalyticsSummary, { analytics: fixture }),
  );

  assert.match(html, /Participant application status/);
  assert.match(html, /Feedback summary/);
  assert.match(html, /Feedback responses/);
  assert.match(html, /<thead>/);
  assert.match(html, />Metric</);
  assert.match(html, />Count</);
});

test("judge analytics omits personal assignment progress", () => {
  const labels = judgeAnalyticsMetrics(fixture).map(({ label }) => label);

  assert.ok(!labels.some((label) => /assignment|personal/i.test(label)));
});
