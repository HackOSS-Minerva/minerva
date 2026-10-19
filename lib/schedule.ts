import type { GoogleEvent } from "@/types/calendar";

/** A single entry of a day-grouped event selector. */
export interface ScheduleEventOption {
  value: string;
  label: string;
  group: string;
}

/** Fallback when a calendar event has no explicit time zone (tenants are UCR). */
export const FALLBACK_EVENT_TIME_ZONE = "America/Los_Angeles";
/** Calendar refetch cadence, shared by the server fetch + client query. */
export const SCHEDULE_STALE_MS = 1000 * 60 * 5;
export const SCHEDULE_REVALIDATE_SECONDS = 300;
export const SCHEDULE_RETRY_COUNT = 2;

/** Single builder for the Google Calendar list URL used server + client side. */
export function buildScheduleUrl(calendarId: string, apiKey: string): string {
  return `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&singleEvents=true&orderBy=startTime`;
}

/** Weekday label in the event's own time zone (falls back to Pacific). */
export function getDayOfWeek(dateTime: string, timeZone: string): string {
  return new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: timeZone,
  });
}

/** Group events into `[dayLabel, options]` for grouped `<Select>`, API order kept. */
export function groupEventsByDay(
  events: readonly GoogleEvent[],
): [string, ScheduleEventOption[]][] {
  const groups = new Map<string, ScheduleEventOption[]>();

  for (const event of events) {
    const group = getDayOfWeek(
      event.start.dateTime,
      event.start.timeZone ?? FALLBACK_EVENT_TIME_ZONE,
    );
    const options = groups.get(group) ?? [];
    options.push({ value: event.id, label: event.summary, group });
    groups.set(group, options);
  }

  return Array.from(groups.entries());
}
