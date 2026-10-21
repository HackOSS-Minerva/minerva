import { z } from "zod";
import type {
  GoogleEvent,
  IncompleteScheduleEvent,
  MissingScheduleField,
} from "@/types/calendar";

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

/** Weekday label in the event's own time zone (defaults to Pacific if absent). */
export function getDayOfWeek(dateTime?: string, timeZone?: string): string {
  if (!dateTime) return "N/A";
  try {
    // If all-day event, formatting with timeZone="UTC" preserves
    // date without shifting backwards due to local timezone offset.
    const isDateOnly = !dateTime.includes("T");
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: isDateOnly ? "UTC" : timeZone || FALLBACK_EVENT_TIME_ZONE,
    });
  } catch {
    return "N/A";
  }
}

/** Group events into `[dayLabel, options]` for grouped `<Select>`, API order kept. */
export function groupEventsByDay(
  events: readonly GoogleEvent[],
): [string, ScheduleEventOption[]][] {
  const groups = new Map<string, ScheduleEventOption[]>();

  for (const event of events) {
    const dateTime = event.start?.dateTime ?? event.start?.date;
    const group = dateTime
      ? getDayOfWeek(
          dateTime,
          event.start?.timeZone ?? FALLBACK_EVENT_TIME_ZONE,
        )
      : "Unscheduled";
    const options = groups.get(group) ?? [];
    options.push({
      value: event.id,
      label: event.summary?.trim() || "Untitled Event",
      group,
    });
    groups.set(group, options);
  }

  return Array.from(groups.entries());
}

/**
 * Zod schema defining the required completeness criteria for a Google Calendar event.
 * Custom error messages are configured directly in the schema.
 */
const requiredField = (label: string) =>
  z
    .string({
      error: `${label} is required`,
    })
    .trim()
    .min(1, `${label} cannot be blank`);

const isoDateTime = z.string().datetime({
  offset: true,
  message: "Invalid date-time format",
});

const isoDate = z.string().date("Invalid date format");

export const scheduleEventStartSchema = z
  .object({
    dateTime: isoDateTime.optional(),
    date: isoDate.optional(),
    timeZone: z.string().optional(),
  })
  .optional()
  .superRefine((start, ctx) => {
    const hasValidDateTime = Boolean(
      start?.dateTime && isoDateTime.safeParse(start.dateTime).success,
    );
    const hasValidDateOnly = Boolean(
      start?.date && isoDate.safeParse(start.date).success,
    );

    const hasValidSchedule = hasValidDateTime || hasValidDateOnly;

    if (!hasValidSchedule) {
      ctx.addIssue({
        code: "custom",
        message: "Date is required (valid ISO date or date-time)",
        path: ["date"],
      });
      ctx.addIssue({
        code: "custom",
        message: "Time is required (timed or all-day)",
        path: ["time"],
      });
    }
  });

export const scheduleEventSchema = z.object({
  summary: requiredField("Title"),
  description: requiredField("Description"),
  location: requiredField("Location"),
  start: scheduleEventStartSchema,
});

export type ValidatedScheduleEvent = z.infer<typeof scheduleEventSchema>;

/**
 * Validates a Google Calendar event against `scheduleEventSchema`.
 * Returns an array of any missing field names (Title, Description, Date, Time, Location).
 */
export function checkEventCompleteness(
  event: GoogleEvent,
): MissingScheduleField[] {
  const result = scheduleEventSchema.safeParse(event);
  if (result.success) {
    return [];
  }

  const missing = new Set<MissingScheduleField>();

  for (const issue of result.error.issues) {
    const rootField = issue.path[0];
    if (rootField === "summary") missing.add("Title");
    else if (rootField === "description") missing.add("Description");
    else if (rootField === "location") missing.add("Location");
    else if (rootField === "start") {
      const startField = issue.path[1];
      if (startField === "date") missing.add("Date");
      if (startField === "time") missing.add("Time");
    }
  }

  const orderedFields: MissingScheduleField[] = [
    "Title",
    "Description",
    "Date",
    "Time",
    "Location",
  ];

  return orderedFields.filter((field) => missing.has(field));
}

export function getIncompleteScheduleEvents(
  events: readonly GoogleEvent[],
): IncompleteScheduleEvent[] {
  const incomplete: IncompleteScheduleEvent[] = [];

  for (const event of events) {
    const missingFields = checkEventCompleteness(event);
    if (missingFields.length > 0) {
      incomplete.push({
        event,
        id: event.id,
        title: event.summary?.trim() || "(Untitled Event)",
        missingFields,
      });
    }
  }

  return incomplete;
}
