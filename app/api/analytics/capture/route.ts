import { AppError, withFetchHandler } from "@/lib/app-error";
import { fetchAuthQuery } from "@/lib/auth-server";
import { capturePostHogEvent } from "@/lib/posthog";
import { captureSchema } from "@/lib/analytics-schema";
import { api } from "@/convex/_generated/api";
import type { AnalyticsRole } from "@/lib/analytics";

export const runtime = "nodejs";

const applicationsByRole = {
  participant: "participants",
  judge: "judges",
  speaker: "speakers",
  superadmin: "superadmins",
  volunteer: "volunteers",
} as const satisfies Record<AnalyticsRole, string>;

export const POST = withFetchHandler("analytics-capture", async (request) => {
  const receivedAt = Date.now();
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new AppError("FORBIDDEN");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new AppError("BAD_REQUEST");
  }
  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) throw new AppError("BAD_REQUEST");

  const { event, properties } = parsed.data;
  const { tenant, entity_id, role } = properties;
  let timestamp = receivedAt;

  if (
    event === "application_created" ||
    event === "submission_created" ||
    event === "checkin_created"
  ) {
    if (event === "application_created" && !role) throw new AppError("BAD_REQUEST");
    const table =
      event === "application_created" && role
        ? applicationsByRole[role]
        : event === "submission_created"
          ? "submissions"
          : "checkins";

    const record = await fetchAuthQuery(api.auth.getAnalyticsCreationTime, {
      tenant,
      id: entity_id,
      table,
      ...(event === "checkin_created" && {
        userId: properties.user_id,
        eventId: properties.event_id,
      }),
    });
    if (!record.authenticated) throw new AppError("UNAUTHORIZED");
    if (record.timestamp === null) throw new AppError("FORBIDDEN");
    timestamp = record.timestamp;
  } else {
    const access = await fetchAuthQuery(api.auth.getAdminAccess, { tenant });
    if (!access.authenticated) throw new AppError("UNAUTHORIZED");
    if (!access.authorized) throw new AppError("FORBIDDEN");
  }

  await capturePostHogEvent(event, properties, new Date(timestamp));
  return new Response(null, { status: 204 });
});
