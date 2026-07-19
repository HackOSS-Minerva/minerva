import { v } from "convex/values";
import {
  aggregateEventAnalytics,
  type Role,
  type Status,
} from "../lib/analytics/aggregate";
import { query } from "./_generated/server";

const roles: Role[] = ["participant", "judge", "speaker", "volunteer"];

function roleFromCheckin(value: string): Role | null {
  const role = value.toLowerCase() as Role;
  return roles.includes(role) ? role : null;
}

function statusFromApplication(
  value: "ACCEPTANCE" | "PENDING" | "REJECTION",
): Status {
  if (value === "ACCEPTANCE") return "ACCEPTED";
  if (value === "REJECTION") return "REJECTED";
  return "PENDING";
}

export const get = query({
  args: { tenant: v.string() },
  handler: async (ctx, { tenant }) => {
    const [
      participants,
      judges,
      speakers,
      volunteers,
      checkins,
      submissions,
      feedback,
    ] = await Promise.all([
      ctx.db
        .query("participants")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
      ctx.db
        .query("judges")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
      ctx.db
        .query("speakers")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
      ctx.db
        .query("volunteers")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
      ctx.db
        .query("checkins")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
      ctx.db
        .query("submissions")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
      ctx.db
        .query("feedback")
        .filter((q) => q.eq(q.field("tenant"), tenant))
        .collect(),
    ]);

    return aggregateEventAnalytics({
      participants: participants.map(({ status }) => ({
        status: statusFromApplication(status),
      })),
      judges: judges.map(({ status }) => ({
        status: statusFromApplication(status),
      })),
      speakers: speakers.map(({ status }) => ({
        status: statusFromApplication(status),
      })),
      volunteers: volunteers.map(({ status }) => ({
        status: statusFromApplication(status),
      })),
      checkins: checkins.map(({ userid, role, timestamp }) => ({
        userid,
        role: roleFromCheckin(role),
        timestamp,
      })),
      submissions: submissions.map(({ vetted }) => ({ vetted })),
      feedback: feedback.map(({ rating }) => ({ rating })),
    });
  },
});
