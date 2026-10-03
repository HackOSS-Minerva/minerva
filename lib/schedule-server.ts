import type { CalendarResponse } from "@/types/calendar";
import { getTenant, type TenantSlug } from "@/hooks/get-tenant";
import { AppError } from "@/lib/app-error";

/** Server-side Google Calendar fetch, so dashboards SSR the schedule instead
 * of waterfalling it client-side. Prefers a server-only key but falls back
 * to the (already public) `NEXT_PUBLIC_*` key — zero env changes required;
 * to fully un-expose the key, set `GOOGLE_CALENDAR_API_KEY` server-side. */
export async function fetchScheduleServer(
  tenant: TenantSlug,
): Promise<CalendarResponse> {
  const { config } = getTenant(tenant);
  if (!config) {
    throw new AppError("TENANT_INVALID");
  }

  // Prefer the server-only key; fall back to the public key (already exposed
  // client-side by `useSchedule`) so SSR works with zero env changes.
  const apiKey =
    process.env.GOOGLE_CALENDAR_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY;
  if (!apiKey) {
    throw new AppError("CALENDAR_UNAVAILABLE", {
      details: "Missing GOOGLE_CALENDAR_API_KEY",
    });
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${config.calendarid}/events?key=${apiKey}&singleEvents=true&orderBy=startTime`,
    {
      method: "GET",
      // Calendar changes slowly; revalidate server-side every 5 minutes.
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    throw new AppError("CALENDAR_UNAVAILABLE");
  }

  return response.json() as Promise<CalendarResponse>;
}
